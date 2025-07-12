const {default:mongoose} = require("mongoose");
const {PUBLIC_DATA} = require("../../constant");

exports.ConnectDB = async()=>{
    try{ // to catch errors mongoose errors
        await mongoose.connect(PUBLIC_DATA.mongo_uri);
        console.log(`App is connected with  ${mongoose.connection.host} `);
    }
    catch(error){
        mongoose.disconnect(); // for preventing data from getting harmed
        process.exit(1) //To stop the app from running (1 code for terminating app)
    }
}