import { Request, Response, NextFunction } from 'express';
import WalletModel from '../models/Wallet';

export default async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'];
    const user = await WalletModel.findOne({ apiKey });
    if (!user) throw new Error('fail to auth');
    res.locals.user = user;
    next();
  } catch (error) {
    res.status(401).end();
  }
};
