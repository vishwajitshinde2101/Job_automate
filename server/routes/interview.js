import express from 'express';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Store interview sessions (in production, use database)
const sessions = new Map();

/**
 * POST /api/interview/start
 * Start a new mock interview session
 */
router.post('/start', authenticateToken, async (req, res) => {
  try {
    const { mode, type, position, experienceLevel, duration, skills } = req.body;

    if (!position || !skills) {
      return res.status(400).json({
        success: false,
        error: 'Position and skills are required',
      });
    }

    const sessionId = uuidv4();

    // Create interview context
    const context = `You are a professional interviewer conducting a mock interview simulation.

INTERVIEW CONTEXT:
- Interview Mode: ${mode === 'telephonic' ? 'Telephonic (short & crisp)' : 'Direct/Onsite (deep & scenario-based)'}
- Interview Type: ${type.toUpperCase()}
- Position: ${position}
- Experience Level: ${experienceLevel}
- Interview Duration: ${duration} minutes
- User Skills/Experience: ${skills}

YOUR TASK:
1. Conduct a realistic mock interview based on this context
2. Ask questions one by one, appropriate to:
   - Interview Type (${type === 'hr' ? 'HR - focus on communication, behavior, attitude' : 'Technical - focus on concepts, problem-solving'})
   - Interview Mode (${mode === 'telephonic' ? 'Keep questions brief' : 'Ask detailed scenario-based questions'})
   - Position and experience level
3. Questions should increase slightly in difficulty
4. ${type === 'technical' ? 'Focus on technical concepts and problem-solving' : 'Focus on soft skills and behavioral aspects'}
5. Base follow-up questions only on user answers

RULES:
- Do NOT give hints or answers during interview
- Keep questions realistic
- No feedback until interview ends
- One question at a time`;

    // Generate greeting and first question
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: context,
        },
        {
          role: 'user',
          content: 'Start the interview with a brief greeting (1 line) and ask the first question.',
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const response = completion.choices[0]?.message?.content || '';
    const [greeting, ...questionParts] = response.split('\n').filter((line) => line.trim());
    const firstQuestion = questionParts.join('\n').trim();

    // Store session
    sessions.set(sessionId, {
      userId: req.user.id,
      setup: { mode, type, position, experienceLevel, duration, skills },
      context,
      messages: [
        { role: 'system', content: context },
        { role: 'assistant', content: response },
      ],
      transcript: [],
      startTime: new Date(),
      questionCount: 1,
    });

    res.json({
      success: true,
      sessionId,
      greeting: greeting || 'Hello! Let\'s begin your mock interview.',
      firstQuestion: firstQuestion || 'Tell me about yourself and your experience.',
    });
  } catch (error) {
    console.error('[Interview Start] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start interview',
    });
  }
});

/**
 * POST /api/interview/answer
 * Submit answer and get next question
 */
router.post('/answer', authenticateToken, async (req, res) => {
  try {
    const { sessionId, answer } = req.body;

    if (!sessionId || !answer) {
      return res.status(400).json({
        success: false,
        error: 'Session ID and answer are required',
      });
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Interview session not found',
      });
    }

    // Add user answer to messages
    session.messages.push({
      role: 'user',
      content: answer,
    });

    // Store in transcript
    const lastQuestion = session.messages
      .filter((m) => m.role === 'assistant')
      .pop()?.content || '';
    session.transcript.push({
      question: lastQuestion,
      answer,
    });

    session.questionCount++;

    // Calculate max questions based on duration
    const maxQuestions = Math.floor(session.setup.duration / 2); // ~2 mins per question

    // Check if interview should end
    if (session.questionCount >= maxQuestions) {
      return res.json({
        success: true,
        completed: true,
      });
    }

    // Generate next question
    session.messages.push({
      role: 'user',
      content: 'Acknowledge my answer briefly and ask the next relevant question based on my response and the interview context.',
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: session.messages,
      temperature: 0.7,
      max_tokens: 300,
    });

    const nextQuestion = completion.choices[0]?.message?.content || 'Thank you for your answer.';

    session.messages.push({
      role: 'assistant',
      content: nextQuestion,
    });

    res.json({
      success: true,
      nextQuestion,
      completed: false,
    });
  } catch (error) {
    console.error('[Interview Answer] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process answer',
    });
  }
});

/**
 * POST /api/interview/end
 * End interview and generate summary
 */
router.post('/end', authenticateToken, async (req, res) => {
  try {
    const { sessionId, startTime } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required',
      });
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Interview session not found',
      });
    }

    // Calculate duration
    const start = new Date(startTime);
    const end = new Date();
    const durationMs = end - start;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    const timeTaken = `${minutes}m ${seconds}s`;

    // Generate summary using OpenAI
    const transcriptText = session.transcript
      .map((t, i) => `Q${i + 1}: ${t.question}\nA${i + 1}: ${t.answer}`)
      .join('\n\n');

    const summaryPrompt = `You are evaluating a mock interview. Analyze the following interview and provide detailed feedback.

INTERVIEW DETAILS:
- Type: ${session.setup.type.toUpperCase()}
- Mode: ${session.setup.mode}
- Position: ${session.setup.position}
- Experience: ${session.setup.experienceLevel}

TRANSCRIPT:
${transcriptText}

EVALUATION TASK:
Provide a comprehensive evaluation in JSON format with:
1. Scores (0-10) for: communication, technical knowledge (or HR skills if HR interview), confidence, overall
2. 3-5 strong points (what they did well)
3. 3-5 weak areas (what needs improvement)
4. 5-7 actionable improvement suggestions (specific, clear steps)

Consider:
- Clarity and structure of answers
- Depth of knowledge ${session.setup.type === 'technical' ? '(technical accuracy)' : '(behavioral responses)'}
- Communication skills
- Confidence level
- Relevance to questions

OUTPUT FORMAT - Return ONLY valid JSON:
{
  "scores": {
    "communication": <number 0-10>,
    "technicalKnowledge": <number 0-10>,
    "confidence": <number 0-10>,
    "overall": <number 0-10>
  },
  "strongPoints": ["point 1", "point 2", "point 3"],
  "weakAreas": ["area 1", "area 2", "area 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert interview evaluator. Provide honest, constructive feedback in JSON format only.',
        },
        {
          role: 'user',
          content: summaryPrompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 1500,
    });

    const responseText = completion.choices[0]?.message?.content;

    // Parse JSON response
    let evaluation;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        evaluation = JSON.parse(jsonMatch[0]);
      } else {
        evaluation = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('Failed to parse evaluation:', responseText);
      throw new Error('Invalid evaluation format');
    }

    // Build summary
    const summary = {
      type: session.setup.type.toUpperCase(),
      mode: session.setup.mode.charAt(0).toUpperCase() + session.setup.mode.slice(1),
      position: session.setup.position,
      totalQuestions: session.questionCount - 1,
      questionsAnswered: session.transcript.length,
      timeTaken,
      scores: evaluation.scores,
      strongPoints: evaluation.strongPoints,
      weakAreas: evaluation.weakAreas,
      improvements: evaluation.improvements,
      transcript: session.transcript,
    };

    // Clean up session
    sessions.delete(sessionId);

    res.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error('[Interview End] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate interview summary',
    });
  }
});

/**
 * POST /api/interview/generate-qa
 * Generate interview questions with answers
 */
router.post('/generate-qa', authenticateToken, async (req, res) => {
  try {
    const { topic, position, interviewType, experienceLevel, difficulty, numberOfQuestions } = req.body;

    if (!topic || !position) {
      return res.status(400).json({
        success: false,
        error: 'Topic and position are required',
      });
    }

    // Build context-aware prompt
    const prompt = `You are an expert interviewer preparing interview questions with detailed answers.

CONTEXT:
- Topic/Technology: ${topic}
- Position/Role: ${position}
- Interview Type: ${interviewType.toUpperCase()}
- Experience Level: ${experienceLevel}
- Difficulty: ${difficulty}
- Number of Questions: ${numberOfQuestions}

YOUR TASK:
Generate ${numberOfQuestions} ${difficulty} level ${interviewType} interview questions about ${topic} for a ${position} role with ${experienceLevel} years of experience.

REQUIREMENTS:
1. Questions should be realistic and relevant to the role
2. ${interviewType === 'technical' ? 'Focus on technical concepts, problem-solving, and practical scenarios' : 'Focus on behavioral aspects, communication skills, and soft skills'}
3. Difficulty should match ${difficulty} level
4. Each question should have a clear, comprehensive answer
5. Answers should be detailed but concise (2-4 paragraphs)
6. Include examples or scenarios where appropriate
7. Questions should increase slightly in complexity

OUTPUT FORMAT - Return ONLY valid JSON array:
[
  {
    "question": "Question text here",
    "answer": "Detailed answer here"
  }
]

Generate the questions and answers now.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert interview coach. Generate interview questions with detailed, accurate answers in JSON format only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const responseText = completion.choices[0]?.message?.content;

    // Parse JSON response
    let questions;
    try {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        questions = JSON.parse(responseText);
      }

      // Validate structure
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid questions format');
      }

      // Ensure each question has required fields
      questions = questions.map((q) => ({
        question: q.question || '',
        answer: q.answer || '',
      }));
    } catch (parseError) {
      console.error('Failed to parse questions:', responseText);
      throw new Error('Invalid response format from AI');
    }

    res.json({
      success: true,
      questions,
    });
  } catch (error) {
    console.error('[Interview Generate Q&A] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate questions',
    });
  }
});

export default router;
