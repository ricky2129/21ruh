import { useMutation, useQuery } from "@tanstack/react-query";
import { QUERY_KEY } from "constant";
import {
  CreateProjectRequest,
  EmailNotificationRequest,
  MemberRequest,
  TeamRequest,
} from "interfaces";
import { useProjectService } from "services";

function useGetProjects() {
  const { getProjects } = useProjectService();

  const { data, isError, isFetching } = useQuery({
    queryKey: [QUERY_KEY.GET_PROJECTS, window.location.pathname],
    enabled: true,
    queryFn: getProjects,
    refetchOnWindowFocus: false,
  });
  return {
    data,
    isLoading: isFetching,
    isError,
  };
}

function useGetProjectDetails(project_id: string) {
  const { getProjectDetails } = useProjectService();
  const { refetch, data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEY.GET_PROJECT_DETAILS, project_id],
    queryFn: () => getProjectDetails(project_id),
    enabled: false,
  });

  return {
    refetch,
    data,
    isLoading,
    isError,
  };
}

function useCreateProject() {
  const { createProject } = useProjectService();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (createProjectRequest: CreateProjectRequest) =>
      createProject(createProjectRequest),
  });

  return {
    mutateAsync,
    isLoading: isPending
  };
}

function useUpdateProject() {
  const { updateProject } = useProjectService();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({
      id,
      updateProjectProjectRequest,
    }: {
      id: string;
      updateProjectProjectRequest: CreateProjectRequest;
    }) => updateProject(id, updateProjectProjectRequest),
  });

  return {
    isLoading: isPending,
    mutateAsync,
  };
}

function useGetAccessList(project_id) {
  const { getAccessList } = useProjectService();
  const { refetch, data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEY.GET_ACCESS_LIST],
    queryFn: () => getAccessList(project_id),
    enabled: true,
  });

  return {
    refetch,
    data,
    isLoading,
    isError,
  };
}

function useGetEmailNotification(project_id: string) {
  const { getEmailNotification } = useProjectService();

  const { refetch, data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEY.GET_EMAIL_NOTIFICATION, project_id],
    queryFn: () => getEmailNotification(project_id),
    enabled: true,
  });

  return {
    refetch,
    data,
    isLoading,
    isError,
  };
}

function useAddMemberToProject() {
  const { addMemberToProject } = useProjectService();

  const { mutateAsync } = useMutation({
    mutationFn: ({
      project_id,
      user_id,
      role_id,
    }: {
      project_id: number;
      user_id: number;
      role_id: number;
    }) => addMemberToProject(project_id, user_id, role_id),
  });

  return {
    mutateAsync,
  };
}

function useAddTeamToProject() {
  const { addTeamToProject } = useProjectService();

  const { mutateAsync } = useMutation({
    mutationFn: ({
      project_id,
      team_id,
      role_id,
    }: {
      project_id: number;
      team_id: number;
      role_id: number;
    }) => addTeamToProject(project_id, team_id, role_id),
  });

  return {
    mutateAsync,
  };
}

function useUpdateTeamInProject() {
  const { updateTeamInProject } = useProjectService();

  const { mutateAsync } = useMutation({
    mutationFn: ({ id, obj }: { id: number; obj: TeamRequest }) =>
      updateTeamInProject(id, obj),
  });

  return {
    mutateAsync,
  };
}

function useDeleteTeamInProject() {
  const { deleteTeamInProject } = useProjectService();

  const { mutateAsync } = useMutation({
    mutationFn: (id: number) => deleteTeamInProject(id),
  });

  return {
    mutateAsync,
  };
}

function useCheckProjectName(project_name: string) {
  const { checkProjectName } = useProjectService();

  const { refetch, isLoading, isError, data } = useQuery({
    queryKey: [QUERY_KEY.CHECK_PROJECT_NAME],
    queryFn: ({ signal }) => checkProjectName(project_name, signal),
    enabled: false,
  });

  return {
    refetch,
    isLoading,
    isError,
    data,
  };
}
function useDeleteMemberInProject() {
  const { deleteMemberInProject } = useProjectService();

  const { mutateAsync } = useMutation({
    mutationFn: (id: number) => deleteMemberInProject(id),
  });

  return {
    mutateAsync,
  };
}

function useUpdateMemberInProject() {
  const { updateMemberInProject } = useProjectService();

  const { mutateAsync } = useMutation({
    mutationFn: ({ id, obj }: { id: string; obj: MemberRequest }) =>
      updateMemberInProject(id, obj),
  });

  return {
    mutateAsync,
  };
}

function useAddEmailNotification() {
  const { addEmailNotification } = useProjectService();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (obj: EmailNotificationRequest) => addEmailNotification(obj),
  });

  return {
    mutateAsync,
    isLoading: isPending,
  };
}

function useUpdateEmailNotification() {
  const { updateEmailNotification } = useProjectService();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({ obj, id }: { obj: EmailNotificationRequest; id: string }) =>
      updateEmailNotification(id, obj),
  });

  return {
    mutateAsync,
    isLoading: isPending,
  };
}

function useDeleteEmailNotification() {
  const { deleteEmailNotification } = useProjectService();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (id: string) => deleteEmailNotification(id),
  });

  return {
    mutateAsync,
    isLoading: isPending,
  };
}

/**
 * Cancels a project
 *
 * @returns An object with two properties:
 * - `mutateAsync`: A function to call the mutation
 * - `isLoading`: A boolean indicating whether the mutation is in progress
 */
function useCancelProject() {
  const { cancelProject } = useProjectService();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (project_id: string) => cancelProject(project_id),
  });

  return {
    mutateAsync,
    isLoading: isPending,
  };
}

export {
  useGetProjects,
  useGetProjectDetails,
  useCreateProject,
  useGetAccessList,
  useUpdateProject,
  useAddMemberToProject,
  useDeleteMemberInProject,
  useUpdateMemberInProject,
  useAddEmailNotification,
  useUpdateEmailNotification,
  useDeleteEmailNotification,
  useGetEmailNotification,
  useCheckProjectName,
  useAddTeamToProject,
  useUpdateTeamInProject,
  useDeleteTeamInProject,
  useCancelProject,
};
