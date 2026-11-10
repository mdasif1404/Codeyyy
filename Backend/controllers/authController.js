
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Cookie configuration
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000
});

// Generate JWT and send authentication cookie
const sendTokenCookie = (userId, res) => {
  const token = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  res.cookie("codyyy_token", token, getCookieOptions());
};

// Safe user response
const userResponse = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  avatar: user.avatar,
  bio: user.bio,
  stats: user.stats
});


// REGISTER

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email and password are required"
      });
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanUsername.length < 3 || cleanUsername.length > 20) {
      return res.status(400).json({
        success: false,
        message: "Username must be between 3 and 20 characters"
      });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      return res.status(400).json({
        success: false,
        message: "Username can only contain letters, numbers and underscores"
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email"
      });
    }

    if (typeof password !== "string" || password.length < 8 || password.length > 72) {
      return res.status(400).json({
        success: false,
        message: "Password must be between 8 and 72 characters"
      });
    }

    // Checks if user exists
    const existingUser = await User.findOne({
      $or: [
        { email: cleanEmail },
        { username: cleanUsername }
      ]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email or username is already registered"
      });
    }

    // converts the password into hashcode before saving in mongodb
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword
    });

    // sends the token 
    sendTokenCookie(user._id.toString(), res);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: userResponse(user)
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email or username is already registered"
      });
    }

    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed"
    });
  }
};


// LOGIN

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    }).select("+password");

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    sendTokenCookie(user._id.toString(), res);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: userResponse(user)
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
};


// LOGOUT

export const logout = (req, res) => {
  res.clearCookie("codyyy_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
};


// GET LOGGED-IN USER

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      user: userResponse(user)
    });

  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve profile"
    });
  }
};


// UPDATE PROFILE

export const updateProfile = async (req, res) => {
  try {
    const { username, bio, avatar } = req.body;

    const updates = {};

    if (username !== undefined) {
      const cleanUsername = username.trim();

      if (
        cleanUsername.length < 3 ||
        cleanUsername.length > 20 ||
        !/^[a-zA-Z0-9_]+$/.test(cleanUsername)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid username"
        });
      }

      updates.username = cleanUsername;
    }

    if (bio !== undefined) {
      if (typeof bio !== "string" || bio.length > 200) {
        return res.status(400).json({
          success: false,
          message: "Bio must not exceed 200 characters"
        });
      }

      updates.bio = bio.trim();
    }

    if (avatar !== undefined) {
      if (typeof avatar !== "string" || avatar.length > 2048) {
        return res.status(400).json({
          success: false,
          message: "Invalid avatar value"
        });
      }

      updates.avatar = avatar;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      {
        new: true,
        runValidators: true
      }
    );

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: userResponse(user)
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Username is already taken"
      });
    }

    console.error("Profile update error:", error);

    return res.status(500).json({
      success: false,
      message: "Profile update failed"
    });
  }
};
