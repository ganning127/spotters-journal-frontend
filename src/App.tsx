import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MyPhotos from "./pages/MyPhotos";
import UploadPhoto from "./pages/UploadPhoto";
import MyFlights from "./pages/MyFlights";
import AddFlight from "./pages/AddFlight";
import { Stats } from "./pages/Stats";
import { FlightStats } from "./pages/FlightStats";
import Home from "./pages/Home";
import FlightDetails from "./pages/FlightDetails";

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
          <Route path="flights" element={<MyFlights />} />
          <Route path="flights/add" element={<AddFlight />} />
          <Route path="flights/edit/:id" element={<AddFlight />} />
          <Route path="flights/:id" element={<FlightDetails />} />
          <Route path="stats" element={<Stats />} />
          <Route path="flight-stats" element={<FlightStats />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
