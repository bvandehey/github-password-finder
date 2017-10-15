'use strict';

const config = require('../config/config');
const _ = require('lodash');

const githubApiUrl = config.opts.githubApiUrl;

function buildQuery(params) {
    let result = '';
    _.each(params, (value, key) => {
        result += `${key}:${value}`;
    });
    return result === '' ? undefined : result;
}

function enrichCommit(commit, client) {
    return _.merge(commit, {
        getFiles: async () => {
            const details = await client.execute.get(client.buildOptions(commit.url));
            return details.files;
        }
    });
}

module.exports.GithubCommitClient = class {
    constructor(buildOptions, executors) {
        this.buildOptions = buildOptions;
        this.execute = executors;
    }

    /**
     *
     * @param message
     *          commit message
     * @param params {
     *
     *      user: username
     *      repo: repository name
     *
     * }
     */
    async searchByMessage(message, params) {
        const options = this.buildOptions(`${githubApiUrl}/search/commits?q=${encodeURIComponent(message)}+${buildQuery(params)}`, true, true);
        const result = await this.execute.get(options, (error, response) => `Request for github commits failed with code ${response.statusCode}`);
        return result.items.map(commit => enrichCommit(commit, this));
    }
};