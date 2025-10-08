import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
);

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface JWTPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  iat: number;
  exp: number;
  [key: string]: any; // Add index signature for jose compatibility
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static async createToken(user: User): Promise<string> {
    const payload: JWTPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
    };

    return new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);
  }

  static async verifyToken(token: string): Promise<JWTPayload | null> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      return payload as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  static async authenticateUser(
    email: string,
    password: string
  ): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return null;
    }

    const isValidPassword = await this.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name || '',
      role: user.role,
    };
  }

  static async createUser(
    email: string,
    password: string,
    name: string
  ): Promise<User> {
    const hashedPassword = await this.hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER',
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name || '',
      role: user.role,
    };
  }
}
