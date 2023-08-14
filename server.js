const express = require("express");
const sql = require('mssql');
const session = require('express-session');
const dbConfig = {  
    server: 'IVIahdi\\MSSQLSERVER01',
    authentication: {
        type: 'default',
        options: {
            userName: 'ivi',
            password: '123123'
        }
    },
    options: {
        database: 'dbo.ivi',
        port: 1433  //your port number
    }
}; ;

const server = express();
const port = 1433;

server.set('view engine', 'ejs');
server.use(express.urlencoded({ extended: false }));
server.use(express.static("public"));
server.use("/public", express.static(__dirname + "/views/public"));
server.use(session({
    secret: 'webslesson',
    resave: true,
    saveUninitialized: true
}));


server.get('/', (req, res) => {
    res.render('index', { title: 'Welcome to IVI\'s company', session: req.session });
});

server.post('/login', async (request, response, next) => {
    const username = request.body.username;
    const password = request.body.password;

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM user_login WHERE username = @username');

        if (result.recordset.length > 0) {
            const user = result.recordset[0];

            if (user.user_password === password) {
                request.session.user_id = user.user_id;
                request.session.role = user.role;
                request.session.username = user.username;
                response.redirect("/");
            } else {
                response.send('Incorrect Password');
            }
        } else {
            response.send('Incorrect Username');
        }
    } catch (error) {
        console.error('Error:', error);
        response.send('An error occurred');
    }
});


server.get('/logout', function(request, response, next) {

    request.session.destroy();

    response.redirect("/");

});


server.get('/admin', (req, res, next) => {
    res.render('admin');
    next;
})

server.get('/admin/reports', (req, res) => {
    res.render('reports')
});

server.get('/reports/packsinfo', (req, res) => {
    var q = 'select * from package;'
    db.query(q, (e, d) => {
        if (e) {
            throw e
        } else {
            res.render('packages_info.ejs', { data: d })
        }
    })
})

server.get('/reports/packsnumber', (req, res) => {
    var q = 'select category, count(*) as c from package group by category order by category;'
    db.query(q, (e, d) => {
        if (e) {
            throw e
        } else {
            res.render('packages_number', { data: d })
        }
    })
})




server.get('/admin/edit/:package_number', (req, res) => {
    var package_number = req.params.package_number;
    var q = `select * from package,transportation_method where package_number = ${package_number}`
    db.query(q, (e, d) => {
        if (e) throw e;
        else {
            res.render('editPackage.ejs', { Action: 'Edit', d: d[0] });
        }
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
    var fu = req.body.from_user;
    var tu = req.body.to_user;

    var s = req.body.status;

    q = `update package
    set weight = ${w}, destination = "${d}",
    dimensions = "${dimensions}",
    category = "${c}",
    insurance_amount = ${ia},
    delivery_date = "${dd}", from_user = "${fu}",
    to_user = "${tu}"
    where package_number = ${package_number}
     `;

    db.query(q, (error, data) => {
        if (error) { throw error; } else {
            //
        }
    })

    db.query(`update transportation_method set status = "${s}", id = ${package_number} where id = ${package_number}`, (e, d) => {
        if (e) { throw e; } else {
            res.redirect('/admin/reports');
        }
    })







})

server.get('/admin/remove/:package_number', (req, res) => {
    // This code is to remove a package from the system
    // DELETE FROM PACKAGE WHERE PACKAGE_NUMBER = (SELECTED_ID);
    var package_number = req.params.package_number;
    var q = `delete from package where package_number = ${package_number}`
    db.query(q, (e, d) => {
        if (e) { throw e } else {
            res.redirect('/admin/reports')
        }
    })
})

server.get('/admin/addpackage', (req, res) => {
    res.render('addPackage')
})

server.post('/add', (req, res) => {
    // This code is to add new package to the system
    // INSET INTO PACKAGE VALUES(...);
    var pn = req.body.package_number;
    var ss = pn
    var w = req.body.weight;
    var d = req.body.destination;
    var dimensions = req.body.dimensions;
    var c = req.body.category;
    var ia = req.body.insurance_amount;
    var dd = req.body.delivery_date;
    var fu = req.body.from_user;
    var tu = req.body.to_user;

    var q = `insert into package values(${pn},"${d}",${w},"${dimensions}","${c}",${ia},"${dd}","${fu}","${tu}")`

    db.query(q, (e, d) => {
        if (e) {
            throw e
        } else {
            //
        }
    })
    const s = ['in-transist', 'damaged', 'lost', 'Delayed', 'in-transist', 'in-transist', 'in-transist', 'in-transist', 'in-transist', 'in-transist'];
    const random = Math.floor(Math.random() * s.length);
    db.query(`update transportation_method set status = "${s[0]}" where id = ${ss}`, (e, d) => {
        if (e) { throw e; } else {
            res.redirect('/admin/reports')
        }

    })



})


///////////////////admin change user

server.get("/admin/users", function(request, response, next) {

    var query = "SELECT * FROM user_login ORDER BY user_id DESC";

    db.query(query, function(error, data) {

        if (error) {
            throw error;
        } else {
            response.render('users', { title: 'Users info', action: 'list', data: data });
        }

    });

});

server.get("/users/addU", function(request, response, next) {

    response.render("users", { title: 'Insert User', action: 'addU' });

});

server.post("/addU", function(request, response, next) {

    var id = request.body.user_id;

    var username = request.body.username;

    var password = request.body.user_password;

    var email = request.body.user_email;

    var role = request.body.role;

    var query = `
	INSERT INTO user_login 
	VALUES(${id}, "${username}","${email}", "${password}","${role}")
	`;

    db.query(query, function(error, data) {

        if (error) {
            throw error;
        } else {
            response.redirect("/");
        }

    });

});

server.get('/editU/:user_id', function(request, response, next) {

    var id = request.params.user_id;

    var query = `SELECT * FROM user_login WHERE user_id = ${id}`;

    db.query(query, function(error, data) {

        response.render('users', { title: 'Edit User', action: 'editU', data: data[0] });

    });

});

server.post('/editU/:user_id', function(request, response, next) {

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

    db.query(query, function(error, data) {

        if (error) {
            throw error;
        } else {
            response.redirect("/");
        }

    });

});

server.get('/deleteU/:user_id', function(request, response, next) {

    var id = request.params.user_id;

    var query = `
	DELETE FROM user_login WHERE user_id = ${id}
	`;

    db.query(query, function(error, data) {

        if (error) {
            throw error;
        } else {
            response.redirect("/");
        }

    });

});

////////////////pay
server.get('/reports/payment', (req, res) => {
    q = `select * from retail_center order by Id`
    db.query(q, (e, d) => {
        if (e) { throw e; } else {
            res.render('payment', { data: d })
        }
    })
})

server.get('/pay/:id', (req, res) => {
    var id = req.params.id;

    var q = `update retail_center set payment = 'T' where Id = ${id}`

    db.query(q, (e, d) => {
        if (e) {
            throw e;
        } else {
            res.redirect('/')
        }
    })
})

///////////////// admin reports

server.get('/reports/status', (req, res) => {
    var q = `select * from transportation_method order by id desc`
    db.query(q, (e, d) => {
        if (e) { throw e; } else {
            res.render('status', { data: d })
        }
    })
})


server.post('/reports/infoID', (req, res) => {
    var p = req.body.id;
    console.log(p);
    q = `select * from package join transportation_method on package.package_number = transportation_method.id where package_number = ${p}`
    db.query(q, (e, d) => {
        if (e) { throw e; } else {
            res.render('searchID', { data: d });
        }
    })

})
server.post('/reports/infocategory', (req, res) => {
    var p = req.body.category;
    var d1 = req.body.d11;
    var d2 = req.body.d22;
    q = `select * from package join transportation_method on package.package_number = transportation_method.id 
    where category = "${p}" and delivery_date between "${d1}" and "${d2}"`
    db.query(q, (e, d) => {
        if (e) { throw e; } else {
            res.render('searchID', { data: d });
        }
    })

})

server.post('/reports/infocity', (req, res) => {
    var p = req.body.dimensions;
    console.log(p);
    q = `select * from package join transportation_method on package.package_number = transportation_method.id where destination = "${p}"`
    db.query(q, (e, d) => {
        if (e) { throw e; } else {
            res.render('searchID', { data: d });
        }
    })

})

server.post('/reports/infodate', (req, res) => {
    var p = req.body.date;
    console.log(p);
    q = `select * from package join transportation_method on package.package_number = transportation_method.id where delivery_date = "${p}"`
    db.query(q, (e, d) => {
        if (e) { throw e; } else {
            res.render('searchID', { data: d });
        }
    })

})

server.post('/reports/infostatus', (req, res) => {
    var p = req.body.status;
    var d1 = req.body.d1;
    var d2 = req.body.d2;
    console.log(d1, d2);
    q = `select * from package join transportation_method on package.package_number = transportation_method.id
    where status = "${p}" and delivery_date between "${d1}" and "${d2}"`
    db.query(q, (e, d) => {
        if (e) { throw e; } else {
            res.render('searchID', { data: d });
        }
    })
})

server.post('/reports/numberofpacks', (req, res) => {
    var d1 = req.body.d11;
    var d2 = req.body.d22;
    var c = req.body.category;
    q = `select * from package
    where delivery_date between "${d1}" and "${d2}" and category = "${c}"`
    db.query(q, (e, d) => {
        if (e) { throw e; } else {
            res.render('searchID', { data: d });
        }
    })

})

server.post('/reports/all', (req, res) => {
    var t1 = req.body.t1; //cati
    var t2 = req.body.t2; // location
    var t3 = req.body.t3; //status

    q = `select * from package join transportation_method on package.package_number = transportation_method.id
    where category = "${t1}" and destination = "${t2}" and status = "${t3}"`
    db.query(q, (e, d) => {
        if (e) { throw e; } else {
            res.render('searchID', { data: d });
        }
    })

})


///////////////////////// Customer


server.get('/customer/:ID', (req, res) => {
    var u = req.params.ID;
    res.render('customer', { user: u })
})


server.get('/customer/:ID/getmypacks', (req, res) => {
    var username = req.params.ID;
    db.query(`select * from package where from_user = "${username}"`, (e, d) => {
        console.log(d);
        if (e) { throw e } else {
            res.render('packages_infoU', { data: d })
        }
    })
})

server.get('/customer/:ID/addpackage', (req, res) => {
    res.render('addpackageU')
})

server.post('/addpu', (req, res) => {
    var d = req.body.destination;
    var w = req.body.weight;
    var dd = req.body.dimensions;
    var c = req.body.category;
    var f = req.body.from_user;
    var t = req.body.to_user;
    const date = new Date();

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    // This arrangement can be altered based on how we want the date's format to appear.
    let currentDate = `${year}-${month}-${day}`;

    db.query(`Insert into package(destination,weight,dimensions,category,insurance_amount,delivery_date,from_user,to_user) 
    values("${d}",${w},"${dd}","${c}",${w},"${currentDate}","${f}","${t}")`, (e, d) => {
        if (e) { throw e; } else {
            res.redirect('/')
        }
    })



})

server.get('/customer/:ID/rpacks', (req, res) => {
    var username = req.params.ID;
    db.query(`select * from package join retail_center on package.package_number = retail_center.Id
     join transportation_method on package.package_number = transportation_method.id where package.to_user = "${username}" or package.from_user = "${username}"`, (e, d) => {
        if (e) { throw e } else {
            res.render('rpacks', { data: d })
        }
    })
})

server.get('/customer/:ID/update', (req, res) => {
    var u = req.params.ID
    console.log(u);

    q = `select * from user_login where username = "${u}" `
    db.query(q, (e, d) => {
        if (e) { throw e; } else {
            res.render('updateU', { data: d[0] })
        }
    })

})

server.post('/customer/:ID/update', (req, res) => {
    var username = req.body.username;
    var email = req.body.user_email;
    var password = req.body.user_password;
    q = `update user_login set username = "${username}", user_password = "${password}", user_email = "${email}" where username = "${username}"`
    db.query(q, (e, d) => {
        if (e) { throw e } else {
            res.redirect('/')
        }
    })

})

server.listen(() => {
    server.listen(port, () => {
        console.log(`http://localhost:${port}`);
    })
});