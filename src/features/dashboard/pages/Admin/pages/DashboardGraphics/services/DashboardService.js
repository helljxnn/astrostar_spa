import apiClient from "../../../../../../../shared/services/apiClient.js";
import EnrollmentsService from "../../Athletes/Enrollments/services/EnrollmentsService.js";
import AthletesService from "../../Athletes/AthletesSection/services/AthletesService.js";
import { ENROLLMENT_STATUS } from "../../Athletes/Enrollments/constants/enrollmentConstants.js";

/**
 * Servicio para obtener datos REALES del dashboard
 * Conecta con servicios existentes para obtener información actual
 */
class DashboardService {
  constructor() {
    this.endpoint = "/dashboard";
  }

  /**
   * Obtener estadísticas REALES de seguimiento de deportistas (estados de matrícula)
   * Usa el servicio de matrículas existente para obtener datos reales
   */
  async getAthletesTracking() {
    try {
      // Usar el servicio existente para obtener todas las matrículas
      const enrollmentsResponse = await EnrollmentsService.getAllForReport();
      
      if (enrollmentsResponse.success && enrollmentsResponse.data) {
        const enrollments = enrollmentsResponse.data;
        
        // Contar por estado real
        const stats = {
          vigentes: 0,
          vencidas: 0,
          pendientes: 0
        };
        
        enrollments.forEach(enrollment => {
          const estado = enrollment.estadoMatricula || enrollment.estado || enrollment.latestEnrollment?.estado;
          
          if (estado === ENROLLMENT_STATUS.VIGENTE) {
            stats.vigentes++;
          } else if (estado === ENROLLMENT_STATUS.VENCIDA) {
            stats.vencidas++;
          } else if (estado === ENROLLMENT_STATUS.PENDING_PAYMENT) {
            stats.pendientes++;
          }
        });
        
        // console.log('📊 Estadísticas reales de matrículas:', stats);
        
        return {
          success: true,
          data: stats
        };
      }
      
      // Fallback: intentar endpoint directo si existe
      try {
        const response = await apiClient.get(`${this.endpoint}/athletes-tracking`);
        return {
          success: true,
          data: response.data || response
        };
      } catch (fallbackError) {
        console.warn('⚠️ Endpoint de dashboard no disponible, usando datos por defecto');
      }
      
      return {
        success: false,
        error: 'No se pudieron obtener datos de matrículas',
        data: {
          vigentes: 0,
          vencidas: 0,
          pendientes: 0
        }
      };
    } catch (error) {
      console.error('❌ Error fetching athletes tracking:', error);
      
      return {
        success: false,
        error: error.message,
        data: {
          vigentes: 0,
          vencidas: 0,
          pendientes: 0
        }
      };
    }
  }

  /**
   * Obtener datos REALES de deportistas por categoría
   * Usa el servicio de deportistas para obtener deportistas activos por categoría
   */
  async getAthletesByCategory() {
    try {
      console.log('🔍 Obteniendo deportistas por categoría...');
      
      // Primero intentar obtener estadísticas directas del servicio
      const statsResponse = await AthletesService.getAthleteStats();
      
      if (statsResponse.success && statsResponse.data) {
        console.log('📊 Estadísticas de deportistas obtenidas:', statsResponse.data);
        
        // Si las estadísticas incluyen datos por categoría, usarlas
        if (statsResponse.data.byCategory) {
          return {
            success: true,
            data: {
              infantil: statsResponse.data.byCategory.infantil || 0,
              preJuvenil: statsResponse.data.byCategory.preJuvenil || 0,
              juvenil: statsResponse.data.byCategory.juvenil || 0
            }
          };
        }
      }
      
      // Si no hay estadísticas, obtener todos los deportistas activos y contar por categoría
      console.log('📊 Obteniendo deportistas activos para contar por categoría...');
      const activeAthletesResponse = await AthletesService.getActiveAthletes();
      
      if (activeAthletesResponse.success && activeAthletesResponse.data) {
        const athletes = activeAthletesResponse.data;
        console.log('👥 Deportistas activos encontrados:', athletes.length);
        
        const categoryStats = {
          infantil: 0,
          preJuvenil: 0,
          juvenil: 0
        };
        
        athletes.forEach(athlete => {
          const categoria = (athlete.categoria || '').toLowerCase().trim();
          console.log('🏷️ Procesando categoría:', categoria, 'para deportista:', athlete.nombreCompleto || athlete.nombre);
          
          if (categoria.includes('infantil')) {
            categoryStats.infantil++;
          } else if (categoria.includes('pre') && categoria.includes('juvenil')) {
            categoryStats.preJuvenil++;
          } else if (categoria.includes('juvenil')) {
            categoryStats.juvenil++;
          }
        });
        
        console.log('📊 Estadísticas calculadas por categoría:', categoryStats);
        
        return {
          success: true,
          data: categoryStats
        };
      }
      
      // Fallback: intentar obtener por categorías específicas
      console.log('🔄 Intentando obtener por categorías específicas...');
      const [infantilResponse, preJuvenilResponse, juvenilResponse] = await Promise.all([
        AthletesService.getAthletesByCategory('Infantil'),
        AthletesService.getAthletesByCategory('Pre-Juvenil'),
        AthletesService.getAthletesByCategory('Juvenil')
      ]);
      
      const categoryStats = {
        infantil: (infantilResponse.success && infantilResponse.data) ? infantilResponse.data.length : 0,
        preJuvenil: (preJuvenilResponse.success && preJuvenilResponse.data) ? preJuvenilResponse.data.length : 0,
        juvenil: (juvenilResponse.success && juvenilResponse.data) ? juvenilResponse.data.length : 0
      };
      
      console.log('📊 Estadísticas por categorías específicas:', categoryStats);
      
      return {
        success: true,
        data: categoryStats
      };
      
    } catch (error) {
      console.error('❌ Error fetching athletes by category:', error);
      
      return {
        success: false,
        error: error.message,
        data: {
          infantil: 0,
          preJuvenil: 0,
          juvenil: 0
        }
      };
    }
  }

  /**
   * Obtener KPIs REALES del dashboard
   */
  async getKPIs() {
    try {
      // Obtener datos reales de diferentes servicios
      const [enrollmentsResponse, athletesStatsResponse] = await Promise.all([
        EnrollmentsService.getAllForReport(),
        AthletesService.getAthleteStats()
      ]);
      
      let totalAthletes = 0;
      let activeEnrollments = 0;
      let expiredEnrollments = 0;
      let pendingEnrollments = 0;
      
      if (enrollmentsResponse.success && enrollmentsResponse.data) {
        const enrollments = enrollmentsResponse.data;
        totalAthletes = enrollments.length;
        
        enrollments.forEach(enrollment => {
          const estado = enrollment.estadoMatricula || enrollment.estado || enrollment.latestEnrollment?.estado;
          
          if (estado === ENROLLMENT_STATUS.VIGENTE) {
            activeEnrollments++;
          } else if (estado === ENROLLMENT_STATUS.VENCIDA) {
            expiredEnrollments++;
          } else if (estado === ENROLLMENT_STATUS.PENDING_PAYMENT) {
            pendingEnrollments++;
          }
        });
      }
      
      // Intentar obtener eventos reales
      let totalEvents = 0;
      try {
        const eventsResponse = await apiClient.get('/events');
        if (eventsResponse.success && eventsResponse.data) {
          totalEvents = eventsResponse.data.length;
        }
      } catch (eventsError) {
        console.warn('⚠️ No se pudieron obtener datos de eventos');
      }
      
      const kpis = {
        totalAthletes,
        activeEnrollments,
        expiredEnrollments,
        pendingEnrollments,
        totalEvents,
        healthAppointments: 0, // Implementar cuando tengas módulo de salud
        donations: 0 // Implementar cuando tengas módulo de donaciones
      };
      
      // console.log('📊 KPIs reales calculados:', kpis);
      
      return {
        success: true,
        data: kpis
      };
    } catch (error) {
      console.error('❌ Error fetching KPIs:', error);
      
      return {
        success: false,
        error: error.message,
        data: {
          totalAthletes: 0,
          activeEnrollments: 0,
          expiredEnrollments: 0,
          pendingEnrollments: 0,
          totalEvents: 0,
          healthAppointments: 0,
          donations: 0
        }
      };
    }
  }

  /**
   * Obtener datos de jugadoras activas por mes (basado en datos reales)
   */
  async getActivePlayers() {
    try {
      // Obtener deportistas vigentes por categoría
      const categoryResponse = await this.getAthletesByCategory();
      
      if (categoryResponse.success) {
        const categoryStats = categoryResponse.data;
        
        // Generar datos mensuales basados en estadísticas reales
        const data = this.generateActivePlayersData(categoryStats);
        
        return {
          success: true,
          data: data
        };
      }
      
      return {
        success: false,
        error: 'No se pudieron generar datos de jugadoras activas',
        data: []
      };
    } catch (error) {
      console.error('❌ Error fetching active players:', error);
      
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Obtener datos REALES de servicios de salud
   */
  async getHealthServicesData() {
    try {
      // Importar el servicio de citas dinámicamente
      const appointmentService = (await import("../../Services/AppointmentManagement/services/appointmentService.js")).default;
      
      // Obtener todas las citas
      const appointmentsResponse = await appointmentService.getAll({ limit: 1000 });
      
      if (appointmentsResponse.success && appointmentsResponse.data) {
        const appointments = Array.isArray(appointmentsResponse.data) 
          ? appointmentsResponse.data 
          : appointmentsResponse.data.data || [];
        
        // Procesar datos por mes y especialidad
        const monthlyData = this.processHealthServicesByMonth(appointments);
        const yearlyData = this.processHealthServicesByYear(appointments);
        const stats = this.calculateHealthStats(appointments);
        
        return {
          success: true,
          data: {
            monthly: monthlyData,
            yearly: yearlyData,
            stats: stats
          }
        };
      }
      
      // Fallback con datos por defecto
      return {
        success: false,
        error: 'No se pudieron obtener datos de citas',
        data: {
          monthly: this.getDefaultHealthMonthlyData(),
          yearly: this.getDefaultHealthYearlyData(),
          stats: {
            total: 0,
            nutricion: 0,
            fisioterapia: 0,
            psicologia: 0,
            completadas: 0,
            programadas: 0,
            pendientes: 0,
            canceladas: 0
          }
        }
      };
    } catch (error) {
      console.error('❌ Error fetching health services data:', error);
      
      return {
        success: false,
        error: error.message,
        data: {
          monthly: this.getDefaultHealthMonthlyData(),
          yearly: this.getDefaultHealthYearlyData(),
          stats: {
            total: 0,
            nutricion: 0,
            fisioterapia: 0,
            psicologia: 0,
            completadas: 0,
            programadas: 0,
            pendientes: 0,
            canceladas: 0
          }
        }
      };
    }
  }

  /**
   * Procesar citas por mes y especialidad
   */
  processHealthServicesByMonth(appointments) {
    const months = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    
    const currentYear = new Date().getFullYear();
    const monthlyData = [];
    
    // Inicializar datos para cada mes del año actual
    for (let i = 0; i < 12; i++) {
      monthlyData.push({
        mes: months[i],
        nutricion: 0,
        fisioterapia: 0,
        psicologia: 0
      });
    }
    
    // Procesar citas
    appointments.forEach(appointment => {
      const appointmentDate = new Date(appointment.appointmentDate || appointment.fecha || appointment.createdAt);
      
      // Solo procesar citas del año actual
      if (appointmentDate.getFullYear() !== currentYear) return;
      
      const monthIndex = appointmentDate.getMonth();
      const specialty = (appointment.specialty || appointment.especialidad || '').toLowerCase();
      
      if (specialty.includes('nutricion') || specialty.includes('nutri')) {
        monthlyData[monthIndex].nutricion++;
      } else if (specialty.includes('fisio') || specialty.includes('terapia')) {
        monthlyData[monthIndex].fisioterapia++;
      } else if (specialty.includes('psico') || specialty.includes('mental')) {
        monthlyData[monthIndex].psicologia++;
      }
    });
    
    return monthlyData;
  }

  /**
   * Procesar citas por año y especialidad
   */
  processHealthServicesByYear(appointments) {
    const yearlyData = {
      2023: { nutricion: 0, fisioterapia: 0, psicologia: 0 },
      2024: { nutricion: 0, fisioterapia: 0, psicologia: 0 },
      2025: { nutricion: 0, fisioterapia: 0, psicologia: 0 }
    };
    
    appointments.forEach(appointment => {
      const appointmentDate = new Date(appointment.appointmentDate || appointment.fecha || appointment.createdAt);
      const year = appointmentDate.getFullYear();
      
      if (!yearlyData[year]) return;
      
      const specialty = (appointment.specialty || appointment.especialidad || '').toLowerCase();
      
      if (specialty.includes('nutricion') || specialty.includes('nutri')) {
        yearlyData[year].nutricion++;
      } else if (specialty.includes('fisio') || specialty.includes('terapia')) {
        yearlyData[year].fisioterapia++;
      } else if (specialty.includes('psico') || specialty.includes('mental')) {
        yearlyData[year].psicologia++;
      }
    });
    
    return yearlyData;
  }

  /**
   * Calcular estadísticas generales de salud
   */
  calculateHealthStats(appointments) {
    const stats = {
      total: appointments.length,
      nutricion: 0,
      fisioterapia: 0,
      psicologia: 0,
      completadas: 0,
      programadas: 0,
      pendientes: 0,
      canceladas: 0
    };
    
    appointments.forEach(appointment => {
      // Contar por especialidad
      const specialty = (appointment.specialty || appointment.especialidad || '').toLowerCase();
      
      if (specialty.includes('nutricion') || specialty.includes('nutri')) {
        stats.nutricion++;
      } else if (specialty.includes('fisio') || specialty.includes('terapia')) {
        stats.fisioterapia++;
      } else if (specialty.includes('psico') || specialty.includes('mental')) {
        stats.psicologia++;
      }
      
      // Contar por estado
      const status = (appointment.status || appointment.estado || '').toLowerCase();
      
      if (status.includes('completada') || status.includes('completed')) {
        stats.completadas++;
      } else if (status.includes('programada') || status.includes('scheduled')) {
        stats.programadas++;
      } else if (status.includes('pendiente') || status.includes('pending')) {
        stats.pendientes++;
      } else if (status.includes('cancelada') || status.includes('cancelled')) {
        stats.canceladas++;
      }
    });
    
    return stats;
  }

  /**
   * Datos por defecto para servicios de salud mensuales
   */
  getDefaultHealthMonthlyData() {
    return [
      { mes: "Enero", nutricion: 0, fisioterapia: 0, psicologia: 0 },
      { mes: "Febrero", nutricion: 0, fisioterapia: 0, psicologia: 0 },
      { mes: "Marzo", nutricion: 0, fisioterapia: 0, psicologia: 0 },
      { mes: "Abril", nutricion: 0, fisioterapia: 0, psicologia: 0 },
      { mes: "Mayo", nutricion: 0, fisioterapia: 0, psicologia: 0 },
      { mes: "Junio", nutricion: 0, fisioterapia: 0, psicologia: 0 },
      { mes: "Julio", nutricion: 0, fisioterapia: 0, psicologia: 0 },
      { mes: "Agosto", nutricion: 0, fisioterapia: 0, psicologia: 0 },
      { mes: "Septiembre", nutricion: 0, fisioterapia: 0, psicologia: 0 },
      { mes: "Octubre", nutricion: 0, fisioterapia: 0, psicologia: 0 },
      { mes: "Noviembre", nutricion: 0, fisioterapia: 0, psicologia: 0 },
      { mes: "Diciembre", nutricion: 0, fisioterapia: 0, psicologia: 0 }
    ];
  }

  /**
   * Datos por defecto para servicios de salud anuales
   */
  getDefaultHealthYearlyData() {
    return {
      2023: { nutricion: 0, fisioterapia: 0, psicologia: 0 },
      2024: { nutricion: 0, fisioterapia: 0, psicologia: 0 },
      2025: { nutricion: 0, fisioterapia: 0, psicologia: 0 }
    };
  }

  /**
   * Obtener datos REALES de pagos para el dashboard
   * Usa el PaymentsService existente como fallback si el endpoint específico no funciona
   */
  async getPaymentsDashboardData() {
    try {
      console.log('🔍 Obteniendo datos de pagos...');
      
      // MÉTODO 1: Intentar endpoint específico del backend
      try {
        console.log('📊 Intentando endpoint /api/payments/dashboard/stats...');
        const response = await apiClient.get('/payments/dashboard/stats');
        console.log('📊 Respuesta del endpoint dashboard/stats:', response);
        
        if (response && response.success && response.data) {
          const { stats, monthlyData, payments } = response.data;
          
          console.log('✅ Datos del dashboard obtenidos del endpoint específico:', {
            totalPagos: stats.total,
            aprobados: stats.approved,
            pendientes: stats.pending,
            rechazados: stats.rejected,
            esteMes: stats.thisMonth,
            datosMensuales: monthlyData.length
          });
          
          return {
            success: true,
            data: {
              payments: payments || [],
              stats: stats,
              monthlyData: monthlyData || []
            }
          };
        }
      } catch (endpointError) {
        console.warn('⚠️ Endpoint específico no disponible:', endpointError.message);
      }
      
      // MÉTODO 2: Usar PaymentsService como fallback
      console.log('🔄 Usando PaymentsService como fallback...');
      
      // Importar PaymentsService dinámicamente
      const { paymentsService } = await import("../../Athletes/Payments/services/PaymentsService.js");
      
      // Obtener todos los pagos
      const paymentsResponse = await paymentsService.getAllForReport();
      console.log('📊 Respuesta de PaymentsService.getAllForReport():', paymentsResponse);
      
      if (paymentsResponse.success && paymentsResponse.data) {
        const payments = paymentsResponse.data;
        console.log('✅ Procesando', payments.length, 'pagos desde PaymentsService...');
        
        // Calcular estadísticas manualmente
        const stats = this.calculatePaymentStats(payments);
        const monthlyData = this.calculateMonthlyData(payments);
        
        console.log('📊 Estadísticas calculadas:', stats);
        console.log('📊 Datos mensuales calculados:', monthlyData);
        
        return {
          success: true,
          data: {
            payments: payments,
            stats: stats,
            monthlyData: monthlyData
          }
        };
      }
      
      console.warn('⚠️ PaymentsService también falló:', paymentsResponse);
      
      return {
        success: false,
        error: 'No se pudieron obtener datos de pagos',
        data: {
          payments: [],
          stats: {
            total: 0,
            approved: 0,
            pending: 0,
            rejected: 0,
            thisMonth: 0
          },
          monthlyData: []
        }
      };
    } catch (error) {
      console.error('❌ Error obteniendo datos del dashboard de pagos:', error);
      
      return {
        success: false,
        error: error.message,
        data: {
          payments: [],
          stats: {
            total: 0,
            approved: 0,
            pending: 0,
            rejected: 0,
            thisMonth: 0
          },
          monthlyData: []
        }
      };
    }
  }

  /**
   * Calcular estadísticas de pagos manualmente
   */
  calculatePaymentStats(payments) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const stats = {
      total: payments.length,
      approved: 0,
      pending: 0,
      rejected: 0,
      thisMonth: 0
    };
    
    payments.forEach(payment => {
      // Contar por estado
      const status = (payment.status || payment.estado || '').toLowerCase();
      
      if (status.includes('approved') || status.includes('aprobado') || status.includes('completado')) {
        stats.approved++;
      } else if (status.includes('pending') || status.includes('pendiente')) {
        stats.pending++;
      } else if (status.includes('rejected') || status.includes('rechazado')) {
        stats.rejected++;
      }
      
      // Contar pagos de este mes
      const paymentDate = new Date(payment.createdAt || payment.uploadedAt || payment.fecha);
      if (paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear) {
        stats.thisMonth++;
      }
    });
    
    return stats;
  }

  /**
   * Calcular datos mensuales de pagos
   */
  calculateMonthlyData(payments) {
    const currentYear = new Date().getFullYear();
    const monthlyData = [];
    
    // Inicializar datos para cada mes del año actual
    for (let month = 0; month < 12; month++) {
      monthlyData.push({
        month: `${currentYear}-${String(month + 1).padStart(2, '0')}`,
        approved: 0,
        pending: 0,
        rejected: 0,
        total: 0
      });
    }
    
    // Procesar pagos
    payments.forEach(payment => {
      const paymentDate = new Date(payment.createdAt || payment.uploadedAt || payment.fecha);
      
      if (paymentDate.getFullYear() === currentYear) {
        const monthIndex = paymentDate.getMonth();
        const status = (payment.status || payment.estado || '').toLowerCase();
        
        monthlyData[monthIndex].total++;
        
        if (status.includes('approved') || status.includes('aprobado') || status.includes('completado')) {
          monthlyData[monthIndex].approved++;
        } else if (status.includes('pending') || status.includes('pendiente')) {
          monthlyData[monthIndex].pending++;
        } else if (status.includes('rejected') || status.includes('rechazado')) {
          monthlyData[monthIndex].rejected++;
        }
      }
    });
    
    return monthlyData;
  }

  /**
   * Obtener datos REALES de asistencia para el dashboard
   */
  async getAttendanceData() {
    try {
      console.log('🔍 Obteniendo datos de asistencia...');
      
      // Importar el servicio de asistencia dinámicamente
      const assistanceService = (await import("../../Athletes/Assistanceathletes/services/AssistanceathletesService.js")).default;
      
      // Obtener datos de asistencia del último mes
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      
      const attendanceResponse = await assistanceService.getAllForReport({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });
      
      if (attendanceResponse.success && attendanceResponse.data) {
        const attendanceData = attendanceResponse.data;
        console.log('✅ Procesando', attendanceData.length, 'registros de asistencia...');
        
        // Calcular estadísticas de asistencia
        const stats = this.calculateAttendanceStats(attendanceData);
        
        console.log('📊 Estadísticas de asistencia calculadas:', stats);
        
        return {
          success: true,
          data: {
            stats: stats,
            records: attendanceData
          }
        };
      }
      
      console.warn('⚠️ No se pudieron obtener datos de asistencia:', attendanceResponse);
      
      return {
        success: false,
        error: 'No se pudieron obtener datos de asistencia',
        data: {
          stats: {
            totalRecords: 0,
            averageAttendance: 0,
            presentCount: 0,
            absentCount: 0,
            attendanceRate: 0
          },
          records: []
        }
      };
    } catch (error) {
      console.error('❌ Error obteniendo datos de asistencia:', error);
      
      return {
        success: false,
        error: error.message,
        data: {
          stats: {
            totalRecords: 0,
            averageAttendance: 0,
            presentCount: 0,
            absentCount: 0,
            attendanceRate: 0
          },
          records: []
        }
      };
    }
  }

  /**
   * Calcular estadísticas de asistencia
   */
  calculateAttendanceStats(attendanceData) {
    const stats = {
      totalRecords: attendanceData.length,
      presentCount: 0,
      absentCount: 0,
      averageAttendance: 0,
      attendanceRate: 0
    };
    
    attendanceData.forEach(record => {
      if (record.asistencia === true || record.asistencia === 1 || record.asistencia === "true") {
        stats.presentCount++;
      } else {
        stats.absentCount++;
      }
    });
    
    if (stats.totalRecords > 0) {
      stats.attendanceRate = Math.round((stats.presentCount / stats.totalRecords) * 100);
      stats.averageAttendance = stats.attendanceRate;
    }
    
    return stats;
  }
}

export default new DashboardService();