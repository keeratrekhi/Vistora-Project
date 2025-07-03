// routes/ping.route.ts
import { Router, Request, Response } from 'express';
const router = Router();

// A 204 No Content response is the smallest possible HTTP response
router.get('/', (_req: Request, res: Response) => {
  res.sendStatus(204);
});

export default router;
