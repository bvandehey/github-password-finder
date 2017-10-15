'use strict';

const github = require('../github/client');
const constants = require('./constants');
const _ = require('lodash');
const contentTesters = require('./content_testers');

const ANTI_PATTERNS = [
  'localhost',
  '127.0.0.1'
];

async function scanFileForCredentials(file, keyword) {
    const testers = contentTesters.collectTesters(file.name);
    if (_.isEmpty(testers)) {
        return [];
    }
    const content = await file.getContent();
    const containsPassword = testers.some(tester => tester.test(keyword, content));
    const containsAntiPatterns = ANTI_PATTERNS.some(antiPattern => tester.test(antiPattern, content));
    return containsPassword && !containsAntiPatterns;
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
        const scannedFiles = await Promise.all(files.map(file => scanFileForCredentials(file, keyword)));
    }));
};