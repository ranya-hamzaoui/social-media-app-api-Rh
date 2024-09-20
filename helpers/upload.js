const multer = require('multer');
const fileFilterFN = function (req, file, cb) {

    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|PNG|svg)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    else {
        cb(null, true)
    }
};

const Storage = multer.diskStorage(
    {
        destination: function (req, file, cb) {
            console.log('fileeeeeeee', file.originalname)
            cb(null, './uploads/');
        },
        filename: function (req, file, cb) {
            cb(null,file.originalname)
        }
    });
module.exports = multer({
    storage: Storage,
    // fileFilter: fileFilterFN,
    // limits: {_fileSize: 1024 * 1024 * 5},

});

