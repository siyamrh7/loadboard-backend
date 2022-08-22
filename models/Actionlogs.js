const mongoose = require('mongoose')

const TruckListSchema = new mongoose.Schema({
   
    user: {
        type: mongoose.Schema.Types.Mixed,
    },
    number:{
        type: String,
    },
    title:{
        type: String,

    }


}, { timestamps: true })


const Actionlogs = mongoose.model("Actionlogs", TruckListSchema)


module.exports = Actionlogs