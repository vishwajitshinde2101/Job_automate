import React, { useState } from 'react';
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

  const [qaList, setQaList] = useState<QuestionAnswer[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const generateQA = async () => {
    if (!setup.topic || !setup.position) {
      setError('Please fill topic and position');
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Setup Form */}
        <div className="lg:col-span-1 bg-dark-800 border border-white/10 rounded-xl p-6 space-y-6 h-fit">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-neon-purple" />
            Setup
          </h3>

          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Topic / Technology *
            </label>
            <input
              type="text"
              value={setup.topic}
              onChange={(e) => setSetup({ ...setup, topic: e.target.value })}
              placeholder="e.g., React, Node.js, HR Communication"
              className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
            />
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Position / Role *
            </label>
            <input
              type="text"
              value={setup.position}
              onChange={(e) => setSetup({ ...setup, position: e.target.value })}
              placeholder="e.g., Frontend Developer, HR Manager"
              className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
            />
          </div>

          {/* Interview Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Interview Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSetup({ ...setup, interviewType: 'technical' })}
                className={`p-3 rounded-lg border transition-all text-sm ${
                  setup.interviewType === 'technical'
                    ? 'bg-neon-purple/10 border-neon-purple text-neon-purple'
                    : 'bg-dark-900 border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                Technical
              </button>
              <button
                onClick={() => setSetup({ ...setup, interviewType: 'hr' })}
                className={`p-3 rounded-lg border transition-all text-sm ${
                  setup.interviewType === 'hr'
                    ? 'bg-neon-purple/10 border-neon-purple text-neon-purple'
                    : 'bg-dark-900 border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                HR
              </button>
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Experience Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['fresher', '1-3', '3-5', '5+'].map((level) => (
                <button
                  key={level}
                  onClick={() => setSetup({ ...setup, experienceLevel: level as any })}
                  className={`p-2 rounded-lg border transition-all text-xs ${
                    setup.experienceLevel === level
                      ? 'bg-neon-blue/10 border-neon-blue text-neon-blue'
                      : 'bg-dark-900 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  {level === 'fresher' ? 'Fresher' : `${level} yrs`}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['basic', 'intermediate', 'advanced'].map((level) => (
                <button
                  key={level}
                  onClick={() => setSetup({ ...setup, difficulty: level as any })}
                  className={`p-2 rounded-lg border transition-all text-xs capitalize ${
                    setup.difficulty === level
                      ? 'bg-neon-purple/10 border-neon-purple text-neon-purple'
                      : 'bg-dark-900 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Number of Questions */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Number of Questions
            </label>
            <select
              value={setup.numberOfQuestions}
              onChange={(e) => setSetup({ ...setup, numberOfQuestions: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
            >
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={15}>15 Questions</option>
              <option value={20}>20 Questions</option>
              <option value={30}>30 Questions</option>
            </select>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateQA}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-purple to-purple-600 text-white font-semibold rounded-lg hover:from-neon-purple/90 hover:to-purple-600/90 transition-all disabled:opacity-50 shadow-lg shadow-neon-purple/20"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Q&A
              </>
            )}
          </button>

          {/* Info */}
          <div className="pt-4 border-t border-white/10">
            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-neon-blue" />
              What you'll get:
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Interview-ready questions</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Clear, correct answers</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Difficulty-based questions</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Role-specific content</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Q&A Display */}
        <div className="lg:col-span-2 bg-dark-800 border border-white/10 rounded-xl p-6">
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
                    {setup.topic} - {setup.position}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {setup.interviewType.toUpperCase()} • {setup.difficulty} • {qaList.length} Questions
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
    </div>
  );
};

export default InterviewQA;
