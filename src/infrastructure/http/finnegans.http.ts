import axios, { AxiosInstance } from 'axios';

export class FinnegansHttp {
  private client: AxiosInstance;
  private token: string | null = null;
  private tokenExpiry: number | null = null;
  private clientId: string;
  private clientSecret: string;
  private isRefreshingToken: boolean = false;
  private tokenRefreshPromise: Promise<void> | null = null;
  private retryCount: number = 0;
  private maxRetries: number = 3;

  constructor(baseURL: string, clientId: string, clientSecret: string, initialToken?: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
    });

    this.clientId = clientId;
    this.clientSecret = clientSecret;
    if (initialToken) this.token = initialToken;
  }

  private async fetchToken(): Promise<void> {
    // Evitar múltiples solicitudes simultáneas de token
    if (this.isRefreshingToken && this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    if (!this.clientId || !this.clientSecret) {
      throw new Error('❌ FINNEGANS_CLIENT_ID o FINNEGANS_CLIENT_SECRET no configurados');
    }

    this.isRefreshingToken = true;
    this.tokenRefreshPromise = this._fetchTokenInternal();

    try {
      await this.tokenRefreshPromise;
    } finally {
      this.isRefreshingToken = false;
      this.tokenRefreshPromise = null;
    }
  }

  private async _fetchTokenInternal(): Promise<void> {
    const url = `https://api.teamplace.finneg.com/api/oauth/token?grant_type=client_credentials&client_id=${this.clientId}&client_secret=${this.clientSecret}`;

    try {
      console.log('📄 Solicitando nuevo token de Finnegans...');
      
      // ✅ Usar fetch con response.text() como funcionaba antes
      const response = await fetch(url, { method: 'GET' });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // ✅ El token viene como string puro
      const tokenString = await response.text();
      const trimmedToken = tokenString.trim();

      if (!trimmedToken) {
        throw new Error('Token vacío recibido de la API');
      }

      this.token = trimmedToken;
      const expiresIn = 60 * 50; // fallback 50 minutos
      this.tokenExpiry = Date.now() + (expiresIn * 1000) - 60000; // renovar 1 min antes
      
      console.log(`✅ Token obtenido exitosamente (expira en ~${expiresIn / 60} min)`);
      console.log(`🔑 Token: ${this.token.substring(0, 20)}...`);
      this.retryCount = 0;

    } catch (error) {
      console.error('❌ Error obteniendo token:', error instanceof Error ? error.message : error);

      // Reintentar si no hemos alcanzado el máximo
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        const waitTime = 2000 * this.retryCount; // backoff exponencial
        console.log(`📡 Reintentando en ${waitTime}ms... (${this.retryCount}/${this.maxRetries})`);
        await new Promise(r => setTimeout(r, waitTime));
        return this._fetchTokenInternal();
      }

      throw new Error(`Token fetch failed after ${this.maxRetries} retries: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async ensureToken(): Promise<void> {
    if (!this.token) {
      await this.fetchToken();
      return;
    }

    if (this.tokenExpiry && Date.now() >= this.tokenExpiry) {
      console.log('⏱️ Token expirado, renovando...');
      await this.fetchToken();
    }
  }

  async get<T>(endpoint: string, additionalParams?: Record<string, any>): Promise<T> {
    let lastError: Error | null = null;

    // Intentar hasta maxRetries veces
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        await this.ensureToken();

        if (!this.token) {
          throw new Error('No token disponible después de intentar obtenerlo');
        }

        const params: Record<string, any> = {
          ACCESS_TOKEN: this.token,
          ...additionalParams, // Agregar parámetros adicionales como fechas
        };

        console.log(`📡 GET ${endpoint} (intento ${attempt}/${this.maxRetries})`);
        const response = await this.client.get<T>(endpoint, { params });
        return response.data;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const errorMsg = lastError.message;
        console.error(`❌ Intento ${attempt} falló: ${errorMsg}`);

        // Si es error 401 (Unauthorized), invalidar token y reintentar
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          console.log('📡 Token inválido (401), invalidando y reintentando...');
          this.token = null;
          this.tokenExpiry = null;
          this.retryCount = 0;

          // Si aún hay reintentos, continuar con el loop
          if (attempt < this.maxRetries) {
            await new Promise(r => setTimeout(r, 1000)); // pequeña espera antes de reintentar
            continue;
          }
        }

        // Para otros errores, si es el último intento, romper
        if (attempt === this.maxRetries) {
          break;
        }

        // Pequeña espera antes de reintentar
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    throw new Error(`Error en ${endpoint} después de ${this.maxRetries} intentos: ${lastError?.message || 'Unknown error'}`);
  }
}