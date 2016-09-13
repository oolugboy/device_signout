// vendor libraries
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bcrypt = require('bcrypt-nodejs');
var ejs = require('ejs');
var path = require('path');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// custom libraries
// routes
var route = require('./route');
// model
var Model = require('./model');

var app = express();
passport.use(new LocalStrategy(function(username, password, done) {
   new Model.User({username: username}).fetch().then(function(data) {
   	console.log("in here please");
      var user = data;
      if(user === null) {
      	  console.log(" No such user ");
         return done(null, false, {message: 'Invalid username or password'});
      } else {
      	//console.log(" There is such a user");
         user = data.toJSON();
         //console.log(" The user is " + user);
         if(!bcrypt.compareSync(password, user.password)) {
         	//console.log(" my password " + password + " their password " + user.password);
            return done(null, false, {message: 'Invalid username or password'});
         } else {
         	//console.log(" The password also matches ");
            return done(null, user);
         }
      }
   });
}));
/** For password identification **/
passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(username, done) {
   new Model.User({username: username}).fetch().then(function(user) {
      done(null, user);
   });
});

app.set('port', process.env.PORT || 80);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/** The application middle-wares **/
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
	secret: 'laptop',
	resave: false,
	saveUninitialized: false,
        cookie: { maxAge: 6000000 }
	}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname));

/** The employee routes **/
// GET
app.get('/', route.deviceCategory);

app.post('/', route.deviceCategoryPost);

app.post('/nameQuery', route.getDeviceNamePost);

// signin
// GET
app.get('/Login', route.login);
// POST
app.post('/Login', route.loginPost);

// signup
// GET
app.get('/Register', route.register);
// POST
app.post('/Register', route.registerPost);

// logout
// GET
app.get('/logout', route.logOut);

/** The device page routes **/
app.get('/iPadsPage', route.iPadsVar);

app.get('/iPadsPageMore', route.iPadsMoreVar);

app.get('/iPodsOrIPhonesPage', route.iPodsOrIPhonesVar);

app.get('/iPodsOrIPhonesPageMore', route.iPodsOrIPhonesMoreVar);

app.get('/androidPhonesPage', route.androidPhonesVar);

app.get('/androidPhonesPageMore', route.androidPhonesMoreVar);

app.get('/androidTabletsPage', route.androidTabletsVar);

app.get('/androidTabletsPageMore', route.androidTabletsMoreVar);

app.get('/mozillaOrAmazonPage', route.mozillaOrAmazonVar);

app.get('/mozillaOrAmazonPageMore', route.mozillaOrAmazonMoreVar);

app.get('/amazonTabletsPage', route.amazonTabletsVar);

app.get('/amazonTabletsPageMore', route.amazonTabletsMoreVar);

app.get('/windowsPage', route.windowsVar);

app.get('/windowsPageMore', route.windowsMoreVar);

/********************************/

/********************************/
// 404 not found
app.use(route.notFound404);

var server = app.listen(app.get('port'), function(err) {
   if(err) throw err;

   var message = 'Server is running @ http://localhost:' + server.address().port;
   console.log(message);
});

