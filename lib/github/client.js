'use strict';

let request = require('request-promise');
const config = require('../config/config');
const _ = require('lodash');
const httpCodes = require('http-codes');
const GithubCommitClient = require('./commits').GithubCommitClient;
const GithubUserRepositoryClient = require('./repositories').GithubUserRepositoryClient;
const GithubUserClient = require('./users').GithubUserClient;

const sleep = millis => new Promise(resolve => setTimeout(resolve, millis));

function buildOptions(url, json = true, beta = false) {
    const result = {
        qs: {
            client_id: _.get(config, 'opts.clientId'),
            client_secret: _.get(config, 'opts.clientSecret')
        },
        url: url,
        json: json,
        headers: {
            'User-Agent': 'git-password-detector'
        }
    };
    if (beta) {
        result.headers['Accept'] = 'application/vnd.github.cloak-preview';
    }
    return result;
}

function exceededTheMaxNumberOfRequests(err) {
    return err.statusCode === httpCodes.FORBIDDEN && err.response.headers['x-ratelimit-remaining'] == 0;
}

function abuseDetectionMechanism(err) {
    return err.statusCode === httpCodes.FORBIDDEN && err.response.headers['retry-after'];
}

function calculateRemainingMillisUntilRateReset(rateLimitReset) {
    const willResetAt = new Date(rateLimitReset * 1000);
    const result = willResetAt.getTime() - new Date().getTime() || 1000;
    console.log(`Exceeded the request per hour limit. The request will be re-attempted in ${result} milliseconds. That is at ${willResetAt}`);
    return result;
}

function executeGetRequest(options, buildErrorMessage) {
    return request.get(options)
        .catch(err => {
            if (exceededTheMaxNumberOfRequests(err) || abuseDetectionMechanism(err)) {
                const waitNeeded = err.response.headers['retry-after']
                    ? parseInt(err.response.headers['retry-after']) * 1000
                    : calculateRemainingMillisUntilRateReset(parseInt(err.response.headers['x-ratelimit-reset']));
                return sleep(waitNeeded)
                    .then(() => executeGetRequest(options, buildErrorMessage));
            }
            return Promise.reject(buildErrorMessage(err));
        })
}

module.exports = {
    commits: new GithubCommitClient(buildOptions, {get: executeGetRequest}),
    userRepos: new GithubUserRepositoryClient(buildOptions, {get: executeGetRequest}),
    users: new GithubUserClient(buildOptions, {get: executeGetRequest})
};