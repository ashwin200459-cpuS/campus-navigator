const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
app.use(express.json());
app.use(cors());

// DB
mongoose.connect("mongodb://127.0.0.1:27017/campus");

// Schema
const UserSchema = new mongoose.Schema({
    userId:String,
    password:String,
    role:{type:String, default:"user"},
    adminRequest:{type:Boolean, default:false}
});

const User = mongoose.model("User", UserSchema);

// SIGNUP (USER ONLY)
app.post("/signup", async (req,res)=>{
    const {userId,password} = req.body;

    const hashed = await bcrypt.hash(password,10);

    await User.create({userId,password:hashed});

    res.json({message:"User created"});
});

// LOGIN
app.post("/login", async (req,res)=>{
    const {userId,password} = req.body;

    const user = await User.findOne({userId});

    if(!user) return res.json({success:false});

    const match = await bcrypt.compare(password,user.password);

    if(!match) return res.json({success:false});

    res.json({
        success:true,
        role:user.role
    });
});

// REQUEST ADMIN
app.post("/request-admin", async (req,res)=>{
    const {userId} = req.body;

    await User.updateOne({userId},{adminRequest:true});

    res.json({message:"Request sent to admin"});
});

// GET REQUESTS (YOU ONLY)
app.get("/admin-requests", async (req,res)=>{
    const users = await User.find({adminRequest:true});
    res.json(users);
});

// APPROVE ADMIN (YOU CONTROL THIS)
app.post("/approve-admin", async (req,res)=>{
    const {userId} = req.body;

    await User.updateOne(
        {userId},
        {role:"admin", adminRequest:false}
    );

    res.json({message:"User is now admin"});
});

app.listen(5000, ()=>console.log("Server running"));
