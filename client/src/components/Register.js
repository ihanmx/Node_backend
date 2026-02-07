import { useRef, useState, useEffect, use } from "react";
import { Link } from "react-router-dom";
import {
  faCheck,
  faTimes,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import axios from "../api/axios";
const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const REGISTER_URL = "/register";

const Register = () => {
  const userRef = useRef();
  const errRef = useRef();

  const [user, setUser] = useState("");
  const [validName, setValidName] = useState(false);
  const [userFocus, setUserFocus] = useState(false);

  const [pwd, setPwd] = useState("");
  const [validPwd, setValidPwd] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);

  const [matchPwd, setMatchPwd] = useState(""); //second feild to confirm password
  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);

  const [errMsg, setErrMsg] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    userRef.current.focus();
  }, []); //focus on useinput in initail render

  useEffect(() => {
    //validate username regex
    const result = USER_REGEX.test(user);
    console.log(result);
    console.log(user);
    setValidName(result); //the result returns true or false
  }, [user]); //whenever user changes

  useEffect(() => {
    //validate password regex
    const result = PWD_REGEX.test(pwd);
    console.log(result);
    console.log(pwd);
    setValidPwd(result);
    const match = pwd === matchPwd; //check eachtime pwd or matchpwd changes if they match and set the state
    setValidMatch(match);
  }, [pwd, matchPwd]); //whenever pwd or matchpwd changes

  useEffect(() => {
    setErrMsg("");
  }, [user, pwd, matchPwd]); //clear error msg whenever user start typing

  const handleSubmit = async (e) => {
    e.preventDefault();

    //if button is enabled with JS hack
    const v1 = USER_REGEX.test(user);
    const v2 = PWD_REGEX.test(pwd);
    if (!v1 || !v2) {
      setErrMsg("Invalid Entry");
      return; //won't submit the form
    }

    try {
      const response = await axios.post(
        REGISTER_URL,
        JSON.stringify(
          { user: user, pwd: pwd }, //to send data as json not js object
        ),
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, //to include cookies and tokens
        },
      );

      console.log("response.data", response.data);
      //   console.log("token", response.accessToken);
      console.log(JSON.stringify(response)); //to not get [object Object] in console log
      setSuccess(true);

      //clear input fields
      setUser("");
      setPwd("");
      setMatchPwd("");
    } catch (err) {
      if (!err?.response) {
        //undefined or null
        setErrMsg("No Server Response");
      } else if (err.response?.status === 409) {
        setErrMsg("Username Taken");
      } else {
        setErrMsg("Registration Failed");
      }

      errRef.current.focus();
    }
  };

  return (
    <>
      {success ? (
        <section>
          <h1>Success!</h1>
          <p>
            <a href="/">Sign in</a>
          </p>
        </section>
      ) : (
        <section>
          {/* err msg */}
          <p
            ref={errRef}
            className={errMsg ? "errmsg" : "offscreen"}
            aria-live="assertive"
          >
            {errMsg}
          </p>
          <h1>Register</h1>
          <form onSubmit={handleSubmit}>
            <label htmlFor="username">
              Username:
              <FontAwesomeIcon
                icon={faCheck}
                className={validName ? "valid" : "hide"}
              />
              <FontAwesomeIcon
                icon={faTimes}
                className={validName || !user ? "hide" : "invalid"}
              />
            </label>
            <input
              type="text"
              id="username"
              ref={userRef}
              value={user}
              onChange={(e) => {
                setUser(e.target.value);
              }}
              required
              onFocus={() => {
                setUserFocus(true);
              }} //when user focuses on input
              onBlur={() => {
                setUserFocus(false);
              }} //when user leaves input
              aria-invalid={validName ? "false" : "true"}
              aria-describedby="uidnote"
              autoComplete="false"
            ></input>

            <p
              id="uidnote"
              className={
                userFocus && user && !validName ? "instructions" : "offscreen"
              }
            >
              <FontAwesomeIcon icon={faInfoCircle} />
              4 to 24 characters.
              <br />
              Must begin with a letter.
              <br />
              Letters, numbers, underscores, hyphens allowed.
            </p>
            <label htmlFor="password">
              Password:
              <FontAwesomeIcon
                icon={faCheck}
                className={validPwd ? "valid" : "hide"}
              />
              <FontAwesomeIcon
                icon={faTimes}
                className={validPwd || !pwd ? "hide" : "invalid"}
              />
            </label>
            <input
              type="password"
              id="password"
              value={pwd}
              onChange={(e) => {
                setPwd(e.target.value);
              }}
              required
              onFocus={() => {
                setPwdFocus(true);
              }} //when user focuses on input
              onBlur={() => {
                setPwdFocus(false);
              }} //when user leaves input
              aria-invalid={validPwd ? "false" : "true"}
              aria-describedby="pwdnote"
              autoComplete="false"
            />

            <p
              id="pwdnote"
              className={pwdFocus && !validPwd ? "instructions" : "offscreen"}
            >
              <FontAwesomeIcon icon={faInfoCircle} />
              8 to 24 characters.
              <br />
              Must include uppercase and lowercase letters, a number and a
              special character.
              <br />
              Allowed special characters:{" "}
              <span aria-label="exclamation mark">!</span>{" "}
              <span aria-label="at symbol">@</span>{" "}
              <span aria-label="hashtag">#</span>{" "}
              <span aria-label="dollar sign">$</span>{" "}
              <span aria-label="percent">%</span>
            </p>

            <label htmlFor="confirm_pwd">
              Confirm Password:
              <FontAwesomeIcon
                icon={faCheck}
                className={validMatch && matchPwd ? "valid" : "hide"}
              />
              <FontAwesomeIcon
                icon={faTimes}
                className={validMatch || !matchPwd ? "hide" : "invalid"}
              />
            </label>
            <input
              type="password"
              id="confirm_pwd"
              onChange={(e) => setMatchPwd(e.target.value)}
              value={matchPwd}
              required
              aria-invalid={validMatch ? "false" : "true"}
              aria-describedby="confirmnote"
              onFocus={() => setMatchFocus(true)}
              onBlur={() => setMatchFocus(false)}
            />
            <p
              id="confirmnote"
              className={
                matchFocus && !validMatch ? "instructions" : "offscreen"
              }
            >
              <FontAwesomeIcon icon={faInfoCircle} />
              Must match the first password input field.
            </p>

            <button
              disabled={!validName || !validPwd || !validMatch ? true : false}
            >
              Sign Up
            </button>
          </form>

          <p>
            Already registered?
            <br />
            <span className="line">
              {/* router link here*/}
              <Link to="/login">Sign In</Link>
            </span>
          </p>
        </section>
      )}
    </>
  );
};

export default Register;
