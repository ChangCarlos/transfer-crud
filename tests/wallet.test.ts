import request from 'supertest';
import { app } from '../src/app';
import { createWalletWithBalance, getWalletBalance } from './helpers';

describe('Wallet API', () => {
  describe('POST /wallet', () => {
    it('should create a new wallet', async () => {
      const response = await request(app)
        .post('/wallet')
        .send({ ownerId: 'user-123' })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.ownerId).toBe('user-123');
      expect(response.body.version).toBe(1);
    });

    it('should reject wallet creation without ownerId', async () => {
      await request(app)
        .post('/wallet')
        .send({})
        .expect(400);
    });

    it('should reject wallet creation with short ownerId', async () => {
      await request(app)
        .post('/wallet')
        .send({ ownerId: 'ab' })
        .expect(400);
    });

    it('should reject duplicate ownerId', async () => {
      await request(app)
        .post('/wallet')
        .send({ ownerId: 'user-123' })
        .expect(201);

      await request(app)
        .post('/wallet')
        .send({ ownerId: 'user-123' })
        .expect(409);
    });
  });

  describe('GET /wallet/:id/balance', () => {
    it('should return balance for existing wallet', async () => {
      const wallet = await createWalletWithBalance('user-123', 100);

      const response = await request(app)
        .get(`/wallet/${wallet.id}/balance`)
        .expect(200);

      expect(response.body.balance).toBe(100);
    });

    it('should return 0 balance for new wallet', async () => {
      const wallet = await createWalletWithBalance('user-456', 0);

      const response = await request(app)
        .get(`/wallet/${wallet.id}/balance`)
        .expect(200);

      expect(response.body.balance).toBe(0);
    });

    it('should return 404 for non-existent wallet', async () => {
      await request(app)
        .get('/wallet/invalid-id/balance')
        .expect(404);
    });

    it('should return 400 for empty wallet ID', async () => {
      await request(app)
        .get('/wallet/  /balance')
        .expect(400);
    });

    it('should calculate balance correctly with multiple transactions', async () => {
      const wallet = await createWalletWithBalance('user-789', 100);
      const balance = await getWalletBalance(wallet.id);

      expect(balance).toBe(100);
    });
  });
});
