const mongoose = require('mongoose')

const TruckListSchema = new mongoose.Schema({
    truck_num: {
        type: String,
        unique: true,
        required: true
    },
    notes:{
        type: String,

    }


}, { timestamps: true })


const TTrailers = mongoose.model("TTrailers", TruckListSchema)


module.exports = TTrailers