import React, { useState } from 'react';
import {
  BookOpen, Tag, Clock, Image, AlignLeft, Bold, Italic,
  List, Link as LinkIcon, Quote, CheckCircle, ArrowLeft,
  Eye, Send, FileText, Lightbulb,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const categories = [
  { id: 'job-hunting', label: 'Job Hunting', color: 'sky' },
  { id: 'career-tips', label: 'Career Tips', color: 'orange' },
  { id: 'automation', label: 'Automation', color: 'blue' },
  { id: 'ai-tools', label: 'AI Tools', color: 'green' },
  { id: 'resume', label: 'Resume & CV', color: 'purple' },
];

const catColorMap: Record<string, string> = {
  sky: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  orange: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  blue: 'bg-neon-blue/10 text-neon-blue border-neon-blue/30',
  green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  purple: 'bg-neon-purple/10 text-neon-purple border-neon-purple/30',
};

const tips = [
  "Start with a clear, compelling headline that tells readers exactly what they will learn.",
  "Use short paragraphs (2-3 sentences max) for better readability.",
  "Back up your points with specific examples and data.",
  "End with a clear takeaway or action item for the reader.",
];

type SubmitStatus = 'idle' | 'submitted';

const WriteBlog: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    category: '',
    readTime: '',
    excerpt: '',
    content: '',
  });
  const [status, setStatus] = useState<SubmitStatus>('idle');

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const selectedCat = categories.find(c => c.id === form.category);

  const wordCount = form.content.trim().split(/\s+/).filter(Boolean).length;
  const estimatedRead = Math.max(1, Math.ceil(wordCount / 200));

  const isValid = form.title.trim() && form.category && form.excerpt.trim() && form.content.trim();

  const handleSubmit = () => {
    if (!isValid) return;
    setStatus('submitted');
  };

  if (status === 'submitted') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-neon-blue" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Blog Submitted!</h2>
          <p className="text-gray-400 mb-2">Your post has been submitted for review.</p>
          <p className="text-gray-500 text-sm mb-8">Our team will review it and publish it within 1-2 business days.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => { setStatus('idle'); setForm({ title: '', category: '', readTime: '', excerpt: '', content: '' }); }}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white font-medium transition-colors"
            >
              Write Another
            </button>
            <button
              onClick={() => navigate('/blogs')}
              className="px-6 py-3 bg-neon-blue text-black font-bold rounded-xl hover:bg-white transition-colors shadow-[0_0_20px_rgba(0,243,255,0.4)]"
            >
              View Blog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="border-b border-gray-800 sticky top-0 z-10 bg-gray-900/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-neon-blue" />
            <span className="font-bold text-white hidden sm:block">Write a Blog Post</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors">
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Preview</span>
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                isValid
                  ? 'bg-neon-blue text-black hover:bg-white shadow-[0_0_15px_rgba(0,243,255,0.4)]'
                  : 'bg-white/10 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
              Submit
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── Editor ─────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Title */}
            <div>
              <input
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="Your blog title..."
                className="w-full bg-transparent text-3xl md:text-4xl font-bold text-white placeholder-gray-600 focus:outline-none border-b border-white/10 pb-4 focus:border-neon-blue/40 transition-colors"
              />
            </div>

            {/* Excerpt */}
            <div className="bg-dark-800/50 border border-white/10 rounded-xl p-5">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                <AlignLeft className="w-4 h-4 text-neon-blue" />
                Short Description (shown in blog card)
              </label>
              <textarea
                rows={3}
                value={form.excerpt}
                onChange={e => set('excerpt', e.target.value)}
                placeholder="Write a 1-2 sentence summary of your post..."
                className="w-full bg-transparent text-gray-300 placeholder-gray-600 focus:outline-none resize-none leading-relaxed text-sm"
              />
            </div>

            {/* Toolbar */}
            <div className="bg-dark-800/50 border border-white/10 rounded-xl overflow-hidden">
              <div className="flex items-center gap-1 px-4 py-3 border-b border-white/5 flex-wrap">
                {[
                  { icon: Bold, label: 'Bold' },
                  { icon: Italic, label: 'Italic' },
                  { icon: List, label: 'List' },
                  { icon: Quote, label: 'Quote' },
                  { icon: LinkIcon, label: 'Link' },
                  { icon: Image, label: 'Image' },
                ].map(tool => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.label}
                      title={tool.label}
                      className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
                <div className="ml-auto text-xs text-gray-600 pr-1">
                  {wordCount} words · ~{estimatedRead} min read
                </div>
              </div>
              <textarea
                rows={18}
                value={form.content}
                onChange={e => set('content', e.target.value)}
                placeholder={`Start writing your blog post here...\n\nTip: Use clear headings, bullet points, and real examples to make your post engaging and easy to read.`}
                className="w-full bg-transparent text-gray-200 placeholder-gray-600 focus:outline-none resize-none p-5 leading-relaxed"
              />
            </div>
          </div>

          {/* ── Sidebar ────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Category */}
            <div className="bg-dark-800/50 border border-white/10 rounded-xl p-5">
              <label className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
                <Tag className="w-4 h-4 text-neon-blue" />
                Category *
              </label>
              <div className="grid grid-cols-1 gap-2">
                {categories.map(cat => {
                  const isSelected = form.category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => set('category', cat.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                        isSelected
                          ? catColorMap[cat.color]
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full transition-all ${isSelected ? 'bg-current' : 'bg-gray-600'}`} />
                      {cat.label}
                      {isSelected && <CheckCircle className="w-4 h-4 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Read Time */}
            <div className="bg-dark-800/50 border border-white/10 rounded-xl p-5">
              <label className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
                <Clock className="w-4 h-4 text-neon-blue" />
                Read Time
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1 px-4 py-3 bg-neon-blue/5 border border-neon-blue/20 rounded-xl text-sm text-neon-blue font-medium">
                  ~{estimatedRead} min (auto)
                </div>
                <span className="text-gray-500 text-sm">or</span>
                <input
                  value={form.readTime}
                  onChange={e => set('readTime', e.target.value)}
                  placeholder="Custom"
                  className="flex-1 px-4 py-3 bg-dark-900 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-neon-blue/40 transition-all"
                />
              </div>
            </div>

            {/* Status */}
            <div className="bg-dark-800/50 border border-white/10 rounded-xl p-5">
              <label className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
                <FileText className="w-4 h-4 text-neon-blue" />
                Post Status
              </label>
              <div className="flex items-center gap-3 px-4 py-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                <FileText className="w-4 h-4 text-orange-400" />
                <div>
                  <p className="text-sm font-medium text-orange-400">Pending Review</p>
                  <p className="text-xs text-gray-500 mt-0.5">Will be reviewed before publishing</p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-neon-blue/5 to-neon-purple/5 border border-neon-blue/10 rounded-xl p-5">
              <label className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                Writing Tips
              </label>
              <ul className="space-y-3">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-gray-400 leading-relaxed">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-neon-blue/10 text-neon-blue text-[10px] font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Submit CTA */}
            <button
              onClick={handleSubmit}
              disabled={!isValid}
              className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
                isValid
                  ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-[0_0_25px_rgba(0,243,255,0.3)] hover:shadow-[0_0_35px_rgba(0,243,255,0.5)]'
                  : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10'
              }`}
            >
              <Send className="w-5 h-5" />
              {isValid ? 'Submit for Review' : 'Fill all required fields'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriteBlog;
