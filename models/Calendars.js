const mongoose = require('mongoose')

const TruckListSchema = new mongoose.Schema({
   
    truck_num: {
        type: String,
    },
    loads:{
        type: String,
    },
    startDate:{
        type: String,

    },
    endDate:{
        type:String
    },
    truck_color:{
        type:String

    },
    loads_color:{
        type:String
    }


}, { timestamps: true })


const Calendars = mongoose.model("Calendars", TruckListSchema)


module.exports = Calendars