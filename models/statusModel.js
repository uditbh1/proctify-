const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const statusSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    select: false,
  },
  examCode: {
    type: String,
    required:true,
    minlength:5,
    maxlength: 5
  },
  studentName:{
    type: String,
    required:true,
  },
  studentEmail: {
    type: String,
    required: true
  },
  tabSwitchCount: {
    type:Number,
    required:true,
    default:0,
  },
  keyPressCount: {
    type:Number,
    required:true,
    default:0,
  },
  mobileFound: {
    type:Boolean,
    required:true,
    default:false,
  },
  prohibitedObjectFound: {
    type:Boolean,
    required:false,
    default:false,
  },
  faceNotVisible: {
    type: Boolean,
    required: true,
    default:false,
  },
  multipleFaceFound: {
    type: Boolean,
    required: true,
    default:false,
  }
});

// export the model
module.exports = Status = mongoose.model("Status", statusSchema);