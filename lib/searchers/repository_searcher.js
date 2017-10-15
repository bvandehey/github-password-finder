'use strict';

const github = require('../github/client');

function scanFileForCredentials(file) {

}

/**
 * @param params {
 *      user: user name
 *      repo: repository name
 * }
 */
module.exports.searchByRepositories = async params => {
    const files = await github.userRepos.searchInAllFiles(params);
};