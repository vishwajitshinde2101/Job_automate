import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Sparkles,
  Loader2,
  Download,
  Copy,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Target,
  TrendingUp,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

interface QASetup {
  topic: string;
  position: string;
  interviewType: 'hr' | 'technical';
  experienceLevel: 'fresher' | '1-3' | '3-5' | '5+';
  difficulty: 'basic' | 'intermediate' | 'advanced';
  numberOfQuestions: number;
}

interface QuestionAnswer {
  question: string;
  answer: string;
}

const InterviewQA: React.FC = () => {
  const [setup, setSetup] = useState<QASetup>({
    topic: '',
    position: '',
    interviewType: 'technical',
    experienceLevel: '1-3',
    difficulty: 'intermediate',
    numberOfQuestions: 10,
  });
  const [profileLoading, setProfileLoading] = useState(true);

  // Fetch profile data from DB
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { setProfileLoading(false); return; }
        const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

        const [settingsRes, skillsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/job-settings`, { headers }),
          fetch(`${API_BASE_URL}/skills`, { headers }),
        ]);

        const settingsData = await settingsRes.json();
        const skillsData = await skillsRes.json();

        const s = settingsData?.settings || settingsData;
        const skillsList = (skillsData?.skills || []).map((sk: any) => sk.displayName || sk.skillName).filter(Boolean);

        const yrs = s?.yearsOfExperience ?? 0;
        let expLevel: 'fresher' | '1-3' | '3-5' | '5+' = 'fresher';
        if (yrs >= 5) expLevel = '5+';
        else if (yrs >= 3) expLevel = '3-5';
        else if (yrs >= 1) expLevel = '1-3';

        setSetup(prev => ({
          ...prev,
          position: s?.targetRole || prev.position,
          topic: skillsList.length > 0 ? skillsList.join(', ') : prev.topic,
          experienceLevel: expLevel,
        }));
      } catch (err) {
        console.error('Failed to fetch profile for Q&A:', err);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const [qaList, setQaList] = useState<QuestionAnswer[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const generateQA = async () => {
    if (!setup.topic) {
      setError('Please enter a topic / technology');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccess('');

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/interview/generate-qa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(setup),
      });

      const data = await response.json();

      if (data.success && data.questions) {
        setQaList(data.questions);
        setSuccess(`Generated ${data.questions.length} questions successfully!`);
      } else {
        throw new Error(data.error || 'Failed to generate questions');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate Q&A');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    const text = qaList
      .map((qa, idx) => `Q${idx + 1}. ${qa.question}\n\nAnswer:\n${qa.answer}\n\n`)
      .join('---\n\n');

    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const downloadAsPDF = () => {
    const text = qaList
      .map((qa, idx) => `Q${idx + 1}. ${qa.question}\n\nAnswer:\n${qa.answer}\n\n`)
      .join('---\n\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${setup.topic.replace(/\s+/g, '_')}_Interview_QA.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-7 h-7 text-neon-purple" />
            Interview Questions & Answers
          </h2>
          <p className="text-gray-400 mt-1">
            Get topic-specific interview questions with detailed answers
          </p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Topic + Generate */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            value={setup.topic}
            onChange={(e) => setSetup({ ...setup, topic: e.target.value })}
            placeholder="Topic / Technology (e.g., React, Spring Boot, HR)"
            className="w-full px-4 py-3 bg-dark-800 border border-white/10 rounded-xl text-white text-sm focus:border-neon-purple focus:outline-none placeholder-gray-600"
          />
        </div>
        <button
          onClick={generateQA}
          disabled={isGenerating || profileLoading}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-purple to-purple-600 text-white font-semibold rounded-xl hover:from-neon-purple/90 hover:to-purple-600/90 transition-all disabled:opacity-50 shadow-lg shadow-neon-purple/20"
        >
          {profileLoading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Loading...</>
          ) : isGenerating ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
          ) : (
            <><Sparkles className="w-5 h-5" /> Generate Q&A</>
          )}
        </button>
      </div>

      {/* Q&A Display */}
      <div className="bg-dark-800 border border-white/10 rounded-xl p-6">
          {qaList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <HelpCircle className="w-16 h-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No Questions Yet</h3>
              <p className="text-gray-500">
                Fill in the form and click "Generate Q&A" to get interview questions with answers
              </p>
            </div>
          ) : (
            <>
              {/* Header with Actions */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {setup.topic}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {qaList.length} Questions
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 bg-dark-900 border border-white/10 rounded-lg hover:bg-dark-700 transition-colors text-sm text-gray-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                  <button
                    onClick={downloadAsPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-neon-blue text-black rounded-lg hover:bg-neon-blue/90 transition-colors text-sm font-semibold"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>

              {/* Questions & Answers */}
              <div className="space-y-6 max-h-[700px] overflow-y-auto pr-2">
                {qaList.map((qa, idx) => (
                  <div key={idx} className="bg-dark-900 border border-white/10 rounded-lg p-5">
                    {/* Question */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="px-2 py-1 bg-neon-purple/10 text-neon-purple rounded text-xs font-semibold flex-shrink-0">
                        Q{idx + 1}
                      </div>
                      <p className="text-white font-medium text-sm">{qa.question}</p>
                    </div>

                    {/* Answer */}
                    <div className="pl-9">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-semibold text-gray-400">Answer:</span>
                      </div>
                      <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {qa.answer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Tip */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="bg-neon-blue/5 border border-neon-blue/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-neon-blue flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-white font-semibold text-sm mb-1">Pro Tip</h4>
                      <p className="text-gray-400 text-xs">
                        Practice these questions out loud. Understanding the concepts is important, but
                        being able to explain them clearly is what matters in interviews!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
    </div>
  );
};

export default InterviewQA;
