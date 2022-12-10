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
    var q = "selcet * from package"
    db.query(q, (e,d)=>{
        if (e){
            throw e
        }
        else {
            res.render(q)
        }
    })
    res.sendFile(__dirname + '/admin.html')
})


server.use(express.static("public"));
server.listen(()=>{
    server.listen(port, ()=>{
        console.log(`http://localhost:${port}`);})
    });