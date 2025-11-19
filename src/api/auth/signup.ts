import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../../lib/neon-client';

const JWT_SECRET = import.meta.env.VITE_JWT_SECRET || 'your-secret-key-change-this';
const JWT_EXPIRES_IN = '7d';

interface SignUpData {
  email: string;
  password: string;
  full_name?: string;
}

export const signUp = async (data: SignUpData) => {
  try {
    const { email, password, full_name } = data;

    // Validasi input
    if (!email || !password) {
      throw new Error('Email dan password harus diisi');
    }

    if (password.length < 6) {
      throw new Error('Password minimal 6 karakter');
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('Email sudah terdaftar');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user baru
    const result = await pool.query(
      `INSERT INTO users (email, password, full_name, created_at, updated_at) 
       VALUES ($1, $2, $3, NOW(), NOW()) 
       RETURNING id, email, full_name, avatar_url`,
      [email.toLowerCase(), hashedPassword, full_name || null]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Calculate expiration time
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 hari

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
    console.error('Signup error:', error);
    throw error;
  }
};