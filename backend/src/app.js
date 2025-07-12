const express = require("express"); //way of importing in Common JS

const app = express() // To create app
const cors = require("cors")
const morgan = require("morgan");
const ApiError = require("./utils/ApiError");
const ErrorHandling = require("./middlewares/ErrorHandler");

app.use(cors({
    // origin: "http://192.168.44.33:5173", 
    // above is for college pc
    origin: "http://localhost:5173", 
    // above is for my laptop
    credentials: true
}));

app.use(morgan("dev"));
app.use(express.json({limit:"10mb"})); //will accept 10mb data otherwise it will throw error
app.use(express.urlencoded({extended:false}));

app.use("/api/v1",require("./routes"));

app.use("*",(req,res)=>{
    throw new ApiError(404,"Page Not Found");
})

app.use(ErrorHandling);

module.exports = app; // For exporting