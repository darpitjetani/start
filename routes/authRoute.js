const express = require('express');
const { registerController, loginController, testController, forgotPasswordController, getAllUserController } = require('../controllers/authController');
const { requireSignIn, isAdmin } = require('../middlewares/authMiddleware');
const User = require('../models/userModel');


const router = express.Router();

// Registration Route
router.post('/register', registerController);

// Login Route
router.post('/login', loginController);

//forgot-password 
router.post("/forgot-password", forgotPasswordController)

// Test Route
router.get('/test', requireSignIn, isAdmin, testController);

//all users
router.get("/get-user", getAllUserController);


//protected user route-auth
router.get("/user-auth", requireSignIn, (req,res) => {
    res.status(200).send({ ok: true });
})

//protected admin route-auth
router.get("/admin-auth", requireSignIn,isAdmin, (req,res) => {
    res.status(200).send({ ok: true });
})

// Update user status
router.patch('/update-status/:id', async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      console.log(`User ${user._id} status updated to ${user.status}`);
      res.status(200).json(user);
    } catch (error) {
      console.error('Error updating status:', error);
      res.status(400).json({ message: 'Error updating status' });
    }
  });

  router.get('/user-count', async (req, res) => {
    try {
      const count = await User.countDocuments(); // Count the number of documents in the User collection
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while counting users.' });
    }
  });

module.exports = router;
