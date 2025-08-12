import axios, { AxiosRequestConfig, RawAxiosRequestHeaders } from "axios";
import { ApiUrl, RouteUrl, excludedFromTrackUrls } from "constant";


//Create a base Axios instance
export const axiosClient = axios.create({
  baseURL: ApiUrl.BASE_URL,
  headers: {
    // "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
});

//Add interceptor to call refresh API incase token is expired
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    try {
      if (
        error?.response?.status === 422 &&
        !excludedFromTrackUrls.includes(window.location.pathname)
      ) {
        const data = await get(
          ApiUrl.REFRESH,
          {},
          { Authorization: `Bearer ${localStorage.getItem("refresh_token")}` },
        );

        localStorage.setItem("access_token", data.access_token);
      }

      return Promise.reject(error);
    } catch (err) {
      console.error(err);
      window.location.href = RouteUrl.ONBOARDING.LOGIN;

      return Promise.reject(error);
    }
  },
);

/**
 * Merge custom headers with default headers
 * @param {object} - customHeaders - Custom headers provided by the user
 * @returns {object} - Merged headers
 */
const mergeHeaders = (customHeaders: object = {}): RawAxiosRequestHeaders => {
  return {
    ...axiosClient.defaults.headers,
    ...customHeaders,
  };
};

/**
 * Send a GET request to the given endpoint.
 *
 * @param {string} endpoint
 * @param {object} [params={}] - Query parameters to send with the request
 * @param {object} [customHeaders={}] - Cutom headers to include in the request
 * @returns {Promise<object>} - The response data
 * @throws {Error} - If the request fails
 */
const get = async (
  endpoint: string,
  params: object = {},
  customHeaders: object = {},
  signal = null,
  responseType: "json" | "arraybuffer" | "blob" | "document" | "text" = "json",
) => {
  try {
    const config: AxiosRequestConfig = {
      params,
      headers: mergeHeaders({
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        ...customHeaders,
      }),
      signal: signal,
      responseType,
    };

    const response = await axiosClient.get(endpoint, config);

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Send a POST request to the given endpoint.
 *
 * @param {string} endpoint
 * @param {object} data - The data to send with the request
 * @param {"json" | "arraybuffer" | "blob" | "document" | "text"} [responseType="json"] - The response type
 * @param {object} [customHeaders={}] - Cutom headers to include in the request
 * @param {object} [params={}] - Query parameters to send with the request
 * @returns {Promise<object>} - The response data
 * @throws {Error} - If the request fails
 */
const isFormData = (data: any) => typeof FormData !== "undefined" && data instanceof FormData;

const post = async (
  endpoint: string,
  data: object,
  responseType: "json" | "arraybuffer" | "blob" | "document" | "text" = "json",
  customHeaders: object = {},
  params: object = {},
  signal = null,
) => {
  try {
    const headers = mergeHeaders({
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      ...customHeaders,
    });

    // Remove Content-Type if sending FormData
    if (isFormData(data) && headers["Content-Type"]) {
      delete headers["Content-Type"];
    }

    const config: AxiosRequestConfig = {
      headers,
      responseType,
      params,
      signal
    };

    const response = await axiosClient.post(endpoint, data, config);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Send a POST request to the given endpoint.
 *
 * @param {string} endpoint
 * @param {object} data - The data to send with the request
 * @param {object} [customHeaders={}] - Cutom headers to include in the request
 * @returns {Promise<object>} - The response data
 * @throws {Error} - If the request fails
 */
const put = async (
  endpoint: string,
  data: object,
  customHeaders: object = {},
) => {
  try {
    const config: AxiosRequestConfig = {
      headers: mergeHeaders({
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        ...customHeaders,
      }),
    };

    const response = await axiosClient.put(endpoint, data, config);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/**
 * Send a DELETE request to the given endpoint.
 *
 * @param {string} endpoint
 * @param {object} [params={}] - Query parameters to send with the request
 * @returns {Promise<object>} - The response data
 * @throws {Error} - If the request fails
 */
const delete_ = async (endpoint: string, customHeaders: object = {}) => {
  try {
    const config = {
      headers: mergeHeaders({
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        ...customHeaders,
      }),
    };
    const response = await axiosClient.delete(endpoint, config);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { get, post, put, delete_ };