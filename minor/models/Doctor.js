const mongoose = require('mongoose');

const Doctor = mongoose.model(
    "Doctor",
    new mongoose.Schema({
        name: { type: String, required: false },
        NMCNumber: { type: String, required: false },
        hospitalName: { type: String, required: false },
        qualification: { type: String, required: false },
        speciality: { type: String, required: false }
    })
)

module.exports = Doctor;