var mongoose = require('mongoose')
var User = mongoose.model('User')

var moment = require('moment');

const bcrypt = require('bcryptjs');

module.exports = {

    index: function(req, res){
        req.session.first_name = undefined
        req.session.last_name = undefined
        req.session.email = undefined
        req.session.birthday = undefined
        res.render('index');
    },

    proflie: function(req, res){
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
    },

    reg: function(req, res){
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
    },

    login: function(req, res){
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
                //console.log(data)
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
    }
}