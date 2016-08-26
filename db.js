/** Bookshelf mysql connnection */
var Bookshelf = require('bookshelf');

var config = {
    host: 'localhost',  // your host
    user: 'root', // your database user
    password: 'laptop', // your database password
    database: 'devicesignout',
    charset: 'UTF8_GENERAL_CI' //Dont know what this if for
};

var DB = Bookshelf.initialize({
    client: 'mysql', 
    connection: config
});

module.exports.DB = DB;
