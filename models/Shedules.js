const mongoose = require('mongoose')

const SheduleSchema = new mongoose.Schema({
   
    location: {
        type: String,
        required:true,
    },
    monday:{
        type:mongoose.Schema.Types.Mixed,
        default:{truck:"X",color:"white",textColor:"black",font:"normal"}
    },
    tuesday:{
        type:mongoose.Schema.Types.Mixed,
        default:{truck:"X",color:"white",textColor:"black",font:"normal"}
    },
    wednesday:{
        type:mongoose.Schema.Types.Mixed,
        default:{truck:"X",color:"white",textColor:"black",font:"normal"}
    },
    thursday:{
        type:mongoose.Schema.Types.Mixed,
        default:{truck:"X",color:"white",textColor:"black",font:"normal"}
    },
    friday:{
        type:mongoose.Schema.Types.Mixed,
        default:{truck:"X",color:"white",textColor:"black",font:"normal"}
    },


}, { timestamps: true })


const Shedules = mongoose.model("Shedules", SheduleSchema)


module.exports = Shedules