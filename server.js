const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();

// 🔐 MIDDLEWARE
app.use(express.json());
app.use(cors({
    origin: "*"
}));

// 🌍 PORT (Render uses process.env.PORT)
const PORT = process.env.PORT || 5000;

// 🧠 CONNECT MONGODB ATLAS
mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log("MongoDB Connected"))
.catch(err => console.log(err));

// 📦 USER SCHEMA
const UserSchema = new mongoose.Schema({
    userId: { type:String, required:true, unique:true },
    password: { type:String, required:true },
    role: { type:String, default:"user" },
    adminRequest: { type:Boolean, default:false }
});

const User = mongoose.model("User", UserSchema);

// 🧾 SIGNUP (USER ONLY)
app.post("/signup", async (req,res)=>{
    try{
        const {userId,password} = req.body;

        const exists = await User.findOne({userId});
        if(exists){
            return res.json({message:"User already exists"});
        }

        const hashed = await bcrypt.hash(password,10);

        await User.create({
            userId,
            password: hashed
        });

        res.json({message:"Account created successfully"});
    }catch(err){
        res.status(500).json({message:"Error creating account"});
    }
});

// 🔐 LOGIN
app.post("/login", async (req,res)=>{
    try{
        const {userId,password} = req.body;

        const user = await User.findOne({userId});
        if(!user){
            return res.json({success:false});
        }

        const match = await bcrypt.compare(password,user.password);
        if(!match){
            return res.json({success:false});
        }

        res.json({
            success:true,
            role:user.role
        });

    }catch(err){
        res.status(500).json({success:false});
    }
});

// 👑 REQUEST ADMIN ACCESS
app.post("/request-admin", async (req,res)=>{
    try{
        const {userId} = req.body;

        await User.updateOne(
            {userId},
            {adminRequest:true}
        );

        res.json({message:"Admin request sent"});
    }catch(err){
        res.status(500).json({message:"Error"});
    }
});

// 📋 GET ALL ADMIN REQUESTS (FOR YOU)
app.get("/admin-requests", async (req,res)=>{
    try{
        const users = await User.find({adminRequest:true});
        res.json(users);
    }catch(err){
        res.status(500).json([]);
    }
});

// ✅ APPROVE ADMIN (ONLY YOU SHOULD USE THIS)
app.post("/approve-admin", async (req,res)=>{
    try{
        const {userId} = req.body;

        await User.updateOne(
            {userId},
            {role:"admin", adminRequest:false}
        );

        res.json({message:"User promoted to admin"});
    }catch(err){
        res.status(500).json({message:"Error"});
    }
});

// ❌ OPTIONAL: REJECT ADMIN REQUEST
app.post("/reject-admin", async (req,res)=>{
    try{
        const {userId} = req.body;

        await User.updateOne(
            {userId},
            {adminRequest:false}
        );

        res.json({message:"Request rejected"});
    }catch(err){
        res.status(500).json({message:"Error"});
    }
});

// 🚀 START SERVER
app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
});
