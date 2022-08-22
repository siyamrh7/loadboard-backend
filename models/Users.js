const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true,
    unique:true
  },
  password:{
    type:String,
    required:true
  },
  image:{
    type:String
  },
  role:{
    type:String,
    required:true
  },
  trucks:[
    {type:mongoose.Schema.Types.ObjectId,ref:"Trucks"}
  ],
  trailers:[
    {type:mongoose.Schema.Types.ObjectId,ref:"Trailers"}
  ],
  histories:[
    {type:mongoose.Schema.Types.ObjectId,ref:"Histories"}
  ],
  requests:[
    {type:mongoose.Schema.Types.ObjectId,ref:"Requests"}
  ]
}, { timestamps: true })


const Users = mongoose.model("Users", UserSchema)


module.exports = Users