'use strict';

const config = require('../config/config');
const _ = require('lodash');
const queryBuilder = require('./query_builder');

const githubApiUrl = config.opts.githubApiUrl;
const rawGithubUrl = config.opts.rawSourceGithubUrl;

function buildRawUrl(htmlUrl) {
    return htmlUrl.replace(githubApiUrl, rawGithubUrl).replace('/blob/', '/');
}

function enrichFile(file, client) {
    return _.merge(file, {
        getContent: () => client.execute.get(client.buildOptions(buildRawUrl(file['html_url'])))
    });
}

module.exports.GithubUserRepositoryClient = class {
    constructor(buildOptions, executors) {
        this.buildOptions = buildOptions;
        this.execute = executors;
    }

    /**
     *
     * @param params {
     *
     *      user: username
     *      repo: repository name
     *
     * }
     */
    async searchInAllFiles(params) { //TODO: the result can contain the info about max 100 files. Add the paging support
        const options = this.buildOptions(`${githubApiUrl}/search/code?q=${queryBuilder.query(message, params)}`);
        const result = await this.execute.get(options, (error, response) => `Request for github repository code failed with code ${response.statusCode}`);
        return result.items.map(commit => enrichFile(commit, this));
    }
};