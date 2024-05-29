/**
 * Axios instance that can be used to communicate with the backend.
 */

import toast from "react-hot-toast";
import axios, { type AxiosResponse } from "axios";

import { useStore } from "components/ErrorBanner";

const api = axios.create({
  baseURL: process.env.VITE_API_URL,
  timeout: 5000,
  withCredentials: true, // Required for cookies to be set by a request.
});

const setError = useStore.getState().setError;
let connectionFailures = 0;

api.interceptors.response.use(
  (response) => {
    // Hide error banner.
    setError(null);
    connectionFailures = 0;
    return response;
  },
  async (error) => {
    const response: AxiosResponse = error.response;
    if (response === undefined) {
      if (connectionFailures < 3) {
        // Try a few times before displaying the error banner.
        ++connectionFailures;
      } else {
        // Display error banner, assuming this is a connection error if there is no response object.
        setError(": Could not connect to server");
      }
    } else if (response.config.method === "get") {
      // Display error banner, assuming this is a recurring API call for get requests.
      setError(`: ${response.data as string}`);
    } else if (response.config.url !== "/auth/verify") {
      // Display an error toast. Don't display error toast for verify requests.
      const errorMessage =
        response.data !== "" ? `: ${response.data as string}` : "";
      toast.error(`Error${errorMessage}`);
    }
    return await Promise.reject(error);
  }
);

export default api;
