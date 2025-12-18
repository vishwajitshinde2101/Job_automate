/**
 * ======================== AI ANSWER MODULE (WITH DATABASE) ========================
 * Handles interview question answering using OpenAI + MySQL database.
 * Fetches user data dynamically from DB instead of hardcoding values.
 * Production-ready with proper error handling.
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Store resume text and user data for current session
let resumeText = '';
let userAnswersData = null;

/**
 * Initialize resume text from file or default resume
 * @param {string} fileText - Optional resume text from uploaded file
 */
export function initializeResume(fileText) {
    if (fileText) {
        resumeText = fileText;
        console.log('📄 Resume initialized from uploaded file');
    } else {
        // Default resume (can be replaced with user's actual resume)
        resumeText = `
Pawar Pravin
pravin.pawar2726@gmail.com | 9529633527 | .NET Developer | Pune

Professional Summary
Experienced and dedicated .NET Developer with over 3+ years of expertise in designing, developing, and
maintaining web and desktop applications using .NET Framework, C#, ASP.NET, MVC, and .NET Core.
Skilled in the full software development lifecycle (SDLC), including requirement analysis, design,
implementation, testing, and deployment. Proficient in SQL Server, Entity Framework, and RESTful APIs to
deliver efficient, scalable, and high performance applications. Strong problem-solving abilities and a
collaborative team player, adept at Agile development.

Technical Skills
• Programming Languages: C#, VB.NET, JavaScript, HTML5, CSS3
• Frameworks & Libraries: .NET Framework, .NET Core, ASP.NET MVC, Entity Framework, LINQ, Web API
• Databases: SQL Server, MySQL, SQLite, Entity Framework ORM
• Front-End Technologies: Angular, jQuery, Bootstrap
• Tools & IDEs: Visual Studio, Visual Studio Code, Git, TFS, Postman
• Web Services & APIs: RESTful API development and integration, SOAP
• Version Control: Git, GitHub, Bitbucket
• Other Skills: Agile/Scrum methodology, Unit Testing, Logging & Exception Handling, Debugging & Performance Optimization

Professional Experience
YOUNGELEMENT INDIA PRIVATE LIMITED — .NET Developer
DEC 2022 – Present | Pune

Health Insurance Management System
• Technologies: C#, ASP.NET MVC/Core, SQL Server, HTML, CSS, JavaScript, Bootstrap, jQuery
• Description: Web-based application to manage health insurance policies, claims, and customer data
• Improved modules for policy management, customer registration, and claims processing
• Planned database schemas, queries, and stored procedures in SQL Server

Vendor Data Management System
• Technologies: C#, ASP.NET MVC/Core, SQL Server, HTML, CSS, JavaScript, Bootstrap, jQuery
• Developed modules for vendor registration, contract management, and transaction tracking
• Designed and optimized database schemas in SQL Server

Education
B.Sc. in Computer Science, Solapur University, 2023
    `;
        console.log('📄 Using default resume');
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
 * Generate answer for interview question using OpenAI + Database
 * Fetches dynamic data from user's database profile
 * @param {string} question - Interview question
 * @returns {Promise<string>} AI-generated answer
 */
export async function getAnswer(question) {
    try {
        // Get data from database if available, else use defaults
        const name = userAnswersData?.name || 'User';
        const currentCTC = userAnswersData?.currentCTC || 'Not specified';
        const expectedCTC = userAnswersData?.expectedCTC || 'Not specified';
        const noticePeriod = userAnswersData?.noticePeriod || 'Immediate';
        const location = userAnswersData?.location || 'Bangalore';
        const yearsOfExperience = userAnswersData?.yearsOfExperience || '3';
        const naukriEmail = userAnswersData?.naukriEmail || '';

        // Predefined answers for common questions (using dynamic DB values)
        const commonAnswers = {
            experience: () => `${yearsOfExperience} years`,
            notice: () => noticePeriod,
            noticePeriod: () => noticePeriod,
            name: () => name,
            fullname: () => name,
            location: () => location,
            city: () => location,
            state: () => 'Not specified',
            country: () => 'India',
            currentSalary: () => currentCTC,
            salary: () => currentCTC,
            currentctc: () => currentCTC,
            expectedSalary: () => expectedCTC,
            expectedctc: () => expectedCTC,
            faceToFace: () => 'Not available for face-to-face interviews at the moment',
            interviewMode: () => 'Online preferred',
            availability: () => 'Available immediately',
            email: () => naukriEmail,
            phone: () => 'Available upon request',
        };

        // Check for common questions (case-insensitive)
        const lowerQuestion = question.toLowerCase();
        for (const [key, answerFn] of Object.entries(commonAnswers)) {
            if (lowerQuestion.includes(key)) {
                const answer = answerFn();
                console.log(`✓ Question: "${question}" → "${answer}" (from DB)`);
                return answer;
            }
        }

        // For complex questions, use OpenAI
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY not configured. Set it in .env file');
        }

        const client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const prompt = `You are an expert interview assistant. Answer this question ONLY using the resume provided below.
Keep the answer concise, professional, and specific to the resume content.

Resume:
\`\`\`
${resumeText}
\`\`\`

Question: ${question}

Provide ONLY the answer, no explanations.`;

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

        const answer = response.content[0].type === 'text' ? response.content[0].text : 'Unable to generate answer';
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
