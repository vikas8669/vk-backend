const User = require("../models/user")



exports.create = async(req, res) => {

    try {
        const {username} = req.body
        const newUser = new User({username})
        await newUser.save()

        return res.status(200).json({
            message:"create user",
            newUser
        })
    } catch (error) {
        console.log(error)
        
    }
}