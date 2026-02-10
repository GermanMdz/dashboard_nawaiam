import jwt from 'jsonwebtoken';

export class AuthService {
  private validPasswords: Set<string>;
  private jwtSecret: string;
  private tokenDurationSeconds: number = 7 * 24 * 60 * 60; // 7 días

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET!;
    
    // Las 3 contraseñas válidas
    this.validPasswords = new Set([
      process.env.PASSWORD_1!,
      process.env.PASSWORD_2!,
      process.env.PASSWORD_3!,
    ]);

    if (!process.env.PASSWORD_1 || !process.env.PASSWORD_2 || !process.env.PASSWORD_3) {
      console.warn('configura PASSWORD_1, PASSWORD_2, PASSWORD_3 en .env');
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
