'use strict';

const optionsParser = require('options-parser');
const readline = require('readline');
const config = require('../../config/config');
const _ = require('lodash');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const options = optionsParser.parse({
    user: {short: 'u'},
    all: {short: 'a', flag: true},
    since: {short: 's'},
    clientId: {short: 'cid'},
    clientSecret: {short: 'cs'}
});

module.exports.opts = config;

module.exports.init = () => new Promise((resolve, reject) => {
    if (!options.opt.user && !options.opt.all) {
        console.log(`You have to specify either 'user' or 'all' parameter\r\n
        npm index.js --user <github_username>\r\n
        npm index.js --all`);
        return reject();
    }

    module.exports.opts = _.merge(module.exports.opts, options.opt);

    if (options.opt.clientId && options.opt.clientSecret) {
        return resolve();
    }

    console.log('GitHub limits the number of unauthorized requests you can make per hour. For this purpose you have to specify the client_id and client_secret that will be used to authenticate your calls');
    rl.question('client_id:', clientId => {
        module.exports.opts.clientId = clientId;
        rl.question('client_secret:', secret => {
            module.exports.opts.clientSecret = secret;
            resolve();
        });
    });
});