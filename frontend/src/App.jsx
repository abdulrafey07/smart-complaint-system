import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AIAnalysis from "./pages/AIAnalysis.jsx";
import ComplaintDetails from "./pages/ComplaintDetails.jsx";
import ComplaintList from "./pages/ComplaintList.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import RegisterComplaint from "./pages/RegisterComplaint.jsx";
import Signup from "./pages/Signup.jsx";
import StatusUpdate from "./pages/StatusUpdate.jsx";

const App = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<Navbar />}>
        <Route index element={<Dashboard />} />
        <Route path="/complaints" element={<ComplaintList />} />
        <Route path="/complaints/new" element={<RegisterComplaint />} />
        <Route path="/complaints/:id" element={<ComplaintDetails />} />
        <Route path="/complaints/:id/status" element={<StatusUpdate />} />
        <Route path="/complaints/:id/ai" element={<AIAnalysis />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
