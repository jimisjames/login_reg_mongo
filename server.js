
var express = require('express');
var app = express();

var session = require('express-session');
app.use(session({
    secret: 'keyboardkitteh',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))

var moment = require('moment');

const bcrypt = require('bcryptjs');

var flash = require('express-flash');
app.use(flash());

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/login_registration', { useNewUrlParser: true });


var UserSchema = new mongoose.Schema({
    email: { type: String, required: true, minlength: 1 },
    first_name: { type: String, required: true, minlength: 1 },
    last_name: { type: String, required: true, minlength: 1 },
    password: { type: String, required: true, minlength: 1 },
    birthday: { type: Date, required: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at'} })

mongoose.model('User', UserSchema);
var User = mongoose.model('User')


var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

var path = require('path');
app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));

app.set('view engine', 'ejs');



app.get('/', function (req, res) {
    req.session.first_name = undefined
    req.session.last_name = undefined
    req.session.email = undefined
    req.session.birthday = undefined
    res.render('index');
})

app.get('/profile', function (req, res) {
    if(req.session.first_name == undefined){
        req.flash('reg', "You are not logged in!");
        res.redirect('/');
    } else {
        let data = {
            first_name: req.session.first_name,
            last_name: req.session.last_name,
            email: req.session.email,
            birthday: req.session.birthday
        }
        res.render('profile', data);
    }
})


app.post('/reg', function (req, res) {

    User.find({email: req.body.email}, function(err, data){
        if(err){
            console.log('something went wrong while checking email in db');
            console.log(err);
            for(var key in err.errors){
                req.flash('reg', err.errors[key].message);
            }
            res.redirect('/');
        } else {
            if(data.length != 0){
                console.log(data)
                req.flash('reg', "This email is already registered!");
                res.redirect('/');
            } else {
                bcrypt.hash('password_from_form', 10)
                .then(hashed_password => {
                    let date = moment(req.body.birthday)
                    var user = new User({first_name: req.body.first_name, last_name: req.body.last_name, email: req.body.email, password: hashed_password, birthday: date})
                    user.save(function(err){
                        if (err) {
                            console.log('something went wrong, user not saved');
                            console.log(err);
                            for(var key in err.errors){
                                req.flash('reg', err.errors[key].message);
                            }
                            res.redirect('/');
                        } else {
                            req.session.first_name = req.body.first_name
                            req.session.last_name = req.body.last_name
                            req.session.email = req.body.email
                            req.session.birthday = moment(req.body.birthday).format('MMM D, YYYY')
                            res.redirect('/profile');
                        }
                    })
                })
                .catch(error => {
                    console.log('something went wrong, could not hash password');
                    console.log('error');
                    res.redirect('/');
                });

                
            }
        }
    })
})

app.post('/login', function(req, res){
    User.findOne({email: req.body.email}, function(err, data){
        if(err){
            console.log('Something went wrong while checking email in db');
            console.log(err);
            for(var key in err.errors){
                req.flash('login', err.errors[key].message);
            }
            res.redirect('/');
        } else if(data == null) {
            console.log('User not found');
            req.flash('login', "Email address not found! Register above!");
            res.redirect('/');
        } else {
            console.log(data)
            bcrypt.compare(req.body.password, data.password)
            .then( result => {
                req.session.first_name = data.first_name
                req.session.last_name = data.last_name
                req.session.email = data.email
                req.session.birthday = moment(data.birthday).format('MMM D, YYYY')
                res.redirect('/profile');
            })
            .catch( error => {
                if(error){
                    console.log('Something went wrong, bcrypt pw check fail');
                    console.log(error);
                    req.flash('login', "Failed to log in");
                    res.redirect('/');
                }
            })
        }
    })
})


app.listen(8000, function () {
    console.log("listening on port 8000");
})