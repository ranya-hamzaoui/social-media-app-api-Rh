'use strict';
const notification = require('../models/notification');

async function getNotifs(req, res) {
    try {
        const page = Number(req.params.page)|| 1;
        const itemsPerPage =  Number(req.params.perPage) || 10 ;
        const notifications = await notification.find({to: req.sub.userId})
                                .sort('-createdAt')
                                .skip((page - 1) * itemsPerPage)
                                .limit(itemsPerPage)
                                .exec();

        const totalNotifs = await notification.countDocuments({to: req.sub.userId});
        if (!notifications || notifications.length === 0) {
            return res.status(404).send({ message: 'No posts available',notifications : [] });
        }

        // await  notifications.forEach(async (n) => {
        //     await   notification.update({_id: n._id}, {seen: true});
        // });

        return res.status(200).send({
            totalPages: Math.ceil(totalNotifs / itemsPerPage),
            currentPage: page,
            itemsPerPage: itemsPerPage,
            notifications
        });
    } catch (error) {
        console.log('err',error)
        return res.status(500).send({ message: 'Error returning the notifications' });
    }
}

module.exports = {
    getNotifs
}