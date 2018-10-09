var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    email: { type: String, required: true, minlength: 1 },
    first_name: { type: String, required: true, minlength: 1 },
    last_name: { type: String, required: true, minlength: 1 },
    password: { type: String, required: true, minlength: 1 },
    birthday: { type: Date, required: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at'} })

mongoose.model('User', UserSchema);