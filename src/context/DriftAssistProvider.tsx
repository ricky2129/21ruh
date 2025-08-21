import { createContext, useContext, useState, useEffect, useCallback } from "react";

interface AnalysisData {
  sessionId: string;
  selectedResources: string[];
  stateData: any;
  fileName: string;
  fileKey: string;
  source: string;
  bucketName: string;
  terraformAnalysis?: any;
  configurationSummary?: any;
}

interface ResourceResult {
  status: string;
  detectionStatus: string;
  reportStatus: string;
  detectionResults?: any;
  reportResults?: any;
}

interface AnalysisState {
  status?: string;
  session_dir?: string;
  resources?: string[];
  [key: string]: any;
}

interface DriftAssistState {
  // Current analysis data
  currentAnalysisData: AnalysisData | null;
  analysisResults: AnalysisState;
  resourceResults: Record<string, ResourceResult>;
  isAnalyzing: boolean;
  analysisComplete: boolean;
  hasStarted: boolean;
  error: string | null;
  
  // Persistence key for localStorage
  persistenceKey: string;
}

interface IDriftAssistContext extends DriftAssistState {
  // State setters
  setCurrentAnalysisData: (data: AnalysisData | null) => void;
  setAnalysisResults: (results: AnalysisState | ((prev: AnalysisState) => AnalysisState)) => void;
  setResourceResults: (results: Record<string, ResourceResult> | ((prev: Record<string, ResourceResult>) => Record<string, ResourceResult>)) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  setAnalysisComplete: (complete: boolean) => void;
  setHasStarted: (started: boolean) => void;
  setError: (error: string | null) => void;
  
  // Utility functions
  clearAnalysisState: () => void;
  saveStateToStorage: () => void;
  loadStateFromStorage: () => boolean;
  hasPersistedState: () => boolean;
}

const initialState: DriftAssistState = {
  currentAnalysisData: null,
  analysisResults: {},
  resourceResults: {},
  isAnalyzing: false,
  analysisComplete: false,
  hasStarted: false,
  error: null,
  persistenceKey: 'drift-assist-state'
};

const DriftAssistContext = createContext<IDriftAssistContext>({
  ...initialState,
  setCurrentAnalysisData: () => {},
  setAnalysisResults: () => {},
  setResourceResults: () => {},
  setIsAnalyzing: () => {},
  setAnalysisComplete: () => {},
  setHasStarted: () => {},
  setError: () => {},
  clearAnalysisState: () => {},
  saveStateToStorage: () => {},
  loadStateFromStorage: () => false,
  hasPersistedState: () => false,
});

interface ContextState {
  children: React.ReactNode;
}

const DriftAssistProvider = ({ children }: ContextState) => {
  const [currentAnalysisData, setCurrentAnalysisData] = useState<AnalysisData | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisState>({});
  const [resourceResults, setResourceResults] = useState<Record<string, ResourceResult>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persistenceKey = 'drift-assist-state';

  // Save state to localStorage
  const saveStateToStorage = useCallback(() => {
    try {
      const stateToSave = {
        currentAnalysisData,
        analysisResults,
        resourceResults,
        isAnalyzing,
        analysisComplete,
        hasStarted,
        error,
        timestamp: Date.now()
      };
      
      localStorage.setItem(persistenceKey, JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Failed to save drift assist state to localStorage:', error);
    }
  }, [currentAnalysisData, analysisResults, resourceResults, isAnalyzing, analysisComplete, hasStarted, error, persistenceKey]);

  // Load state from localStorage
  const loadStateFromStorage = useCallback((): boolean => {
    try {
      const savedState = localStorage.getItem(persistenceKey);
      if (!savedState) return false;

      const parsedState = JSON.parse(savedState);
      
      // Check if the saved state is not too old (e.g., 24 hours)
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      if (parsedState.timestamp && (Date.now() - parsedState.timestamp) > maxAge) {
        localStorage.removeItem(persistenceKey);
        return false;
      }

      // Restore state
      if (parsedState.currentAnalysisData) setCurrentAnalysisData(parsedState.currentAnalysisData);
      if (parsedState.analysisResults) setAnalysisResults(parsedState.analysisResults);
      if (parsedState.resourceResults) setResourceResults(parsedState.resourceResults);
      if (typeof parsedState.isAnalyzing === 'boolean') setIsAnalyzing(parsedState.isAnalyzing);
      if (typeof parsedState.analysisComplete === 'boolean') setAnalysisComplete(parsedState.analysisComplete);
      if (typeof parsedState.hasStarted === 'boolean') setHasStarted(parsedState.hasStarted);
      if (parsedState.error !== undefined) setError(parsedState.error);

      return true;
    } catch (error) {
      console.warn('Failed to load drift assist state from localStorage:', error);
      localStorage.removeItem(persistenceKey);
      return false;
    }
  }, [persistenceKey]);

  // Check if there's persisted state
  const hasPersistedState = useCallback((): boolean => {
    try {
      const savedState = localStorage.getItem(persistenceKey);
      if (!savedState) return false;

      const parsedState = JSON.parse(savedState);
      
      // Check if the saved state is not too old
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      if (parsedState.timestamp && (Date.now() - parsedState.timestamp) > maxAge) {
        localStorage.removeItem(persistenceKey);
        return false;
      }

      return !!(parsedState.currentAnalysisData || parsedState.hasStarted);
    } catch (error) {
      return false;
    }
  }, [persistenceKey]);

  // Clear analysis state
  const clearAnalysisState = useCallback(() => {
    setCurrentAnalysisData(null);
    setAnalysisResults({});
    setResourceResults({});
    setIsAnalyzing(false);
    setAnalysisComplete(false);
    setHasStarted(false);
    setError(null);
    
    // Also clear from localStorage
    localStorage.removeItem(persistenceKey);
  }, [persistenceKey]);

  // Auto-save state when it changes
  useEffect(() => {
    if (currentAnalysisData || hasStarted) {
      saveStateToStorage();
    }
  }, [currentAnalysisData, analysisResults, resourceResults, isAnalyzing, analysisComplete, hasStarted, error, saveStateToStorage]);

  // Load state on mount
  useEffect(() => {
    loadStateFromStorage();
  }, [loadStateFromStorage]);

  // Enhanced setters that trigger auto-save
  const enhancedSetAnalysisResults = useCallback((results: AnalysisState | ((prev: AnalysisState) => AnalysisState)) => {
    setAnalysisResults(results);
  }, []);

  const enhancedSetResourceResults = useCallback((results: Record<string, ResourceResult> | ((prev: Record<string, ResourceResult>) => Record<string, ResourceResult>)) => {
    setResourceResults(results);
  }, []);

  return (
    <DriftAssistContext.Provider
      value={{
        // State
        currentAnalysisData,
        analysisResults,
        resourceResults,
        isAnalyzing,
        analysisComplete,
        hasStarted,
        error,
        persistenceKey,
        
        // Setters
        setCurrentAnalysisData,
        setAnalysisResults: enhancedSetAnalysisResults,
        setResourceResults: enhancedSetResourceResults,
        setIsAnalyzing,
        setAnalysisComplete,
        setHasStarted,
        setError,
        
        // Utility functions
        clearAnalysisState,
        saveStateToStorage,
        loadStateFromStorage,
        hasPersistedState,
      }}
    >
      {children}
    </DriftAssistContext.Provider>
  );
};

export default DriftAssistProvider;

// eslint-disable-next-line react-refresh/only-export-components
export const useDriftAssist = () => {
  return useContext(DriftAssistContext);
};
