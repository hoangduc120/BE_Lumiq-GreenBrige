const dotenv = require("dotenv")
dotenv.config()
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const connectDB = require("./config/db")
const cookieParser = require("cookie-parser")
const app = express()


connectDB()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})

