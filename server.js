const express = require("express");
const cors = require("cors");

const app = express();

// ================= MIDDLEWARE =================
app.use(express.json({limit:"10mb"}));
app.use(cors());

// ================= TEMP DATABASE =================
let users = [];
let pendingAdmins = [];
let posts = [];

// ================= AUTH =================

app.post("/signup",(req,res)=>{
    const {userId,password} = req.body;

    if(users.find(u=>u.userId===userId)){
        return res.json({success:false,message:"User exists"});
    }

    users.push({userId,password,role:"user"});
    res.json({success:true});
});

app.post("/login",(req,res)=>{
    const {userId,password} = req.body;

    const user = users.find(u=>u.userId===userId && u.password===password);

    if(!user) return res.json({success:false});

    res.json({success:true,user});
});

// ================= FORUM =================

app.post("/createPost",(req,res)=>{
    const {userId,text,image} = req.body;

    const post = {
        id: Date.now(),
        userId,
        text,
        image,
        likes:0,
        comments:[]
    };

    posts.unshift(post);
    res.json({success:true});
});

app.get("/getPosts",(req,res)=>{
    res.json(posts);
});

app.post("/likePost",(req,res)=>{
    const {id} = req.body;

    const post = posts.find(p=>p.id==id);
    if(post) post.likes++;

    res.json({success:true});
});

app.post("/commentPost",(req,res)=>{
    const {id,userId,comment} = req.body;

    const post = posts.find(p=>p.id==id);
    if(post) post.comments.push({userId,comment});

    res.json({success:true});
});

// ================= ROOT =================
app.get("/",(req,res)=>{
    res.send("Backend running 🚀");
});
let notifications = [];

// GET
app.get("/notifications",(req,res)=>{
    res.json(notifications);
});

// POST (admin use)
app.post("/notifications",(req,res)=>{
    const {text,date} = req.body;

    notifications.unshift({text,date});
    res.json({success:true});
});

// ================= PORT FIX =================
const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log("Server running on port " + PORT);
});
