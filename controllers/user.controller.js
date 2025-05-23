const catchAsync = require("../utils/catchAsync");
const userService = require("../services/user.service");
const { OK, BAD_REQUEST } = require("../configs/response.config");
const uploadCloud = require("../configs/cloudinary.config");

class UserController {
  getAllUser = catchAsync(async (req, res) => {
    const user = await userService.getAllUser();
    return OK(res, "Get all user successfully", { user });
  });
  getUserById = catchAsync(async (req, res) => {
    const userId = req.params.id;
    const user = await userService.getUserById(userId);
    return OK(res, "Get user by id successfully", { user });
  });
  updateInfo = catchAsync(async (req, res) => {
    const { gender, yob } = req.body;
    const userId = req.id;

    if (!gender || !yob) {
      return BAD_REQUEST(res, "Missing required fields");
    }

    const user = await userService.updateInfo(userId, { gender, yob });
    return OK(res, "Update user information successfully", { user });
  });

  changePassword = catchAsync(async (req, res) => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const userId = req.id;

    if (!currentPassword || !newPassword) {
      return BAD_REQUEST(res, "Missing required fields");
    }

    try {
      await userService.changePassword(
        userId,
        currentPassword,
        newPassword,
        confirmNewPassword
      );
      return OK(res, "Password changed successfully!");
    } catch (error) {
      return BAD_REQUEST(res, error.message);
    }
  });

  profile = catchAsync(async (req, res) => {
    if (!req.jwtDecoded) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No user data found" });
    }

    res.json({ data: { user: req.jwtDecoded } });
  });

  // Get current user's profile
  getProfile = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const user = await userService.getUserProfile(userId);
    return OK(res, "Get user profile successfully", { user });
  });

  // Update current user's profile
  updateProfile = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { fullName, nickName, phone, address, avatar, yob, gender, email } =
      req.body;
    if (
      !fullName &&
      !nickName &&
      !phone &&
      !address &&
      !avatar &&
      !yob &&
      !gender &&
      !email
    ) {
      return BAD_REQUEST(res, "No profile fields provided");
    }
    const user = await userService.updateUserProfile(userId, {
      fullName,
      nickName,
      phone,
      address,
      avatar,
      yob,
      gender,
      email,
    });
    return OK(res, "Update user profile successfully", { user });
  });

  // Update avatar (Cloudinary)
  updateAvatar = [
    uploadCloud.single("avatar"),
    catchAsync(async (req, res) => {
      const userId = req.user.id;
      if (!req.file || !req.file.path) {
        return BAD_REQUEST(res, "No avatar file uploaded");
      }
      const avatarUrl = req.file.path;
      const user = await userService.updateUserProfile(userId, {
        avatar: avatarUrl,
      });
      return OK(res, "Avatar updated successfully", { user });
    }),
  ];
}

module.exports = new UserController();
