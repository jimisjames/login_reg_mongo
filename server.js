
var express = require('express');
var app = express();

var session = require('express-session');
app.use(session({
    secret: 'keyboardkitteh',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))

var flash = require('express-flash');
app.use(flash());

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

var path = require('path');
app.use(express.static(path.join(__dirname, './client/static')));
app.set('views', path.join(__dirname, './client/views'));

app.set('view engine', 'ejs');

require("./server/config/mongoose.js")

require("./server/config/routes.js")(app)

app.listen(8000, function () {
    console.log("listening on port 8000");
})