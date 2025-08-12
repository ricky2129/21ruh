import { ApiUrl } from "constant";
import { resolveUrlParams } from "helpers";
import {
  AccessListReponse,
  CreateProjectRequest,
  CreateProjectResponse,
  EmailNotificationFormField,
  EmailNotificationRequest,
  MemberRequest,
  Project,
  TeamRequest,
} from "interfaces";

import { delete_, get, post, put } from "../network/query";

const useProjectService = () => {
  /**
   * Fetches list of projects from project API
   * @returns A list of projects from Dashboard API
   */
  const getProjects = async (): Promise<Project[]> => {
    const response = await get(ApiUrl.GET_USER_PROJECTS);

    return response || [];
  };

  const getProjectDetails = async (projectId: string): Promise<Project> => {
    const response = await get(
      resolveUrlParams(ApiUrl.GET_PROJECT_DETAILS, {
        project_id: projectId,
      }),
    );

    return response || "";
  };

  const createProject = async (
    body: CreateProjectRequest,
  ): Promise<CreateProjectResponse> => {
    const response = await post(ApiUrl.CREATE_PROJECT, body);

    return response || "";
  };

  const updateProject = async (
    id: string,
    body: CreateProjectRequest,
  ): Promise<string> => {
    const response = await put(ApiUrl.UPDATE_PROJECT + `/${id}`, body);

    return response || "";
  };

  const checkProjectName = async (
    project_name: string,
    signal,
  ): Promise<{ available: boolean }> => {
    const response = await get(
      `${ApiUrl.CHECK_PROJECT_NAME}/${project_name}`,
      {},
      {},
      signal,
    );

    return response || "";
  };

  const getAccessList = async (
    project_id: number,
  ): Promise<AccessListReponse> => {
    const response = await get(ApiUrl.GET_ACCESS_LIST + `/${project_id}`);

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

  const addMemberToProject = async (
    project_id: number,
    user_id: number,
    role_id: number,
  ): Promise<{ id: string }> => {
    const response = await post(ApiUrl.ADD_MEMBER_TO_PROJECT, {
      project_id,
      user_id,
      role_id,
    });

    return response || "";
  };

  const addTeamToProject = async (
    project_id: number,
    team_id: number,
    role_id: number,
  ): Promise<{ id: string }> => {
    const response = await post(ApiUrl.ADD_TEAM_TO_PROJECT, {
      project_id,
      team_id,
      role_id,
    });

    return response || "";
  };

  const updateTeamInProject = async (
    id: number,
    obj: TeamRequest,
  ): Promise<{ id: string }> => {
    const response = await put(`${ApiUrl.UPDATE_TEAM_IN_PROJECT}/${id}`, obj);

    return response || "";
  };

  const deleteTeamInProject = async (id: number): Promise<string> => {
    const response = await delete_(ApiUrl.DELETE_TEAM_IN_PROJECT + `/${id}`);

    return response || "";
  };

  const deleteMemberInProject = async (id: number): Promise<string> => {
    const response = await delete_(ApiUrl.DELETE_MEMBER_IN_PROJECT + `/${id}`);

    return response || "";
  };

  const updateMemberInProject = async (
    id: string,
    obj: MemberRequest,
  ): Promise<string> => {
    const response = await post(
      ApiUrl.UPDATE_MEMBER_IN_PROJECT + `/${id}`,
      obj,
    );

    return response || "";
  };

  const addEmailNotification = async (
    obj: EmailNotificationRequest,
  ): Promise<{ message: string; id: string }> => {
    const response = await post(ApiUrl.ADD_EMAIL_NOTIFICATION, obj);

    return response || "";
  };

  const updateEmailNotification = async (
    id: string,
    obj: EmailNotificationRequest,
  ): Promise<{ message: string; notification_id: number }> => {
    const response = await put(
      ApiUrl.UPDATE_EMAIL_NOTIFICATION + `/${id}`,
      obj,
    );

    return response || "";
  };

  const deleteEmailNotification = async (id: string): Promise<string> => {
    const response = await delete_(ApiUrl.DELETE_EMAIL_NOTIFICATION + `/${id}`);

    return response || "";
  };

  const getEmailNotification = async (
    id: string,
  ): Promise<EmailNotificationFormField[]> => {
    const response = await get(`${ApiUrl.GET_EMAIL_NOTIFICATION}/${id}`);

    return response || "";
  };

  /**
   * Cancels an existing project.
   *
   * @param project_id - The unique identifier of the project to be canceled.
   * @returns A promise that resolves to a string response from the server.
   */
  const cancelProject = async (project_id: string): Promise<string> => {
    const response = await delete_(
      resolveUrlParams(ApiUrl.CANCEL_PROJECT, { project_id }),
    );

    return response || "";
  };

  const deleteProject = async (id: string): Promise<string> => {
    const response = await delete_(
      resolveUrlParams(ApiUrl.DELETE_PROJECT, { project_id: id }),
    );

    return response || "";
  };

  return {
    getProjects,
    getProjectDetails,
    createProject,
    updateProject,
    getAccessList,
    addMemberToProject,
    deleteMemberInProject,
    updateMemberInProject,
    addEmailNotification,
    updateEmailNotification,
    deleteEmailNotification,
    getEmailNotification,
    checkProjectName,
    addTeamToProject,
    updateTeamInProject,
    deleteTeamInProject,
    cancelProject,
    deleteProject
  };
};

export default useProjectService;