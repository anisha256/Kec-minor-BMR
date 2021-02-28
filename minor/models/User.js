const mongoose= require('mongoose');

const User = mongoose.model(
    "User",
    new mongoose.Schema({
        email: { type: String, required: true, unique: true, match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/},  
        password: {type: String, required : true},
        roles: {type: String, enum: ['Doctor', 'Patient', 'Admin'], default: 'Patient'},
        name:{type: String,required: false},
        NMCNumber: {type: String, required : false},
        qualification: {type: String, required : false},
        speciality: {type: String, required : false}
    })
)

module.exports = User;