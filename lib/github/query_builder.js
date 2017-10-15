'use strict';

const _ = require('lodash');

function transformParams(params) {
    let result = [];
    _.each(params, (value, key) => {
        result.push(`${key}:${value}`);
    });
    return _.isEmpty(result) ? undefined : result.join('+');
}

module.exports.query = (phrase, params) => {
    const message = encodeURIComponent(phrase);
    const paramsString = transformParams(params);
    return paramsString ? message + paramsString : message;
};