import { ReactNode } from "react";

export interface JiraUser {
  accountId: string;
  displayName: string;
  avatarUrls: {
    "48x48": string;
    "24x24": string;
    "16x16": string;
    "32x32": string;
  };
  active: boolean;
}

export interface IssueType {
  id?: string;
  name: string;
  description?: string;
  iconUrl?: string;
  subtask?: boolean;
  avatarId?: number;
  hierarchyLevel?: number;
}

export interface Project {
  id: string;
  key: string;
  name: string;
  description?: string;
  lead: JiraUser;
  issueTypes: IssueType[];
  avatarUrls: {
    "48x48": string;
    "24x24": string;
    "16x16": string;
    "32x32": string;
  };
  projectTypeKey: string;
}

export interface TicketStatus {
  id: string;
  name: string;
}

export interface ProjectTicket {
  key: string;
  summary: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketRunbook {
  runbook: any;
  content: any;
  verificationExplanation: string;
  verificationCommands: string;
  remediationExplanation: string;
  remediationCommand: string;
  postCheckExplanation: string;
  postCheckCommand: string;
}

export interface TicketComment {
  id: string;
  author: JiraUser;
  body: string;
  created: string;
}

export interface Ticket {
  fields: any;
  key: string;
  summary: string;
  description?: string;
  status: TicketStatus;
  issueType: IssueType;
  reporter: JiraUser;
  assignee?: JiraUser | null;
  created: string;
  updated: string;
  comments: TicketComment[];
}

export interface RemediationResponse {
  ticketKey: string;
  status: "approved" | "declined";
  message?: string;
}

export interface GrafanaAlertRequest {
  status: string;
  alerts: any[]; // Define a more specific type if available
}

export interface JiraApprovalWebhookRequest {
  issue: Record<string, any>;
  comment: Record<string, any>;
}

export interface JiraTicketsResponse {
  issues: ProjectTicket[];
}
