import { Outlet } from "react-router-dom";
import useRefreshToken from "../hooks/useRefreshToken";
import useAuth from "../hooks/useAuth";
import { useState, useEffect } from "react";

const PersistLogin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useRefreshToken();
  const { auth, persist } = useAuth();

  useEffect(() => {
    let isMounted = true; //to prevent state update on unmounted component
    const verifyRefreshToken = async () => {
      try {
        await refresh();
      } catch (err) {
        console.error(err);
      } finally {
        isMounted && setIsLoading(false);
      }
    };

    //we want to verify the refresh token only if we have an access token and we are not currently loading
    !auth?.accessToken ? verifyRefreshToken() : setIsLoading(false);

    return () => {
      //cleaner function
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    console.log(`is loading: ${isLoading}`);
    console.log(`access token: ${auth?.accessToken}`);
  }, [isLoading]);
  return (
    <>{!persist ? <Outlet /> : isLoading ? <p>Loading...</p> : <Outlet />}</>
  );
};

export default PersistLogin;
