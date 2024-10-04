const chatRooms = require('../models/chatRooms');

class chatRoomRepository {
    constructor() {
        this.collection = chatRooms
    };
    getAll(critere) {
        return new Promise((resolve, reject) => {
            let classes = this.collection.find(critere).populate('members').populate("messages.sender_id")
            .sort({updatedAt: -1})
            resolve(classes);
        });
    };
    getAll_with_pagination(critere) {
        const filter= critere.filter
        const perPage= critere.perPage
        const page= critere.page
        return new Promise((resolve, reject) => {
            let classes = this.collection.find(filter).populate('members').populate("messages.sender_id")
            .sort({updatedAt: -1})
            .skip((perPage * page) - perPage)
            .limit(perPage);
            resolve(classes);
        });
    };

    getById(id) {
        return new Promise((resolve, reject) => {
            let classes = this.collection.findById(id).populate('members').populate("messages.sender_id");
            resolve(classes);
        });
    };
    create(obj) {
        return new Promise((resolve, reject) => {
            let classes=  this.collection.create((obj));
            resolve(obj);
        });
    };

    get_count(critere) {
        return new Promise(async (resolve, reject) => {
            let chat_room_count = await this.collection.countDocuments(critere).exec();
            resolve(chat_room_count);
        });
    };

    update(criteria, obj) {
        return new Promise((resolve, reject) => {
            this.collection.update({_id: criteria}, {$set: obj}).exec();
            resolve(obj);
        });
    };

    delete(criteria) {
      
        return new Promise((resolve, reject) => {
            this.collection.findOneAndRemove({ _id: criteria }).exec(function(err,item){
                resolve(item);

            });
           
        });
    };

}
module.exports = chatRoomRepository;
