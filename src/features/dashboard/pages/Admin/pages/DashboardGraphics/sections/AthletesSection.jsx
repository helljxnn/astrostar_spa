import { useState, useEffect } from "react";
import KPICard from "../components/KPICard";
import AthletesTrackingGraphic from "../components/AthletesTrackingGraphic";
import PaymentsGraphic from "../components/RegisteredPlayers"; // Renombrado a PaymentsGraphic
import DashboardService from "../services/DashboardService";
import { paymentsService } from "../../Athletes/Payments/services/PaymentsService";
import EnrollmentsService from "../../Athletes/Enrollments/services/EnrollmentsService";
import AthletesService from "../../Athletes/AthletesSection/services/AthletesService";
import { ENROLLMENT_STATUS } from "../../Athletes/Enrollments/constants/enrollmentConstants";
import {
  FaRunning,
  FaUserCheck,
  FaUserClock,
  FaUserTimes,
} from "react-icons/fa";

const AthletesSection = () => {
  const [kpis, setKpis] = useState({
    totalAthletes: 0,
    activeEnrollments: 0,
    expiredEnrollments: 0,
    pendingEnrollments: 0
  });
  const [categoryStats, setCategoryStats] = useState({
    infantil: 0,
    preJuvenil: 0,
    juvenil: 0
  });
  const [paymentsStats, setPaymentsStats] = useState({
    newPayments: 0,
    totalPayments: 0
  });
  const [attendanceStats, setAttendanceStats] = useState({
    averageAttendance: 0,
    attendanceRate: 0,
    totalRecords: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // console.log('🔄 Iniciando carga de datos del dashboard...');
      
      // MÉTODO DIRECTO: Obtener datos directamente de los servicios
      // console.log('📊 Obteniendo matrículas directamente...');
      const enrollmentsResponse = await EnrollmentsService.getAllForReport();
      // console.log('📊 Respuesta matrículas:', enrollmentsResponse);

      // console.log('📊 Obteniendo deportistas directamente...');
      const athletesResponse = await AthletesService.getActiveAthletes();
      // console.log('📊 Respuesta deportistas:', athletesResponse);

      // console.log('📊 Obteniendo pagos directamente...');
      let paymentsResponse = { success: false, data: { payments: [], stats: { total: 0, thisMonth: 0 } } };
      
      // Usar el nuevo método del DashboardService
      try {
        paymentsResponse = await DashboardService.getPaymentsDashboardData();
        // console.log('📊 Respuesta pagos (DashboardService):', paymentsResponse);
      } catch (error) {
        console.warn('⚠️ DashboardService.getPaymentsDashboardData falló:', error);
        
        // Fallback: intentar con paymentsService
        try {
          const fallbackResponse = await paymentsService.getAllForReport();
          if (fallbackResponse.success && fallbackResponse.data) {
            paymentsResponse = {
              success: true,
              data: {
                payments: fallbackResponse.data,
                stats: {
                  total: fallbackResponse.data.length,
                  thisMonth: fallbackResponse.data.filter(p => {
                    const date = new Date(p.createdAt || p.uploadedAt);
                    return date.getMonth() === new Date().getMonth();
                  }).length
                }
              }
            };
          }
        } catch (fallbackError) {
          console.warn('⚠️ Fallback también falló:', fallbackError);
        }
      }

      // console.log('📊 Obteniendo datos de asistencia...');
      let attendanceResponse = { success: false, data: { stats: { averageAttendance: 0, attendanceRate: 0, totalRecords: 0 } } };
      
      try {
        attendanceResponse = await DashboardService.getAttendanceData();
        // console.log('📊 Respuesta asistencia:', attendanceResponse);
      } catch (error) {
        console.warn('⚠️ Error obteniendo datos de asistencia:', error);
      }

      // Procesar datos de matrículas
      if (enrollmentsResponse.success && enrollmentsResponse.data) {
        const enrollments = enrollmentsResponse.data;
        console.log('✅ Procesando', enrollments.length, 'matrículas...');
        
        let vigentes = 0, vencidas = 0, pendientes = 0;
        
        enrollments.forEach((enrollment, index) => {
          const estado = enrollment.estadoMatricula || enrollment.estado || enrollment.latestEnrollment?.estado;
          console.log(`Matrícula ${index + 1}: estado=${estado}`);
          
          if (estado === ENROLLMENT_STATUS.VIGENTE) {
            vigentes++;
          } else if (estado === ENROLLMENT_STATUS.VENCIDA) {
            vencidas++;
          } else if (estado === ENROLLMENT_STATUS.PENDING_PAYMENT) {
            pendientes++;
          }
        });
        
        console.log('✅ Estadísticas de matrículas:', { vigentes, vencidas, pendientes });
        
        setKpis({
          totalAthletes: vigentes + vencidas + pendientes,
          activeEnrollments: vigentes,
          expiredEnrollments: vencidas,
          pendingEnrollments: pendientes
        });
      } else {
        console.warn('⚠️ No se pudieron obtener datos de matrículas:', enrollmentsResponse);
      }

      // Procesar datos de deportistas por categoría
      if (athletesResponse.success && athletesResponse.data) {
        const athletes = athletesResponse.data;
        console.log('✅ Procesando', athletes.length, 'deportistas...');
        
        let infantil = 0, preJuvenil = 0, juvenil = 0;
        
        athletes.forEach((athlete, index) => {
          const categoria = (athlete.categoria || '').toLowerCase().trim();
          console.log(`Deportista ${index + 1}: ${athlete.nombreCompleto || athlete.nombre} - categoría=${categoria}`);
          
          if (categoria.includes('infantil')) {
            infantil++;
          } else if (categoria.includes('pre') && categoria.includes('juvenil')) {
            preJuvenil++;
          } else if (categoria.includes('juvenil')) {
            juvenil++;
          }
        });
        
        console.log('✅ Estadísticas de categorías:', { infantil, preJuvenil, juvenil });
        
        setCategoryStats({ infantil, preJuvenil, juvenil });
      } else {
        console.warn('⚠️ No se pudieron obtener datos de deportistas:', athletesResponse);
      }

      // Procesar datos de pagos
      if (paymentsResponse.success && paymentsResponse.data && paymentsResponse.data.stats) {
        console.log('✅ Procesando estadísticas de pagos:', paymentsResponse.data.stats);
        
        const stats = paymentsResponse.data.stats;
        
        setPaymentsStats({
          newPayments: stats.thisMonth || 0,
          totalPayments: stats.total || 0
        });
        
        console.log('✅ Estadísticas de pagos actualizadas:', {
          total: stats.total,
          thisMonth: stats.thisMonth
        });
      } else {
        console.warn('⚠️ No se pudieron obtener datos de pagos:', paymentsResponse);
        setPaymentsStats({
          newPayments: 0,
          totalPayments: 0
        });
      }

      // Procesar datos de asistencia
      if (attendanceResponse.success && attendanceResponse.data && attendanceResponse.data.stats) {
        console.log('✅ Procesando estadísticas de asistencia:', attendanceResponse.data.stats);
        
        const stats = attendanceResponse.data.stats;
        
        setAttendanceStats({
          averageAttendance: stats.averageAttendance || 0,
          attendanceRate: stats.attendanceRate || 0,
          totalRecords: stats.totalRecords || 0
        });
        
        console.log('✅ Estadísticas de asistencia actualizadas:', {
          averageAttendance: stats.averageAttendance,
          attendanceRate: stats.attendanceRate,
          totalRecords: stats.totalRecords
        });
      } else {
        console.warn('⚠️ No se pudieron obtener datos de asistencia:', attendanceResponse);
        setAttendanceStats({
          averageAttendance: 0,
          attendanceRate: 0,
          totalRecords: 0
        });
      }

    } catch (error) {
      console.error("❌ Error al cargar datos del dashboard:", error);
    } finally {
      setLoading(false);
      console.log('✅ Carga de datos completada');
    }
  };

  // Calcular porcentajes para las barras de categorías
  const totalByCategory = categoryStats.infantil + categoryStats.preJuvenil + categoryStats.juvenil;
  const infantilPercentage = totalByCategory > 0 ? (categoryStats.infantil / totalByCategory) * 100 : 0;
  const preJuvenilPercentage = totalByCategory > 0 ? (categoryStats.preJuvenil / totalByCategory) * 100 : 0;
  const juvenilPercentage = totalByCategory > 0 ? (categoryStats.juvenil / totalByCategory) * 100 : 0;
  return (
    <div className="space-y-6">
      {/* KPIs específicos de deportistas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Deportistas"
          value={loading ? "..." : kpis.totalAthletes.toString()}
          icon={FaRunning}
          color="pink"
          trend="up"
          trendValue="8%"
        />
        <KPICard
          title="Matrículas Vigentes"
          value={loading ? "..." : kpis.activeEnrollments.toString()}
          icon={FaUserCheck}
          color="green"
          trend="up"
          trendValue="5%"
        />
        <KPICard
          title="Pendientes de Pago"
          value={loading ? "..." : kpis.pendingEnrollments.toString()}
          icon={FaUserClock}
          color="purple"
        />
        <KPICard
          title="Vencidas"
          value={loading ? "..." : kpis.expiredEnrollments.toString()}
          icon={FaUserTimes}
          color="yellow"
          trend="down"
          trendValue="3%"
        />
      </div>

      {/* Gráficas principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AthletesTrackingGraphic />

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-primary-pink to-primary-purple rounded-full"></div>
            Deportistas por Categoría
          </h3>
          
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Categoría Infantil
                  </span>
                  <span className="text-sm font-bold text-gray-800">{categoryStats.infantil}</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-purple to-primary-purple-light rounded-full shadow-sm transition-all duration-1000"
                    style={{ width: `${infantilPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Categoría Pre-Juvenil
                  </span>
                  <span className="text-sm font-bold text-gray-800">{categoryStats.preJuvenil}</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-pink to-pink-400 rounded-full shadow-sm transition-all duration-1000"
                    style={{ width: `${preJuvenilPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Categoría Juvenil
                  </span>
                  <span className="text-sm font-bold text-gray-800">{categoryStats.juvenil}</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-blue to-blue-400 rounded-full shadow-sm transition-all duration-1000"
                    style={{ width: `${juvenilPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Total</span>
              <span className="text-lg font-bold bg-gradient-to-r from-primary-purple to-primary-pink bg-clip-text text-transparent">
                {loading ? "..." : totalByCategory}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfica de pagos mensuales */}
      <PaymentsGraphic />

      {/* Estadísticas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-primary-blue/10 to-primary-blue/5 rounded-2xl shadow-lg p-6 border-2 border-primary-blue/20 hover:border-primary-blue/40 transition-all">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Total Pagos
          </h4>
          <p className="text-4xl font-bold bg-gradient-to-r from-primary-blue to-blue-600 bg-clip-text text-transparent">
            {loading ? "..." : paymentsStats.totalPayments.toString()}
          </p>
          <p className="text-xs text-gray-600 mt-1">Pagos registrados</p>
        </div>

        <div className="bg-gradient-to-br from-primary-pink/10 to-primary-pink/5 rounded-2xl shadow-lg p-6 border-2 border-primary-pink/20 hover:border-primary-pink/40 transition-all">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Pagos Este Mes
          </h4>
          <p className="text-4xl font-bold bg-gradient-to-r from-primary-pink to-pink-600 bg-clip-text text-transparent">
            {loading ? "..." : paymentsStats.newPayments.toString()}
          </p>
          <p className="text-xs text-gray-600 mt-1">Pagos procesados</p>
        </div>

        <div className="bg-gradient-to-br from-primary-green/10 to-primary-green/5 rounded-2xl shadow-lg p-6 border-2 border-primary-green/20 hover:border-primary-green/40 transition-all">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Asistencia Promedio
          </h4>
          <p className="text-4xl font-bold bg-gradient-to-r from-primary-green to-green-600 bg-clip-text text-transparent">
            {loading ? "..." : attendanceStats.totalRecords > 0 ? `${attendanceStats.attendanceRate}%` : "Sin datos"}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {attendanceStats.totalRecords > 0 ? "Último mes" : "Módulo implementado"}
          </p>
        </div>

        <div className="bg-gradient-to-br from-primary-purple/10 to-primary-purple/5 rounded-2xl shadow-lg p-6 border-2 border-primary-purple/20 hover:border-primary-purple/40 transition-all">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Deportistas Activos
          </h4>
          <p className="text-4xl font-bold bg-gradient-to-r from-primary-purple to-purple-600 bg-clip-text text-transparent">
            {loading ? "..." : kpis.activeEnrollments > 0 ? `${Math.round((kpis.activeEnrollments / kpis.totalAthletes) * 100)}%` : "0%"}
          </p>
          <p className="text-xs text-gray-600 mt-1">Con matrícula vigente</p>
        </div>
      </div>
    </div>
  );
};

export default AthletesSection;
