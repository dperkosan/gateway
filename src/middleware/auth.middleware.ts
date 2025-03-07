import jwt from 'jsonwebtoken';
import jwtConfig from '@common/config/jwt.config';
import { NextFunction, Response, Request } from 'express';
import { UnauthorizedError } from '@common/errors/http-status.error';
import logger from '@common/log/app.log';

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Unauthorized - Missing token');
  }

  const token = authHeader.split(' ')[1];

  try {
    jwt.verify(token, jwtConfig.secret, {
      audience: jwtConfig.audience,
      issuer: jwtConfig.issuer,
    });

    next();
  } catch (error) {
    logger.warn('Token verification failed', {
      error: error instanceof Error ? error.message : String(error),
      maskedToken: token.substring(0, 10) + '...',
      ip: req.ip,
      url: req.originalUrl,
    });

    throw new UnauthorizedError('Unauthorized - Invalid token');
  }
};
