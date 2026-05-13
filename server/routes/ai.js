import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/ai/career-analysis
 * Analyze user's career profile and provide personalized guidance
 */
router.post('/career-analysis', async (req, res) => {
  try {
    const { currentRole, experience, skills, education, targetRole, additionalInfo } = req.body;

    // Validate required fields
    if (!currentRole || !skills || !targetRole) {
      return res.status(400).json({
        success: false,
        error: 'Current role, skills, and target role are required',
      });
    }

    // Build the prompt for OpenAI
    const prompt = `You are a professional career coach AI assistant. Analyze the following user profile and provide a comprehensive career analysis.

USER PROFILE:
- Current Role: ${currentRole}
- Experience: ${experience || 'Not specified'}
- Current Skills: ${skills}
- Education: ${education || 'Not specified'}
- Target Role/Career Goal: ${targetRole}
${additionalInfo ? `- Additional Context: ${additionalInfo}` : ''}

TASK:
Provide a detailed career analysis with the following structure:
1. Identify their STRENGTHS based on current skills and experience
2. Identify SKILL GAPS they need to fill to reach their target role
3. Provide specific UPSKILLING RECOMMENDATIONS (courses, certifications, learning resources)
4. Suggest 3-5 SUITABLE ROLES they can target based on their current skillset
5. Create a step-by-step CAREER ROADMAP (5-7 actionable steps) to reach their goal

RULES:
- Be specific and actionable
- Tailor advice to their experience level
- Suggest real courses and certifications
- Keep it professional and encouraging
- Focus on practical next steps

OUTPUT FORMAT - Return ONLY valid JSON in this exact format:
{
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "skillGaps": ["gap 1", "gap 2", "gap 3"],
  "upskillingRecommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "suggestedRoles": ["role 1", "role 2", "role 3"],
  "careerRoadmap": [
    {"step": 1, "action": "action description"},
    {"step": 2, "action": "action description"},
    {"step": 3, "action": "action description"}
  ]
}`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a professional career coach. Provide career analysis in JSON format only. Be specific, actionable, and encouraging.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response
    let analysis;
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        analysis = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      throw new Error('Invalid response format from AI');
    }

    res.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error('[AI Career Analysis] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze career profile',
    });
  }
});

/**
 * POST /api/ai/chat
 * Conversational AI Career Coach endpoint — ChatGPT-style multi-turn chat
 */
router.post('/chat', async (req, res) => {
  try {
    const { messages, userName, userConfig } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, error: 'messages array is required' });
    }

    // Build personalised system prompt
    const profileLines = [];
    if (userName) profileLines.push(`The user's name is ${userName}.`);
    if (userConfig?.targetRole) profileLines.push(`Their target role is: ${userConfig.targetRole}.`);
    if (userConfig?.experience) profileLines.push(`Years of experience: ${userConfig.experience}.`);
    if (userConfig?.location) profileLines.push(`Location: ${userConfig.location}.`);

    const profileContext = profileLines.length > 0
      ? `\n\nUser context:\n${profileLines.join('\n')}`
      : '';

    const systemPrompt = `You are "Career AI", an expert and friendly AI Career Coach specialising in technology careers in India. You provide personalised, practical, and genuinely encouraging career guidance.

Your areas of expertise:
- Career path planning and role transitions (software engineering, data science, product management, UI/UX, DevOps, cloud, etc.)
- Skill gap analysis with personalised learning roadmaps
- Resume and LinkedIn profile optimisation
- Technical and behavioural interview preparation
- Salary benchmarking and negotiation strategies
- Job search strategies and networking
- Course and certification recommendations (Udemy, Coursera, LinkedIn Learning, Google, AWS, Microsoft, official docs)
- Industry trends and in-demand technologies (2024–2025)

Communication style:
- Conversational, warm, motivating — like a mentor who genuinely cares
- Give specific, actionable advice — not vague generalities
- Structure longer responses clearly with bullet points or numbered steps
- Ask a clarifying question when you need more context before giving advice
- Celebrate wins and keep the user motivated
- Be honest about realistic timelines and challenges
- Use **bold** for key terms and important points
- Keep responses focused and not overly long${profileContext}`;

    // Validate and sanitise message roles
    const chatMessages = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, content: String(m.content) }));

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...chatMessages,
      ],
      temperature: 0.75,
      max_tokens: 1200,
    });

    const reply = completion.choices[0]?.message?.content;

    if (!reply) throw new Error('No reply from AI');

    res.json({ success: true, reply });
  } catch (error) {
    console.error('[AI Chat] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get AI response',
    });
  }
});

export default router;
