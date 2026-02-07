import { useState, useEffect } from "react";
import useAxiosPrivate from "../hooks/useAxiousPrivate";
import { useNavigate, useLocation } from "react-router-dom";

const Users = () => {
  const [users, setUsers] = useState();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const getUsers = async () => {
      try {
        const response = await axiosPrivate.get("/employees", {
          signal: controller.signal,
        });
        console.log(response.data);
        isMounted && setUsers(response.data); //to prevent state update on unmounted component
      } catch (err) {
        if (err.name === "CanceledError") {
          return; // Ignore abort errors from cleanup
        }
        console.error(err);
        navigate("/login", { state: { from: location }, replace: true }); //this condition means that the refresh token also expired so we redirect to login
      }
    };
    getUsers();
    return () => {
      //cleaner function
      isMounted = false;
      controller.abort(); //cancel the request if the component unmounts
    };
  }, []);
  return (
    <article>
      <h2>Users List</h2>

      {users?.length ? (
        <ul>
          {users.map((user, i) => (
            <li key={i}>{user?.username}</li>
          ))}
        </ul>
      ) : (
        <p>No users to display</p>
      )}
    </article>
  );
};

export default Users;
