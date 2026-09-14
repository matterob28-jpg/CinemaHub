const mongoose=require("mongoose");

const roomData= new mongoose.Schema(
    {
        name: {type: String, required: true, trim: true},
        capacity:{ type:Number, required:true, min:1 },


    },
    {_id:true}
);

const cinemaData = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    rooms: [roomData],
  },
  { timestamps: true }
);
// Text index on name and city for cinema search
cinemaData.index({ name: "text", city: "text" });

module.exports=mongoose.model("cinema",cinemaData);
