import apiClient from '../../../shared/services/apiClient';

class AuthService {
  /**
   * Solicitar recuperación de contraseña
   */
  async forgotPassword(email) {
    return await apiClient.post('/auth/forgot-password', { email });
  }

  /**
   * Verificar código de recuperación
   */
  async verifyResetToken(token) {
    return await apiClient.post('/auth/verify-reset-token', { token });
  }

  /**
   * Restablecer contraseña
   */
  async resetPassword(token, newPassword) {
    return await apiClient.post('/auth/reset-password', { token, newPassword });
  }
}

export default new AuthService();

