import { Routes, Route } from "react-router-dom";

/* Componente para proteger las rutas */
import PrivateRoute from "./PrivateRoute.jsx"; // Asegúrate de crear este archivo    
// import DashboardLayout from "../features/dashboard/pages/Admin/components/DashboardLayout.jsx";

/* Dashboard - Admin */
import DashboardLayout from "../features/dashboard/pages/Admin/components/DashboardLayout.jsx";
import AppointmentManagement from "../features/dashboard/pages/Admin/pageS/Services/AppointmentManagement.jsx";
import Athletes from "../features/dashboard/pages/Admin/pages/Athletes/Athletes.jsx";
import Dashboard from "../features/dashboard/pages/Admin/pages/Dashboard.jsx";
import Donations from "../features/dashboard/pages/Admin/pages/Donations.jsx";
import Employees from "../features/dashboard/pages/Admin/pages/Services/Employees/Employees.jsx";
import EmployeesSchedule from "../features/dashboard/pages/Admin/pages/Services/EmployeesSchedule.jsx";
import EventsDashboard from "../features/dashboard/pages/Admin/pages//Events/EventsDashboard.jsx";
import Roles from "../features/dashboard/pages/Admin/pages/Roles/Roles.jsx";
import Sales from "../features/dashboard/pages/Admin/pages/Sales.jsx";
import SportsCategory from "../features/dashboard/pages/Admin/pages/Athletes/SportsCategory.jsx";
import TemporaryWorkers from "../features/dashboard/pages/Admin/pages/Athletes/TemporaryWorkers/TemporaryWorkers.jsx";
import SportsEquipment from "../features/dashboard/pages/Admin/pages//SportEquipment/SportsEquipment.jsx";
import Users from "../features/dashboard/pages/Admin/pages/Users/Users.jsx";
import { Purchases } from "../features/dashboard/pages/Admin/pages/Purchases/Purchases.jsx";
import Providers from "../features/dashboard/pages/Admin/pages/Purchases/Providers/Providers.jsx";

const PrivateRoutes = () => {
  return (
    <Routes>
      {/* Las rutas dentro de este componente están protegidas */}
      <Route element={<PrivateRoute />}>
        {/* Rutas del Dashboard (Admin) */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="appointment-management" element={<AppointmentManagement />} />
          <Route path="athletes" element={<Athletes />} />
          <Route path="donations" element={<Donations />} />
          <Route path="employees" element={<Employees />} />
          <Route path="employees-schedule" element={<EmployeesSchedule />} />
          <Route path="events" element={<EventsDashboard />} />
          <Route path="roles" element={<Roles />} />
          <Route path="sales" element={<Sales />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="providers" element={<Providers />} />
          <Route path="sports-category" element={<SportsCategory />} />
          <Route path="temporary-workers" element={<TemporaryWorkers />} />
          <Route path="sportsequipment" element={<SportsEquipment />} />
          <Route path="users" element={<Users />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default PrivateRoutes;