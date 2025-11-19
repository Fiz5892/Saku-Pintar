import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../../lib/neon-client';

const JWT_SECRET = import.meta.env.VITE_JWT_SECRET || 'your-secret-key-change-this';
const JWT_EXPIRES_IN = '7d';

interface SignInData {
  email: string;
  password: string;
}

export const signIn = async (data: SignInData) => {
  try {
    const { email, password } = data;

    // Validasi input
    if (!email || !password) {
      throw new Error('Email dan password harus diisi');
    }

    // Cari user berdasarkan email
    const result = await pool.query(
      'SELECT id, email, password, full_name, avatar_url FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      throw new Error('Email atau password salah');
    }

    const user = result.rows[0];

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Email atau password salah');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Calculate expiration time
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 hari

    // Update last_login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url
      },
      expiresAt
    };

  } catch (error: any) {
    console.error('Signin error:', error);
    throw error;
  }
};