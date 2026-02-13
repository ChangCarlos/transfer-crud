import request from 'supertest';
import { app } from '../src/app';
import express from 'express';

describe('App', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('Error handling', () => {
    it('should handle unexpected errors with 500', async () => {
      const testApp = express();
      testApp.use(express.json());
      
      testApp.get('/test-error', () => {
        throw new Error('Unexpected test error');
      });
      
      const { errorHandler } = require('../src/shared/middlewares/error-handler');
      testApp.use(errorHandler);

      const response = await request(testApp)
        .get('/test-error')
        .expect(500);

      expect(response.body.message).toBe('Internal Server Error');
    });

    it('should handle unknown Prisma error codes', async () => {
      const testApp = express();
      testApp.use(express.json());
      
      testApp.get('/test-prisma-error', () => {
        const err: any = new Error('Prisma error');
        err.code = 'P9999';
        throw err;
      });
      
      const { errorHandler } = require('../src/shared/middlewares/error-handler');
      testApp.use(errorHandler);

      const response = await request(testApp)
        .get('/test-prisma-error')
        .expect(500);

      expect(response.body.message).toBe('Internal Server Error');
    });
  });
});
