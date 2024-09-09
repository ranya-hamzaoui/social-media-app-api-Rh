const multer = require('multer');

const Storage = multer.diskStorage(
    {
        destination: function (req, file, cb) {

            cb(null, './photos/');

        },
        filename: function (req, file, cb) {

            cb(null,new Date().toISOString().replace( /:/g, '-') + file.originalname)
        }
    });

const fileFilterFN = function (req, file, cb) {

    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|PNG|svg)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    else {
        cb(null, true)
    }
};

module.exports = multer({
    storage: Storage,
    fileFilter: fileFilterFN,
    limits: {_fileSize: 1024 * 1024 * 5},

});

