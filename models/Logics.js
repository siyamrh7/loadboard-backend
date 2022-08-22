const mongoose = require('mongoose')

const TrailerListSchema = new mongoose.Schema({
    utahtrailer: {
        type: Number,
       
    },
    colorado: {
        type:Number,

    },
    illinois: {
        type: Number,     
    },


}, { timestamps: true })


const Logics = mongoose.model("Logics", TrailerListSchema)


module.exports = Logics