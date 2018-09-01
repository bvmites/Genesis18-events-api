const crp = require('crypto');

module.exports = (passwordText, salt, iterations) =>
    crp.pbkdf2Sync(passwordText, salt, iterations, 512, 'sha512').toString('hex');