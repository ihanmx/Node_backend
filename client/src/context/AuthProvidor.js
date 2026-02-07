import { createContext, useState } from "react";

export const AuthContext = createContext({});

const AuthProvidor = ({ children }) => {
  const [auth, setAuth] = useState({});
  // const [persist, setPersist] = useState(
  //   JSON.parse(localStorage.getItem("persist")) || false,
  // );

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthProvidor;
