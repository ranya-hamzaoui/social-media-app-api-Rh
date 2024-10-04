const Repository = require('../services/chatRoomService');
const Transformer = require('../services/chatRoomTransformer');

const { ResponseRender, paginate } = require('../helpers/glocal-functions');
const  { errors_messages } = require('../constants/errors_messages');
const  { success_messages } = require('../constants/success_messages');

const User = require('../models/user');
const chatRooms = require('../models/chatRooms');
const transformer = new Transformer();

const getAll = async function(req, res, next)  {

        let page = Number(req.params.page_nbr) || 1;
        let perPage = Number(req.params.perPage) || 10;
        const {userId} = req.sub 
        const repo = new Repository();

        try {
            let data = await repo.getAll_with_pagination({filter:{ members: { $in: userId } }}) 
            let data_chats= data.filter(el=>el.messages.length>0) 
            let count = await repo.get_count({members: { $in: userId }}) 
            return res.status(200).json( ResponseRender(200,success_messages.LIST_FOUND,
                {
                chats: transformer.list(data_chats,userId),
                count: data_chats.length,
                current_page: Number(page),
                total_pages: Math.ceil(count / perPage)
            } ) )

        } catch (error) {
            console.log('error', error)
            return res.status(500).json(ResponseRender(500, errors_messages.SERVER_ERROR, []))
        }
    };
const getById = async function (req, res, next) { 

        const repo = new Repository();
        try {
            let data = await repo.getById(req.params._id);
            if (data) return res.status(200).json(ResponseRender(200,success_messages.ITEM_FOUND,transformer.getbyId(data)))   
            return res.status(408).json(ResponseRender(408, errors_messages.SERVER_ERROR, []))
            
        } catch (error) {
            console.log('error', error)
            return res.status(500).json(ResponseRender(500, errors_messages.SERVER_ERROR, []))
        }
    };
const initiateOld = async function (req, res, next) {

    const repo = new Repository();
    let user_id = req.sub.userId;
    let receiver_id = req.params.receiver_id;
    let list_users = [receiver_id, user_id]; 
    let page = Number(req.params.page_nbr) || 1;
    let per_page = Number(req.params.perPage) || 10;

    try {
         let wanted_user = await User.findOne({_id: receiver_id});
         if(wanted_user) {
            let room = await repo.getAll({ $and:[{members: {$in: [receiver_id, receiver_id] }},{members: {$in: [user_id, user_id] }}]})
           if (room.length < 1) {
            console.log('not initate')
               let new_room = new chatRooms({
                   members: list_users,
                   initiated_by: user_id
               })
               new_room.save().then((saved_room) => {
                   let response = {
                       message: "chat room ",
                       status: 200,
                       data: {
                           room: {
                            _id: saved_room._id,
                            members:[
                                   {
                                   _id:wanted_user._id,
                                   user_name:wanted_user.name,
                                   avatar:wanted_user.photo
                                    }, 
                                    {
                                    _id:req.sub.userId,
                                    user_name:req.sub.name,
                                    avatar:wanted_user.photo
                                    } 
                            ],
                            messages: []
                           }
                       }
                   }
                   res.status(200).json(response)
               })
                   .catch((err) => {
                       console.log('err', err)
                       res.status(500).json({
                           status: 500,
                           error: err
                       })
                   })
           }
           else {
               console.log('already initate')
               let response = {
                   status: 200,
                   data: {
                       room: {
                           _id: room[0]._id,
                           members: room[0].members.map((el)=>{
                            return ({
                                _id:el._id,
                                user_name:el.name,
                                avatar:el.photo
                            }) 
                           }),
                           messages: paginate(room[0].messages.sort(function(a, b) {
                            a = new Date(a.createdAt);
                            b = new Date(b.createdAt);
                            return a>b ? -1 : a<b ? 1 : 0;
                           }), per_page, page).map((m) => {
   
                               return ({
                                   text: m.text,
                                   is_read: true,
                                    sender_id: {
                                    _id:m.sender_id._id,
                                    user_name:m.sender_id.name,
                                    avatar:m.sender_id.photo
                                    },
                                    createdAt:m.createdAt
                               })
   
                           })
                       },
                       count: room[0].messages.length,
                       current_page: page,
                       total_pages: Math.ceil(room[0].messages.length / per_page)
                   }
               }
   
               res.status(200).json(response)
           }
         }
         else {
            return res.status(200).json( ResponseRender(200,"User not found", null) )
         }   
        } 
    catch (error) {
        return res.status(500).json({
            message: `Unknown Error Occured : ${error.message || error}`
        })
    }
};
const initiate = async (req, res, next) => {
    const repo = new Repository();
    const {userId} = req.sub;
    const receiverId = req.params.receiver_id;
    let listUsers = [userId, receiverId]; 
    const page = Number(req.params.page_nbr) || 1;
    const perPage = Number(req.params.perPage) || 6;
    try {
        const wantedUser = await User.findById(receiverId);
        if (!wantedUser) {
            return res.status(200).json(ResponseRender(200, "User not found", null));
        }
        const room = await repo.getAll({
            members: { $all: listUsers }
        });

        if (room.length === 0) {
            console.log('not initiate');
            const newRoom = new chatRooms({
                members: listUsers,
                initiated_by: userId
            });
            const savedRoom = await newRoom.save();
            const response = createRoomResponse(savedRoom, wantedUser, req.sub);
            return res.status(200).json(response);
        } else {
            console.log('already initiated');
            const response = createRoomResponse(room[0], wantedUser, req.sub, page, perPage);
            return res.status(200).json(response);
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            message: `Unknown Error Occurred: ${error.message || error}`
        });
    }
};
const createRoomResponse = (room, wantedUser, currentUser, page = 1, perPage = 8) => {
    const members = room.members.map(el => ({
        _id: el._id,
        name: el.name,
        photo: el.photo
    }));

    const messages = paginate(room.messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), perPage, page).map(m => ({
        text: m.text,
        is_read: true,
        sender: {
            _id: m.sender_id._id,
            name: m.sender_id.name,
            photo: m.sender_id.photo
        },
        createdAt: m.createdAt
    }));
    return {
        status: 200,
        data: {
            room: {
                _id: room._id,
                members: members,
                messages: messages
            },
            total: room.messages.length,
            current_page: page,
            total_pages: Math.ceil(room.messages.length / perPage)
        }
    };
};
 const get_conversation_with = async function (req, res, next) { 
    const repo = new Repository();
    const sender= req.sub.userId
    const receiver= req.params._id
    try {
        let data = await repo.getAll({filter:{$and:[{"messages.sender_id":sender}, {}]}});
        return res.status(200).json(ResponseRender(200,success_messages.ITEM_FOUND,transformer.list(data)))   
    } catch (error) {
        console.log('error', error)
        return res.status(500).json(ResponseRender(500, errors_messages.SERVER_ERROR, []))
    }
};

 const delete_one = async function (req, res, next) {
    const repo = new Repository();
    try {
      const criteria = req.params._id       
      let data = await repo.delete(criteria)
      return res.status(200).json(ResponseRender(200,success_messages.ITEM_DELETED,data))   
    } catch (error) {
        console.log('error', error)
        return res.status(500).json(ResponseRender(500, errors_messages.SERVER_ERROR, []))
    }
};

module.exports = {
    getAll,
    getById,
    initiate,
    get_conversation_with,
    delete_one
}