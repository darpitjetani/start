const express = require('express');
const dotenv = require('dotenv');
const cors = require("cors");
const connectDB = require('./config/db.js');
const authRoutes = require("./routes/authRoute");
const multer = require("multer");
const fs = require('fs');
const path = require('path');
const { default: mongoose } = require('mongoose');
const overrideing = require("method-override");
const bodyParser = require('body-parser');
const User = require('./models/userModel');
const Counter = require('./models/Counter');
dotenv.config();

connectDB(); 

const app = express();

app.use('/public', express.static('public'));


app.use(bodyParser.json())
app.use(express.static('public'));



app.use('/uploads', express.static(path.join(__dirname, 'uploads')));




const allowedOrigins = ['https://digitalbusinessplan.in', 'https://example.com'];

const corsOptions = {
origin: 'https://digitalbusinessplan.in',
methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
allowedHeaders: ['Content-Type', 'Authorization'],
};


app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use('/api', authRoutes);



app.get('/api/user-count', async (req, res) => {
try {
  const count = await User.countDocuments();
  res.json({ count });
} catch (error) {
  res.status(500).json({ error: 'An error occurred while counting users.' });
}
});


const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Function to generate a unique code
async function generateUniqueCode() {
try {
  const counter = await Counter.findOneAndUpdate(
    { id: 'userCode' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  
  console.log('Counter:', counter); // આ લાઇન ઉમેરો

  const uniqueCode = `DBP-${counter.seq.toString().padStart(4, '0')}`;
  return uniqueCode;
} catch (error) {
  console.error('Error generating unique code:', error);
  throw error;
}
}


// User Registration Endpoint
app.post('/api/v1/auth/register', async (req, res) => {
try {
  const { firstname, middlename, lastname, address, aadhaar, pan, photo, email, mobile, password, referenceCode } = req.body;

  console.log('Request Body:', req.body);

  // Check if any user exists in the database
  const userCount = await User.countDocuments();
  console.log('User Count:', userCount);

  // First user registration without reference code
  if (userCount === 0) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstname,
      middlename,
      lastname,
      address,
      aadhaar,
      pan,
      photo,
      email,
      mobile,
      password: hashedPassword,
      code: "DBP-1101",
      referenceCode: "N/A"
    });

    await newUser.save();

    return res.status(201).json({ message: 'First user registered successfully', code: "DBP-1101" });
  }

  // Validate if the reference code exists and is valid for subsequent users
  const referrer = await User.findOne({ code: referenceCode });
  console.log('Referrer:', referrer);

  if (!referrer) {
    return res.status(400).json({ message: 'Invalid reference code. You cannot register without a valid reference code.' });
  }

  // Check if the email or mobile is already registered
  const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
  console.log('Existing User:', existingUser);

  if (existingUser) {
    return res.status(400).json({ message: 'Email or mobile is already registered.' });
  }

  // Hash the password before saving
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('Hashed Password:', hashedPassword);

  // Generate a unique code for the new user
  const code = await generateUniqueCode();
  console.log('Generated Code:', code);

  // Create and save new user
  const newUser = new User({
    firstname,
      middlename,
      lastname,
      address,
      aadhaar,
      pan,
      photo,
      email,
      mobile,
      password: hashedPassword,
      code,
      referenceCode
  });

  await newUser.save();

  res.status(201).json({ message: 'User registered successfully', code });
} catch (error) {
  console.error('Error registering user:', error);
  if (error.code === 11000) {
    res.status(400).json({ message: 'Same aadhar and pan number' });
  } else {
    res.status(500).json({ message: 'Server error' });
  }
}
});

app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      const dir = path.join(__dirname, 'public', 'Images');

      if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
  },
  filename: function (req, file, cb) {
      const uniqueFilename = `${Date.now()}_${file.originalname}`;
      cb(null, uniqueFilename);
      req.body.photoURL = `/Images/${uniqueFilename}`; // Save relative path
  }
});

    
const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req, res) => {
    console.log("Body:", req.body);
    console.log("File:", req.file);
    const fileDetails = { 
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
    };  
    res.json({
        message: 'File uploaded successfully',
        file: fileDetails
    });
});

app.post('/uploadAadhaar', (req, res) => {
upload(req, res, function (err) {
    if (err) {
        console.error('Error uploading Aadhaar photo:', err);
        return res.status(500).send("Error uploading file.");
    }
    const filePath = `/Images/${req.file.filename}`;
    res.json({ message: "File uploaded successfully", file: { path: filePath } });
});
});

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'public/Images');
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname)); // Generate unique filename
//   }
// });

// const upload = multer({ storage: storage });

// // Route to handle image upload
// app.post('/upload', upload.single('photo'), (req, res) => {
//   const photoPath = `/Images/${req.file.filename}`;
//   // Save photoPath in the database
//   res.json({ message: 'Image uploaded successfully', path: photoPath });
// });
// app.use('/public', express.static('public'));


app.use("/api/v1/auth", authRoutes);

app.get('/api/users', async (req, res) => {
try {
    // Fetch all users
    const users = await User.find();

    // Calculate reference count for each user
    const usersWithReferenceCount = await Promise.all(users.map(async (user) => {
        // Count how many users have this user's code as their reference
        const referenceCount = await User.countDocuments({ referenceCode: user.code });

        return {
            firstname: user.firstname,
            lastname: user.lastname,
            referenceCount, // Include the reference count
        };
    }));

    res.json(usersWithReferenceCount);
} catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
}
});

app.get('/api/v1/users', async (req, res) => {
try {
  const users = await User.find(); // Adjust according to your database query
  res.json(users);
} catch (error) {
  res.status(500).json({ message: 'Failed to fetch users' });
}
});


app.get("/", (req, res) => {
    res.send("<h1>Welcome to ecommerce</h1>");
});

const PORT = process.env.PORT || 5000; 

app.listen(PORT, () => {
    console.log(`Server Running in ${process.env.DEV_MODE} mode on port ${PORT}`);
});


// mongodb+srv://darshil:Darshil%402002@cluster0.szdeu42.mongodb.net //
