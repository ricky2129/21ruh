import { useMutation, useQuery } from "@tanstack/react-query";
import { QUERY_KEY } from "constant";
import {
  AddMemberRequest,
  AddServiceToApplicationRequest,
  AddSloRequest,
  CreateApplicationRequest,
  TeamApplicationRequest,
} from "interfaces";
import { useApplicationService } from "services";

function useGetApplications(project_id: number) {
  const { getApplicatons } = useApplicationService();

  const { data, isFetching, isError } = useQuery({
    queryKey: [QUERY_KEY.GET_APPLICATIONS, window.location.pathname],
    enabled: !isNaN(project_id),
    queryFn: () => getApplicatons(project_id),
    refetchOnWindowFocus: false,
  });
  return {
    data,
    isLoading: isFetching,
    isError,
  };
}

function useGetServiceList() {
  const { getServiceList } = useApplicationService();

  const { data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEY.GET_SERVICE_LIST],
    enabled: true,
    refetchOnWindowFocus: false,
    queryFn: () => getServiceList(),
  });
  return {
    data,
    isLoading,
    isError,
  };
}

function useGetApplicationDetails(applicationId: string) {
  const { getApplicationDetails } = useApplicationService();

  const { data, refetch, isError, error, isLoading } = useQuery({
    queryKey: [QUERY_KEY.GET_APPLICATION_DETAILS, applicationId],
    queryFn: () => getApplicationDetails(applicationId),
    refetchOnWindowFocus: false,
    enabled: !!applicationId,
  });

  return {
    data,
    refetch,
    isLoading: isLoading,
    isError,
    error,
  };
}

function useCreateApplication() {
  const { createApplication } = useApplicationService();

  const { mutateAsync, isError, error } = useMutation({
    mutationFn: (createApplicationRequest: CreateApplicationRequest) =>
      createApplication(createApplicationRequest),
  });

  return {
    mutateAsync,
    isError,
    error,
  };
}

function useAddMemberToApplication() {
  const { addMemberToApplication } = useApplicationService();

  const { mutateAsync, isError, error } = useMutation({
    mutationFn: (obj: AddMemberRequest) => addMemberToApplication(obj),
  });

  return {
    mutateAsync,
    isError,
    error,
  };
}

function useDeleteMemberInApplication() {
  const { deleteMemberInApplication } = useApplicationService();

  const { mutateAsync, isError, error } = useMutation({
    mutationFn: (id: number) => deleteMemberInApplication(id),
  });

  return {
    mutateAsync,
    isError,
    error,
  };
}

function useUpdateMemberInApplication() {
  const { updateMemberInApplication } = useApplicationService();
  const { mutateAsync, isError, error } = useMutation({
    mutationFn: ({ id, obj }: { id: number; obj: AddMemberRequest }) =>
      updateMemberInApplication(id, obj),
  });

  return {
    mutateAsync,
    isError,
    error,
  };
}

function useGetApplicationSLOList(application_id: number) {
  const { getApplicationSLOList } = useApplicationService();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [QUERY_KEY.GET_APPLICATION_SLO_LIST],
    enabled: application_id !== null,
    queryFn: () => getApplicationSLOList(application_id),
  });
  return {
    data,
    refetch,
    isLoading,
    isError,
  };
}

function useAddSloData() {
  const { addSloData } = useApplicationService();

  const { mutateAsync, isError, error } = useMutation({
    mutationFn: (obj: AddSloRequest) => addSloData(obj),
  });

  return {
    mutateAsync,
    isError,
    error,
  };
}

function useDeleteSloData() {
  const { deleteSloData } = useApplicationService();

  const { mutateAsync, isError, error } = useMutation({
    mutationFn: (id: string) => deleteSloData(id),
  });

  return {
    mutateAsync,
    isError,
    error,
  };
}

function useUpdateSloData() {
  const { updateSloData } = useApplicationService();
  const { mutateAsync, isError, error } = useMutation({
    mutationFn: ({ id, obj }: { id: string; obj: AddSloRequest }) =>
      updateSloData(id, obj),
  });

  return {
    mutateAsync,
    isError,
    error,
  };
}

function useCheckApplicationName(application_name: string) {
  const { checkApplicationName } = useApplicationService();

  const { refetch, isLoading, isError, data } = useQuery({
    queryKey: [QUERY_KEY.CHECK_PROJECT_NAME],
    queryFn: ({ signal }) => checkApplicationName(application_name, signal),
    enabled: false,
  });

  return {
    refetch,
    isLoading,
    isError,
    data,
  };
}

function useGetApplicationAccessList(application_id) {
  const { getApplicationAccessList } = useApplicationService();
  const { refetch, data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEY.GET_APPLICATION_ACCESS_LIST],
    queryFn: () => getApplicationAccessList(application_id),
    enabled: false,
  });

  return {
    refetch,
    data,
    isLoading,
    isError,
  };
}

function useAddTeamToApplication() {
  const { addTeamToApplication } = useApplicationService();

  const { mutateAsync } = useMutation({
    mutationFn: ({
      application_id,
      team_id,
      role_id,
    }: {
      application_id: number;
      team_id: number;
      role_id: number;
    }) => addTeamToApplication(application_id, team_id, role_id),
  });

  return {
    mutateAsync,
  };
}

function useUpdateTeamInApplication() {
  const { updateTeamInApplication } = useApplicationService();

  const { mutateAsync } = useMutation({
    mutationFn: ({ id, obj }: { id: number; obj: TeamApplicationRequest }) =>
      updateTeamInApplication(id, obj),
  });

  return {
    mutateAsync,
  };
}

function useDeleteTeamInApplication() {
  const { deleteTeamInApplication } = useApplicationService();

  const { mutateAsync } = useMutation({
    mutationFn: (id: number) => deleteTeamInApplication(id),
  });

  return {
    mutateAsync,
  };
}

function useAddServiceToApplication() {
  const { addServiceToApplication } = useApplicationService();

  const { mutateAsync, isError, error, isPending } = useMutation({
    mutationFn: (req: AddServiceToApplicationRequest) =>
      addServiceToApplication(req),
  });

  return {
    mutateAsync,
    isError,
    error,
    isLoading: isPending,
  };
}

function useCancelApplication() {
  const { cancelApplication } = useApplicationService();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (application_id: string) => cancelApplication(application_id),
  });

  return {
    mutateAsync,
    isLoading: isPending,
  };
}

function useDeleteApplication() {
  const { deleteApplication } = useApplicationService();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (application_id: string) => deleteApplication(application_id),
  });

  return {
    mutateAsync,
    isLoading: isPending,
  };
}

export {
  useGetApplications,
  useGetApplicationDetails,
  useCreateApplication,
  useAddMemberToApplication,
  useUpdateMemberInApplication,
  useAddSloData,
  useDeleteSloData,
  useGetServiceList,
  useCheckApplicationName,
  useGetApplicationSLOList,
  useUpdateSloData,
  useDeleteMemberInApplication,
  useGetApplicationAccessList,
  useAddTeamToApplication,
  useUpdateTeamInApplication,
  useDeleteTeamInApplication,
  useAddServiceToApplication,
  useCancelApplication,
  useDeleteApplication
};
