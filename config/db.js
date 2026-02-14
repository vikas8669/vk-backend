const mongoose = require("mongoose")

require("dotenv").config()


const dbConnect = async() => {
    
    try {
        
        await mongoose.connect(process.env.MONGO_URL)
        console.log("db connect")
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}


module.exports = dbConnect