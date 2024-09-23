const JWT = require ("jsonwebtoken");
const userModel = require ("../models/userModel.js");

//Protected Routes token base
//  const requireSignIn = async (req, res, next) => {
//   try {
//     const decode = JWT.verify(
//       req.headers.authorization,
//       process.env.JWT_SECRET
//     );
//     req.user = decode;
//     next();
//   } catch (error) {
//     console.log(error);
//   }
// };
   const requireSignIn = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from the header
  if (!token) {
      return res.status(401).send({ message: "No token provided" });
  }
  JWT.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
          return res.status(401).send({ message: "Invalid token" });
      }
      req.user = decoded; // Attach user info to the request
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

const authenticate = (req, res, next) => {
  // Assuming you use JWT or similar
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, 'YOUR_SECRET_KEY');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};


module.exports = { requireSignIn , isAdmin, authenticate};
