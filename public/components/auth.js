/**
 * auth.js - Gestión de autenticación en localStorage
 * Uso simple:
 *   await Auth.login('password')
 *   const data = await Auth.fetch('/facturas/dashboardGeneral')
 */

class Auth {
  static TOKEN_KEY = 'dashboard_token';
  static TOKEN_EXPIRY_KEY = 'dashboard_token_expiry';

  /**
   * Intenta hacer login con contraseña
   */
  static async login(password) {
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Login fallido');
      }

      // Guardar token en localStorage (válido 7 días)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);

      localStorage.setItem(this.TOKEN_KEY, data.token);
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryDate.toISOString());

      console.log('✅ Login exitoso');
      return true;
    } catch (error) {
      console.error('❌ Login fallido:', error.message);
      throw error;
    }
  }

  /**
   * Obtiene el token guardado (si existe y no expiró)
   */
  static getToken() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);

    if (!token) return null;

    // Si expiró, limpiar y retornar null
    if (expiry && new Date(expiry) < new Date()) {
      this.logout();
      return null;
    }

    return token;
  }

  /**
   * Logout: borra el token de localStorage
   */
  static logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    console.log('Sesion cerrada');
  }

  /**
   * Hace fetch() incluyendo el token automáticamente
   * Si el token expiró o no existe, lanza error 401
   */
  static async fetch(endpoint, options = {}) {
    const token = this.getToken();

    if (!token) {
      throw new Error('AUTH_REQUIRED');
    }

    const headers = {
      ...options.headers,
      'x-auth-token': token,
    };

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    // Si retorna 401, el token expiró
    if (response.status === 401) {
      this.logout();
      throw new Error('AUTH_REQUIRED');
    }

    return response;
  }

  /**
   * Verifica si hay sesión activa
   */
  static isAuthenticated() {
    return !!this.getToken(); // (!!) un string es un valor truthy
  }
}
