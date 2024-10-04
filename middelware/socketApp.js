const chatRooms = require("../models/chatRooms");
const notification = require("../models/notification");
let users = [];

class WebSockets {
    connection(socket) {
       let connectedUser = socket.handshake.query.userId;
       socket.emit('connection', `Welcome, user ${connectedUser}!`);
       let index = users.findIndex(u => u.userId === connectedUser);
       if (index === -1) {
            users.push({
                id: socket.id,
                userId: connectedUser,
                room_subscribe_in: undefined
            });
        } else {
            users[index] = {
                ...users[index],
                id: socket.id,
                room_subscribe_in: undefined
            };
        }
        let userName = socket.handshake.query.userId;
        console.log('-------------- Users -------------- ',userName, users)        
        socket.on('subscribe', function (room_id) {
            console.log('-------------- subscribe event -------------- ', room_id)
            let index = users.findIndex((x) => {
                return x['userId'] === socket.handshake.query.userId
            });
            socket.join(`${room_id}`);
            users[index]['room_subscribe_in'] = room_id;
            console.log('-------------- Users after subcribe -------------- ',userName, users)
        });
        socket.on('unsubscribe', function (room_id) {
                let index = users.findIndex((x) => {
                    return x['userId'] === socket.handshake.query.userId
                });
                if (users[index]['room_subscribe_in'] !== undefined) {
                    delete users[index].room_subscribe_in;
                }
                socket.broadcast.to(`${room_id}`).emit('userLeftChatRoom', userName);
                socket.leave(`${room_id}`)
            }
        );
        socket.on('new_message',function (data) {
            console.log('-------------- new_message event -------------- ', data)
            let {message,room_id} = JSON.parse(data)
            chatRooms.findById(room_id)
                    .populate('members')
                    .exec()
                    .then((room) => {
                        const other_member = room.members.find(m => m._id.toString() !== userName.toString());
                        const sender = room.members.find(m => m._id.toString() === userName.toString());
                        const index_wanted_user = users.findIndex(u => u.userId.toString() === other_member._id.toString());
                        const index_connectedUser = users.findIndex(u => u.userId.toString() === userName.toString());
            
                        const messageData = {
                            text: message,
                            is_read: false,
                            from_sender: room.initiated_by !== userName,
                            from_receiver: room.initiated_by === userName,
                            sender_id: socket.handshake.query.userId,
                            receiver_username: other_member.name,
                            // sender_username: sender.name
                        };
                        const sendNotification = () => {
                            const new_notif = new notification({
                                title:"new message",
                                type: 3,
                                publisher: socket.handshake.query.userId,
                                receiver_id: other_member._id,
                                message: message,
                                to: other_member._id,
                                roomId: room_id
                            });
                            return new_notif.save()
                                .then(() => {
                                    global.io.to(users[index_wanted_user].id).emit('message_notification', {
                                        message: message,
                                        room_id: room_id,
                                        userId: userName,
                                    });
                                });
                        };
                        const pushMessageAndNotify = () => {
                            room.messages.push(messageData); // traitement par ts
                            return room.save().then(() => {
                                if (index_wanted_user !== -1) {
                                    if (users[index_wanted_user].room_subscribe_in !== undefined) {
                                        if (users[index_wanted_user].room_subscribe_in === users[index_connectedUser].room_subscribe_in) {
                                            console.log('yser and sender on same roomm')
                                            global.io.to(users[index_wanted_user].id).emit('get_message', {
                                                userId: other_member._id,
                                                username: other_member.name,
                                                message: message,
                                                room_id: room_id
                                            });
                                        } 
                                        else {
                                            return sendNotification();
                                        }
                                    } else {
                                        console.log('Receiver is connected but not subscribed to the room:', other_member);
                                    }
                                }
                                // sendToDevice(other_member.fcm, { _id: other_member._id.toString() });
                            });
                        };
                        pushMessageAndNotify()
                            .catch(err => {
                                console.error('Error saving message or sending notification:', err);
                            });
            
                    }).catch(err => {
                        console.error('Error fetching room data:', err);
                    });
            
        }
        );
    }
}
WebSocket = new WebSockets();
module.exports = WebSocket