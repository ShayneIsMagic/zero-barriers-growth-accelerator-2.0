import { createTRPCRouter } from '../trpc';
import { analysisRouter } from './analysis';

export const appRouter = createTRPCRouter({
  analysis: analysisRouter,
});

export type AppRouter = typeof appRouter;
