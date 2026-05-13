import React, { useState } from 'react';
import {
  Search, MapPin, Clock, IndianRupee, Wifi,
  CheckCircle, Star, ChevronRight, X,
} from 'lucide-react';

const ALL_INTERNSHIPS = [
  {
    id: 1,
    title: 'Full Stack Java Intern',
    company: 'AutoJobzy Technologies',
    logo: 'AJ',
    logoGradient: 'from-neon-blue to-neon-purple',
    stipend: '₹18,000',
    duration: '3 months',
    mode: 'Remote',
    skills: ['Java', 'Spring Boot', 'React', 'MySQL'],
    rating: 4.8,
    applicants: 234,
    status: 'active',
    posted: '5d ago',
    desc: 'Build enterprise-grade full-stack applications using Java Spring Boot and React. Work with a real engineering team on live product features.',
  },
  {
    id: 2,
    title: 'React Frontend Intern',
    company: 'Infosys BPM',
    logo: 'IN',
    logoGradient: 'from-blue-500 to-cyan-500',
    stipend: '₹15,000',
    duration: '2 months',
    mode: 'Hybrid',
    skills: ['React', 'TypeScript', 'Tailwind CSS'],
    rating: 4.6,
    applicants: 512,
    status: 'open',
    posted: '2d ago',
    desc: 'Work on internal dashboard tools and customer-facing portals. Collaborate with senior frontend engineers on performance optimization.',
  },
  {
    id: 3,
    title: 'Data Science Intern',
    company: 'TCS Innovation Labs',
    logo: 'TC',
    logoGradient: 'from-purple-500 to-pink-500',
    stipend: '₹20,000',
    duration: '3 months',
    mode: 'Remote',
    skills: ['Python', 'Pandas', 'ML', 'TensorFlow'],
    rating: 4.7,
    applicants: 189,
    status: 'applied',
    posted: '7d ago',
    desc: 'Develop and deploy ML models for real business use-cases. Access to large proprietary datasets. Mentored by PhD data scientists.',
  },
  {
    id: 4,
    title: 'DevOps Cloud Intern',
    company: 'Wipro CloudEdge',
    logo: 'WC',
    logoGradient: 'from-orange-500 to-yellow-500',
    stipend: '₹14,000',
    duration: '2 months',
    mode: 'Onsite',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
    rating: 4.5,
    applicants: 98,
    status: 'open',
    posted: '10d ago',
    desc: 'Set up CI/CD pipelines, manage AWS infrastructure, and containerize microservices for production-grade cloud deployments.',
  },
  {
    id: 5,
    title: 'MERN Stack Intern',
    company: 'StartupNest India',
    logo: 'SN',
    logoGradient: 'from-emerald-500 to-teal-500',
    stipend: '₹12,000',
    duration: '3 months',
    mode: 'Remote',
    skills: ['MongoDB', 'Express', 'React', 'Node.js'],
    rating: 4.3,
    applicants: 341,
    status: 'open',
    posted: '3d ago',
    desc: 'Build and ship full-stack features for a fast-growing SaaS product. Startup environment — high ownership, fast iterations.',
  },
  {
    id: 6,
    title: '.NET Backend Intern',
    company: 'Accenture India',
    logo: 'AC',
    logoGradient: 'from-violet-500 to-purple-600',
    stipend: '₹16,000',
    duration: '3 months',
    mode: 'Hybrid',
    skills: ['C#', '.NET Core', 'Azure', 'SQL Server'],
    rating: 4.4,
    applicants: 156,
    status: 'open',
    posted: '1d ago',
    desc: 'Work on enterprise .NET applications and Azure cloud services for large-scale client projects in finance and insurance domains.',
  },
];

const BrowseInternships: React.FC = () => {
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState('All');
  const [appliedIds, setAppliedIds] = useState<number[]>([]);
  const [applyingId, setApplyingId] = useState<number | null>(null);

  const filtered = ALL_INTERNSHIPS.filter(j =>
    (modeFilter === 'All' || j.mode === modeFilter) &&
    (j.title.toLowerCase().includes(search.toLowerCase()) ||
     j.company.toLowerCase().includes(search.toLowerCase()) ||
     j.skills.some(s => s.toLowerCase().includes(search.toLowerCase())))
  );

  const handleApply = (id: number) => {
    setApplyingId(id);
    setTimeout(() => {
      setAppliedIds(prev => [...prev, id]);
      setApplyingId(null);
    }, 1200);
  };

  return (
    <div className="space-y-5">

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by role, company, or skill..."
            className="w-full pl-9 pr-4 py-3 bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {['All', 'Remote', 'Hybrid', 'Onsite'].map(m => (
            <button
              key={m}
              onClick={() => setModeFilter(m)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                modeFilter === m
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                  : 'bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-violet-500/40'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500">{filtered.length} internships found</p>

      {/* Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map(job => {
          const isApplied = job.status === 'applied' || appliedIds.includes(job.id);
          const isApplying = applyingId === job.id;

          return (
            <div
              key={job.id}
              className={`bg-white dark:bg-dark-800 border rounded-2xl overflow-hidden transition-all hover:shadow-lg dark:hover:shadow-black/40 ${
                job.status === 'active'
                  ? 'border-violet-500/40'
                  : 'border-gray-200 dark:border-white/10'
              }`}
            >
              {job.status === 'active' && (
                <div className="bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border-b border-violet-500/20 px-4 py-1.5 flex items-center gap-1.5">
                  <CheckCircle className="w-3 h-3 text-violet-400" />
                  <span className="text-[11px] text-violet-400 font-semibold">Currently Enrolled</span>
                </div>
              )}

              <div className="p-5">
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${job.logoGradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md`}>
                    {job.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{job.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{job.company}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs text-gray-500">{job.rating} · {job.applicants} applicants</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">{job.posted}</span>
                </div>

                {/* Meta chips */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { icon: IndianRupee, val: `${job.stipend}/mo` },
                    { icon: Clock,       val: job.duration },
                    { icon: job.mode === 'Remote' ? Wifi : MapPin, val: job.mode },
                  ].map(({ icon: Icon, val }, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 dark:bg-dark-900 rounded-lg">
                      <Icon className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="text-[11px] text-gray-600 dark:text-gray-400 truncate">{val}</span>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{job.desc}</p>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {job.skills.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] rounded-lg">
                      {s}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                {job.status === 'active' ? (
                  <button disabled className="w-full py-2.5 bg-violet-600/10 border border-violet-500/30 text-violet-400 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 cursor-default">
                    <CheckCircle className="w-4 h-4" /> Active Internship
                  </button>
                ) : isApplied ? (
                  <button disabled className="w-full py-2.5 bg-gray-100 dark:bg-dark-900 text-gray-500 text-sm font-semibold rounded-xl cursor-not-allowed">
                    Applied ✓
                  </button>
                ) : (
                  <button
                    onClick={() => handleApply(job.id)}
                    disabled={isApplying}
                    className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-bold rounded-xl hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isApplying ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Applying...</>
                    ) : (
                      <>Apply Now <ChevronRight className="w-4 h-4" /></>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BrowseInternships;
