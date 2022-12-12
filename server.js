const express = require("express");
const db = require(__dirname + '/db');



const server = express();
const port = 8000;
server.set('view engine', 'ejs')
server.use(express.urlencoded({ extended: false }));

server.get('/', (req, res) => {
    res.sendFile(__dirname + '/main.html')
})

server.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html')
})

server.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/admin.html')
})

server.get('/admin/reports', (req, res) => {
    res.sendFile(__dirname + '/reports.html')
});

server.get('/reports/packsinfo', (req, res) => {
    var q = 'select * from package;'
    db.query(q, (e, d) => {
        if (e) {
            throw e
        }
        else {
            res.render('packages_info.ejs', { data: d })
        }
    })
})

server.get('/reports/packsnumber', (req, res) => {
    var q = 'select * from package;'
    db.query(q, (e, d) => {
        if (e) {
            throw e
        }
        else {
            res.render('packages_number.ejs', { data: d })
        }
    })
})




server.get('/admin/edit/:package_number', (req, res) => {
    var package_number = req.params.package_number
    var q = `select * from package where package_number = ${package_number}`

    db.query(q, (e, d) => {
        if (e) throw e;
        else { res.render('editPackage.ejs', { Action: 'Edit', d: d[0] }) }
    })
})

server.post('/edit/:package_number', (req, res) => {
    var package_number = req.params.package_number;

    var w = req.body.weight;
    var d = req.body.destination;
    var dimensions = req.body.dimensions;
    var c = req.body.category;
    var ia = req.body.insurance_amount;
    var dd = req.body.delivery_date;

    q = `update package
    set weight = ${w}, destination = "${d}",
    dimensions = "${dimensions}",
    category = "${c}",
    insurance_amount = ${ia},
    delivery_date = "${dd}" where package_number = ${package_number}

    `;

    db.query(q, (error, data) => {
        if (error) { throw error; }
        else {
            res.redirect('/admin/reports')
        }
    })




})

server.get('/admin/remove/:package_number', (req, res) => {
    var package_number = req.params.package_number;
    var q = `delete from package where package_number = ${package_number}`
    db.query(q,(e,d)=>{
        if (e){throw e}
        else{
            res.redirect('/admin/reports')
        }
    })
})

server.get('/admin/addpackage', (req, res) => {
    res.sendFile(__dirname + '/admin/addPackage.html')
})

server.post('/add', (req, res) => {
    var pn = req.body.package_number;
    var w = req.body.weight;
    var d = req.body.destination;
    var dimensions = req.body.dimensions;
    var c = req.body.category;
    var ia = req.body.insurance_amount;
    var dd = req.body.delivery_date;

    var q = `insert into package values(${pn},${w},"${d}","${dimensions}",${ia},"${dd}","${c}")`

    db.query(q, (e, d) => {
        if (e) {
            throw e
        }
        else {
            res.redirect('/admin/reports')
        }
    })



})




server.get("/admin/users", function(request, response, next){

	var query = "SELECT * FROM user ORDER BY id DESC";

	db.query(query, function(error, data){

		if(error)
		{
			throw error; 
		}
		else
		{
			response.render('users', {title:'Users info', action:'list', data:data});
		}

	});

});

server.get("/users/addU", function(request, response, next){

	response.render("users", {title:'Insert User', action:'addU'});

});

server.post("/addU", function(request, response, next){

	var id = request.body.id;

	var username = request.body.username;

	var password = request.body.password;

    var email =  request.body.email;

	var query = `
	INSERT INTO user 
	VALUES(${id}, "${username}", "${password}", "${email}")
	`;

	db.query(query, function(error, data){

		if(error)
		{
			throw error;
		}	
		else
		{
			response.redirect("/admin");
		}

	});

});

server.get('/editU/:id', function(request, response, next){

	var id = request.params.id;

	var query = `SELECT * FROM user WHERE id = ${id}`;

	db.query(query, function(error, data){

		response.render('users', {title: 'Edit User', action:'editU', data:data[0]});

	});

});

server.post('/editU/:id', function(request, response, next){

	var id = request.params.id;

	var username = request.body.username;

	var password = request.body.password;

    var email =  request.body.email;

	var query = `
	UPDATE user 
	SET id = ${id}, 
	username = "${username}", 
	password = "${password}",
    email = "${email}"
	WHERE id = ${id}
	`;

	db.query(query, function(error, data){

		if(error)
		{
			throw error;
		}
		else
		{
			response.redirect("/admin");
		}

	});

});

server.get('/deleteU/:id', function(request, response, next){

	var id = request.params.id; 

	var query = `
	DELETE FROM user WHERE id = ${id}
	`;

	db.query(query, function(error, data){

		if(error)
		{
			throw error;
		}
		else
		{
			response.redirect("/admin");
		}

	});

});





















server.use(express.static("public"));
server.listen(() => {
    server.listen(port, () => {
        console.log(`http://localhost:${port}`);
    })
});