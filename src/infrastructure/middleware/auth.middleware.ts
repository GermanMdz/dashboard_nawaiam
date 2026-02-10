import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../application/services/auth.service';

/**
 * Middleware que valida el token en el header x-auth-token
 */
export function requireAuth(authService: AuthService) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['x-auth-token'] as string;

    if (!token || !authService.validateToken(token)) {
      // Devolver 401 para que el frontend sepa que necesita reautenticarse
      return res.status(401).json({
        success: false,
        error: 'Token requerido o expirado',
      });
    }

    // Token válido, continuar
    next();
  };
}
