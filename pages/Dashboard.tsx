
import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Play, Square, Download, Activity, Save, User, Key, MapPin, Search, Globe, ChevronLeft, ChevronRight, RotateCw, X, UploadCloud, FileText, CheckCircle, Clock, IndianRupee, Calendar, Loader2, AlertCircle, Plus, Trash2, Star, Filter, Building2, Briefcase, GraduationCap, Home, Zap, Crown, Rocket, CreditCard, Check, BarChart3, TrendingUp, TrendingDown, Target, Award, Users, Mail, ThumbsUp, ArrowUpRight, Lightbulb, Eye, EyeOff, ExternalLink, BookOpen, Settings } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import OnboardingFlow from '../components/OnboardingFlow';
import SuggestAndEarn from '../components/SuggestAndEarn';
import AppSettings from '../components/AppSettings';
import ChangePassword from '../components/ChangePassword';
import UserAnalytics from '../components/UserAnalytics';
import AutoProfileUpdate from '../components/AutoProfileUpdate';
import ResumeBuilder from '../components/ResumeBuilder';
import NaukriProfileGuide from '../components/NaukriProfileGuide';
import AICareerCoach from '../components/AICareerCoach';
import EmailManagement from '../components/EmailManagement';
import MockInterview from '../components/MockInterview';
import InterviewQA from '../components/InterviewQA';
import LearningModule from '../components/LearningModule';
import InternshipModule from '../components/InternshipModule';
import UserBlogSection from '../components/UserBlogSection';
import { runBot, stopAutomation, getAutomationLogs, updateJobSettings, getJobSettings, getSkills, saveSkillsBulk, updateSkill, deleteSkill, getAllFilters, getUserFilters, saveUserFilters, runFilter, getFilterLogs, verifyNaukriCredentials } from '../services/automationApi';
import { getSubscriptionStatus, createOrder, initiatePayment } from '../services/subscriptionApi';
import { getPlans, Plan } from '../services/plansApi';
import { API_BASE_URL } from '../config/api';

const PLATFORMS = [
  { id: 'naukri',        name: 'Naukri',        abbr: 'N',   url: 'https://www.naukri.com/jobs',          color: '#FF7555', description: 'Apply to up to 50 jobs daily on Naukri automatically' },
  { id: 'linkedin',      name: 'LinkedIn',       abbr: 'in',  url: 'https://www.linkedin.com/jobs',        color: '#0077B5', description: 'Apply via Easy Apply on LinkedIn automatically' },
  { id: 'indeed',        name: 'Indeed',         abbr: 'i',   url: 'https://www.indeed.com/jobs',          color: '#2164F3', description: 'Apply to matching job listings on Indeed' },
  { id: 'instahire',     name: 'InstaHire',      abbr: 'IH',  url: 'https://instahire.in/jobs',            color: '#7B3FF2', description: 'Apply to jobs on InstaHire platform automatically' },
  { id: 'shine',         name: 'Shine',          abbr: 'Sh',  url: 'https://www.shine.com/jobs',           color: '#F5A623', description: 'Apply to jobs on Shine.com automatically' },
  { id: 'foundit',       name: 'Foundit',        abbr: 'F',   url: 'https://www.foundit.in/jobs',          color: '#6600CC', description: 'Apply to jobs on Foundit (formerly Monster India) automatically' },
  { id: 'timesjobs',     name: 'TimesJobs',      abbr: 'TJ',  url: 'https://www.timesjobs.com',            color: '#E31E24', description: 'Apply to jobs on TimesJobs portal automatically' },
  { id: 'freshersworld', name: 'Freshersworld',  abbr: 'FW',  url: 'https://www.freshersworld.com/jobs',   color: '#00875A', description: 'Apply to fresher openings on Freshersworld automatically' },
  { id: 'internshala',   name: 'Internshala',    abbr: 'IS',  url: 'https://internshala.com/jobs',         color: '#4CAF50', description: 'Apply to internships and jobs on Internshala automatically' },
  { id: 'apna',          name: 'Apna',           abbr: 'Ap',  url: 'https://apna.co/jobs',                 color: '#F06C2F', description: 'Apply to jobs on Apna platform automatically' },
  { id: 'hirist',        name: 'Hirist',         abbr: 'Hi',  url: 'https://www.hirist.tech/jobs',         color: '#00BCD4', description: 'Apply to tech jobs on Hirist automatically' },
  { id: 'iimjobs',       name: 'IIMJobs',        abbr: 'IJ',  url: 'https://www.iimjobs.com/j',            color: '#1565C0', description: 'Apply to premium management jobs on IIMJobs automatically' },
  { id: 'glassdoor',     name: 'Glassdoor',      abbr: 'G',   url: 'https://www.glassdoor.co.in/Jobs',     color: '#0CAA41', description: 'Apply to jobs on Glassdoor automatically' },
  { id: 'cutshort',      name: 'Cutshort',       abbr: 'CS',  url: 'https://cutshort.io/jobs',             color: '#FF4F9A', description: 'Apply to startup and tech jobs on Cutshort automatically' },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, logs, reports, isAutomating, startAutomation, stopAutomation, updateConfig, completeOnboarding } = useApp();
  const logContainerRef = useRef<HTMLDivElement>(null);
  // New users without Naukri credentials should see Job Profile tab first
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [botLogs, setBotLogs] = useState<any[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('naukri');
  const activePlatform = PLATFORMS.find(p => p.id === selectedPlatform) ?? PLATFORMS[0];

  // Resume Upload State for Config Tab
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Show/hide password state
  const [showNaukriPassword, setShowNaukriPassword] = useState(false);

  // Verification confirmation modal state
  const [showVerificationConfirm, setShowVerificationConfirm] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isCredentialsVerified, setIsCredentialsVerified] = useState(false);
  const [originalPassword, setOriginalPassword] = useState(''); // Track original password to detect changes
  const [needsReVerification, setNeedsReVerification] = useState(false);

  // Filter automation state
  const [isFilterRunning, setIsFilterRunning] = useState(false);
  const filterPollRef = useRef<NodeJS.Timeout | null>(null);

  // Bot automation polling ref
  const botPollRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, botLogs]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (filterPollRef.current) {
        clearInterval(filterPollRef.current);
      }
      if (botPollRef.current) {
        clearInterval(botPollRef.current);
      }
    };
  }, []);

  // Load job settings, skills, filters, and subscription on mount
  useEffect(() => {
    loadJobSettings();
    loadSkills();
    loadFilters();
    loadSubscriptionData();
  }, []);

  // Handle logout when activeTab is set to 'logout'
  useEffect(() => {
    if (activeTab === 'logout') {
      logout();
      navigate('/');
    }
  }, [activeTab, logout, navigate]);

  // Load subscription status and available plans
  const loadSubscriptionData = async () => {
    setSubscriptionLoading(true);
    try {
      // Load current subscription
      const subResult = await getSubscriptionStatus();
      if (subResult.success && subResult.data?.hasActiveSubscription) {
        setCurrentSubscription(subResult.data.subscription);
      }

      // Load all available plans
      const plansResult = await getPlans();
      if (plansResult.success && plansResult.data) {
        setAvailablePlans(plansResult.data);
      }
    } catch (err) {
      setError('Unable to load subscription plans. Please refresh the page and try again.');
    } finally {
      setSubscriptionLoading(false);
    }
  };

  // Handle plan upgrade/purchase
  const handlePlanPurchase = async (plan: Plan) => {
    setProcessingPlanId(plan.id);
    setError(null);

    try {
      const orderResult = await createOrder(plan.id);
      if (!orderResult.success) {
        throw new Error(orderResult.error || 'Failed to create order');
      }

      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');

      initiatePayment(
        orderResult.data,
        {
          name: `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim(),
          email: userInfo.email || '',
          phone: userInfo.phone || '',
        },
        (result) => {
          setSuccess('Payment successful! Your subscription is now active.');
          setProcessingPlanId(null);
          loadSubscriptionData(); // Refresh subscription data
        },
        (failResult) => {
          setError(failResult.error || 'Payment failed. Please try again.');
          setProcessingPlanId(null);
        }
      );
    } catch (err: any) {
      setError(err.message || 'Failed to process payment');
      setProcessingPlanId(null);
    }
  };

  // Get plan icon based on index
  const getPlanIcon = (index: number) => {
    const icons = [Zap, Crown, Rocket];
    const Icon = icons[index % icons.length];
    return <Icon className="w-6 h-6" />;
  };

  // Load filters from database
  const loadFilters = async () => {
    setFiltersLoading(true);
    try {
      // Load filter options
      const result = await getAllFilters();
      if (result.success && result.data) {
        setFilters(result.data);

        // Load user's saved filter selections (stored as comma-separated labels)
        const userFiltersResult = await getUserFilters();
        if (userFiltersResult.success && userFiltersResult.data) {
          const savedData = userFiltersResult.data;
          const filterData = result.data;

          // Helper function to find IDs from comma-separated labels (for multi-select)
          const findIdsByLabels = (filterType: string, labelsStr: string): string[] => {
            if (!labelsStr || !filterData[filterType]) return [];
            const labels = labelsStr.split(',').map((l: string) => l.trim()).filter((l: string) => l);

            return labels.map((label: string) => {
              // Try exact match first
              let option = filterData[filterType].find((o: any) => o.label === label);
              // If not found, try trimmed comparison
              if (!option) {
                option = filterData[filterType].find((o: any) => o.label?.trim() === label.trim());
              }
              // If still not found, try case-insensitive match
              if (!option) {
                option = filterData[filterType].find((o: any) =>
                  o.label?.toLowerCase().trim() === label.toLowerCase().trim()
                );
              }
              // If still not found, try partial match (label contains saved value or vice versa)
              if (!option) {
                option = filterData[filterType].find((o: any) =>
                  o.label?.toLowerCase().includes(label.toLowerCase()) ||
                  label.toLowerCase().includes(o.label?.toLowerCase())
                );
              }
              return option?.id || '';
            }).filter((id: string) => id);
          };

          // Convert saved comma-separated labels back to arrays of IDs
          // Freshness stays as single string, all others are arrays, finalUrl is string
          setSelectedFilters({
            freshness: savedData.freshness || '',
            salaryRange: findIdsByLabels('salaryRange', savedData.salaryRange),
            wfhType: findIdsByLabels('wfhType', savedData.wfhType),
            citiesGid: findIdsByLabels('citiesGid', savedData.citiesGid),
            functionalAreaGid: findIdsByLabels('functionalAreaGid', savedData.functionalAreaGid),
            industryTypeGid: findIdsByLabels('industryTypeGid', savedData.industryTypeGid),
            ugCourseGid: findIdsByLabels('ugCourseGid', savedData.ugCourseGid),
            pgCourseGid: findIdsByLabels('pgCourseGid', savedData.pgCourseGid),
            business_size: findIdsByLabels('business_size', savedData.business_size),
            employement: findIdsByLabels('employement', savedData.employement),
            glbl_RoleCat: findIdsByLabels('glbl_RoleCat', savedData.glbl_RoleCat),
            topGroupId: findIdsByLabels('topGroupId', savedData.topGroupId),
            finalUrl: savedData.finalUrl || '',
          });
        }
      }
    } catch (err) {
      setError('Unable to load filter options. Please refresh the page and try again.');
    } finally {
      setFiltersLoading(false);
    }
  };

  // Local state for config form
  const [configForm, setConfigForm] = useState(user.config || {
    naukriUsername: '',
    naukriPassword: '',
    targetRole: '',
    experience: '',
    location: '',
    keywords: 'Software Engineer',
    currentSalary: '',
    expectedSalary: '',
    noticePeriod: 'Immediate',
    availability: 'Flexible',
    resumeName: '',
    resumeUrl: '', // S3 URL for uploaded resume
    resumeScore: 0,
    maxPages: 5,
    yearsOfExperience: 0,
    dob: ''
  });

  // Calculate Job Profile completion percentage - ALL fields are compulsory
  const calculateProfileCompletion = () => {
    const requiredFields = [
      configForm.naukriUsername,        // Naukri Email
      configForm.naukriPassword,        // Naukri Password
      configForm.resumeName,            // Resume
      configForm.targetRole,            // Target Role
      configForm.experience,            // Experience
      configForm.location,              // Preferred Location
      configForm.keywords,              // Keywords
      configForm.currentSalary,         // Current Salary
      configForm.expectedSalary,        // Expected Salary
      configForm.noticePeriod,          // Notice Period
      configForm.availability,          // Availability
      configForm.yearsOfExperience,     // Years of Experience
      configForm.dob,                   // Date of Birth
    ];

    // Filter out fields that are filled (non-empty and non-zero for numbers)
    const filledFields = requiredFields.filter(field => {
      if (field === null || field === undefined) return false;
      if (typeof field === 'string') return field.trim() !== '';
      if (typeof field === 'number') return field > 0;
      return true;
    }).length;

    return Math.round((filledFields / requiredFields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();
  const isProfileComplete = profileCompletion === 100;

  // Skills state
  const [skills, setSkills] = useState<any[]>([]);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [editSkillData, setEditSkillData] = useState<any>(null);
  const [newSkill, setNewSkill] = useState({
    skillName: '',
    displayName: '',
    rating: 0,
    outOf: 5,
    experience: ''
  });

  // Filters state - freshness is single-select (string), all others are multi-select (arrays), finalUrl is string
  const [filters, setFilters] = useState<any>({});
  const [selectedFilters, setSelectedFilters] = useState<{
    freshness: string;
    salaryRange: string[];
    wfhType: string[];
    citiesGid: string[];
    functionalAreaGid: string[];
    industryTypeGid: string[];
    ugCourseGid: string[];
    pgCourseGid: string[];
    business_size: string[];
    employement: string[];
    glbl_RoleCat: string[];
    topGroupId: string[];
    finalUrl: string;
  }>({
    freshness: '',
    salaryRange: [],
    wfhType: [],
    citiesGid: [],
    functionalAreaGid: [],
    industryTypeGid: [],
    ugCourseGid: [],
    pgCourseGid: [],
    business_size: [],
    employement: [],
    glbl_RoleCat: [],
    topGroupId: [],
    finalUrl: ''
  });
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [openFilterDropdown, setOpenFilterDropdown] = useState<string | null>(null);

  // Subscription and Plans state
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  // Analytics state
  const [analyticsTimeFilter, setAnalyticsTimeFilter] = useState('7d'); // 1d, 7d, 1m, 3m, 6m

  // Application History state
  const [historyData, setHistoryData] = useState<any>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit] = useState(20);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  // History Filters
  const [historyFilters, setHistoryFilters] = useState({
    matchStatus: '',
    applyType: '',
    applicationStatus: '',
    pageNumber: '',
    earlyApplicant: '',
    keySkillsMatch: '',
    locationMatch: '',
    experienceMatch: '',
    minScore: '',
    maxScore: '',
    startDate: '',
    endDate: '',
  });

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // Map frontend field names to backend field names
      const settingsData = {
        naukriEmail: configForm.naukriUsername,
        naukriPassword: configForm.naukriPassword,
        targetRole: configForm.targetRole,
        location: configForm.location,
        currentCTC: configForm.currentSalary,
        expectedCTC: configForm.expectedSalary,
        noticePeriod: configForm.noticePeriod,
        searchKeywords: configForm.keywords,
        availability: configForm.availability,
        maxPages: configForm.maxPages,
        yearsOfExperience: configForm.yearsOfExperience ?? 0,
        dob: configForm.dob || null,
      };

      // Call API to save configuration
      const result = await updateJobSettings(settingsData);

      // Also save skills if any exist
      if (skills.length > 0) {
        await saveSkillsBulk(skills);
      }

      // Save user's selected filters - convert arrays of IDs to comma-separated labels
      // Helper function to convert array of IDs to comma-separated labels
      const idsToLabels = (filterType: string, ids: string[]): string => {
        if (!ids || ids.length === 0 || !filters[filterType]) return '';
        const labels = ids
          .map((id: string) => {
            const option = filters[filterType]?.find((o: any) => o.id === id);
            return option?.label || '';
          })
          .filter((label: string) => label);
        return labels.join(', ');
      };

      const filtersToSave = {
        freshness: selectedFilters.freshness || '',  // Freshness is single value
        salaryRange: idsToLabels('salaryRange', selectedFilters.salaryRange),
        wfhType: idsToLabels('wfhType', selectedFilters.wfhType),
        citiesGid: idsToLabels('citiesGid', selectedFilters.citiesGid),
        functionalAreaGid: idsToLabels('functionalAreaGid', selectedFilters.functionalAreaGid),
        industryTypeGid: idsToLabels('industryTypeGid', selectedFilters.industryTypeGid),
        ugCourseGid: idsToLabels('ugCourseGid', selectedFilters.ugCourseGid),
        pgCourseGid: idsToLabels('pgCourseGid', selectedFilters.pgCourseGid),
        business_size: idsToLabels('business_size', selectedFilters.business_size),
        employement: idsToLabels('employement', selectedFilters.employement),
        glbl_RoleCat: idsToLabels('glbl_RoleCat', selectedFilters.glbl_RoleCat),
        topGroupId: idsToLabels('topGroupId', selectedFilters.topGroupId),
        finalUrl: selectedFilters.finalUrl || '',  // Final URL is single string value
      };

      console.log('[Save Config] Saving filters with finalUrl:', filtersToSave.finalUrl ? filtersToSave.finalUrl.substring(0, 100) + '...' : 'EMPTY');

      const filtersResult = await saveUserFilters(filtersToSave);

      if (!filtersResult.success) {
        console.error('[Save Config] ❌ Failed to save filters:', filtersResult);
        throw new Error('Failed to save job search filters: ' + (filtersResult.error || 'Unknown error'));
      }

      console.log('[Save Config] ✅ Filters saved successfully:', filtersResult);

      // Also update local context
      updateConfig(configForm);

      setSuccess('✅ Configuration saved successfully!');

      // Auto-clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(`❌ Failed to save configuration: ${err.message}`);
    }
  };

  // Handle bot start with API call
  const handleStartBot = async () => {
    setError(null);
    setSuccess(null);
    setIsRunning(true);
    setBotLogs([]);

    try {
      // Show info message
      setBotLogs([{
        timestamp: new Date().toLocaleTimeString(),
        message: '🚀 Starting automation with your saved profile...',
        type: 'info'
      }]);

      // Start the bot (non-blocking - runs in background)
      runBot({
        maxPages: configForm.maxPages || 5,
        searchKeywords: configForm.keywords,
      }).then((result) => {
        // Handle completion
        if (result.logs && result.logs.length > 0) {
          setBotLogs(result.logs);
        }

        if (result.success) {
          setSuccess(`✅ Automation completed! Applied to ${result.jobsApplied} jobs`);
        } else {
          setError(`❌ Automation error: ${result.error}`);
        }
        setIsRunning(false);
      }).catch((err: any) => {
        setError(`Failed to run automation: ${err.message}`);
        setBotLogs(prev => [...prev, {
          timestamp: new Date().toLocaleTimeString(),
          message: `❌ Error: ${err.message}`,
          type: 'error'
        }]);
        setIsRunning(false);
      });

      // Start polling logs immediately (don't wait for completion)
      if (botPollRef.current) {
        clearInterval(botPollRef.current);
      }

      botPollRef.current = setInterval(async () => {
        try {
          const logsResult = await getAutomationLogs();
          if (logsResult.logs && logsResult.logs.length > 0) {
            setBotLogs(logsResult.logs);
          }

          // Stop polling if automation is no longer running
          if (!logsResult.isRunning) {
            if (botPollRef.current) {
              clearInterval(botPollRef.current);
              botPollRef.current = null;
            }
          }
        } catch (err) {
          // Silent error - polling will retry
        }
      }, 2000); // Poll every 2 seconds

    } catch (err: any) {
      setError(`Failed to start automation: ${err.message}`);
      setBotLogs(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        message: `❌ Error: ${err.message}`,
        type: 'error'
      }]);
      setIsRunning(false);
    }
  };

  // Handle bot stop
  const handleStopBot = async () => {
    try {
      // Immediately update UI state
      setIsRunning(false);
      setError(null);

      // Clear any active polling
      if (botPollRef.current) {
        clearInterval(botPollRef.current);
        botPollRef.current = null;
      }

      // Add stopping log
      setBotLogs(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        message: '⚠️ Stopping automation...',
        type: 'warning'
      }]);

      // Call backend to stop automation
      await stopAutomation();

      // Add success log
      setBotLogs(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        message: '✅ Automation stopped successfully',
        type: 'success'
      }]);

      setSuccess('Automation stopped successfully');
    } catch (err: any) {
      setError(`Failed to stop automation: ${err.message}`);
      setBotLogs(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        message: `❌ Stop error: ${err.message}`,
        type: 'error'
      }]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError('File size exceeds 5MB limit');
        setTimeout(() => setError(null), 3000);
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Please upload PDF, DOC, DOCX, or TXT file');
        setTimeout(() => setError(null), 3000);
        return;
      }

      setAnalyzing(true);
      setUploadProgress(0);

      try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('resume', file);

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication required. Please login again.');
        }

        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 15;
          });
        }, 200);

        // Upload to S3 via API
        const response = await fetch(`${API_BASE_URL}/job-settings/resume`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Resume upload failed');
        }

        const data = await response.json();

        if (data.success) {
          setUploadProgress(100);

          // Update form with resume data from S3
          setConfigForm(prev => ({
            ...prev,
            resumeName: data.fileName,
            resumeUrl: data.resumeUrl, // S3 URL
            resumeScore: 92, // Can be calculated from backend later
            yearsOfExperience: data.yearsOfExperience || '0',
          }));

          setSuccess('Resume uploaded successfully to cloud storage!');
          setTimeout(() => setSuccess(null), 3000);

          console.log('✅ Resume uploaded to S3:', data.resumeUrl);
        } else {
          throw new Error(data.error || 'Resume upload failed');
        }
      } catch (error: any) {
        console.error('❌ Resume upload error:', error);
        setError(error.message || 'Failed to upload resume');
        setTimeout(() => setError(null), 5000);
        setUploadProgress(0);
      } finally {
        setAnalyzing(false);
      }
    }
  };

  // Handle resume removal
  const handleRemoveResume = async () => {
    if (!confirm('Are you sure you want to remove your resume? This will delete it from cloud storage and cannot be undone.')) {
      return;
    }

    try {
      setAnalyzing(true);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }

      // Delete resume via API (deletes from S3 and database)
      const response = await fetch(`${API_BASE_URL}/job-settings/resume`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove resume');
      }

      const data = await response.json();

      if (data.success) {
        // Clear resume from form
        setConfigForm(prev => ({
          ...prev,
          resumeName: '',
          resumeUrl: '',
          resumeScore: 0,
          yearsOfExperience: 0,
        }));

        setSuccess('Resume removed successfully from cloud storage!');
        setTimeout(() => setSuccess(null), 3000);

        console.log('✅ Resume removed successfully');
      } else {
        throw new Error(data.error || 'Failed to remove resume');
      }

    } catch (error: any) {
      console.error('❌ Resume removal error:', error);
      setError(error.message || 'Failed to remove resume');
      setTimeout(() => setError(null), 5000);
    } finally {
      setAnalyzing(false);
    }
  };

  // Load job settings from database
  const loadJobSettings = async () => {
    try {
      const result = await getJobSettings();

      if (result) {
        // Map backend field names to frontend form state
        setConfigForm({
          naukriUsername: result.naukriEmail || '',
          naukriPassword: result.naukriPassword || '',
          targetRole: result.targetRole || '',
          experience: result.yearsOfExperience || '',
          location: result.location || '',
          keywords: result.searchKeywords || '',
          currentSalary: result.currentCTC || '',
          expectedSalary: result.expectedCTC || '',
          noticePeriod: result.noticePeriod || 'Immediate',
          availability: result.availability || 'Flexible',
          resumeName: result.resumeFileName || '',
          resumeUrl: result.resumeUrl || '', // S3 URL
          resumeScore: result.resumeScore || 0,
          maxPages: result.maxPages || 5,
          yearsOfExperience: result.yearsOfExperience ?? 0,
          dob: result.dob || ''
        });

        // Set verification status from database
        setIsCredentialsVerified(result.credentialsVerified || false);

        // Store original password to detect changes
        setOriginalPassword(result.naukriPassword || '');
      }
    } catch (err) {
      setError('Unable to load job settings. Please refresh the page and try again.');
    }
  };

  // Detect password changes and require re-verification
  useEffect(() => {
    if (isCredentialsVerified && originalPassword && configForm.naukriPassword !== originalPassword) {
      setNeedsReVerification(true);
    } else if (isCredentialsVerified && configForm.naukriPassword === originalPassword) {
      setNeedsReVerification(false);
    }
  }, [configForm.naukriPassword, originalPassword, isCredentialsVerified]);

  // Load skills on mount
  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const result = await getSkills();
      setSkills(result.skills || []);
    } catch (err) {
      // Silently fail - skills are optional
    }
  };


  // Fetch application history from database
  const fetchApplicationHistory = async (page: number) => {
    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setHistoryError('Not authenticated');
        return;
      }

      // Build query params with filters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: historyLimit.toString(),
      });

      // Add filters if they have values
      if (historyFilters.matchStatus) params.append('matchStatus', historyFilters.matchStatus);
      if (historyFilters.applyType) params.append('applyType', historyFilters.applyType);
      if (historyFilters.applicationStatus) params.append('applicationStatus', historyFilters.applicationStatus);
      if (historyFilters.pageNumber) params.append('pageNumber', historyFilters.pageNumber);
      if (historyFilters.earlyApplicant) params.append('earlyApplicant', historyFilters.earlyApplicant);
      if (historyFilters.keySkillsMatch) params.append('keySkillsMatch', historyFilters.keySkillsMatch);
      if (historyFilters.locationMatch) params.append('locationMatch', historyFilters.locationMatch);
      if (historyFilters.experienceMatch) params.append('experienceMatch', historyFilters.experienceMatch);
      if (historyFilters.minScore) params.append('minScore', historyFilters.minScore);
      if (historyFilters.maxScore) params.append('maxScore', historyFilters.maxScore);
      if (historyFilters.startDate) params.append('startDate', historyFilters.startDate);
      if (historyFilters.endDate) params.append('endDate', historyFilters.endDate);

      const response = await fetch(
        `${API_BASE_URL}/job-results?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch application history');
      }

      const result = await response.json();
      setHistoryData(result);
      setHistoryPage(page);
    } catch (err: any) {
      setHistoryError(err.message || 'An error occurred');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Load history when tab changes to 'history'
  useEffect(() => {
    if (activeTab === 'history') {
      fetchApplicationHistory(historyPage);
    }
  }, [activeTab]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedApplication) {
        setSelectedApplication(null);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [selectedApplication]);

  const handleHistoryPageChange = (newPage: number) => {
    if (historyData && newPage >= 1 && newPage <= historyData.totalPages) {
      fetchApplicationHistory(newPage);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatBoolean = (value: boolean) => (value ? 'Yes' : 'No');

  // Handle filter changes
  const handleFilterChange = (filterName: string, value: string) => {
    setHistoryFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleApplyFilters = () => {
    setHistoryPage(1);
    fetchApplicationHistory(1);
  };

  const handleClearFilters = () => {
    setHistoryFilters({
      matchStatus: '',
      applyType: '',
      applicationStatus: '',
      pageNumber: '',
      earlyApplicant: '',
      keySkillsMatch: '',
      locationMatch: '',
      experienceMatch: '',
      minScore: '',
      maxScore: '',
      startDate: '',
      endDate: '',
    });
    setHistoryPage(1);
    setTimeout(() => fetchApplicationHistory(1), 100);
  };

  const handleAddSkill = async () => {
    if (!newSkill.skillName) {
      setError('Please enter a skill name');
      return;
    }

    try {
      const skillsToSave = [...skills, newSkill];
      await saveSkillsBulk(skillsToSave);
      await loadSkills();

      // Reset form
      setNewSkill({
        skillName: '',
        displayName: '',
        rating: 0,
        outOf: 5,
        experience: ''
      });

      setSuccess('✅ Skill added successfully!');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(`❌ Failed to add skill: ${err.message}`);
    }
  };

  // Handle Naukri credential verification
  const handleVerifyCredentials = async () => {
    setIsVerifying(true);
    setVerificationStatus('idle');
    setError(null);

    try {
      const result = await verifyNaukriCredentials(
        configForm.naukriUsername,
        configForm.naukriPassword
      );

      if (result.success) {
        setVerificationStatus('success');
        setIsCredentialsVerified(true); // Update verification status
        setNeedsReVerification(false); // Clear re-verification flag
        setOriginalPassword(configForm.naukriPassword); // Update original password
        setSuccess('✓ Credentials verified successfully! You can now use the automation.');
        setTimeout(() => {
          setSuccess(null);
          setShowVerificationConfirm(false);
        }, 3000);
      } else {
        setVerificationStatus('error');
        setError(result.message || 'Verification failed. Please check your credentials.');
      }
    } catch (err: any) {
      setVerificationStatus('error');
      setError(err.message || 'Verification failed due to a network error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleEditSkill = (skill: any) => {
    setEditingSkillId(skill.id);
    setEditSkillData({
      skillName: skill.skillName,
      displayName: skill.displayName,
      rating: skill.rating,
      outOf: skill.outOf,
      experience: skill.experience,
    });
  };

  const handleSaveSkillEdit = async (skillId: string) => {
    try {
      await updateSkill(skillId, editSkillData);
      await loadSkills();
      setSuccess('✅ Skill updated successfully!');
      setTimeout(() => setSuccess(null), 2000);
      setEditingSkillId(null);
      setEditSkillData(null);
    } catch (err: any) {
      setError(`❌ Failed to update skill: ${err.message}`);
    }
  };

  const handleCancelSkillEdit = () => {
    setEditingSkillId(null);
    setEditSkillData(null);
  };

  const handleDeleteSkill = async (skillId: string) => {
    try {
      await deleteSkill(skillId);
      await loadSkills();
      setSuccess('✅ Skill deleted successfully!');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(`❌ Failed to delete skill: ${err.message}`);
    }
  };

  const handleLoadDefaultSkills = async () => {
    const defaultSkills = [
      { skillName: 'java', displayName: 'Java', rating: 4.5, outOf: 5, experience: '3 years' },
      { skillName: 'spring', displayName: 'Spring Boot', rating: 4.0, outOf: 5, experience: '2.5 years' },
      { skillName: 'angular', displayName: 'Angular', rating: 3.5, outOf: 5, experience: '6 months' },
      { skillName: 'javascript', displayName: 'JavaScript', rating: 4.0, outOf: 5, experience: '2.5 years' },
      { skillName: 'sql', displayName: 'SQL', rating: 4.0, outOf: 5, experience: '3 years' },
      { skillName: 'htmlcss', displayName: 'HTML/CSS', rating: 4.0, outOf: 5, experience: '3 years' },
      { skillName: 'restapi', displayName: 'REST API', rating: 4.0, outOf: 5, experience: '2.5 years' },
      { skillName: 'git', displayName: 'Git', rating: 4.0, outOf: 5, experience: '3 years' }
    ];

    try {
      await saveSkillsBulk(defaultSkills);
      await loadSkills();
      setSuccess('✅ Default skills loaded successfully!');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err: any) {
      setError(`❌ Failed to load default skills: ${err.message}`);
    }
  };

  // Helper to determine mock browser state from logs
  const getLastLog = () => {
    if (logs.length === 0) return { url: 'about:blank', title: 'Ready' };
    const last = logs[logs.length - 1].text.toLowerCase();

    if (last.includes('naukri login')) return { url: 'https://naukri.com/nlogin/login', title: 'Naukri - Login' };
    if (last.includes('logging in')) return { url: 'https://naukri.com/authenticating...', title: 'Authenticating...' };
    if (last.includes('job page')) return { url: 'https://naukri.com/job-listings?search=react', title: 'Job Search Results' };
    if (last.includes('opening job')) return { url: 'https://naukri.com/job-desc/frontend-dev', title: 'Job Description' };
    if (last.includes('clicking apply')) return { url: 'https://naukri.com/apply/process', title: 'Applying...' };
    if (last.includes('chatbot')) return { url: 'https://naukri.com/ai-assessment', title: 'AI Chatbot Assessment' };
    if (last.includes('waiting')) return { url: 'about:blank', title: 'Idle' };
    if (last.includes('scheduled')) return { url: 'about:blank', title: 'Scheduled' };

    return { url: 'https://naukri.com/dashboard', title: 'Naukri Automation' };
  };

  const browserState = getLastLog();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-neon-blue/10 via-neon-purple/10 to-neon-blue/10 border border-neon-blue/20 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Welcome back, {user.firstName || user.name || 'Student'}
                  </h2>
                  <p className="text-gray-400 mt-1 text-sm">Here's your progress overview</p>
                </div>
                <div className="flex items-center gap-2">
                  {currentSubscription ? (
                    <span className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-xl text-sm font-semibold text-green-400 flex items-center gap-2">
                      <Crown className="w-4 h-4" /> {currentSubscription.planName || 'Active Plan'}
                    </span>
                  ) : (
                    <button
                      onClick={() => setActiveTab('billing')}
                      className="px-4 py-2 bg-neon-blue/10 border border-neon-blue/30 rounded-xl text-sm font-semibold text-neon-blue hover:bg-neon-blue/20 transition-all"
                    >
                      Upgrade Plan
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Completion */}
            <div className="bg-dark-800 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <User className="w-4 h-4 text-neon-blue" /> Profile Completion
                </h3>
                <span className={`text-lg font-bold ${profileCompletion === 100 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {profileCompletion}%
                </span>
              </div>
              <div className="w-full h-3 bg-dark-900 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${profileCompletion === 100 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-yellow-500 to-orange-400'}`}
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              {profileCompletion < 100 && (
                <button
                  onClick={() => setActiveTab('config')}
                  className="mt-3 text-xs text-neon-blue hover:underline flex items-center gap-1"
                >
                  Complete your profile <ArrowUpRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Skills Added', value: skills.length, icon: Star, color: 'text-neon-purple', bg: 'bg-neon-purple/10' },
                { label: 'Resume', value: configForm.resumeName ? 'Uploaded' : 'Not uploaded', icon: FileText, color: 'text-neon-blue', bg: 'bg-neon-blue/10' },
                { label: 'Target Role', value: configForm.targetRole || 'Not set', icon: Target, color: 'text-green-400', bg: 'bg-green-500/10' },
                { label: 'Experience', value: configForm.yearsOfExperience ? `${configForm.yearsOfExperience} yrs` : 'Not set', icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-500/10' },
              ].map((stat) => (
                <div key={stat.label} className="bg-dark-800 border border-white/10 rounded-xl p-4">
                  <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-white font-semibold text-sm mt-0.5 truncate">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Skills Visualization */}
            {skills.length > 0 && (
              <div className="bg-dark-800 border border-white/10 rounded-2xl p-5">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-neon-purple" /> Your Skills
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {skills.slice(0, 10).map((skill: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-300 truncate">{skill.displayName || skill.skillName}</span>
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{skill.rating || 0}/{skill.outOf || 5}</span>
                        </div>
                        <div className="w-full h-2 bg-dark-900 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-neon-purple to-neon-blue transition-all duration-500"
                            style={{ width: `${((skill.rating || 0) / (skill.outOf || 5)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {skills.length > 10 && (
                  <p className="text-xs text-gray-500 mt-3">+{skills.length - 10} more skills</p>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-dark-800 border border-white/10 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" /> Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Job Profile', tab: 'config', icon: Settings, color: 'from-blue-500/10 to-blue-600/10', border: 'border-blue-500/20', text: 'text-blue-400' },
                  { label: 'Resume Builder', tab: 'resume-builder', icon: FileText, color: 'from-purple-500/10 to-purple-600/10', border: 'border-purple-500/20', text: 'text-purple-400' },
                  { label: 'Mock Interview', tab: 'mock-interview', icon: Users, color: 'from-green-500/10 to-green-600/10', border: 'border-green-500/20', text: 'text-green-400' },
                  { label: 'AI Career Coach', tab: 'ai-career-coach', icon: Lightbulb, color: 'from-orange-500/10 to-orange-600/10', border: 'border-orange-500/20', text: 'text-orange-400' },
                ].map((action) => (
                  <button
                    key={action.tab}
                    onClick={() => setActiveTab(action.tab)}
                    className={`bg-gradient-to-br ${action.color} border ${action.border} rounded-xl p-4 text-left hover:scale-[1.02] transition-all`}
                  >
                    <action.icon className={`w-5 h-5 ${action.text} mb-2`} />
                    <p className="text-sm font-semibold text-white">{action.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Subscription Info */}
            {currentSubscription && (
              <div className="bg-dark-800 border border-white/10 rounded-2xl p-5">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-400" /> Your Plan
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">{currentSubscription.planName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {currentSubscription.daysRemaining > 0
                        ? `${currentSubscription.daysRemaining} days remaining`
                        : 'Plan expired'}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('billing')}
                    className="px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'overview':
        return (
          <div className="w-full max-w-[95%] mx-auto p-6">
            {/* ── Platform Selector ── */}
            <div className="mb-5">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-3">Select Job Platform</p>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map(platform => {
                  const isActive = selectedPlatform === platform.id;
                  return (
                    <button
                      key={platform.id}
                      onClick={() => setSelectedPlatform(platform.id)}
                      style={isActive ? {
                        backgroundColor: `${platform.color}18`,
                        borderColor: `${platform.color}80`,
                        color: platform.color,
                        boxShadow: `0 0 16px ${platform.color}30`,
                      } : {}}
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border font-semibold text-sm transition-all ${
                        isActive ? '' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200'
                      }`}
                    >
                      <div
                        style={isActive ? { backgroundColor: platform.color } : {}}
                        className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-[10px] flex-shrink-0 ${isActive ? 'text-white' : 'bg-white/10 text-gray-400'}`}
                      >
                        {platform.abbr}
                      </div>
                      <div className="text-left">
                        <div className="leading-tight">{platform.name}</div>
                        <div className="text-[10px] font-normal opacity-60">{platform.url.replace('https://www.', '').replace('https://', '').split('/')[0]}</div>
                      </div>
                      {isActive && (
                        <div
                          style={{ backgroundColor: `${platform.color}30`, color: platform.color }}
                          className="flex items-center gap-1 ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                        >
                          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: platform.color }}></div>
                          ON
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Browser Simulation + Terminal Stack - Centered Container */}
            <div className="flex flex-col bg-black rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">

              {/* Mock Browser Header - Consistent Theme */}
              <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 p-3 flex items-center gap-4 shadow-lg">
                <div className="flex gap-2 ml-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-500/80 hover:bg-red-600 transition-colors cursor-pointer"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/80 hover:bg-yellow-600 transition-colors cursor-pointer"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-green-500/80 hover:bg-green-600 transition-colors cursor-pointer"></div>
                </div>

                {/* Address Bar - Consistent Style */}
                <div className="flex-1 bg-dark-900 rounded-lg px-4 py-2.5 flex items-center gap-3 text-sm text-gray-300 font-mono border border-gray-700 shadow-inner">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span className="flex-1 truncate">{isAutomating ? browserState.url : activePlatform.url}</span>
                  {isAutomating && <RotateCw className="w-4 h-4 animate-spin text-neon-blue" />}
                </div>

                {/* Run Controls - Consistent Theme */}
                <div className="flex gap-3 mr-2">
                  {!isRunning ? (
                    <button
                      onClick={handleStartBot}
                      style={{ backgroundColor: activePlatform.color, boxShadow: `0 0 20px ${activePlatform.color}66` }}
                      className="flex items-center gap-2 px-5 py-2 text-white text-sm font-bold rounded-lg transition-all hover:opacity-90"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      START {activePlatform.name.toUpperCase()} BOT
                    </button>
                  ) : (
                    <button
                      onClick={handleStopBot}
                      className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white text-sm font-bold rounded-lg hover:from-red-500 hover:to-red-400 transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]"
                    >
                      <Square className="w-4 h-4 fill-current" /> STOP AUTOMATION
                    </button>
                  )}
                </div>
              </div>

              {/* Browser Viewport - Consistent Theme */}
              <div className="h-[500px] bg-gradient-to-br from-gray-900 via-black to-gray-900 relative flex items-center justify-center overflow-hidden">
                {/* Subtle Grid Background */}
                <div className="absolute inset-0 opacity-[0.02]" style={{
                  backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                  animation: 'grid-pulse 4s ease-in-out infinite'
                }}></div>

                {/* Subtle Scan Lines */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,243,255,0.1) 0px, transparent 2px, transparent 4px)',
                  animation: 'scan-line 10s linear infinite'
                }}></div>

                {/* Radial Glow */}
                <div className="absolute inset-0 opacity-20" style={{
                  background: 'radial-gradient(circle at center, rgba(0,243,255,0.08) 0%, transparent 70%)'
                }}></div>

                {isRunning ? (
                  <div className="text-center space-y-6 p-8 z-10">
                    {/* Loader - Consistent Theme */}
                    <div className="relative">
                      <Loader2 className="w-20 h-20 mx-auto animate-spin text-neon-blue drop-shadow-[0_0_15px_rgba(0,243,255,0.8)]" />
                      <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-neon-blue/20 animate-ping"></div>
                    </div>

                    {/* Loading Skeleton */}
                    <div className="space-y-3">
                      <div className="h-5 w-64 bg-gray-800 rounded-lg mx-auto animate-pulse shadow-lg"></div>
                      <div className="h-4 w-48 bg-gray-800 rounded-lg mx-auto animate-pulse shadow-lg delay-75"></div>
                      <div className="h-4 w-56 bg-gray-800 rounded-lg mx-auto animate-pulse shadow-lg delay-100"></div>
                    </div>

                    {/* Status Badge */}
                    <div
                      style={{ borderColor: `${activePlatform.color}50`, color: activePlatform.color, boxShadow: `0 0 20px ${activePlatform.color}40` }}
                      className="mt-8 px-6 py-3 bg-dark-800/80 backdrop-blur-sm rounded-xl border inline-block text-sm font-semibold"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: activePlatform.color }}></div>
                        {activePlatform.name} Automation Running...
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-6 p-8 z-10">
                    {/* Idle Icon - Subtle System Animation */}
                    <div className="relative">
                      {/* Outer Pulse Ring */}
                      <div className="absolute inset-0 w-28 h-28 mx-auto rounded-full border-2 border-neon-blue/20 animate-ping" style={{ animationDuration: '3s' }}></div>

                      {/* Main Icon Container */}
                      <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 flex items-center justify-center shadow-2xl" style={{ animation: 'glow-pulse 4s ease-in-out infinite' }}>
                        {/* System Icon with Subtle Glitch */}
                        <div className="relative">
                          <Activity className="w-12 h-12 text-gray-500" style={{ animation: 'glitch 6s infinite', filter: 'drop-shadow(0 0 4px rgba(0,243,255,0.3))' }} />
                          {/* Ghost layer for depth */}
                          <Activity className="w-12 h-12 text-neon-blue absolute top-0 left-0" style={{ animation: 'glitch-shift 6s infinite', opacity: 0.15 }} />
                        </div>

                        {/* Subtle Scan Line */}
                        <div className="absolute inset-0 overflow-hidden rounded-full">
                          <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent" style={{ animation: 'scan 4s linear infinite' }}></div>
                        </div>
                      </div>

                      {/* Minimal Corner Indicators */}
                      <div className="absolute -top-1 -left-1 text-gray-700 text-lg font-mono" style={{ animation: 'blink 2s step-end infinite' }}>[</div>
                      <div className="absolute -top-1 -right-1 text-gray-700 text-lg font-mono" style={{ animation: 'blink 2s step-end infinite' }}>]</div>
                      <div className="absolute -bottom-1 -left-1 text-gray-700 text-lg font-mono" style={{ animation: 'blink 2s step-end infinite' }}>[</div>
                      <div className="absolute -bottom-1 -right-1 text-gray-700 text-lg font-mono" style={{ animation: 'blink 2s step-end infinite' }}>]</div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-gray-400 font-heading">
                        <span style={{ animation: 'flicker 4s infinite' }}>Ready to Start</span>
                      </h3>
                      <p className="text-sm text-gray-600 max-w-md mx-auto">{activePlatform.description}</p>
                      <div
                        style={{ backgroundColor: `${activePlatform.color}18`, borderColor: `${activePlatform.color}50`, color: activePlatform.color }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold mt-2"
                      >
                        {activePlatform.name}
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Overlay - Consistent Theme */}
                <div className="absolute bottom-4 right-4 px-4 py-2 bg-black/90 backdrop-blur-md text-xs text-green-400 font-mono border border-green-500/30 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`}></div>
                    {activePlatform.name}: {isRunning ? 'Active' : 'Idle'}
                  </div>
                </div>

                {/* Error/Success Alerts - Consistent Theme */}
                {error && (
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 max-w-2xl w-full bg-red-500/10 backdrop-blur-md border border-red-500/30 px-6 py-4 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.3)] z-20 animate-in slide-in-from-top">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-0.5">
                        <AlertCircle className="w-6 h-6 text-red-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-red-400 mb-1 text-lg">Unable to Start Automation</h4>
                        <p className="text-red-300 text-sm mb-3">{error.replace('❌ Automation error: ', '').replace('Failed to run automation: ', '').replace('Failed to start automation: ', '').replace('❌ Bot error: ', '').replace('Failed to run bot: ', '').replace('Failed to start bot: ', '')}</p>
                        {error.includes('credentials') && (
                          <button
                            onClick={() => {
                              setActiveTab('config');
                              setError(null);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-all"
                          >
                            <Key className="w-4 h-4" />
                            Go to Job Profile Settings
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => setError(null)}
                        className="flex-shrink-0 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-500/10 backdrop-blur-md border border-green-500/30 px-6 py-4 rounded-xl flex items-center gap-3 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)] z-20 animate-in slide-in-from-top">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">{success}</span>
                  </div>
                )}
              </div>

              {/* Terminal Footer - Consistent Theme */}
              <div className="bg-black border-t border-gray-800 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                <div className="px-6 py-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-mono uppercase tracking-wider flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                    {isFilterRunning ? 'Filter Automation Logs' : 'Automation Logs'} {botLogs.length > 0 && `(${botLogs.length})`}
                    {isFilterRunning && <span className="ml-2 text-neon-green animate-pulse flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-neon-green rounded-full"></div>
                      RUNNING
                    </span>}
                  </span>
                  <span className="text-xs text-gray-600 font-mono">{isFilterRunning ? 'node server/autoFilter.js' : 'node server/autoApply.js'}</span>
                </div>
                <div
                  ref={logContainerRef}
                  className="h-72 overflow-y-auto p-6 font-mono text-sm space-y-2 bg-black text-gray-300 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-gray-900"
                >
                  {botLogs.length === 0 && logs.length === 0 && (
                    <div className="text-gray-600 italic flex items-center gap-2">
                      <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
                      Automation ready. Click 'START AUTOMATION' to begin.
                    </div>
                  )}

                  {/* Show bot logs if available, otherwise show context logs */}
                  {botLogs.length > 0 ? (
                    botLogs.map((log, idx) => (
                      <div key={idx} className={`${log.type === 'error' ? 'text-red-400 bg-red-500/5' :
                        log.type === 'success' ? 'text-green-400 bg-green-500/5' :
                          log.type === 'warning' ? 'text-yellow-400 bg-yellow-500/5' :
                            'text-gray-300'
                        } break-words font-mono leading-relaxed flex gap-3 p-2 rounded hover:bg-white/5 transition-colors`}>
                        <span className="opacity-40 text-xs w-20 shrink-0 pt-0.5">{log.timestamp}</span>
                        <span className="flex-1">{log.message}</span>
                      </div>
                    ))
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className={`${log.color} break-words font-mono leading-relaxed flex gap-3 p-2 rounded hover:bg-white/5 transition-colors`}>
                        <span className="opacity-40 text-xs w-20 shrink-0 pt-0.5">{log.timestamp}</span>
                        <span className="flex-1">{log.text}</span>
                      </div>
                    ))
                  )}

                  {isRunning && (
                    <div className="flex items-center gap-2 text-neon-green mt-3 animate-pulse pl-[5.5rem]">
                      <span className="w-2 h-5 bg-neon-green shadow-[0_0_10px_rgba(0,243,255,0.8)]"></span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'config':
        return (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Job Profile Settings</h2>

            {/* Profile Completion Progress */}
            <div className="mb-6 bg-dark-800 border-2 border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm font-bold text-white">Profile Completion</span>
                  <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded-full border border-red-500/30 font-semibold">
                    MANDATORY
                  </span>
                </div>
                <span className={`text-lg font-bold ${profileCompletion === 100 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {profileCompletion}%
                </span>
              </div>
              <div className="w-full bg-dark-900 rounded-full h-3 overflow-hidden border border-gray-700">
                <div
                  className={`h-full transition-all duration-500 ${profileCompletion === 100
                    ? 'bg-gradient-to-r from-green-500 to-green-600'
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                    }`}
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              {profileCompletion < 100 && (
                <p className="text-xs text-gray-400 mt-2">
                  Please complete all required fields to unlock automation features.
                </p>
              )}
              {profileCompletion === 100 && (
                <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Profile completed! You can now use all automation features.
                </p>
              )}
            </div>

            {/* Error/Success Alerts */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-400 font-medium">{error.replace('❌ Automation error: ', '').replace('Failed to run automation: ', '').replace('Failed to start automation: ', '').replace('Failed to stop automation: ', '').replace('❌ Bot error: ', '').replace('Failed to run bot: ', '')}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="flex-shrink-0 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg flex items-center gap-2 text-green-400 mb-6">
                <CheckCircle className="w-5 h-5" />
                {success}
              </div>
            )}

            <div className="bg-dark-800 border border-white/10 rounded-2xl p-8">
              <form onSubmit={handleSaveConfig} className="space-y-6">

                {/* Resume Upload Section */}
                <div className="bg-dark-900/50 p-6 rounded-xl border border-dashed border-gray-600">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm">
                    <UploadCloud className="text-neon-blue w-4 h-4" /> Resume & Analysis <span className="text-red-400 ml-1">*</span>
                  </h3>

                  {!configForm.resumeName && !analyzing ? (
                    <div className="text-center py-4">
                      <input
                        type="file"
                        id="resume-upload-dash"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                      />
                      <label htmlFor="resume-upload-dash" className="cursor-pointer inline-flex flex-col items-center">
                        <span className="text-neon-blue font-bold hover:underline text-sm">Upload Resume</span>
                        <span className="text-[10px] text-gray-500 mt-1">PDF, DOCX up to 5MB</span>
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-dark-800 p-3 rounded border border-white/10">
                        <div className="flex items-center gap-3 flex-1">
                          <FileText className="text-neon-purple w-5 h-5" />
                          <div className="flex-1">
                            <div className="text-white font-medium text-sm">{configForm.resumeName || "Parsing Resume..."}</div>
                            {analyzing && <div className="text-[10px] text-gray-400">Uploading to cloud storage...</div>}
                            {!analyzing && configForm.resumeUrl && (
                              <a
                                href={configForm.resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-neon-blue hover:underline flex items-center gap-1 mt-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                View Resume (S3)
                              </a>
                            )}
                          </div>
                        </div>
                        {analyzing ? (
                          <span className="text-neon-blue font-bold text-xs">{uploadProgress}%</span>
                        ) : (
                          <CheckCircle className="text-green-500 w-4 h-4" />
                        )}
                      </div>

                      {/* Re-upload and Delete Buttons */}
                      {!analyzing && (
                        <div className="flex items-center justify-center gap-3">
                          <input
                            type="file"
                            id="resume-reupload-dash"
                            className="hidden"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileUpload}
                          />
                          <label
                            htmlFor="resume-reupload-dash"
                            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-dark-700 border border-gray-600 hover:border-neon-blue rounded-lg transition-all text-sm"
                          >
                            <RotateCw className="w-4 h-4 text-neon-blue" />
                            <span className="text-white">Change Resume</span>
                          </label>

                          <button
                            onClick={handleRemoveResume}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-dark-800 hover:bg-red-900/30 border border-gray-600 hover:border-red-500 rounded-lg transition-all text-sm"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                            <span className="text-red-400">Remove</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Other Job Profile Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase font-bold flex items-center gap-1">
                      Target Role <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={configForm.targetRole}
                      onChange={(e) => setConfigForm({ ...configForm, targetRole: e.target.value })}
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-2.5 px-4 text-white text-sm focus:border-neon-blue outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase font-bold">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        value={configForm.location}
                        onChange={(e) => setConfigForm({ ...configForm, location: e.target.value })}
                        className="w-full bg-dark-900 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:border-neon-blue outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase font-bold flex items-center gap-1">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                      <input
                        type="date"
                        value={configForm.dob}
                        onChange={(e) => setConfigForm({ ...configForm, dob: e.target.value })}
                        className="w-full bg-dark-900 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:border-neon-blue outline-none"
                        placeholder="DD/MM/YYYY"
                      />
                    </div>
                    <p className="text-[10px] text-gray-500">Format: DD/MM/YYYY</p>
                  </div>
                </div>

                {/* New Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase font-bold flex items-center gap-1">
                      Current CTC <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                      <input
                        className="w-full bg-dark-900 border border-gray-700 rounded-lg py-2.5 pl-9 pr-2 text-white text-sm focus:border-neon-green outline-none"
                        value={configForm.currentSalary}
                        onChange={e => setConfigForm({ ...configForm, currentSalary: e.target.value })}
                        placeholder="e.g 4 LPA"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase font-bold flex items-center gap-1">
                      Expected CTC <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                      <input
                        className="w-full bg-dark-900 border border-gray-700 rounded-lg py-2.5 pl-9 pr-2 text-white text-sm focus:border-neon-green outline-none"
                        value={configForm.expectedSalary}
                        onChange={e => setConfigForm({ ...configForm, expectedSalary: e.target.value })}
                        placeholder="e.g 8 LPA"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase font-bold flex items-center gap-1">
                      Notice Period <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                      <select
                        className="w-full bg-dark-900 border border-gray-700 rounded-lg py-2.5 pl-9 pr-2 text-white text-sm focus:border-neon-green outline-none appearance-none cursor-pointer"
                        value={configForm.noticePeriod}
                        onChange={e => setConfigForm({ ...configForm, noticePeriod: e.target.value })}
                      >
                        <option value="Immediate">Immediate</option>
                        <option value="15 Days">15 Days</option>
                        <option value="30 Days">30 Days</option>
                        <option value="60 Days">60 Days</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-400 uppercase font-bold flex items-center gap-1">
                    Search Keywords <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <textarea
                      value={configForm.keywords}
                      onChange={(e) => setConfigForm({ ...configForm, keywords: e.target.value })}
                      placeholder="Software Engineer"
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:border-neon-blue outline-none min-h-[60px]"
                    />
                  </div>
                </div>

                {/* Skills Section */}
                <div className="bg-dark-900/50 p-6 rounded-xl border border-dashed border-gray-600 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-bold flex items-center gap-2 text-sm">
                      <Star className="text-neon-purple w-4 h-4" /> Technical Skills
                    </h3>
                    <button
                      type="button"
                      onClick={handleLoadDefaultSkills}
                      className="text-xs bg-dark-800 hover:bg-dark-700 text-neon-blue px-3 py-1.5 rounded-lg border border-neon-blue/30 transition-colors"
                    >
                      Load Default Skills
                    </button>
                  </div>

                  {/* Add New Skill Form */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <input
                      type="text"
                      placeholder="Skill Name (e.g., Java)"
                      value={newSkill.displayName}
                      onChange={(e) => setNewSkill({ ...newSkill, skillName: e.target.value.toLowerCase(), displayName: e.target.value })}
                      className="bg-dark-900 border border-gray-700 rounded-lg py-2 px-3 text-white text-xs focus:border-neon-purple outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Rating (0-5)"
                      min="0"
                      max="5"
                      step="0.5"
                      value={newSkill.rating}
                      onChange={(e) => setNewSkill({ ...newSkill, rating: parseFloat(e.target.value) })}
                      className="bg-dark-900 border border-gray-700 rounded-lg py-2 px-3 text-white text-xs focus:border-neon-purple outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Out of"
                      value={newSkill.outOf}
                      onChange={(e) => setNewSkill({ ...newSkill, outOf: parseInt(e.target.value) })}
                      className="bg-dark-900 border border-gray-700 rounded-lg py-2 px-3 text-white text-xs focus:border-neon-purple outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Experience"
                      value={newSkill.experience}
                      onChange={(e) => setNewSkill({ ...newSkill, experience: e.target.value })}
                      className="bg-dark-900 border border-gray-700 rounded-lg py-2 px-3 text-white text-xs focus:border-neon-purple outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="bg-neon-purple text-white px-4 py-2 rounded-lg hover:bg-neon-purple/80 transition-colors flex items-center justify-center gap-1 text-xs font-bold"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>

                  {/* Skills List */}
                  {skills.length > 0 && (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {skills.map((skill) => (
                        <div key={skill.id} className="bg-dark-800 p-3 rounded-lg border border-white/10">
                          {editingSkillId === skill.id ? (
                            // Edit Mode
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={editSkillData.displayName}
                                  onChange={(e) => setEditSkillData({ ...editSkillData, displayName: e.target.value })}
                                  className="bg-dark-900 border border-gray-700 rounded px-2 py-1 text-white text-sm focus:border-neon-green outline-none"
                                  placeholder="Display Name"
                                />
                                <input
                                  type="text"
                                  value={editSkillData.experience}
                                  onChange={(e) => setEditSkillData({ ...editSkillData, experience: e.target.value })}
                                  className="bg-dark-900 border border-gray-700 rounded px-2 py-1 text-white text-sm focus:border-neon-green outline-none"
                                  placeholder="Experience"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="number"
                                  step="0.5"
                                  min="0"
                                  max="5"
                                  value={editSkillData.rating}
                                  onChange={(e) => setEditSkillData({ ...editSkillData, rating: parseFloat(e.target.value) })}
                                  className="bg-dark-900 border border-gray-700 rounded px-2 py-1 text-white text-sm focus:border-neon-green outline-none"
                                  placeholder="Rating"
                                />
                                <input
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={editSkillData.outOf}
                                  onChange={(e) => setEditSkillData({ ...editSkillData, outOf: parseInt(e.target.value) })}
                                  className="bg-dark-900 border border-gray-700 rounded px-2 py-1 text-white text-sm focus:border-neon-green outline-none"
                                  placeholder="Out Of"
                                />
                              </div>
                              <div className="flex items-center gap-2 justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleSaveSkillEdit(skill.id)}
                                  className="bg-neon-green text-dark-900 px-3 py-1 rounded text-xs font-bold hover:bg-neon-green/80 transition-colors flex items-center gap-1"
                                >
                                  <CheckCircle className="w-3 h-3" /> Save
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelSkillEdit}
                                  className="bg-gray-700 text-white px-3 py-1 rounded text-xs font-bold hover:bg-gray-600 transition-colors flex items-center gap-1"
                                >
                                  <X className="w-3 h-3" /> Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            // View Mode
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                  <span className="text-white font-medium text-sm">{skill.displayName || skill.skillName}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                  <span className="bg-dark-900 px-2 py-1 rounded border border-gray-700">
                                    {skill.rating}/{skill.outOf}
                                  </span>
                                  <span className="bg-dark-900 px-2 py-1 rounded border border-gray-700">
                                    {skill.experience}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditSkill(skill)}
                                  className="text-neon-blue hover:text-neon-blue/80 transition-colors"
                                  title="Edit Skill"
                                >
                                  <Activity className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSkill(skill.id)}
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                  title="Delete Skill"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {skills.length === 0 && (
                    <div className="text-center py-6 text-gray-500 text-sm italic">
                      No skills added yet. Click "Load Default Skills" or add custom skills above.
                    </div>
                  )}
                </div>


                {/* Save Button with Completion Check */}
                <div className="space-y-3 mt-6">
                  {!isProfileComplete && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-yellow-200">
                        <strong>Profile Incomplete ({profileCompletion}%):</strong> Please fill in all required fields to enable the Save button and unlock automation features.
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!isProfileComplete}
                    className={`w-full font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg ${isProfileComplete
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-green-500/30 hover:shadow-xl cursor-pointer'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-60 shadow-none'
                      }`}
                  >
                    {isProfileComplete ? (
                      <>
                        <Save className="w-5 h-5" /> Save Configuration
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5" /> Complete Profile to Save
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

      case 'analytics':
        // Mock analytics data - will be replaced with real API data
        const analyticsData = {
          jobsAppliedToday: reports.filter(r => r.date === new Date().toISOString().split('T')[0]).length,
          totalJobsApplied: reports.length,
          pendingApplications: reports.filter(r => r.status === 'Pending').length,
          interviewsScheduled: Math.floor(reports.length * 0.15),
          successRate: 94,
          avgResponseTime: '3.2 days',
          interviewSuccessRate: 67,
          offerRate: 23,
          jobsThisWeek: Math.min(reports.length, 45),
          jobsThisMonth: reports.length,
          topCategories: [
            { name: 'Frontend Developer', count: 28, percentage: 35 },
            { name: 'Full Stack Developer', count: 22, percentage: 28 },
            { name: 'React Developer', count: 18, percentage: 23 },
            { name: 'Software Engineer', count: 11, percentage: 14 },
          ],
          responsiveCompanies: [
            { name: 'TCS', responseRate: 89, avgDays: 2 },
            { name: 'Infosys', responseRate: 78, avgDays: 3 },
            { name: 'Wipro', responseRate: 72, avgDays: 4 },
            { name: 'HCL Tech', responseRate: 68, avgDays: 3 },
          ],
          weeklyTrend: [12, 18, 15, 22, 28, 35, 45],
        };

        const timeFilterOptions = [
          { value: '1d', label: 'Last 1 Day' },
          { value: '7d', label: 'Last 7 Days' },
          { value: '1m', label: 'Last 1 Month' },
          { value: '3m', label: 'Last 3 Months' },
          { value: '6m', label: 'Last 6 Months' },
        ];

        return (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header with Time Filter */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div></div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={analyticsTimeFilter}
                  onChange={(e) => setAnalyticsTimeFilter(e.target.value)}
                  className="bg-dark-800 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-neon-blue outline-none cursor-pointer"
                >
                  {timeFilterOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Application Metrics */}
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Application Metrics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-dark-800 border border-white/10 rounded-xl p-5 hover:border-neon-blue/30 transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-neon-blue/10 rounded-lg">
                      <Target className="w-5 h-5 text-neon-blue" />
                    </div>
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> +12%
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{analyticsData.jobsAppliedToday}</div>
                  <div className="text-xs text-gray-400">Jobs Applied Today</div>
                </div>

                <div className="bg-dark-800 border border-white/10 rounded-xl p-5 hover:border-green-500/30 transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{analyticsData.totalJobsApplied}</div>
                  <div className="text-xs text-gray-400">Total Jobs Applied</div>
                </div>

                <div className="bg-dark-800 border border-white/10 rounded-xl p-5 hover:border-yellow-500/30 transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-yellow-500/10 rounded-lg">
                      <Clock className="w-5 h-5 text-yellow-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{analyticsData.pendingApplications}</div>
                  <div className="text-xs text-gray-400">Pending Applications</div>
                </div>

                <div className="bg-dark-800 border border-white/10 rounded-xl p-5 hover:border-purple-500/30 transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Users className="w-5 h-5 text-purple-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{analyticsData.interviewsScheduled}</div>
                  <div className="text-xs text-gray-400">Interviews Scheduled</div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Performance Metrics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-500/10 to-dark-800 border border-green-500/20 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <ThumbsUp className="w-5 h-5 text-green-400" />
                    <span className="text-xs text-green-400 font-bold">EXCELLENT</span>
                  </div>
                  <div className="text-4xl font-bold text-white mb-1">{analyticsData.successRate}%</div>
                  <div className="text-xs text-gray-400">Success Rate</div>
                  <div className="mt-3 h-2 bg-dark-900 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{ width: `${analyticsData.successRate}%` }}></div>
                  </div>
                </div>

                <div className="bg-dark-800 border border-white/10 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{analyticsData.avgResponseTime}</div>
                  <div className="text-xs text-gray-400">Avg Response Time</div>
                </div>

                <div className="bg-dark-800 border border-white/10 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{analyticsData.interviewSuccessRate}%</div>
                  <div className="text-xs text-gray-400">Interview Success Rate</div>
                  <div className="mt-3 h-2 bg-dark-900 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full" style={{ width: `${analyticsData.interviewSuccessRate}%` }}></div>
                  </div>
                </div>

                <div className="bg-dark-800 border border-white/10 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <IndianRupee className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{analyticsData.offerRate}%</div>
                  <div className="text-xs text-gray-400">Offer Rate</div>
                  <div className="mt-3 h-2 bg-dark-900 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full" style={{ width: `${analyticsData.offerRate}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Plan & Usage + Time Analytics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Plan/Usage Metrics */}
              <div className="bg-dark-800 border border-white/10 rounded-xl p-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Plan & Usage
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-dark-900/50 rounded-lg border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-neon-purple/10 rounded-lg">
                        <Crown className="w-5 h-5 text-neon-purple" />
                      </div>
                      <div>
                        <div className="text-white font-medium">Active Plan</div>
                        <div className="text-xs text-gray-400">Current subscription</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-neon-blue font-bold">{currentSubscription?.planName || user.plan?.name || 'Free Trial'}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-dark-900/50 rounded-lg border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500/10 rounded-lg">
                        <Calendar className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">Days Remaining</div>
                        <div className="text-xs text-gray-400">Until plan expires</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{currentSubscription?.daysRemaining || 7}</div>
                    </div>
                  </div>

                  {!currentSubscription && (
                    <div className="p-4 bg-neon-blue/5 border border-neon-blue/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-neon-blue flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-neon-blue font-medium text-sm">Upgrade Recommendation</div>
                          <div className="text-xs text-gray-400 mt-1">Upgrade to Pro plan to unlock unlimited applications and priority support.</div>
                          <button
                            onClick={() => setActiveTab('billing')}
                            className="mt-2 text-xs bg-neon-blue/10 text-neon-blue px-3 py-1.5 rounded-lg hover:bg-neon-blue/20 transition-colors flex items-center gap-1"
                          >
                            View Plans <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Time-based Analytics */}
              <div className="bg-dark-800 border border-white/10 rounded-xl p-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Time-based Analytics
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-dark-900/50 rounded-lg border border-white/5">
                    <div>
                      <div className="text-white font-medium">Jobs This Week</div>
                      <div className="text-xs text-gray-400">Applications submitted</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-white">{analyticsData.jobsThisWeek}</span>
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> +18%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-dark-900/50 rounded-lg border border-white/5">
                    <div>
                      <div className="text-white font-medium">Jobs This Month</div>
                      <div className="text-xs text-gray-400">Applications submitted</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-white">{analyticsData.jobsThisMonth}</span>
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> +32%
                      </span>
                    </div>
                  </div>

                  {/* Mini Trend Chart */}
                  <div className="p-4 bg-dark-900/50 rounded-lg border border-white/5">
                    <div className="text-xs text-gray-400 mb-3">Weekly Trend</div>
                    <div className="flex items-end justify-between gap-1 h-16">
                      {analyticsData.weeklyTrend.map((value, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full bg-gradient-to-t from-neon-blue to-neon-purple rounded-t transition-all hover:opacity-80"
                            style={{ height: `${(value / Math.max(...analyticsData.weeklyTrend)) * 100}%` }}
                          ></div>
                          <span className="text-[10px] text-gray-500">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Insights Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Most Applied Job Categories */}
              <div className="bg-dark-800 border border-white/10 rounded-xl p-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Top Job Categories
                </h3>
                <div className="space-y-3">
                  {analyticsData.topCategories.map((cat, idx) => (
                    <div key={idx} className="group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white">{cat.name}</span>
                        <span className="text-xs text-gray-400">{cat.count} applications</span>
                      </div>
                      <div className="h-2 bg-dark-900 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all group-hover:opacity-80 ${idx === 0 ? 'bg-gradient-to-r from-neon-blue to-blue-400' :
                            idx === 1 ? 'bg-gradient-to-r from-neon-purple to-purple-400' :
                              idx === 2 ? 'bg-gradient-to-r from-green-500 to-green-400' :
                                'bg-gradient-to-r from-orange-500 to-orange-400'
                            }`}
                          style={{ width: `${cat.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Most Responsive Companies */}
              <div className="bg-dark-800 border border-white/10 rounded-xl p-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Most Responsive Companies
                </h3>
                <div className="space-y-3">
                  {analyticsData.responsiveCompanies.map((company, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-dark-900/50 rounded-lg border border-white/5 hover:border-white/10 transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-500/10 text-yellow-400' :
                          idx === 1 ? 'bg-gray-400/10 text-gray-400' :
                            idx === 2 ? 'bg-orange-500/10 text-orange-400' :
                              'bg-white/5 text-gray-500'
                          }`}>
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="text-white font-medium text-sm">{company.name}</div>
                          <div className="text-xs text-gray-400">Avg. {company.avgDays} days response</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold">{company.responseRate}%</div>
                        <div className="text-xs text-gray-500">response rate</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommended Actions */}
            <div className="bg-gradient-to-br from-dark-800 to-dark-900 border border-white/10 rounded-xl p-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-400" /> Recommended Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-dark-900/50 rounded-lg border border-white/5 hover:border-neon-blue/30 transition-all cursor-pointer group">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-neon-blue/10 rounded-lg">
                      <FileText className="w-4 h-4 text-neon-blue" />
                    </div>
                    <span className="text-white font-medium text-sm">Update Resume</span>
                  </div>
                  <p className="text-xs text-gray-400">Add recent skills to improve match rate by 15%</p>
                </div>

                <div className="p-4 bg-dark-900/50 rounded-lg border border-white/5 hover:border-green-500/30 transition-all cursor-pointer group">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-green-500/10 rounded-lg">
                      <Target className="w-4 h-4 text-green-400" />
                    </div>
                    <span className="text-white font-medium text-sm">Expand Search</span>
                  </div>
                  <p className="text-xs text-gray-400">Try adding 'Node.js' to increase opportunities by 23%</p>
                </div>

              </div>
            </div>
          </div>
        );

      case 'history':
        return (
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                  Application History
                </h2>
                {historyData && (
                  <p className="text-gray-400 mt-2 text-sm">
                    Total: {historyData.totalRecords} applications | Page {historyData.currentPage} of {historyData.totalPages}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-dark-800 border border-neon-purple/30 text-neon-purple px-4 py-2 rounded-lg hover:bg-neon-purple/10 flex items-center gap-2 text-sm transition-all"
                >
                  <Filter className="w-4 h-4" /> {showFilters ? 'Hide' : 'Show'} Filters
                </button>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="bg-dark-800 border border-white/10 rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Filters</h3>
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Match Status */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Match Status</label>
                    <select
                      value={historyFilters.matchStatus}
                      onChange={(e) => handleFilterChange('matchStatus', e.target.value)}
                      className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-neon-blue focus:outline-none"
                    >
                      <option value="">All</option>
                      <option value="Good Match">Good Match</option>
                      <option value="Poor Match">Poor Match</option>
                    </select>
                  </div>

                  {/* Apply Type */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Apply Type</label>
                    <select
                      value={historyFilters.applyType}
                      onChange={(e) => handleFilterChange('applyType', e.target.value)}
                      className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-neon-blue focus:outline-none"
                    >
                      <option value="">All</option>
                      <option value="Direct Apply">Direct Apply</option>
                      <option value="External Apply">External Apply</option>
                      <option value="No Apply Button">No Apply Button</option>
                    </select>
                  </div>

                  {/* Application Status */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Application Status</label>
                    <select
                      value={historyFilters.applicationStatus}
                      onChange={(e) => handleFilterChange('applicationStatus', e.target.value)}
                      className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-neon-blue focus:outline-none"
                    >
                      <option value="">All</option>
                      <option value="Applied">Applied</option>
                      <option value="Skipped">Skipped</option>
                    </select>
                  </div>

                  {/* Page Number */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Page Number</label>
                    <input
                      type="number"
                      value={historyFilters.pageNumber}
                      onChange={(e) => handleFilterChange('pageNumber', e.target.value)}
                      placeholder="Any page"
                      className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-neon-blue focus:outline-none"
                    />
                  </div>

                  {/* Early Applicant */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Early Applicant</label>
                    <select
                      value={historyFilters.earlyApplicant}
                      onChange={(e) => handleFilterChange('earlyApplicant', e.target.value)}
                      className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-neon-blue focus:outline-none"
                    >
                      <option value="">All</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>

                  {/* Skills Match */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Skills Match</label>
                    <select
                      value={historyFilters.keySkillsMatch}
                      onChange={(e) => handleFilterChange('keySkillsMatch', e.target.value)}
                      className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-neon-blue focus:outline-none"
                    >
                      <option value="">All</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>

                  {/* Location Match */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Location Match</label>
                    <select
                      value={historyFilters.locationMatch}
                      onChange={(e) => handleFilterChange('locationMatch', e.target.value)}
                      className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-neon-blue focus:outline-none"
                    >
                      <option value="">All</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>

                  {/* Experience Match */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Experience Match</label>
                    <select
                      value={historyFilters.experienceMatch}
                      onChange={(e) => handleFilterChange('experienceMatch', e.target.value)}
                      className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-neon-blue focus:outline-none"
                    >
                      <option value="">All</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>

                  {/* Min Score */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Min Score</label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      value={historyFilters.minScore}
                      onChange={(e) => handleFilterChange('minScore', e.target.value)}
                      placeholder="0"
                      className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-neon-blue focus:outline-none"
                    />
                  </div>

                  {/* Max Score */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Max Score</label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      value={historyFilters.maxScore}
                      onChange={(e) => handleFilterChange('maxScore', e.target.value)}
                      placeholder="5"
                      className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-neon-blue focus:outline-none"
                    />
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={historyFilters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-neon-blue focus:outline-none"
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">End Date</label>
                    <input
                      type="date"
                      value={historyFilters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-neon-blue focus:outline-none"
                    />
                  </div>
                </div>

                {/* Apply Button */}
                <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                  <button
                    onClick={() => setShowFilters(false)}
                    className="px-4 py-2 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplyFilters}
                    className="px-6 py-2 bg-neon-blue text-black font-semibold rounded-lg hover:bg-white transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {historyLoading && (
              <div className="text-center py-12 bg-dark-800 rounded-xl border border-white/10">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div>
                <p className="mt-4 text-gray-400">Loading history...</p>
              </div>
            )}

            {/* Error State */}
            {historyError && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                <p className="text-red-400">Error: {historyError}</p>
              </div>
            )}

            {/* No Data */}
            {!historyLoading && !historyError && historyData && historyData.records.length === 0 && (
              <div className="bg-dark-800 border border-white/10 rounded-xl p-12 text-center">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No application history found</p>
                <p className="text-gray-500 mt-2 text-sm">Run automation to start tracking your applications</p>
              </div>
            )}

            {/* Data Table */}
            {!historyLoading && !historyError && historyData && historyData.records.length > 0 && (
              <>
                <div className="bg-dark-800 border border-white/10 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-black/40">
                        <tr className="text-gray-400 text-xs uppercase border-b border-white/10">
                          <th className="px-4 py-3 font-semibold">Date & Time</th>
                          <th className="px-4 py-3 font-semibold">Job Title</th>
                          <th className="px-4 py-3 font-semibold">Company</th>
                          <th className="px-4 py-3 font-semibold">Location</th>
                          <th className="px-4 py-3 font-semibold">Experience</th>
                          <th className="px-4 py-3 font-semibold">Salary</th>
                          <th className="px-4 py-3 text-center font-semibold">Score</th>
                          <th className="px-4 py-3 font-semibold">Status</th>
                          <th className="px-4 py-3 font-semibold">Apply Type</th>
                          <th className="px-4 py-3 font-semibold text-center">App Status</th>
                          <th className="px-4 py-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {historyData.records.map((record: any) => (
                          <tr
                            key={record.id}
                            className="hover:bg-white/5 transition-colors"
                          >
                            <td className="px-4 py-3 text-sm text-gray-300 font-mono">
                              {formatDate(record.datetime)}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex flex-col">
                                <span className="text-white font-medium">{record.jobTitle || 'Unknown Position'}</span>
                                {record.earlyApplicant && (
                                  <span className="text-xs text-green-400 mt-1">🔥 Early Applicant</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex flex-col">
                                <span className="text-white font-medium">{record.companyName || 'Unknown Company'}</span>
                                {record.companyRating && (
                                  <span className="text-xs text-yellow-400 mt-1">⭐ {record.companyRating}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-300">
                              {record.location || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-300">
                              {record.experienceRequired || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-300">
                              {record.salary || 'Not Disclosed'}
                            </td>
                            <td className="px-4 py-3 text-sm text-center">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-dark-900 rounded-full h-2 overflow-hidden">
                                  <div
                                    className={`h-full ${record.matchScore >= 4 ? 'bg-green-500' : record.matchScore >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                                      }`}
                                    style={{ width: `${(record.matchScore / record.matchScoreTotal) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="font-bold text-neon-purple whitespace-nowrap">
                                  {record.matchScore}/{record.matchScoreTotal}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${record.matchStatus === 'Good Match'
                                ? 'bg-green-900/30 text-green-400 border border-green-500/50'
                                : 'bg-red-900/30 text-red-400 border border-red-500/50'
                                }`}>
                                {record.matchStatus}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${record.applyType === 'Direct Apply'
                                ? 'bg-blue-900/30 text-blue-400 border border-blue-500/50'
                                : record.applyType === 'External Apply'
                                  ? 'bg-purple-900/30 text-purple-400 border border-purple-500/50'
                                  : 'bg-gray-900/30 text-gray-400 border border-gray-500/50'
                                }`}>
                                {record.applyType}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-center">
                              {record.applicationStatus ? (
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${record.applicationStatus === 'Applied'
                                  ? 'bg-green-900/30 text-green-400 border border-green-500/50'
                                  : 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/50'
                                  }`}>
                                  {record.applicationStatus}
                                </span>
                              ) : (
                                <span className="text-gray-500 text-xs">N/A</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <button
                                onClick={() => setSelectedApplication(record)}
                                className="text-neon-blue hover:text-white transition-colors font-medium"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4">
                  <div className="text-gray-400 text-sm">
                    Showing {(historyData.currentPage - 1) * historyLimit + 1} - {Math.min(historyData.currentPage * historyLimit, historyData.totalRecords)} of {historyData.totalRecords}
                  </div>

                  <div className="flex gap-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => handleHistoryPageChange(historyPage - 1)}
                      disabled={historyPage === 1}
                      className={`px-4 py-2 rounded-lg transition-all ${historyPage === 1
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-neon-blue/10 border border-neon-blue/30 text-neon-blue hover:bg-neon-blue/20'
                        }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Page Numbers */}
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, historyData.totalPages) }, (_, i) => {
                        let pageNum;
                        if (historyData.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (historyPage <= 3) {
                          pageNum = i + 1;
                        } else if (historyPage >= historyData.totalPages - 2) {
                          pageNum = historyData.totalPages - 4 + i;
                        } else {
                          pageNum = historyPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handleHistoryPageChange(pageNum)}
                            className={`px-4 py-2 rounded-lg transition-all ${historyPage === pageNum
                              ? 'bg-neon-blue text-black font-bold'
                              : 'bg-dark-700 hover:bg-dark-600 text-gray-300 border border-white/10'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => handleHistoryPageChange(historyPage + 1)}
                      disabled={historyPage === historyData.totalPages}
                      className={`px-4 py-2 rounded-lg transition-all ${historyPage === historyData.totalPages
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-neon-blue/10 border border-neon-blue/30 text-neon-blue hover:bg-neon-blue/20'
                        }`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Application Detail Modal */}
            {selectedApplication && (
              <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedApplication(null)}
              >
                <div
                  className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">
                      Application Details
                    </h2>
                    <button
                      onClick={() => setSelectedApplication(null)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      aria-label="Close modal"
                    >
                      <X className="w-6 h-6 text-white hover:text-gray-200" />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6 space-y-6 bg-gray-50">
                    {/* Job Information Card */}
                    <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-blue-600 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        Company Information
                      </h3>
                      <div>
                        <p className="text-sm text-gray-600 mb-3">Original Job Posting</p>
                        <a
                          href={selectedApplication.companyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm hover:shadow-md font-medium text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View on Naukri.com
                        </a>
                      </div>
                    </div>

                    {/* Date & Time Card */}
                    <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-purple-600 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                        Application Date
                      </h3>
                      <div>
                        <p className="text-gray-900 font-medium text-base">{formatDate(selectedApplication.datetime)}</p>
                      </div>
                    </div>

                    {/* Match Criteria Card */}
                    <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-green-600 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        Match Criteria
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">Early Applicant</p>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${selectedApplication.earlyApplicant
                              ? 'bg-green-100 text-green-700 border border-green-300'
                              : 'bg-gray-100 text-gray-600 border border-gray-300'
                              }`}
                          >
                            {formatBoolean(selectedApplication.earlyApplicant)}
                          </span>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">Key Skills Match</p>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${selectedApplication.keySkillsMatch
                              ? 'bg-green-100 text-green-700 border border-green-300'
                              : 'bg-gray-100 text-gray-600 border border-gray-300'
                              }`}
                          >
                            {formatBoolean(selectedApplication.keySkillsMatch)}
                          </span>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">Location Match</p>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${selectedApplication.locationMatch
                              ? 'bg-green-100 text-green-700 border border-green-300'
                              : 'bg-gray-100 text-gray-600 border border-gray-300'
                              }`}
                          >
                            {formatBoolean(selectedApplication.locationMatch)}
                          </span>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">Experience Match</p>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${selectedApplication.experienceMatch
                              ? 'bg-green-100 text-green-700 border border-green-300'
                              : 'bg-gray-100 text-gray-600 border border-gray-300'
                              }`}
                          >
                            {formatBoolean(selectedApplication.experienceMatch)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Match Score & Status Card */}
                    <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-blue-600 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        Match Score & Status
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Match Score</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {selectedApplication.matchScore}/{selectedApplication.matchScoreTotal}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Match Status</p>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${selectedApplication.matchStatus === 'Good Match'
                              ? 'bg-green-100 text-green-700 border border-green-300'
                              : 'bg-red-100 text-red-700 border border-red-300'
                              }`}
                          >
                            {selectedApplication.matchStatus}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Apply Type</p>
                          <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 border border-blue-300">
                            {selectedApplication.applyType}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Job Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-purple-600 mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                          Job Information
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-gray-600">Job Title</p>
                            <p className="text-sm text-gray-900 font-medium">{selectedApplication.jobTitle || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Company</p>
                            <p className="text-sm text-gray-900 font-medium">{selectedApplication.companyName || 'N/A'}</p>
                          </div>
                          {selectedApplication.companyRating && (
                            <div>
                              <p className="text-xs text-gray-600">Company Rating</p>
                              <p className="text-sm text-yellow-600 font-medium">⭐ {selectedApplication.companyRating}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-gray-600">Location</p>
                            <p className="text-sm text-gray-900">{selectedApplication.location || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Experience Required</p>
                            <p className="text-sm text-gray-900">{selectedApplication.experienceRequired || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Salary</p>
                            <p className="text-sm text-gray-900">{selectedApplication.salary || 'Not Disclosed'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-green-600 mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                          Additional Details
                        </h3>
                        <div className="space-y-3">
                          {selectedApplication.role && (
                            <div>
                              <p className="text-xs text-gray-600">Role</p>
                              <p className="text-sm text-gray-900">{selectedApplication.role}</p>
                            </div>
                          )}
                          {selectedApplication.roleCategory && (
                            <div>
                              <p className="text-xs text-gray-600">Role Category</p>
                              <p className="text-sm text-gray-900">{selectedApplication.roleCategory}</p>
                            </div>
                          )}
                          {selectedApplication.industryType && (
                            <div>
                              <p className="text-xs text-gray-600">Industry Type</p>
                              <p className="text-sm text-gray-900">{selectedApplication.industryType}</p>
                            </div>
                          )}
                          {selectedApplication.employmentType && (
                            <div>
                              <p className="text-xs text-gray-600">Employment Type</p>
                              <p className="text-sm text-gray-900">{selectedApplication.employmentType}</p>
                            </div>
                          )}
                          {selectedApplication.postedDate && (
                            <div>
                              <p className="text-xs text-gray-600">Posted</p>
                              <p className="text-sm text-gray-900">{selectedApplication.postedDate}</p>
                            </div>
                          )}
                          {selectedApplication.openings && (
                            <div>
                              <p className="text-xs text-gray-600">Openings</p>
                              <p className="text-sm text-gray-900">{selectedApplication.openings}</p>
                            </div>
                          )}
                          {selectedApplication.applicants && (
                            <div>
                              <p className="text-xs text-gray-600">Applicants</p>
                              <p className="text-sm text-gray-900">{selectedApplication.applicants}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Key Skills */}
                    {selectedApplication.keySkills && (
                      <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-blue-600 mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          Key Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedApplication.keySkills.split(',').map((skill: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium"
                            >
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Job Highlights */}
                    {selectedApplication.jobHighlights && (
                      <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-purple-600 mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                          Job Highlights
                        </h3>
                        <div className="space-y-2">
                          {selectedApplication.jobHighlights.split(',').map((highlight: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2"></div>
                              <p className="text-sm text-gray-700">{highlight.trim()}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="flex justify-end pt-4">
                      <button
                        onClick={() => setSelectedApplication(null)}
                        className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-all shadow-sm"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'activity':
        return (
          <div className="max-w-7xl mx-auto space-y-6">
            <UserAnalytics />
          </div>
        );

      case 'auto-profile-update':
        return <AutoProfileUpdate />;

      case 'naukri-guide':
        return <NaukriProfileGuide />;

      case 'resume-builder':
        return <ResumeBuilder />;

      case 'ai-career-coach':
        return <AICareerCoach />;

      case 'mock-interview':
        return <MockInterview />;

      case 'interview-qa':
        return <InterviewQA />;

      case 'email-management':
        return <EmailManagement />;

      case 'learning':
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
            <div className="w-20 h-20 rounded-2xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-neon-blue" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Learning Center</h2>
              <span className="inline-block mt-2 px-4 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-sm font-semibold text-yellow-400">Coming Soon</span>
            </div>
            <p className="text-gray-400 max-w-md">A complete learning platform is being built for you. Here's what's coming:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
              {[
                { title: 'Course Dashboard', desc: 'Track your enrolled courses and progress' },
                { title: 'Explore Courses', desc: 'Browse Full Stack Java, .NET, React & more' },
                { title: 'Tasks & Assignments', desc: 'Weekly tasks to build real-world skills' },
                { title: 'Exams', desc: 'Module-wise exams to test your knowledge' },
                { title: 'Certificates', desc: 'Earn certificates on course completion' },
                { title: 'Weekly Mock Interview', desc: 'Practice interviews every week' },
              ].map((item) => (
                <div key={item.title} className="bg-dark-800 border border-white/10 rounded-xl p-4 text-left">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'internship':
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
            <div className="w-20 h-20 rounded-2xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center">
              <Briefcase className="w-10 h-10 text-neon-purple" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Online Internship</h2>
              <span className="inline-block mt-2 px-4 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-sm font-semibold text-yellow-400">Coming Soon</span>
            </div>
            <p className="text-gray-400 max-w-md">Get real project experience with our online internship program. Here's what's coming:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
              {[
                { title: 'Internship Dashboard', desc: 'Overview of your internship journey' },
                { title: 'Browse Internships', desc: 'Find internships matching your skills' },
                { title: 'My Internship', desc: 'Track your active internship & mentor' },
                { title: 'Tasks & Deliverables', desc: 'Real project tasks with deadlines' },
                { title: 'Progress Tracking', desc: 'Weekly progress reports and feedback' },
                { title: 'Certificate', desc: 'Get internship completion certificate' },
              ].map((item) => (
                <div key={item.title} className="bg-dark-800 border border-white/10 rounded-xl p-4 text-left">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="max-w-5xl mx-auto space-y-8">
            <h2 className="text-2xl font-bold text-white">My Plan</h2>

            {/* Loading State */}
            {subscriptionLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-neon-blue animate-spin" />
              </div>
            ) : (
              <>
                {/* Current Plan Card */}
                {currentSubscription ? (
                  <div className="bg-gradient-to-br from-dark-800 to-black border border-neon-blue/30 rounded-2xl p-8 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-neon-blue/5 rounded-full blur-[50px] pointer-events-none"></div>
                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <div>
                        <div className="text-sm text-neon-blue font-bold uppercase mb-1">Current Plan</div>
                        <h3 className="text-3xl font-bold text-white">{currentSubscription.planName}</h3>
                      </div>
                      <div className="bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-green-400 font-mono font-bold">Active</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                      <div className="bg-dark-900/50 p-4 rounded-xl border border-white/5">
                        <div className="text-gray-400 text-xs uppercase mb-1">Start Date</div>
                        <div className="text-white font-medium">
                          {new Date(currentSubscription.startDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                      <div className="bg-dark-900/50 p-4 rounded-xl border border-white/5">
                        <div className="text-gray-400 text-xs uppercase mb-1">Expires On</div>
                        <div className="text-white font-medium">
                          {new Date(currentSubscription.endDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                      <div className="bg-dark-900/50 p-4 rounded-xl border border-white/5">
                        <div className="text-gray-400 text-xs uppercase mb-1">Days Remaining</div>
                        <div className="text-neon-blue font-bold text-xl">
                          {currentSubscription.daysRemaining} days
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    {currentSubscription.features && currentSubscription.features.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-white/10 relative z-10">
                        <div className="text-xs text-gray-400 uppercase mb-3">Plan Features</div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {currentSubscription.features.map((feature: any) => (
                            <div key={feature.id} className="flex items-center gap-2 text-sm text-gray-300">
                              <Check className="w-4 h-4 text-green-400" />
                              <span>{feature.featureLabel || feature.featureValue}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-dark-800 border border-white/10 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Active Subscription</h3>
                    <p className="text-gray-400 mb-6">Choose a plan below to start automating your job applications.</p>
                  </div>
                )}

                {/* Available Plans Section */}
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-white mb-6">
                    {currentSubscription ? 'Upgrade Your Plan' : 'Available Plans'}
                  </h3>

                  {availablePlans.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      No plans available at the moment.
                    </div>
                  ) : (
                    <div className={`grid gap-6 ${availablePlans.length === 1 ? 'grid-cols-1 max-w-md' :
                      availablePlans.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
                        'grid-cols-1 md:grid-cols-3'
                      }`}>
                      {availablePlans.map((plan, index) => {
                        const isCurrentPlan = currentSubscription?.planName === plan.name;
                        const isProcessing = processingPlanId === plan.id;

                        return (
                          <div
                            key={plan.id}
                            className={`relative bg-dark-800 rounded-xl border p-6 transition-all ${plan.isPopular
                              ? 'border-neon-blue shadow-[0_0_20px_rgba(0,243,255,0.1)]'
                              : 'border-white/10 hover:border-white/20'
                              } ${isCurrentPlan ? 'opacity-60' : ''}`}
                          >
                            {plan.isPopular && !isCurrentPlan && (
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="bg-neon-blue text-black text-xs font-bold px-3 py-1 rounded-full">
                                  Most Popular
                                </span>
                              </div>
                            )}

                            {isCurrentPlan && (
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                  Current Plan
                                </span>
                              </div>
                            )}

                            <div className="flex items-center gap-3 mb-4">
                              <div className={`p-2 rounded-lg ${plan.isPopular ? 'bg-neon-blue/10 text-neon-blue' : 'bg-white/5 text-gray-400'
                                }`}>
                                {getPlanIcon(index)}
                              </div>
                              <div>
                                <h4 className="text-lg font-bold text-white">{plan.name}</h4>
                                {plan.description && (
                                  <p className="text-xs text-gray-400">{plan.description}</p>
                                )}
                              </div>
                            </div>

                            <div className="mb-4">
                              <span className="text-3xl font-bold text-white">{plan.priceFormatted}</span>
                              <span className="text-gray-400 ml-1">/ {plan.duration}</span>
                            </div>

                            <ul className="space-y-2 mb-6">
                              {plan.features.slice(0, 5).map((feature) => (
                                <li key={feature.id} className="flex items-start gap-2 text-sm">
                                  <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                  <span className="text-gray-300">{feature.label}</span>
                                </li>
                              ))}
                              {plan.features.length > 5 && (
                                <li className="text-xs text-gray-500 pl-6">
                                  +{plan.features.length - 5} more features
                                </li>
                              )}
                            </ul>

                            <button
                              onClick={() => handlePlanPurchase(plan)}
                              disabled={isCurrentPlan || isProcessing}
                              className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${isCurrentPlan
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : plan.isPopular
                                  ? 'bg-neon-blue text-black hover:bg-white'
                                  : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                            >
                              {isProcessing ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Processing...
                                </>
                              ) : isCurrentPlan ? (
                                'Current Plan'
                              ) : (
                                <>
                                  <CreditCard className="w-4 h-4" />
                                  {currentSubscription ? 'Upgrade' : 'Subscribe'}
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Secure Payment Badge */}
                <div className="text-center mt-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-dark-800 rounded-full border border-white/10">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-gray-400 text-xs">Secure payment powered by Razorpay</span>
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 'suggest-earn':
        return <SuggestAndEarn />;

      case 'change-password':
        return <ChangePassword />;

      case 'settings':
        return <AppSettings />;

      case 'my-blogs':
        return (
          <div className="p-6">
            <UserBlogSection />
          </div>
        );

      default:
        return <div>Select a menu item</div>;
    }
  };

  return (
    <>
      {!user.onboardingCompleted && (
        <OnboardingFlow onComplete={completeOnboarding} />
      )}
      <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
      </DashboardLayout>
    </>
  );
};

export default Dashboard;
