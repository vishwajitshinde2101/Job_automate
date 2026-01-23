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

export default router;
