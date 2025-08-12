import { ApiUrl } from "constant";
import { resolveUrlParams } from "helpers";
import {
  AccessListReponse,
  AddMemberRequest,
  AddServiceToApplicationRequest,
  AddServiceToApplicationResponse,
  AddSloRequest,
  Application,
  ApplicationDetails,
  CreateApplicationRequest,
  SLOType,
  Service,
  TeamApplicationRequest,
} from "interfaces";
import { delete_, get, post, put } from "network/query";

const useApplicationService = () => {
  /**
   * Fetches list of applicatons from applicaton API
   * @returns A list of applicatons from Dashboard API
   */
  const getApplicatons = async (project_id: number): Promise<Application[]> => {
    const response = await get(
      resolveUrlParams(ApiUrl.GET_ALL_APPLICATIONS, {
        project_id: project_id.toString(),
      }),
    );

    return response || [];
  };

  const getApplicationAccessList = async (
    application_id: number,
  ): Promise<AccessListReponse> => {
    const response = await get(
      ApiUrl.GET_APPLICATION_ACCESS_LIST + `/${application_id}`,
    );

    const res: AccessListReponse = {
      ...response,
      users: response?.users.map((user) => {
        return {
          ...user,
          user_name: `${user.first_name} ${user.last_name}`,
        };
      }),
    };

    return res;
  };

  const addTeamToApplication = async (
    application_id: number,
    team_id: number,
    role_id: number,
  ): Promise<string> => {
    const res = await post(ApiUrl.ADD_TEAM_TO_APPLICATION, {
      application_id,
      team_id,
      role_id,
    });

    return res || "";
  };

  const updateTeamInApplication = async (
    id: number,
    obj: TeamApplicationRequest,
  ): Promise<string> => {
    const res = await put(`${ApiUrl.UPDATE_TEAM_TO_APPLICATION}/${id}`, obj);

    return res || "";
  };

  const deleteTeamInApplication = async (id: number): Promise<string> => {
    const res = await delete_(`${ApiUrl.DELETE_TEAM_IN_APPLICATION}/${id}`);

    return res || "";
  };

  const getServiceList = async (): Promise<Service[]> => {
    const res = await get(ApiUrl.GET_SERVICE_LIST);

    return res || [];
  };

  const checkApplicationName = async (
    application_name: string,
    signal,
  ): Promise<{ available: boolean }> => {
    const res = await get(
      `${ApiUrl.CHECK_APPLICATION_NAME}/${application_name}`,
      {},
      {},
      signal,
    );

    return res || "";
  };

  const getApplicationDetails = async (
    applicationId: string,
  ): Promise<ApplicationDetails> => {
    const res = await get(
      resolveUrlParams(ApiUrl.GET_APPLICATION_DETAILS, {
        application_id: applicationId.toString(),
      }),
    );

    return res || "";
  };

  const createApplication = async (
    obj: CreateApplicationRequest,
  ): Promise<{ application_id: number }> => {
    const response = await post(ApiUrl.CREATE_APPLICATION, obj);

    return response || "";
  };

  const addMemberToApplication = async (
    obj: AddMemberRequest,
  ): Promise<{ id: number }> => {
    const response = await post(ApiUrl.ADD_MEMBER_TO_APPLICATION, obj);

    return response || "";
  };

  const updateMemberInApplication = async (
    id: number,
    obj: AddMemberRequest,
  ): Promise<string> => {
    const response = await put(
      `${ApiUrl.UPDATE_MEMBER_IN_APPLICATION}/${id}`,
      obj,
    );

    return response || "";
  };

  const deleteMemberInApplication = async (id: number): Promise<string> => {
    const response = await delete_(
      `${ApiUrl.DELETE_MEMBER_IN_APPLICATION}/${id}`,
    );

    return response || "";
  };

  const getApplicationSLOList = async (
    application_id: number,
  ): Promise<SLOType[]> => {
    const response = await get(`${ApiUrl.GET_SLO_DATA}/${application_id}`);

    return response || [];
  };

  const addSloData = async (
    obj: AddSloRequest,
  ): Promise<{ message: string; id: number }> => {
    const response = await post(ApiUrl.ADD_SLO_DATA, obj);

    return response || "";
  };

  const deleteSloData = async (id: string): Promise<string> => {
    const response = await delete_(ApiUrl.DELETE_SLO_DATA + `/${id}`);

    return response || "";
  };

  const updateSloData = async (
    id: string,
    obj: AddSloRequest,
  ): Promise<string> => {
    const response = await put(ApiUrl.UPDATE_SLO_DATA + `/${id}`, obj);

    return response || "";
  };

  /**
   * Adds a service to an application.
   *
   * @param req - The request parameters, with the following structure:
   *   - `application_id`: The id of the application
   *   - `service_id`: The id of the service
   *   - `service_env_id`: The id of the service environment
   *   - `service_type`: The type of service
   *
   * @returns A promise that resolves to an object with the following structure:
   *   - `message`: A success message
   *   - `app_service_id`: The id of the service in the application
   */
  const addServiceToApplication = async (
    req: AddServiceToApplicationRequest,
  ): Promise<AddServiceToApplicationResponse> => {
    const response = await post(ApiUrl.ADD_SERVICE_TO_APPLICATION, req);

    return response || "";
  };

  /**
   * Cancels an existing application.
   *
   * @param application_id - The id of the application to be canceled.
   * @returns A promise that resolves to a string response from the server.
   */
  const cancelApplication = async (application_id: string): Promise<string> => {
    const response = await delete_(
      resolveUrlParams(ApiUrl.CANCEL_APPLICATION, { application_id }),
    );

    return response || "";
  };

  const deleteApplication = async (application_id: string): Promise<string> => {
  const response = await delete_(
    resolveUrlParams(ApiUrl.DELETE_APPLICATION, { application_id }),
  );
  return response || "";
};



  return {
    getApplicatons,
    getApplicationDetails,
    createApplication,
    addMemberToApplication,
    getApplicationSLOList,
    addSloData,
    deleteSloData,
    getServiceList,
    checkApplicationName,
    updateSloData,
    updateMemberInApplication,
    deleteMemberInApplication,
    getApplicationAccessList,
    addTeamToApplication,
    updateTeamInApplication,
    deleteTeamInApplication,
    addServiceToApplication,
    cancelApplication,
    deleteApplication
  };
};

export default useApplicationService;
