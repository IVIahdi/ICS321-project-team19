const express = require("express");
const db = require(__dirname + '/db');
console.log(db.query("select * from package"))

const server = express();
const port = 8000;

server.get('/', (req,res)=>{
    res.sendFile(__dirname + '/main.html')
})

server.get('/login', (req,res)=>{
    res.sendFile(__dirname + '/login.html')
})

server.get('/admin', (req,res)=>{
    res.sendFile(__dirname + '/admin.html')
})

server.get('/admin/reports', (req,res)=>{
    var q = "show tables;"
    db.query(q, (e,d)=>{
        if (e){
            throw e
        }
        else {
            res.sendFile(__dirname + '/reports.html')
        }
    })
})



server.use(express.static("public"));
server.listen(()=>{
    server.listen(port, ()=>{
        console.log(`http://localhost:${port}`);})
    });