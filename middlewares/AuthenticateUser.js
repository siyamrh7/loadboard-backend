const Users=require('../models/Users')
const jwt=require('jsonwebtoken')

const AuthenticateUser=async(req,res,next)=>{
    try {
     const token=req.headers.authorization
     const user=jwt.verify(token,process.env.JWT_SECRET)
     const find=await Users.findOne({id:user.id})
     if(!find){
         return res.json({status:false,msg:"Authentication Failed"})
     }
     req.id=user.id
     req.user=user
     next()
    } catch (error) {
        return res.json({status:false,error:error.message,error,msg:"Authentication error"})
    }
}

module.exports=AuthenticateUser