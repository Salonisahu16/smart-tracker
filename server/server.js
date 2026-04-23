const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()

const app = express()

const cors = require("cors")
app.use(cors())

app.use(cors())
app.use(express.json())

// Routes
const authRoutes = require("./routes/auth")
const sessionRoutes = require("./routes/session")

app.use("/api/auth", authRoutes)
app.use("/api/session", sessionRoutes)

// DB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("DB Connected"))
    .catch(err => console.log(err))

app.get("/", (req, res) => {
    res.send("API Running")
})

app.listen(5000, () => {
    console.log("Server running on port 5000")
})