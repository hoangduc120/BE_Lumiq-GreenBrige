const express = require("express");
const router = express.Router();
const { authMiddleware, restrictTo } = require("../middlewares/authMiddleware");
const passport = require('../configs/passport.config');

const authController = require("../controllers/auth.controller");
const { generateToken } = require("../middlewares/jwt");
const { OK } = require("../configs/response.config");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/logout", authMiddleware, authController.logout);
router.post("/refresh-token", authController.refreshToken);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), async (req, res) => {
  const user = req.user;

  const accessToken = await generateToken(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    '20s'
  );
  const refreshToken = await generateToken(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    '7d'
  );

  user.refreshToken = refreshToken;
  await user.save();

  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: true,         // Render luôn chạy HTTPS
    sameSite: 'none',     // Bắt buộc để cross-site cookie
    maxAge: 20 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  

  return res.redirect(`http://localhost:5173?accessToken=${accessToken}`);
});

module.exports = router;
