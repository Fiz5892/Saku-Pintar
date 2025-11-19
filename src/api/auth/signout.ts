import { Request, Response } from 'express';

export const signout = async (req: Request, res: Response) => {
  try {
    // Dalam implementasi JWT stateless, signout dilakukan di client side
    // dengan menghapus token dari localStorage
    
    // Jika menggunakan refresh token atau session, 
    // Anda bisa menambahkan logika untuk invalidate token di sini
    
    // Optional: Log signout activity
    // const userId = req.user?.userId; // dari auth middleware
    // if (userId) {
    //   await db.query('INSERT INTO user_activity_logs (user_id, action) VALUES ($1, $2)', [userId, 'signout']);
    // }

    return res.status(200).json({
      message: 'Logout berhasil'
    });

  } catch (error) {
    console.error('Signout error:', error);
    return res.status(500).json({
      message: 'Terjadi kesalahan saat logout'
    });
  }
};