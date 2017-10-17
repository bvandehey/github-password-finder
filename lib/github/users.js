'use strict';

const config = require('../config/config');
const _ = require('lodash');

const githubApiUrl = config.opts.githubApiUrl;

module.exports.GithubUserClient = class {
    constructor(buildOptions, executors) {
        this.buildOptions = buildOptions;
        this.execute = executors;
    }

    async listUsers(since) {
        const options = _.merge(this.buildOptions(`${githubApiUrl}/users`), {qs: {since}});
        const result = await this.execute.get(options, error => `Request for github users failed with code ${error.statusCode}`);
        return result;
    }
};