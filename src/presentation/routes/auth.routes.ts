import { Router, Request, Response } from 'express';
import { AuthService } from '../../application/services/auth.service';

export function createAuthRoutes(authService: AuthService): Router {
  const router = Router();

  /**
   * POST /auth/login
   * Body: { password: string }
   * Response: { success: true, token: string }
   */
  router.post('/login', (req: Request, res: Response) => {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere contraseña',
      });
    }

    const token = authService.generateToken(password);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Contraseña incorrecta',
      });
    }

    res.json({
      success: true,
      token,
    });
  });

  return router;
}

