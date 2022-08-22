const Users=require('../models/Users')
const bcrypt=require('bcrypt')
const jwt= require('jsonwebtoken')

const CreateUser=async(req,res)=>{
    try {
        const {name,email,password,role}=req.body
        if(!name || !email || !password  ){
            return res.json({status:false,msg:"Invalid Creadentials"})
        }
        
       
        const find = await Users.findOne({email})
        if(find){
            return res.json({status:false,msg:"User already available with this email"})
        }
         const hashpass=await bcrypt.hash(password,10)
        const user=await Users.create({name,email,password:hashpass,role,image:req.file.path})
         res.json({status:true,msg:"Account creation successful",user})

    } catch (error) {
        res.json({status:false,msg:error.message,error:error})
    }

}

const LoginUser=async(req,res)=>{
    try {
        const {email,password}=req.body
        const find = await Users.findOne({email})
        if(!find){
         return res.json({status:false,msg:"User doesn't exist"})
        }
        const check= await bcrypt.compare(password,find.password)
        if(!check){
            return res.json({status:false,msg:"Password doesn't matched"})
        }
        const token = jwt.sign({user:{email:find.email,name:find.name,image:find.image,role:find.role},id:find._id},process.env.JWT_SECRET,{expiresIn:'7d'})
        res.json({status:true,msg:"Login Successfull",token})
    } catch (error) {
        res.json({status:false,msg:error.message,error:error})

    }
}


const GetUser=async(req,res)=>{
    try {
        const user=await Users.findById(req.query.id)
        res.json({status:true,msg:user})
    } catch (error) {
        res.json({status:false,msg:error.message,error:error})

    }
}
const GetUsers=async(req,res)=>{
    try {
        const users=await Users.find({})
        res.json({status:true,msg:users})
    } catch (error) {
        res.json({status:false,msg:error.message,error:error})

    }
}
const DeleteUser=async(req,res)=>{
    try {
        if(req.id===req.query.id){
            return  res.json({status:false,msg:"You can't delete yourself"})
        }
        const user=await Users.findByIdAndDelete(req.query.id)

        res.json({status:true,user,msg:"User Deleted"})
    } catch (error) {
        res.json({status:false,msg:error.message,error:error})

    }
}
module.exports={CreateUser,LoginUser,GetUser,GetUsers,DeleteUser}