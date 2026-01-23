import React, { useState } from 'react';
import {
  FileUser,
  Download,
  CheckCircle,
  Plus,
  Trash2,
  Loader2,
  Eye,
  FileText,
  Sparkles,
  Code,
  Database,
  Briefcase,
  Palette,
} from 'lucide-react';
import jsPDF from 'jspdf';

interface Experience {
  company: string;
  role: string;
  duration: string;
  responsibilities: string;
}

interface Project {
  name: string;
  description: string;
  technologies: string;
}

interface Education {
  degree: string;
  institute: string;
  year: string;
  gpa?: string;
}

interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  professionalSummary: string;
  technicalSkills: string;
  softSkills: string;
  experiences: Experience[];
  projects: Project[];
  educations: Education[];
  certifications: string;
  jobDescription: string;
}

interface ATSScore {
  total: number;
  keywordsMatch: number;
  skillsAlignment: number;
  experienceAlignment: number;
  formatting: number;
}

interface Template {
  id: string;
  name: string;
  icon: any;
  data: ResumeData;
}

const TEMPLATES: Template[] = [
  {
    id: 'software-engineer',
    name: 'Software Engineer',
    icon: Code,
    data: {
      fullName: 'Rohan Sharma',
      email: 'rohan.sharma@email.com',
      phone: '+91 98765 43210',
      location: 'Mumbai, Maharashtra',
      linkedin: 'linkedin.com/in/rohansharma',
      github: 'github.com/rohansharma',
      portfolio: 'rohansharma.dev',
      professionalSummary: 'Results-driven Software Engineer with 3+ years of experience in full-stack development. Specialized in building scalable web applications using React, Node.js, and cloud technologies. Proven track record of delivering high-quality solutions in fast-paced environments.',
      technicalSkills: 'JavaScript, TypeScript, React, Node.js, Express.js, MongoDB, PostgreSQL, AWS, Docker, Git, REST APIs, GraphQL, Redis, Jest, CI/CD',
      softSkills: 'Problem Solving, Team Collaboration, Communication, Agile/Scrum, Leadership, Time Management',
      experiences: [
        {
          company: 'Tech Solutions Pvt Ltd',
          role: 'Senior Software Engineer',
          duration: 'Jan 2022 - Present',
          responsibilities: 'Led development of microservices architecture serving 100K+ users\nImplemented CI/CD pipeline reducing deployment time by 60%\nMentored team of 3 junior developers\nOptimized database queries improving response time by 40%',
        },
        {
          company: 'Startup Inc',
          role: 'Full Stack Developer',
          duration: 'Jun 2020 - Dec 2021',
          responsibilities: 'Built responsive web applications using React and Node.js\nIntegrated third-party APIs and payment gateways\nCollaborated with designers to implement pixel-perfect UIs\nWrote unit and integration tests achieving 85% code coverage',
        },
      ],
      projects: [
        {
          name: 'E-Commerce Platform',
          description: 'Built a full-featured e-commerce platform with payment integration, inventory management, and admin dashboard',
          technologies: 'React, Node.js, MongoDB, Stripe, AWS S3',
        },
        {
          name: 'Real-time Chat Application',
          description: 'Developed real-time chat app with WebSocket support, file sharing, and group conversations',
          technologies: 'React, Socket.io, Express, Redis, PostgreSQL',
        },
      ],
      educations: [
        {
          degree: 'B.Tech in Computer Science',
          institute: 'Indian Institute of Technology, Mumbai',
          year: '2020',
          gpa: '8.5/10',
        },
      ],
      certifications: 'AWS Certified Solutions Architect, MongoDB Certified Developer, React Professional Certificate',
      jobDescription: '',
    },
  },
  {
    id: 'data-scientist',
    name: 'Data Scientist',
    icon: Database,
    data: {
      fullName: 'Priya Patel',
      email: 'priya.patel@email.com',
      phone: '+91 98765 12345',
      location: 'Bangalore, Karnataka',
      linkedin: 'linkedin.com/in/priyapatel',
      github: 'github.com/priyapatel',
      portfolio: 'priyapatel-ds.com',
      professionalSummary: 'Data Scientist with 4+ years of experience in machine learning, statistical analysis, and data visualization. Expertise in building predictive models and delivering actionable insights from complex datasets. Strong background in Python, SQL, and cloud-based ML platforms.',
      technicalSkills: 'Python, R, SQL, TensorFlow, PyTorch, Scikit-learn, Pandas, NumPy, Matplotlib, Seaborn, Jupyter, AWS SageMaker, BigQuery, Apache Spark, Tableau, Power BI',
      softSkills: 'Analytical Thinking, Communication, Stakeholder Management, Problem Solving, Collaboration, Presentation Skills',
      experiences: [
        {
          company: 'Data Analytics Corp',
          role: 'Senior Data Scientist',
          duration: 'Mar 2021 - Present',
          responsibilities: 'Developed ML models improving customer retention by 25%\nBuilt recommendation engine processing 1M+ daily transactions\nLed data-driven initiatives saving company ₹50L annually\nPresented insights to C-level executives and stakeholders',
        },
        {
          company: 'AI Solutions Ltd',
          role: 'Data Scientist',
          duration: 'Jul 2019 - Feb 2021',
          responsibilities: 'Created predictive models for demand forecasting with 92% accuracy\nPerformed A/B testing and statistical analysis\nAutomated data pipelines reducing processing time by 70%\nCollaborated with engineering teams to deploy models in production',
        },
      ],
      projects: [
        {
          name: 'Customer Churn Prediction',
          description: 'Built ML model to predict customer churn with 88% accuracy, helping retain high-value customers',
          technologies: 'Python, XGBoost, Scikit-learn, Flask, AWS',
        },
        {
          name: 'Sentiment Analysis Dashboard',
          description: 'Created real-time dashboard analyzing social media sentiment for brand monitoring',
          technologies: 'Python, NLTK, Streamlit, MongoDB, Docker',
        },
      ],
      educations: [
        {
          degree: 'M.S. in Data Science',
          institute: 'International Institute of Information Technology, Bangalore',
          year: '2019',
          gpa: '9.0/10',
        },
        {
          degree: 'B.Tech in Computer Engineering',
          institute: 'Gujarat Technological University',
          year: '2017',
          gpa: '8.7/10',
        },
      ],
      certifications: 'Google Data Analytics Professional Certificate, AWS Machine Learning Specialty, TensorFlow Developer Certificate',
      jobDescription: '',
    },
  },
  {
    id: 'product-manager',
    name: 'Product Manager',
    icon: Briefcase,
    data: {
      fullName: 'Amit Kumar',
      email: 'amit.kumar@email.com',
      phone: '+91 98765 67890',
      location: 'Delhi NCR, India',
      linkedin: 'linkedin.com/in/amitkumar',
      github: '',
      portfolio: '',
      professionalSummary: 'Strategic Product Manager with 5+ years of experience driving product vision and roadmap for B2B and B2C platforms. Proven ability to lead cross-functional teams, define product requirements, and deliver solutions that drive business growth. Strong background in agile methodologies and data-driven decision making.',
      technicalSkills: 'Product Strategy, Roadmap Planning, User Research, Wireframing, JIRA, Confluence, SQL, Google Analytics, Mixpanel, A/B Testing, Agile/Scrum, Figma, Market Analysis',
      softSkills: 'Leadership, Strategic Thinking, Communication, Stakeholder Management, Negotiation, Problem Solving, Decision Making',
      experiences: [
        {
          company: 'Product Tech Solutions',
          role: 'Senior Product Manager',
          duration: 'Apr 2021 - Present',
          responsibilities: 'Led product strategy for SaaS platform serving 50K+ users\nIncreased user engagement by 35% through feature optimization\nManaged product backlog and prioritized features with stakeholders\nConducted user research and translated insights into product requirements',
        },
        {
          company: 'Digital Innovations Pvt Ltd',
          role: 'Product Manager',
          duration: 'Aug 2018 - Mar 2021',
          responsibilities: 'Launched 3 major product features increasing revenue by 40%\nCollaborated with engineering, design, and marketing teams\nDefined product metrics and KPIs tracking success\nConducted competitive analysis and market research',
        },
      ],
      projects: [
        {
          name: 'Mobile App Launch',
          description: 'Led end-to-end launch of mobile app achieving 100K downloads in first 3 months',
          technologies: 'Product Strategy, User Research, Agile, Analytics',
        },
        {
          name: 'Payment Gateway Integration',
          description: 'Managed integration of multiple payment gateways reducing transaction failures by 60%',
          technologies: 'API Integration, Technical Documentation, Testing',
        },
      ],
      educations: [
        {
          degree: 'MBA in Product Management',
          institute: 'Indian School of Business',
          year: '2018',
          gpa: '',
        },
        {
          degree: 'B.Tech in Information Technology',
          institute: 'Delhi Technological University',
          year: '2016',
          gpa: '8.2/10',
        },
      ],
      certifications: 'Certified Scrum Product Owner (CSPO), Google Product Management Certificate, Pragmatic Marketing Certified',
      jobDescription: '',
    },
  },
  {
    id: 'ui-ux-designer',
    name: 'UI/UX Designer',
    icon: Palette,
    data: {
      fullName: 'Neha Desai',
      email: 'neha.desai@email.com',
      phone: '+91 98765 54321',
      location: 'Pune, Maharashtra',
      linkedin: 'linkedin.com/in/nehadesai',
      github: '',
      portfolio: 'nehadesai.design',
      professionalSummary: 'Creative UI/UX Designer with 4+ years of experience designing user-centered digital experiences. Expertise in user research, wireframing, prototyping, and visual design. Passionate about creating intuitive interfaces that solve real user problems and drive business goals.',
      technicalSkills: 'Figma, Adobe XD, Sketch, Adobe Photoshop, Adobe Illustrator, InVision, Principle, HTML/CSS, User Research, Wireframing, Prototyping, Design Systems, Responsive Design',
      softSkills: 'Creativity, Empathy, Communication, Collaboration, Attention to Detail, Problem Solving, Time Management',
      experiences: [
        {
          company: 'Design Studio Co',
          role: 'Senior UI/UX Designer',
          duration: 'Feb 2021 - Present',
          responsibilities: 'Designed user experiences for web and mobile applications\nConducted user research, interviews, and usability testing\nCreated design systems ensuring consistency across products\nCollaborated with developers to ensure design implementation',
        },
        {
          company: 'Creative Agency Ltd',
          role: 'UI/UX Designer',
          duration: 'May 2019 - Jan 2021',
          responsibilities: 'Designed 15+ websites and mobile apps for clients\nCreated wireframes, mockups, and interactive prototypes\nConducted A/B testing improving conversion rates by 25%\nPresented design concepts to clients and stakeholders',
        },
      ],
      projects: [
        {
          name: 'E-learning Platform Redesign',
          description: 'Redesigned e-learning platform improving user engagement by 40% and reducing bounce rate by 30%',
          technologies: 'Figma, User Research, Prototyping, Usability Testing',
        },
        {
          name: 'Mobile Banking App',
          description: 'Designed intuitive mobile banking app with focus on accessibility and security',
          technologies: 'Adobe XD, User Flows, Wireframing, Design System',
        },
      ],
      educations: [
        {
          degree: 'M.Des in Interaction Design',
          institute: 'National Institute of Design, Ahmedabad',
          year: '2019',
          gpa: '',
        },
        {
          degree: 'B.Des in Visual Communication',
          institute: 'MIT Institute of Design, Pune',
          year: '2017',
          gpa: '8.5/10',
        },
      ],
      certifications: 'Google UX Design Professional Certificate, Nielsen Norman Group UX Certification, Interaction Design Foundation',
      jobDescription: '',
    },
  },
];

const ResumeBuilder: React.FC = () => {
  const [formData, setFormData] = useState<ResumeData>({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
    professionalSummary: '',
    technicalSkills: '',
    softSkills: '',
    experiences: [{ company: '', role: '', duration: '', responsibilities: '' }],
    projects: [{ name: '', description: '', technologies: '' }],
    educations: [{ degree: '', institute: '', year: '', gpa: '' }],
    certifications: '',
    jobDescription: '',
  });

  const [atsScore, setAtsScore] = useState<ATSScore | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);

  // Load template
  const loadTemplate = (template: Template) => {
    setFormData(template.data);
    setShowTemplates(false);
    setShowPreview(false);
    setAtsScore(null);
  };

  // Add new experience field
  const addExperience = () => {
    setFormData({
      ...formData,
      experiences: [...formData.experiences, { company: '', role: '', duration: '', responsibilities: '' }],
    });
  };

  // Remove experience field
  const removeExperience = (index: number) => {
    const newExperiences = formData.experiences.filter((_, i) => i !== index);
    setFormData({ ...formData, experiences: newExperiences });
  };

  // Update experience field
  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const newExperiences = [...formData.experiences];
    newExperiences[index][field] = value;
    setFormData({ ...formData, experiences: newExperiences });
  };

  // Add new project field
  const addProject = () => {
    setFormData({
      ...formData,
      projects: [...formData.projects, { name: '', description: '', technologies: '' }],
    });
  };

  // Remove project field
  const removeProject = (index: number) => {
    const newProjects = formData.projects.filter((_, i) => i !== index);
    setFormData({ ...formData, projects: newProjects });
  };

  // Update project field
  const updateProject = (index: number, field: keyof Project, value: string) => {
    const newProjects = [...formData.projects];
    newProjects[index][field] = value;
    setFormData({ ...formData, projects: newProjects });
  };

  // Add new education field
  const addEducation = () => {
    setFormData({
      ...formData,
      educations: [...formData.educations, { degree: '', institute: '', year: '', gpa: '' }],
    });
  };

  // Remove education field
  const removeEducation = (index: number) => {
    const newEducations = formData.educations.filter((_, i) => i !== index);
    setFormData({ ...formData, educations: newEducations });
  };

  // Update education field
  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const newEducations = [...formData.educations];
    newEducations[index][field] = value;
    setFormData({ ...formData, educations: newEducations });
  };

  // Calculate ATS Score
  const calculateATSScore = (): ATSScore => {
    const jd = formData.jobDescription.toLowerCase();
    const skills = `${formData.technicalSkills} ${formData.softSkills}`.toLowerCase();
    const summary = formData.professionalSummary.toLowerCase();
    const allExperience = formData.experiences
      .map((exp) => `${exp.role} ${exp.responsibilities}`.toLowerCase())
      .join(' ');
    const allProjects = formData.projects
      .map((proj) => `${proj.name} ${proj.description} ${proj.technologies}`.toLowerCase())
      .join(' ');

    // Extract keywords from JD
    const jdWords = jd
      .split(/\W+/)
      .filter((word) => word.length > 3)
      .filter((word) => !['with', 'this', 'that', 'will', 'have', 'been', 'from', 'into', 'should', 'work', 'team', 'must'].includes(word));

    const uniqueJdWords = [...new Set(jdWords)];

    // Keywords Match (40%)
    const resumeContent = `${skills} ${summary} ${allExperience} ${allProjects}`.toLowerCase();
    const matchedKeywords = uniqueJdWords.filter((word) => resumeContent.includes(word));
    const keywordsMatch = uniqueJdWords.length > 0
      ? Math.round((matchedKeywords.length / uniqueJdWords.length) * 40)
      : 0;

    // Skills Alignment (30%)
    const skillsList = skills.split(',').map((s) => s.trim().toLowerCase());
    const matchedSkills = skillsList.filter((skill) => jd.includes(skill));
    const skillsAlignment = skillsList.length > 0
      ? Math.round((matchedSkills.length / skillsList.length) * 30)
      : 0;

    // Experience Alignment (20%)
    const hasExperience = formData.experiences.some(
      (exp) => exp.company && exp.role && exp.responsibilities
    );
    const experienceAlignment = hasExperience ? 20 : 0;

    // Formatting (10%)
    const formatting = 10;

    const total = keywordsMatch + skillsAlignment + experienceAlignment + formatting;

    return {
      total,
      keywordsMatch,
      skillsAlignment,
      experienceAlignment,
      formatting,
    };
  };

  // Generate Resume and Calculate Score
  const handleGenerateResume = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const score = calculateATSScore();
      setAtsScore(score);
      setShowPreview(true);
      setIsGenerating(false);
    }, 1000);
  };

  // Download Resume as PDF
  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = 20;

    const checkPageBreak = (requiredSpace: number = 20) => {
      if (yPosition + requiredSpace > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
    };

    const addText = (text: string, fontSize: number = 11, isBold: boolean = false) => {
      checkPageBreak();
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
      doc.text(lines, margin, yPosition);
      yPosition += lines.length * (fontSize * 0.35) + 3;
    };

    const addSectionTitle = (title: string) => {
      checkPageBreak(15);
      yPosition += 5;
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin, yPosition);
      yPosition += 2;
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;
    };

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(formData.fullName, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 7;

    // Contact Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const contactLine1 = `${formData.email} | ${formData.phone} | ${formData.location}`;
    doc.text(contactLine1, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;

    const links = [];
    if (formData.linkedin) links.push(`LinkedIn: ${formData.linkedin}`);
    if (formData.github) links.push(`GitHub: ${formData.github}`);
    if (formData.portfolio) links.push(`Portfolio: ${formData.portfolio}`);
    if (links.length > 0) {
      doc.text(links.join(' | '), pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;
    } else {
      yPosition += 3;
    }

    // Professional Summary
    if (formData.professionalSummary) {
      addSectionTitle('PROFESSIONAL SUMMARY');
      addText(formData.professionalSummary);
    }

    // Technical Skills
    if (formData.technicalSkills) {
      addSectionTitle('TECHNICAL SKILLS');
      addText(formData.technicalSkills);
    }

    // Soft Skills
    if (formData.softSkills) {
      addSectionTitle('SOFT SKILLS');
      addText(formData.softSkills);
    }

    // Professional Experience
    if (formData.experiences.some((exp) => exp.company)) {
      addSectionTitle('PROFESSIONAL EXPERIENCE');
      formData.experiences.forEach((exp) => {
        if (exp.company && exp.role) {
          checkPageBreak(25);
          addText(`${exp.role} at ${exp.company}`, 11, true);
          if (exp.duration) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'italic');
            doc.text(exp.duration, margin, yPosition);
            yPosition += 5;
          }
          if (exp.responsibilities) {
            const bullets = exp.responsibilities.split('\n').filter((b) => b.trim());
            bullets.forEach((bullet) => {
              addText(`• ${bullet.trim()}`, 10);
            });
          }
          yPosition += 3;
        }
      });
    }

    // Projects
    if (formData.projects.some((proj) => proj.name)) {
      addSectionTitle('PROJECTS');
      formData.projects.forEach((proj) => {
        if (proj.name) {
          checkPageBreak(20);
          addText(proj.name, 11, true);
          if (proj.description) {
            addText(proj.description, 10);
          }
          if (proj.technologies) {
            doc.setFont('helvetica', 'italic');
            addText(`Technologies: ${proj.technologies}`, 9);
          }
          yPosition += 2;
        }
      });
    }

    // Education
    if (formData.educations.some((edu) => edu.degree)) {
      addSectionTitle('EDUCATION');
      formData.educations.forEach((edu) => {
        if (edu.degree && edu.institute) {
          checkPageBreak(10);
          addText(`${edu.degree} - ${edu.institute} (${edu.year})`, 11, true);
          if (edu.gpa) {
            addText(`GPA: ${edu.gpa}`, 10);
          }
        }
      });
    }

    // Certifications
    if (formData.certifications) {
      addSectionTitle('CERTIFICATIONS');
      addText(formData.certifications);
    }

    doc.save(`${formData.fullName.replace(/\s+/g, '_')}_Resume.pdf`);
  };

  // Get score color
  const getScoreColor = (score: number): string => {
    if (score >= 70) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileUser className="w-7 h-7 text-neon-blue" />
            ATS Resume Builder
          </h2>
          <p className="text-gray-400 mt-1">
            Create a professional, ATS-friendly resume and get compatibility score
          </p>
        </div>
        <button
          onClick={() => {
            setShowTemplates(!showTemplates);
            if (showTemplates) setShowPreview(false);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-neon-purple/10 text-neon-purple border border-neon-purple/20 rounded-lg hover:bg-neon-purple/20 transition-colors"
        >
          <Sparkles className="w-5 h-5" />
          {showTemplates ? 'Hide Templates' : 'Show Templates'}
        </button>
      </div>

      {/* Templates Section */}
      {showTemplates && (
        <div className="bg-dark-800 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-neon-purple" />
            Choose a Template to Get Started
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => loadTemplate(template)}
                className="p-6 bg-dark-900 border border-white/10 rounded-lg hover:border-neon-purple hover:bg-neon-purple/5 transition-all group text-left"
              >
                <template.icon className="w-10 h-10 text-neon-purple mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="text-white font-semibold mb-1">{template.name}</h4>
                <p className="text-gray-400 text-sm">Click to load sample resume</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="bg-dark-800 border border-white/10 rounded-xl p-6 space-y-6 max-h-[800px] overflow-y-auto">
          <h3 className="text-lg font-semibold text-white">Resume Information</h3>

          {/* Personal Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="John Doe"
                className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-neon-blue focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-neon-blue focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-neon-blue focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Location *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Mumbai, Maharashtra"
                className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-neon-blue focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn</label>
                <input
                  type="text"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="linkedin.com/in/johndoe"
                  className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-neon-blue focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">GitHub</label>
                <input
                  type="text"
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  placeholder="github.com/johndoe"
                  className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-neon-blue focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Portfolio</label>
                <input
                  type="text"
                  value={formData.portfolio}
                  onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                  placeholder="johndoe.dev"
                  className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-neon-blue focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Professional Summary *
              </label>
              <textarea
                value={formData.professionalSummary}
                onChange={(e) => setFormData({ ...formData, professionalSummary: e.target.value })}
                placeholder="Brief summary of your professional background and key achievements..."
                rows={4}
                className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-neon-blue focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Technical Skills (comma separated) *
              </label>
              <textarea
                value={formData.technicalSkills}
                onChange={(e) => setFormData({ ...formData, technicalSkills: e.target.value })}
                placeholder="React, Node.js, Python, AWS, Docker, SQL"
                rows={3}
                className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-neon-blue focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Soft Skills (comma separated)
              </label>
              <textarea
                value={formData.softSkills}
                onChange={(e) => setFormData({ ...formData, softSkills: e.target.value })}
                placeholder="Leadership, Communication, Problem Solving, Team Collaboration"
                rows={2}
                className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-neon-blue focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Experience Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-300">Experience *</label>
              <button
                onClick={addExperience}
                className="flex items-center gap-1 px-3 py-1 bg-neon-blue/10 text-neon-blue border border-neon-blue/20 rounded-lg hover:bg-neon-blue/20 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add More
              </button>
            </div>

            {formData.experiences.map((exp, index) => (
              <div key={index} className="space-y-3 p-4 bg-dark-900 border border-white/10 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Experience {index + 1}</span>
                  {formData.experiences.length > 1 && (
                    <button
                      onClick={() => removeExperience(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => updateExperience(index, 'company', e.target.value)}
                  placeholder="Company Name"
                  className="w-full px-3 py-2 bg-dark-800 border border-white/10 rounded-lg text-white focus:border-neon-blue focus:outline-none text-sm"
                />

                <input
                  type="text"
                  value={exp.role}
                  onChange={(e) => updateExperience(index, 'role', e.target.value)}
                  placeholder="Role/Position"
                  className="w-full px-3 py-2 bg-dark-800 border border-white/10 rounded-lg text-white focus:border-neon-blue focus:outline-none text-sm"
                />

                <input
                  type="text"
                  value={exp.duration}
                  onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                  placeholder="Duration (e.g., Jan 2022 - Present)"
                  className="w-full px-3 py-2 bg-dark-800 border border-white/10 rounded-lg text-white focus:border-neon-blue focus:outline-none text-sm"
                />

                <textarea
                  value={exp.responsibilities}
                  onChange={(e) => updateExperience(index, 'responsibilities', e.target.value)}
                  placeholder="Responsibilities (one per line)&#10;Led development of microservices&#10;Improved performance by 40%"
                  rows={4}
                  className="w-full px-3 py-2 bg-dark-800 border border-white/10 rounded-lg text-white focus:border-neon-blue focus:outline-none text-sm resize-none"
                />
              </div>
            ))}
          </div>

          {/* Projects Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-300">Projects</label>
              <button
                onClick={addProject}
                className="flex items-center gap-1 px-3 py-1 bg-neon-blue/10 text-neon-blue border border-neon-blue/20 rounded-lg hover:bg-neon-blue/20 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add More
              </button>
            </div>

            {formData.projects.map((proj, index) => (
              <div key={index} className="space-y-3 p-4 bg-dark-900 border border-white/10 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Project {index + 1}</span>
                  {formData.projects.length > 1 && (
                    <button
                      onClick={() => removeProject(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={proj.name}
                  onChange={(e) => updateProject(index, 'name', e.target.value)}
                  placeholder="Project Name"
                  className="w-full px-3 py-2 bg-dark-800 border border-white/10 rounded-lg text-white focus:border-neon-blue focus:outline-none text-sm"
                />

                <textarea
                  value={proj.description}
                  onChange={(e) => updateProject(index, 'description', e.target.value)}
                  placeholder="Project description and achievements..."
                  rows={3}
                  className="w-full px-3 py-2 bg-dark-800 border border-white/10 rounded-lg text-white focus:border-neon-blue focus:outline-none text-sm resize-none"
                />

                <input
                  type="text"
                  value={proj.technologies}
                  onChange={(e) => updateProject(index, 'technologies', e.target.value)}
                  placeholder="Technologies Used (e.g., React, Node.js, MongoDB)"
                  className="w-full px-3 py-2 bg-dark-800 border border-white/10 rounded-lg text-white focus:border-neon-blue focus:outline-none text-sm"
                />
              </div>
            ))}
          </div>

          {/* Education Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-300">Education *</label>
              <button
                onClick={addEducation}
                className="flex items-center gap-1 px-3 py-1 bg-neon-blue/10 text-neon-blue border border-neon-blue/20 rounded-lg hover:bg-neon-blue/20 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add More
              </button>
            </div>

            {formData.educations.map((edu, index) => (
              <div key={index} className="space-y-3 p-4 bg-dark-900 border border-white/10 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Education {index + 1}</span>
                  {formData.educations.length > 1 && (
                    <button
                      onClick={() => removeEducation(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                  placeholder="Degree (e.g., B.Tech in Computer Science)"
                  className="w-full px-3 py-2 bg-dark-800 border border-white/10 rounded-lg text-white focus:border-neon-blue focus:outline-none text-sm"
                />

                <input
                  type="text"
                  value={edu.institute}
                  onChange={(e) => updateEducation(index, 'institute', e.target.value)}
                  placeholder="Institute Name"
                  className="w-full px-3 py-2 bg-dark-800 border border-white/10 rounded-lg text-white focus:border-neon-blue focus:outline-none text-sm"
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={edu.year}
                    onChange={(e) => updateEducation(index, 'year', e.target.value)}
                    placeholder="Year (e.g., 2020)"
                    className="w-full px-3 py-2 bg-dark-800 border border-white/10 rounded-lg text-white focus:border-neon-blue focus:outline-none text-sm"
                  />
                  <input
                    type="text"
                    value={edu.gpa || ''}
                    onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                    placeholder="GPA (optional)"
                    className="w-full px-3 py-2 bg-dark-800 border border-white/10 rounded-lg text-white focus:border-neon-blue focus:outline-none text-sm"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Certifications */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Certifications (comma separated)
            </label>
            <textarea
              value={formData.certifications}
              onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
              placeholder="AWS Certified Solutions Architect, Google Cloud Professional, Scrum Master"
              rows={2}
              className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-neon-blue focus:outline-none resize-none"
            />
          </div>

          {/* Job Description (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Job Description (Optional - for ATS scoring)
            </label>
            <textarea
              value={formData.jobDescription}
              onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
              placeholder="Paste the job description here to calculate ATS compatibility score..."
              rows={6}
              className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-neon-blue focus:outline-none resize-none"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateResume}
            disabled={!formData.fullName || !formData.email || isGenerating}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-neon-blue text-black font-semibold rounded-lg hover:bg-neon-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Eye className="w-5 h-5" />
                Generate Resume & Score
              </>
            )}
          </button>
        </div>

        {/* Preview & Score Section */}
        <div className="bg-dark-800 border border-white/10 rounded-xl p-6 space-y-6">
          {!showPreview ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <FileText className="w-16 h-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No Preview Yet</h3>
              <p className="text-gray-500">
                Fill in the form and click "Generate Resume & Score" to see the preview and ATS score
              </p>
            </div>
          ) : (
            <>
              {/* ATS Score */}
              {atsScore && (
                <div className="bg-dark-900 border border-white/10 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-neon-blue" />
                    ATS Compatibility Score
                  </h3>

                  <div className="text-center mb-6">
                    <div className={`text-5xl font-bold ${getScoreColor(atsScore.total)}`}>
                      {atsScore.total}/100
                    </div>
                    <p className="text-gray-400 mt-2">
                      {atsScore.total >= 70
                        ? 'Excellent! Your resume is ATS-friendly'
                        : atsScore.total >= 50
                        ? 'Good! Some improvements needed'
                        : 'Needs improvement'}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Keywords Match</span>
                      <span className="text-white font-semibold">{atsScore.keywordsMatch}/40</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Skills Alignment</span>
                      <span className="text-white font-semibold">{atsScore.skillsAlignment}/30</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Experience Alignment</span>
                      <span className="text-white font-semibold">
                        {atsScore.experienceAlignment}/20
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">ATS-Safe Formatting</span>
                      <span className="text-white font-semibold">{atsScore.formatting}/10</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Resume Preview */}
              <div className="bg-white text-black rounded-lg p-8 space-y-4 max-h-[600px] overflow-y-auto">
                {/* Header */}
                <div className="text-center border-b-2 border-gray-300 pb-4">
                  <h1 className="text-2xl font-bold">{formData.fullName}</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {formData.email} | {formData.phone} | {formData.location}
                  </p>
                  {(formData.linkedin || formData.github || formData.portfolio) && (
                    <p className="text-xs text-gray-600 mt-1">
                      {[formData.linkedin, formData.github, formData.portfolio]
                        .filter(Boolean)
                        .join(' | ')}
                    </p>
                  )}
                </div>

                {/* Professional Summary */}
                {formData.professionalSummary && (
                  <div>
                    <h2 className="text-lg font-bold border-b border-gray-400 mb-2">
                      PROFESSIONAL SUMMARY
                    </h2>
                    <p className="text-sm text-gray-800">{formData.professionalSummary}</p>
                  </div>
                )}

                {/* Technical Skills */}
                {formData.technicalSkills && (
                  <div>
                    <h2 className="text-lg font-bold border-b border-gray-400 mb-2">
                      TECHNICAL SKILLS
                    </h2>
                    <p className="text-sm text-gray-800">{formData.technicalSkills}</p>
                  </div>
                )}

                {/* Soft Skills */}
                {formData.softSkills && (
                  <div>
                    <h2 className="text-lg font-bold border-b border-gray-400 mb-2">
                      SOFT SKILLS
                    </h2>
                    <p className="text-sm text-gray-800">{formData.softSkills}</p>
                  </div>
                )}

                {/* Professional Experience */}
                {formData.experiences.some((exp) => exp.company) && (
                  <div>
                    <h2 className="text-lg font-bold border-b border-gray-400 mb-2">
                      PROFESSIONAL EXPERIENCE
                    </h2>
                    {formData.experiences.map(
                      (exp, index) =>
                        exp.company && (
                          <div key={index} className="mb-3">
                            <h3 className="font-bold text-sm">
                              {exp.role} at {exp.company}
                            </h3>
                            {exp.duration && (
                              <p className="text-xs text-gray-600 italic">{exp.duration}</p>
                            )}
                            {exp.responsibilities && (
                              <ul className="list-disc list-inside text-sm text-gray-800 mt-1">
                                {exp.responsibilities.split('\n').map(
                                  (bullet, i) =>
                                    bullet.trim() && (
                                      <li key={i}>
                                        {bullet.replace(/^[-•]\s*/, '').trim()}
                                      </li>
                                    )
                                )}
                              </ul>
                            )}
                          </div>
                        )
                    )}
                  </div>
                )}

                {/* Projects */}
                {formData.projects.some((proj) => proj.name) && (
                  <div>
                    <h2 className="text-lg font-bold border-b border-gray-400 mb-2">PROJECTS</h2>
                    {formData.projects.map(
                      (proj, index) =>
                        proj.name && (
                          <div key={index} className="mb-3">
                            <h3 className="font-bold text-sm">{proj.name}</h3>
                            {proj.description && (
                              <p className="text-sm text-gray-800">{proj.description}</p>
                            )}
                            {proj.technologies && (
                              <p className="text-xs text-gray-600 italic mt-1">
                                Technologies: {proj.technologies}
                              </p>
                            )}
                          </div>
                        )
                    )}
                  </div>
                )}

                {/* Education */}
                {formData.educations.some((edu) => edu.degree) && (
                  <div>
                    <h2 className="text-lg font-bold border-b border-gray-400 mb-2">EDUCATION</h2>
                    {formData.educations.map(
                      (edu, index) =>
                        edu.degree && (
                          <div key={index} className="mb-2">
                            <p className="font-bold text-sm">
                              {edu.degree} - {edu.institute} ({edu.year})
                            </p>
                            {edu.gpa && (
                              <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>
                            )}
                          </div>
                        )
                    )}
                  </div>
                )}

                {/* Certifications */}
                {formData.certifications && (
                  <div>
                    <h2 className="text-lg font-bold border-b border-gray-400 mb-2">
                      CERTIFICATIONS
                    </h2>
                    <p className="text-sm text-gray-800">{formData.certifications}</p>
                  </div>
                )}
              </div>

              {/* Download Button */}
              <button
                onClick={downloadPDF}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                Download as PDF
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
