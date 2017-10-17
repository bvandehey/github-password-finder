'use strict';

const config = require('./lib/config/config');
const passwordFinder = require('./lib/password_finder');

config.init()
    .then(() => {
        if (config.opts.user) {
            return passwordFinder.findForUser(config.opts.user);
        }
    })
    .then(result => {
        console.log(JSON.stringify(result, null, '\t'));
        process.exit();
    });