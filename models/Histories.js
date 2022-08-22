const mongoose = require('mongoose')

const HistorySchema = new mongoose.Schema({
    date: {
        type: Date,
        default:Date.now
    },
    truck:{
        type:mongoose.Schema.Types.Mixed,
        required:true
    },
    user:{
        type:mongoose.Schema.Types.Mixed,
        required:true

    }


}, { timestamps: true })


const Histories = mongoose.model("Histories", HistorySchema)


module.exports = Histories