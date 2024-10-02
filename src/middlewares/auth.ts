import { Request, Response, NextFunction } from 'express';
import { TokenPayload } from '../interfaces/TokenPayload';
import jwt, { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      decodedToken?: TokenPayload;
    }
  }
}

export async function validateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1] ?? ''; 
  const secretKey = process.env.JWT_SECRET;

  if (!token) {
    res.status(401).json({ message: 'Token not provided or invalid' });
    return
  }

  if (!secretKey) {
    res.status(500).json({ message: 'Error on environment JWT Secret Key' });
    return
  }

  try {
    const decodedToken = jwt.verify(token, secretKey) as JwtPayload; 
    const tokenPayload = decodedToken as TokenPayload;

    if (!tokenPayload.exp) {
      res.status(401).json({ message: 'Invalid token. Missing expiration.' });
      return
    }

    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    if (tokenPayload.exp < currentTimeInSeconds) {
      res.status(401).json({ message: 'Expired session. Please login again.' });
      return
    }
  
    req.decodedToken = tokenPayload; 
    next()
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized access. Invalid or missing token.' });
    return
  }
}
