import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Play,
  StopCircle,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Trophy,
  TrendingUp,
  Target,
  Clock,
  User,
  Briefcase,
  FileText,
  RotateCw,
} from 'lucide-react';

interface InterviewSetup {
  mode: 'telephonic' | 'direct';
  type: 'hr' | 'technical';
  position: string;
  experienceLevel: 'fresher' | '1-3' | '3-5' | '5+';
  duration: number;
  skills: string;
}

interface Message {
  role: 'interviewer' | 'user';
  content: string;
  timestamp: Date;
}

interface InterviewSummary {
  type: string;
  mode: string;
  position: string;
  totalQuestions: number;
  questionsAnswered: number;
  timeTaken: string;
  scores: {
    communication: number;
    technicalKnowledge: number;
    confidence: number;
    overall: number;
  };
  strongPoints: string[];
  weakAreas: string[];
  improvements: string[];
  transcript: { question: string; answer: string }[];
}

const MockInterview: React.FC = () => {
  const [step, setStep] = useState<'setup' | 'interview' | 'summary'>('setup');
  const [setup, setSetup] = useState<InterviewSetup>({
    mode: 'direct',
    type: 'technical',
    position: '',
    experienceLevel: '1-3',
    duration: 20,
    skills: '',
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [summary, setSummary] = useState<InterviewSummary | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startInterview = async () => {
    if (!setup.position || !setup.skills) {
      setError('Please fill position and skills');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/interview/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(setup),
      });

      const data = await response.json();

      if (data.success) {
        setSessionId(data.sessionId);
        setMessages([
          {
            role: 'interviewer',
            content: data.greeting,
            timestamp: new Date(),
          },
          {
            role: 'interviewer',
            content: data.firstQuestion,
            timestamp: new Date(),
          },
        ]);
        setStep('interview');
        setStartTime(new Date());
      } else {
        throw new Error(data.error || 'Failed to start interview');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start interview');
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!currentAnswer.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: currentAnswer,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setCurrentAnswer('');
    setIsLoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/interview/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId,
          answer: currentAnswer,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.nextQuestion) {
          setMessages((prev) => [
            ...prev,
            {
              role: 'interviewer',
              content: data.nextQuestion,
              timestamp: new Date(),
            },
          ]);
        }

        if (data.completed) {
          // Interview completed, fetch summary
          endInterview();
        }
      } else {
        throw new Error(data.error || 'Failed to process answer');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit answer');
    } finally {
      setIsLoading(false);
    }
  };

  const endInterview = async () => {
    setIsLoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/interview/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId,
          startTime,
        }),
      });

      const data = await response.json();

      if (data.success && data.summary) {
        setSummary(data.summary);
        setStep('summary');
      } else {
        throw new Error(data.error || 'Failed to get summary');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to end interview');
    } finally {
      setIsLoading(false);
    }
  };

  const resetInterview = () => {
    setStep('setup');
    setMessages([]);
    setCurrentAnswer('');
    setSessionId('');
    setStartTime(null);
    setSummary(null);
    setError('');
  };

  const getScoreColor = (score: number): string => {
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-neon-blue" />
            AI Mock Interview
          </h2>
          <p className="text-gray-400 mt-1">
            Practice with AI-powered realistic interview simulations
          </p>
        </div>
        {step !== 'setup' && (
          <button
            onClick={resetInterview}
            className="flex items-center gap-2 px-4 py-2 bg-dark-800 border border-white/10 rounded-lg hover:bg-dark-700 transition-colors text-gray-400 hover:text-white"
          >
            <RotateCw className="w-4 h-4" />
            New Interview
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Setup Step */}
      {step === 'setup' && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-dark-800 border border-white/10 rounded-xl p-8 space-y-6">
            <h3 className="text-xl font-semibold text-white mb-6">Interview Setup</h3>

            <div className="grid grid-cols-2 gap-6">
              {/* Interview Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Interview Mode *
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSetup({ ...setup, mode: 'telephonic' })}
                    className={`flex-1 p-4 rounded-lg border transition-all ${
                      setup.mode === 'telephonic'
                        ? 'bg-neon-blue/10 border-neon-blue text-neon-blue'
                        : 'bg-dark-900 border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    Telephonic
                  </button>
                  <button
                    onClick={() => setSetup({ ...setup, mode: 'direct' })}
                    className={`flex-1 p-4 rounded-lg border transition-all ${
                      setup.mode === 'direct'
                        ? 'bg-neon-blue/10 border-neon-blue text-neon-blue'
                        : 'bg-dark-900 border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    Direct/Onsite
                  </button>
                </div>
              </div>

              {/* Interview Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Interview Type *
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSetup({ ...setup, type: 'hr' })}
                    className={`flex-1 p-4 rounded-lg border transition-all ${
                      setup.type === 'hr'
                        ? 'bg-neon-purple/10 border-neon-purple text-neon-purple'
                        : 'bg-dark-900 border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    HR
                  </button>
                  <button
                    onClick={() => setSetup({ ...setup, type: 'technical' })}
                    className={`flex-1 p-4 rounded-lg border transition-all ${
                      setup.type === 'technical'
                        ? 'bg-neon-purple/10 border-neon-purple text-neon-purple'
                        : 'bg-dark-900 border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    Technical
                  </button>
                </div>
              </div>
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Job Position *
              </label>
              <input
                type="text"
                value={setup.position}
                onChange={(e) => setSetup({ ...setup, position: e.target.value })}
                placeholder="e.g., Senior React Developer, HR Manager"
                className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-neon-blue focus:outline-none"
              />
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Experience Level *
              </label>
              <div className="grid grid-cols-4 gap-3">
                {['fresher', '1-3', '3-5', '5+'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSetup({ ...setup, experienceLevel: level as any })}
                    className={`p-3 rounded-lg border transition-all text-sm ${
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

            {/* Skills/Summary */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Skills & Experience Summary *
              </label>
              <textarea
                value={setup.skills}
                onChange={(e) => setSetup({ ...setup, skills: e.target.value })}
                placeholder="e.g., React, Node.js, 2 years experience in MERN stack, worked on e-commerce projects"
                rows={4}
                className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-neon-blue focus:outline-none resize-none"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Interview Duration (minutes)
              </label>
              <select
                value={setup.duration}
                onChange={(e) => setSetup({ ...setup, duration: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-neon-blue focus:outline-none"
              >
                <option value={10}>10 minutes (5-7 questions)</option>
                <option value={20}>20 minutes (8-12 questions)</option>
                <option value={30}>30 minutes (12-18 questions)</option>
              </select>
            </div>

            <button
              onClick={startInterview}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-neon-blue to-blue-600 text-white font-semibold rounded-lg hover:from-neon-blue/90 hover:to-blue-600/90 transition-all disabled:opacity-50 shadow-lg shadow-neon-blue/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Starting Interview...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Start Mock Interview
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Interview Step */}
      {step === 'interview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2 bg-dark-800 border border-white/10 rounded-xl flex flex-col h-[700px]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-neon-blue text-black'
                        : 'bg-dark-900 text-white border border-white/10'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <span className="text-xs opacity-60 mt-2 block">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-dark-900 border border-white/10 p-4 rounded-lg">
                    <Loader2 className="w-5 h-5 text-neon-blue animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-3">
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      submitAnswer();
                    }
                  }}
                  placeholder="Type your answer here... (Press Enter to send)"
                  rows={3}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-neon-blue focus:outline-none resize-none disabled:opacity-50"
                />
                <div className="flex flex-col gap-2">
                  <button
                    onClick={submitAnswer}
                    disabled={!currentAnswer.trim() || isLoading}
                    className="px-4 py-3 bg-neon-blue text-black rounded-lg hover:bg-neon-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                  <button
                    onClick={endInterview}
                    disabled={isLoading}
                    className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <StopCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="bg-dark-800 border border-white/10 rounded-xl p-6 space-y-6 h-fit">
            <h3 className="text-lg font-semibold text-white">Interview Info</h3>

            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Mode:</span>
                <span className="text-white capitalize">{setup.mode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="text-white uppercase">{setup.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Position:</span>
                <span className="text-white">{setup.position}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Duration:</span>
                <span className="text-white">{setup.duration} mins</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Questions:</span>
                <span className="text-white">{Math.floor(messages.length / 2)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <h4 className="text-sm font-semibold text-white mb-3">Tips:</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Answer clearly and concisely</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Use examples from experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Stay calm and confident</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Ask for clarification if needed</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Summary Step */}
      {step === 'summary' && summary && (
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Scores */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-dark-800 border border-white/10 rounded-xl p-6 text-center">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
              <div className={`text-4xl font-bold mb-2 ${getScoreColor(summary.scores.overall)}`}>
                {summary.scores.overall}/10
              </div>
              <p className="text-gray-400 text-sm">Overall Score</p>
            </div>

            <div className="bg-dark-800 border border-white/10 rounded-xl p-6 text-center">
              <User className="w-8 h-8 text-neon-blue mx-auto mb-3" />
              <div className={`text-3xl font-bold mb-2 ${getScoreColor(summary.scores.communication)}`}>
                {summary.scores.communication}/10
              </div>
              <p className="text-gray-400 text-sm">Communication</p>
            </div>

            <div className="bg-dark-800 border border-white/10 rounded-xl p-6 text-center">
              <Briefcase className="w-8 h-8 text-neon-purple mx-auto mb-3" />
              <div className={`text-3xl font-bold mb-2 ${getScoreColor(summary.scores.technicalKnowledge)}`}>
                {summary.scores.technicalKnowledge}/10
              </div>
              <p className="text-gray-400 text-sm">Technical Knowledge</p>
            </div>

            <div className="bg-dark-800 border border-white/10 rounded-xl p-6 text-center">
              <Target className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <div className={`text-3xl font-bold mb-2 ${getScoreColor(summary.scores.confidence)}`}>
                {summary.scores.confidence}/10
              </div>
              <p className="text-gray-400 text-sm">Confidence</p>
            </div>
          </div>

          {/* Info */}
          <div className="bg-dark-800 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Interview Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-400 mb-1">Type</p>
                <p className="text-white font-semibold">{summary.type}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Mode</p>
                <p className="text-white font-semibold">{summary.mode}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Questions</p>
                <p className="text-white font-semibold">{summary.totalQuestions}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Duration</p>
                <p className="text-white font-semibold">{summary.timeTaken}</p>
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strong Points */}
            <div className="bg-dark-800 border border-green-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Strong Points
              </h3>
              <ul className="space-y-2">
                {summary.strongPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weak Areas */}
            <div className="bg-dark-800 border border-yellow-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                Areas to Improve
              </h3>
              <ul className="space-y-2">
                {summary.weakAreas.map((area, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Improvements */}
          <div className="bg-dark-800 border border-neon-blue/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-neon-blue" />
              Actionable Improvements
            </h3>
            <ul className="space-y-3">
              {summary.improvements.map((improvement, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                  <span className="px-2 py-1 bg-neon-blue/10 text-neon-blue rounded text-xs font-semibold flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Transcript */}
          <div className="bg-dark-800 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" />
              Interview Transcript
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {summary.transcript.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="bg-dark-900 border border-white/10 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Q{idx + 1}:</p>
                    <p className="text-sm text-white">{item.question}</p>
                  </div>
                  <div className="bg-neon-blue/5 border border-neon-blue/20 rounded-lg p-3 ml-6">
                    <p className="text-xs text-gray-500 mb-1">A{idx + 1}:</p>
                    <p className="text-sm text-gray-300">{item.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={resetInterview}
              className="flex items-center gap-2 px-6 py-3 bg-neon-blue text-black font-semibold rounded-lg hover:bg-neon-blue/90 transition-colors"
            >
              <RotateCw className="w-5 h-5" />
              Start New Interview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockInterview;
