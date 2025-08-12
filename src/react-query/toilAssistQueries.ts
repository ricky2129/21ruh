import { useMutation, useQuery } from "@tanstack/react-query";
import useToilAssistService from "services/toilassist.service";
import {
  ProjectTicket,
  Project,
  TicketRunbook,
  Ticket,
  RemediationResponse,
  TicketComment,
  GrafanaAlertRequest,
  JiraApprovalWebhookRequest,
} from "../interfaces/toilAssist";


export function useGetProjectTickets(projectKey: string) {
  const { getProjectTickets } = useToilAssistService();

  return useQuery<ProjectTicket[]>({
    queryKey: ["project-tickets", projectKey],
    queryFn: () => getProjectTickets(projectKey),
    enabled: !!projectKey,
  });
}

export function useGetProjectOpenTickets(projectKey: string) {
  const { getProjectOpenTickets } = useToilAssistService();

  return useQuery<ProjectTicket[]>({
    queryKey: ["project-open-tickets", projectKey],
    queryFn: () => getProjectOpenTickets(projectKey),
    enabled: !!projectKey,
  });
}

export function useGetProject(projectKey: string) {
  const { getProject } = useToilAssistService();

  return useQuery<Project>({
    queryKey: ["project", projectKey],
    queryFn: () => getProject(projectKey),
    enabled: !!projectKey,
  });
}

export function useGetTicketRunbook(ticketKey: string) {
  const { getTicketRunbook } = useToilAssistService();

  return useQuery<TicketRunbook>({
    queryKey: ["ticket-runbook", ticketKey],
    queryFn: () => getTicketRunbook(ticketKey),
    enabled: !!ticketKey,
  });
}

export function useGetTicket(ticketKey: string) {
  const { getTicket } = useToilAssistService();

  return useQuery<Ticket>({
    queryKey: ["ticket", ticketKey],
    queryFn: () => getTicket(ticketKey),
    enabled: !!ticketKey,
  });
}

export function useApproveRemediation() {
  const { approveRemediation } = useToilAssistService();

  const { mutateAsync, isError, error, isPending } = useMutation({
    mutationFn: (ticketKey: string) => approveRemediation(ticketKey),
  });

  return {
    mutateAsync,
    isError,
    error,
    isLoading: isPending,
  };
}

export function useDeclineRemediation() {
  const { declineRemediation } = useToilAssistService();

  const { mutateAsync, isError, error, isPending } = useMutation({
    mutationFn: (ticketKey: string) => declineRemediation(ticketKey),
  });

  return {
    mutateAsync,
    isError,
    error,
    isLoading: isPending,
  };
}

export function useGetTicketComments(ticketKey: string) {
  const { getTicketComments } = useToilAssistService();

  return useQuery<TicketComment[]>({
    queryKey: ["ticket-comments", ticketKey],
    queryFn: () => getTicketComments(ticketKey),
    enabled: !!ticketKey,
  });
}

export function usePostGrafanaAlert() {
  const { postGrafanaAlert } = useToilAssistService();

  const { mutateAsync, isError, error, isPending } = useMutation({
    mutationFn: (payload: GrafanaAlertRequest) => postGrafanaAlert(payload),
  });

  return {
    mutateAsync,
    isError,
    error,
    isLoading: isPending,
  };
}

export function usePostJiraApprovalWebhook() {
  const { postJiraApprovalWebhook } = useToilAssistService();

  const { mutateAsync, isError, error, isPending } = useMutation({
    mutationFn: (payload: JiraApprovalWebhookRequest) => postJiraApprovalWebhook(payload),
  });

  return {
    mutateAsync,
    isError,
    error,
    isLoading: isPending,
  };
}
