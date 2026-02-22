const jwt = require("jsonwebtoken")

require("dotenv").config()


exports.auth = async(req, res, next) => {

    try {

        const authHeader = req.headers.authorization
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(403).json({
                message:"Invalid token"
            })
        }

        const token = authHeader.split(" ")[1]
        const decoded  = await jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded

        next()
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Internal server error",
            err : error.message
        })
        
    }
}


exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(403).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // attach user info
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "Admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

