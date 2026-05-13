import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Search, Clock, Calendar, ArrowRight, Tag, BookOpen,
  TrendingUp, Briefcase, Brain, Zap, Users, ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  { id: 'all', label: 'All Posts', icon: BookOpen },
  { id: 'job-hunting', label: 'Job Hunting', icon: Briefcase },
  { id: 'career-tips', label: 'Career Tips', icon: TrendingUp },
  { id: 'automation', label: 'Automation', icon: Zap },
  { id: 'ai-tools', label: 'AI Tools', icon: Brain },
  { id: 'resume', label: 'Resume & CV', icon: Users },
];

const blogs = [
  {
    id: 1,
    category: 'automation',
    tag: 'Automation',
    tagColor: 'blue',
    title: 'How to Apply to 50 Jobs on Naukri in Under 5 Minutes',
    excerpt:
      'Stop spending 3+ hours daily on repetitive job applications. Learn how automated job search tools can save your time and increase your application rate by 10x.',
    author: 'AutoJobzy Team',
    date: 'Feb 18, 2026',
    readTime: '5 min read',
    featured: true,
    gradientClass: 'from-neon-blue/20 to-neon-purple/20',
    borderClass: 'border-neon-blue/30',
    DecorIcon: Zap,
  },
  {
    id: 2,
    category: 'resume',
    tag: 'Resume & CV',
    tagColor: 'purple',
    title: '7 Resume Mistakes That Are Costing You Interviews in 2026',
    excerpt:
      'ATS systems reject 75% of resumes before a human ever sees them. Discover the most common resume mistakes and how to fix them to get past automated screening.',
    author: 'Career Expert',
    date: 'Feb 15, 2026',
    readTime: '7 min read',
    featured: false,
    gradientClass: 'from-neon-purple/10 to-transparent',
    borderClass: 'border-neon-purple/20',
    DecorIcon: Users,
  },
  {
    id: 3,
    category: 'ai-tools',
    tag: 'AI Tools',
    tagColor: 'green',
    title: 'Top 5 AI Tools Every Job Seeker Should Use in 2026',
    excerpt:
      "From AI-powered resume builders to interview simulators — here are the must-have AI tools that give job seekers a massive competitive edge in today's market.",
    author: 'AutoJobzy Team',
    date: 'Feb 10, 2026',
    readTime: '6 min read',
    featured: false,
    gradientClass: 'from-emerald-500/10 to-transparent',
    borderClass: 'border-emerald-500/20',
    DecorIcon: Brain,
  },
  {
    id: 4,
    category: 'career-tips',
    tag: 'Career Tips',
    tagColor: 'orange',
    title: 'How to Handle "Why Are You Looking for a Job Change?" Like a Pro',
    excerpt:
      'This question trips up most candidates. Learn exactly what recruiters want to hear, what to avoid, and how to turn this tricky question into your biggest strength.',
    author: 'HR Insights',
    date: 'Feb 6, 2026',
    readTime: '4 min read',
    featured: false,
    gradientClass: 'from-orange-500/10 to-transparent',
    borderClass: 'border-orange-500/20',
    DecorIcon: TrendingUp,
  },
  {
    id: 5,
    category: 'job-hunting',
    tag: 'Job Hunting',
    tagColor: 'sky',
    title: "Naukri vs LinkedIn: Which Platform Gets You Hired Faster in India?",
    excerpt:
      "An in-depth comparison of India's top two job platforms — response rates, recruiter activity, best practices, and how to maximise your chances on both simultaneously.",
    author: 'AutoJobzy Team',
    date: 'Jan 28, 2026',
    readTime: '8 min read',
    featured: false,
    gradientClass: 'from-sky-500/10 to-transparent',
    borderClass: 'border-sky-500/20',
    DecorIcon: Briefcase,
  },
  {
    id: 6,
    category: 'automation',
    tag: 'Automation',
    tagColor: 'blue',
    title: 'The Complete Guide to Automating Your Job Search in 2026',
    excerpt:
      'A step-by-step breakdown of how job search automation works, what tasks you can automate, and how to set up a system that applies to dozens of jobs while you sleep.',
    author: 'AutoJobzy Team',
    date: 'Jan 20, 2026',
    readTime: '10 min read',
    featured: false,
    gradientClass: 'from-neon-blue/10 to-transparent',
    borderClass: 'border-neon-blue/20',
    DecorIcon: Zap,
  },
  {
    id: 7,
    category: 'career-tips',
    tag: 'Career Tips',
    tagColor: 'orange',
    title: 'Mock Interviews: Why Practicing Out Loud Changes Everything',
    excerpt:
      'Most candidates prepare in their head. Find out why speaking your answers aloud — and recording them — dramatically improves interview performance and confidence.',
    author: 'Career Expert',
    date: 'Jan 14, 2026',
    readTime: '5 min read',
    featured: false,
    gradientClass: 'from-orange-500/10 to-transparent',
    borderClass: 'border-orange-500/20',
    DecorIcon: TrendingUp,
  },
  {
    id: 8,
    category: 'resume',
    tag: 'Resume & CV',
    tagColor: 'purple',
    title: 'How to Write a Resume That Beats ATS in 2026 (With Examples)',
    excerpt:
      'ATS software is the first gatekeeper you must beat. This guide covers keyword optimisation, formatting rules, and proven templates that consistently pass automated screening.',
    author: 'AutoJobzy Team',
    date: 'Jan 8, 2026',
    readTime: '9 min read',
    featured: false,
    gradientClass: 'from-neon-purple/10 to-transparent',
    borderClass: 'border-neon-purple/20',
    DecorIcon: Users,
  },
];

const tagClasses: Record<string, string> = {
  blue: 'bg-neon-blue/10 text-neon-blue border-neon-blue/20',
  purple: 'bg-neon-purple/10 text-neon-purple border-neon-purple/20',
  green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  sky: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
};

/* ── Card component ─────────────────────────────────────── */
const BlogCard: React.FC<{ blog: (typeof blogs)[number] }> = ({ blog }) => (
  <article
    className={`bg-gradient-to-br ${blog.gradientClass} border ${blog.borderClass} rounded-2xl p-6 flex flex-col group hover:shadow-[0_0_25px_rgba(0,243,255,0.08)] transition-all duration-300`}
  >
    <div className="flex items-center justify-between mb-4">
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${tagClasses[blog.tagColor]}`}>
        <Tag className="w-3 h-3" />
        {blog.tag}
      </span>
      <span className="flex items-center gap-1 text-xs text-gray-500">
        <Clock className="w-3 h-3" />
        {blog.readTime}
      </span>
    </div>

    <h3 className="text-lg font-bold text-white mb-3 leading-snug group-hover:text-neon-blue transition-colors flex-1">
      {blog.title}
    </h3>
    <p className="text-gray-400 text-sm leading-relaxed mb-5 line-clamp-3">{blog.excerpt}</p>

    <div className="mt-auto">
      <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pt-4 border-t border-white/5">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          {blog.date}
        </span>
        <span>{blog.author}</span>
      </div>
      <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-neon-blue/30 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all group/btn">
        Read More
        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
      </button>
    </div>
  </article>
);

/* ── Main Page ──────────────────────────────────────────── */
const Blogs: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isFiltered = activeCategory !== 'all' || searchQuery.trim() !== '';

  const filtered = blogs.filter(blog => {
    const matchesCategory = activeCategory === 'all' || blog.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || blog.title.toLowerCase().includes(q) || blog.excerpt.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const featuredBlog = blogs.find(b => b.featured)!;
  const gridBlogs = isFiltered ? filtered : filtered.filter(b => !b.featured);

  return (
    <>
      <Helmet>
        <title>Blog - AutoJobzy | Job Search Tips, Career Advice & Automation Guides</title>
        <meta
          name="description"
          content="Expert articles on job hunting, resume writing, AI tools, career tips, and job search automation. Stay ahead in your career with AutoJobzy's blog."
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">

        {/* ── Hero ─────────────────────────────────────────── */}
        <div className="relative overflow-hidden border-b border-gray-800">
          <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-neon-blue/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon-purple/5 rounded-full blur-[120px]" />

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-neon-blue/10 border border-neon-blue/20 rounded-full text-neon-blue text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4" />
              AutoJobzy Blog
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Career Insights &{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">
                Job Search Tips
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Expert guides on job hunting, resume tips, AI tools, and automation strategies to supercharge your career.
            </p>

            {/* Search */}
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/30 transition-all"
              />
            </div>
          </div>
        </div>

        {/* ── Content ──────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3 mb-12">
            {categories.map(cat => {
              const Icon = cat.icon;
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-neon-blue text-black border-neon-blue shadow-[0_0_15px_rgba(0,243,255,0.4)]'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:border-neon-blue/40 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="text-center py-24">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No articles found</h3>
              <p className="text-gray-400">Try a different search or category.</p>
            </div>
          )}

          {filtered.length > 0 && (
            <>
              {/* Featured post – only on "all" tab with no search */}
              {!isFiltered && (
                <div className="mb-12">
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="w-5 h-5 text-neon-blue" />
                    <h2 className="text-lg font-bold text-white">Featured Article</h2>
                  </div>

                  <div className={`relative bg-gradient-to-br ${featuredBlog.gradientClass} border ${featuredBlog.borderClass} rounded-2xl p-8 md:p-10 overflow-hidden group hover:shadow-[0_0_40px_rgba(0,243,255,0.1)] transition-all duration-300`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-neon-blue/5 rounded-full blur-[60px] group-hover:bg-neon-blue/10 transition-all" />
                    <div className="relative z-10 md:flex md:items-center md:gap-10">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${tagClasses[featuredBlog.tagColor]}`}>
                            <Tag className="w-3 h-3" />
                            {featuredBlog.tag}
                          </span>
                          <span className="text-xs text-gray-500 px-2 py-1 bg-white/5 rounded-full border border-white/10">
                            Featured
                          </span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight group-hover:text-neon-blue transition-colors">
                          {featuredBlog.title}
                        </h3>
                        <p className="text-gray-300 text-lg leading-relaxed mb-6">{featuredBlog.excerpt}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{featuredBlog.date}</span>
                          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{featuredBlog.readTime}</span>
                          <span className="text-gray-500">By {featuredBlog.author}</span>
                        </div>
                        <button className="inline-flex items-center gap-2 px-6 py-3 bg-neon-blue text-black font-bold rounded-xl hover:bg-white transition-colors shadow-[0_0_20px_rgba(0,243,255,0.4)] group/btn">
                          Read Article
                          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>

                      {/* Decorative block */}
                      <div className="hidden md:flex w-48 h-48 flex-shrink-0 rounded-2xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-neon-blue/20 items-center justify-center">
                        <Zap className="w-20 h-20 text-neon-blue/40" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Articles grid */}
              {gridBlogs.length > 0 && (
                <>
                  {!isFiltered && (
                    <div className="flex items-center gap-2 mb-6">
                      <BookOpen className="w-5 h-5 text-gray-400" />
                      <h2 className="text-lg font-bold text-white">Latest Articles</h2>
                    </div>
                  )}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gridBlogs.map(blog => <BlogCard key={blog.id} blog={blog} />)}
                  </div>
                </>
              )}
            </>
          )}

          {/* ── CTA ────────────────────────────────────────── */}
          <div className="mt-20 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 border border-white/10 rounded-2xl p-8 md:p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-neon-blue" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Ready to Automate Your Job Search?
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8">
              Stop spending hours on manual applications. Let AutoJobzy handle the repetitive work while you focus on interviews.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <button className="px-8 py-3 bg-neon-blue text-black font-bold rounded-xl hover:bg-white transition-colors shadow-[0_0_20px_rgba(0,243,255,0.4)]">
                  Get Started Free
                </button>
              </Link>
              <Link to="/download">
                <button className="px-8 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors border border-white/10">
                  Download App
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Blogs;
