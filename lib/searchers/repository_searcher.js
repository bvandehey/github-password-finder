'use strict';

const github = require('../github/client');
const constants = require('./constants');
const _ = require('lodash');
const contentTesters = require('./content_testers');

async function scanFileForCredentials(file) {
    const testers = contentTesters.collectTesters(file.path);
    if (_.isEmpty(testers)) {
        return [];
    }
    const content = await file.getContent();
    return testers.some(tester => tester.test(content)) ? new RepositoryFile(file, content) : null;
}

class RepositoryFile {
    constructor(file, content) {
        this.content = content;
        this.path = file.path;
        this.name = file.name;
        this.gitUrl = file['git_url'];
        this.htmlUrl = file['html_url'];
        this.repository = {
            name: file.repository.name,
            htmlUrl: file.repository.html_url
        };
    }

    toString() {
        const clone = _.cloneDeep(this);
        delete clone.content;
        _.each(this, (value, key) => {
            if (_.isFunction(value)) {
                delete clone[key];
            }
        });
        return JSON.stringify(clone, null, '\t');
    }
}

function uniquePaths(passwordFiles) {
    const map = new Map();
    passwordFiles.forEach(file => {
        map.set(file.path, file);
    });
    return Array.from(map.values());
}

/**
 * @param params {
 *      user: user name
 *      repo: repository name
 * }
 */
module.exports.searchByRepositories = async params => {
    const passwordFiles = await Promise.all(constants.SECRET_KEYWORDS.map(async keyword => {
        const files = await github.userRepos.searchInAllFiles(keyword, params);
        return await Promise.all(files.map(scanFileForCredentials));
    }));
    const flattenedPasswordFiles = _.flatten(passwordFiles).filter(file => !_.isEmpty(file));
    return uniquePaths(flattenedPasswordFiles);
};