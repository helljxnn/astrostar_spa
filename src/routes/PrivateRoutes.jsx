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
import Classes from "../features/dashboard/pages/Admin/pages/Classes/ClassesPage.jsx";

/* --- Deportistas --- */
import Athletes from "../features/dashboard/pages/Admin/pages/Athletes/AthletesSection/Athletes.jsx";
import SportsCategory from "../features/dashboard/pages/Admin/pages/Athletes/SportsCategory/SportsCategory.jsx";
import TemporaryPersons from "../features/dashboard/pages/Admin/pages/Services/TemporaryPersons/TemporaryPersons.jsx";
import AssistanceAthletes from "../features/dashboard/pages/Admin/pages/Athletes/AssistanceAthletes/AssistanceAthletes.jsx";
import AttendanceHistory from "../features/dashboard/pages/Admin/pages/Athletes/Assistanceathletes/AttendanceHistory.jsx";
import Enrollments from "../features/dashboard/pages/Admin/pages/Athletes/Enrollments/Enrollments.jsx";

/* --- Usuarios y Roles --- */
import Users from "../features/dashboard/pages/Admin/pages/Users/Users.jsx";
import Roles from "../features/dashboard/pages/Admin/pages/Roles/Roles.jsx";

/* --- Eventos --- */
import EventsDashboard from "../features/dashboard/pages/Admin/pages/Events/EventsSection/EventsDashboard.jsx";
import TemporaryTeams from "../features/dashboard/pages/Admin/pages/Events/TemporaryTeams/TemporaryTeams.jsx";

/* --- Material Deportivo --- */
import MaterialsCatalog from "../features/dashboard/pages/Admin/pages/SportsMaterials/Materials/MaterialsCatalog.jsx";
import MaterialCategories from "../features/dashboard/pages/Admin/pages/SportsMaterials/Categories/MaterialCategories.jsx";
import MaterialsMovements from "../features/dashboard/pages/Admin/pages/SportsMaterials/MaterialsMovements/MaterialsMovements.jsx";

/* --- Donaciones --- */
import Donations from "../features/dashboard/pages/Admin/pages/Donations/Donations/Donations.jsx";
import DonationsForm from "../features/dashboard/pages/Admin/pages/Donations/Donations/DonationsForm.jsx";
import DonorsSponsors from "../features/dashboard/pages/Admin/pages/Donations/DonorsSponsors/donorsSponsors.jsx";

/* --- Proveedores --- */
import Providers from "../features/dashboard/pages/Admin/pages/Providers/Providers.jsx";

/* --- Componentes generales --- */
import DashboardHome from "../shared/components/DashboardHome.jsx";

const PrivateRoutes = () => {
  return (
    <Routes>
      {/* Todas las rutas bajo el layout /dashboard */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        {/* --- Principal --- */}
        <Route index element={<DashboardHome />} />

        {/* --- Dashboard específico (requiere permisos) --- */}
        <Route
          path="analytics"
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
              <TemporaryPersons />
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

        {/* --- Módulo: Matrículas --- */}
        <Route
          path="enrollments"
          element={
            <PrivateRoute module="enrollments" action="Ver">
              <Enrollments />
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

        {/* --- Módulo: Clases --- */}
        <Route
          path="classes"
          element={
            <PrivateRoute module="classes" action="Ver">
              <Classes />
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

        {/* --- Módulo: Materiales --- */}
        <Route
          path="materials"
          element={
            <PrivateRoute module="sportsEquipment" action="Ver">
              <MaterialsCatalog />
            </PrivateRoute>
          }
        />

        {/* --- Módulo: Categorías de Materiales --- */}
        <Route
          path="material-categories"
          element={
            <PrivateRoute module="materialCategories" action="Ver">
              <MaterialCategories />
            </PrivateRoute>
          }
        />

        {/* --- Módulo: Movimientos de Materiales --- */}
        <Route
          path="materials-movements"
          element={
            <PrivateRoute module="materialsRegistry" action="Ver">
              <MaterialsMovements />
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

        {/* --- Módulo: Proveedores --- */}
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
