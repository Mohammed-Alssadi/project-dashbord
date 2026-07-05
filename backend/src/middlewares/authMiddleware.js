import jwt from 'jsonwebtoken';
import { User, StoreToken } from '../models/index.js';

export const protect = async (req, res, next) => {
  let token;

  // Check cookies first
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // Then check Authorization header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    // JWT_SECRET مضمون الوجود — server.js يوقف التشغيل إذا كان غائباً
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name !== 'JsonWebTokenError' && error.name !== 'TokenExpiredError') {
      console.error('Auth middleware error:', error);
    }
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};


/**
 * ميدل وير لجلب توكن المتجر المرتبط للمستخدم الحالي
 */
export const extractShopToken = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User is not authenticated' });
    }

    const tokenRecord = await StoreToken.findOne({
      where: { userId: req.user.id }
    });

    if (!tokenRecord) {
      return res.status(404).json({ success: false, message: 'No store linked to this account or link has expired' });
    }

    // تمرير التوكن للمتحكم لاستخدامه
    req.shopToken = tokenRecord.accessToken;
    next();
  } catch (error) {
    console.error('Error in extractShopToken middleware:', error);
    return res.status(500).json({ success: false, message: 'Error occurred while fetching store token' });
  }
};

