// vendor library
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');

// For the devices part 
/* This is just to test how to link node.js */
var express = require('express');
var mysql = require('mysql');
var express = require('express');
var path = require('path');
var app = express();

var database = require("./database");


// custom library
// model
var Model = require('./model');
var connection = database.connection;

/** Now to begin querying from the database **/
connection.query('USE devicesignout');

/* This should store the object of the current user  **/
var currUser;

// Device Category home page 
var deviceCategory = function(req, res, next) {
    if(!req.isAuthenticated()) {
        res.redirect('/Login');
    } else {

        var user = req.user;

        if(user !== undefined) {
            user = user.toJSON();
        }
        //res.write(" Something ");
        /** Figure out what to do about the title **/
        res.render('deviceCategoryPage', {user: user});
    }
};

var deviceName;// Name of the device that should be checked out 
var getDeviceNamePost = function(req, res)
{      
    console.log(" WE FINALLY DID IT!");

    console.log(" In here ");
    var deviceId = JSON.stringify((req.body.deviceId));
    console.log(" The device Id is " + deviceId);
    if(typeof(deviceId) !== 'undefined')
    {
        console.log(" Before the query "); 
        connection.query('SELECT * FROM devicetable WHERE id='+ deviceId, function(err, row){
            if(err)
            throw err;
        console.log(" The amount " + row.length);
        if(row.length == 0)
        {  
            checkOutMessage = 'Does Not Exist';  
            res.send(JSON.stringify(checkOutMessage));      
        }
        else
        {     
            deviceName = row[0].deviceName; 
            res.send(JSON.stringify(deviceName));
        }           
        });
    }
}

/** handles the updates of the database **/
var deviceCategoryPost = function(req, res, next){
    console.log(" The form has been submitted " + req.body.checkOut);
    if(!req.isAuthenticated() && req.body.checkOut == "true"){
        res.redirect('/Login');
    }
    else
    {
        var device = req.body;
        console.log(" Are we checking out ? " + device.checkOut);
        if(typeof(device.checkOutId) !== 'undefined' && device.checkOut == "true")
        {             
            console.log(" The device id is " + device.checkOutId);            
            connection.query("SELECT * FROM employees WHERE username='" + currUser.username + "'", function(err, row){
                if(err)
                throw err;
            if(row.length != 0)
            {
                var employeeName = "";
                employeeName = employeeName.concat(String(row[0].firstname)," ", String(row[0].lastname));
                console.log(" The employee name is " + employeeName);
                connection.query('UPDATE devicetable SET currInUseBy=?, available=? WHERE id=?',[employeeName ,'N' ,String(device.checkOutId)], function(err, row){
                    if(err)
                    throw err;
                });
                res.send(JSON.stringify(deviceName));
            }
            else /** Not possible bur for debugging purposes **/
            {
                console.log(" Cannot find employee?!! ");
            }       
            });
        }
        /** This is the case where the user wants to return the device from the home page **/
        else if(typeof(device.checkOutId) !== 'undefined' && device.checkOut == "false")
        {
            console.log(" We are returning ");
            connection.query("UPDATE devicetable SET available = 'Y', currInUseBy = 'Nobody' WHERE id=" + device.checkOutId); 
            res.send(JSON.stringify(deviceName));  
        }
    }
};

// Login Page
// GET
var login = function(req, res, next) {
    if(req.isAuthenticated()) 
    {
        res.redirect('/');
    }
    else
    {
        // console.log(" Initially not authenticated ");
        res.render('loginPage', {title: 'Login'});
    }
};

// Login Page
// POST
var loginPost = function(req, res, next) {   
    var ret = req.body;  
    /** If just trying to return a device **/
    console.log(" Is the return defined ? " + (typeof (ret.returnId) !== 'undefined'));
    console.log(" The return Id is " + ret.returnId);
    console.log(" The temp username is " + ret.username);
    if(typeof (ret.returnId) !== 'undefined')
    {
        connection.query('SELECT * FROM devicetable WHERE id='+ ret.returnId, function(err, row)
                {
                    if(err)
            throw err;
        if(row.length == 0)
            return res.render('loginPage', {title: 'Log in', returnMessage: ' Could not find the device with the ID entered '});
        else
        {
            connection.query("UPDATE devicetable SET available = 'Y', currInUseBy = 'Nobody' WHERE id=" + ret.returnId);
            return res.render('loginPage',{title: 'Log in', returnMessage: ' You just returned the ' + row[0].deviceName + ' !'});
        }
                });
    }
    else
    {     
        var user = req.body;  
        console.log(" The user name is " + user.username);  
        passport.authenticate('local', { successRedirect: '/',
            failureRedirect: '/Login'}, function(err, user, info) {
                console.log("In here 1 ");
                if(err) {
                    console.log(" error case ");
                    return res.render('loginPage', {title: 'Log in ', errorMessage: err.message});
                } 

                if(!user) {
                    console.log(" bad user case ");
                    return res.render('loginPage', {title: 'Log in', errorMessage: info.message});
                }
                return req.logIn(user, function(err) {
                    if(err) {
                        console.log(" Logged in but still failed ");
                        return res.render('loginPage', {title: 'Log in', errorMessage: err.message});
                    } 
                    else {
                        currUser = user;
                        return res.redirect('/');
                    }
                });
            })(req, res, next);
    }
};

// sign up
// GET
var register = function(req, res, next) {
    if(req.isAuthenticated()) {
        res.redirect('/');
    } else {
        res.render('registerPage', {title: 'Register'});
    }
};
// sign up
// POST
var registerPost = function(req, res, next) {
    var user = req.body;
    console.log(" The req body " + req.body);
    var usernamePromise = null;
    usernamePromise = new Model.User({username: user.username}).fetch();
    console.log(" Already exist username " + usernamePromise.username);

    return usernamePromise.then(function(model) {
        if(model) { //If the user name already exists 
            console.log(" Existent model " + model + " " + model.firstname);
            res.render('registerPage', {title: 'Register', errorMessage: 'Error: Username already exists!'});
        } else {
            //****************************************************//
            // MORE VALIDATION GOES HERE(E.G. PASSWORD VALIDATION)
            //****************************************************//
            var password = user.password;
            var hash = bcrypt.hashSync(password);
            console.log("username" + user.username);
            console.log("lastname " + user.lastname);
            console.log("firstname " + user.firstname);
            console.log("password " + user.password);
            console.log("confirmed password " + user.password_confirm);

            if(user.password != user.password_confirm)
            {
                res.render('registerPage',{title: 'Register', errorMessage: 'Error: Passwords do not match!'});               
            }
            else
            {

                var registerUser = new Model.User({username: user.username, firstname: user.firstname, lastname: user.lastname, password: hash});     

                console.log(" Just wouldnt save now ");
                registerUser.save(null, {method: 'insert'}).then(function(model) {
                    // sign in the newly registered user
                    console.log(" Just got in here ");
                    if(model)
                    {
                        console.log(" So we have succedfully saved ?");
                        console.log(" We just added " + JSON.stringify(model));
                    }           
                    loginPost(req, res, next); 
                    }).otherwise(function(err){console.log(" failure " + err)}); 
            }
        }
    });
};
// Logout
var logOut = function(req, res, next) {
    console.log(" The logout button was pressed ");
    if(!req.isAuthenticated()) {
        notFound404(req, res, next);
    } else {
        req.logout();
        res.redirect('/Login');
    }
};


/** Seperate connection for the devices **/ 

/** For the Ipads **/
var iPadsVar = function(req,res){    
    if(!req.isAuthenticated())
    {
        res.redirect('/Login');
    }
    else
    {       
        connection.query('SELECT * FROM devicetable WHERE deviceCategory=? AND available=?',['iPad','Y'],function(err, rows){
            initRows = rows;
            if(err)
            throw err;        
        res.render('initDeviceTablePage', {user: currUser.username, rows : rows, title:'Available iPad devices', link:'/iPadsPageMore'});  
        });  
    }    
};

var iPadsMoreVar = function(req,res){    
    if(!req.isAuthenticated())
    {
        res.redirect('/Login');
    }
    else
    {
        connection.query('SELECT * FROM devicetable WHERE deviceCategory=?',['iPad'], function(err, rows){
            if(err)
            throw err;        
        res.render('deviceTablePage', {user: currUser.username, rows : rows, title:'All iPad devices', link:'/iPadsPage'});  
        });  
    }    
};
/** For the ipods or iphones **/
var iPodsOrIPhonesVar = function(req,res){    
    if(!req.isAuthenticated())
    {
        res.redirect('/Login');
    }
    else
    {       
        connection.query('SELECT * FROM devicetable WHERE deviceCategory=? AND available=?',['iPods/iPhones','Y'],function(err, rows){
            initRows = rows;
            if(err)
            throw err;        
        // console.log(" About to get the right title ");
        res.render('initDeviceTablePage', {user: currUser.username, rows : rows, title:'Available iPod/iPhone devices', link:'/iPodsOrIPhonesPageMore'});  
        });  
    }    
};
var iPodsOrIPhonesMoreVar = function(req,res){    
    if(!req.isAuthenticated())
    {
        res.redirect('/Login');
    }
    else
    {      
        connection.query('SELECT * FROM devicetable WHERE deviceCategory=?',['iPods/iPhones'], function(err, rows){
            if(err)
            throw err;        
        res.render('deviceTablePage', {user: currUser.username, rows : rows, title:'All iPod/iPhone devices', link:'/iPodsOrIPhonesPage'});  
        });  
    }    
};
/** For the android phones **/
var androidPhonesVar = function(req,res){    
    if(!req.isAuthenticated())
    {
        res.redirect('/Login');
    }
    else
    {       
        connection.query('SELECT * FROM devicetable WHERE deviceCategory=? AND available=?',['androidPhones','Y'],function(err, rows){
            initRows = rows;
            if(err)
            throw err;        
        res.render('initDeviceTablePage', {user: currUser.username, rows : rows, title:'Available Android Phones', link:'/androidPhonesPageMore'});  
        });  
    }    
};
var androidPhonesMoreVar = function(req,res){    
    if(!req.isAuthenticated())
    {
        res.redirect('/Login');
    }
    else
    {      
        connection.query('SELECT * FROM devicetable WHERE deviceCategory=?',['androidPhones'], function(err, rows){
            if(err)
            throw err;        
        res.render('deviceTablePage', {user: currUser.username, rows : rows, title:'All Android Phones', link:'/androidPhonesPage'});  
        });  
    }    
};
/** For the android tablets **/
var androidTabletsVar = function(req,res){    
    if(!req.isAuthenticated())
    {
        res.redirect('/Login');
    }
    else
    {       
        connection.query('SELECT * FROM devicetable WHERE deviceCategory=? AND available=?',['androidTablets','Y'],function(err, rows){
            initRows = rows;
            if(err)
            throw err;        
        res.render('initDeviceTablePage', {user: currUser.username, rows : rows, title:'Available Android Tablets', link:'/androidTabletsPageMore'});  
        });  
    }    
};
var androidTabletsMoreVar = function(req,res){    
    if(!req.isAuthenticated())
    {
        res.redirect('/Login');
    }
    else
    {      
        connection.query('SELECT * FROM devicetable WHERE deviceCategory=?',['androidTablets'], function(err, rows){
            if(err)
            throw err;        
        res.render('deviceTablePage', {user: currUser.username, rows : rows, title:'All Android Tablets', link:'/androidTabletsPage'});  
        });  
    }    
};
/** For mozilla/amazon phones **/
var mozillaOrAmazonVar = function(req,res){    
    if(!req.isAuthenticated())
    {
        res.redirect('/Login');
    }
    else
    {       
        connection.query('SELECT * FROM devicetable WHERE deviceCategory=? AND available=?',['mozilla/amazon','Y'],function(err, rows){
            initRows = rows;
            if(err)
            throw err;        
        res.render('initDeviceTablePage', {user: currUser.username, rows : rows, title:'Available Mozilla/Amazon Phones', link:'/mozillaOrAmazonPageMore'});  
        });  
    }    
};
var mozillaOrAmazonMoreVar = function(req,res){    
    if(!req.isAuthenticated())
    {
        res.redirect('/Login');
    }
    else
    {      
        connection.query('SELECT * FROM devicetable WHERE deviceCategory=?',['mozilla/amazon'], function(err, rows){
            if(err)
            throw err;        
        res.render('deviceTablePage', {user: currUser.username, rows : rows, title:'All Mozilla/Amazon Phones', link:'/mozillaOrAmazonPage'});  
        });  
    }    
};
/** For the amazon tablets **/
var amazonTabletsVar = function(req,res){    
    if(!req.isAuthenticated())
    {
        res.redirect('/Login');
    }
    else
    {       
        connection.query('SELECT * FROM devicetable WHERE deviceCategory=? AND available=?',['amazonTablets','Y'],function(err, rows){
            initRows = rows;
            if(err)
            throw err;        
        res.render('initDeviceTablePage', {user: currUser.username, rows : rows, title:'Available Amazon Tablets ', link:'/amazonTabletsPageMore'});  
        });  
    }    
};
var amazonTabletsMoreVar = function(req,res){    
    if(!req.isAuthenticated())
    {
        res.redirect('/Login');
    }
    else
    {      
        connection.query('SELECT * FROM devicetable WHERE deviceCategory=?',['amazonTablets'], function(err, rows){
            if(err)
            throw err;        
        res.render('deviceTablePage', {user: currUser.username, rows : rows, title:'All Amazon Tablets', link:'/amazonTabletsPage'});  
        });  
    }    
};
/** For the windows devices**/
var windowsVar = function(req,res){    
    if(!req.isAuthenticated())
    {
        res.redirect('/Login');
    }
    else
    {       
        connection.query('SELECT * FROM devicetable WHERE deviceCategory=? AND available=?',['windows','Y'],function(err, rows){
            initRows = rows;
            if(err)
            throw err;        
        res.render('initDeviceTablePage', {user: currUser.username, rows : rows, title:'Available Windows Devices', link:'/windowsPageMore'});  
        });  
    }    
};
var windowsMoreVar = function(req,res){    
    if(!req.isAuthenticated())
    {
        res.redirect('/Login');
    }
    else
    {      
        connection.query('SELECT * FROM devicetable WHERE deviceCategory=?',['windows'], function(err, rows){
            if(err)
            throw err;        
        res.render('deviceTablePage', {user: currUser.username, rows : rows, title:'All Windows Devices', link:'/windowsPage'});  
        });  
    }    
};


// 404 not found
var notFound404 = function(req, res, next) {
    res.status(404);
    res.render('404', {title: '404 Not Found'});
}; 



// export functions
/**************************************/
// index
module.exports.deviceCategory = deviceCategory;

module.exports.getDeviceNamePost = getDeviceNamePost;

module.exports.deviceCategoryPost = deviceCategoryPost;

// Log in
// GET
module.exports.login = login;
// POST
module.exports.loginPost = loginPost;

// GET
module.exports.register = register;
// POST
module.exports.registerPost = registerPost;

// sign out
module.exports.logOut = logOut;

// 404 not found
module.exports.notFound404 = notFound404;

// For the ipads page
module.exports.iPadsVar = iPadsVar;

module.exports.iPadsMoreVar = iPadsMoreVar;

module.exports.iPodsOrIPhonesVar = iPodsOrIPhonesVar;

module.exports.iPodsOrIPhonesMoreVar = iPodsOrIPhonesMoreVar;

module.exports.androidPhonesVar = androidPhonesVar;

module.exports.androidPhonesMoreVar = androidPhonesMoreVar;

module.exports.androidTabletsVar = androidTabletsVar;

module.exports.androidTabletsMoreVar = androidTabletsMoreVar;

module.exports.mozillaOrAmazonVar = mozillaOrAmazonVar;

module.exports.mozillaOrAmazonMoreVar = mozillaOrAmazonMoreVar;

module.exports.amazonTabletsVar = amazonTabletsVar;

module.exports.amazonTabletsMoreVar = amazonTabletsMoreVar;

module.exports.windowsVar = windowsVar;

module.exports.windowsMoreVar = windowsMoreVar;

