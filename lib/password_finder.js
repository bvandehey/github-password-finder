'use strict';

const commitSearcher = require('./searchers/commit_searcher');
const repositorySearcher = require('./searchers/repository_searcher');

module.exports = {
    findForUser: async user => {
        const [repositoryFiles, commitFiles] = await Promise.all([repositorySearcher.searchByRepositories({user}), commitSearcher.searchByCommits({user})]);
        return {repositoryFiles, commitFiles};
    }
};