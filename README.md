# Note
The application is not yet finished.
Although it already successfully filters out a lot of irrelevant occurrences of the credential related code, it still finds a lot of false positives.

TODO:
* support for multiple sets of credentials, so that you don't get throttled by github that easily
* Automatic credential validation for most common cases (if for instance MySQL credentials are found, the app should automatically try to connect to that MySQL database)
* Database storage for found credentials
* Run as a server app with REST data provisioning

# About
The application makes it much easier and faster to find all sorts of credentials stored in github,
by 
* scanning the content of the repositories
* scanning the commits explicitly mentioning the credentials

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

## Use cases
### Scan the repositories of specific user

        node index.js --user <username> --clientId <github_client_id> --clientSecret <github_client_secret>

### Scan all repositories

        node index.js --all --clientId <github_client_id> --clientSecret <github_client_secret>
        
### Scan all repositories, starting with the ID of a specific user

        node index.js --all --since <user_id> --clientId <github_client_id> --clientSecret <github_client_secret>

# For Developers
The project contains mocha + chai based tests.
In order to execute them, run `npm test`