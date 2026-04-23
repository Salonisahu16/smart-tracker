const express = require("express")
const router = express.Router()
const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

router.post("/signup", async (req,res)=>{
    const {name,email,password} = req.body

    const hashed = await bcrypt.hash(password,10)

    const user = new User({name,email,password:hashed})
    await user.save()

    res.json({msg:"User created"})
})

router.post("/login", async (req,res)=>{
    const {email,password} = req.body

    const user = await User.findOne({email})
    if(!user) return res.status(400).json({msg:"User not found"})

    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch) return res.status(400).json({msg:"Wrong password"})

    const token = jwt.sign({id:user._id}, process.env.JWT_SECRET)

    res.json({token, userId: user._id})
})

// REGISTER
router.post("/register", async (req,res)=>{
    try{
        const { email, password } = req.body

        // check existing user
        const existingUser = await User.findOne({ email })
        if(existingUser){
            return res.status(400).json({ msg: "User already exists" })
        }

        // hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // create user
        const newUser = new User({
            email,
            password: hashedPassword
        })

        await newUser.save()

        res.json({ msg: "User registered successfully" })

    }catch(err){
        res.status(500).json({ msg: "Server Error" })
    }
})


module.exports = function(req,res,next){

    const token = req.header("Authorization")

    if(!token){
        return res.status(401).json({ msg: "No token" })
    }

    try{
        const decoded = jwt.verify(token, "secretkey")
        req.user = decoded
        next()
    }catch(err){
        res.status(401).json({ msg: "Invalid token" })
    }
}


module.exports = router