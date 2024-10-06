import serverless from '@vendia/serverless-express';
import app from './app';

export const handler = serverless(app);

