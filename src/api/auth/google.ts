import jwt from 'jsonwebtoken';
import { pool } from '../../lib/neon-client';
import { OAuth2Client } from 'google-auth-library';

const JWT_SECRET = import.meta.env.VITE_JWT_SECRET || 'your-secret-key-change-this';
const JWT_EXPIRES_IN = '7d';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

interface GoogleAuthData {
  credential: string;
}

export const googleAuth = async (data: GoogleAuthData) => {
  try {
    const { credential } = data;

    if (!credential) {
      throw new Error('Google credential tidak valid');
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    if (!payload || !payload.email) {
      throw new Error('Data Google tidak valid');
    }

    const { email, name, picture, sub: googleId } = payload;

    // Cek apakah user sudah ada
    let result = await pool.query(
      'SELECT id, email, full_name, avatar_url FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    let user;

    if (result.rows.length === 0) {
      // User baru, buat account
      result = await pool.query(
        `INSERT INTO users (email, full_name, avatar_url, google_id, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, NOW(), NOW()) 
         RETURNING id, email, full_name, avatar_url`,
        [email.toLowerCase(), name || null, picture || null, googleId]
      );
      user = result.rows[0];
    } else {
      // User sudah ada, update google_id dan avatar jika belum ada
      user = result.rows[0];
      await pool.query(
        `UPDATE users 
         SET google_id = COALESCE(google_id, $1),
             avatar_url = COALESCE(avatar_url, $2),
             last_login = NOW(),
             updated_at = NOW()
         WHERE id = $3`,
        [googleId, picture, user.id]
      );
      
      // Update user object dengan data terbaru
      user.avatar_url = user.avatar_url || picture;
    }

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
    console.error('Google auth error:', error);
    throw error;
  }
};