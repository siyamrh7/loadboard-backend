const express= require('express')
const mongoose=require('mongoose')
const cors=require('cors')
require('dotenv').config()

const app=express()

mongoose.connect(process.env.MONGODB_URI,{useNewUrlParser: true, useUnifiedTopology: true})
.then(res=>console.log("Database connected")).catch(err=>console.log(err))

const server = require("http").createServer(app);
const io = require("socket.io")(server, {
    cors: {
      origin: "*",
    },
  });

const socketRouter = require("./Routes/SocketRouter")(io);


app.use(cors())
app.use(express.json())
app.use('/uploads',express.static('./uploads'))

app.use('/',socketRouter)
io.on("connection", (socket) => {
    console.log("connected");
  });

server.listen(process.env.PORT,()=>{
    console.log("server is running")
})

