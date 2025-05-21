const UserService = require('../services/UserService');


const { hashSHA256 } = require('../utils/cryptoUtils');  // Import the hashSHA256 function


// Controller function for signing up a user
const signup = async (req, res) => {

  const { name, email, password } = req.body;
  try {
    const newUser = await UserService.signup(name, email, password);
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller function for signing in a user
const signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log("Signin request received:", req.body);
    const {token, role} = await UserService.signin(email, password);
    res.status(200).json({ message: 'User signed in successfully', token, role });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Token required" });
    }

    const userId = await UserService.getUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await UserService.getUserById(userId); // we'll add this method next

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        userId: user.user_id
      }
    });
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    res.status(500).json({ message: "Failed to fetch user info", error: error.message });
  }
};

const changeName = async (req, res) => {
  try {
    const { token, name } = req.body;
    if (!token || !name) {
      return res.status(400).json({ message: "Token required" });
    }

    const userId = await UserService.getUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const updated = await UserService.updateUserName(userId, name);

    if (!updated) {
      return res.status(500).json({ message: "Failed to update user name" });
      
    }
    const updatedUser = await UserService.getUserById(userId);
    res.status(200).json({
      message: "User name updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error changing user name:", error.message);
    res.status(500).json({ message: "Failed to change user name", error: error.message });
  }
};

const changeUserRole = async (req, res) => {
  try {
    const { token, role } = req.body;

    if (!token || !role) {
      return res.status(400).json({ message: "Token and new role are required" });
    }

    const userId = await UserService.getUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const validRoles = ['customer', 'product_manager', 'sales_manager'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const success = await UserService.changeUserRole(userId, role);

    if (!success) {
      return res.status(404).json({ message: "User not found or role unchanged" });
    }

    return res.status(200).json({ message: `User role updated to ${role}` });
  } catch (error) {
    console.error("Role change error:", error.message);
    return res.status(500).json({ message: "Failed to update role", error: error.message });
  }
};

/*
// Controller function to check if a user exists
const isUser = async (req, res) => {
  const { email } = req.params;
  try {
    const userExists = await UserService.isUser(email);
    if (userExists) {
      res.status(200).json({ message: 'User exists' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
*/

module.exports = { signup, signin, getUserProfile, changeName, changeUserRole };