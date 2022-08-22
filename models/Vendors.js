const mongoose = require('mongoose')

const VendorListSchema = new mongoose.Schema({
   
    name: {
        type: String,
    },
    color:{
        type:String,
        default:"black"
    },

}, { timestamps: true })


const Vendors = mongoose.model("Vendors", VendorListSchema)


module.exports = Vendors