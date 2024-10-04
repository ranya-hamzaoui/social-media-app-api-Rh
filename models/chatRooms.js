const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let messages_schema = new mongoose.Schema({

    text: String,
    from_sender: {
        type: Boolean,
        default: false
    },
    from_receiver: {
        type: Boolean,
        default: false
    },
    sender_id:  {    
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    is_read: {
        type: Boolean,
        default: false
    },
    receiver_username: String,
    sender_username: String
}, {
    timestamps: true, usePushEach: true
})

const chat_rooms_schema = Schema({
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    initiated_by : String,
    messages: [messages_schema]
},{
    timestamps : true ,  usePushEach: true
});

module.exports = mongoose.model('chatRoom', chat_rooms_schema);
