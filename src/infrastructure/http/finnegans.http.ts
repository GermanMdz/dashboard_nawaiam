import axios, { AxiosInstance } from 'axios';

export class FinnegansHttp {
  private client: AxiosInstance;
  private token: string | null = null;
  private tokenExpiry: number | null = null;
  private clientId: string;
  private clientSecret: string;

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
    if (!this.clientId || !this.clientSecret) return;

    const url = `https://api.teamplace.finneg.com/api/oauth/token?grant_type=client_credentials&client_id=${this.clientId}&client_secret=${this.clientSecret}`;
    try {
      const resp = await axios.get(url, { timeout: 10000 });
      let data: any = resp.data;

      if (typeof data === 'string') {
        // Intentar parsear JSON; si falla, puede ser que la API devuelva solo el token como string
        try {
          data = JSON.parse(data);
        } catch {
          const tokenStr = data.trim();
          if (tokenStr) {
            this.token = tokenStr;
            const expiresIn = 60 * 50; // fallback 50 min
            this.tokenExpiry = Date.now() + (expiresIn * 1000) - 60000; // renovar 1 min antes
            console.info('Finnegans: token recibido como string, usando fallback de expiración');
            return;
          }
        }
      }

      if (data && data.access_token) {
        this.token = data.access_token;
        const expiresIn = Number(data.expires_in) || (60 * 50); // fallback 50 min
        this.tokenExpiry = Date.now() + (expiresIn * 1000) - 60000; // renovar 1 min antes
      }
    } catch (error) {
      // No romper si falla; se puede usar token inicial si existe
      console.error('Error obteniendo token Finnegans:', error instanceof Error ? error.message : error);
    }
  }

  private async ensureToken(): Promise<void> {
    if (!this.token) {
      await this.fetchToken();
      return;
    }

    if (this.tokenExpiry && Date.now() >= this.tokenExpiry) {
      await this.fetchToken();
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    try {
      await this.ensureToken();

      const params: Record<string, any> = {};
      if (this.token) params.ACCESS_TOKEN = this.token;

      const response = await this.client.get<T>(endpoint, { params });
      return response.data;
    } catch (error) {
      throw new Error(`Error en ${endpoint}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
