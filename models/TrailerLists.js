const mongoose = require('mongoose')

const TrailerListSchema = new mongoose.Schema({
   
    name: {
        type: String,
    },


}, { timestamps: true })


const TrailerLists = mongoose.model("TrailerLists", TrailerListSchema)


module.exports = TrailerLists