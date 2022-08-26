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


const TColoradoses = mongoose.model("TColoradoses", TruckListSchema)


module.exports = TColoradoses