// src/App.tsx
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MyPhotos from "./pages/MyPhotos";
import UploadPhoto from "./pages/UploadPhoto";
import AddAircraftType from "./pages/AddAircraftType";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route
          index
          element={
            <div className="text-center mt-20">
              <h2 className="text-3xl font-bold mb-4">
                Welcome to PlaneTracker
              </h2>
              <p className="text-gray-500">
                Log your sightings. Track your fleet.
              </p>
            </div>
          }
        />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="photos" element={<MyPhotos />} />
          <Route path="upload" element={<UploadPhoto />} />
          <Route path="add-aircraft-type" element={<AddAircraftType />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
