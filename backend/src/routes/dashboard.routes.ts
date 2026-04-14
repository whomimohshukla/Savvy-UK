// dashboard.routes.ts
import { Router as R } from 'express';
import { getDashboard, getSavings, markSavingClaimed } from '../controllers/dashboard/dashboard.controller';
import { authenticate } from '../middleware/authenticate';
const dashRouter = R();
dashRouter.use(authenticate);
dashRouter.get('/', getDashboard);
dashRouter.get('/savings', getSavings);
dashRouter.patch('/savings/:id/claimed', markSavingClaimed);
export default dashRouter;
