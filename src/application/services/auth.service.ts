import jwt from 'jsonwebtoken';

export class AuthService {
  private validPasswords: Set<string>;
  private jwtSecret: string;
  private tokenDurationSeconds: number = 7 * 24 * 60 * 60; // 7 días

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'tu-clave-secreta-cambiar-en-produccion';
    
    // Las 3 contraseñas válidas
    this.validPasswords = new Set([
      process.env.PASSWORD_1 || 'password1',
      process.env.PASSWORD_2 || 'password2',
      process.env.PASSWORD_3 || 'password3',
    ]);

    if (!process.env.PASSWORD_1 || !process.env.PASSWORD_2 || !process.env.PASSWORD_3) {
      console.warn('⚠️  Contraseñas por defecto, configura PASSWORD_1, PASSWORD_2, PASSWORD_3 en .env');
    }

    if (this.jwtSecret === 'tu-clave-secreta-cambiar-en-produccion') {
      console.warn('⚠️  JWT_SECRET usando valor por defecto, configúralo en .env');
    }
  }

  /**
   * Genera un JWT si la contraseña es correcta
   */
  generateToken(password: string): string | null {
    if (!this.validPasswords.has(password)) {
      return null;
    }

    const token = jwt.sign(
      { authenticated: true },
      this.jwtSecret,
      { expiresIn: `${this.tokenDurationSeconds}s` }
    );

    console.log(`🔑 JWT generado (válido 7 días)`);
    return token;
  }

  /**
   * Valida un JWT y retorna true si es válido
   */
  validateToken(token: string): boolean {
    try {
      jwt.verify(token, this.jwtSecret);
      return true;
    } catch (error) {
      // Token expirado, inválido, o error de firma
      return false;
    }
  }
}
