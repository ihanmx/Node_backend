import axios from "../api/axios";
import useAuth from "./useAuth";

const useRefreshToken = () => {
  const { setAuth } = useAuth();

  const refresh = async () => {
    //this function will be called to get a new access token when the old one expires
    const response = await axios.get("/refresh", { withCredentials: true });

    setAuth((prev) => {
      console.log("Previous Auth State:", JSON.stringify(prev));
      console.log("New Access Token:", response.data.accessToken);
      return {
        ...prev,
        roles: response.data.roles,
        accessToken: response.data.accessToken,
      };
    });

    return response.data.accessToken; //to return access token to the caller of refresh function
  };

  return refresh;
};

export default useRefreshToken;
