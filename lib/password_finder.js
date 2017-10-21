'use strict';

const commitSearcher = require('./searchers/commit_searcher');
const repositorySearcher = require('./searchers/repository_searcher');
const github = require('./github/client');
const _ = require('lodash');
const repository = require('./repository');

async function findForUser(user) {
    console.log('------------------------------------------------');
    _.isObject(user)
        ? console.log(`Scanning user ${user.login} with ID ${user.id}\r\n`)
        : console.log(`Scanning user ${user}\r\n`);

    const login = _.isString(user) ? user : user.login;
    const [repositoryFiles, commitFiles] = await Promise.all([repositorySearcher.searchByRepositories({user: login}), commitSearcher.searchByCommits({user: login})]);
    const result = {repositoryFiles, commitFiles};

    _.isEmpty(result.repositoryFiles) && _.isEmpty(result.commitFiles)
        ? console.info('User is clean')
        : console.log(`Repository files:\r\n${result.repositoryFiles}\r\nCommit Files:\r\n${result.commitFiles}`);
    return result;
}

module.exports = {
    findForUser: findForUser,
    findAll: async since => {
        let users = await github.users.listUsers(since);
        while(users.length > 0) {
            for (let user of users) {
                try {
                    const result = await findForUser(user);
                    if (!_.isEmpty(result.repositoryFiles) || !_.isEmpty(result.commitFiles)) {
                        await repository.persistReport(_.merge(result, {
                            user: {
                                login: user.login,
                                id: user.id
                            }
                        }));
                    }
                } catch(err) {
                    if (_.isString(err) && err.includes('422')) {
                        console.info(`The user ${user.login} wit ID ${user.id} doesn't seem to have any public repositories`);
                    } else {
                        console.error(err);
                    }
                } finally {
                    await repository.persistLastId(user.id);
                }
            }
            users = await github.users.listUsers(users[users.length - 1].id);
        }
    }
};