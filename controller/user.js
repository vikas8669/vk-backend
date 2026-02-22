const User = require("../models/user")
const bcrypt = require("bcrypt")

const jwt = require("jsonwebtoken")
require("dotenv").config()


exports.signup = async(req, res) => {

    try {

        const {username, email, password, role} = req.body
        if(!username || !email || !password || !role) {
            return res.status(400).json({
                message:"All fields required"
            })
        }

        const isUser = await User.findOne({email}) 
        if(isUser) {
            return res.status(400).json({
                message:"Email already register"
            })
        }
        
        const hashPassword = await bcrypt.hash(password, 10)

        const newUser = new User({username, email, role, password:hashPassword})
        await newUser.save()

        return res.status(201).json({
            success:true,
            data:newUser,
            message:"Signup successfully"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Internal server error",
            err:error.message
        })
        
    }
}


exports.login = async(req, res) => {

    try {

        const {email, password} = req.body
        if(!email || !password) {
            return res.status(400).json({
                message:"All fields required"
            })
        }
        const user = await User.findOne({email})
        if(!user) {
            return res.status(404).json({
                message:"Email not exist"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(400).json({
                message:"Password inccorect"
            })
        }

        const payload = {
            id: user._id,
            email:user.email,
            username:user.username,
            role:user.role
        }
        user.password = undefined

        const token = await jwt.sign(payload, process.env.JWT_SECRET)

        return res.status(200).json({
            success:true,
            message:"logIn successfully",
            data:user,
            token:token
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Internal server error",
            err:error.message
        })
    }
}



exports.logout = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      err: error.message,
    });
  }
};