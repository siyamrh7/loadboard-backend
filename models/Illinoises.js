
const mongoose = require('mongoose')

const TruckListSchema = new mongoose.Schema({
    location: {
        type: String,
        required: true
    },
    trailer: {
        type: String,
      unique:true
    },
    truck_num: {
        type: String,     
    },
    notes: {
        type: String,
    },


}, { timestamps: true })


const Illinoises = mongoose.model("Illinoises", TruckListSchema)


module.exports = Illinoises