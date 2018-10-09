
var users = require("../controllers/users.js")

module.exports = function (app){
    app.get('/', function (req, res) {
        users.index(req, res)
    })

    app.get('/profile', function (req, res) {
        users.proflie(req, res)
    })

    app.post('/reg', function (req, res) {
        users.reg(req, res)
    })

    app.post('/login', function(req, res){
        users.login(req, res)
    })
}