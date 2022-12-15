const express = require("express");
const db = require(__dirname + '/db');

var session = require('express-session');



const server = express();
const port = 8000;
server.set('view engine', 'ejs')
server.use(express.urlencoded({ extended: false }));
server.use(session({
    secret: 'webslesson',
    resave: true,
    saveUninitialized: true
}));

server.get('/', (req, res) => {
    res.render('index', { title: 'Welcome to IVI\'s company', session: req.session })
})


server.post('/login', function (request, response, next) {

    var username = request.body.username;

    var password = request.body.password;

    if (username && password) {
        query = `
        SELECT * FROM user_login 
        WHERE username = "${username}"
        `;

        db.query(query, function (error, data) {

            if (data.length > 0) {
                for (var count = 0; count < data.length; count++) {
                    if (data[count].user_password == password) {
                        request.session.user_id = data[count].user_id;
                        request.session.role = data[count].role;

                        response.redirect("/");
                    }
                    else {
                        response.send('Incorrect Password');
                    }
                }
            }
            else {
                response.send('Incorrect Username');
            }
            response.end();
        });
    }
    else {
        response.send('Please Enter Username and Password Details');
        response.end();
    }

});

server.get('/logout', function (request, response, next) {

    request.session.destroy();

    response.redirect("/");

});


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

server.get('/customer', (req,res)=>{
    res.sendFile(__dirname+'/customer.html');
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
    db.query(q, (e, d) => {
        if (e) { throw e }
        else {
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

    var q = `insert into package values(${pn},"${d}",${w},"${dimensions}","${c}",${ia},"${dd}")`

    db.query(q, (e, d) => {
        if (e) {
            throw e
        }
        else {
            res.redirect('/admin/reports')
        }
    })



})




server.get("/admin/users", function (request, response, next) {

    var query = "SELECT * FROM user_login ORDER BY user_id DESC";

    db.query(query, function (error, data) {

        if (error) {
            throw error;
        }
        else {
            response.render('users', { title: 'Users info', action: 'list', data: data });
        }

    });

});

server.get("/users/addU", function (request, response, next) {

    response.render("users", { title: 'Insert User', action: 'addU' });

});

server.post("/addU", function (request, response, next) {

    var id = request.body.user_id;

    var username = request.body.username;

    var password = request.body.user_password;

    var email = request.body.user_email;

    var role = request.body.role;

    var query = `
	INSERT INTO user_login 
	VALUES(${id}, "${username}","${email}", "${password}","${role}")
	`;

    db.query(query, function (error, data) {

        if (error) {
            throw error;
        }
        else {
            response.redirect("/admin");
        }

    });

});

server.get('/editU/:user_id', function (request, response, next) {

    var id = request.params.user_id;

    var query = `SELECT * FROM user_login WHERE user_id = ${id}`;

    db.query(query, function (error, data) {

        response.render('users', { title: 'Edit User', action: 'editU', data: data[0] });

    });

});

server.post('/editU/:user_id', function (request, response, next) {

    var id = request.params.user_id;

    var username = request.body.username;

    var password = request.body.user_password;

    var email = request.body.user_email;
    var role = request.body.role;

    var query = `
	UPDATE user_login 
	SET user_id = ${id}, 
	username = "${username}", 
	user_password = "${password}",
    user_email = "${email}",
    role = "${role}"
	WHERE user_id = ${id}
	`;

    db.query(query, function (error, data) {

        if (error) {
            throw error;
        }
        else {
            response.redirect("/admin");
        }

    });

});

server.get('/deleteU/:user_id', function (request, response, next) {

    var id = request.params.user_id;

    var query = `
	DELETE FROM user_login WHERE user_id = ${id}
	`;

    db.query(query, function (error, data) {

        if (error) {
            throw error;
        }
        else {
            response.redirect("/admin");
        }

    });

});


server.get('/payments', (req,res)=>{
    
})

server.use(express.static("public"));
server.listen(() => {
    server.listen(port, () => {
        console.log(`http://localhost:${port}`);
    })
});