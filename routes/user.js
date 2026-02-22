const express = require("express")

const router = express.Router()

const { signup, login, logout  } = require("../controller/user")
const { verifyToken, adminOnly  } = require("../middleware/auth")


router.post("/login", login)
router.post("/signup", signup)
router.post("/logout", logout)


router.get("/verify", verifyToken, (req, res) => {
  res.status(200).json({ message: "Token is valid", user: req.user });
});

router.get("/admin-only", verifyToken, adminOnly, (req, res) => {
  res.status(200).json({ message: "Welcome Admin!", user: req.user });
});

module.exports = router