import React, { useState } from 'react';
import {
  Play, CheckCircle, ChevronDown, ChevronUp,
  User, FileText, Briefcase, MapPin, GraduationCap,
  Star, Upload, Search, Settings, Shield,
  MonitorPlay, Clock, ArrowRight,
} from 'lucide-react';

// ─── Step Data ───────────────────────────────────────────────────────────────

interface Step {
  id: number;
  title: string;
  description: string;
  duration: string;
  icon: React.ElementType;
  color: string;
  animationFrames: { label: string; detail: string }[];
}

const STEPS: Step[] = [
  {
    id: 1,
    title: 'Create Naukri Account',
    description: 'Sign up on Naukri.com with your email and mobile number. Verify OTP to activate your account.',
    duration: '2 min',
    icon: User,
    color: 'from-blue-500 to-blue-600',
    animationFrames: [
      { label: 'Go to naukri.com', detail: 'Open browser and navigate to naukri.com' },
      { label: 'Click Register', detail: 'Click on "Register" button on top right' },
      { label: 'Enter Details', detail: 'Fill Full Name, Email ID, Password, Mobile Number' },
      { label: 'Verify OTP', detail: 'Enter the OTP sent to your mobile number' },
      { label: 'Account Created', detail: 'Your Naukri account is now active!' },
    ],
  },
  {
    id: 2,
    title: 'Add Personal Details',
    description: 'Fill in your basic information including name, date of birth, gender, and contact details.',
    duration: '3 min',
    icon: User,
    color: 'from-purple-500 to-purple-600',
    animationFrames: [
      { label: 'Go to Profile', detail: 'Click on your name → "View & Update Profile"' },
      { label: 'Personal Info', detail: 'Add Full Name, Date of Birth, Gender' },
      { label: 'Contact Details', detail: 'Add Email, Phone Number, Current Location' },
      { label: 'Permanent Address', detail: 'Fill in your permanent address details' },
      { label: 'Save Changes', detail: 'Click "Save" to update personal details' },
    ],
  },
  {
    id: 3,
    title: 'Add Professional Summary',
    description: 'Write a compelling profile summary highlighting your skills, experience, and career goals.',
    duration: '5 min',
    icon: FileText,
    color: 'from-green-500 to-green-600',
    animationFrames: [
      { label: 'Profile Summary', detail: 'Click "Edit" on Profile Summary section' },
      { label: 'Write Headline', detail: 'Add a strong headline: e.g. "Java Developer | Spring Boot | Microservices"' },
      { label: 'Write Summary', detail: 'Write 3-4 lines about your experience and key skills' },
      { label: 'Add Key Skills', detail: 'List your top technical and soft skills' },
      { label: 'Save Summary', detail: 'Review and save your professional summary' },
    ],
  },
  {
    id: 4,
    title: 'Add Work Experience',
    description: 'Add your current and previous job roles with company name, designation, and responsibilities.',
    duration: '5 min',
    icon: Briefcase,
    color: 'from-orange-500 to-orange-600',
    animationFrames: [
      { label: 'Employment Section', detail: 'Click "Add Employment" in the Experience section' },
      { label: 'Current Company', detail: 'Add current company name, designation, joining date' },
      { label: 'Job Description', detail: 'Write key responsibilities and achievements in bullet points' },
      { label: 'Previous Companies', detail: 'Add previous employment details similarly' },
      { label: 'Total Experience', detail: 'Verify total experience years is calculated correctly' },
    ],
  },
  {
    id: 5,
    title: 'Add Education Details',
    description: 'Add your educational qualifications - degree, university, year of passing, and percentage/CGPA.',
    duration: '3 min',
    icon: GraduationCap,
    color: 'from-cyan-500 to-cyan-600',
    animationFrames: [
      { label: 'Education Section', detail: 'Click "Add Education" in the Education section' },
      { label: 'Highest Degree', detail: 'Select degree type: B.Tech, MCA, BCA, M.Tech etc.' },
      { label: 'University Details', detail: 'Add University/College name and specialization' },
      { label: 'Year & Score', detail: 'Add passing year and percentage/CGPA' },
      { label: 'Add More', detail: 'Add 12th, 10th or other qualifications if needed' },
    ],
  },
  {
    id: 6,
    title: 'Add Key Skills',
    description: 'Add your technical and professional skills. Naukri uses these to match you with relevant jobs.',
    duration: '3 min',
    icon: Star,
    color: 'from-yellow-500 to-yellow-600',
    animationFrames: [
      { label: 'Key Skills Section', detail: 'Click "Add" in the Key Skills section' },
      { label: 'Technical Skills', detail: 'Type and add: Java, Spring Boot, React, SQL, etc.' },
      { label: 'Tools & Platforms', detail: 'Add: Git, Docker, AWS, Jenkins, Postman etc.' },
      { label: 'Soft Skills', detail: 'Add: Communication, Team Work, Problem Solving' },
      { label: 'Verify Skills', detail: 'Review all added skills and remove irrelevant ones' },
    ],
  },
  {
    id: 7,
    title: 'Upload Resume',
    description: 'Upload your latest resume in PDF or DOC format. Naukri parses it to auto-fill profile sections.',
    duration: '2 min',
    icon: Upload,
    color: 'from-pink-500 to-pink-600',
    animationFrames: [
      { label: 'Resume Section', detail: 'Click "Update Resume" on your profile page' },
      { label: 'Choose File', detail: 'Select your latest resume (PDF/DOC, max 2MB)' },
      { label: 'Upload', detail: 'Click upload and wait for processing' },
      { label: 'Auto-Parse', detail: 'Naukri will auto-extract details from your resume' },
      { label: 'Verify Details', detail: 'Check if parsed data is correct, fix if needed' },
    ],
  },
  {
    id: 8,
    title: 'Set Job Preferences',
    description: 'Configure your preferred job location, salary, industry, role, and notice period.',
    duration: '3 min',
    icon: Settings,
    color: 'from-indigo-500 to-indigo-600',
    animationFrames: [
      { label: 'Desired Job Section', detail: 'Click "Edit" on Desired Job section' },
      { label: 'Preferred Location', detail: 'Select preferred cities: Bangalore, Mumbai, Pune, etc.' },
      { label: 'Expected Salary', detail: 'Set your expected CTC/salary range' },
      { label: 'Industry & Role', detail: 'Choose preferred industry and functional area' },
      { label: 'Notice Period', detail: 'Set current notice period and availability to join' },
    ],
  },
  {
    id: 9,
    title: 'Add Projects & Certifications',
    description: 'Showcase your projects and certifications to stand out from other candidates.',
    duration: '5 min',
    icon: Shield,
    color: 'from-emerald-500 to-emerald-600',
    animationFrames: [
      { label: 'Projects Section', detail: 'Click "Add" in IT Skills / Projects section' },
      { label: 'Add Project', detail: 'Add project name, description, role, and technologies used' },
      { label: 'Certifications', detail: 'Click "Add Certification" and fill details' },
      { label: 'Certificate Details', detail: 'Add certificate name, issuing org, date, and ID' },
      { label: 'Online Profiles', detail: 'Add GitHub, LinkedIn, Portfolio links' },
    ],
  },
  {
    id: 10,
    title: 'Optimize & Start Applying',
    description: 'Review your profile completeness score, optimize weak areas, and start applying to jobs.',
    duration: '3 min',
    icon: Search,
    color: 'from-red-500 to-red-600',
    animationFrames: [
      { label: 'Profile Score', detail: 'Check your profile completeness score (aim for 90%+)' },
      { label: 'Fix Gaps', detail: 'Fill any missing sections flagged by Naukri' },
      { label: 'Profile Photo', detail: 'Upload a professional photo for better visibility' },
      { label: 'Search Jobs', detail: 'Use search bar to find jobs matching your skills' },
      { label: 'Apply!', detail: 'Click "Apply" on relevant jobs and track applications' },
    ],
  },
];

// ─── Animation Player ────────────────────────────────────────────────────────

const StepAnimation: React.FC<{ step: Step; isOpen: boolean; onToggle: () => void }> = ({ step, isOpen, onToggle }) => {
  const [activeFrame, setActiveFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const startAnimation = () => {
    setActiveFrame(0);
    setIsPlaying(true);
    let frame = 0;
    intervalRef.current = setInterval(() => {
      frame++;
      if (frame >= step.animationFrames.length) {
        clearInterval(intervalRef.current!);
        setIsPlaying(false);
      } else {
        setActiveFrame(frame);
      }
    }, 2000);
  };

  const stopAnimation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPlaying(false);
  };

  React.useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const Icon = step.icon;

  return (
    <div className="bg-dark-800 border border-white/10 rounded-2xl overflow-hidden transition-all">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-mono">Step {step.id}</span>
            <span className="text-[10px] text-gray-600 flex items-center gap-1"><Clock className="w-3 h-3" />{step.duration}</span>
          </div>
          <p className="text-white font-semibold text-sm mt-0.5">{step.title}</p>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div className="px-5 pb-5 space-y-4">
          <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>

          {/* Animation Player */}
          <div className="bg-dark-900 border border-white/10 rounded-xl overflow-hidden">
            {/* Player Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <MonitorPlay className="w-4 h-4 text-neon-blue" />
                <span className="text-xs font-semibold text-gray-400">Step-by-Step Animation</span>
              </div>
              <button
                onClick={isPlaying ? stopAnimation : startAnimation}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isPlaying
                    ? 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20'
                    : 'bg-neon-blue/10 border border-neon-blue/30 text-neon-blue hover:bg-neon-blue/20'
                }`}
              >
                <Play className="w-3 h-3" />
                {isPlaying ? 'Stop' : 'Play Animation'}
              </button>
            </div>

            {/* Animation Display */}
            <div className="p-5">
              {/* Current Frame Display */}
              <div className="text-center py-8 px-4">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} mx-auto flex items-center justify-center mb-4 shadow-xl transition-all duration-500 ${isPlaying ? 'scale-110' : ''}`}>
                  <span className="text-3xl font-bold text-white">{activeFrame + 1}</span>
                </div>
                <p className="text-white font-bold text-lg">{step.animationFrames[activeFrame].label}</p>
                <p className="text-gray-400 text-sm mt-2">{step.animationFrames[activeFrame].detail}</p>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-center gap-1 mt-2">
                {step.animationFrames.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setActiveFrame(idx); stopAnimation(); }}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === activeFrame
                        ? 'w-8 bg-neon-blue'
                        : idx < activeFrame
                        ? 'w-3 bg-neon-blue/40'
                        : 'w-3 bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Steps List */}
            <div className="border-t border-white/10 px-4 py-3 space-y-1.5">
              {step.animationFrames.map((frame, idx) => (
                <button
                  key={idx}
                  onClick={() => { setActiveFrame(idx); stopAnimation(); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                    idx === activeFrame
                      ? 'bg-neon-blue/10 border border-neon-blue/30'
                      : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    idx < activeFrame
                      ? 'bg-green-500/20 text-green-400'
                      : idx === activeFrame
                      ? 'bg-neon-blue/20 text-neon-blue'
                      : 'bg-white/5 text-gray-600'
                  }`}>
                    {idx < activeFrame ? <CheckCircle className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${idx === activeFrame ? 'text-white' : 'text-gray-500'}`}>{frame.label}</p>
                    <p className={`text-[10px] truncate ${idx === activeFrame ? 'text-gray-400' : 'text-gray-600'}`}>{frame.detail}</p>
                  </div>
                  {idx === activeFrame && <ArrowRight className="w-3 h-3 text-neon-blue flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const NaukriProfileGuide: React.FC = () => {
  const [openStep, setOpenStep] = useState<number | null>(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center pb-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-neon-blue/30 flex items-center justify-center mx-auto mb-4">
          <MonitorPlay className="w-8 h-8 text-neon-blue" />
        </div>
        <h2 className="text-2xl font-bold text-white">Naukri Profile Creation Guide</h2>
        <p className="text-gray-400 mt-2 max-w-lg mx-auto text-sm">
          Follow these 10 steps to build a complete Naukri profile. Click on each step to see the animated walkthrough.
        </p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MonitorPlay className="w-4 h-4 text-neon-blue" />
            <span><span className="text-white font-semibold">10</span> Steps</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4 text-neon-purple" />
            <span><span className="text-white font-semibold">~34 min</span> Total</span>
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-3 max-w-3xl mx-auto">
        {STEPS.map((step) => (
          <StepAnimation
            key={step.id}
            step={step}
            isOpen={openStep === step.id}
            onToggle={() => setOpenStep(prev => prev === step.id ? null : step.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default NaukriProfileGuide;
