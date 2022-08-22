const mongoose = require('mongoose')

const TrailerListSchema = new mongoose.Schema({
    trailer: {
        type: String,
        required: true,
        unique:true
    },
    empty: {
        type: String,
        
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


const Coloradoses = mongoose.model("Coloradoses", TrailerListSchema)


module.exports = Coloradoses