import { useEffect } from "react";
import useAuth from "./useAuth"; //auth contain roles user and accessToken
import { axiosPrivate } from "../api/axios";
import useRefreshToken from "./useRefreshToken"; //gets newaccesstoken from backend

//🛡️ “A smart Axios that automatically adds the token and refreshes it when it expires.

const useAxiosPrivate = () => {
  const { auth } = useAuth();
  const refresh = useRefreshToken();
  useEffect(() => {
    //useeffect attach interceptors when the component using this hook mounts and removes them when it unmounts

    //An interceptor is like a checkpoint.
    // “Before Axios sends the request, let me look at it.
    //the req works when the user have a valid access token
    const requestIntercept = axiosPrivate.interceptors.request.use(
      // config = the request details
      // URL
      // headers
      // method
      (config) => {
        //if no Authorization header is present, add the access token from auth context
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${auth?.accessToken}`;
          //we use auth accessToken not refresh bc we shouldm't send refresh token and refresh with every request
        }

        //we must return the config so that the request can proceed
        return config;
      },
      //reject any request error
      (error) => Promise.reject(error),
    );

    //Response interceptor (AFTER response comes back)

    const responseIntercept = axiosPrivate.interceptors.response.use(
      //if res ok leave it
      (response) => response,
      //id error 403 (forbidden) comes back, try to get new access token and retry the original request
      //Token expired
      // Unauthorized access
      async (error) => {
        const prevRequest = error.config; //we accees the original req by config
        if (error?.response?.status === 403 && !prevRequest?.sent) {
          prevRequest.sent = true; //this is a flag added to req to prevent infinite loop it works as sign for repaired req
          const newAccessToken = await refresh();
          prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return axiosPrivate(prevRequest);
        }
        return Promise.reject(error);
      },
    );

    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept); //remove the interceptors when the component unmounts
      axiosPrivate.interceptors.response.eject(responseIntercept);
    };
  }, [auth, refresh]); //Runs again if auth or refresh changes

  return axiosPrivate;
};

export default useAxiosPrivate;
