'use strict';

const commitSearcher = require('./searchers/commit_searcher');
const repositorySearcher = require('./searchers/repository_searcher');

module.exports = {
    findForUser: async user => {
        // even if the repository no longer contains the credentials, it might have at some point,
        // so search for the commits that might mention something about credentials
        //const committedFiles = await commitSearcher.searchByCommits({user}); //TODO: uncomment later
        await repositorySearcher.searchByRepositories({user});
        console.log('');
    }
};