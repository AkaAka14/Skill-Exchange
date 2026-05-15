import { Router } from 'express';
import healthCheck from './health-check.js';
import integratedAiRouter from './integrated-ai.js';
import skillsRouter from './skills.js';
import matchesRouter from './matches.js';

const router = Router();

export default () => {
    router.get('/health', healthCheck);
    router.use('/integrated-ai', integratedAiRouter);
    router.use('/skills', skillsRouter);
    router.use('/matches', matchesRouter);

    return router;
};