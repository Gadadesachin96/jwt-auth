const express = require("express");
const userRouter = require("./routes/userRoutes");
const app = express();



const mongoose = require("mongoose");
app.use(express.json());
app.use("/users",userRouter)



app.get("/",(req,resp)=>{
    resp.send("This is api")
})



mongoose.connect("mongodb+srv://gadadesachin51:sachin123@cluster0.vtugnc8.mongodb.net/")
.then(()=>{
app.listen(4000,()=>{
console.log(" started on 4000 port")

})
})
.catch((error)=>{
    console.log(error);
})

