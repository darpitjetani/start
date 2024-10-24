const userModel = require ("../models/userModel.js");
const { comparePassword, hashPassword } = require ("./../helpers/authHelper.js");
const JWT = require("jsonwebtoken");

 const registerController = async (req, res) => {
  try {
    const { firstname, middlename, lastname, address, aadhaar, pan, photo,aadhaarPhoto, email, mobile, password, code, referenceCode } = req.body;
    //validations
    if (!firstname) {
      return res.send({ error: "firstName is Required" });
    }
    if (!middlename) {
      return res.send({ message: "middlename is Required" });
    }
    if (!lastname) {
      return res.send({ message: "lastname is Required" }); 
    } 
    if (!address) {
      return res.send({ message: "address is Required" });
    }
    if (!aadhaar) {
      return res.send({ message: "aadhaar is Required" });
    }
    if (!pan) {
      return res.send({ message: "pan number is Required" });
    }
    if (!photo) {
        return res.send({ message: "photo is Required" });
    }
    if (!aadhaarPhoto) {
      return res.send({ message: "aadhaarPhoto is Required" });
    }
    if (!email) {
        return res.send({ message: "email is Required" });
    }
    if (!mobile) {
        return res.send({ message: "mobile number is Required" });
    } 
    if (!password) {
        return res.send({ message: "password is Required" });
    }
    if(!code){
      return res.send({message: "code is required"});
    } 
    // if(!referenceCode){
    //   return res.send({message: "referenceCode is required"});
    // } 
    //check user
    const exisitingUser = await userModel.findOne({ email });
    //exisiting user
    if (exisitingUser) {
      return res.status(200).send({
        success: false,
        message: "Already Register please login",
      });
    }
    //register user
    const hashedPassword = await hashPassword(password);
    //save
    const user = await new userModel({
      firstname,
      middlename,
      lastname,
      address,
      aadhaar,
      pan,
      photo: photo,
      aadhaarPhoto: photo,
      email,
      mobile,
      password: hashedPassword,
      code
      // referenceCode, 
    }).save();

    res.status(201).send({
      success: true,
      message: "User Register Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Registeration",
      error,
    });
  }
};


//POST LOGIN
 const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid email or password",
      });
    }    
 
    //check user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email is not registerd",
      }); 
    }
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid Password",
      });
    } 
    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'User is inactive. Please contact support.' });
    }
    //token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).send({
      success: true,
      message: "login successfully",
      user: {
        _id: user._id,
        firstname: user.firstname,
        photo: user.photo,
        middlename: user.middlename,
        lastname: user.lastname,
        address: user.address,
        aadhaar: user.aadhaar,
        firstname: user.firstname,
        pan: user.pan,
        email: user.email,
        mobile: user.mobile,
        code: user.code,
        role: user.role
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,  
    });
  }
};

//forgotPasswordController

 const forgotPasswordController = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email) {
      res.status(400).send({ message: "Email is required" });
    }    
    if (!newPassword) {
      res.status(400).send({ message: "New Password is required" });
    }
    //check
    const user = await userModel.findOne({ email });
    //validation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Wrong Email Or Answer",
      });
    }
    const hashed = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });
    res.status(200).send({
      success: true,
      message: "Password Reset Successfully", 
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

//test controller
 const testController = (req, res) => {
  try {
    res.send("Protected Routes");
  } catch (error) {
    console.log(error);
    res.send({ error });
  }
};

 const getAllUserController = async (req, res) => {
  try {
    const users = await userModel
      .find({})
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error WHile Geting user",
      error,
    });
  }
};


 const updateProfileController = async (req, res) => {
  try {
    const { firstname, middlename, lastname, address, aadhaar, pan, email, photo, mobile, password } = req.body;
    const user = await userModel.findById(req.user._id);
    //password
    if (password && password.length < 6) {
      return res.json({ error: "Passsword is required and 6 character long" });
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        firstname: firstname || user.firstname,
        middlename: middlename || user.middlename,
        lastname: lastname || user.lastname,
        address: address || user.address,
        aadhaar: aadhaar || user.aadhaar,
        pan: pan || user.pan,
        email: email || user.email,
        mobile: mobile || user.mobile,
        photo: photo || user.photo,
        password: hashedPassword || user.password,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Profile Updated Successfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error WHile Update profile",
      error,
    });
  }
};


module.exports = { registerController, loginController, testController, forgotPasswordController, getAllUserController, updateProfileController};


