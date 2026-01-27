import React, { useState } from 'react';
import {
  BrainCircuit,
  Target,
  TrendingUp,
  BookOpen,
  Briefcase,
  Award,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';

interface UserProfile {
  currentRole: string;
  experience: string;
  skills: string;
  education: string;
  targetRole: string;
  additionalInfo: string;
}

interface CareerAnalysis {
  strengths: string[];
  skillGaps: string[];
  upskillingRecommendations: string[];
  suggestedRoles: string[];
  careerRoadmap: { step: number; action: string }[];
}

const AICareerCoach: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    currentRole: '',
    experience: '',
    skills: '',
    education: '',
    targetRole: '',
    additionalInfo: '',
  });

  const [analysis, setAnalysis] = useState<CareerAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string>('');

  const analyzeCareer = async () => {
    if (!profile.currentRole || !profile.skills || !profile.targetRole) {
      setError('Please fill in at least Current Role, Skills, and Target Role');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
      const response = await fetch(`${API_BASE_URL}/ai/career-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze career profile');
      }

      const data = await response.json();

      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (err: any) {
      console.error('Career analysis error:', err);
      setError(err.message || 'Failed to analyze career. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BrainCircuit className="w-7 h-7 text-neon-purple" />
            AI Career Coach
          </h2>
          <p className="text-gray-400 mt-1">
            Get personalized career guidance and roadmap powered by AI
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-dark-800 border border-white/10 rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-neon-purple" />
            Your Profile
          </h3>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Current Role / Position *
              </label>
              <input
                type="text"
                value={profile.currentRole}
                onChange={(e) => setProfile({ ...profile, currentRole: e.target.value })}
                placeholder="e.g., Junior Software Developer, Student, Fresher"
                className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Years of Experience
              </label>
              <input
                type="text"
                value={profile.experience}
                onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                placeholder="e.g., 2 years, Fresher, 5+ years"
                className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Current Skills (comma separated) *
              </label>
              <textarea
                value={profile.skills}
                onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                placeholder="e.g., JavaScript, React, Node.js, Python, SQL, Communication"
                rows={4}
                className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Education</label>
              <input
                type="text"
                value={profile.education}
                onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                placeholder="e.g., B.Tech Computer Science, MBA, Self-taught"
                className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target Role / Career Goal *
              </label>
              <input
                type="text"
                value={profile.targetRole}
                onChange={(e) => setProfile({ ...profile, targetRole: e.target.value })}
                placeholder="e.g., Senior Full Stack Developer, Data Scientist, Product Manager"
                className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Additional Information (Optional)
              </label>
              <textarea
                value={profile.additionalInfo}
                onChange={(e) => setProfile({ ...profile, additionalInfo: e.target.value })}
                placeholder="Any specific concerns, preferences, or context about your career goals..."
                rows={3}
                className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-neon-purple focus:outline-none resize-none"
              />
            </div>
          </div>

          <button
            onClick={analyzeCareer}
            disabled={isAnalyzing}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-purple to-purple-600 text-white font-semibold rounded-lg hover:from-neon-purple/90 hover:to-purple-600/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-neon-purple/20"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Your Career...
              </>
            ) : (
              <>
                <BrainCircuit className="w-5 h-5" />
                Get AI Career Analysis
              </>
            )}
          </button>
        </div>

        {/* Analysis Results */}
        <div className="bg-dark-800 border border-white/10 rounded-xl p-6 space-y-6 max-h-[800px] overflow-y-auto">
          {!analysis ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <BrainCircuit className="w-16 h-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No Analysis Yet
              </h3>
              <p className="text-gray-500">
                Fill in your profile and click "Get AI Career Analysis" to receive personalized
                guidance
              </p>
            </div>
          ) : (
            <>
              {/* Strengths */}
              {analysis.strengths && analysis.strengths.length > 0 && (
                <div className="bg-dark-900 border border-green-500/20 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Your Strengths
                  </h3>
                  <ul className="space-y-2">
                    {analysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-300">
                        <span className="text-green-500 mt-1">✓</span>
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skill Gaps */}
              {analysis.skillGaps && analysis.skillGaps.length > 0 && (
                <div className="bg-dark-900 border border-yellow-500/20 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-yellow-500" />
                    Skill Gaps to Address
                  </h3>
                  <ul className="space-y-2">
                    {analysis.skillGaps.map((gap, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-300">
                        <span className="text-yellow-500 mt-1">•</span>
                        <span className="text-sm">{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Upskilling Recommendations */}
              {analysis.upskillingRecommendations &&
                analysis.upskillingRecommendations.length > 0 && (
                  <div className="bg-dark-900 border border-neon-blue/20 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-neon-blue" />
                      Upskilling Recommendations
                    </h3>
                    <ul className="space-y-2">
                      {analysis.upskillingRecommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300">
                          <ArrowRight className="w-4 h-4 text-neon-blue mt-1 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Suggested Roles */}
              {analysis.suggestedRoles && analysis.suggestedRoles.length > 0 && (
                <div className="bg-dark-900 border border-neon-purple/20 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-neon-purple" />
                    Suggested Roles
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.suggestedRoles.map((role, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-neon-purple/10 border border-neon-purple/20 rounded-lg text-neon-purple text-sm"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Career Roadmap */}
              {analysis.careerRoadmap && analysis.careerRoadmap.length > 0 && (
                <div className="bg-dark-900 border border-orange-500/20 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    Career Roadmap
                  </h3>
                  <div className="space-y-4">
                    {analysis.careerRoadmap.map((step, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                          <span className="text-orange-500 font-semibold text-sm">
                            {step.step}
                          </span>
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="text-gray-300 text-sm">{step.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pro Tip */}
              <div className="bg-gradient-to-r from-neon-purple/10 to-neon-blue/10 border border-neon-purple/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-neon-purple flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-white font-semibold text-sm mb-1">Pro Tip</h4>
                    <p className="text-gray-400 text-xs">
                      Revisit your career analysis regularly and track your progress. Update your
                      skills as you learn new things to get updated recommendations!
                    </p>
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

export default AICareerCoach;
