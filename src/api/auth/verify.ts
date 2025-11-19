import jwt from 'jsonwebtoken';

const JWT_SECRET = import.meta.env.VITE_JWT_SECRET || 'your-secret-key-change-this';

interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export const verifyToken = (token: string) => {
  try {
    if (!token) {
      return {
        valid: false,
        message: 'Token tidak ditemukan'
      };
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      
      return {
        valid: true,
        userId: decoded.userId,
        email: decoded.email
      };
    } catch (error) {
      return {
        valid: false,
        message: 'Token tidak valid atau expired'
      };
    }

  } catch (error) {
    console.error('Verify error:', error);
    return {
      valid: false,
      message: 'Terjadi kesalahan saat verifikasi token'
    };
  }
};