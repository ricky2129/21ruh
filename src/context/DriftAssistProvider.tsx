import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

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

interface AnalysisSession {
  id: string;
  analysisData: AnalysisData;
  analysisResults: AnalysisState;
  resourceResults: Record<string, ResourceResult>;
  isAnalyzing: boolean;
  analysisComplete: boolean;
  hasStarted: boolean;
  error: string | null;
  timestamp: number;
  reader?: ReadableStreamDefaultReader<Uint8Array>;
  abortController?: AbortController;
}

interface IDriftAssistContext {
  currentSession: AnalysisSession | null;
  sessions: Record<string, AnalysisSession>;
  startAnalysis: (analysisData: AnalysisData, apiBaseUrl: string) => Promise<void>;
  resumeAnalysis: (sessionId: string) => AnalysisSession | null;
  stopAnalysis: (sessionId: string) => void;
  clearSession: (sessionId: string) => void;
  clearAllSessions: () => void;
  updateAnalysisResults: (sessionId: string, results: Partial<AnalysisState>) => void;
  updateResourceResults: (sessionId: string, resourceId: string, results: Partial<ResourceResult>) => void;
  setAnalysisError: (sessionId: string, error: string) => void;
  setAnalysisComplete: (sessionId: string) => void;
}

const initialValue: IDriftAssistContext = {
  currentSession: null,
  sessions: {},
  startAnalysis: async () => {},
  resumeAnalysis: () => null,
  stopAnalysis: () => {},
  clearSession: () => {},
  clearAllSessions: () => {},
  updateAnalysisResults: () => {},
  updateResourceResults: () => {},
  setAnalysisError: () => {},
  setAnalysisComplete: () => {},
};

const DriftAssistContext = createContext<IDriftAssistContext>(initialValue);

interface ContextState {
  children: React.ReactNode;
}

const DriftAssistProvider = ({ children }: ContextState) => {
  const [sessions, setSessions] = useState<Record<string, AnalysisSession>>({});
  const [currentSession, setCurrentSession] = useState<AnalysisSession | null>(null);
  
  // Keep track of active streaming connections
  const activeStreams = useRef<Record<string, { reader: ReadableStreamDefaultReader<Uint8Array>; abortController: AbortController }>>({});

  /**
   * Generate a unique session ID based on analysis data
   */
  const generateSessionId = useCallback((analysisData: AnalysisData): string => {
    return `${analysisData.fileName}_${analysisData.sessionId}_${Date.now()}`;
  }, []);

  /**
   * Handle streaming updates from the analysis
   */
  const handleStreamingUpdate = useCallback((sessionId: string, data: any) => {
    setSessions(prev => {
      const session = prev[sessionId];
      if (!session) return prev;

      const updatedSession = { ...session };

      switch (data.type) {
        case 'session_initialized':
          updatedSession.analysisResults = {
            ...updatedSession.analysisResults,
            status: 'session_initialized',
            session_dir: data.session_dir
          };
          break;

        case 'analysis_started':
          updatedSession.analysisResults = {
            ...updatedSession.analysisResults,
            status: 'started',
            resources: data.resources
          };
          break;

        case 'resource_initialized':
          updatedSession.resourceResults = {
            ...updatedSession.resourceResults,
            [data.resource]: {
              status: 'initialized',
              detectionStatus: data.detectionStatus || 'pending',
              reportStatus: data.reportStatus || 'pending'
            }
          };
          break;

        case 'resource_group_update':
          if (data.data && data.data.resources) {
            updatedSession.analysisResults = {
              ...updatedSession.analysisResults,
              resources: updatedSession.analysisResults.resources || Object.keys(data.data.resources)
            };
            
            const updatedResourceResults = { ...updatedSession.resourceResults };
            
            Object.entries(data.data.resources).forEach(([resourceType, resourceData]: [string, any]) => {
              const hasDetectionResults = resourceData.drift_result && 
                                        (resourceData.drift_result.drifts || resourceData.drift_result.has_drift !== undefined);
              const hasReport = resourceData.report && resourceData.report !== null;
              const isCompleted = resourceData.status === 'completed';
              
              const detectionStatus = isCompleted || hasDetectionResults ? 'complete' : 'pending';
              const reportStatus = isCompleted || hasReport ? 'complete' : 'pending';
              
              updatedResourceResults[resourceType] = {
                status: resourceData.status || 'processing',
                detectionStatus: detectionStatus,
                reportStatus: reportStatus,
                detectionResults: resourceData.drift_result,
                reportResults: resourceData.report
              };
            });
            
            updatedSession.resourceResults = updatedResourceResults;
          }
          break;

        case 'detection_complete':
          updatedSession.resourceResults = {
            ...updatedSession.resourceResults,
            [data.resource]: {
              ...updatedSession.resourceResults[data.resource],
              detectionStatus: 'complete',
              detectionResults: data.results
            }
          };
          break;

        case 'report_complete':
          updatedSession.resourceResults = {
            ...updatedSession.resourceResults,
            [data.resource]: {
              ...updatedSession.resourceResults[data.resource],
              reportStatus: 'complete',
              reportResults: data.results
            }
          };
          break;

        case 'analysis_complete':
          updatedSession.analysisComplete = true;
          updatedSession.isAnalyzing = false;
          // Clean up the active stream
          if (activeStreams.current[sessionId]) {
            delete activeStreams.current[sessionId];
          }
          break;

        case 'error':
          updatedSession.error = data.error;
          updatedSession.isAnalyzing = false;
          // Clean up the active stream
          if (activeStreams.current[sessionId]) {
            delete activeStreams.current[sessionId];
          }
          break;

        default:
          // Unknown streaming update type
      }

      return {
        ...prev,
        [sessionId]: updatedSession
      };
    });
  }, []);

  /**
   * Start a new analysis session
   */
  const startAnalysis = useCallback(async (analysisData: AnalysisData, apiBaseUrl: string) => {
    const sessionId = generateSessionId(analysisData);
    
    // Create new session
    const newSession: AnalysisSession = {
      id: sessionId,
      analysisData,
      analysisResults: {},
      resourceResults: {},
      isAnalyzing: true,
      analysisComplete: false,
      hasStarted: true,
      error: null,
      timestamp: Date.now()
    };

    // Add session to state
    setSessions(prev => ({
      ...prev,
      [sessionId]: newSession
    }));
    
    setCurrentSession(newSession);

    try {
      const abortController = new AbortController();
      
      const response = await fetch(`${apiBaseUrl}/api/s3/analyze-state-file-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: analysisData.sessionId,
          selected_resources: analysisData.selectedResources,
          state_data: analysisData.stateData,
          file_name: analysisData.fileName,
          file_key: analysisData.fileKey,
          source: analysisData.source,
          bucket_name: analysisData.bucketName,
          terraformAnalysis: analysisData.terraformAnalysis,
          configurationSummary: analysisData.configurationSummary
        }),
        signal: abortController.signal
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        const errorMessage = errorData.details || errorData.error || `Analysis failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }
      
      // Store the reader and abort controller for potential cleanup
      activeStreams.current[sessionId] = { reader, abortController };
      
      const decoder = new TextDecoder();

      // Start reading the stream in the background
      const readStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              break;
            }

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  handleStreamingUpdate(sessionId, data);
                } catch (parseError) {
                  console.warn('Failed to parse streaming data:', parseError);
                }
              }
            }
          }
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error('Streaming error:', error);
            setSessions(prev => ({
              ...prev,
              [sessionId]: {
                ...prev[sessionId],
                error: error instanceof Error ? error.message : 'Streaming error occurred',
                isAnalyzing: false
              }
            }));
          }
        } finally {
          // Clean up
          if (activeStreams.current[sessionId]) {
            delete activeStreams.current[sessionId];
          }
        }
      };

      // Start reading stream in background
      readStream();

    } catch (error) {
      console.error('Analysis start error:', error);
      setSessions(prev => ({
        ...prev,
        [sessionId]: {
          ...prev[sessionId],
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          isAnalyzing: false
        }
      }));
    }

    return sessionId;
  }, [generateSessionId, handleStreamingUpdate]);

  /**
   * Resume an existing analysis session
   */
  const resumeAnalysis = useCallback((sessionId: string): AnalysisSession | null => {
    const session = sessions[sessionId];
    if (session) {
      setCurrentSession(session);
      return session;
    }
    return null;
  }, [sessions]);

  /**
   * Stop an active analysis
   */
  const stopAnalysis = useCallback((sessionId: string) => {
    // Abort the stream if it's active
    if (activeStreams.current[sessionId]) {
      activeStreams.current[sessionId].abortController.abort();
      activeStreams.current[sessionId].reader.cancel();
      delete activeStreams.current[sessionId];
    }

    setSessions(prev => ({
      ...prev,
      [sessionId]: {
        ...prev[sessionId],
        isAnalyzing: false
      }
    }));
  }, []);

  /**
   * Clear a specific session
   */
  const clearSession = useCallback((sessionId: string) => {
    // Stop analysis if running
    stopAnalysis(sessionId);
    
    setSessions(prev => {
      const newSessions = { ...prev };
      delete newSessions[sessionId];
      return newSessions;
    });

    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
    }
  }, [stopAnalysis, currentSession]);

  /**
   * Clear all sessions
   */
  const clearAllSessions = useCallback(() => {
    // Stop all active analyses
    Object.keys(activeStreams.current).forEach(sessionId => {
      stopAnalysis(sessionId);
    });
    
    setSessions({});
    setCurrentSession(null);
  }, [stopAnalysis]);

  /**
   * Update analysis results for a session
   */
  const updateAnalysisResults = useCallback((sessionId: string, results: Partial<AnalysisState>) => {
    setSessions(prev => ({
      ...prev,
      [sessionId]: {
        ...prev[sessionId],
        analysisResults: {
          ...prev[sessionId]?.analysisResults,
          ...results
        }
      }
    }));
  }, []);

  /**
   * Update resource results for a session
   */
  const updateResourceResults = useCallback((sessionId: string, resourceId: string, results: Partial<ResourceResult>) => {
    setSessions(prev => ({
      ...prev,
      [sessionId]: {
        ...prev[sessionId],
        resourceResults: {
          ...prev[sessionId]?.resourceResults,
          [resourceId]: {
            ...prev[sessionId]?.resourceResults[resourceId],
            ...results
          }
        }
      }
    }));
  }, []);

  /**
   * Set analysis error for a session
   */
  const setAnalysisError = useCallback((sessionId: string, error: string) => {
    setSessions(prev => ({
      ...prev,
      [sessionId]: {
        ...prev[sessionId],
        error,
        isAnalyzing: false
      }
    }));
  }, []);

  /**
   * Set analysis complete for a session
   */
  const setAnalysisComplete = useCallback((sessionId: string) => {
    setSessions(prev => ({
      ...prev,
      [sessionId]: {
        ...prev[sessionId],
        analysisComplete: true,
        isAnalyzing: false
      }
    }));
  }, []);

  return (
    <DriftAssistContext.Provider
      value={{
        currentSession,
        sessions,
        startAnalysis,
        resumeAnalysis,
        stopAnalysis,
        clearSession,
        clearAllSessions,
        updateAnalysisResults,
        updateResourceResults,
        setAnalysisError,
        setAnalysisComplete,
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
