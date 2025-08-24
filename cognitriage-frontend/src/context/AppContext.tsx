import { createContext, useContext, useState, ReactNode } from 'react';

export interface PatientData {
  age: number | "";
  moca: number | "";
  sex: string;
  files: File[];
}

export interface AnalysisResult {
  jobId: string | null;
  status: any;
  result: any;
  triage?: any;
  note?: any;
  citations?: any[];
  trials?: any[];
  treatment_recommendations?: any;
}

interface AppContextType {
  patientData: PatientData;
  setPatientData: (data: Partial<PatientData>) => void;
  
  analysisResult: AnalysisResult;
  setAnalysisResult: (result: Partial<AnalysisResult>) => void;
  
  clearAll: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialPatientData: PatientData = {
  age: "",
  moca: "",
  sex: "F",
  files: []
};

const initialAnalysisResult: AnalysisResult = {
  jobId: null,
  status: null,
  result: null,
  triage: null,
  note: null,
  citations: [],
  trials: [],
  treatment_recommendations: null
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [patientData, setPatientDataState] = useState<PatientData>(initialPatientData);
  const [analysisResult, setAnalysisResultState] = useState<AnalysisResult>(initialAnalysisResult);

  const setPatientData = (data: Partial<PatientData>) => {
    setPatientDataState(prev => ({ ...prev, ...data }));
  };

  const setAnalysisResult = (result: Partial<AnalysisResult>) => {
    setAnalysisResultState(prev => ({ ...prev, ...result }));
  };

  const clearAll = () => {
    setPatientDataState(initialPatientData);
    setAnalysisResultState(initialAnalysisResult);
  };

  return (
    <AppContext.Provider value={{
      patientData,
      setPatientData,
      analysisResult,
      setAnalysisResult,
      clearAll
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
