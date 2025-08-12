import { DashboardAssistUrl } from "constant";
import { get, post } from "../network/query";

type GenerateDashboardPayload = {
  prompt: string;
  preview: boolean;
};

type UploadDashboardPayload = {
  prompt: string;
  dashboard: any;
};

const useDashboardService = () => {
  const generateDashboard = async (payload: GenerateDashboardPayload): Promise<any> => {
    const formData = new FormData();
    formData.append("prompt", payload.prompt);
    formData.append("preview", String(payload.preview));

    return await post(
      DashboardAssistUrl.GENERATE_DASHBOARD,
      formData,
      "json",
      {},
    );
  };

  const uploadDashboard = async (payload: UploadDashboardPayload): Promise<any> => {
    return await post(DashboardAssistUrl.UPLOAD_DASHBOARD, payload);
  };

  const getHistory = async (): Promise<any[]> => {
    return await get(DashboardAssistUrl.HISTORY);
  };

  return {
    generateDashboard,
    uploadDashboard,
    getHistory,
  };
};

export default useDashboardService;
