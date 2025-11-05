// ================================ 
// PrivateRoutes.jsx
// ================================
import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute.jsx";

/* --- Layout general --- */
import DashboardLayout from "../features/dashboard/pages/Admin/components/DashboardLayout.jsx";

/* --- Páginas principales --- */
import Dashboard from "../features/dashboard/pages/Admin/pages/DashboardGraphics/Dashboard.jsx";

/* --- Servicios --- */
import AppointmentManagement from "../features/dashboard/pages/Admin/pages/Services/AppointmentManagement/Appointments.jsx";
import Employees from "../features/dashboard/pages/Admin/pages/Services/Employees/Employees.jsx";
import EmployeesSchedule from "../features/dashboard/pages/Admin/pages/Services/EmployeesSchedule/EmployeesSchedule.jsx";

/* --- Deportistas --- */
import Athletes from "../features/dashboard/pages/Admin/pages/Athletes/AthletesSection/Athletes.jsx";
import SportsCategory from "../features/dashboard/pages/Admin/pages/Athletes/SportsCategory/SportsCategory.jsx";
import TemporaryWorkers from "../features/dashboard/pages/Admin/pages/Athletes/TemporaryWorkers/EventsDashboard.jsx";
import AssistanceAthletes from "../features/dashboard/pages/Admin/pages/Athletes/AssistanceAthletes/AssistanceAthletes.jsx";
import AttendanceHistory from "../features/dashboard/pages/Admin/pages/Athletes/Assistanceathletes/AttendanceHistory.jsx";


/* --- Usuarios y Roles --- */
import Users from "../features/dashboard/pages/Admin/pages/Users/Users.jsx";
import Roles from "../features/dashboard/pages/Admin/pages/Roles/Roles.jsx";

/* --- Eventos --- */
import EventsDashboard from "../features/dashboard/pages/Admin/pages/Events/EventsSection/EventsDashboard.jsx";
import TemporaryTeams from "../features/dashboard/pages/Admin/pages/Events/TemporaryTeams/TemporaryTeams.jsx";

/* --- Material Deportivo --- */
import SportsEquipment from "../features/dashboard/pages/Admin/pages/SportEquipment/SportsEquipment.jsx";

/* --- Donaciones --- */
import Donations from "../features/dashboard/pages/Admin/pages/Donations/Donations/Donations.jsx";
import DonationsForm from "../features/dashboard/pages/Admin/pages/Donations/Donations/DonationsForm.jsx";
import DonorsSponsors from "../features/dashboard/pages/Admin/pages/Donations/DonorsSponsors/donorsSponsors.jsx";

/* --- Compras --- */
import Purchases from "../features/dashboard/pages/Admin/pages/Purchases/PurchasesSection/purchases.jsx";
import Providers from "../features/dashboard/pages/Admin/pages/Purchases/Providers/Providers.jsx";

/* --- Componentes generales --- */
import { Unauthorized } from "../shared/components/Unauthorized.jsx";

const PrivateRoutes = () => {
  return (
    <Routes>
      {/* Ruta pública para acceso no autorizado */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Todas las rutas bajo el layout /dashboard */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        {/* --- Principal --- */}
        <Route
          index
          element={
            <PrivateRoute module="dashboard" action="Ver">
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* --- Módulo: Citas --- */}
        <Route
          path="appointment-management"
          element={
            <PrivateRoute module="appointmentManagement" action="Ver">
              <AppointmentManagement />
            </PrivateRoute>
          }
        />

        {/* --- Módulo: Deportistas --- */}
        <Route
          path="athletes-section"
          element={
            <PrivateRoute module="athletesSection" action="Ver">
              <Athletes />
            </PrivateRoute>
          }
        />
        <Route
          path="sports-category"
          element={
            <PrivateRoute module="sportsCategory" action="Ver">
              <SportsCategory />
            </PrivateRoute>
          }
        />
        <Route
          path="temporary-workers"
          element={
            <PrivateRoute module="temporaryWorkers" action="Ver">
              <TemporaryWorkers />
            </PrivateRoute>
          }
        />

        {/* --- Módulo: Asistencia Deportistas --- */}
        <Route
          path="athletes-assistance"
          element={
            <PrivateRoute module="athletesAssistance" action="Ver">
              <AssistanceAthletes />
            </PrivateRoute>
          }
        />
        <Route
          path="athletes-assistance/history"
          element={
            <PrivateRoute module="athletesAssistance" action="Ver">
              <AttendanceHistory />
            </PrivateRoute>
          }
        />

        {/* --- Módulo: Empleados --- */}
        <Route
          path="employees"
          element={
            <PrivateRoute module="employees" action="Ver">
              <Employees />
            </PrivateRoute>
          }
        />
        <Route
          path="employees-schedule"
          element={
            <PrivateRoute module="employeesSchedule" action="Ver">
              <EmployeesSchedule />
            </PrivateRoute>
          }
        />

        {/* --- Módulo: Usuarios y Roles --- */}
        <Route
          path="users"
          element={
            <PrivateRoute module="users" action="Ver">
              <Users />
            </PrivateRoute>
          }
        />
        <Route
          path="roles"
          element={
            <PrivateRoute module="roles" action="Ver">
              <Roles />
            </PrivateRoute>
          }
        />

        {/* --- Módulo: Eventos --- */}
        <Route
          path="events"
          element={
            <PrivateRoute module="eventsManagement" action="Ver">
              <EventsDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="temporary-teams"
          element={
            <PrivateRoute module="temporaryTeams" action="Ver">
              <TemporaryTeams />
            </PrivateRoute>
          }
        />

        {/* --- Módulo: Material Deportivo --- */}
        <Route
          path="sportsequipment"
          element={
            <PrivateRoute module="sportsEquipment" action="Ver">
              <SportsEquipment />
            </PrivateRoute>
          }
        />

        {/* --- Módulo: Donaciones --- */}
        <Route
          path="donations"
          element={
            <PrivateRoute module="donationsManagement" action="Ver">
              <Donations />
            </PrivateRoute>
          }
        />
        <Route
          path="donations/form"
          element={
            <PrivateRoute module="donationsManagement" action="Crear">
              <DonationsForm />
            </PrivateRoute>
          }
        />
        <Route
          path="donors-sponsors"
          element={
            <PrivateRoute module="donorsSponsors" action="Ver">
              <DonorsSponsors />
            </PrivateRoute>
          }
        />

        {/* --- Módulo: Compras --- */}
        <Route
          path="purchases"
          element={
            <PrivateRoute module="purchasesManagement" action="Ver">
              <Purchases />
            </PrivateRoute>
          }
        />
        <Route
          path="providers"
          element={
            <PrivateRoute module="providers" action="Ver">
              <Providers />
            </PrivateRoute>
          }
        />
      </Route>
    </Routes>
  );
};

export default PrivateRoutes;
