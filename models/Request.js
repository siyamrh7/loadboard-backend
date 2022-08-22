const mongoose = require('mongoose')

const RequestListSchema = new mongoose.Schema({
    truck_num: {
        type: String,
        unique: true,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    date: {
        type: String,
    },
   
    notes: {
        type: String,
    },
    color:{
        type:String,
        default:"black"
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Users"
    }


}, { timestamps: true })


const Requests = mongoose.model("Requests", RequestListSchema)


module.exports = Requests