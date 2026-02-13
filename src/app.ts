import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { walletController } from './modules/wallet/wallet.controller'
import { TransferController } from './modules/transfer/transfer.controller'
import { errorHandler } from './shared/middlewares/error-handler'
import { asyncHandler } from './shared/middlewares/async-handler'


export const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/wallet', asyncHandler(walletController.create))
app.get('/wallet/:id/balance', asyncHandler(walletController.getBalance))

app.post('/transfer', asyncHandler(TransferController.execute))

app.use(errorHandler)