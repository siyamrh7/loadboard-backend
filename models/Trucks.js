const mongoose = require('mongoose')

const TruckListSchema = new mongoose.Schema({
    truck_num: {
        type: String,
        unique: true,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    day: {
        type: String,
        required: true
    },
    notes: {
        type: String,
    },
    request:{
        type:String
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Users"
    },


}, { timestamps: true })


const Trucks = mongoose.model("Trucks", TruckListSchema)


module.exports = Trucks