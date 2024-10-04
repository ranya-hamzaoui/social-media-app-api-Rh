const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const notifications_schema = Schema({
    seen:{
        type: Boolean,
        default:false
    },
    type: {
        type: Number,
        enum: [0,1,2,3] 
    },
    title:{
        type: String
    },
    message: String,
    to : {
       type: mongoose.Types.ObjectId,
       ref:'user'
    },
    publisher: String,
    receiver_id: String,
    roomId: String
});
module.exports = mongoose.model('Notification', notifications_schema);
