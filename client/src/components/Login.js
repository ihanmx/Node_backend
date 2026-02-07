import { useRef, useState, useEffect, useContext } from "react";
import useAuth from "../hooks/useAuth";
import axios from "../api/axios";
import { useNavigate, useLocation, Link } from "react-router-dom";

const LOGIN_URL = "/auth";

const Login = () => {
  const { setAuth, persist, setPersist } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/"; //this remembers where the user was trying to go before being redirected to the login page, so we can redirect them back after login

  const userRef = useRef();
  const errRef = useRef();
  const [user, setUser] = useState("");
  const [pwd, setPwd] = useState("");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    setErrMsg("");
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        LOGIN_URL,
        JSON.stringify({ user, pwd }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        },
      );
      console.log("response.data", response?.data);
      const accessToken = response?.data?.accessToken;
      const roles = response?.data?.roles;
      setAuth({ user, pwd, roles, accessToken });
      setPwd("");
      setUser("");
      navigate(from, { replace: true });
    } catch (err) {
      if (!err?.response) {
        // !err means undifined or null error
        setErrMsg("No Server Response");
      } else if (err.response?.status === 400) {
        setErrMsg("Missing Username or Password");
      } else if (err.response?.status === 401) {
        setErrMsg("Unauthorized");
      } else {
        setErrMsg("Login Failed");
      }
      errRef.current.focus();
    }
  };

  const togglePersist = () => {
    setPersist((prev) => !prev);
  };

  useEffect(() => {
    localStorage.setItem("persist", JSON.stringify(persist));
  }, [persist]);

  return (
    <section>
      <p
        ref={errRef}
        className={errMsg ? "errmsg" : "offscreen"}
        aria-live="assertive"
      >
        {errMsg}
      </p>
      <h1>Sign in</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          ref={userRef}
          autoComplete="off"
          onChange={(e) => setUser(e.target.value)}
          value={user}
          required
        />
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          ref={userRef}
          autoComplete="off"
          onChange={(e) => setPwd(e.target.value)}
          value={pwd}
          required
        />
        <button type="submit">Sign In</button>
      </form>
      <p>
        Need an Account?
        <br />
        <span className="line">
          {/* router link here*/}
          <Link to="/register">Sign Up</Link>
        </span>
        <div className="persistCheck">
          <input
            type="checkbox"
            id="persist"
            checked={persist}
            onChange={togglePersist}
          />
          <label htmlFor="persist">Trust This Device</label>
        </div>
      </p>
    </section>
  );
};

export default Login;
