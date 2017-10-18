'use strict';

const commitSearcher = require('./searchers/commit_searcher');
const repositorySearcher = require('./searchers/repository_searcher');
const github = require('./github/client');
const _ = require('lodash');

function printOutUserReport(user, result) {
    console.log('------------------------------------------------');
    _.isObject(user)
        ? console.log(`Report for user ${user.login} with ID ${user.id}\r\n`)
        : console.log(`Report for user ${user}\r\n`);
    _.isEmpty(result.repositoryFiles) && _.isEmpty(result.commitFiles)
        ? console.info('User is clean')
        : console.log(`Repository files:\r\n${result.repositoryFiles}\r\nCommit Files:\r\n${result.commitFiles}`);
}

async function findForUser(user) {
    const login = _.isString(user) ? user : user.login;
    const [repositoryFiles, commitFiles] = await Promise.all([repositorySearcher.searchByRepositories({user: login}), commitSearcher.searchByCommits({user: login})]);
    const result = {repositoryFiles, commitFiles};
    printOutUserReport(user, result);
    return result;
}

module.exports = {
    findForUser: findForUser,
    findAll: async since => {
        let users = await github.users.listUsers(since);
        while(users.length > 0) {
            for (let user of users) {
                try {
                    await findForUser(user);
                } catch(err) {
                   console.error(err);
                }
            }
            users = await github.users.listUsers(users[users.length - 1].id);
        }
    }
};