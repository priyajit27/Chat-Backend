const mongoose = require("mongoose");
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI;
// local host ar jaygay eta aibo
mongoose.set('strictQuery', true);
const  connectDB=()=>{
 mongoose.connect(mongoURI,()=>{
    // mongo.connect() is a function
    console.log(`Connected to ${mongoURI} successfully`)
})
}

module.exports =  connectDB;





