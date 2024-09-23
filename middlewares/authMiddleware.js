const JWT = require ("jsonwebtoken");
const userModel = require ("../models/userModel.js");

//Protected Routes token base
const requireSignIn = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Token missing" });
  }

  console.log("Token received:", token); // Log the token for debugging

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("Token verification failed:", err.message); // Log verification error
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = decoded; // Store decoded token
    next();
  });
};

   
//admin acceess
 const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (user.role !== 1) {
      return res.status(401).send({
        success: false,
        message: "UnAuthorized Access",
      });
    } else { 
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(401).send({
      success: false,
      error,
      message: "Error in admin middelware",  
    });
  }
};


module.exports = { requireSignIn , isAdmin};
