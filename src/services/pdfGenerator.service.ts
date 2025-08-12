import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { UserOptions } from 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: UserOptions) => jsPDF;
  }
}

export interface DriftData {
  type: string;
  resource: string[];
  details: string;
  expected_value?: any;
  actual_value?: any;
  attribute?: string;
  severity?: string;
}

export interface AnalysisResults {
  drifts: DriftData[];
  summary?: {
    total_drifts: number;
    drift_types: Record<string, number>;
    severity_distribution: Record<string, number>;
  };
  metadata?: {
    resource_type: string;
    file_name: string;
    analysis_timestamp: string;
  };
}

export class PDFGeneratorService {
  private doc: jsPDF;
  private pageHeight: number;
  private pageWidth: number;
  private currentY: number;
  private margin: number;
  private lineHeight: number;

  // Color scheme
  private colors = {
    primary: [51, 102, 204] as [number, number, number],
    secondary: [204, 102, 51] as [number, number, number],
    success: [51, 179, 77] as [number, number, number],
    warning: [230, 179, 26] as [number, number, number],
    danger: [204, 51, 51] as [number, number, number],
    info: [77, 179, 230] as [number, number, number],
    lightGray: [242, 242, 242] as [number, number, number],
    darkGray: [77, 77, 77] as [number, number, number],
  };

  // Drift type configurations
  private driftConfig = {
    missing: {
      label: 'Missing Resources',
      color: this.colors.danger,
      severity: 'High',
      icon: '❌',
      description: 'Resources defined in IaC but not found in cloud',
    },
    orphaned: {
      label: 'Orphaned Resources',
      color: this.colors.warning,
      severity: 'Medium',
      icon: '🔗',
      description: 'Resources in cloud but not managed by IaC',
    },
    configuration_drift: {
      label: 'Configuration Drift',
      color: this.colors.info,
      severity: 'Medium',
      icon: '⚙️',
      description: 'Resources with configuration differences',
    },
    error: {
      label: 'Analysis Errors',
      color: this.colors.danger,
      severity: 'High',
      icon: '⚠️',
      description: 'Errors encountered during analysis',
    },
  };

  constructor() {
    this.doc = new jsPDF();
    this.pageHeight = this.doc.internal.pageSize.height;
    this.pageWidth = this.doc.internal.pageSize.width;
    this.currentY = 20;
    this.margin = 20;
    this.lineHeight = 7;
  }

  public generateDriftAnalysisReport(
    analysisResults: AnalysisResults,
    resourceType: string,
    fileName: string
  ): Uint8Array {
    try {
      // Initialize document
      this.doc = new jsPDF();
      this.currentY = 20;

      // Build report sections
      this.buildTitleSection(fileName, resourceType);
      this.buildAnalysisSummary(analysisResults.drifts, resourceType);
      this.buildImpactAssessment(analysisResults.drifts, resourceType);
      this.buildDetailedAnalysis(analysisResults.drifts);
      this.buildRemediationGuidance(analysisResults.drifts, resourceType);

      // Return PDF as Uint8Array
      return this.doc.output('arraybuffer') as Uint8Array;
    } catch (error) {
      console.error('Failed to generate PDF report:', error);
      return this.generateErrorReport(error as Error);
    }
  }

  private generateErrorReport(error: Error): Uint8Array {
    try {
      this.doc = new jsPDF();
      this.currentY = 20;
      
      this.addSectionHeader('PDF Generation Error');
      this.addText(`An error occurred while generating the PDF report: ${error.message}`);
      this.addText('Please try again or contact support if the issue persists.');
      
      return this.doc.output('arraybuffer') as Uint8Array;
    } catch {
      // Fallback: return minimal error PDF
      const errorDoc = new jsPDF();
      errorDoc.text('PDF Generation Error', 20, 20);
      return errorDoc.output('arraybuffer') as Uint8Array;
    }
  }

  private buildTitleSection(fileName: string, resourceType: string): void {
    // Main title
    this.doc.setFontSize(24);
    this.doc.setTextColor(...this.colors.primary);
    this.doc.setFont('helvetica', 'bold');
    
    const title = 'Infrastructure Drift Analysis Report';
    const titleWidth = this.doc.getTextWidth(title);
    const titleX = (this.pageWidth - titleWidth) / 2;
    
    this.doc.text(title, titleX, this.currentY);
    this.currentY += 20;

    // Metadata table
    const metadata = [
      ['Report Generated:', new Date().toLocaleString()],
      ['Source File:', fileName],
      ['Resource Type:', resourceType.toUpperCase()],
      ['Analysis Type:', 'Infrastructure Drift Detection'],
    ];

    this.doc.autoTable({
      startY: this.currentY,
      head: [],
      body: metadata,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: this.colors.lightGray },
        1: { fontStyle: 'normal' },
      },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 20;
  }

  private buildAnalysisSummary(drifts: DriftData[], resourceType: string): void {
    this.addSectionHeader('📊 Analysis Summary');

    const totalDrifts = drifts.length;
    const driftByType: Record<string, number> = {};
    const severityCounts = { High: 0, Medium: 0, Low: 0 };

    // Calculate statistics
    drifts.forEach((drift) => {
      const driftType = drift.type || 'unknown';
      driftByType[driftType] = (driftByType[driftType] || 0) + 1;

      const severity = this.getDriftSeverity(drift);
      severityCounts[severity as keyof typeof severityCounts]++;
    });

    // Summary text
    if (totalDrifts === 0) {
      this.addSummaryBox(
        '🎉 Excellent News!\n\nNo infrastructure drift detected. Your cloud resources are perfectly aligned with your Infrastructure as Code (IaC) configuration.',
        this.colors.success
      );
    } else {
      const summaryText = `Analysis Results:
• Total Issues Detected: ${totalDrifts}
• High Priority Issues: ${severityCounts.High}
• Medium Priority Issues: ${severityCounts.Medium}
• Low Priority Issues: ${severityCounts.Low}
• Resource Type Analyzed: ${resourceType.toUpperCase()}`;

      this.addSummaryBox(summaryText, this.colors.info);
    }

    // Drift breakdown table
    if (totalDrifts > 0) {
      this.addSubsectionHeader('Drift Type Breakdown');

      const breakdownData = Object.entries(driftByType).map(([type, count]) => {
        const config = this.driftConfig[type as keyof typeof this.driftConfig] || {
          label: type.charAt(0).toUpperCase() + type.slice(1),
          severity: 'Medium',
          icon: '•',
          description: 'Configuration difference detected',
        };

        return [
          `${config.icon} ${config.label}`,
          count.toString(),
          config.severity,
          config.description,
        ];
      });

      this.doc.autoTable({
        startY: this.currentY,
        head: [['Drift Type', 'Count', 'Severity', 'Description']],
        body: breakdownData,
        theme: 'striped',
        styles: {
          fontSize: 9,
          cellPadding: 5,
        },
        headStyles: {
          fillColor: this.colors.primary,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        margin: { left: this.margin, right: this.margin },
      });

      this.currentY = (this.doc as any).lastAutoTable.finalY + 15;
    }
  }

  private buildImpactAssessment(drifts: DriftData[], resourceType: string): void {
    this.addSectionHeader('🎯 Impact Assessment');

    if (drifts.length === 0) {
      this.addText('No impact assessment required - no drift detected.');
      return;
    }

    const missingCount = drifts.filter((d) => d.type === 'missing').length;
    const orphanedCount = drifts.filter((d) => d.type === 'orphaned').length;
    const configCount = drifts.filter((d) => d.type === 'configuration_drift').length;
    const errorCount = drifts.filter((d) => d.type === 'error').length;

    // Business Impact
    this.addSubsectionHeader('Business Impact');
    const businessImpact = this.generateBusinessImpact(
      missingCount,
      orphanedCount,
      configCount,
      errorCount,
      resourceType
    );
    this.addText(businessImpact);

    // Technical Impact
    this.addSubsectionHeader('Technical Impact');
    const technicalImpact = this.generateTechnicalImpact(
      missingCount,
      orphanedCount,
      configCount,
      errorCount,
      resourceType
    );
    this.addText(technicalImpact);

    // Security & Compliance Impact
    this.addSubsectionHeader('Security & Compliance Impact');
    const securityImpact = this.generateSecurityImpact(
      missingCount,
      orphanedCount,
      configCount,
      errorCount,
      resourceType
    );
    this.addText(securityImpact);
  }

  private buildDetailedAnalysis(drifts: DriftData[]): void {
    this.addSectionHeader('🔍 Detailed Analysis Results');

    if (drifts.length === 0) {
      this.addText('No infrastructure drift detected. All resources are properly aligned with IaC configuration.');
      return;
    }

    drifts.forEach((drift, index) => {
      this.buildDriftDetail(drift, index + 1);
      
      // Add page break after every 2 drifts to prevent overcrowding
      if ((index + 1) % 2 === 0 && index < drifts.length - 1) {
        this.doc.addPage();
        this.currentY = 20;
      }
    });
  }

  private buildDriftDetail(drift: DriftData, index: number): void {
    const driftType = drift.type || 'unknown';
    const config = this.driftConfig[driftType as keyof typeof this.driftConfig] || {
      label: driftType.charAt(0).toUpperCase() + driftType.slice(1),
      icon: '•',
      severity: 'Medium',
    };

    // Drift header
    this.addSubsectionHeader(`${config.icon} Drift #${index}: ${config.label}`);

    // Drift details table
    const detailsData = [];
    
    if (drift.resource && drift.resource.length >= 3) {
      detailsData.push(['Resource Type:', drift.resource[0] || 'Unknown']);
      detailsData.push(['Resource Name:', drift.resource[1] || 'N/A']);
      detailsData.push(['Resource ID:', drift.resource[2] || 'N/A']);
    }

    detailsData.push(
      ['Drift Type:', config.label],
      ['Severity:', config.severity],
      ['Description:', drift.details || 'No description available']
    );

    // Add configuration drift specific details
    if (driftType === 'configuration_drift') {
      if (drift.expected_value) {
        detailsData.push(['Expected Value:', String(drift.expected_value)]);
      }
      if (drift.actual_value) {
        detailsData.push(['Actual Value:', String(drift.actual_value)]);
      }
      if (drift.attribute) {
        detailsData.push(['Affected Attribute:', drift.attribute]);
      }
    }

    this.doc.autoTable({
      startY: this.currentY,
      head: [],
      body: detailsData,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 5,
      },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: this.colors.lightGray },
        1: { fontStyle: 'normal' },
      },
      margin: { left: this.margin, right: this.margin },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10;

    // Individual Remediation Guidance
    this.addSubsectionHeader('🔧 Remediation Guidance');
    this.generateIndividualRemediationSteps(drift);
  }

  private buildRemediationGuidance(drifts: DriftData[], resourceType: string): void {
    this.addSectionHeader('📋 Overall Remediation Summary');

    if (drifts.length === 0) {
      this.addText('No remediation required - infrastructure is properly aligned.');
      return;
    }

    const totalDrifts = drifts.length;
    const highPriority = drifts.filter((d) => this.getDriftSeverity(d) === 'High').length;
    const mediumPriority = drifts.filter((d) => this.getDriftSeverity(d) === 'Medium').length;
    const lowPriority = drifts.filter((d) => this.getDriftSeverity(d) === 'Low').length;

    const summaryText = `Summary: ${totalDrifts} drift(s) detected requiring attention.

General Approach:
• Review each drift's individual remediation guidance above
• Prioritize high-impact drifts (${highPriority}) for immediate attention
• Address medium-impact drifts (${mediumPriority}) this week
• Schedule low-impact drifts (${lowPriority}) when convenient
• Test changes in a non-production environment first
• Apply changes during maintenance windows when possible
• Verify changes using terraform plan before applying`;

    this.addText(summaryText);

    // Best practices
    this.addSubsectionHeader('Best Practices for Prevention');
    const bestPractices = this.generateBestPractices(resourceType);
    this.addText(bestPractices);
  }

  private generateIndividualRemediationSteps(drift: DriftData): void {
    const driftType = drift.type || 'unknown';
    const resource = drift.resource || [];
    const resourceName = resource[1] || 'unknown';

    switch (driftType) {
      case 'missing':
        this.addText(`Missing Resource: ${resourceName}
This resource is defined in your Terraform configuration but doesn't exist in your cloud environment.

Remediation Steps:
1. Review what will be created: terraform plan
2. Create the missing resource: terraform apply
3. Verify the resource was created successfully`);
        break;

      case 'orphaned':
        this.addText(`Orphaned Resource: ${resourceName}
This resource exists in your cloud environment but is not managed by Terraform.

Remediation Steps:
1. Import the orphaned resource: terraform import
2. Verify the import was successful
3. Update your .tf files to match the imported resource`);
        break;

      case 'configuration_drift':
        this.addText(`Configuration Drift: ${resourceName}
The resource configuration differs from what's defined in your Terraform files.

Remediation Steps:
1. Review configuration differences: terraform plan
2. Apply configuration changes: terraform apply
3. Verify changes align with your requirements`);
        break;

      default:
        this.addText(`Analysis Error: ${resourceName}
An error occurred while analyzing this resource.

Troubleshooting Steps:
1. Verify AWS credentials: aws sts get-caller-identity
2. Check Terraform configuration: terraform validate
3. Review resource state: terraform state list`);
        break;
    }

    this.currentY += 15;
  }

  // Helper methods for PDF generation
  private addSectionHeader(text: string): void {
    this.checkPageBreak(30);
    this.doc.setFontSize(16);
    this.doc.setTextColor(...this.colors.primary);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(text, this.margin, this.currentY);
    this.currentY += 15;
  }

  private addSubsectionHeader(text: string): void {
    this.checkPageBreak(20);
    this.doc.setFontSize(14);
    this.doc.setTextColor(...this.colors.darkGray);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(text, this.margin, this.currentY);
    this.currentY += 12;
  }

  private addText(text: string): void {
    this.doc.setFontSize(10);
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont('helvetica', 'normal');

    const lines = this.doc.splitTextToSize(text, this.pageWidth - 2 * this.margin);
    
    for (const line of lines) {
      this.checkPageBreak(this.lineHeight);
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    }
    
    this.currentY += 5; // Extra spacing after text blocks
  }

  private addSummaryBox(text: string, color: [number, number, number]): void {
    this.checkPageBreak(40);
    
    const boxHeight = 30;
    const boxY = this.currentY - 5;
    
    // Draw background box
    this.doc.setFillColor(...color);
    this.doc.rect(this.margin, boxY, this.pageWidth - 2 * this.margin, boxHeight, 'F');
    
    // Add text
    this.doc.setFontSize(11);
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFont('helvetica', 'bold');
    
    const lines = this.doc.splitTextToSize(text, this.pageWidth - 2 * this.margin - 10);
    let textY = boxY + 10;
    
    for (const line of lines) {
      this.doc.text(line, this.margin + 5, textY);
      textY += 7;
    }
    
    this.currentY = boxY + boxHeight + 10;
  }

  private checkPageBreak(requiredSpace: number): void {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  private getDriftSeverity(drift: DriftData): string {
    if (drift.severity) {
      const severity = drift.severity.toLowerCase();
      if (severity === 'high' || severity === 'critical') return 'High';
      if (severity === 'medium' || severity === 'moderate') return 'Medium';
      return 'Low';
    }

    // Default severity by drift type
    const severityMap: Record<string, string> = {
      missing: 'High',
      error: 'High',
      orphaned: 'Medium',
      configuration_drift: 'Medium',
    };

    return severityMap[drift.type] || 'Low';
  }

  private generateBusinessImpact(
    missing: number,
    orphaned: number,
    config: number,
    error: number,
    resourceType: string
  ): string {
    const impacts = [];

    if (missing > 0) {
      impacts.push(`• Service Availability Risk: ${missing} missing ${resourceType} resource(s) may cause service disruptions`);
    }
    if (orphaned > 0) {
      impacts.push(`• Cost Management: ${orphaned} unmanaged ${resourceType} resource(s) may incur unexpected costs`);
    }
    if (config > 0) {
      impacts.push(`• Compliance Risk: ${config} configuration drift(s) may violate security or compliance policies`);
    }
    if (error > 0) {
      impacts.push(`• Operational Risk: ${error} analysis error(s) indicate potential infrastructure management issues`);
    }

    return impacts.length > 0 
      ? impacts.join('\n') 
      : 'No significant business impact identified. Infrastructure is well-managed and aligned.';
  }

  private generateTechnicalImpact(
    missing: number,
    orphaned: number,
    config: number,
    error: number,
    resourceType: string
  ): string {
    const impacts = [];

    if (missing > 0) {
      impacts.push(`• Infrastructure Gaps: Missing ${resourceType} resources may break dependencies and integrations`);
    }
    if (orphaned > 0) {
      impacts.push(`• Management Overhead: Untracked resources increase operational complexity`);
    }
    if (config > 0) {
      impacts.push(`• Configuration Inconsistency: Drift may lead to unpredictable behavior and debugging difficulties`);
    }
    if (error > 0) {
      impacts.push(`• Monitoring Gaps: Analysis errors may indicate blind spots in infrastructure monitoring`);
    }

    return impacts.length > 0 
      ? impacts.join('\n') 
      : 'Technical infrastructure is consistent and well-monitored.';
  }

  private generateSecurityImpact(
    missing: number,
    orphaned: number,
    config: number,
    error: number,
    resourceType: string
  ): string {
    const impacts = [];

    if (missing > 0) {
      impacts.push(`• Security Controls: Missing ${resourceType} resources may lack proper security configurations`);
    }
    if (orphaned > 0) {
      impacts.push(`• Shadow IT Risk: Unmanaged resources may not follow security best practices`);
    }
    if (config > 0) {
      impacts.push(`• Policy Violations: Configuration drift may violate organizational security policies`);
    }
    if (error > 0) {
      impacts.push(`• Audit Trail: Analysis errors may impact compliance reporting and audit trails`);
    }

    return impacts.length > 0 
      ? impacts.join('\n') 
      : 'Security posture is maintained with proper governance and compliance.';
  }

  private generateBestPractices(resourceType: string): string {
    return `Recommended Best Practices:
• Regular Monitoring: Schedule weekly drift detection scans for ${resourceType} resources
• Change Management: Require all infrastructure changes to go through Terraform
• State Management: Use remote state storage with proper locking mechanisms
• Access Control: Limit direct cloud console access to emergency situations only
• Automation: Implement CI/CD pipelines for infrastructure deployments
• Documentation: Maintain clear documentation of infrastructure architecture
• Training: Ensure team members understand IaC principles and tools`;
  }
}

// Export a singleton instance
export const pdfGeneratorService = new PDFGeneratorService();
