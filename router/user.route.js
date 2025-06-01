const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authMiddleware, restrictTo } = require("../middlewares/authMiddleware");
const GardenerProfile = require("../schema/gardenerProfile.model");
const sendEmail = require("../utils/sendMail");

router.get(
  "/all",
  authMiddleware,
  restrictTo("admin"),
  userController.getAllUser
);
router.get("/profile/me", authMiddleware, userController.profile);
router.put("/update-profile", authMiddleware, userController.updateInfo);
router.put("/change-password", authMiddleware, userController.changePassword);
router.get("/profile", authMiddleware, userController.getProfile);
router.put("/profile", authMiddleware, userController.updateProfile);

router.put("/avatar", authMiddleware, userController.updateAvatar);

router.get("/:id", authMiddleware, userController.getUserById);


router.post('/gardener/apply', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const existing = await GardenerProfile.findOne({ user: userId });
    if (existing) {
      return res.status(400).json({ error: 'You have already submitted an application.' });
    }

    const {
      bankAccountNumber,
      bankName,
      nationalId,
      placeAddress,
      phoneNumber,
      gardenPhotos,
      cccdPhotos,
    } = req.body;

    if (!gardenPhotos || !Array.isArray(gardenPhotos) || gardenPhotos.length === 0) {
      return res.status(400).json({ error: 'Garden photos are required.' });
    }
    if (!cccdPhotos || !Array.isArray(cccdPhotos) || cccdPhotos.length === 0) {
      return res.status(400).json({ error: 'CCCD photos are required.' });
    }

    const profile = new GardenerProfile({
      user: userId,
      gardenPhoto: gardenPhotos,
      nationalIdPhoto: cccdPhotos,
      bankAccountNumber,
      bankName,
      nationalId,
      placeAddress,
      phoneNumber,
    });

    await profile.save();

    res.status(201).json({ message: 'Application submitted successfully.', data: profile });
  } catch (err) {
    console.error('Error submitting gardener application:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/gardener/apply', authMiddleware, restrictTo("admin"), async (req, res) => {
  try {

    const profile = await GardenerProfile.find()
      .populate('user', 'name email');

    if (!profile) {
      return res.status(404).json({ error: 'Gardener profile not found.' });
    }

    res.status(200).json({ data: profile });
  } catch (err) {
    console.error('Error fetching gardener profile:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/gardener/apply/:id/approve', authMiddleware, restrictTo("admin"), async (req, res) => {
  try {
    const profile = await GardenerProfile.findById(req.params.id).populate('user');
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    profile.status = 'approved';
    profile.role = 'gardener';
    profile.reviewedAt = new Date();
    profile.reviewedBy = req.user.id;
    await profile.save();

    await sendEmail({
      to: profile.user.email,
      subject: 'Your Gardener Application Has Been Approved!',
      html: `
        <h3>Congratulations!</h3>
        <p>Your application to become a gardener on GreenBridge has been approved.</p>
        <p>You can now access your gardener dashboard and start selling.</p>
      `
    });

    res.json({ message: 'Profile approved', data: profile });
  } catch (err) {
    console.error('Approval error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject
router.patch('/gardener/apply/:id/reject', authMiddleware, restrictTo("admin"), async (req, res) => {
  try {
    const { reason } = req.body;
    const profile = await GardenerProfile.findById(req.params.id).populate('user');
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    profile.status = 'rejected';
    profile.rejectionReason = reason;
    profile.reviewedAt = new Date();
    profile.reviewedBy = req.user.id;
    await profile.save();

    await sendEmail({
      to: profile.user.email,
      subject: 'Your Gardener Application Was Rejected',
      html: `
        <h3>We're sorry...</h3>
        <p>Your application to become a gardener on GreenBridge was rejected.</p>
        <p>Reason: <strong>${reason}</strong></p>
        <p>You can reapply or contact support for more information.</p>
      `
    });

    res.json({ message: 'Profile rejected', data: profile });
  } catch (err) {
    console.error('Rejection error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



module.exports = router;
