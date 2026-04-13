const express = require("express")
const app = express()
const path = require("path")
const dbConnect = require("./config/db")
dbConnect()

const router = require("./routes/user")
const contactRoute = require("./routes/contact")
const projectRoute = require("./routes/project")
const razorpayRoute = require("./routes/payment")
const cors = require("cors")

// app.use(cors({ origin: "http://localhost:5173" }))

app.use(cors({
  origin: [
    "https://vk-port-six.vercel.app",
    "https://admin-vk.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174"
  ],
  credentials: true
}))

app.use(
  "/api/v1/payment/webhook",
  express.raw({ type: "application/json" })
)
app.use(express.json())
app.use("/invoices", express.static(path.join(__dirname, "generated", "invoices")))


const PORT = process.env.PORT || 3000

app.get("/", (req, res ) => {
    res.send("hello")
})


app.use("/api/v1",router)
app.use("/api/v1", contactRoute )
app.use("/api/v1", projectRoute )
app.use("/api/v1", razorpayRoute )


app.listen(PORT, () => {
    console.log("server start at", PORT)
})
