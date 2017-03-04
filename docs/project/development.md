# Developer Notes for  CoCo

This doc page is a collection of developer notes for the CoCo project. Topics include developer onboarding, project
structure, scripts and developer workflow.

## Getting Started

**Running the project**
1. git clone the repository to a local directory 
2. `npm install` 
3. wait for code compilation 
4. `npm start` (runs a local webserver)

**Developer workflow**
* When making changes to JS files run `npm run fast`
* When making changes to _custom.less_ close npm server and run `gulp` for file watch and livereload (switch back to 
`npm start` when you're done)

## Project Information

###Scripts
All the project `npm install/fast` scripts are within the `/scripts` directory.

**npm install**
The install script sets the project to production mode in `config.js` for GitHub hosting purposes. For development,
purposes set the variable back to `false`.

###Queries
In a nutshell, queries are in the `/queries` directory and get concatenated to `ClientContants.js` with the
`scripts/concatqueries.js` when running `npm install/fast`.

New queries should be create in the `/queries` directory and use the same template as existing queries.