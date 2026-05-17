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
import activityRoutes from './modules/activities/activities.routes';
import calendarRoutes from './modules/calendar/calendar.routes';
import reportRoutes from './modules/reports/reports.routes';
import billingRoutes from './modules/billing/billing.routes';
import { tierRateLimiter } from './shared/middleware/rateLimiter';

const app = express();

app.use(corsMiddleware);
// Webhook route needs raw body — must be registered before express.json()
app.use('/api/v1/billing/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use('/api/v1', tierRateLimiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tenant', tenantRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/contacts', contactRoutes);
app.use('/api/v1/pipelines', pipelineRoutes);
app.use('/api/v1/deals', dealRoutes);
app.use('/api/v1/activities', activityRoutes);
app.use('/api/v1/calendar/events', calendarRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/billing', billingRoutes);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`[server] Running on http://localhost:${env.PORT}`);
});

export default app;
