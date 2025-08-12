export interface DiagnosticsReport {
  id: number;
  environment_name: string;
  version: string;
  platform: string;
  scheduledFrequency: string;
  initiatedTime: string;
  lastDiagnosticTime: string;
  scanStatus: string;
  remediationEfficiency: number;
  RTO: {
    overall: number;
    individual: {
      label: string;
      lastScan: number;
      current: number;
    }[];
  };
  RPO: {
    overall: number;
    individual: {
      label: string;
      lastScan: number;
      current: number;
    }[];
  };
  resourcesAnalysed: {
    resourceName: string;
    totalCount: number;
    completedCount: number;
  }[];
  resources: {
    logicalResourceId: {
      identifier: string;
    };
    physicalResourceId: {
      identifier: string;
    };
    resourceName: string;
    resourceType: string;
  }[];
  recommendationList: {
    name: string;
    list: {
      is_action_taken: boolean;
      recommendationId: number;
      recommendationStatus: string;
      name: string;
      description: string;
      severity: string;
      changesRequired: string;
      alarmType: string;
    }[];
  }[];
  resillencyScore: {
    componentScore: {
      Alarm: {
        excludedCount: number;
        outstandingCount: number;
        possibleScore: number;
        score: number;
      };
      Compliance: {
        excludedCount: number;
        outstandingCount: number;
        possibleScore: number;
        score: number;
      };
      Sop: {
        excludedCount: number;
        outstandingCount: number;
        possibleScore: number;
        score: number;
      };
      Test: {
        excludedCount: number;
        outstandingCount: number;
        possibleScore: number;
        score: number;
      };
    };
    disruptionScore: {
      AZ: number;
      Hardware: number;
      Region: number;
      Software: number;
    };
    score: number;
  };
  componentRecomendation: [
    {
      is_action_taken: any;
      componentName: string;
      cost: {
        amount: number;
        currency: string;
        frequency: string;
      };
      description: string;
      recommendationId: string,
      optimizationType: string;
      suggestedChanges: string[];
    },
  ];
}

export type ResourceAnalysisChartProps = {
  chartData: {
    label: string;
    value: number;
  }[];
  recommendationList: {
    label: string;
    value: number;
  }[];
  resillencyScore: number;
};
