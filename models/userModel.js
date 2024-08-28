const mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  firstname:{
      type:String,
      required:true,
  },
  middlename:{
      type:String,
      required: true,
  },
  lastname:{
      type:String,
      required:true,
  },
  address:{
      type:String,
      required:true,
  },
  aadhaar: {
      type:Number,
      required: true,
      unique: true,
      validate: {
          validator: function(v){
              return /^\d{12}$/.test(v);
          },
          message: props => `${props.value} is not a valid aadhaar number!`
      }
  }, 
  pan:{
      type: String,
      required: true,
      unique: true,
      validate: {
          validator: function(v){
              return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v);
          },
          message: props => `${props.value} is not a valid pan number!`
      }
  },
  photo: {
      type: String,
      required: false,
  }, 
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  mobile: {
    type: Number,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid mobile number!`
    }
  },
  password:{
      type:String,
      required:true,
  },
  code: {
    type:String,
    required: true,
    trim: true,
  },  
  referenceCode: {
    type:String,
  },
  refreshToken: {
      type: String,
  },
  role: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive',
  },
});

const User = mongoose.model('User', userSchema);

//  mongoose.model("users", userSchema);
 module.exports = User;
