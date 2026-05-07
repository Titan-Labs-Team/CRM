import './config/env';
import express from 'express';
import { corsMiddleware } from './config/cors';
import { errorHandler } from './shared/middleware/errorHandler';
import { env } from './config/env';

import authRoutes from './modules/auth/auth.routes';
import tenantRoutes from './modules/tenants/tenants.routes';
import userRoutes from './modules/users/users.routes';
import contactRoutes from './modules/contacts/contacts.routes';
import pipelineRoutes from './modules/pipeline/pipeline.routes';
import dealRoutes from './modules/deals/deals.routes';

const app = express();

app.use(corsMiddleware);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tenant', tenantRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/contacts', contactRoutes);
app.use('/api/v1/pipelines', pipelineRoutes);
app.use('/api/v1/deals', dealRoutes);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`[server] Running on http://localhost:${env.PORT}`);
});

export default app;
