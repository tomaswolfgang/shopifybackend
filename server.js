require('dotenv').load();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser= require('body-parser');
const crypto = require('crypto');
const session = require('express-session')
const MongoStore = require('connect-mongo')(session);
const app = express();
const mongodb = require('mongodb');
const path = require('path');
const https = require('https');
// start the server

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());



// app.set('views', path.join(__dirname, 'views'));
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + '/styles'));
app.set('view engine', 'ejs');

// var LineItem = mongoose.Model('LineItem');
// var Order = mongoose.Model('Order');
// var Product = mongoose.Model('Product');
// var Shop = mongoose.Model('Shop');
//var User = mongoose.Model('User');

mongoose.connect(process.env.DB_LINK);
//mongoose.connect('mongodb://localhost:49672/shopifybackend');
var db = mongoose.connection;
db.on('error', (err)=> {console.log( '---FAILED to connect to mongoose', err)})
db.once('open', () => {})

//use sessions for tracking logins
app.use(session({
  secret: 'tommy god',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({mongooseConnection: db})
}));

var routes = require('./routes');
app.use(routes);

app.listen(3000,()=> {console.log("+++Express Server is Running!!!")})
// https.createServer({}, app).listen(3001, () => {
//   console.log("https running");
// });


app.get('/',(req,res)=>{
 res.sendFile(__dirname + '/index.html')
})

exports.closeServer = function(){
  server.close();
};
