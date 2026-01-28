import axios, { AxiosInstance } from 'axios';

export class FinnegansHttp {
  private client: AxiosInstance;

  constructor(baseURL: string, token: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      params: {
        ACCESS_TOKEN: token,
      },
    });
  }

  async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await this.client.get<T>(endpoint);
      return response.data;
    } catch (error) {
      throw new Error(`Error en ${endpoint}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
