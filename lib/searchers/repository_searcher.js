'use strict';

const github = require('../github/client');
const constants = require('./constants');
const _ = require('lodash');
const contentTesters = require('./content_testers');

async function scanFileForCredentials(file) {
    const testers = contentTesters.collectTesters(file.name);
    if (_.isEmpty(testers)) {
        return [];
    }
    const content = await file.getContent();
    return testers.some(tester => tester.test(content));
}

/**
 * @param params {
 *      user: user name
 *      repo: repository name
 * }
 */
module.exports.searchByRepositories = async params => {
    await Promise.all(constants.SECRET_KEYWORDS.map(async keyword => {
        const files = await github.userRepos.searchInAllFiles(keyword, params);
        const scannedFiles = await Promise.all(files.map(file => scanFileForCredentials(file)));
    }));
};