
import React, { useRef, useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Play, Square, Download, Activity, Save, User, Key, MapPin, Search, Globe, ChevronLeft, ChevronRight, RotateCw, X, UploadCloud, FileText, CheckCircle, Clock, IndianRupee, Calendar, Loader2, AlertCircle, Plus, Trash2, Star, Filter, Building2, Briefcase, GraduationCap, Home, Zap, Crown, Rocket, CreditCard, Check, BarChart3, TrendingUp, TrendingDown, Target, Award, Users, Mail, ThumbsUp, ArrowUpRight, Lightbulb, Eye, EyeOff } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { runBot, stopAutomation, getAutomationLogs, updateJobSettings, getJobSettings, getSkills, saveSkillsBulk, deleteSkill, getAllFilters, getUserFilters, saveUserFilters, runFilter, getFilterLogs } from '../services/automationApi';
import { getSubscriptionStatus, createOrder, initiatePayment } from '../services/subscriptionApi';
import { getPlans, Plan } from '../services/plansApi';

const Dashboard: React.FC = () => {
  const { user, logs, reports, isAutomating, startAutomation, stopAutomation, scheduleAutomation, downloadReport, updateConfig } = useApp();
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [botLogs, setBotLogs] = useState<any[]>([]);

  // Resume Upload State for Config Tab
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Show/hide password state
  const [showNaukriPassword, setShowNaukriPassword] = useState(false);

  // Filter automation state
  const [isFilterRunning, setIsFilterRunning] = useState(false);
  const filterPollRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, botLogs]);

  // Cleanup filter polling on unmount
  useEffect(() => {
    return () => {
      if (filterPollRef.current) {
        clearInterval(filterPollRef.current);
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
      console.error('Failed to load subscription data:', err);
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

          // Debug: Log saved data from database
          console.log('📦 Saved filters from DB:', savedData);

          // Helper function to find IDs from comma-separated labels (for multi-select)
          const findIdsByLabels = (filterType: string, labelsStr: string): string[] => {
            if (!labelsStr || !filterData[filterType]) return [];
            const labels = labelsStr.split(',').map((l: string) => l.trim()).filter((l: string) => l);
            console.log(`🔍 ${filterType}: Looking for labels:`, labels);
            console.log(`🔍 ${filterType}: Available options:`, filterData[filterType]?.map((o: any) => o.label));

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
              if (!option) {
                console.warn(`❌ Filter "${filterType}": Could not find option for label "${label}"`);
              } else {
                console.log(`✅ ${filterType}: Matched "${label}" -> ID: ${option.id}`);
              }
              return option?.id || '';
            }).filter((id: string) => id);
          };

          // Convert saved comma-separated labels back to arrays of IDs
          // Freshness stays as single string, all others are arrays
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
            featuredCompanies: findIdsByLabels('featuredCompanies', savedData.featuredCompanies),
          });
        }
      }
    } catch (err) {
      console.error('Failed to load filters:', err);
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
    resumeScore: 0
  });

  // Skills state
  const [skills, setSkills] = useState<any[]>([]);
  const [newSkill, setNewSkill] = useState({
    skillName: '',
    displayName: '',
    rating: 0,
    outOf: 5,
    experience: ''
  });

  // Filters state - freshness is single-select (string), all others are multi-select (arrays)
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
    featuredCompanies: string[];
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
    featuredCompanies: []
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
            if (!option) {
              console.warn(`⚠️ Save: Could not find label for ${filterType} ID: ${id}`);
            }
            return option?.label || '';
          })
          .filter((label: string) => label);
        console.log(`💾 Saving ${filterType}: IDs [${ids.join(', ')}] -> Labels "${labels.join(', ')}"`);
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
        featuredCompanies: idsToLabels('featuredCompanies', selectedFilters.featuredCompanies),
      };

      console.log('📤 Filters being saved to DB:', filtersToSave);
      await saveUserFilters(filtersToSave);

      // Also update local context
      updateConfig(configForm);

      setSuccess('✅ Configuration saved! Starting filter automation...');

      // Run autoFilter.js with the saved filters
      try {
        const filterResult = await runFilter();
        if (filterResult.success) {
          setSuccess('✅ Filter automation started! Check logs below.');
          setIsFilterRunning(true);
          setBotLogs([{
            timestamp: new Date().toLocaleTimeString(),
            message: '🚀 Filter automation started...',
            type: 'info'
          }]);

          // Switch to overview tab to show logs
          setActiveTab('overview');

          // Start polling for filter logs
          if (filterPollRef.current) {
            clearInterval(filterPollRef.current);
          }

          filterPollRef.current = setInterval(async () => {
            try {
              const logsResult = await getFilterLogs();
              if (logsResult.logs && logsResult.logs.length > 0) {
                setBotLogs(logsResult.logs);
              }

              // Stop polling if final URL received (completed) or automation stopped
              if (logsResult.completed || !logsResult.isRunning) {
                setIsFilterRunning(false);
                if (filterPollRef.current) {
                  clearInterval(filterPollRef.current);
                  filterPollRef.current = null;
                }

                // Show success message with final URL
                if (logsResult.finalUrl) {
                  setSuccess(`✅ Filters applied! Final URL saved to database.`);
                }
              }
            } catch (pollErr) {
              console.error('Error polling filter logs:', pollErr);
            }
          }, 1000);

        } else {
          setError(`⚠️ Config saved but filter automation failed: ${filterResult.error}`);
        }
      } catch (filterErr: any) {
        console.error('Filter automation error:', filterErr);
        setSuccess('✅ Configuration saved! (Filter automation could not start)');
      }

      // Auto-clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(`❌ Failed to save configuration: ${err.message}`);
    }
  };

  // Schedule state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDateTime, setScheduleDateTime] = useState('');

  const handleScheduleClick = () => {
    setShowScheduleModal(true);
  };

  const handleConfirmSchedule = async () => {
    if (!scheduleDateTime) {
      setError('Please select a date and time');
      return;
    }

    try {
      await scheduleAutomation(scheduleDateTime);
      setSuccess(`✅ Automation scheduled for ${new Date(scheduleDateTime).toLocaleString()}`);
      setShowScheduleModal(false);
      setBotLogs(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        message: `📅 Scheduled run for ${new Date(scheduleDateTime).toLocaleString()}`,
        type: 'info'
      }]);
    } catch (err: any) {
      setError(`❌ Failed to schedule: ${err.message}`);
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
        message: '🚀 Starting bot with your saved profile...',
        type: 'info'
      }]);

      // Call the run-bot API
      const result = await runBot({
        maxPages: configForm.keywords ? 5 : 10, // Use fewer pages if keywords specified
        searchKeywords: configForm.keywords,
      });

      // Add result to logs
      if (result.logs && result.logs.length > 0) {
        setBotLogs(result.logs);
      }

      if (result.success) {
        setSuccess(`✅ Bot completed! Applied to ${result.jobsApplied} jobs`);
      } else {
        setError(`❌ Bot error: ${result.error}`);
      }
    } catch (err: any) {
      setError(`Failed to start bot: ${err.message}`);
      setBotLogs(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        message: `❌ Error: ${err.message}`,
        type: 'error'
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  // Handle bot stop
  const handleStopBot = async () => {
    try {
      await stopAutomation();
      setSuccess('Bot stopped');
      setIsRunning(false);
    } catch (err: any) {
      setError(`Failed to stop bot: ${err.message}`);
    }
  }; const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAnalyzing(true);
      setUploadProgress(0);

      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 150);

      setTimeout(() => {
        setAnalyzing(false);
        setConfigForm(prev => ({
          ...prev,
          resumeName: file.name,
          resumeScore: 92, // Mock result
          keywords: 'React, Redux, Node.js'
        }));
      }, 2000);
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
          resumeScore: result.resumeScore || 0
        });
      }
    } catch (err) {
      console.error('Failed to load job settings:', err);
    }
  };

  // Load skills on mount
  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const result = await getSkills();
      setSkills(result.skills || []);
    } catch (err) {
      console.error('Failed to load skills:', err);
    }
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
      case 'overview':
        return (
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Analytics Cards Removed */}

            {/* BROWSER SIMULATION + TERMINAL STACK */}
            <div className="space-y-0 bg-black rounded-xl border border-gray-800 overflow-hidden shadow-2xl">

              {/* Mock Browser Header */}
              <div className="bg-gray-800 border-b border-gray-700 p-2 flex items-center gap-3">
                <div className="flex gap-1.5 ml-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>

                {/* Address Bar */}
                <div className="flex-1 bg-dark-900 rounded-md px-3 py-1.5 flex items-center gap-2 text-xs text-gray-400 font-mono border border-gray-700">
                  <Globe className="w-3 h-3 text-gray-500" />
                  <span className="flex-1 truncate">{isAutomating ? browserState.url : 'about:blank'}</span>
                  {isAutomating && <RotateCw className="w-3 h-3 animate-spin text-neon-blue" />}
                </div>

                {/* Run Controls */}
                <div className="flex gap-2">
                  <button
                    onClick={handleScheduleClick}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 text-white text-xs font-bold rounded hover:bg-gray-600 transition-colors border border-gray-600"
                  >
                    <Calendar className="w-3 h-3" /> Schedule
                  </button>

                  {!isRunning ? (
                    <button
                      onClick={handleStartBot}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-neon-blue text-black text-xs font-bold rounded hover:bg-white transition-colors shadow-[0_0_10px_rgba(0,243,255,0.3)]"
                    >
                      <Play className="w-3 h-3 fill-current" /> START BOT
                    </button>
                  ) : (
                    <button
                      onClick={handleStopBot}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-500 transition-colors shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                    >
                      <Square className="w-3 h-3 fill-current" /> STOP BOT
                    </button>
                  )}
                </div>
              </div>

              {/* Browser Viewport Simulation */}
              {isRunning && (
                <div className="h-48 bg-gray-900 border-b border-gray-800 relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-white opacity-[0.02] pointer-events-none"></div>

                  {/* Fake Page Content */}
                  <div className="text-center space-y-3 p-4">
                    <Loader2 className="w-12 h-12 mx-auto animate-spin text-neon-blue" />
                    <div className="h-4 w-48 bg-gray-800 rounded mx-auto"></div>
                    <div className="h-3 w-32 bg-gray-800 rounded mx-auto"></div>

                    <div className="mt-4 px-4 py-2 bg-dark-800 rounded border border-gray-700 inline-block text-xs text-neon-blue font-mono">
                      Automation Running...
                    </div>
                  </div>

                  {/* Status Overlay */}
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-[10px] text-green-400 font-mono border border-green-500/20 rounded animate-pulse">
                    Chromium: Active
                  </div>
                </div>
              )}

              {/* Error/Success Alerts */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  {success}
                </div>
              )}

              {/* Terminal Footer */}
              <div className="bg-black p-0">
                <div className="px-4 py-1 bg-gray-900 border-b border-gray-800 text-[10px] text-gray-500 font-mono uppercase tracking-wider flex justify-between">
                  <span>
                    {isFilterRunning ? 'Filter Automation Logs' : 'Bot Automation Logs'} {botLogs.length > 0 && `(${botLogs.length})`}
                    {isFilterRunning && <span className="ml-2 text-neon-green animate-pulse">● RUNNING</span>}
                  </span>
                  <span>{isFilterRunning ? 'node server/autoFilter.js' : 'node server/autoApply.js'}</span>
                </div>
                <div
                  ref={logContainerRef}
                  className="h-64 overflow-y-auto p-4 font-mono text-sm space-y-1.5 bg-black text-gray-300"
                >
                  {botLogs.length === 0 && logs.length === 0 && <div className="text-gray-600 italic">// Automation ready. Click 'START BOT' to begin.</div>}

                  {/* Show bot logs if available, otherwise show context logs */}
                  {botLogs.length > 0 ? (
                    botLogs.map((log, idx) => (
                      <div key={idx} className={`${log.type === 'error' ? 'text-red-400' :
                        log.type === 'success' ? 'text-green-400' :
                          log.type === 'warning' ? 'text-yellow-400' :
                            'text-gray-300'
                        } break-words font-mono leading-relaxed flex gap-2`}>
                        <span className="opacity-30 text-xs w-16 shrink-0">{log.timestamp}</span>
                        <span>{log.message}</span>
                      </div>
                    ))
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className={`${log.color} break-words font-mono leading-relaxed flex gap-2`}>
                        <span className="opacity-30 text-xs w-16 shrink-0">{log.timestamp}</span>
                        <span>{log.text}</span>
                      </div>
                    ))
                  )}

                  {isRunning && (
                    <div className="flex items-center gap-2 text-neon-green mt-2 animate-pulse pl-[4.5rem]">
                      <span className="w-1.5 h-4 bg-neon-green"></span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Schedule Modal */}
            {showScheduleModal && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-dark-800 border border-white/10 rounded-xl p-6 w-full max-w-sm shadow-2xl relative">
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <Calendar className="text-neon-blue" /> Schedule Run
                  </h3>
                  <p className="text-gray-400 text-sm mb-6">
                    Pick a date and time for the automation to start.
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">Start Time</label>
                      <input
                        type="datetime-local"
                        className="w-full bg-dark-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-neon-blue outline-none"
                        value={scheduleDateTime}
                        onChange={(e) => setScheduleDateTime(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>

                    <button
                      onClick={handleConfirmSchedule}
                      className="w-full bg-neon-blue text-black font-bold py-3 rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2"
                    >
                      Confirm Schedule
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'config':
        return (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Job Profile Settings</h2>

            {/* Error/Success Alerts */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg flex items-center gap-2 text-red-400 mb-6">
                <AlertCircle className="w-5 h-5" />
                {error}
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
                    <UploadCloud className="text-neon-blue w-4 h-4" /> Resume & Analysis
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
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-dark-800 p-3 rounded border border-white/10">
                        <div className="flex items-center gap-3">
                          <FileText className="text-neon-purple w-5 h-5" />
                          <div>
                            <div className="text-white font-medium text-sm">{configForm.resumeName || "Parsing Resume..."}</div>
                            {analyzing && <div className="text-[10px] text-gray-400">Updating Analysis...</div>}
                          </div>
                        </div>
                        {analyzing ? (
                          <span className="text-neon-blue font-bold text-xs">{uploadProgress}%</span>
                        ) : (
                          <CheckCircle className="text-green-500 w-4 h-4" />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Config Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase font-bold">Naukri Email</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                      <input
                        type="email"
                        value={configForm.naukriUsername}
                        onChange={(e) => setConfigForm({ ...configForm, naukriUsername: e.target.value })}
                        className="w-full bg-dark-900 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:border-neon-blue outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase font-bold">Naukri Password</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                      <input
                        type={showNaukriPassword ? "text" : "password"}
                        value={configForm.naukriPassword}
                        onChange={(e) => setConfigForm({ ...configForm, naukriPassword: e.target.value })}
                        className="w-full bg-dark-900 border border-gray-700 rounded-lg py-2.5 pl-10 pr-10 text-white text-sm focus:border-neon-blue outline-none"
                        placeholder="••••••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNaukriPassword(!showNaukriPassword)}
                        className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showNaukriPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase font-bold">Target Role</label>
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
                </div>

                {/* New Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase font-bold">Current CTC</label>
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
                    <label className="text-xs text-gray-400 uppercase font-bold">Expected CTC</label>
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
                    <label className="text-xs text-gray-400 uppercase font-bold">Notice Period</label>
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
                  <label className="text-xs text-gray-400 uppercase font-bold">Search Keywords</label>
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

                {/* Availability Field */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 uppercase font-bold">Face-to-Face Availability</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <select
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-2.5 pl-9 pr-2 text-white text-sm focus:border-neon-purple outline-none appearance-none cursor-pointer"
                      value={configForm.availability}
                      onChange={e => setConfigForm({ ...configForm, availability: e.target.value })}
                    >
                      <option value="Flexible">Flexible</option>
                      <option value="Available">Available</option>
                      <option value="Not Available">Not Available</option>
                      <option value="Weekends Only">Weekends Only</option>
                      <option value="After Work Hours">After Work Hours</option>
                    </select>
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
                        <div key={skill.id} className="bg-dark-800 p-3 rounded-lg border border-white/10 flex items-center justify-between">
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
                          <button
                            type="button"
                            onClick={() => handleDeleteSkill(skill.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

                {/* Job Search Filters Section */}
                <div className="bg-dark-900/50 p-6 rounded-xl border border-dashed border-gray-600 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-bold flex items-center gap-2 text-sm">
                      <Filter className="text-neon-green w-4 h-4" /> Job Search Filters
                    </h3>
                    {filtersLoading && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Loading filters...
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-400">
                    Select filters to narrow down your job search. These will be applied when running the bot.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Multi-select Filter Component */}
                    {(() => {
                      const MultiSelectFilter = ({
                        filterKey,
                        label,
                        icon: Icon,
                        options,
                        placeholder
                      }: {
                        filterKey: string;
                        label: string;
                        icon: any;
                        options: any[];
                        placeholder: string;
                      }) => {
                        const selected = (selectedFilters as any)[filterKey] || [];
                        const isOpen = openFilterDropdown === filterKey;

                        const toggleOption = (id: string) => {
                          const newSelected = selected.includes(id)
                            ? selected.filter((s: string) => s !== id)
                            : [...selected, id];
                          setSelectedFilters({ ...selectedFilters, [filterKey]: newSelected });
                        };

                        return (
                          <div className="space-y-2 relative">
                            <label className="text-xs text-gray-400 uppercase font-bold flex items-center gap-1">
                              <Icon className="w-3 h-3" /> {label}
                            </label>
                            <div
                              className="w-full bg-dark-900 border border-gray-700 rounded-lg py-2.5 px-3 text-white text-sm cursor-pointer hover:border-neon-green transition-colors min-h-[42px]"
                              onClick={() => setOpenFilterDropdown(isOpen ? null : filterKey)}
                            >
                              {selected.length === 0 ? (
                                <span className="text-gray-500">{placeholder}</span>
                              ) : (
                                <span className="text-neon-green">{selected.length} selected</span>
                              )}
                            </div>
                            {isOpen && options && options.length > 0 && (
                              <div className="absolute z-50 w-full mt-1 bg-dark-800 border border-gray-600 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                {options.map((opt: any) => (
                                  <label
                                    key={opt.id}
                                    className="flex items-center gap-2 px-3 py-2 hover:bg-dark-700 cursor-pointer text-sm"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selected.includes(opt.id)}
                                      onChange={() => toggleOption(opt.id)}
                                      className="w-4 h-4 rounded border-gray-600 bg-dark-900 text-neon-green focus:ring-neon-green focus:ring-offset-0"
                                    />
                                    <span className="text-gray-200 flex-1">{opt.label}</span>
                                    {opt.count && <span className="text-gray-500 text-xs">({opt.count})</span>}
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      };

                      return (
                        <>
                          {/* Freshness - Single Select Dropdown */}
                          <div className="space-y-2">
                            <label className="text-xs text-gray-400 uppercase font-bold flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Freshness
                            </label>
                            <select
                              className="w-full bg-dark-900 border border-gray-700 rounded-lg py-2.5 px-3 text-white text-sm focus:border-neon-green outline-none appearance-none cursor-pointer"
                              value={selectedFilters.freshness}
                              onChange={e => setSelectedFilters({ ...selectedFilters, freshness: e.target.value })}
                            >
                              <option value="">Any Freshness</option>
                              <option value="Last 1 day">Last 1 Day</option>
                              <option value="Last 3 days">Last 3 Days</option>
                              <option value="Last 7 days">Last 7 Days</option>
                              <option value="Last 15 days">Last 15 Days</option>
                              <option value="Last 30 days">Last 30 Days</option>
                            </select>
                          </div>

                          {/* All other filters - Multi-Select */}
                          <MultiSelectFilter filterKey="salaryRange" label="Salary Range" icon={IndianRupee} options={filters.salaryRange || []} placeholder="All Salary Ranges" />
                          <MultiSelectFilter filterKey="wfhType" label="Work Type" icon={Home} options={filters.wfhType || []} placeholder="All Work Types" />
                          <MultiSelectFilter filterKey="citiesGid" label="City" icon={MapPin} options={filters.citiesGid || []} placeholder="All Cities" />
                          <MultiSelectFilter filterKey="functionalAreaGid" label="Functional Area" icon={Briefcase} options={filters.functionalAreaGid || []} placeholder="All Functional Areas" />
                          <MultiSelectFilter filterKey="industryTypeGid" label="Industry" icon={Building2} options={filters.industryTypeGid || []} placeholder="All Industries" />
                          <MultiSelectFilter filterKey="glbl_RoleCat" label="Role Category" icon={Briefcase} options={filters.glbl_RoleCat || []} placeholder="All Role Categories" />
                          <MultiSelectFilter filterKey="ugCourseGid" label="UG Qualification" icon={GraduationCap} options={filters.ugCourseGid || []} placeholder="All UG Qualifications" />
                          <MultiSelectFilter filterKey="pgCourseGid" label="PG Qualification" icon={GraduationCap} options={filters.pgCourseGid || []} placeholder="All PG Qualifications" />
                          <MultiSelectFilter filterKey="business_size" label="Company Type" icon={Building2} options={filters.business_size || []} placeholder="All Company Types" />
                          <MultiSelectFilter filterKey="employement" label="Employment Type" icon={Briefcase} options={filters.employement || []} placeholder="All Employment Types" />
                          <MultiSelectFilter filterKey="topGroupId" label="Top Companies" icon={Building2} options={filters.topGroupId || []} placeholder="All Companies" />
                          <MultiSelectFilter filterKey="featuredCompanies" label="Featured Companies" icon={Star} options={filters.featuredCompanies || []} placeholder="All Featured Companies" />
                        </>
                      );
                    })()}
                  </div>

                  {/* Selected Filters Summary */}
                  {(selectedFilters.freshness || Object.entries(selectedFilters).some(([k, v]) => k !== 'freshness' && Array.isArray(v) && v.length > 0)) && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Selected Filters:</span>
                        <button
                          type="button"
                          onClick={() => setSelectedFilters({
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
                            featuredCompanies: []
                          })}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {/* Freshness - single value */}
                        {selectedFilters.freshness && (
                          <span className="bg-neon-blue/10 text-neon-blue text-xs px-2 py-1 rounded border border-neon-blue/30">
                            {selectedFilters.freshness}
                          </span>
                        )}
                        {/* Multi-select filters - show each selected item */}
                        {selectedFilters.salaryRange?.map((id: string) => (
                          <span key={`sal-${id}`} className="bg-neon-green/10 text-neon-green text-xs px-2 py-1 rounded border border-neon-green/30">
                            {filters.salaryRange?.find((o: any) => o.id === id)?.label || id}
                          </span>
                        ))}
                        {selectedFilters.wfhType?.map((id: string) => (
                          <span key={`wfh-${id}`} className="bg-neon-blue/10 text-neon-blue text-xs px-2 py-1 rounded border border-neon-blue/30">
                            {filters.wfhType?.find((o: any) => o.id === id)?.label || id}
                          </span>
                        ))}
                        {selectedFilters.citiesGid?.map((id: string) => (
                          <span key={`city-${id}`} className="bg-neon-purple/10 text-neon-purple text-xs px-2 py-1 rounded border border-neon-purple/30">
                            {filters.citiesGid?.find((o: any) => o.id === id)?.label || id}
                          </span>
                        ))}
                        {selectedFilters.functionalAreaGid?.map((id: string) => (
                          <span key={`func-${id}`} className="bg-yellow-500/10 text-yellow-400 text-xs px-2 py-1 rounded border border-yellow-500/30">
                            {filters.functionalAreaGid?.find((o: any) => o.id === id)?.label || id}
                          </span>
                        ))}
                        {selectedFilters.industryTypeGid?.map((id: string) => (
                          <span key={`ind-${id}`} className="bg-orange-500/10 text-orange-400 text-xs px-2 py-1 rounded border border-orange-500/30">
                            {filters.industryTypeGid?.find((o: any) => o.id === id)?.label || id}
                          </span>
                        ))}
                        {selectedFilters.glbl_RoleCat?.map((id: string) => (
                          <span key={`role-${id}`} className="bg-pink-500/10 text-pink-400 text-xs px-2 py-1 rounded border border-pink-500/30">
                            {filters.glbl_RoleCat?.find((o: any) => o.id === id)?.label || id}
                          </span>
                        ))}
                        {selectedFilters.ugCourseGid?.map((id: string) => (
                          <span key={`ug-${id}`} className="bg-cyan-500/10 text-cyan-400 text-xs px-2 py-1 rounded border border-cyan-500/30">
                            {filters.ugCourseGid?.find((o: any) => o.id === id)?.label || id}
                          </span>
                        ))}
                        {selectedFilters.pgCourseGid?.map((id: string) => (
                          <span key={`pg-${id}`} className="bg-indigo-500/10 text-indigo-400 text-xs px-2 py-1 rounded border border-indigo-500/30">
                            {filters.pgCourseGid?.find((o: any) => o.id === id)?.label || id}
                          </span>
                        ))}
                        {selectedFilters.business_size?.map((id: string) => (
                          <span key={`biz-${id}`} className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-1 rounded border border-emerald-500/30">
                            {filters.business_size?.find((o: any) => o.id === id)?.label || id}
                          </span>
                        ))}
                        {selectedFilters.employement?.map((id: string) => (
                          <span key={`emp-${id}`} className="bg-rose-500/10 text-rose-400 text-xs px-2 py-1 rounded border border-rose-500/30">
                            {filters.employement?.find((o: any) => o.id === id)?.label || id}
                          </span>
                        ))}
                        {selectedFilters.topGroupId?.map((id: string) => (
                          <span key={`top-${id}`} className="bg-sky-500/10 text-sky-400 text-xs px-2 py-1 rounded border border-sky-500/30">
                            {filters.topGroupId?.find((o: any) => o.id === id)?.label || id}
                          </span>
                        ))}
                        {selectedFilters.featuredCompanies?.map((id: string) => (
                          <span key={`feat-${id}`} className="bg-amber-500/10 text-amber-400 text-xs px-2 py-1 rounded border border-amber-500/30">
                            {filters.featuredCompanies?.find((o: any) => o.id === id)?.label || id}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button className="w-full bg-neon-blue text-black font-bold py-3 rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2 mt-4 shadow-lg shadow-neon-blue/20">
                  <Save className="w-5 h-5" /> Save Configuration
                </button>
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

                <div className="p-4 bg-dark-900/50 rounded-lg border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer group">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-purple-500/10 rounded-lg">
                      <Clock className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-white font-medium text-sm">Schedule Automation</span>
                  </div>
                  <p className="text-xs text-gray-400">Run bot at 9 AM for 40% better response rates</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'history':
        return (
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Application History</h2>
              <button
                onClick={downloadReport}
                className="bg-dark-800 border border-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/10 flex items-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" /> Download XLSX
              </button>
            </div>

            <div className="bg-dark-800 border border-white/10 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/40 text-gray-400 text-xs uppercase border-b border-white/10">
                    <th className="p-4">Date</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Company</th>
                    <th className="p-4">Score</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500 italic">No applications processed yet.</td>
                    </tr>
                  ) : (
                    reports.map((report) => (
                      <tr key={report.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 text-gray-300 font-mono text-xs">{report.date}</td>
                        <td className="p-4 text-white font-medium">{report.jobTitle}</td>
                        <td className="p-4 text-gray-400">{report.company}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${report.matchScore >= 80 ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                            {report.matchScore}%
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${report.status === 'Applied'
                            ? 'bg-green-900/20 text-green-400 border-green-500/30'
                            : 'bg-red-900/20 text-red-400 border-red-500/30'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${report.status === 'Applied' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            {report.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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

      default:
        return <div>Select a menu item</div>;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
};

export default Dashboard;
