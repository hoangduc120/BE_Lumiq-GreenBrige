const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authMiddleware, restrictTo } = require("../middlewares/authMiddleware");
const GardenerProfile = require("../schema/gardenerProfile.model");

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

module.exports = router;


module.exports = router;
