'use strict';

const commitSearcher = require('./searchers/commit_searcher');
const repositorySearcher = require('./searchers/repository_searcher');
const github = require('./github/client');

function printOutUserReport(user, result) {
    console.log('------------------------------------------------');
    console.log(`Report for user ${user}\r\n\r\n`);
    console.log(JSON.stringify(result, null, '\t'));
}

async function findForUser(user) {
    const [repositoryFiles, commitFiles] = await Promise.all([repositorySearcher.searchByRepositories({user}), commitSearcher.searchByCommits({user})]);
    const result = {repositoryFiles, commitFiles};
    printOutUserReport(user, result);
    return result;
}

module.exports = {
    findForUser: findForUser,
    findAll: async () => {
        let users = await github.users.listUsers();
        while(users.length > 0) {
            await Promise.all(users.map(user => findForUser(user.login)));
            users = await github.users.listUsers(users[users.length - 1].id);
        }
    }
};