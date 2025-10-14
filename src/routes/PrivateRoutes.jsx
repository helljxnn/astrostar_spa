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
import TemporaryWorkers from "../features/dashboard/pages/Admin/pages/Athletes/TemporaryWorkers/TemporaryWorkers.jsx";
import AssistanceAthletes from "../features/dashboard/pages/Admin/pages/Athletes/AssistanceAthletes/AssistanceAthletes.jsx";
import AttendanceHistory from "../features/dashboard/pages/Admin/pages/Athletes/AssistanceAthletes/components/AttendanceHistory.jsx";


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
            <PrivateRoute
              allowedRoles={[
                "admin",
                "profesional_deportivo",
                "profesional_salud",
                "deportista",
                "acudiente",
              ]}
            >
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* --- Módulo: Citas --- */}
        <Route
          path="appointment-management"
          element={
            <PrivateRoute
              allowedRoles={[
                "admin",
                "profesional_deportivo",
                "profesional_salud",
                "deportista",
                "acudiente",
              ]}
            >
              <AppointmentManagement />
            </PrivateRoute>
          }
        />

        {/* --- Módulo: Deportistas --- */}
        <Route
          path="athletes-section"
          element={
            <PrivateRoute
              allowedRoles={[
                "admin",
                "profesional_deportivo",
                "profesional_salud",
              ]}
            >
              <Athletes />
            </PrivateRoute>
          }
        />
        <Route
          path="sports-category"
          element={
            <PrivateRoute
              allowedRoles={[
                "admin",
                "profesional_deportivo",
                "profesional_salud",
              ]}
            >
              <SportsCategory />
            </PrivateRoute>
          }
        />
        <Route
          path="temporary-workers"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <TemporaryWorkers />
            </PrivateRoute>
          }
        />

        {/* --- Módulo: Asistencia Deportistas --- */}
        <Route
          path="athletes-assistance"
          element={
            <PrivateRoute
              allowedRoles={[
                "admin",
                "profesional_deportivo",
                "profesional_salud",
              ]}
            >
              <AssistanceAthletes />
            </PrivateRoute>
          }
        />
        <Route
          path="athletes-assistance/history"
          element={
            <PrivateRoute
              allowedRoles={[
                "admin",
                "profesional_deportivo",
                "profesional_salud",
              ]}
            >
              <AttendanceHistory />
            </PrivateRoute>
          }
        />

        {/* --- Módulo: Empleados --- */}
        <Route
          path="employees"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Employees />
            </PrivateRoute>
          }
        />
        <Route
          path="employees-schedule"
          element={
            <PrivateRoute
              allowedRoles={[
                "admin",
                "profesional_deportivo",
                "profesional_salud",
              ]}
            >
              <EmployeesSchedule />
            </PrivateRoute>
          }
        />

        {/* --- Módulo: Usuarios y Roles --- */}
        <Route
          path="users"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Users />
            </PrivateRoute>
          }
        />
        <Route
          path="roles"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Roles />
            </PrivateRoute>
          }
        />

        {/* --- Módulo: Eventos --- */}
        <Route
          path="events"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <EventsDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="temporary-teams"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <TemporaryTeams />
            </PrivateRoute>
          }
        />

        {/* --- Módulo: Material Deportivo --- */}
        <Route
          path="sportsequipment"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <SportsEquipment />
            </PrivateRoute>
          }
        />

        {/* --- Módulo: Donaciones --- */}
        <Route
          path="donations"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Donations />
            </PrivateRoute>
          }
        />
        <Route
          path="donations/form"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <DonationsForm />
            </PrivateRoute>
          }
        />
        <Route
          path="donors-sponsors"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <DonorsSponsors />
            </PrivateRoute>
          }
        />

        {/* --- Módulo: Compras --- */}
        <Route
          path="purchases"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Purchases />
            </PrivateRoute>
          }
        />
        <Route
          path="providers"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Providers />
            </PrivateRoute>
          }
        />
      </Route>
    </Routes>
  );
};

export default PrivateRoutes;
