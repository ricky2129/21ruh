import { ToilAssistUrl } from "constant";
import { resolveUrlParams } from "helpers";
import { get, post } from "../network/query";

const useToilAssistService = () => {
  const getProjectTickets = async (projectKey: string): Promise<any> => {
    const url = resolveUrlParams(ToilAssistUrl.GET_PROJECT_TICKETS, { project_key: projectKey });
    return await get(url) || {};
  };

  const getProjectOpenTickets = async (projectKey: string): Promise<any> => {
    const url = resolveUrlParams(ToilAssistUrl.GET_PROJECT_OPEN_TICKETS, { project_key: projectKey });
    return await get(url) || {};
  };

  const getProject = async (projectKey: string): Promise<any> => {
    const url = resolveUrlParams(ToilAssistUrl.GET_PROJECT, { project_key: projectKey });
    return await get(url) || {};
  };

  const getTicketRunbook = async (ticketKey: string): Promise<any> => {
    const url = resolveUrlParams(ToilAssistUrl.GET_TICKET_RUNBOOK, { ticket_key: ticketKey });
    return await get(url) || {};
  };

  const getTicket = async (ticketKey: string): Promise<any> => {
    const url = resolveUrlParams(ToilAssistUrl.GET_TICKET, { ticket_key: ticketKey });
    return await get(url) || {};
  };

  const approveRemediation = async (ticketKey: string): Promise<any> => {
    const url = resolveUrlParams(ToilAssistUrl.APPROVE_REMEDIATION, { ticket_key: ticketKey });
    return await get(url) || {};
  };

  const declineRemediation = async (ticketKey: string): Promise<any> => {
    const url = resolveUrlParams(ToilAssistUrl.DECLINE_REMEDIATION, { ticket_key: ticketKey });
    return await get(url) || {};
  };

  const getTicketComments = async (ticketKey: string): Promise<any> => {
    const url = resolveUrlParams(ToilAssistUrl.GET_TICKET_COMMENTS, { ticket_key: ticketKey });
    return await get(url) || {};
  };

  const postGrafanaAlert = async (payload: any): Promise<any> => {
    return await post(ToilAssistUrl.POST_GRAFANA_ALERT, payload) || {};
  };

  const postJiraApprovalWebhook = async (payload: any): Promise<any> => {
    return await post(ToilAssistUrl.POST_JIRA_APPROVAL_WEBHOOK, payload) || {};
  };

  return {
    getProjectTickets,
    getProjectOpenTickets,
    getProject,
    getTicketRunbook,
    getTicket,
    approveRemediation,
    declineRemediation,
    getTicketComments,
    postGrafanaAlert,
    postJiraApprovalWebhook,
  };
};

export default useToilAssistService;
