const mongoose = require('mongoose')

const TruckListSchema = new mongoose.Schema({
   
    name: {
        type: String,
    },


}, { timestamps: true })


const TruckLists = mongoose.model("TruckLists", TruckListSchema)


module.exports = TruckLists