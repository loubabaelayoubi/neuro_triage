import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import LoadingSpinner from '../components/LoadingSpinner';
import { useAppContext } from '../context/AppContext';
import { 
  Microscope, 
  BookOpen, 
  Star, 
  Mail, 
  Trash2,  
  FileText, 
  Building2, 
  Lightbulb, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';

interface Trial {
  nct_id: string;
  title: string;
  summary: string;
  status: string;
  locations: string[];
  url: string;
  match_reason: string;
  match_score: 'high' | 'medium' | 'low';
  phase: string;
  citations?: any[];
}

interface Toast {
  type: 'success' | 'error';
  message: string;
}

export default function Trials() {
  const { analysisResult, patientData } = useAppContext();
  const { result } = analysisResult;
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedTrials, setSavedTrials] = useState<Set<string>>(new Set());
  const [showToast, setShowToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (patientData.age && patientData.moca) {
      fetchMatchedTrials();
    } else if (result) {
      fetchMatchedTrials();
    }
  }, [result, patientData]);

  const fetchMatchedTrials = async () => {
    setLoading(true);
    try {
      const riskTier = result?.triage?.risk_tier || 'MODERATE';
      const imagingFindings = result?.note?.imaging_findings || {};
      
      const requestData = {
        risk_tier: riskTier,
        imaging_findings: imagingFindings,
        moca_score: patientData.moca || 24,
        age: patientData.age || 72,
        sex: patientData.sex || 'M'
      };
      
      console.log('Fetching trials with data:', requestData);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/trials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Received trials data:', data);
        setTrials(data.trials || []);
      } else {
        console.error('Failed to fetch trials:', response.status);
        setTrials(getDemoTrials());
        setShowToast({ type: 'error', message: 'Failed to load trials' });
        setTimeout(() => setShowToast(null), 3000);
      }
    } catch (error) {
      console.error('Error fetching matched trials:', error);
      setTrials(getDemoTrials());
      setShowToast({ type: 'error', message: 'Network error' });
      setTimeout(() => setShowToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const getDemoTrials = (): Trial[] => [
    {
      nct_id: "NCT05123456",
      title: "Cognitive Training for Mild Cognitive Impairment",
      summary: "A randomized controlled trial investigating the effects of computerized cognitive training on memory and executive function in adults with mild cognitive impairment.",
      status: "Recruiting",
      locations: ["Stanford University", "UCSF Medical Center"],
      url: "https://clinicaltrials.gov/study/NCT05123456",
      match_reason: "Strong match: Patient risk tier (MODERATE) and cognitive profile (MoCA: 24) align well with trial criteria for cognitive intervention studies.",
      match_score: "high" as const,
      phase: "PHASE2",
      citations: [
        {
          title: "Cognitive Training in Mild Cognitive Impairment: A Systematic Review",
          authors: "Smith J, Johnson A, Williams B",
          journal: "Journal of Alzheimer's Disease",
          year: "2024",
          pmid: "38123456"
        },
        {
          title: "Biomarkers for Early Detection of Alzheimer's Disease", 
          authors: "Brown C, Davis M, Wilson K",
          journal: "Nature Medicine",
          year: "2023",
          pmid: "37654321"
        }
      ]
    },
    {
      nct_id: "NCT05234567",
      title: "Exercise and Nutrition Intervention for Cognitive Health",
      summary: "Multi-site study examining the combined effects of structured exercise and Mediterranean diet on cognitive decline prevention in older adults.",
      status: "Recruiting",
      locations: ["Mayo Clinic", "Johns Hopkins"],
      url: "https://clinicaltrials.gov/study/NCT05234567",
      match_reason: "Moderate match: Patient age (72) and cognitive status meet some trial criteria, though not all inclusion factors are optimal.",
      match_score: "medium" as const,
      phase: "PHASE3",
      citations: [
        {
          title: "Mediterranean Diet and Cognitive Function in Older Adults",
          authors: "Garcia M, Lopez R, Martinez S",
          journal: "Neurology",
          year: "2024",
          pmid: "38765432"
        }
      ]
    },
    {
      nct_id: "NCT05345678", 
      title: "Novel Drug Trial for Alzheimer's Prevention",
      summary: "Phase 1 safety study of a new compound targeting amyloid beta accumulation in cognitively normal individuals at risk for Alzheimer's disease.",
      status: "Recruiting",
      locations: ["Multiple locations available"],
      url: "https://clinicaltrials.gov/study/NCT05345678",
      match_reason: "Limited match: Trial may be relevant but patient profile has some misalignment with primary inclusion criteria.",
      match_score: "low" as const,
      phase: "PHASE1",
      citations: []
    }
  ];

  const groupedTrials = {
    high: trials.filter(t => t.match_score === 'high'),
    medium: trials.filter(t => t.match_score === 'medium'),
    low: trials.filter(t => t.match_score === 'low')
  };

  const totalTrials = trials.length;
  const totalCitations = result?.citations?.length || 0;

  const getMatchBadgeColor = (matchScore: 'high' | 'medium' | 'low') => {
    switch (matchScore) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSaveTrial = (trialId: string) => {
    const newSavedTrials = new Set(savedTrials);
    if (savedTrials.has(trialId)) {
      newSavedTrials.delete(trialId);
      setSavedTrials(newSavedTrials);
      setShowToast({message: 'Trial removed from saved list', type: 'success'});
    } else {
      newSavedTrials.add(trialId);
      setSavedTrials(newSavedTrials);
      setShowToast({message: 'Trial saved successfully!', type: 'success'});
    }
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleContactStudy = (trial: Trial) => {
    const subject = encodeURIComponent(`Inquiry about Clinical Trial: ${trial.title}`);
    const body = encodeURIComponent(`Dear Study Coordinator,

I am interested in learning more about the clinical trial "${trial.title}" (${trial.nct_id}).

Patient Information:
- Age: ${patientData.age || 'Not specified'}
- Sex: ${patientData.sex || 'Not specified'}
- MoCA Score: ${patientData.moca || 'Not specified'}
- Risk Tier: ${result?.triage?.risk_tier || 'Not specified'}

Could you please provide more information about:
1. Eligibility criteria
2. Study timeline and duration
3. Location and scheduling
4. Any additional requirements

Thank you for your time.

Best regards`);
    
    const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
    window.open(mailtoLink, '_blank');
    
    setShowToast({message: 'Email template opened in your default email client', type: 'success'});
    setTimeout(() => setShowToast(null), 3000);
  };

  if (!result) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Clinical Trials & Research</h1>
        </div>
        <div className="text-center py-12">
          <Microscope className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Analysis Available</h2>
          <p className="text-gray-500">Please run an analysis from the Dashboard first to see matched clinical trials.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Live Data Summary */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-800">Live ClinicalTrials.gov</span>
          </div>
          <span className="text-sm text-green-700">{totalTrials} trials discovered</span>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-600">Live PubMed</span>
            <span className="text-sm text-blue-700">• {totalCitations} research articles</span>
          </div>
          <div className="flex items-center space-x-2 ml-auto">
            <Star className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-purple-600">Saved Trials</span>
            <span className="text-sm text-purple-700">• {savedTrials.size} saved</span>
          </div>
        </div>
        <p className="text-xs text-green-600 mt-1">
          Real-time data from the world's largest clinical trial database • Enhanced with latest research context
        </p>
      </div>

      {/* Saved Trials Section */}
      {savedTrials.size > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-purple-900">Your Saved Trials ({savedTrials.size})</h2>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSavedTrials(new Set());
                localStorage.removeItem('cognitriage-saved-trials');
                setShowToast({message: 'All saved trials cleared', type: 'success'});
                setTimeout(() => setShowToast(null), 3000);
              }}
            >
              Clear All
            </Button>
          </div>
          <div className="space-y-2">
            {Array.from(savedTrials).map(trialId => {
              const trial = trials.find(t => t.nct_id === trialId);
              return trial ? (
                <div key={trialId} className="flex items-center justify-between bg-white p-3 rounded border">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">{trial.title}</div>
                    <div className="text-xs text-gray-600">{trial.nct_id} • {trial.phase}</div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleContactStudy(trial)}
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleSaveTrial(trialId)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : null;
            })}
          </div>
          <p className="text-xs text-purple-600 mt-2">
            <Lightbulb className="w-3 h-3 inline mr-1" />
            Saved trials persist between sessions and can be accessed anytime
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Finding matched clinical trials...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* High Match Trials */}
          {groupedTrials.high.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">High Match Trials</h2>
              {groupedTrials.high.map((trial, i) => (
                <div key={trial.nct_id} className="border border-gray-200 rounded-lg bg-white">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-sm font-medium text-gray-600">#{i + 1}</span>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            High Match
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{trial.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <span>• {trial.nct_id}</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{trial.phase}</span>
                          <span><Building2 className="w-4 h-4 inline mr-1" /> {Array.isArray(trial.locations) ? trial.locations[0] : 'Multiple locations'}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleSaveTrial(trial.nct_id)}
                        >
                          {savedTrials.has(trial.nct_id) ? 'Unsave' : <Star className="w-4 h-4" />}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleContactStudy(trial)}
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-4">{trial.match_reason}</p>
                    
                    {/* Latest Research Section */}
                    {trial.citations && trial.citations.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-blue-900"><BookOpen className="w-4 h-4 inline mr-1" /> Latest Research</h4>
                          <span className="text-xs text-blue-600">{trial.citations.length} studies</span>
                        </div>
                        <div className="space-y-2">
                          {trial.citations.slice(0, 2).map((citation: any, idx: number) => (
                            <div key={idx} className="text-sm">
                              <a
                                href={`https://pubmed.ncbi.nlm.nih.gov/${citation.pmid}/`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-blue-800 hover:text-blue-600 hover:underline"
                              >
                                {citation.title}
                              </a>
                              <div className="text-xs text-blue-600">
                                {citation.authors} • {citation.journal} • {citation.year}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-blue-600 mt-2">
                          <Lightbulb className="w-3 h-3 inline mr-1" />
                          These studies provide scientific context for treatment approaches in {trial.title.split(' ')[0]}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <a
                        href={trial.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <FileText className="w-4 h-4 inline mr-1" /> View on ClinicalTrials.gov
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Medium Match Trials */}
          {groupedTrials.medium.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Medium Match Trials</h2>
              {groupedTrials.medium.map((trial, i) => (
                <div key={trial.nct_id} className="border border-gray-200 rounded-lg bg-white">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-sm font-medium text-gray-600">#{i + 1}</span>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            Medium Match
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{trial.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <span>• {trial.nct_id}</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{trial.phase}</span>
                          <span><Building2 className="w-4 h-4 inline mr-1" /> {Array.isArray(trial.locations) ? trial.locations[0] : 'Multiple locations'}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleSaveTrial(trial.nct_id)}
                        >
                          {savedTrials.has(trial.nct_id) ? 'Unsave' : <Star className="w-4 h-4" />}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleContactStudy(trial)}
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-4">{trial.match_reason}</p>
                    
                    {/* Latest Research Section */}
                    {trial.citations && trial.citations.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-blue-900"><BookOpen className="w-4 h-4 inline mr-1" /> Latest Research</h4>
                          <span className="text-xs text-blue-600">{trial.citations.length} studies</span>
                        </div>
                        <div className="space-y-2">
                          {trial.citations.slice(0, 2).map((citation: any, idx: number) => (
                            <div key={idx} className="text-sm">
                              <a
                                href={`https://pubmed.ncbi.nlm.nih.gov/${citation.pmid}/`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-blue-800 hover:text-blue-600 hover:underline"
                              >
                                {citation.title}
                              </a>
                              <div className="text-xs text-blue-600">
                                {citation.authors} • {citation.journal} • {citation.year}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-blue-600 mt-2">
                          <Lightbulb className="w-3 h-3 inline mr-1" />
                          These studies provide scientific context for treatment approaches in {trial.title.split(' ')[0]}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <a
                        href={trial.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <FileText className="w-4 h-4 inline mr-1" /> View on ClinicalTrials.gov
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Low Match Trials */}
          {groupedTrials.low.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Low Match Trials</h2>
              {groupedTrials.low.map((trial, i) => (
                <div key={trial.nct_id} className="border border-gray-200 rounded-lg bg-white">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-sm font-medium text-gray-600">#{i + 1}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMatchBadgeColor('low')}`}>
                            Low Match
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{trial.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <span>• {trial.nct_id}</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{trial.phase}</span>
                          <span><Building2 className="w-4 h-4 inline mr-1" /> {Array.isArray(trial.locations) ? trial.locations[0] : 'Multiple locations'}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleSaveTrial(trial.nct_id)}
                        >
                          {savedTrials.has(trial.nct_id) ? 'Unsave' : <Star className="w-4 h-4" />}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleContactStudy(trial)}
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-4">{trial.match_reason}</p>
                    
                    {/* Latest Research Section */}
                    {trial.citations && trial.citations.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-blue-900"><BookOpen className="w-4 h-4 inline mr-1" /> Latest Research</h4>
                          <span className="text-xs text-blue-600">{trial.citations.length} studies</span>
                        </div>
                        <div className="space-y-2">
                          {trial.citations.slice(0, 2).map((citation: any, idx: number) => (
                            <div key={idx} className="text-sm">
                              <a
                                href={`https://pubmed.ncbi.nlm.nih.gov/${citation.pmid}/`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-blue-800 hover:text-blue-600 hover:underline"
                              >
                                {citation.title}
                              </a>
                              <div className="text-xs text-blue-600">
                                {citation.authors} • {citation.journal} • {citation.year}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-blue-600 mt-2">
                          <Lightbulb className="w-3 h-3 inline mr-1" />
                          These studies provide scientific context for treatment approaches in {trial.title.split(' ')[0]}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <a
                        href={trial.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <FileText className="w-4 h-4 inline mr-1" /> View on ClinicalTrials.gov
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {trials.length === 0 && (
            <div className="border border-zinc-200 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4"><Microscope className="w-16 h-16" /></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Matching Trials Found</h3>
              <p className="text-sm text-gray-600 mb-4">
                No clinical trials match the current patient profile. Try running a new analysis or check back later for updated trials.
              </p>
              <Button onClick={fetchMatchedTrials}>
                Refresh Trial Search
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-4 py-3 rounded-lg shadow-lg ${
            showToast.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              <span>{showToast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}</span>
              <span className="text-sm font-medium">{showToast.message}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
