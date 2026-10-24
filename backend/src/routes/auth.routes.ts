import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';

const router = Router();

/** POST /api/auth/register — Create a new user account */
router.post('/register', register);

/** POST /api/auth/login — Authenticate and receive a JWT */
router.post('/login', login);

export default router;
