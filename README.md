# About
The application makes it much easier and faster to find all sorts of credentials stored in github,
by 
* scanning the content of the repositories
* scanning the commits explicitly mentioning the credentials
* automatically excluding password references, that are obviously not actually hardcoded passwords, based on the predefined regular expressions

# Requirements
NodeJS v8.1.+

# Installation
Before the first use the application dependencies need to be installed. You can do so by running
`npm install` from the root of the project.

# Usage
## Parameter description
* username - string - name of the user whose repositories should be scanned for passwords
* github_client_id - github OAuth credentials, required to access GitHub API - can be acquired from https://github.com/settings/developers
* github_client_secret - github OAuth credentials, required to access GitHub API - can be acquired from https://github.com/settings/developers
* user_id - integer number
* mongo_url - mongo database url, in case you want to store the results in the mongo database. The url should be provided in one of the following formats:
    * [DNS/IP address>]:[port if different than 27017 which is default for mongodb]/[database name] - if the database does not require any authentication
    * [username]:[password]@[DNS/IP address]:[port if different than 27017 which is default for mongodb]/[database name]  - if authentication is required

## Use cases
### Scan the repositories of specific user

        node index.js --user <username> --clientId <github_client_id> --clientSecret <github_client_secret>

### Scan all repositories

        node index.js --all --clientId <github_client_id> --clientSecret <github_client_secret>
        
### Scan all repositories, starting with the ID of a specific user

        node index.js --all --since <user_id> --clientId <github_client_id> --clientSecret <github_client_secret>
        
### Scan all repositories and store the results in the mongodb

         node index.js --all --clientId <github_client_id> --clientSecret <github_client_secret> --mongo <mongo_url>

# For Developers
The project contains mocha + chai based tests.
In order to execute them, run `npm test`