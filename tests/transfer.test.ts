import request from 'supertest';
import { app } from '../src/app';
import { createWalletWithBalance, getWalletBalance } from './helpers';
import { randomUUID } from 'crypto';

describe('Transfer API', () => {
  describe('POST /transfer', () => {
    it('should successfully transfer funds between wallets', async () => {

      const walletA = await createWalletWithBalance('user-A', 1000);
      const walletB = await createWalletWithBalance('user-B', 500);

      const idempotencyKey = randomUUID();
      const response = await request(app)
        .post('/transfer')
        .set('Idempotency-Key', idempotencyKey)
        .send({
          fromWalletId: walletA.id,
          toWalletId: walletB.id,
          amount: 300,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.transactionId).toBeDefined();

      const balanceA = await getWalletBalance(walletA.id);
      const balanceB = await getWalletBalance(walletB.id);

      expect(balanceA).toBe(700);
      expect(balanceB).toBe(800);
    });

    it('should reject transfer without idempotency key', async () => {
      const walletA = await createWalletWithBalance('user-A', 1000);
      const walletB = await createWalletWithBalance('user-B', 500);

      await request(app)
        .post('/transfer')
        .send({
          fromWalletId: walletA.id,
          toWalletId: walletB.id,
          amount: 100,
        })
        .expect(400);
    });

    it('should reject transfer with invalid UUID format', async () => {
      const walletA = await createWalletWithBalance('user-A', 1000);
      const walletB = await createWalletWithBalance('user-B', 500);

      await request(app)
        .post('/transfer')
        .set('Idempotency-Key', 'not-a-valid-uuid')
        .send({
          fromWalletId: walletA.id,
          toWalletId: walletB.id,
          amount: 100,
        })
        .expect(400);
    });

    it('should prevent duplicate transfer with same idempotency key', async () => {
      const walletA = await createWalletWithBalance('user-A', 1000);
      const walletB = await createWalletWithBalance('user-B', 500);
      const idempotencyKey = randomUUID();

      const response1 = await request(app)
        .post('/transfer')
        .set('Idempotency-Key', idempotencyKey)
        .send({
          fromWalletId: walletA.id,
          toWalletId: walletB.id,
          amount: 300,
        })
        .expect(200);

      const response2 = await request(app)
        .post('/transfer')
        .set('Idempotency-Key', idempotencyKey)
        .send({
          fromWalletId: walletA.id,
          toWalletId: walletB.id,
          amount: 300,
        })
        .expect(200);

      expect(response2.body.transactionId).toBe(response1.body.transactionId);

      const balanceA = await getWalletBalance(walletA.id);
      const balanceB = await getWalletBalance(walletB.id);

      expect(balanceA).toBe(700); 
      expect(balanceB).toBe(800); 
    });

    it('should reject transfer with insufficient funds', async () => {
      const walletA = await createWalletWithBalance('user-A', 100);
      const walletB = await createWalletWithBalance('user-B', 0);

      await request(app)
        .post('/transfer')
        .set('Idempotency-Key', randomUUID())
        .send({
          fromWalletId: walletA.id,
          toWalletId: walletB.id,
          amount: 200, 
        })
        .expect(409);

      expect(await getWalletBalance(walletA.id)).toBe(100);
      expect(await getWalletBalance(walletB.id)).toBe(0);
    });

    it('should reject transfer to non-existent wallet', async () => {
      const walletA = await createWalletWithBalance('user-A', 1000);

      await request(app)
        .post('/transfer')
        .set('Idempotency-Key', randomUUID())
        .send({
          fromWalletId: walletA.id,
          toWalletId: 'invalid-wallet-id',
          amount: 100,
        })
        .expect(404);
    });

    it('should reject transfer from non-existent wallet', async () => {
      const walletB = await createWalletWithBalance('user-B', 0);

      await request(app)
        .post('/transfer')
        .set('Idempotency-Key', randomUUID())
        .send({
          fromWalletId: 'invalid-wallet-id',
          toWalletId: walletB.id,
          amount: 100,
        })
        .expect(404);
    });

    it('should handle multiple sequential transfers correctly', async () => {
      const walletA = await createWalletWithBalance('user-A', 1000);
      const walletB = await createWalletWithBalance('user-B', 500);
      const walletC = await createWalletWithBalance('user-C', 0);

      await request(app)
        .post('/transfer')
        .set('Idempotency-Key', randomUUID())
        .send({
          fromWalletId: walletA.id,
          toWalletId: walletB.id,
          amount: 200,
        })
        .expect(200);

      await request(app)
        .post('/transfer')
        .set('Idempotency-Key', randomUUID())
        .send({
          fromWalletId: walletB.id,
          toWalletId: walletC.id,
          amount: 300,
        })
        .expect(200);

      await request(app)
        .post('/transfer')
        .set('Idempotency-Key', randomUUID())
        .send({
          fromWalletId: walletA.id,
          toWalletId: walletC.id,
          amount: 100,
        })
        .expect(200);

      expect(await getWalletBalance(walletA.id)).toBe(700); 
      expect(await getWalletBalance(walletB.id)).toBe(400); 
      expect(await getWalletBalance(walletC.id)).toBe(400); 
    });

    it('should maintain double-entry bookkeeping integrity', async () => {
      const walletA = await createWalletWithBalance('user-A', 1000);
      const walletB = await createWalletWithBalance('user-B', 500);

      const response = await request(app)
        .post('/transfer')
        .set('Idempotency-Key', randomUUID())
        .send({
          fromWalletId: walletA.id,
          toWalletId: walletB.id,
          amount: 250,
        })
        .expect(200);

      const transactionId = response.body.transactionId;

      const { prisma } = require('../src/shared/database/prisma');
      const entries = await prisma.ledgerEntry.findMany({
        where: { transactionId },
      });

      expect(entries).toHaveLength(2);
      
      const debit = entries.find((e: any) => e.amount < 0);
      const credit = entries.find((e: any) => e.amount > 0);

      expect(debit.walletId).toBe(walletA.id);
      expect(Number(debit.amount)).toBe(-250);
      expect(credit.walletId).toBe(walletB.id);
      expect(Number(credit.amount)).toBe(250);
    });

    it('should handle transfer to self wallet (edge case)', async () => {
      const wallet = await createWalletWithBalance('user-A', 1000);

      await request(app)
        .post('/transfer')
        .set('Idempotency-Key', randomUUID())
        .send({
          fromWalletId: wallet.id,
          toWalletId: wallet.id,
          amount: 100,
        })
        .expect(409);

      expect(await getWalletBalance(wallet.id)).toBe(1000);
    });
  });

  describe('Concurrent Transfer Scenarios', () => {
    it('should handle concurrent transfers from same wallet', async () => {
      const walletA = await createWalletWithBalance('user-A', 1000);
      const walletB = await createWalletWithBalance('user-B', 0);
      const walletC = await createWalletWithBalance('user-C', 0);

      const [result1, result2] = await Promise.allSettled([
        request(app)
          .post('/transfer')
          .set('Idempotency-Key', randomUUID())
          .send({
            fromWalletId: walletA.id,
            toWalletId: walletB.id,
            amount: 600,
          }),
        request(app)
          .post('/transfer')
          .set('Idempotency-Key', randomUUID())
          .send({
            fromWalletId: walletA.id,
            toWalletId: walletC.id,
            amount: 600,
          }),
      ]);

      const successes = [result1, result2].filter(r => r.status === 'fulfilled' && (r.value as any).status === 200);
      const failures = [result1, result2].filter(r => r.status === 'fulfilled' && (r.value as any).status === 409);

      expect(successes.length).toBe(1);
      expect(failures.length).toBe(1);

      const balanceA = await getWalletBalance(walletA.id);
      expect(balanceA).toBe(400); 
    });
  });
});

