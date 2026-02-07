import Register from "./components/Register";
import Login from "./components/Login";
import Layout from "./components/Layout";

import { Route, Routes } from "react-router-dom";
import Admin from "./components/Admin";
import Editor from "./components/Editor";
import Lounge from "./components/Lounge";
import Missing from "./components/Missing";
import Unauthorized from "./components/Unauthorized";
import LinkPage from "./components/LinkPage";
import Home from "./components/Home";
import RequireAuth from "./components/RequireAuth";
import PersistLogin from "./components/PersistLogin";
const ROLES = {
  User: 2001,
  Editor: 1984,
  Admin: 5150,
};

function App() {
  return (
    <Routes>
      {/* wrapper */}
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />
        <Route path="linkpage" element={<LinkPage />} />
        <Route path="unauthorized" element={<Unauthorized />} />

        {/* protected routes */}
        <Route element={<PersistLogin />}>
          <Route element={<RequireAuth allowedRoles={[ROLES.User]} />}>
            <Route path="/" element={<Home />} />
          </Route>

          <Route element={<RequireAuth allowedRoles={[ROLES.Editor]} />}>
            <Route path="editor" element={<Editor />} />
          </Route>
          <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}>
            <Route path="admin" element={<Admin />} />
          </Route>
          <Route
            element={<RequireAuth allowedRoles={[ROLES.Editor, ROLES.Admin]} />}
          >
            <Route path="lounge" element={<Lounge />} />
          </Route>
        </Route>

        {/* catch all 404*/}
        <Route path="*" element={<Missing />} />
      </Route>
    </Routes>
  );
}

export default App;
