
const express=require('express'),fs=require('fs'),path=require('path');
const app=express();app.use(express.json());app.use(express.static('public'));
const dbp=path.join(__dirname,'data/db.json');
const r=()=>JSON.parse(fs.readFileSync(dbp));
const w=d=>fs.writeFileSync(dbp,JSON.stringify(d,null,2));

app.post('/login',(req,res)=>{
 const {username,password}=req.body;
 let db=r();
 let user=db.users.find(u=>u.username===username&&u.password===password);
 if(!user) return res.status(401).json({error:'Invalid'});
 res.json(user);
});

app.post('/register',(req,res)=>{
 let db=r();
 const {username,password}=req.body;
 if(db.users.find(u=>u.username===username))
  return res.status(400).json({error:'User exists'});
 db.users.push({username,password,role:'user'});
 w(db);res.json({ok:true});
});

function isAdmin(req){return req.headers.role==='admin'}

['guide','notifications','teachers'].forEach(k=>{
 app.get('/'+k,(req,res)=>res.json(r()[k]));
 app.post('/'+k,(req,res)=>{
  if(!isAdmin(req)) return res.status(403).json({error:'Forbidden'});
  let db=r();db[k].push(req.body);w(db);res.json({ok:true});
 });
});

app.get('/forum',(req,res)=>res.json(r().forum));
app.post('/forum',(req,res)=>{
 let db=r();db.forum.push(req.body);w(db);res.json({ok:true});
});
app.delete('/forum/:i',(req,res)=>{
 if(!isAdmin(req)) return res.status(403).json({error:'Forbidden'});
 let db=r();db.forum.splice(req.params.i,1);w(db);res.json({ok:true});
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
