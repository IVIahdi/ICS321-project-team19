const express = require("express");
const db = require(__dirname + '/db');



const server = express();
const port = 8000;
server.set('view engine', 'ejs')
server.use(express.urlencoded({ extended: false }));

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
    res.sendFile(__dirname + '/reports.html')
});

server.get('/reports/packsinfo', (req,res)=>{
    var q = 'select * from package;'
    db.query(q, (e,d)=>{
        if (e){
            throw e
        }
        else {
            res.render('packages_info.ejs', {data: d})
        }
    })
})

server.get('/reports/packsnumber', (req,res)=>{
    var q = 'select * from package;'
    db.query(q, (e,d)=>{
        if (e){
            throw e
        }
        else {
            res.render('packages_number.ejs', {data: d})
        }
    })
})

server.get('/admin/edit/:package_number', (req,res)=>{
    var package_number = req.params.package_number
    var q = `select * from package where package_number = ${package_number}`

    db.query(q, (e,d)=>{
        if (e) throw e;
        else{res.render('editPackage.ejs', {Action: 'Edit',d: d[0]})}
    })
})

server.get('/admin/removePackage/:package_number', (req,res)=>{
    res.sendFile(__dirname + '/admin/removePackage.html')
})

server.get('/admin/addpackage', (req,res)=>{
    res.sendFile(__dirname + '/admin/addPackage.html')
})

server.post('/add', (req,res)=>{
    console.log(req.body);
    var pn = req.body.package_number;
    var w = req.body.weight;
    var d = req.body.destination;
    var dimensions = req.body.dimensions;
    var c = req.body.category;
    var ia = req.body.insurance_amount;
    var dd = req.body.delivery_date;

    var q = `insert into package values(${pn},${w},"${d}","${dimensions}",${ia},"${dd}","${c}")`

    db.query(q,(e,d)=>{
        if (e){
            throw e
        }
        else{
            res.redirect('/admin/reports')
        }
    })



})



server.use(express.static("public"));
server.listen(()=>{
    server.listen(port, ()=>{
        console.log(`http://localhost:${port}`);})
    });