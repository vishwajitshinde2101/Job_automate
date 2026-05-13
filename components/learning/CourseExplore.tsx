import React, { useState } from 'react';
import {
  Star, Clock, Users, BookOpen, CheckCircle,
  X, CreditCard, Loader2, Zap, Lock,
} from 'lucide-react';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  isEnrolled: boolean;
  onEnroll: () => void;
}

// ─── Course data ──────────────────────────────────────────────────────────────

interface Course {
  id: number;
  title: string;
  subtitle: string;
  price: number;
  rating: number;
  students: number;
  duration: string;
  modules: number;
  level: string;
  topics: string[];
  color: string;        // Tailwind color prefix e.g. 'emerald'
  gradient: string;
  enrolled?: boolean;
}

const COURSES: Course[] = [
  {
    id: 1,
    title: 'Full Stack Java + Spring Boot',
    subtitle: 'Build enterprise REST APIs, microservices & cloud-ready apps',
    price: 29999,
    rating: 4.8,
    students: 1240,
    duration: '3 months',
    modules: 4,
    level: 'Intermediate',
    topics: ['Core Java', 'Spring Boot', 'REST APIs', 'Microservices', 'MySQL', 'Docker'],
    color: 'emerald',
    gradient: 'from-emerald-500/20 to-green-700/10',
    enrolled: true,
  },
  {
    id: 2,
    title: 'Full Stack .NET (C#)',
    subtitle: 'Master ASP.NET Core, Entity Framework & Azure deployment',
    price: 27999,
    rating: 4.7,
    students: 890,
    duration: '3 months',
    modules: 4,
    level: 'Intermediate',
    topics: ['C# Fundamentals', 'ASP.NET Core', 'EF Core', 'Azure', 'SQL Server', 'SignalR'],
    color: 'violet',
    gradient: 'from-violet-500/20 to-purple-700/10',
  },
  {
    id: 3,
    title: 'React + Frontend Development',
    subtitle: 'Build production-grade React apps with TypeScript & modern tooling',
    price: 24999,
    rating: 4.9,
    students: 2100,
    duration: '3 months',
    modules: 4,
    level: 'Beginner–Intermediate',
    topics: ['React 19', 'TypeScript', 'Tailwind CSS', 'Redux Toolkit', 'Testing', 'Vite'],
    color: 'cyan',
    gradient: 'from-cyan-500/20 to-blue-700/10',
  },
  {
    id: 4,
    title: 'Python + Data Science / ML',
    subtitle: 'Analyze data, build ML models & deploy AI-powered applications',
    price: 32999,
    rating: 4.8,
    students: 1650,
    duration: '3 months',
    modules: 4,
    level: 'Beginner–Advanced',
    topics: ['Python', 'Pandas', 'Scikit-learn', 'TensorFlow', 'Jupyter', 'MLflow'],
    color: 'yellow',
    gradient: 'from-yellow-500/20 to-orange-700/10',
  },
  {
    id: 5,
    title: 'DevOps + Cloud (AWS/Azure)',
    subtitle: 'Automate deployments, manage infra & achieve SRE-level skills',
    price: 34999,
    rating: 4.6,
    students: 720,
    duration: '3 months',
    modules: 4,
    level: 'Intermediate–Advanced',
    topics: ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'AWS EC2/S3', 'Terraform'],
    color: 'orange',
    gradient: 'from-orange-500/20 to-red-700/10',
  },
  {
    id: 6,
    title: 'MERN Stack Development',
    subtitle: 'Full-stack JavaScript from MongoDB to React with real projects',
    price: 26999,
    rating: 4.7,
    students: 1380,
    duration: '3 months',
    modules: 4,
    level: 'Intermediate',
    topics: ['MongoDB', 'Express.js', 'React', 'Node.js', 'GraphQL', 'JWT Auth'],
    color: 'pink',
    gradient: 'from-pink-500/20 to-rose-700/10',
  },
];

// ─── Payment modal ────────────────────────────────────────────────────────────

const PaymentModal: React.FC<{ course: Course; onClose: () => void; onSuccess: () => void }> = ({
  course, onClose, onSuccess,
}) => {
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setDone(true);
      setTimeout(onSuccess, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-dark-800 border border-white/15 rounded-2xl w-full max-w-md shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h3 className="text-base font-bold text-white">Complete Enrollment</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Order summary */}
        <div className="px-6 py-5 space-y-4">
          <div className="bg-dark-900 border border-white/10 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Course</p>
            <p className="text-sm font-semibold text-white">{course.title}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              <span>{course.duration}</span>
              <span>·</span>
              <span>{course.modules} modules</span>
              <span>·</span>
              <span>Certificate included</span>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { label: 'Course Fee', val: `₹${course.price.toLocaleString('en-IN')}` },
              { label: 'GST (18%)',  val: `₹${Math.round(course.price * 0.18).toLocaleString('en-IN')}` },
            ].map(({ label, val }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{label}</span>
                <span className="text-white">{val}</span>
              </div>
            ))}
            <div className="border-t border-white/10 pt-2 flex items-center justify-between">
              <span className="text-white font-semibold">Total</span>
              <span className="text-lg font-bold text-emerald-400">
                ₹{Math.round(course.price * 1.18).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 space-y-1.5">
            {['3-month structured program', 'Weekly mandatory mock interviews', '3 certification exams', 'Corporate live project tasks', 'Certificate on completion'].map(f => (
              <div key={f} className="flex items-center gap-2 text-xs text-gray-300">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Action */}
        <div className="px-6 py-4 border-t border-white/10">
          {done ? (
            <div className="flex items-center justify-center gap-2 py-3 text-emerald-400 font-semibold">
              <CheckCircle className="w-5 h-5" /> Enrollment Successful!
            </div>
          ) : (
            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl hover:from-emerald-400 hover:to-emerald-500 transition-all disabled:opacity-60 shadow-lg shadow-emerald-500/20"
            >
              {paying ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processing Payment…</>
              ) : (
                <><CreditCard className="w-5 h-5" /> Pay ₹{Math.round(course.price * 1.18).toLocaleString('en-IN')}</>
              )}
            </button>
          )}
          <p className="text-center text-[10px] text-gray-600 mt-2">
            Secured by Razorpay · Cancel anytime within 7 days
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Component ───────────────────────────────────────────────────────────────

const CourseExplore: React.FC<Props> = ({ isEnrolled, onEnroll }) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    violet:  'bg-violet-500/10 border-violet-500/20 text-violet-400',
    cyan:    'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    yellow:  'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    orange:  'bg-orange-500/10 border-orange-500/20 text-orange-400',
    pink:    'bg-pink-500/10 border-pink-500/20 text-pink-400',
  };

  return (
    <>
      {/* Payment modal */}
      {selectedCourse && (
        <PaymentModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onSuccess={() => { setSelectedCourse(null); onEnroll(); }}
        />
      )}

      <div className="space-y-5">

        {/* Notice if already enrolled */}
        {isEnrolled && (
          <div className="flex items-center gap-3 px-4 py-3 bg-neon-blue/5 border border-neon-blue/20 rounded-xl">
            <Zap className="w-4 h-4 text-neon-blue flex-shrink-0" />
            <p className="text-xs text-gray-300">
              You're already enrolled in <span className="text-neon-blue font-semibold">Full Stack Java + Spring Boot</span>.
              Browse other courses to enroll after completing your current one.
            </p>
          </div>
        )}

        {/* Course grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {COURSES.map((course) => {
            const chipClass = colorMap[course.color] ?? colorMap['emerald'];
            const isActiveCourse = course.enrolled && isEnrolled;

            return (
              <div
                key={course.id}
                className={`bg-dark-800 border rounded-2xl p-5 flex flex-col gap-4 transition-all ${
                  isActiveCourse
                    ? 'border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Course header */}
                <div className={`flex items-start justify-between`}>
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${chipClass}`}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  {isActiveCourse ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
                    </span>
                  ) : (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${chipClass}`}>
                      {course.level}
                    </span>
                  )}
                </div>

                {/* Title & subtitle */}
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">{course.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{course.subtitle}</p>
                </div>

                {/* Topics */}
                <div className="flex flex-wrap gap-1.5">
                  {course.topics.slice(0, 4).map(t => (
                    <span key={t} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[10px] text-gray-400">
                      {t}
                    </span>
                  ))}
                  {course.topics.length > 4 && (
                    <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[10px] text-gray-600">
                      +{course.topics.length - 4} more
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {course.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> {course.students.toLocaleString('en-IN')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {course.duration}
                  </span>
                </div>

                {/* Price + CTA */}
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/10">
                  <div>
                    <p className="text-lg font-bold text-white">₹{course.price.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-gray-600">+ GST · {course.modules} modules</p>
                  </div>
                  {isActiveCourse ? (
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" /> Enrolled
                    </div>
                  ) : isEnrolled ? (
                    <button
                      disabled
                      className="flex items-center gap-1.5 px-3 py-2 bg-dark-900 border border-white/10 rounded-xl text-xs text-gray-600 cursor-not-allowed"
                    >
                      <Lock className="w-3 h-3" /> Complete current
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedCourse(course)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all bg-gradient-to-r ${
                        course.color === 'emerald' ? 'from-emerald-500 to-emerald-600 shadow-emerald-500/20' :
                        course.color === 'violet'  ? 'from-violet-500 to-violet-600 shadow-violet-500/20' :
                        course.color === 'cyan'    ? 'from-cyan-500 to-cyan-600 shadow-cyan-500/20' :
                        course.color === 'yellow'  ? 'from-yellow-500 to-yellow-600 shadow-yellow-500/20' :
                        course.color === 'orange'  ? 'from-orange-500 to-orange-600 shadow-orange-500/20' :
                                                     'from-pink-500 to-pink-600 shadow-pink-500/20'
                      } shadow-lg hover:opacity-90`}
                    >
                      Enroll Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default CourseExplore;
