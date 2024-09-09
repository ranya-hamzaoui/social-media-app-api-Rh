var nodemailer = require('nodemailer');
var config = require('../config/config');

var transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: true,
        auth: {
            user: config.app_email,
            pass: config.app_mdp_email
        },
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false
        }

    });

exports.send_mail= function(email , subject , html){
    var mailOptions = {
        from: config.app_email,
        to: email,
        subject: subject,
        text: 'readytgo',
        html: html
    };

    return transporter.sendMail(mailOptions).then(function (info, error) {
        if (error) {
            return ('error')
        }
        else {

            return ('done')
        }
    }).catch(function (err) {
        return (err)

    });
};