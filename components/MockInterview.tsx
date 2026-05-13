import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic, MicOff, PhoneOff, Volume2, VolumeX,
  User, Clock, Target, Trophy, CheckCircle, AlertCircle,
  TrendingUp, FileText, RotateCw, ChevronDown, ChevronUp,
  Loader2, Play, Users, Code2,
  Briefcase, Send,
} from 'lucide-react';
import { fetchWithTimeout, API_BASE_URL } from '../src/utils/apiClient';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTimer = (secs: number) => {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const ScoreBar: React.FC<{ label: string; score: number; color: string }> = ({ label, score, color }) => (
  <div>
    <div className="flex justify-between mb-1.5">
      <span className="text-sm text-gray-300">{label}</span>
      <span className="text-sm font-bold text-white">{score}/10</span>
    </div>
    <div className="w-full h-2.5 bg-dark-900 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${score * 10}%` }} />
    </div>
  </div>
);

// ─── Waveform bars ─────────────────────────────────────────────────────────────

const Waveform: React.FC<{ color?: string }> = ({ color = 'bg-neon-blue' }) => (
  <span className="flex items-end gap-0.5 h-4">
    {[3, 6, 9, 6, 3].map((h, i) => (
      <span
        key={i}
        className={`w-0.5 rounded-full ${color} animate-bounce`}
        style={{ height: `${h}px`, animationDelay: `${i * 80}ms` }}
      />
    ))}
  </span>
);

// ─── Component ───────────────────────────────────────────────────────────────

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
  const [elapsed, setElapsed] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [endConfirm, setEndConfirm] = useState(false);

  // ── Voice state ────────────────────────────────────────────────────────────
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [currentCaption, setCurrentCaption] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const speakerEnabledRef = useRef(true);
  const isRecordingRef = useRef(false);
  const answerRef = useRef<HTMLTextAreaElement>(null);

  const [profileLoading, setProfileLoading] = useState(true);

  const questionsAnswered = messages.filter(m => m.role === 'user').length;
  const maxQ = Math.floor(setup.duration / 2);

  // ── Fetch profile data from DB ────────────────────────────────────────────

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const t = localStorage.getItem('token');
        if (!t) { setProfileLoading(false); return; }
        const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` };

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
          experienceLevel: expLevel,
          skills: skillsList.length > 0 ? skillsList.join(', ') : prev.skills,
        }));
      } catch (err) {
        console.error('Failed to fetch profile for interview:', err);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // ── Init speech APIs ───────────────────────────────────────────────────────

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      const rec = new SR();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-IN';
      recognitionRef.current = rec;
      setSpeechSupported(true);
    }
    return () => {
      if (synthRef.current) synthRef.current.cancel();
      isRecordingRef.current = false;
      try { recognitionRef.current?.stop(); } catch (_) {}
    };
  }, []);

  // Keep ref in sync with state
  useEffect(() => { speakerEnabledRef.current = speakerEnabled; }, [speakerEnabled]);

  // ── Auto-scroll ────────────────────────────────────────────────────────────

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // ── Timer ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (step === 'interview') {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (step !== 'interview') setElapsed(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step]);

  const token = localStorage.getItem('token') || '';
  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  // ── TTS: Speak text ────────────────────────────────────────────────────────

  const speakText = useCallback((text: string, onEnd?: () => void) => {
    if (!synthRef.current) { onEnd?.(); return; }
    synthRef.current.cancel();
    if (!speakerEnabledRef.current) { onEnd?.(); return; }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.88;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Prefer a natural English voice
    const voices = window.speechSynthesis.getVoices();
    const voice =
      voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Microsoft'))) ||
      voices.find(v => v.lang.startsWith('en'));
    if (voice) utterance.voice = voice;

    setAiSpeaking(true);
    setCurrentCaption(text);

    utterance.onend = () => { setAiSpeaking(false); setCurrentCaption(''); onEnd?.(); };
    utterance.onerror = () => { setAiSpeaking(false); setCurrentCaption(''); onEnd?.(); };
    synthRef.current.speak(utterance);
  }, []);

  // ── STT: Toggle mic ────────────────────────────────────────────────────────

  const toggleMic = () => {
    if (isRecording) {
      isRecordingRef.current = false;
      try { recognitionRef.current?.stop(); } catch (_) {}
      setIsRecording(false);
    } else {
      if (!recognitionRef.current || isLoading || aiSpeaking) return;
      // Stop AI if speaking
      if (synthRef.current) { synthRef.current.cancel(); setAiSpeaking(false); setCurrentCaption(''); }

      setCurrentAnswer('');
      isRecordingRef.current = true;

      recognitionRef.current.onresult = (event: any) => {
        let text = '';
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript + ' ';
        }
        setCurrentAnswer(text.trim());
      };

      recognitionRef.current.onerror = () => {
        isRecordingRef.current = false;
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        // Auto-restart if still supposed to be recording
        if (isRecordingRef.current) {
          try { recognitionRef.current.start(); } catch (_) {}
        } else {
          setIsRecording(false);
        }
      };

      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (_) {}
    }
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    try { recognitionRef.current?.stop(); } catch (_) {}
    setIsRecording(false);
  };

  const toggleSpeaker = () => {
    if (speakerEnabled && synthRef.current) {
      synthRef.current.cancel();
      setAiSpeaking(false);
      setCurrentCaption('');
    }
    setSpeakerEnabled(prev => !prev);
  };

  // ── Start Interview ────────────────────────────────────────────────────────

  const startInterview = async () => {
    if (!setup.position.trim()) {
      setError('Please fill in Job Position');
      return;
    }
    setIsLoading(true);
    setError('');

    // Go to Teams UI immediately, then fetch first question from API
    setStartTime(new Date());
    setStep('interview');

    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/interview/start`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(setup),
        timeout: 30000,
      });
      const data = await response.json();
      if (data.success) {
        setSessionId(data.sessionId);
        setMessages([
          { role: 'interviewer', content: data.greeting, timestamp: new Date() },
          { role: 'interviewer', content: data.firstQuestion, timestamp: new Date() },
        ]);
        setTimeout(() => speakText(`${data.greeting} ${data.firstQuestion}`), 600);
      } else {
        throw new Error(data.error || 'Failed to start interview');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Submit Answer ──────────────────────────────────────────────────────────

  const submitAnswer = async () => {
    const trimmed = currentAnswer.trim();
    if (!trimmed || isLoading) return;
    stopRecording();

    setMessages(prev => [...prev, { role: 'user', content: trimmed, timestamp: new Date() }]);
    setCurrentAnswer('');
    setIsLoading(true);

    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/interview/answer`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ sessionId, answer: trimmed }),
        timeout: 30000,
      });
      const data = await response.json();
      if (data.success) {
        if (data.nextQuestion) {
          setMessages(prev => [
            ...prev,
            { role: 'interviewer', content: data.nextQuestion, timestamp: new Date() },
          ]);
          speakText(`Hmm, okay. ${data.nextQuestion}`);
        }
        if (data.completed) endInterview();
      } else {
        throw new Error(data.error || 'Failed to process answer');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit answer');
    } finally {
      setIsLoading(false);
    }
  };

  // ── End Interview ──────────────────────────────────────────────────────────

  const endInterview = async () => {
    setEndConfirm(false);
    stopRecording();
    if (synthRef.current) synthRef.current.cancel();
    setAiSpeaking(false);
    setIsLoading(true);
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/interview/end`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ sessionId, startTime }),
        timeout: 45000,
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
    stopRecording();
    if (synthRef.current) synthRef.current.cancel();
    setStep('setup');
    setMessages([]);
    setCurrentAnswer('');
    setSessionId('');
    setStartTime(null);
    setSummary(null);
    setError('');
    setElapsed(0);
    setShowTranscript(false);
    setEndConfirm(false);
    setAiSpeaking(false);
    setCurrentCaption('');
  };

  const getScoreColor = (s: number) => s >= 8 ? 'text-green-400' : s >= 6 ? 'text-yellow-400' : 'text-red-400';
  const getBarColor = (s: number) => s >= 8 ? 'bg-green-500' : s >= 6 ? 'bg-yellow-500' : 'bg-red-500';

  // ══════════════════════════════════════════════════════════════════
  //  SETUP SCREEN  —  Teams-style pre-join room
  // ══════════════════════════════════════════════════════════════════

  if (step === 'setup') {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <div className="w-full max-w-lg space-y-5">

          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-neon-blue" />
            </div>
            <h2 className="text-2xl font-bold text-white">Mock Interview</h2>
            <p className="text-sm text-gray-500 mt-1">Your profile is loaded. Choose interview type and start.</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          {/* Profile Info Card */}
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-5 space-y-3">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Your Profile</p>

            {profileLoading ? (
              <div className="flex items-center justify-center py-6 gap-2 text-gray-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading profile...
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 bg-dark-900 border border-white/10 rounded-xl px-4 py-3">
                  <Briefcase className="w-4 h-4 text-neon-blue flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Position</p>
                    <p className="text-sm text-white truncate">{setup.position || <span className="text-gray-600 italic">Not set</span>}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-dark-900 border border-white/10 rounded-xl px-4 py-3">
                  <TrendingUp className="w-4 h-4 text-neon-purple flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Experience</p>
                    <p className="text-sm text-white">{setup.experienceLevel === 'fresher' ? 'Fresher' : `${setup.experienceLevel} years`}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-dark-900 border border-white/10 rounded-xl px-4 py-3">
                  <Code2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Skills</p>
                    <p className="text-sm text-white leading-relaxed">{setup.skills || <span className="text-gray-600 italic">Not set</span>}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interview Type */}
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-5">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Interview Type</p>
            <div className="grid grid-cols-2 gap-2.5">
              {([
                { val: 'hr', label: 'HR Round', sub: 'Soft skills', Icon: Users },
                { val: 'technical', label: 'Technical', sub: 'Concepts & code', Icon: Code2 },
              ] as const).map(({ val, label, sub, Icon }) => (
                <button
                  key={val}
                  onClick={() => setSetup({ ...setup, type: val })}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                    setup.type === val
                      ? 'bg-neon-purple/10 border-neon-purple text-white'
                      : 'bg-dark-900 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${setup.type === val ? 'bg-neon-purple/20' : 'bg-white/5'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm leading-tight">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
                  </div>
                  {setup.type === val && <CheckCircle className="w-4 h-4 text-neon-purple ml-auto flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Start button */}
          <button
            onClick={startInterview}
            disabled={isLoading || profileLoading}
            className="w-full flex items-center justify-center gap-2.5 py-4 bg-gradient-to-r from-neon-blue to-blue-600 text-white font-bold rounded-xl hover:from-neon-blue/90 hover:to-blue-600/90 transition-all disabled:opacity-50 shadow-lg shadow-neon-blue/20 text-base"
          >
            {isLoading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Starting interview…</>
            ) : (
              <><Play className="w-5 h-5" /> Start Interview</>
            )}
          </button>

          {/* Voice support hint */}
          <p className="text-center text-[11px] text-gray-600">
            {speechSupported
              ? '🎙️ Voice supported — AI will speak questions, you can answer by voice or text'
              : '⌨️ Voice not supported in your browser — type your answers'}
          </p>

        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  //  INTERVIEW SCREEN  —  Teams-like video call UI
  // ══════════════════════════════════════════════════════════════════

  if (step === 'interview') {
    return (
      <div className="flex flex-col" style={{ height: 'calc(100vh - 160px)', minHeight: '620px' }}>

        {/* ── Top meeting bar ── */}
        <div className="flex items-center justify-between px-5 py-3 bg-gray-900 border border-b-0 border-white/10 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              <span className="text-[11px] text-red-400 font-semibold tracking-wide">LIVE</span>
            </span>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">
                {setup.type === 'technical' ? '⚙️ Technical' : '👥 HR'} · {setup.position}
              </p>
              <p className="text-[11px] text-gray-500">
                {setup.experienceLevel === 'fresher' ? 'Fresher' : `${setup.experienceLevel} yrs`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Target className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-mono text-white">
                {questionsAnswered}<span className="text-gray-600">/{maxQ}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-800 border border-white/10 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-neon-blue" />
              <span className="text-sm font-mono text-white">{formatTimer(elapsed)}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border-x border-red-500/20 text-xs text-red-400 flex-shrink-0">
            <AlertCircle className="w-3 h-3 flex-shrink-0" /> {error}
            <button onClick={() => setError('')} className="ml-auto text-gray-600 hover:text-white">✕</button>
          </div>
        )}

        {/* ── Main area ── */}
        <div className="flex flex-1 min-h-0 border-x border-white/10">

          {/* ─── Call area (left) ─── */}
          <div className="flex-1 relative bg-[#0d1117] flex flex-col items-center justify-center overflow-hidden">

            {/* Subtle dot-grid */}
            <div className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />

            {/* AI Avatar */}
            <div className="relative flex flex-col items-center z-10">

              {/* Speaking pulse rings */}
              {aiSpeaking && (
                <>
                  <span className="absolute inset-0 rounded-full animate-ping bg-neon-blue/20"
                    style={{ width: '128px', height: '128px', animationDuration: '1.2s' }} />
                  <span className="absolute rounded-full animate-ping bg-neon-blue/10"
                    style={{ width: '160px', height: '160px', top: '-16px', left: '-16px', animationDuration: '1.2s', animationDelay: '0.4s' }} />
                </>
              )}

              <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                aiSpeaking
                  ? 'bg-gradient-to-br from-neon-blue/30 to-blue-900/40 border-2 border-neon-blue shadow-2xl shadow-neon-blue/40'
                  : isLoading
                  ? 'bg-gradient-to-br from-yellow-500/10 to-amber-900/20 border-2 border-yellow-500/30'
                  : 'bg-gradient-to-br from-white/5 to-white/10 border-2 border-white/15'
              }`}>
                {isLoading ? (
                  <Loader2 className="w-14 h-14 text-yellow-400/60 animate-spin" />
                ) : (
                  <Briefcase className={`w-14 h-14 transition-colors ${aiSpeaking ? 'text-neon-blue' : 'text-gray-500'}`} />
                )}
              </div>

              <div className="mt-5 text-center">
                <p className="text-white font-semibold">AI Interviewer</p>
                <div className="flex items-center justify-center gap-2 mt-1.5 h-5">
                  {isLoading && (
                    <span className="flex items-center gap-1.5 text-xs text-yellow-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                      Thinking…
                    </span>
                  )}
                  {aiSpeaking && (
                    <span className="flex items-center gap-2 text-xs text-neon-blue">
                      <Volume2 className="w-3.5 h-3.5" />
                      Speaking
                      <Waveform color="bg-neon-blue" />
                    </span>
                  )}
                  {!isLoading && !aiSpeaking && messages.length > 0 && (
                    <span className="text-xs text-gray-600">Listening for your answer…</span>
                  )}
                  {!isLoading && !aiSpeaking && messages.length === 0 && (
                    <span className="text-xs text-gray-600">Waiting to connect…</span>
                  )}
                </div>
              </div>
            </div>

            {/* Caption strip */}
            {currentCaption && (
              <div className="absolute bottom-24 left-8 right-8 z-10">
                <div className="bg-black/80 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10">
                  <p className="text-white text-sm text-center leading-relaxed">
                    {currentCaption.length > 160 ? currentCaption.slice(0, 160) + '…' : currentCaption}
                  </p>
                </div>
              </div>
            )}

            {/* User tile — bottom-right */}
            <div className="absolute bottom-4 right-4 z-10">
              <div className={`w-24 h-16 rounded-xl border flex flex-col items-center justify-center gap-1 relative overflow-hidden transition-all ${
                isRecording
                  ? 'bg-dark-800 border-green-500/60 shadow-lg shadow-green-500/20'
                  : 'bg-dark-800 border-white/15'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isRecording ? 'bg-green-500/20' : 'bg-white/10'}`}>
                  <User className={`w-4 h-4 ${isRecording ? 'text-green-400' : 'text-gray-400'}`} />
                </div>
                <p className="text-[9px] text-gray-500">You</p>
                {isRecording && (
                  <div className="absolute bottom-1.5 flex items-end gap-0.5">
                    <Waveform color="bg-green-400" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── Chat sidebar (right) ─── */}
          <div className="w-72 flex flex-col bg-dark-900 border-l border-white/10">

            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between flex-shrink-0">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Interview Chat</p>
              <span className="text-xs text-gray-600">{questionsAnswered}/{maxQ} Q</span>
            </div>

            {/* Progress bar */}
            <div className="px-4 py-2 border-b border-white/10 flex-shrink-0">
              <div className="w-full h-1 bg-dark-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-neon-blue to-blue-600 rounded-full transition-all"
                  style={{ width: `${Math.min((questionsAnswered / maxQ) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-3"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}
            >
              {messages.map((msg, idx) => (
                <div key={idx} className={msg.role === 'user' ? 'ml-4' : 'mr-4'}>
                  <p className={`text-[10px] font-semibold mb-1 uppercase tracking-wide ${
                    msg.role === 'interviewer' ? 'text-neon-blue' : 'text-neon-purple'
                  }`}>
                    {msg.role === 'interviewer' ? 'Interviewer' : 'You'}
                  </p>
                  <div className={`px-3 py-2.5 rounded-xl text-xs leading-relaxed ${
                    msg.role === 'interviewer'
                      ? 'bg-dark-800 border border-white/10 text-gray-200 rounded-tl-none'
                      : 'bg-neon-purple/10 border border-neon-purple/20 text-gray-200 rounded-tr-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="mr-4">
                  <p className="text-[10px] font-semibold mb-1 uppercase tracking-wide text-neon-blue">Interviewer</p>
                  <div className="px-3 py-2.5 rounded-xl rounded-tl-none bg-dark-800 border border-white/10 inline-flex gap-1.5 items-center">
                    {[0, 150, 300].map(d => (
                      <span key={d} className="w-1.5 h-1.5 rounded-full bg-neon-blue/60 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Text input — fallback / override */}
            <div className="border-t border-white/10 p-3 flex-shrink-0">
              <div className="flex gap-2">
                <textarea
                  ref={answerRef}
                  value={currentAnswer}
                  onChange={e => setCurrentAnswer(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitAnswer(); }
                  }}
                  placeholder={isRecording ? '🎤 Listening…' : 'Type or use mic ↓'}
                  rows={2}
                  disabled={isLoading}
                  className="flex-1 bg-dark-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white resize-none focus:outline-none focus:border-neon-blue/40 placeholder-gray-600 disabled:opacity-50"
                  style={{ maxHeight: '80px', scrollbarWidth: 'none' }}
                />
                <button
                  onClick={submitAnswer}
                  disabled={!currentAnswer.trim() || isLoading}
                  className="w-9 rounded-xl bg-neon-blue flex items-center justify-center text-black hover:bg-neon-blue/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom control bar ── */}
        <div className="flex items-center justify-center gap-6 px-6 py-4 bg-gray-900 border border-t-0 border-white/10 rounded-b-2xl flex-shrink-0">

          {/* Mic */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={toggleMic}
              disabled={isLoading || aiSpeaking || !speechSupported}
              title={speechSupported ? (isRecording ? 'Stop recording' : 'Speak your answer') : 'Voice not supported'}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all relative ${
                isRecording
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/40 scale-105'
                  : speechSupported
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                  : 'bg-gray-800 text-gray-600 cursor-not-allowed opacity-50'
              }`}
            >
              {isRecording && <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping" />}
              {isRecording ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>
            <span className="text-[10px] text-gray-500">
              {isRecording ? 'Tap to stop' : 'Tap to speak'}
            </span>
          </div>

          {/* Speaker */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={toggleSpeaker}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                speakerEnabled
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-red-500/20 text-red-400 border border-red-500/40'
              }`}
            >
              {speakerEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <span className="text-[10px] text-gray-500">{speakerEnabled ? 'Speaker on' : 'Muted'}</span>
          </div>

          <div className="w-px h-10 bg-white/10" />

          {/* End call */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => setEndConfirm(true)}
              disabled={isLoading}
              className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-all disabled:opacity-50 shadow-lg shadow-red-600/30"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
            <span className="text-[10px] text-gray-500">End call</span>
          </div>
        </div>

        {/* ── End interview modal ── */}
        {endConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-dark-800 border border-white/15 rounded-2xl p-6 w-72 text-center shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                <PhoneOff className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-white font-semibold mb-1">End Interview?</p>
              <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                This will end the session and generate your performance report.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setEndConfirm(false)}
                  className="py-2.5 bg-dark-900 border border-white/10 text-gray-300 rounded-xl text-sm hover:text-white transition-colors"
                >
                  Continue
                </button>
                <button
                  onClick={endInterview}
                  className="py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
                >
                  End Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  //  SUMMARY SCREEN  —  post-meeting results
  // ══════════════════════════════════════════════════════════════════

  if (step === 'summary' && summary) {
    return (
      <div className="space-y-5 max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Interview Complete!</h2>
          <p className="text-gray-400 text-sm mt-1">
            {summary.position} · {summary.type} · {summary.timeTaken}
          </p>
        </div>

        {/* Score section */}
        <div className="bg-dark-800 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between flex-wrap gap-6">

            {/* Overall ring */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-28 h-28">
                <svg width="112" height="112" viewBox="0 0 112 112">
                  <circle cx="56" cy="56" r="46" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                  <circle
                    cx="56" cy="56" r="46"
                    fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${(summary.scores.overall / 10) * 289} 289`}
                    strokeDashoffset="72"
                    className={getScoreColor(summary.scores.overall)}
                    style={{ transition: 'stroke-dasharray 1s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold ${getScoreColor(summary.scores.overall)}`}>{summary.scores.overall}</span>
                  <span className="text-xs text-gray-500">/10</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-white">Overall Score</p>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                summary.scores.overall >= 8
                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                  : summary.scores.overall >= 6
                  ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {summary.scores.overall >= 8 ? 'Excellent' : summary.scores.overall >= 6 ? 'Good' : 'Needs Work'}
              </span>
            </div>

            {/* Score bars */}
            <div className="flex-1 min-w-[220px] space-y-4">
              <ScoreBar label="Communication" score={summary.scores.communication} color={getBarColor(summary.scores.communication)} />
              <ScoreBar label="Technical Knowledge" score={summary.scores.technicalKnowledge} color={getBarColor(summary.scores.technicalKnowledge)} />
              <ScoreBar label="Confidence" score={summary.scores.confidence} color={getBarColor(summary.scores.confidence)} />
            </div>

            {/* Stats */}
            <div className="flex flex-col gap-2.5 min-w-[120px]">
              {[
                { icon: FileText, label: 'Questions', val: String(summary.questionsAnswered) },
                { icon: Clock, label: 'Duration', val: summary.timeTaken },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} className="bg-dark-900 border border-white/10 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-base font-bold text-white mt-0.5">{val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feedback grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-dark-800 border border-green-500/20 rounded-2xl p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-400" /> Strong Points
            </h3>
            <ul className="space-y-2.5">
              {summary.strongPoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                  <span className="w-5 h-5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  {pt}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-dark-800 border border-yellow-500/20 rounded-2xl p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-yellow-400" /> Areas to Improve
            </h3>
            <ul className="space-y-2.5">
              {summary.weakAreas.map((area, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                  <span className="w-5 h-5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Improvements */}
        <div className="bg-dark-800 border border-neon-blue/20 rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-neon-blue" /> Actionable Improvements
          </h3>
          <ol className="space-y-3">
            {summary.improvements.map((imp, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                <span className="px-2.5 py-0.5 bg-neon-blue/10 border border-neon-blue/20 text-neon-blue rounded-lg text-xs font-bold flex-shrink-0">{i + 1}</span>
                {imp}
              </li>
            ))}
          </ol>
        </div>

        {/* Transcript (collapsible) */}
        <div className="bg-dark-800 border border-white/10 rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowTranscript(v => !v)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition-colors"
          >
            <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-gray-400" />
              Interview Transcript ({summary.transcript.length} Q&A)
            </h3>
            {showTranscript ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>
          {showTranscript && (
            <div className="border-t border-white/10 p-5 space-y-4 max-h-96 overflow-y-auto">
              {summary.transcript.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="bg-dark-900 border border-white/10 rounded-xl p-3">
                    <p className="text-[10px] text-neon-blue font-semibold mb-1 uppercase tracking-wide">Q{i + 1}</p>
                    <p className="text-sm text-white">{item.question}</p>
                  </div>
                  <div className="bg-neon-purple/5 border border-neon-purple/15 rounded-xl p-3 ml-5">
                    <p className="text-[10px] text-neon-purple font-semibold mb-1 uppercase tracking-wide">Your Answer</p>
                    <p className="text-sm text-gray-300">{item.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pb-4">
          <button
            onClick={resetInterview}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-blue to-blue-600 text-white font-bold rounded-xl hover:from-neon-blue/90 hover:to-blue-600/90 transition-all shadow-lg shadow-neon-blue/20"
          >
            <RotateCw className="w-4 h-4" /> Start New Interview
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default MockInterview;
