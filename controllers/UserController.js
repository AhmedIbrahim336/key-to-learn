const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// @desc    Register a new User
// @route   POST /api/v1/user
// @access  Private
module.exports.registerUser = asyncHandler(async (req, res, next) => {
  const { email, name, password, isAdmin } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    isAdmin,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});
