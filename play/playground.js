const crypto = require('crypto');


var pass="";

var hashedPassword = crypto.createHmac('sha256', 'dontmesswithusbitch')
                            .update(pass)                 // Hashing Entered Password
                            .digest('hex');

            console.log(hashedPassword);
