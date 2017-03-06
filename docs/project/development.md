# Developer Notes for  Coco

This is a collection of developer notes for the Coco project. Topics include developer onboarding, project
structure, scripts and developer workflow.

## Getting Started

**Running the project**
* git clone the repository to a local directory 
* `npm install` 
* wait for code compilation 
* `npm start` (runs a local webserver)

**Developer workflow**
* When making changes to JS files run `npm run fast`
* When making changes to _custom.less_ close npm server and run `gulp` for the file watch and livereload (switch back to 
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

###Hosting the Project
The changes made to this fork are manually transferred to this 
[repository](https://github.com/ericdesj/moz-coco-w17-preview). We use GitHub Pages to host the project for free and
make it available for demo or testing. The page is available [here](https://ericdesj.github.io/moz-coco-w17-preview/).