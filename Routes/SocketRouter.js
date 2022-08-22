const express = require("express");
const Upload = require("../middlewares/Upload");
const { GetUser, CreateUser, LoginUser, GetUsers, DeleteUser } = require("../controllers/UsersCtrl")
const AuthenticateUser = require("../middlewares/AuthenticateUser");
const Trucks = require("../models/Trucks")
const Trailers = require("../models/Trailers")
const Users = require("../models/Users");
const Histories = require("../models/Histories");
const Requests = require("../models/Request");
const TruckLists = require("../models/TruckLists");
const TrailerLists = require("../models/TrailerLists");
const Vendors = require("../models/Vendors");
const Shedules = require("../models/Shedules");
var _ = require('lodash');
const Illinoises = require("../models/Illinoises");
const TIllinoises = require("../models/TIllinoises");
const Coloradoses = require("../models/Coloradoses");
const Midwestes = require("../models/Midwestes");
const Calendars = require("../models/Calendars");
const Logics = require("../models/Logics");
const Actionlogs = require("../models/Actionlogs");



function SocketRouter(io) {
    const router = express.Router();



    //Trailer Checking Functions

    const checkTrailer=async(trailer)=>{
        const check = await Trailers.findOne({ trailer })
        if (check) {
            return data={ status: false, msg: "This Trailer already exist on Utah Trailer" }
        }
        const check2 = await Illinoises.findOne({ trailer })
        if (check2) {
            return { status: false, msg: "This Trailer already exist on Illinois" }
        }
        const check3 = await Coloradoses.findOne({ trailer })
        if (check3) {
            return { status: false, msg: "This Trailer already exist on Colorado" }
        }
        const check4 = await Midwestes.findOne({ trailer })
        if (check4) {
            return { status: false, msg: "This Trailer already exist on Midwest" }
        }
        return false
     }


    // Authentication Api's
    
    router.post('/login', LoginUser)
    router.get('/user', GetUser)
    router.get('/users', GetUsers)
    router.delete('/user',AuthenticateUser, DeleteUser)

    router.post('/register', Upload.single("image"), CreateUser)
    router.get('/notifications', AuthenticateUser, async (req, res) => {
        if (req.query.search) {
            const notifications = await Actionlogs.find({ number: { $regex: req.query.search, $options: 'i' } }).sort('-createdAt').limit(10)
            return res.json({ notifications })
        }
        const notifications = await Actionlogs.find({}).sort('-createdAt').limit(10)
        res.json({ notifications })
        
    })
 
    // TruckList Api's 

    router.post('/truck', AuthenticateUser, async (req, res) => {

        try {
            const { truck_num, city, state, day, notes } = req.body

            if (!truck_num || !city || !state || !day) {
                return res.json({ status: false, msg: "Invalid Creadentials" })
            }
            const check = await Trucks.findOne({ truck_num })
            if (check) {
                return res.json({ status: false, msg: "This Truck already exist" })
            }
            const check2 = await Requests.findOne({ truck_num })

            if (check2) {
                const truck = await Trucks.create({
                    truck_num, city, state, day, request: "Match", notes, user: req.id
                })
                await Requests.findByIdAndUpdate(check2._id, { color: "orange" })
                io.emit("NEW_TRUCK", truck)
                await Users.findByIdAndUpdate(req.id, { $push: { trucks: truck._id } })
                return res.json({ status: true, msg: "This truck Matched with 'Request'" })
            }

            const truck = await Trucks.create({
                truck_num, city, state, day, notes, request: " ", user: req.id
            })

            io.emit("NEW_TRUCK", truck)
            await Users.findByIdAndUpdate(req.id, { $push: { trucks: truck._id } })
            const actionlog = await Actionlogs.create({ number: truck.truck_num, user: req.user.user, title: "Added Truck" })
            io.emit("NEW_NOTIFICATION", actionlog)
            res.json({ status: true, msg: "Truck added successfully" })

        } catch (error) {
            res.json({ status: false, msg:error.message })
        }
    })



    router.get('/trucks', AuthenticateUser, async (req, res) => {
        try {
            const trucks = await Trucks.find({}).sort('createdAt')
            res.json({ status: true, msg: trucks })

        } catch (error) {
            res.json({ status: false, msg:error.message })
        }
    })


    router.get('/truck', async (req, res) => {
        try {
            const { id } = req.query
            const truck = await Trucks.findById(id)
            res.json({ status: true, msg: truck })

        } catch (error) {
            res.json({ status: false, msg:error.message })
        }
    })


    function difference(object, base) {
        function changes(object, base) {
            return _.transform(object, function(result, value, key) {
                if (!_.isEqual(value, base[key])) {
                    result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value;
                }
            });
        }
        return changes(object, base);
    }
    router.put('/truck', AuthenticateUser, async (req, res) => {
        try {
            const { truck_num, city, state, day, notes } = req.body
            const { id } = req.query
            const prevTruck=await Trucks.findById(id)
            const truck = await Trucks.findByIdAndUpdate(id, { truck_num, city, state, day, notes, user: req.id }, { returnDocument: 'after' })
            var obj = { truck: truck }
            io.emit("EDITED_TRUCK", obj)
            const data=difference({...truck},{...prevTruck})
            if(data._doc.day && data._doc.notes){
                const actionlog = await Actionlogs.create({ number: truck.truck_num, user: req.user.user, title: `Edited Daily Trucklist Day from "${prevTruck.day}" to "${day}" and Notes from "${prevTruck.notes}" to "${notes}" for Truck` })
                io.emit("NEW_NOTIFICATION", actionlog)
            } else if(data._doc.day){
                const actionlog = await Actionlogs.create({ number: truck.truck_num, user: req.user.user, title: `Edited Daily Trucklist Day from "${prevTruck.day}" to "${day}" for Truck` })
                io.emit("NEW_NOTIFICATION", actionlog)
            }else if(data._doc.notes){
                const actionlog = await Actionlogs.create({ number: truck.truck_num, user: req.user.user, title: `Edited Daily Trucklist Notes from "${prevTruck.notes}" to "${notes}" for Truck` })
                io.emit("NEW_NOTIFICATION", actionlog)
            }else{
                const actionlog = await Actionlogs.create({ number: truck.truck_num, user: req.user.user, title: `Edited Daily Trucklist Truck` })
                io.emit("NEW_NOTIFICATION", actionlog)
            }
            res.json({status:true, msg: "Edited Successfully", truck: truck })

        } catch (error) {
            res.json({ status: false, msg:error.message })
        }
    })


    router.delete('/truck', AuthenticateUser, async (req, res) => {
        try {
            const { id } = req.query
            const truck = await Trucks.findByIdAndDelete(id)
            await Requests.findOneAndUpdate({ truck_num: truck.truck_num }, { $set: { color: "black" } })
            var obj = { truck: truck }
            io.emit("DELETED_TRUCK", obj)
            const actionlog = await Actionlogs.create({ number: truck.truck_num, user: req.user.user, title: "Deleted Truck" })
            io.emit("NEW_NOTIFICATION", actionlog)
            res.json({ msg: "Deleted Successfully", truck: truck })

        } catch (error) {
            res.json({ status: false, msg:error.message })
        }
    })



    //Trailers Api's


    router.post('/trailer', AuthenticateUser, async (req, res) => {

        try {
            const { trailer, empty, vendor, truck_num, notes } = req.body

            if (!trailer) {
                return res.json({ status: false, msg: "Please enter trailer number" })
            }
            if (!vendor.name) {
                return res.json({ status: false, msg: "Please add a vendor" })
            }
            const checked= await checkTrailer(req.body.trailer)
            if(checked){return res.json(checked)}
            const count = await Trailers.countDocuments({})
            const logic = await Logics.find({})
            if (count >= logic[0].utahtrailer) {
                if (!notes || !truck_num) {
                    return res.json({ status: false, msg: "You have to assign a Truck and Notes" })
                }
            }
            const Trailer = await Trailers.create({
                trailer, empty, vendor: vendor, truck_num, notes, user: req.id
            })
            io.emit("NEW_TRAILER", Trailer)
            await Users.findByIdAndUpdate(req.id, { $push: { trailers: Trailer._id } })
            const actionlog = await Actionlogs.create({ number: Trailer.trailer, user: req.user.user, title: "Added Utah Trailer" })
            io.emit("NEW_NOTIFICATION", actionlog)
            res.json({ status: true, msg: "Trailer added successfully" })

        } catch (error) {
            res.json({ status: false, msg:error.message })
        }
    })

    router.get('/trailers', AuthenticateUser, async (req, res) => {
        try {
            const trailers = await Trailers.find({}).sort('createdAt')
            res.json({ status: true, msg: trailers })

        } catch (error) {
            res.json({ status: false, msg:error.message })
        }
    })



    router.delete('/trailer', AuthenticateUser, async (req, res) => {
        try {
            const { id } = req.query
            const trailer = await Trailers.findByIdAndDelete(id)
            var obj = { trailer: trailer }
            io.emit("DELETED_TRAILER", obj)
            const actionlog = await Actionlogs.create({ number: trailer.trailer, user: req.user.user, title: "Deleted UtahTrailer" })
            io.emit("NEW_NOTIFICATION", actionlog)
            res.json({ msg: "Deleted Successfully", trailer: trailer })

        } catch (error) {
            res.json({ status: false, msg:error.message })
        }
    })

    router.put('/trailer', AuthenticateUser, async (req, res) => {
        try {
            const { trailer, empty, vendor, truck_num, notes } = req.body
            const { id } = req.query
             const prevTrailer=await Trailers.findById(id)
          const Trailer = await Trailers.findByIdAndUpdate(id, { trailer, empty, vendor, truck_num, notes, user: req.id }, { returnDocument: 'after' })
            var obj = { trailer: Trailer }
            io.emit("EDITED_TRAILER", obj)
            const data=difference({...Trailer},{...prevTrailer})
            if(data._doc.notes){
                const actionlog = await Actionlogs.create({ number: Trailer.trailer, user: req.user.user, title: `Edited Utah Trailer Notes from "${prevTrailer.notes}" to "${notes}" for Trailer` })
                io.emit("NEW_NOTIFICATION", actionlog)
            } else if(data._doc.truck_num){
                const actionlog = await Actionlogs.create({ number: Trailer.trailer, user: req.user.user, title: `Edited Utah Trailer Truck from "${prevTrailer.truck_num}" to "${truck_num}" for Trailer` })
                io.emit("NEW_NOTIFICATION", actionlog)
            }else if(data._doc.vendor){
                const actionlog = await Actionlogs.create({ number: Trailer.trailer, user: req.user.user, title: `Edited Utah Trailer Vendor from "${prevTrailer.vendor.name}" to "${vendor.name}" for Trailer` })
                io.emit("NEW_NOTIFICATION", actionlog)
            } else{
                const actionlog = await Actionlogs.create({ number: Trailer.trailer, user: req.user.user, title: "Edited Utah Trailer" })
                io.emit("NEW_NOTIFICATION", actionlog)
            }
            return res.json({status:true, msg: "Edited Successfully", trailer: Trailer })

        } catch (error) {
            res.json({ status: false, msg:error.message })
        }
    })

    // History Api's


    router.post('/history', AuthenticateUser, async (req, res) => {

        try {
            var { truck } = req.body
            truck = JSON.parse(truck)
            const user = await Users.findById(req.id)
            const History = await Histories.create({
                truck: truck, user
            })
            const Truck = await Trucks.findByIdAndDelete(truck._id)
            var obj = { truck: Truck }
            io.emit("DELETED_TRUCK", obj)
            io.emit("NEW_HISTORY", History)
            await Users.findByIdAndUpdate(req.id, { $push: { histories: History._id } })
            const actionlog = await Actionlogs.create({ number: Truck.truck_num, user: req.user.user, title: "Dispatched Truck" })
            io.emit("NEW_NOTIFICATION", actionlog)
            res.json({ status: true, msg: "Dispatched successfully" })

        } catch (error) {
            res.json({ status: false, msg:error.message })
        }
    })
    router.post('/historyback', AuthenticateUser, async (req, res) => {

        try {
            const { id } = req.query
            const history = await Histories.findByIdAndDelete(id)
            const Truck = await Trucks.create(history.truck)
            var obj = { history: history }
            io.emit("DELETED_HISTORY", obj)
            io.emit("NEW_TRUCK", Truck)
            const actionlog = await Actionlogs.create({ number: Truck.truck_num, user: req.user.user, title: "Restored Truck" })
            io.emit("NEW_NOTIFICATION", actionlog)
            res.json({ status: true, msg: "Restored Successfully" })

        } catch (error) {
            res.json({ status: false, msg: error.message })
        }
    })
    router.get('/historys', AuthenticateUser, async (req, res) => {
        try {
            const histories = await Histories.find({}).sort('-createdAt')
            res.json({ status: true, msg: histories })

        } catch (error) {
            res.json({ status: false, msg:error.message })
        }
    })

    router.delete('/history', AuthenticateUser, async (req, res) => {
        try {
            const { id } = req.query
            const history = await Histories.findByIdAndDelete(id)
            var obj = { history: history }
            io.emit("DELETED_HISTORY", obj)
            const actionlog = await Actionlogs.create({ number: history.truck.truck_num, user: req.user.user, title: "Deleted History of Truck" })
            io.emit("NEW_NOTIFICATION", actionlog)
            res.json({ msg: "Deleted Successfully", history: history })

        } catch (error) {
            res.json({ status: false, msg:error.message })
        }
    })
    //Request Api's


    router.post('/request', AuthenticateUser, async (req, res) => {

        try {
            const { truck_num, location, date, notes } = req.body

            if (!truck_num || !location) {
                return res.json({ status: false, msg: "Invalid Creadentials" })
            }
            const check = await Requests.findOne({ truck_num })
            if (check) {
                return res.json({ status: false, msg: "This Request already exist" })
            }
            const find = await Trucks.findOne({ truck_num })
            if (find) {
                await Trucks.findByIdAndUpdate(find._id, { $set: { request: "Match" } })
                const request = await Requests.create({
                    truck_num, location, color: "orange", date, notes, user: req.id
                })
                io.emit("NEW_REQUEST", request)
                await Users.findByIdAndUpdate(req.id, { $push: { requests: request._id } })
                const actionlog = await Actionlogs.create({ number: request.truck_num, user: req.user.user, title: "Added Request Truck" })
                io.emit("NEW_NOTIFICATION", actionlog)
                return res.json({ status: true, msg: "Request added successfully" })

            }
            const find2 = await Shedules.find({ $or: [{ 'monday.truck': truck_num }, { 'tuesday.truck': truck_num }, { 'wednesday.truck': truck_num }, { 'thursday.truck': truck_num }, { 'friday.truck': truck_num }] })
            if (find2.length !== 0) {
                var result = _.pick(find2[0], ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
                const Key = _.findKey(result, { 'truck': truck_num });
                var obj = { truck: truck_num, color: 'white', textColor: 'red', font: 'normal' }
                await Shedules.findByIdAndUpdate(find2[0]._id, { $set: { [Key]: obj } })


                const request = await Requests.create({
                    truck_num, location, color: "orange", date, notes, user: req.id
                })
                io.emit("NEW_REQUEST", request)
                await Users.findByIdAndUpdate(req.id, { $push: { requests: request._id } })
                const actionlog = await Actionlogs.create({ number: request.truck_num, user: req.user.user, title: "Added Request Truck" })
                io.emit("NEW_NOTIFICATION", actionlog)
                return res.json({ status: true, msg: "Request added successfully" })
            }
            const request = await Requests.create({
                truck_num, location, date, notes, user: req.id
            })
            io.emit("NEW_REQUEST", request)
            await Users.findByIdAndUpdate(req.id, { $push: { requests: request._id } })
            const actionlog = await Actionlogs.create({ number: request.truck_num, user: req.user.user, title: "Added Request Truck" })
            io.emit("NEW_NOTIFICATION", actionlog)
            res.json({ status: true, msg: "Request added successfully" })

        } catch (error) {
            res.json({ status: false, msg: error.message })
        }
    })

    router.get('/requests', AuthenticateUser, async (req, res) => {
        try {
            const request = await Requests.find({}).sort('-createdAt')
            res.json({ status: true, msg: request })

        } catch (error) {
            res.json({ status: false, error })
        }
    })


    router.put('/request', AuthenticateUser, async (req, res) => {
        try {
            const { truck_num, location, date, notes } = req.body
            const { id } = req.query
            const prevRequest = await Requests.findById(id)
            const request = await Requests.findByIdAndUpdate(id, { truck_num, location, date, notes, user: req.id }, { returnDocument: 'after' })
            var obj = { request: request }
            io.emit("EDITED_REQUEST", obj)
            const data=difference({...request},{...prevRequest})
            if(data._doc.notes){
                const actionlog = await Actionlogs.create({ number: request.truck_num, user: req.user.user, title: `Edited Request Truck Notes from "${prevRequest.notes}" to "${notes}" for Request Truck` })
                io.emit("NEW_NOTIFICATION", actionlog)
            }else  if(data._doc.location){
                const actionlog = await Actionlogs.create({ number: request.truck_num, user: req.user.user, title: `Edited Request Truck Location from "${prevRequest.location}" to "${location}" for Request Truck` })
                io.emit("NEW_NOTIFICATION", actionlog)
            }else{
                const actionlog = await Actionlogs.create({ number: request.truck_num, user: req.user.user, title: "Edited Requested Truck" })
                io.emit("NEW_NOTIFICATION", actionlog)
            }
            res.json({status:true, msg: "Edited Successfully", request: request })

        } catch (error) {
            res.json({ status: false, msg:error.message })
        }
    })






    router.delete('/request', AuthenticateUser, async (req, res) => {
        try {
            const { id } = req.query
            const request = await Requests.findByIdAndDelete(id)
            await Trucks.findOneAndUpdate({ truck_num: request.truck_num }, { $set: { request: "" } })
            var truck_num = request.truck_num
            const find2 = await Shedules.find({ $or: [{ 'monday.truck': truck_num }, { 'tuesday.truck': truck_num }, { 'wednesday.truck': truck_num }, { 'thursday.truck': truck_num }, { 'friday.truck': truck_num }] })
            if (find2.length !== 0) {
                var result = _.pick(find2[0], ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
                const Key = _.findKey(result, { 'truck': truck_num });
                var obj = { truck: truck_num, color: 'white', textColor: 'black', font: 'normal' }
                await Shedules.findByIdAndUpdate(find2[0]._id, { $set: { [Key]: obj } })

            }
            var obj = { request: request }
            io.emit("DELETED_REQUEST", obj)
            const actionlog = await Actionlogs.create({ number: request.truck_num, user: req.user.user, title: "Deleted Requested Truck" })
            io.emit("NEW_NOTIFICATION", actionlog)
            res.json({ msg: "Deleted Successfully", request: request })

        } catch (error) {
            res.json({ status: false, msg:error.message })
        }
    })


    //List Api's 

    router.post('/trucklist', AuthenticateUser, async (req, res) => {
        try {
            const { name } = req.body
            const check = await TruckLists.findOne({ name })
            if (check) {
                return res.json({ status: false, msg: "This truck already exist" })
            }
            var truck = await TruckLists.create({ ...req.body })

            res.json({ status: true, msg: "Truck Added", truck })

        } catch (error) {
            res.json({ status: false, msg: error.message })
        }
    })

    router.post('/trailerlist', AuthenticateUser, async (req, res) => {
        try {
            const { name } = req.body
            const check = await TrailerLists.findOne({ name })
            if (check) {
                return res.json({ status: false, msg: "This trailer already exist" })
            }
            var trailer = await TrailerLists.create({ ...req.body })

            res.json({ status: true, msg: "Trailer Added", trailer })

        } catch (error) {
            res.json({ status: false, msg: error.message })
        }
    })

    router.post('/vendor', AuthenticateUser, async (req, res) => {
        try {
            const { name } = req.body
            const check = await Vendors.findOne({ name })
            if (check) {
                return res.json({ status: false, msg: "This vendor already exist" })
            }
            var vendor = await Vendors.create({ ...req.body })

            res.json({status:true, status: true, msg: "Vendor Added", vendor })

        } catch (error) {
            res.json({ status: false, msg: error.message })
        }
    })
    router.get('/list', AuthenticateUser, async (req, res) => {
        try {
            var truck = await TruckLists.find({})
            var trailer = await TrailerLists.find({})
            var vendor = await Vendors.find({})

            res.json({ Trucks: truck, Trailers: trailer, Vendors: vendor })

        } catch (error) {
            res.json({ status: false, msg: error.message })
        }
    })

    router.delete('/trucklist', AuthenticateUser, async (req, res) => {
        try {
            var truck = await TruckLists.findByIdAndDelete(req.query.id)

            res.json({ truck })

        } catch (error) {
            res.json({ status: false, msg:error.message })
        }
    })
    router.delete('/trailerlist', AuthenticateUser, async (req, res) => {
        try {
            var trailer = await TrailerLists.findByIdAndDelete(req.query.id)

            res.json({ trailer })

        } catch (error) {
            res.json({ status: false, msg:error.message })
        }
    })
    router.delete('/vendor', AuthenticateUser, async (req, res) => {
        try {
            var vendor = await Vendors.findByIdAndDelete(req.query.id)

            res.json({ vendor })

        } catch (error) {
            res.json({ status: false, msg:error.message })
        }
    })

    //DedicatedLanes Api's


    router.post('/shedule', AuthenticateUser, async (req, res) => {
        try {

            var shedule = await Shedules.create({ ...req.body })
            const actionlog = await Actionlogs.create({ number: shedule.location, user: req.user.user, title: `Added Truck for Dedicated Lane` })
            io.emit("NEW_NOTIFICATION", actionlog)
            res.json({ status: true, msg: "Location Added", shedule })

        } catch (error) {
            res.json({ status: false, msg: error.message })
        }
    })

    router.get('/shedule', AuthenticateUser, async (req, res) => {
        try {
            const shedules = await Shedules.find({})
            res.json({ status: true, msg: shedules })
        } catch (error) {
            res.json({ status: false, msg: error.message })
        }
    })

    router.put("/shedule", AuthenticateUser, async (req, res) => {
        try {
            const check = await Requests.findOne({ truck_num: req.query.truck })
            await Requests.findOneAndUpdate({ truck_num: req.query.prevtruck }, { $set: { color: "black" } })
            if (check) {
                const Shedule = await Shedules.findByIdAndUpdate(req.query.id, { $set: { ...req.body } }, { returnDocument: 'after' })
                var obj = { shedule: Shedule }
                await Requests.findByIdAndUpdate(check._id, { color: "orange" })
                io.emit("EDITED_SHEDULE", obj)
                const actionlog = await Actionlogs.create({ number: Shedule.location, user: req.user.user, title: `Edited ${_.startCase(_.camelCase(Object.keys(req.body)[0]))} for Dedicated Lane` })
                io.emit("NEW_NOTIFICATION", actionlog)

                return res.json({status:true, msg: "Edited Successfully", shedule: Shedule })
            }
            const Shedule = await Shedules.findByIdAndUpdate(req.query.id, { $set: { ...req.body } }, { returnDocument: 'after' })
            var obj = { shedule: Shedule }
            io.emit("EDITED_SHEDULE", obj)
            const actionlog = await Actionlogs.create({ number: Shedule.location, user: req.user.user, title: `Edited ${_.startCase(_.camelCase(Object.keys(req.body)[0]))} for Dedicated Lane` })
            io.emit("NEW_NOTIFICATION", actionlog)
            res.json({status:true, msg: "Edited Successfully", shedule: Shedule })

        } catch (error) {
            res.json({ status: false, msg: error.message })

        }
    })
    router.delete('/shedule', AuthenticateUser, async (req, res) => {
        try {
            var shedule = await Shedules.findByIdAndDelete(req.query.id)
            const actionlog = await Actionlogs.create({ number: shedule.location, user: req.user.user, title: `Deleted Dedicated Lane` })
            io.emit("NEW_NOTIFICATION", actionlog)
            res.json({ shedule })

        } catch (error) {
            res.json({ status: false, msg:error.message })
        }
    })
    router.put("/location", AuthenticateUser, async (req, res) => {
        try {

            const Shedule = await Shedules.findByIdAndUpdate(req.query.id, { $set: { ...req.body } }, { returnDocument: 'after' })
            var obj = { shedule: Shedule }
            io.emit("EDITED_SHEDULE", obj)
            const actionlog = await Actionlogs.create({ number: Shedule.location, user: req.user.user, title: `Edited Dedicated Lane` })
            io.emit("NEW_NOTIFICATION", actionlog)
            res.json({status:true, msg: "Edited Successfully", shedule: Shedule })

        } catch (error) {
            res.json({ status: false, msg: error.message })

        }
    })

    //Illinoises Api's

    router.post('/illinois', AuthenticateUser, async (req, res) => {
        try {
            const { trailer, location, truck_num, notes } = req.body
            if(!trailer ){return res.json({status:false,msg:"Invalid Creadentials"})}
            const checked= await checkTrailer(req.body.trailer)
            if(checked){return res.json(checked)}       
            const count = await Illinoises.countDocuments({})
            const logic = await Logics.find({})
            if (count >= logic[0].illinois) {
                if (!truck_num ||  !notes) {
                    return res.json({ status: false, msg: `Illinois reached maximum value ${logic[0].illinois},So You have to assign a Illinois Truck and Notes` })
                }

            }
            var illinois = await Illinoises.create({ ...req.body })
            io.emit("NEW_ILLINOIS", illinois)
            const actionlog = await Actionlogs.create({ number: illinois.trailer, user: req.user.user, title: `Added Illinois Trailer` })
            io.emit("NEW_NOTIFICATION", actionlog)
            res.json({ status: true, msg: "Illinois Added" })

        } catch (error) {
            res.json({ status: false, msg: error.message })
        }
    })
    router.get('/illinois', AuthenticateUser, async (req, res) => {
        try {
            const illinoises = await Illinoises.find({})
            res.json({ status: true, msg: illinoises })
        } catch (error) {
            res.json({ status: false, msg: error.message })
        }
    })
    router.put('/illinois', AuthenticateUser, async (req, res) => {
        try {
            const { trailer, location, truck_num, notes } = req.body
            const { id } = req.query
          const prevMidwest=await Illinoises.findById(id)
            const Midwest = await Illinoises.findByIdAndUpdate(id, { trailer, location, truck_num, notes, user: req.id }, { returnDocument: 'after' })
            var obj = { illinois: Midwest }
            io.emit("EDITED_MIDWEST", obj)
            const data=difference({...Midwest},{...prevMidwest})
            if(data._doc.notes){
                const actionlog = await Actionlogs.create({ number: Midwest.trailer, user: req.user.user, title: `Edited Illinois Notes from "${prevMidwest.notes}" to "${notes}" for Illinois Trailer` })
                io.emit("NEW_NOTIFICATION", actionlog)
            } else if(data._doc.truck_num){
                const actionlog = await Actionlogs.create({ number: Midwest.trailer, user: req.user.user, title: `Edited Illinois Truck from "${prevMidwest.truck_num}" to "${truck_num}" for Illinois Trailer` })
                io.emit("NEW_NOTIFICATION", actionlog)
            }else if(data._doc.location){
                const actionlog = await Actionlogs.create({ number: Midwest.trailer, user: req.user.user, title: `Edited Illinois Location from "${prevMidwest.location}" to "${location}" for Illinois Trailer` })
                io.emit("NEW_NOTIFICATION", actionlog)
            }else{
                const actionlog = await Actionlogs.create({ number: Midwest.trailer, user: req.user.user, title: `Edited Illinois Trailer ` })
                io.emit("NEW_NOTIFICATION", actionlog)
            }
            return res.json({status:true, msg: "Edited Successfully", illinois: Midwest })

        } catch (error) {
            res.json({ status: false, msg:error.message })
        }
    })

    router.delete('/illinois', AuthenticateUser, async (req, res) => {
        try {
            const { id } = req.query
            const illinois = await Illinoises.findByIdAndDelete(id)
            var obj = { illinois: illinois }
            io.emit("DELETED_ILLINOIS", obj)
            const actionlog = await Actionlogs.create({ number: illinois.trailer, user: req.user.user, title: `Deleted Illinois Trailer` })
            io.emit("NEW_NOTIFICATION", actionlog)
            res.json({ msg: "Deleted Successfully", illinois: illinois })

        } catch (error) {
            res.json({ status: false, msg:error.message })
        }
    })
    router.post('/tillinois', AuthenticateUser, async (req, res) => {
        try {
            const { truck_num } = req.body
            const check = await TIllinoises.findOne({ truck_num })
            if (check) {
                return res.json({ status: false, msg: "This Illinois Truck already exist" })
            }
            var tillinois = await TIllinoises.create({ ...req.body })
            io.emit("NEW_TILLINOIS", tillinois)
            const actionlog = await Actionlogs.create({ number: tillinois.truck_num, user: req.user.user, title: `Added Illinois Truck` })
            io.emit("NEW_NOTIFICATION", actionlog)
            res.json({ status: true, msg: "Illinois Truck Added" })

        } catch (error) {
            res.json({ status: false, msg: error.message })
        }
    })
    router.get('/tillinois', AuthenticateUser, async (req, res) => {
        try {
            const tillinoises = await TIllinoises.find({})
            res.json({ status: true, msg: tillinoises })
        } catch (error) {
            res.json({ status: false, msg: error.message })
        }
    })
    router.delete('/tillinois', AuthenticateUser, async (req, res) => {
        try {
            const { id } = req.query
            const tillinois = await TIllinoises.findByIdAndDelete(id)
            var obj = { tillinois: tillinois }
            io.emit("DELETED_TILLINOIS", obj)
            const actionlog = await Actionlogs.create({ number: tillinois.truck_num, user: req.user.user, title: `Deleted Illinois Truck` })
            io.emit("NEW_NOTIFICATION", actionlog)
            res.json({ msg: "Deleted Successfully", tillinois: tillinois })

        } catch (error) {
            res.json({ status: false, msg:error.message })
        }
    })


    //Colorado Api's
    router.post('/colorado', AuthenticateUser, async (req, res) => {

        try {
            const { trailer, empty, location, truck_num, notes } = req.body

            if (!trailer) {
                return res.json({ status: false, msg: "Please enter trailer number" })
            }

            const checked= await checkTrailer(req.body.trailer)
            if(checked){return res.json(checked)}     
            const count = await Coloradoses.countDocuments({})
            const logic = await Logics.find({})
            if (count >= logic[0].colorado) {
                if (!notes || !truck_num) {
                    return res.json({ status: false, msg: `Colorado reached maximum value ${logic[0].colorado},SO You have to assign a truck and notes` })
                }
            }
            const Colorado = await Coloradoses.create({
                trailer, empty, location, truck_num, notes, user: req.id
            })
            io.emit("NEW_COLORADO", Colorado)
            const actionlog = await Actionlogs.create({ number: Colorado.trailer, user: req.user.user, title: `Added Colorado Trailer` })
            io.emit("NEW_NOTIFICATION", actionlog)
            res.json({ status: true, msg: "Trailer added successfully" })

        } catch (error) {
            res.json({ status: false, msg:error.message })
        }
    })

    router.get('/colorado', AuthenticateUser, async (req, res) => {
        try {
            const coloradoses = await Coloradoses.find({}).sort('createdAt')
            res.json({ status: true, msg: coloradoses })

        } catch (error) {
            res.json({ status: false, msg:error.message })
        }
    })



    router.delete('/colorado', AuthenticateUser, async (req, res) => {
        try {
            const { id } = req.query
            const colorado = await Coloradoses.findByIdAndDelete(id)
            var obj = { colorado: colorado }
            io.emit("DELETED_COLORADO", obj)
            const actionlog = await Actionlogs.create({ number: colorado.trailer, user: req.user.user, title: `Deleted Colorado Trailer` })
            io.emit("NEW_NOTIFICATION", actionlog)
            res.json({ msg: "Deleted Successfully", colorado: colorado })

        } catch (error) {
            res.json({ status: false, msg:error.message })
        }
    })

    router.put('/colorado', AuthenticateUser, async (req, res) => {
        try {
            const { trailer, empty, location, truck_num, notes } = req.body
            const { id } = req.query
            const prevColorado=await Coloradoses.findById(id)
            const Colorado = await Coloradoses.findByIdAndUpdate(id, { trailer, empty, location, truck_num, notes, user: req.id }, { returnDocument: 'after' })
            var obj = { colorado: Colorado }
            io.emit("EDITED_COLORADO", obj)
            const data=difference({...Colorado},{...prevColorado})
            if(data._doc.notes){
                const actionlog = await Actionlogs.create({ number: Colorado.trailer, user: req.user.user, title: `Edited Colorado  Notes from "${prevColorado.notes}" to "${notes}" for Colorado Trailer` })
                io.emit("NEW_NOTIFICATION", actionlog)
            } else  if(data._doc.location){
                const actionlog = await Actionlogs.create({ number: Colorado.trailer, user: req.user.user, title: `Edited Colorado  Location from "${prevColorado.location}" to "${location}" for Colorado Trailer` })
                io.emit("NEW_NOTIFICATION", actionlog)
            } else if(data._doc.truck_num){
                const actionlog = await Actionlogs.create({ number: Colorado.trailer, user: req.user.user, title: `Edited Colorado Truck from "${prevColorado.truck_num}" to "${truck_num}" for Colorado Trailer` })
                io.emit("NEW_NOTIFICATION", actionlog)
            }else{
                const actionlog = await Actionlogs.create({ number: Colorado.trailer, user: req.user.user, title: `Edited Colorado Trailer Number` })
                io.emit("NEW_NOTIFICATION", actionlog)
            }
            return res.json({status:true, msg: "Edited Successfully", colorado: Colorado })

        } catch (error) {
            res.json({ status: false, msg:error.message })
        }
    })




    //Midwest Api's
    router.post('/midwest', AuthenticateUser, async (req, res) => {

        try {
            const { trailer, location, truck_num, notes } = req.body

            if (!trailer) {
                return res.json({ status: false, msg: "Please enter trailer number" })
            }

            const checked= await checkTrailer(req.body.trailer)
            if(checked){return res.json(checked)}     
            const Midwest = await Midwestes.create({
                trailer, location, truck_num, notes, user: req.id
            })
            io.emit("NEW_MIDWEST", Midwest)
            const actionlog = await Actionlogs.create({ number: Midwest.trailer, user: req.user.user, title: `Added Midwest Trailer` })
            io.emit("NEW_NOTIFICATION", actionlog)
            res.json({ status: true, msg: "Trailer added successfully" })

        } catch (error) {
            res.json({ status: false, msg:error.message })
        }
    })

    router.get('/midwest', AuthenticateUser, async (req, res) => {
        try {
            const coloradoses = await Midwestes.find({}).sort('createdAt')
            res.json({ status: true, msg: coloradoses })

        } catch (error) {
            res.json({ status: false, msg:error.message })
        }
    })



    router.delete('/midwest', AuthenticateUser, async (req, res) => {
        try {
            const { id } = req.query
            const midwest = await Midwestes.findByIdAndDelete(id)
            var obj = { midwest: midwest }
            io.emit("DELETED_MIDWEST", obj)
            const actionlog = await Actionlogs.create({ number: midwest.trailer, user: req.user.user, title: `Deleted Midwest Trailer` })
            io.emit("NEW_NOTIFICATION", actionlog)
            res.json({ msg: "Deleted Successfully", midwest: midwest })

        } catch (error) {
            res.json({ status: false, msg:error.message })
        }
    })

    router.put('/midwest', AuthenticateUser, async (req, res) => {
        try {
            const { trailer, location, truck_num, notes } = req.body
            const { id } = req.query
          const prevMidwest=await Midwestes.findById(id)
            const Midwest = await Midwestes.findByIdAndUpdate(id, { trailer, location, truck_num, notes, user: req.id }, { returnDocument: 'after' })
            var obj = { midwest: Midwest }
            io.emit("EDITED_MIDWEST", obj)
            const data=difference({...Midwest},{...prevMidwest})
            if(data._doc.notes){
                const actionlog = await Actionlogs.create({ number: Midwest.trailer, user: req.user.user, title: `Edited Midwest Notes from "${prevMidwest.notes}" to "${notes}" for Midwest Trailer` })
                io.emit("NEW_NOTIFICATION", actionlog)
            } else if(data._doc.truck_num){
                const actionlog = await Actionlogs.create({ number: Midwest.trailer, user: req.user.user, title: `Edited Midwest Truck from "${prevMidwest.truck_num}" to "${truck_num}" for Midwest Trailer` })
                io.emit("NEW_NOTIFICATION", actionlog)
            }else if(data._doc.location){
                const actionlog = await Actionlogs.create({ number: Midwest.trailer, user: req.user.user, title: `Edited Midwest Location from "${prevMidwest.location}" to "${location}" for Midwest Trailer` })
                io.emit("NEW_NOTIFICATION", actionlog)
            }else{
                const actionlog = await Actionlogs.create({ number: Midwest.trailer, user: req.user.user, title: `Edited Midwest Trailer Number` })
                io.emit("NEW_NOTIFICATION", actionlog)
            }
            return res.json({status:true, msg: "Edited Successfully", midwest: Midwest })

        } catch (error) {
            res.json({ status: false, msg:error.message })
        }
    })



    //Calendar Api's

    router.post('/calendar', AuthenticateUser, async (req, res) => {

        try {
            var { truck_num, loads, startDate, endDate, truck_color, loads_color } = req.body

            if (truck_num === "Add title") {
                truck_num = ""
            }
            if (!loads) {
                loads = ""
            }
            const check = await Calendars.findOne({ truck_num })
            if (check && truck_num !== "") {
                return res.json({ status: false, msg: "This truck already exist" })
            }
            const check2 = await Calendars.findOne({ loads })
            if (check2 && loads !== "") {
                return res.json({ status: false, msg: "This loads already exist " })
            }

            const Calendar = await Calendars.create({
                truck_num, loads, startDate, endDate, truck_color, loads_color
            })
            var obj = { calendar: Calendar, user: req.query.socketId }

            io.emit("NEW_CALENDAR", obj)

            res.json({ status: true, msg: "Shedule added successfully", data: Calendar })

        } catch (error) {
            res.json({ status: false, msg: error.message })
        }
    })

    router.get('/calendars', AuthenticateUser, async (req, res) => {
        try {
            const calendars = await Calendars.find({})
            res.json({ status: true, msg: calendars })

        } catch (error) {
            res.json({ status: false, error })
        }
    })



    router.delete('/calendar', AuthenticateUser, async (req, res) => {
        try {
            const { id } = req.query
            const calendar = await Calendars.findByIdAndDelete(id)
            var obj = { calendar: calendar }
            io.emit("DELETED_CALENDAR", obj)
            res.json({ msg: "Deleted Successfully", calendar: calendar })

        } catch (error) {
            res.json({ status: true, error })
        }
    })

    router.put('/calendar', AuthenticateUser, async (req, res) => {
        try {

            var { truck_num, loads, startDate, endDate, truck_color, loads_color } = req.body
            const { id, socketId } = req.query
            if (truck_num === "Add title") {
                truck_num = ""
            }
            if (!loads) {
                loads = ""
            }
            const Calendar = await Calendars.findByIdAndUpdate(id, { truck_num, loads, startDate, endDate, truck_color, loads_color }, { returnDocument: 'after' })
            var obj = { calendar: Calendar, user: socketId }

            io.emit("EDITED_CALENDAR", obj)
            return res.json({status:true, msg: "Edited Successfully", obj })

        } catch (error) {
            res.json({ status: true, error })
        }
    })

    //Logics Api's
    router.get('/logics', AuthenticateUser, async (req, res) => {
        try {
            const histories = await Logics.find({})
            res.json({ status: true, msg: histories[0] })

        } catch (error) {
            res.json({ status: false, error })
        }
    })
    router.put('/logic', AuthenticateUser, async (req, res) => {
        try {
            // const logic = await Logics.create({ ...req.body })
            const logic = await Logics.findByIdAndUpdate(req.query.id, { ...req.body }, { returnDocument: 'after' })
            return res.json({status:true, msg: "Changed Successfully", logic })
        } catch (error) {
            res.json({ status: false, error })

        }
    })

    return router;
}

module.exports = SocketRouter;