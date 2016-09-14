// vendor libraries
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var express = require('express');
var mysql = require('mysql');
var express = require('express');
var path = require('path');
var app = express();



// custom libraries
var database = require("./database");
var Model = require('./model');
var connection = database.connection;

/** Now to begin querying from the database **/
connection.query('USE devicesignout');

/* This should store the object of the current user  **/
var currUser;
/** This variable is to store whether the user is an admin or not **/
var admin;

var deviceName;// Name of the device that is being operated on

var currId; // The ID of the device whose details are about to be modified 


// Device Category home page 
var deviceCategory = function(req, res, next) {
    if(!req.isAuthenticated()) {
        res.redirect('/Login');
    } else {
        var user = req.user;
        if(user !== undefined) {
            user = user.toJSON();
        }
        /** Check if the user is and adminsistrator **/
        connection.query("SELECT * FROM employees WHERE username=? AND admin='Y'", [currUser.username], 
            function(err, rows)
            {
                if(err)
                    throw err;
                if(rows.length > 0)
                {
                    admin =  "true";
                }
                else
                {
                    admin = "false";
                }
                console.log(" The actual admin is " + admin);
                res.render('deviceCategoryPage', {user: user, admin : admin});
            });
    }
};
var deviceCategoryPost = function(req, res, next){
    console.log(" The form has been submitted " + req.body.checkOut);
    if(!req.isAuthenticated() && req.body.checkOut == "true"){
        res.redirect('/Login');
    }
    else
    {
        var device = req.body;
        console.log(" Are we checking out ? " + device.checkOut);
        if(typeof(device.checkOutId) !== 'undefined' && device.checkOut == "checkOut")
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
            else /** Not possible but for debugging purposes **/
            {
                console.log(" Cannot find employee?!! ");
            }       
            });
        }
        /** This is the case where the user wants to return the device from the home page **/
        else if(typeof(device.checkOutId) !== 'undefined' && device.checkOut == "return")
        {
            console.log(" We are returning ");
            connection.query("UPDATE devicetable SET available = 'Y', currInUseBy = 'Nobody' WHERE id=" + device.checkOutId); 
            res.send(JSON.stringify(deviceName));  
        }
    }
};


/* This function is used to get the full device name for the 
 * dialogues **/
var getDeviceNamePost = function(req, res)
{      
    console.log(" WE FINALLY DID IT!");

    console.log(" In here ");
    var deviceId = JSON.stringify((req.body.deviceId));
    var op = req.body.op;
    console.log(" The device Id is " + deviceId);
    if(typeof(deviceId) !== 'undefined')
    {
        console.log(" Before the query the op " + op); 
        if(op == 'remove') /** The name of the device that is to be removed **/
        {
            //Note: In the case, the deviceId variable would be holding the user inputed device name
            connection.query('SELECT * FROM devicetable WHERE deviceName='+ deviceId, function(err, row){
                if(err)
                    throw err;
            console.log(" The remove amount " + row.length);
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
        else if (op == "modify")// Basically do nothing in the case of modify
        {
            console.log(" In the correct if ");
            res.send(JSON.stringify("modify"));           
        }
        else /** In the case of checkout or return **/
        {
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
}


/* This gets the full name for the user that the dialogues 
 * are going to use to interact with the administrator **/
var getUserNamePost = function(req, res)
{
    connection.query("SELECT * from employees where username=?",[req.body.username], 
            function(err, rows){
                if(err)
                    throw err;
                var data = {firstName : "", lastName : ""};
                console.log(" The server username " + req.body.username);
                if(rows.length == 0)
                {
                    data.firstName = "Does not exist ";
                    res.send(JSON.stringify(data));
                }
                else
                {
                    data.firstName = rows[0].firstname;
                    data.lastName = rows[0].lastname;
                    res.send(JSON.stringify(data));
                }
            });
};


// Login Page
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


var register = function(req, res, next) {
    if(req.isAuthenticated()) {
        res.redirect('/');
    } else {
        res.render('registerPage', {title: 'Register'});
    }
};
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
            var password = user.password;
            var hash = bcrypt.hashSync(password);

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
        res.render('initDeviceTablePage', {admin : admin , user: currUser.username, rows : rows, title:'Available iPad devices', link:'/iPadsPageMore'});  
        });  
    }    
};
/* The "More" keyword means that this is what renders the page when the user selects 
 * more details **/
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
        res.render('deviceTablePage', {admin : admin , user: currUser.username, rows : rows, title:'All iPad devices', link:'/iPadsPage'});  
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
        res.render('initDeviceTablePage', {admin : admin , user: currUser.username, rows : rows, title:'Available iPod/iPhone devices', link:'/iPodsOrIPhonesPageMore'});  
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
        res.render('deviceTablePage', {admin : admin , user: currUser.username, rows : rows, title:'All iPod/iPhone devices', link:'/iPodsOrIPhonesPage'});  
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
        res.render('initDeviceTablePage', {admin : admin , user: currUser.username, rows : rows, title:'Available Android Phones', link:'/androidPhonesPageMore'});  
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
        res.render('deviceTablePage', {admin : admin , user: currUser.username, rows : rows, title:'All Android Phones', link:'/androidPhonesPage'});  
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
        res.render('initDeviceTablePage', {admin : admin , user: currUser.username, rows : rows, title:'Available Android Tablets', link:'/androidTabletsPageMore'});  
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
        res.render('deviceTablePage', {admin : admin , user: currUser.username, rows : rows, title:'All Android Tablets', link:'/androidTabletsPage'});  
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
        res.render('initDeviceTablePage', {admin : admin , user: currUser.username, rows : rows, title:'Available Mozilla/Amazon Phones', link:'/mozillaOrAmazonPageMore'});  
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
        res.render('deviceTablePage', {admin : admin , user: currUser.username, rows : rows, title:'All Mozilla/Amazon Phones', link:'/mozillaOrAmazonPage'});  
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
        res.render('initDeviceTablePage', {admin : admin , user: currUser.username, rows : rows, title:'Available Amazon Tablets ', link:'/amazonTabletsPageMore'});  
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
        res.render('deviceTablePage', {admin : admin , user: currUser.username, rows : rows, title:'All Amazon Tablets', link:'/amazonTabletsPage'});  
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
        res.render('initDeviceTablePage', {admin : admin , user: currUser.username, rows : rows, title:'Available Windows Devices', link:'/windowsPageMore'});  
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
        res.render('deviceTablePage', {admin : admin , user: currUser.username, rows : rows, title:'All Windows Devices', link:'/windowsPage'});  
        });  
    }    
};


/** This renders the administrator home page **/
var adminVar = function(req, res){
    if(!req.isAuthenticated())
    {
        res.redirect('/Login');
    }
    else if(admin == 'false')
    {
        res.redirect('/adminReject');
    }
    else
    {
        res.render('adminPage', {user: currUser}); 
    }
};


/** This renders the page that lets the administrator add a device to the database **/
var addDeviceVar = function(req, res){
    if(!req.isAuthenticated())
    {
        res.redirect('/Login');
    }
    else if(admin == 'false')
    {
        res.redirect('/adminReject');
    }
    else
    {
        res.render('addDevicePage', {user: currUser}); 
    }
};
var addDevicePost = function(req, res){
    if(!req.isAuthenticated())
    {
        res.redirect('/Login');
    }
    else
    {
        console.log(" In add Device post ");
        var newDev = req.body; 
        var deviceName = newDev.deviceName;
        var id = newDev.deviceId;
        console.log(" The device id is " + id);
        var deviceCategory = parseDeviceCategory(newDev.deviceCategory);
        var operatingSystem = newDev.operatingSystem;
        var visualDescription = newDev.visualDescription;
        var resolution = newDev.resolution;
        var aspectRatio = newDev.aspectRatio;
        var additionalDetails = newDev.additionalDetails;
        
        /** TODO make sure that the user has not inserted something to the database **/
        if(typeof id !== 'undefined')
        {
            connection.query('INSERT INTO devicetable VALUES (?,?,?,?,?,?,?,?,?,?,NULL)',[id, deviceName,
                    deviceCategory,operatingSystem, visualDescription, resolution, aspectRatio, additionalDetails,
                    'Y', 'Nobody'], function(err){
                        if(err)
                            throw err;
                        res.send(JSON.stringify(deviceName));
                    });
        }
    }
};


/* This function handles the device names that would be suggested to the user
 * as the user manually enter the name of the device **/
var searchVar = function(req, res){
    console.log(" In the search var ");
    console.log(" The key " + req.query.key);
    connection.query('SELECT deviceName from devicetable WHERE deviceName LIKE "%'+req.query.key+'%"',
            function(err, rows, fields)
            {
                if(err)
                    throw err;
                var data=[];
                for(i=0;i<rows.length;i++)
                {
                    data.push(rows[i].deviceName);
                }
                res.send(JSON.stringify(data));
            });
};


/* This function returns the username that the type ahead function
 * would use as suggestions as the user is entering the user name 
 * for administrative purposes **/
var searchNameVar = function(req, res){
    console.log(' In the search name var ');
    connection.query('SELECT userName from employees WHERE userName LIKE "%' + req.query.key + '%"',
            function(err, rows)
            {
                if(err)
                    throw err;
                var data = [];
                for(i = 0; i < rows.length; i++)
                {
                    data.push(rows[i].userName);
                }
                res.send(JSON.stringify(data));
            });
};


var removeDeviceVar = function(req, res){
    if(!req.isAuthenticated())
    {
        res.redirect('/Login');
    }
    else if(admin == 'false')
    {
        res.redirect('/adminReject');
    }
    else
    {
        res.render('removeDevicePage',{user: currUser});
    }
};
var removeDevicePost = function(req, res){
    var deviceName;
    if(!req.isAuthenticated())
    {
        res.redirect('/Login');
    }
    else
    {
        connection.query('SELECT * from devicetable WHERE deviceName=?', [req.body.deviceName],
                function(err, rows)
                {
                    if(err)
                        throw err;
                    console.log(" The amount is " + rows.length);
                    deviceName = rows[0].deviceName;
                    console.log(" The deviceName is " + deviceName);
                    connection.query('DELETE FROM devicetable WHERE deviceName=?', req.body.deviceName,
                    function(err, delRow)
                    {
                        if(err)
                            throw err;
                    });
                    console.log("Done deleting " + deviceName);
                    res.send(JSON.stringify(deviceName));
                }); 
    }
};


/* The user would be interacting with these two functions when they
 * want to modiy the details of a device **/
var modifyDeviceVar = function(req, res)
{
    if(!req.isAuthenticated())
    {
        res.redirect('/Login');
    }
    else if(admin == 'false')
    {
        res.redirect('/adminReject');
    }
    else
    {
        res.render('modifyDevicePage',{user:currUser, deviceId : "n/a", deviceName : "n/a",
            operatingSystem : "n/a", visualDescription : "n/a", resolution: "n/a", 
            aspectRatio: "n/a", additionalDetails: "n/a"});
    }
};
var modifyDevicePost = function(req, res)
{
    if(!req.isAuthenticated())
    {
        res.redirect('/Login');
    }
    else
    {
        console.log(" about the get the original " + currId);
        var deviceName, operatingSystem, visualDescription, resolution, aspectRatio, additionalDetails;
        connection.query('SELECT * FROM devicetable WHERE id=?', currId,
                function(err,rows)
                {
                    if(err)
                        throw err;
                    /* The main idea here is to replace every field in the row pertaining to the current device 
                     * that was entered by the user, and then any field that the user left blank would retain its 
                     * original value **/
                    if(typeof req.body.deviceId === 'undefined' || req.body.deviceId == "")
                        deviceId = rows[0].id;
                    else
                        deviceId = req.body.deviceId;
                    if(typeof req.body.deviceName === "undefined" || req.body.deviceName == "")
                    {
                        console.log(" should be in here ")
                        deviceName = rows[0].deviceName;//Use original value
                    }
                    else
                    {
                        console.log(" Why am I in here ");
                        deviceName = req.body.deviceName;//Use the entered value

                    }
                    if(typeof req.body.operatingSytem === "undefined" || req.body.operatingSystem == "")
                        operatingSystem = rows[0].operatingSystem;
                    else
                        operatingSystem = req.body.operatingSystem;
                    if(typeof req.body.visualDescription === "undefined" || req.body.visualDescription == "")
                        visualDescription = rows[0].visualDescription;
                    else
                        visualDescription = req.body.visualDescription;
                    if(typeof req.body.resolution === "undefined" || req.body.resolution == "")
                        resolution = rows[0].resolution;
                    else
                        resolution = req.body.resolution;
                    if(typeof req.body.aspectRatio === "undefined" || req.body.aspectRatio == "")
                        aspectRatio = rows[0].aspectRatio;
                    else
                        aspectRatio = req.body.aspectRatio;
                    if(typeof req.body.additionalDetails === "undefined" || req.body.additionalDetails == "")
                        additionalDetails = rows[0].additionalDetails;
                    else
                        additionalDetails = req.body.additionalDetails;
                    console.log(" About to delete where the id = " + currId + " the deviceName is " + deviceName); 
                    connection.query('DELETE FROM devicetable WHERE id=?', currId, 
                        function(err, dummy)
                        {
                           if(err)
                                throw err;                            
                                connection.query('INSERT INTO devicetable VALUES (?,?,?,?,?,?,?,?,?,?,NULL)',[deviceId, deviceName,
                                rows[0].deviceCategory, operatingSystem, visualDescription, resolution, aspectRatio, additionalDetails,
                                rows[0].available, rows[0].currInUseBy], 
                                function(err)
                                {
                                    if(err)
                                        throw err;    
                                    res.send("Success");
                                });
                        });
                });
    }
};


/* This is to load all the old device details of the device that the user 
 * wants to modify its fields. **/
var loadDetailsPost = function(req,res)
{
    console.log(" In load details ");
    if(!req.isAuthenticated())
    {
        res.redirect('/Login');
    }
    else
    {
        connection.query('SELECT * FROM devicetable WHERE deviceName=?',[req.body.deviceName],
                function(err, rows)
                {
                    if(err)
                        throw err;
                    if(rows.length  == 0)
                    {
                        res.send(JSON.stringify("Does not exist"));
                        console.log(" I should be in here ");
                    }
                    else
                    {
                        currId = rows[0].id;
                        var data =  {deviceId : rows[0].id, deviceName : rows[0].deviceName , operatingSystem : rows[0].operatingSystem, visualDescription : rows[0].visualDescription,
                        resolution : rows[0].resolution, aspectRatio : rows[0].aspectRatio, additionalDetails : rows[0].additionalDetails};
                        res.send(JSON.stringify(data));
                    }
                });
    }
};


/* This is the page that would be rendered if a user with no adminstrator
 * priviledges is trying to access any of the pages reserved for an administrator **/
var adminRejectVar = function(req, res)
{
    console.log(" In admin reject ");
    if(!req.isAuthenticated())
    {
        res.redirect('/Login');
    }
    else
    {
        res.render('adminRejectPage', {user : currUser.username, admin : admin}); 
    }
};


/* The user would be interacting with the next two function when they
 * are trying to add another user as an admin **/
var addAdminVar = function(req, res)
{
    console.log(" In add admin var ");
    if(!req.isAuthenticated())
    {
        res.redirect('/Login');
    }
    else if(admin == 'false')
    {
        res.redirect('/adminReject');
    }
    else
    {
        res.render('addAdminPage', {user: currUser.username, admin : admin}); 
    }
};
var addAdminPost = function(req,res)
{
    if(!req.isAuthenticated())
    {
        res.redirect('/Login');
    }
    else if(admin == 'false')
    {
        res.redirect('/adminReject');
    }
    else
    {
        console.log(" about the execute the add admin post query ");
       connection.query("UPDATE employees SET admin='Y' WHERE username=?",[req.body.username],
                function(err, rows)
                {
                    if(err)
                        throw err;
                    res.send(JSON.stringify(req.body.username));
                });
    }
}


/** This function is needed because the format of the 
 * device categories, as presented in any of the forms, is not the same as it apears in the database.
 * This is simply to parse the intended device category that would be used to interact with the database **/
function parseDeviceCategory(deviceCategory)
{
    if(deviceCategory == 'IPads')
        return 'iPad';
    else if(deviceCategory == 'IPods/IPhones')
        return 'iPods/iPhones';
    else if(deviceCategory == 'Amazon Tablets')
        return 'amazonTablets';
    else if(deviceCategory == 'Mozilla/Amazon Phones')
        return 'mozilla/amazon';
    else if(deviceCategory == 'Android Phones')
        return 'androidPhones';
    else if (deviceCategory == 'Windows')
        return 'windows';
    else if(deviceCategory == 'Android Tablets')
        return 'androidTablets';

}


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

module.exports.login = login;

module.exports.loginPost = loginPost;

module.exports.register = register;

module.exports.registerPost = registerPost;

module.exports.logOut = logOut;

module.exports.notFound404 = notFound404;

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

module.exports.adminVar = adminVar;

module.exports.addDeviceVar = addDeviceVar;

module.exports.addDevicePost = addDevicePost;

module.exports.removeDeviceVar = removeDeviceVar;

module.exports.removeDevicePost = removeDevicePost;

module.exports.searchVar = searchVar;

module.exports.modifyDeviceVar = modifyDeviceVar;

module.exports.modifyDevicePost = modifyDevicePost;

module.exports.loadDetailsPost = loadDetailsPost;

module.exports.adminRejectVar = adminRejectVar;

module.exports.addAdminVar = addAdminVar;

module.exports.addAdminPost = addAdminPost;

module.exports.searchNameVar = searchNameVar;

module.exports.getUserNamePost = getUserNamePost;


