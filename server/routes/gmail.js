import express from 'express';
import { google } from 'googleapis';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Gmail OAuth2 Configuration
// TODO: Add these to your .env file:
// GMAIL_CLIENT_ID=your_google_client_id
// GMAIL_CLIENT_SECRET=your_google_client_secret
// GMAIL_REDIRECT_URI=http://localhost:3000/gmail/callback

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI || 'http://localhost:3000/gmail/callback'
);

// Store tokens temporarily (in production, use database)
const userTokens = new Map();

/**
 * GET /api/gmail/status
 * Check if user has connected Gmail
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const hasToken = userTokens.has(userId);

    res.json({
      success: true,
      connected: hasToken,
    });
  } catch (error) {
    console.error('[Gmail Status] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check Gmail status',
    });
  }
});

/**
 * GET /api/gmail/auth-url
 * Get Google OAuth2 authorization URL
 */
router.get('/auth-url', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.modify',
      ],
      state: userId, // Pass user ID in state
    });

    res.json({
      success: true,
      url: authUrl,
    });
  } catch (error) {
    console.error('[Gmail Auth URL] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate auth URL',
    });
  }
});

/**
 * GET /api/gmail/callback
 * Handle OAuth2 callback from Google
 */
router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    const userId = state;

    if (!code) {
      throw new Error('No authorization code provided');
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Store tokens for user
    userTokens.set(userId, tokens);

    // Send success message to parent window
    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ type: 'gmail-auth-success' }, '*');
            window.close();
          </script>
          <p>Gmail connected successfully! You can close this window.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('[Gmail Callback] Error:', error);
    res.status(500).send('Failed to connect Gmail. Please try again.');
  }
});

/**
 * GET /api/gmail/emails
 * Fetch user's emails from Gmail
 */
router.get('/emails', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { filter = 'all', search = '', maxResults = 50 } = req.query;

    const tokens = userTokens.get(userId);
    if (!tokens) {
      return res.status(401).json({
        success: false,
        error: 'Gmail not connected. Please connect your Gmail account first.',
      });
    }

    oauth2Client.setCredentials(tokens);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Build query
    let query = '';
    if (filter === 'unread') query = 'is:unread';
    if (filter === 'starred') query = 'is:starred';
    if (search) query += ` ${search}`;

    // Fetch email list
    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults: parseInt(maxResults),
      q: query || undefined,
    });

    const messages = listResponse.data.messages || [];

    // Fetch details for each message
    const emailPromises = messages.map(async (message) => {
      const emailData = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'metadata',
        metadataHeaders: ['From', 'Subject', 'Date'],
      });

      const headers = emailData.data.payload.headers;
      const from = headers.find((h) => h.name === 'From')?.value || '';
      const subject = headers.find((h) => h.name === 'Subject')?.value || '';
      const date = headers.find((h) => h.name === 'Date')?.value || '';

      return {
        id: message.id,
        from,
        subject,
        snippet: emailData.data.snippet,
        date: new Date(date).toLocaleString(),
        read: !emailData.data.labelIds?.includes('UNREAD'),
        starred: emailData.data.labelIds?.includes('STARRED') || false,
        labels: emailData.data.labelIds || [],
      };
    });

    const emails = await Promise.all(emailPromises);

    res.json({
      success: true,
      emails,
    });
  } catch (error) {
    console.error('[Gmail Fetch Emails] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch emails',
    });
  }
});

/**
 * GET /api/gmail/email/:id
 * Get full email details
 */
router.get('/email/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const tokens = userTokens.get(userId);
    if (!tokens) {
      return res.status(401).json({
        success: false,
        error: 'Gmail not connected',
      });
    }

    oauth2Client.setCredentials(tokens);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const emailData = await gmail.users.messages.get({
      userId: 'me',
      id,
      format: 'full',
    });

    const headers = emailData.data.payload.headers;
    const from = headers.find((h) => h.name === 'From')?.value || '';
    const to = headers.find((h) => h.name === 'To')?.value || '';
    const subject = headers.find((h) => h.name === 'Subject')?.value || '';
    const date = headers.find((h) => h.name === 'Date')?.value || '';

    // Extract body
    let body = '';
    if (emailData.data.payload.parts) {
      const textPart = emailData.data.payload.parts.find(
        (part) => part.mimeType === 'text/plain' || part.mimeType === 'text/html'
      );
      if (textPart && textPart.body.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString();
      }
    } else if (emailData.data.payload.body.data) {
      body = Buffer.from(emailData.data.payload.body.data, 'base64').toString();
    }

    // Get attachments
    const attachments = emailData.data.payload.parts
      ? emailData.data.payload.parts
          .filter((part) => part.filename)
          .map((part) => part.filename)
      : [];

    // Mark as read
    await gmail.users.messages.modify({
      userId: 'me',
      id,
      requestBody: {
        removeLabelIds: ['UNREAD'],
      },
    });

    res.json({
      success: true,
      email: {
        id,
        from,
        to,
        subject,
        body,
        date: new Date(date).toLocaleString(),
        attachments,
      },
    });
  } catch (error) {
    console.error('[Gmail Get Email] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load email',
    });
  }
});

/**
 * POST /api/gmail/send
 * Send an email via Gmail
 */
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { to, subject, body } = req.body;

    if (!to || !subject) {
      return res.status(400).json({
        success: false,
        error: 'Recipient and subject are required',
      });
    }

    const tokens = userTokens.get(userId);
    if (!tokens) {
      return res.status(401).json({
        success: false,
        error: 'Gmail not connected',
      });
    }

    oauth2Client.setCredentials(tokens);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Create email message
    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      '',
      body || '',
    ].join('\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    res.json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('[Gmail Send Email] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send email',
    });
  }
});

/**
 * POST /api/gmail/disconnect
 * Disconnect Gmail account
 */
router.post('/disconnect', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    userTokens.delete(userId);

    res.json({
      success: true,
      message: 'Gmail disconnected successfully',
    });
  } catch (error) {
    console.error('[Gmail Disconnect] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to disconnect Gmail',
    });
  }
});

export default router;
