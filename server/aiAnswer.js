/**
 * ======================== AI ANSWER MODULE (WITH DATABASE) ========================
 * Handles interview question answering using OpenAI + MySQL database.
 * Fetches user data dynamically from DB instead of hardcoding values.
 * Includes intelligent skill-based question handling.
 * Production-ready with proper error handling.
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

// Store resume text, user data, and skills for current session
let resumeText = '';
let userAnswersData = null;
let skillsData = [];

/**
 * Initialize resume text from file or default resume
 * @param {string} fileText - Optional resume text from uploaded file
 */
export function initializeResume(fileText) {
    if (fileText) {
        resumeText = fileText;
        console.log('📄 Resume initialized from uploaded file');
    } else {
        // No default resume - must be provided by user
        resumeText = '';
        console.log('⚠️  No resume provided - answers will be limited to skill data and common questions');
    }
}

/**
 * Set user answers data from database
 * @param {object} data - User data from database (name, ctc, location, etc.)
 */
export function setUserAnswersData(data) {
    userAnswersData = data;
    console.log('✅ User answers data loaded from database');
}

// Export alias for backward compatibility
export const setUserData = setUserAnswersData;

/**
 * Initialize skills from database for a specific user
 * @param {string} userId - User ID
 * @param {object} dbConfig - Database configuration
 */
export async function initializeSkillsFromDB(userId, dbConfig) {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            "SELECT skill_name, display_name, rating, out_of, experience FROM skills WHERE user_id = ?",
            [userId]
        );
        skillsData = rows;
        await connection.end();
        console.log(`✅ Loaded ${rows.length} skills from database for user ${userId}`);
    } catch (err) {
        console.error("❌ Error loading skills from DB:", err.message);
        skillsData = [];
    }
}

/**
 * Detect if question is skill-related and find matching skill
 * @param {string} question - Interview question
 * @returns {object|null} Matching skill or null
 */
function findMatchingSkill(question) {
    if (!question || skillsData.length === 0) return null;

    const normalizedQuestion = question.toLowerCase();

    // Try to find exact or partial match with skill_name or display_name
    for (const skill of skillsData) {
        const skillName = (skill.skill_name || '').toLowerCase();
        const displayName = (skill.display_name || '').toLowerCase();

        if (normalizedQuestion.includes(skillName) || normalizedQuestion.includes(displayName)) {
            return skill;
        }
    }

    return null;
}

/**
 * Generate answer for skill-related questions
 * @param {string} question - Interview question
 * @param {object} skill - Skill data from database
 * @returns {string} Answer
 */
function generateSkillAnswer(question, skill) {
    const normalizedQuestion = question.toLowerCase();
    const skillName = skill.display_name || skill.skill_name;

    // Experience-related questions
    if (normalizedQuestion.includes('experience') || normalizedQuestion.includes('worked') ||
        normalizedQuestion.includes('using') || normalizedQuestion.includes('years')) {
        if (skill.experience) {
            return `${skill.experience} experience with ${skillName}`;
        }
        return `Around 3 years of experience with ${skillName}`;
    }

    // Rating/Proficiency questions
    if (normalizedQuestion.includes('rate') || normalizedQuestion.includes('rating') ||
        normalizedQuestion.includes('proficient') || normalizedQuestion.includes('good') ||
        normalizedQuestion.includes('scale') || normalizedQuestion.includes('expertise')) {
        if (skill.rating && skill.out_of) {
            return `I would rate myself ${skill.rating} out of ${skill.out_of} in ${skillName}`;
        } else if (skill.rating) {
            return `I would rate myself ${skill.rating}/10 in ${skillName}`;
        }
        return `I have good working knowledge of ${skillName} and continuously improving`;
    }

    // General skill questions
    if (skill.experience) {
        return `I have ${skill.experience} experience working with ${skillName}`;
    }

    // Skill exists but no detailed data
    return `I have basic working knowledge of ${skillName} and I am actively improving it`;
}

/**
 * Extract years of experience from resume
 * @param {string} text - Resume text
 * @returns {string|null} Years of experience
 */
function extractExperience(text) {
    const regex = /(\d+)\+?\s+years?/i;
    const match = text.match(regex);
    return match ? match[1] : null;
}

/**
 * Format date from YYYY-MM-DD to DD/MM/YYYY
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Date in DD/MM/YYYY format
 */
function formatDateToDDMMYYYY(dateString) {
    if (!dateString) return null;
    try {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (error) {
        return null;
    }
}

/**
 * Generate answer for interview question using OpenAI + Database
 * Fetches dynamic data from user's database profile
 * @param {string} question - Interview question
 * @returns {Promise<string>} AI-generated answer
 */
export async function getAnswer(question) {
    try {


        // ✅ Validate question first
        if (!isValidInterviewQuestion(question)) {
            console.log(`⚠️ Ignored non-interview question: "${question}"`);
            return ''; // Empty answer, or you can return a polite message like:
            // return 'This does not seem like a valid interview question.';
        }

        // STEP 1: Check if question is skill-related
        const matchingSkill = findMatchingSkill(question);
        if (matchingSkill) {
            const skillAnswer = generateSkillAnswer(question, matchingSkill);
            console.log(`✓ Question: "${question}" → "${skillAnswer}" (from skills DB)`);
            return skillAnswer;
        }

        // STEP 2: Get data from database if available, else use defaults
        // STEP 2: Get data from database (NO DEFAULTS)
        const name = userAnswersData?.name;
        const currentCTC = userAnswersData?.currentCTC;
        const expectedCTC = userAnswersData?.expectedCTC;
        const noticePeriod = userAnswersData?.noticePeriod;
        const location = userAnswersData?.location;
        const yearsOfExperience = userAnswersData?.yearsOfExperience;
        const naukriEmail = userAnswersData?.naukriEmail;
        const dob = userAnswersData?.dob;

        // STEP 2.5: Check for city residence questions (e.g., "Are you currently residing in Pune?")
        const residingPattern = /(?:residing|living|staying|located|reside|live|stay)\s+(?:in|at)\s+([a-zA-Z\s]+?)(?:\?|$)/i;
        const residingMatch = question.match(residingPattern);

        if (residingMatch) {
            const askedCity = residingMatch[1].trim().toLowerCase();
            if (!location || location.trim() === '') {
                return ''; // No location data available
            }
            const storedLocation = location.toLowerCase();
            // Check if stored location contains the asked city
            if (storedLocation.includes(askedCity) || askedCity.includes(storedLocation)) {
                console.log(`✓ Question: "${question}" → "Yes" (city match)`);
                return 'Yes';
            } else {
                console.log(`✓ Question: "${question}" → "No" (city mismatch)`);
                return 'No';
            }
        }

        // STEP 3: Predefined answers for common questions (using dynamic DB values)
        const commonAnswers = {

            // Personal
            name: () => name,
            fullname: () => name,
            email: () => naukriEmail,
            phone: () => 'Will be shared during interview',

            // Date of Birth
            dob: () => dob ? formatDateToDDMMYYYY(dob) : null,
            dateofbirth: () => dob ? formatDateToDDMMYYYY(dob) : null,
            birthdate: () => dob ? formatDateToDDMMYYYY(dob) : null,
            birthday: () => dob ? formatDateToDDMMYYYY(dob) : null,
            age: () => {
                if (!dob) return null;
                const birthDate = new Date(dob);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                return `${age} years`;
            },

            // Experience
            experience: () => `${yearsOfExperience} years`,
            totalExperience: () => `${yearsOfExperience} years`,

            // Location
            location: () => location ? `${location}, India` : '',
            city: () => location || '',
            state: () => 'Maharashtra',
            country: () => 'India',

            // Notice Period
            notice: () => noticePeriod,
            noticePeriod: () => noticePeriod,

            availability: () => {
                if (!noticePeriod) return '';
                return noticePeriod.toLowerCase().includes('immediate')
                    ? 'Immediate'
                    : noticePeriod;
            },

            // Salary
            currentSalary: () => currentCTC ? `${currentCTC} LPA` : '',
            salary: () => currentCTC ? `${currentCTC} LPA` : '',
            currentctc: () => currentCTC ? `${currentCTC} LPA` : '',

            expectedSalary: () => expectedCTC ? `${expectedCTC} LPA` : '',
            expectedctc: () => expectedCTC ? `${expectedCTC} LPA` : '',

            // Interview
            faceToFace: () => userAnswersData?.availability || 'Not available currently',
            interviewMode: () => 'Online',

            // Default fallback
            default: () => '',
        };


        // const commonAnswers = {
        //     experience: () => `${yearsOfExperience} years`,
        //     notice: () => noticePeriod,
        //     noticePeriod: () => noticePeriod,
        //     name: () => name,
        //     fullname: () => name,
        //     location: () => location,
        //     city: () => location,
        //     state: () => 'Not specified',
        //     country: () => 'India',
        //     currentSalary: () => currentCTC,
        //     salary: () => currentCTC,
        //     currentctc: () => currentCTC,
        //     expectedSalary: () => expectedCTC,
        //     expectedctc: () => expectedCTC,
        //     faceToFace: () => 'Not available for face-to-face interviews at the moment',
        //     interviewMode: () => 'Online preferred',
        //     availability: () => 'Available immediately',
        //     email: () => naukriEmail,
        //     phone: () => 'Available upon request',
        // };

        // Check for common questions (case-insensitive)
        const lowerQuestion = question.toLowerCase();
        for (const [key, answerFn] of Object.entries(commonAnswers)) {
            if (lowerQuestion.includes(key)) {
                const answer = answerFn();
                console.log(`✓ Question: "${question}" → "${answer}" (from DB)`);
                return answer;
            }
        }

        // For complex questions, use OpenAI only if resume is available
        if (!resumeText || resumeText.trim() === '') {
            // No resume available - cannot answer complex questions
            console.log(`⚠️  Question: "${question}" → No resume available`);
            return 'I would need to review my documentation to answer that accurately.';
        }

        if (!process.env.OPENAI_API_KEY) {
            console.log(`⚠️  Question: "${question}" → No OpenAI API key configured`);
            return 'I would need to review my documentation to answer that accurately.';
        }

        const client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const prompt = `
You are an expert interview assistant. Answer the question ONLY using the resume provided below.
Keep the answer concise, professional, and specific to the resume content.
Do NOT invent or assume any information not present in the resume.

Resume:
\`\`\`
${resumeText}
\`\`\`

Question: ${question}

Provide ONLY the answer, no explanations.
`;

        const response = await client.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 150,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
        });

        const answer = response.content[0].type === 'text' ? response.content[0].text : 'I would need to review my documentation to answer that accurately.';
        console.log(`🤖 Question: "${question}" → "${answer}" (from OpenAI)`);
        return answer;
    } catch (error) {
        console.error('❌ Error in getAnswer:', error.message);
        return 'I prefer not to answer this question at the moment.';
    }
}

/**
 * Get resume text for display
 * @returns {string} Resume text
 */
export function getResumeText() {
    return resumeText;
}

function isValidInterviewQuestion(question) {
    if (!question || question.trim() === '') return false;

    // Ignore greetings or generic messages
    const greetings = [
        'hi', 'hello', 'thank you', 'kindly answer', 'please answer', 'showing interest'
    ];

    const lowerQ = question.toLowerCase();
    for (const greet of greetings) {
        if (lowerQ.includes(greet)) {
            return false; // It's a greeting or non-question
        }
    }

    // Check if question ends with '?'
    if (!question.trim().endsWith('?')) {
        return false; // Not a proper question
    }

    return true; // Valid question
}
