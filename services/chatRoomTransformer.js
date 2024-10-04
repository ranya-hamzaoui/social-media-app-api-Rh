class Transformer{
    constructor(){}
    create(data) {
        var output = [];    
        return data

    };
    list(data,user_id) {
        var output = [];
        console.log('user connected data', user_id)
        data.forEach(dt => {

            output.push({

                _id:dt._id,
                members: dt.members.filter(el=> el._id!=user_id).map(el=> ( 
                    {
                    _id:el._id,
                    name:el.name,
                    phone:el.phone,
                    currentUser: el._id == user_id ? true : false
                })),
                messages: dt.messages.map(el=> ( {
                    _id: el._id,  
                    text: el.text,    
                    is_read: true,
                    from_current_user: el.sender_id._id == user_id._id ? true : false,
                    sender: {
                        _id:el.sender_id._id,
                        name:el.sender_id.name
                    },
                    createdAt: el.createdAt
                })) 
                
            })
        });
        return output.map(el=> el.members[0])
    };
    getbyId(dt) {

        var output = {

                _id:dt._id,

                members: dt.members.map(el=> ( {
                    _id:el._id,
                    user_name:el.user_name

                })),

                messages: dt.messages.map(el=> ( {

                      from_sender: el.from_sender,
                      from_receiver: el.from_receiver,
                      is_read: true,
                      _id: el._id,
                      text: el.text,

                      sender_id: {
                        _id:el.sender_id._id,
                        user_name:el.sender_id.user_name
                      },

                      createdAt: el.createdAt
                 
                })) 
                
           
        }

        return output
    };
}

module.exports = Transformer