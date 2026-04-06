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

// ================= AUTH SYSTEM =================

// USER SIGNUP
app.post("/signup", (req,res)=>{
    const {userId, password} = req.body;

    const exists = users.find(u=>u.userId===userId);
    if(exists) return res.json({success:false, message:"User already exists"});

    users.push({userId,password,role:"user"});
    res.json({success:true});
});

// ADMIN REQUEST (NOT DIRECT SIGNUP)
app.post("/requestAdmin", (req,res)=>{
    const {userId,password} = req.body;

    pendingAdmins.push({userId,password});
    res.json({success:true, message:"Request sent"});
});

// ADMIN APPROVAL (ONLY YOU USE THIS)
app.post("/approveAdmin",(req,res)=>{
    const {userId} = req.body;

    const index = pendingAdmins.findIndex(u=>u.userId===userId);
    if(index===-1) return res.json({success:false});

    const admin = pendingAdmins[index];
    users.push({...admin, role:"admin"});
    pendingAdmins.splice(index,1);

    res.json({success:true});
});

// LOGIN
app.post("/login",(req,res)=>{
    const {userId,password} = req.body;

    const user = users.find(u=>u.userId===userId && u.password===password);

    if(!user) return res.json({success:false});

    res.json({
        success:true,
        user:{
            userId:user.userId,
            role:user.role
        }
    });
});

// ================= FORUM SYSTEM =================

// CREATE POST
app.post("/createPost",(req,res)=>{
    const {userId, text, image} = req.body;

    const post = {
        id: Date.now(),
        userId,
        text,
        image,
        likes: 0,
        comments:[]
    };

    posts.unshift(post);
    res.json({success:true});
});

// GET POSTS
app.get("/getPosts",(req,res)=>{
    res.json(posts);
});

// LIKE POST
app.post("/likePost",(req,res)=>{
    const {id} = req.body;

    const post = posts.find(p=>p.id==id);
    if(post) post.likes++;

    res.json({success:true});
});

// COMMENT
app.post("/commentPost",(req,res)=>{
    const {id, userId, comment} = req.body;

    const post = posts.find(p=>p.id==id);
    if(post){
        post.comments.push({userId, comment});
    }

    res.json({success:true});
});

// ================= ROOT =================
app.get("/", (req,res)=>{
    res.send("Campus Navigator Backend Running 🚀");
});

// ================= SERVER =================
app.listen(5000, ()=>{
    console.log("Server running on http://localhost:5000");
});
