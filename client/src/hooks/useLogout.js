import axios from "../api/axios";
import useAuth from "./useAuth";

const useLogout = () => {
  const { setAuth } = useAuth();

  const logout = async () => {
    setAuth({}); //clear the auth state
    try {
      axios.get("/logout", { withCredentials: true });
    } catch (err) {
      console.error(err);
    }
  };

  return logout;
};

export default useLogout;
