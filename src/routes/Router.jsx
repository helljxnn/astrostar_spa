import { Routes, Route } from "react-router-dom";

/* Landing Pages*/
import LayoutLanding from "../features/landing/components/LayoutLanding";
import About from "../features/landing/pages/About/About";
import Categories from "../features/landing/pages/Categories";
import {Events} from"../features/landing/pages/Events/Events.jsx";""
import Home from "../features/landing/pages/Home";
import Login from "../features/auth/pages/Login";
import Services from "../features/landing/pages/Services/Services";

/* Dashboard - Admin */
import DashboardLayout from "../features/dashboard/pages/Admin/components/DashboardLayout.jsx";

// Admin Pages
import AccessManagement from "../features/dashboard/pages/Admin/pages/Users/AccessManagement";
import AppointmentManagement from "../features/dashboard/pages/Admin/pages/Services/AppointmentManagement";
import Athletes from "../features/dashboard/pages/Admin/pages/Athletes/Athletes";
import Dashboard from "../features/dashboard/pages/Admin/pages/Dashboard";
import Donations from "../features/dashboard/pages/Admin/pages/Donations";
import Employees from "../features/dashboard/pages/Admin/pages/Services/Employees/Employees.jsx";
import EmployeesSchedule from "../features/dashboard/pages/Admin/pages/Services/EmployeesSchedule";
import EventsDashboard from "../features/dashboard/pages/Admin/pages/Events/EventsDashboard.jsx";
import Roles from "../features/dashboard/pages/Admin/pages/Roles/Roles.jsx";
import Sales from "../features/dashboard/pages/Admin/pages/Sales";
import SportsCategory from "../features/dashboard/pages/Admin/pages/Athletes/SportsCategory";
import TemporaryWorkers from "../features/dashboard/pages/Admin/pages/Athletes/TemporaryWorkers/TemporaryWorkers.jsx";
import SportsEquipment from "../features/dashboard/pages/Admin/pages/SportEquipment/SportsEquipment";
import Users from "../features/dashboard/pages/Admin/pages/Users/Users";

/* Dashboard - Sportsprofessional */
import LayoutDashboard from "../features/dashboard/pages/Sportsprofessional/components/DashboardLayout.jsx";

// Sportsprofessional Pages
import AppointmentManagementprofessional from "../features/dashboard/pages/Sportsprofessional/pages/Services/AppointmentManagement.jsx";
import Athletesprofessional from "../features/dashboard/pages/Sportsprofessional/pages/Athletes/Athletes.jsx";
import EmployeeScheduleprofessional from "../features/dashboard/pages/Sportsprofessional/pages/Services/EmployeeSchedule.jsx";
import Eventsprofessional from "../features/dashboard/pages/Sportsprofessional/pages/Events.jsx";
import SportsCategoryprofessional from "../features/dashboard/pages/Sportsprofessional/pages/Athletes/SportsCategory.jsx";
import SportsEquipmentprofessional from "../features/dashboard/pages/Sportsprofessional/pages/SportsEquipment.jsx";
import Sportsprofessional from "../features/dashboard/pages/Sportsprofessional/pages/Sportsprofessional.jsx";

/*
   Dashboard - Athletes
*/
import DashboardAthletes from "../features/dashboard/pages/athletes/components/DashboardAthletes.jsx";
import AppointmentManagementathletes from "../features/dashboard/pages/athletes/pages/AppointmentManagement.jsx";
import HomeAthletes from "../features/dashboard/pages/athletes/pages/homeathletes.jsx";


function AppRoutes() {
  return (
    <Routes>
      {/* Rutas públicas con LayoutLanding */}
      <Route element={<LayoutLanding />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/events" element={<Events />} />
        <Route path="/login" element={<Login />} />
        <Route path="/services" element={<Services />} />
      </Route>

      {/* Rutas del Dashboard (Admin) */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="accessmanagement" element={<AccessManagement />} />
        <Route path="appointment-management" element={<AppointmentManagement />} />
        <Route path="athletes" element={<Athletes />} />
        <Route path="donations" element={<Donations />} />
        <Route path="employees" element={<Employees />} />
        <Route path="employees-schedule" element={<EmployeesSchedule />} />
        <Route path="events" element={<EventsDashboard />} />
        <Route path="roles" element={<Roles />} />
        <Route path="sales" element={<Sales />} />
        <Route path="sports-category" element={<SportsCategory />} />
        <Route path="temporary-workers" element={<TemporaryWorkers />} />
        <Route path="sportsequipment" element={<SportsEquipment />} />
        <Route path="users" element={<Users />} />
      </Route>

      {/* Rutas del Dashboard (Sportsprofessional) */}
      <Route path="/dashboard/sportsprofessional" element={<LayoutDashboard />}>
        <Route index element={<Sportsprofessional />} />
        <Route path="appointmentmanagement" element={<AppointmentManagementprofessional />} />
        <Route path="athletes" element={<Athletesprofessional />} />
        <Route path="employeeschedule" element={<EmployeeScheduleprofessional />} />
        <Route path="events" element={<Eventsprofessional />} />
        <Route path="sports-category" element={<SportsCategoryprofessional />} />
        <Route path="sportsequipment" element={<SportsEquipmentprofessional />} />
      </Route>

      {/* Rutas del Dashboard (Athletes) */}
      <Route path="/dashboard/athletes" element={<DashboardAthletes />}>
        <Route index element={<HomeAthletes />} />
        <Route path="appointmentmanagementathletes" element={<AppointmentManagementathletes />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
