import { createMiddleware } from 'hono/factory';
import { verifyToken } from '../services/auth.service.js';

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  try {
    const token = authHeader.slice(7);
    const payload = await verifyToken(token);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    c.set('jwtUser' as any, payload);
    await next();
  } catch {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
});
