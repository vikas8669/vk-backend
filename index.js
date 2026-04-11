const express = require("express")
const app = express()
const dbConnect = require("./config/db")
dbConnect()

const router = require("./routes/user")
const contactRoute = require("./routes/contact")
const projectRoute = require("./routes/project")

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

app.use(express.json())


const PORT = process.env.PORT || 3000

app.get("/", (req, res ) => {
    res.send("hello")
})


app.use("/api/v1",router)
app.use("/api/v1", contactRoute )
app.use("/api/v1", projectRoute )

app.listen(PORT, () => {
    console.log("server start at", PORT)
})
