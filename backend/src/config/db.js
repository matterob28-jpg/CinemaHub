const mongoose= require('mongoose')

// If the connection fails we shut down the process: better no server than a server with no database behind it
const connectDB =async () =>{
    try{
        const conn= await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB Connected: "+conn.connection.host);
    }catch (error){
        console.error("failed to connect Mongodb: "+ error.message)
        process.exit(1);
    }
}
module.exports=connectDB;
