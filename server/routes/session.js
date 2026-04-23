const express = require("express")
const router = express.Router()
const Session = require("../models/Session")
const auth = require("../middleware/auth")

// Add session
router.post("/add", auth, async (req,res)=>{
    const session = new Session({
        userId: req.user,
        duration: req.body.duration
    })

    await session.save()
    res.json({msg:"Session saved"})
})

// Get sessions
router.get("/", auth, async (req,res)=>{
    const sessions = await Session.find({userId: req.user})
    res.json(sessions)
})

// Delete sessions
router.delete("/:id", async (req,res)=>{
    await Session.findByIdAndDelete(req.params.id)
    res.json({msg:"Deleted"})
})

module.exports = router