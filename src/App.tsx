// src/App.tsx
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MyPhotos from "./pages/MyPhotos";
import UploadPhoto from "./pages/UploadPhoto";
import { Stats } from "./pages/Stats";
import Home from "./pages/Home";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="photos" element={<MyPhotos />} />
          <Route path="upload" element={<UploadPhoto />} />
          <Route path="stats" element={<Stats />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
