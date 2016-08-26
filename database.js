/* Code to establish the mysql connection*/
var express = require('express');
var mysql = require('mysql');
var express = require('express');
var path = require('path');
var app = express();



var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'laptop',	
    database: 'devicesignout'
});

/** Try to connect to the database **/
connection.connect(function(err)
        {
            /** In case the connection goes wrong **/
            if(err)
{
    console.log(" Error connecting into the database");
    return;
}
console.log(" Connection has been established");
});

module.exports.connection = connection;
