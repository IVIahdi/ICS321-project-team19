const mysql = require('mysql')

var connection = mysql.createConnection({
host: 'localhost',
user: 'root',
password: 'root',
database: 'IVI'
});

connection.connect(function(err){
    if (err){throw err;}
    else{console.log("Connected");}
});

module.exports = connection;