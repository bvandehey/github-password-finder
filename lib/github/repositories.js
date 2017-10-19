'use strict';

const config = require('../config/config');
const _ = require('lodash');
const queryBuilder = require('./query_builder');

const githubApiUrl = config.opts.githubApiUrl;
const rawGithubUrl = config.opts.rawSourceGithubUrl;
const githubHtmlUrl = config.opts.githubHtmlUrl;

const PER_PAGE = 100;

function buildRawUrl(htmlUrl) {
    return htmlUrl.replace(githubHtmlUrl, rawGithubUrl).replace('/blob/', '/');
}

function enrichFile(file, client) {
    return _.merge(file, {
        getContent: () => client.execute.get(client.buildOptions(buildRawUrl(file['html_url']), false), error => `Request for github commits failed with code ${error.statusCode} for the following url ${file['html_url']}`)
    });
}

async function loadAllPages(options, client) {
    let hasMore = true;
    let items = [];
    let page = 1;
    while(hasMore) {
        options.qs = _.merge(options.qs, {
            per_page: PER_PAGE,
            page: page
        });
        const result = await client.execute.get(options, error => `Request for github repository code failed with code ${error.statusCode} for the following options: ${JSON.stringify(options)}`);
        items = items.concat(result.items);
        hasMore = PER_PAGE * page < result['total_count'];
        page++;
    }
    return items;
}

module.exports.GithubUserRepositoryClient = class {
    constructor(buildOptions, executors) {
        this.buildOptions = buildOptions;
        this.execute = executors;
    }

    /**
     * @param codeToSearch
     *          Fragment of the code that should be searched for
     *
     * @param params {
     *
     *      user: username
     *      repo: repository name
     *
     * }
     */
    async searchInAllFiles(codeToSearch, params) {
        const options = _.merge(this.buildOptions(`${githubApiUrl}/search/code`), {
            qs: {
                q: queryBuilder.query(codeToSearch, params)
            }
        });
        const result = await loadAllPages(options, this);
        return result.map(commit => enrichFile(commit, this));
    }
};