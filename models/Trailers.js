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
    vendor: {
        type:mongoose.Schema.Types.Mixed,
        required: true,

    },
    truck_num: {
        type: String,     
    },
    notes: {
        type: String,
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Users"
    }


}, { timestamps: true })


const Trailers = mongoose.model("Trailers", TrailerListSchema)


module.exports = Trailers