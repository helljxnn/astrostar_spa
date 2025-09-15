import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./PrivateRoute.jsx";

/* Layout general */
import DashboardLayout from "../features/dashboard/pages/Admin/components/DashboardLayout.jsx";

/* Páginas */
import Dashboard from "../features/dashboard/pages/Admin/pages/Dashboard.jsx";
import AppointmentManagement from "../features/dashboard/pages/Admin/pages/Services/AppointmentManagement.jsx";
import Athletes from "../features/dashboard/pages/Admin/pages/Athletes/Athletes.jsx";
import Employees from "../features/dashboard/pages/Admin/pages/Services/Employees/Employees.jsx";
import EmployeesSchedule from "../features/dashboard/pages/Admin/pages/Services/EmployeesSchedule.jsx";
import SportsCategory from "../features/dashboard/pages/Admin/pages/Athletes/SportsCategory.jsx";
import EventsDashboard from "../features/dashboard/pages/Admin/pages/Events/EventsDashboard.jsx";
import Users from "../features/dashboard/pages/Admin/pages/Users/Users.jsx";
import TemporaryWorkers from "../features/dashboard/pages/Admin/pages/Athletes/TemporaryWorkers/TemporaryWorkers.jsx";
import Roles from "../features/dashboard/pages/Admin/pages/Roles/Roles.jsx";
import SportsEquipment from "../features/dashboard/pages/Admin/pages/SportEquipment/SportsEquipment.jsx";
import Donations from "../features/dashboard/pages/Admin/pages/Donations/Donations/Donations.jsx";
import DonorsSponsors from "../features/dashboard/pages/Admin/pages/Donations/DonorsSponsors/DonorsSponsors.jsx";
import Purchases from "../features/dashboard/pages/Admin/pages/Purchases/PurchasesSection/purchases.jsx";
import Sales from "../features/dashboard/pages/Admin/pages/Sales/Sales";
import { Unauthorized } from "../shared/components/Unauthorized.jsx";
import Providers from "../features/dashboard/pages/Admin/pages/Purchases/Providers/Providers.jsx";

const PrivateRoutes = () => {
  return (
    <Routes>
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Un solo /dashboard con layout */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        {/* Ruta index compartida para todos los roles */}
        <Route index element={
          <PrivateRoute allowedRoles={["admin", "profesional_deportivo", "profesional_salud", "deportista", "acudiente"]}>
            <Dashboard />
          </PrivateRoute>
        } />

        {/* Rutas con permisos específicos */}

        {/* Gestión de citas - Accesible para todos los roles */}
        <Route path="appointment-management" element={
          <PrivateRoute allowedRoles={["admin", "profesional_deportivo", "profesional_salud", "deportista", "acudiente"]}>
            <AppointmentManagement />
          </PrivateRoute>
        } />

        {/* Deportistas - Accesible para admin, profesional_deportivo y profesional_salud */}
        <Route path="athletes" element={
          <PrivateRoute allowedRoles={["admin", "profesional_deportivo", "profesional_salud"]}>
            <Athletes />
          </PrivateRoute>
        } />

        {/* Empleados - Solo para admin */}
        <Route path="employees" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <Employees />
          </PrivateRoute>
        } />

        {/* Eventos - Solo para admin */}
        <Route path="events" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <EventsDashboard />
          </PrivateRoute>
        } />

        {/* Providers - Solo para admin */}
        <Route path="providers" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <Providers />
          </PrivateRoute>
        } />

        {/* Horario de empleados - Para admin, profesional_deportivo y profesional_salud */}
        <Route path="employees-schedule" element={
          <PrivateRoute allowedRoles={["admin", "profesional_deportivo", "profesional_salud"]}>
            <EmployeesSchedule />
          </PrivateRoute>
        } />

        {/* Categoría deportiva - Para admin, profesional_deportivo y profesional_salud */}
        <Route path="sports-category" element={
          <PrivateRoute allowedRoles={["admin", "profesional_deportivo", "profesional_salud"]}>
            <SportsCategory />
          </PrivateRoute>
        } />

        {/* Gestión de usuarios - Solo para admin */}
        <Route path="users" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <Users />
          </PrivateRoute>
        } />
        
        {/* Trabajadores temporales - Solo para admin */}
        <Route path="temporary-workers" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <TemporaryWorkers />
          </PrivateRoute>
        } />

        {/* Roles - Solo para admin */}
        <Route path="roles" element={
          <PrivateRoute allowedRoles={["admin"]}>
            <Roles />
          </PrivateRoute>
        } />

        {/* Material Deportivo - Solo para admin */}
        <Route
            path="sportsequipment"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <SportsEquipment />
              </PrivateRoute>
            }
          />
          <Route
            path="donations"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <Donations />
              </PrivateRoute>
            }
          />
          {/* Donantes y Patrocinadores - Solo para admin */}
          <Route
            path="donors-sponsors"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <DonorsSponsors />
              </PrivateRoute>
            }
          />
          <Route
            path="purchases"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <Purchases />
              </PrivateRoute>
            }
          />
          <Route
            path="sales"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <Sales />
              </PrivateRoute>
            }
          />
      </Route>
    </Routes>
  );
};

export default PrivateRoutes;
