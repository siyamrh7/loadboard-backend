const mongoose = require('mongoose')

const TrailerListSchema = new mongoose.Schema({
    trailer: {
        type: String,
        required: true,
        unique:true
    },
    location: {
        type:String,

    },
    truck_num: {
        type: String,     
    },
    notes: {
        type: String,
    },
 


}, { timestamps: true })


const Midwestes = mongoose.model("Midwestes", TrailerListSchema)


module.exports = Midwestes