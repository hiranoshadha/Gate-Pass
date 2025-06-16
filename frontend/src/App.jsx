import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ExecutiveApproval from "./pages/ExecutiveApproval";
import AdminDashboard from "./pages/Admin";
import GatePassRequests from "./pages/MyRequests";
import GatePassItemTracker from "./pages/ItemTracker";
import NewRequest from "./pages/NewRequest";
import Dispatch from "./pages/Dispatch";
import Receive from "./pages/Receive";
import GatePassMyReicept from "./pages/MyReceipts";
import Verify from "./pages/Verify";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastProvider } from "./components/ToastProvider";

const App = () => {
    return (
        <div className="pt-20">
            <ToastProvider>
                <Navbar />
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Login />} />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute allowedRoles={["Admin", "SuperAdmin", "User", "Approver", "Verifier", "Pleader", "Dispatcher"]} />}>
                        <Route path="/home" element={<Home />} />
                        <Route path="/newrequest" element={<NewRequest />} />
                        <Route path="/myrequests" element={<GatePassRequests />} />
                        <Route path="/itemTracker" element={<GatePassItemTracker />} />
                        <Route path="/myReceipts" element={<GatePassMyReicept />} />
                    </Route>

                    {/* Role-Specific Routes */}
                    <Route element={<ProtectedRoute allowedRoles={["Admin", "SuperAdmin"]} />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                    </Route>

                    <Route element={<ProtectedRoute allowedRoles={["Admin", "SuperAdmin", "Approver"]} />}>
                        <Route path="/executiveApproval" element={<ExecutiveApproval />} />
                    </Route>

                    <Route element={<ProtectedRoute allowedRoles={["Admin", "SuperAdmin", "Verifier"]} />}>
                        <Route path="/verify" element={<Verify />} />
                    </Route>

                    <Route element={<ProtectedRoute allowedRoles={["Admin", "SuperAdmin", "Pleader"]} />}>
                        <Route path="/dispatch" element={<Dispatch />} />
                    </Route>
                    <Route element={<ProtectedRoute allowedRoles={["Admin", "SuperAdmin", "Dispatcher"]} />}>
                        <Route path="/receive" element={<Receive />} /> 
                    </Route>
                </Routes>
            </ToastProvider>
        </div>
    );
};

export default App;
