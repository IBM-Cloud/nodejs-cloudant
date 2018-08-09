# Node.js Cloudant Sample
[![Build Status](https://travis-ci.org/gabriele-decapoa/nodejs-cloudant.svg?branch=master)](https://travis-ci.org/gabriele-decapoa/nodejs-cloudant) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/8ab6e058324b4d34a8889a8c8a1f1487)](https://www.codacy.com/project/gabriele.decapoa/nodejs-cloudant/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=gabriele-decapoa/nodejs-cloudant&amp;utm_campaign=Badge_Grade_Dashboard) 

This application demonstrates how to use the Bluemix Cloudant NoSQL DB service.  

It helps users organize their favorite files. The UI talks to a RESTful Express CRUD backend API.

## Run the app locally

1. [Install Node.js][]
+ cd into this project's root directory
+ Copy the value for the VCAP_SERVICES envirionment variable from the application running in Bluemix and paste it in a `vcap-local.json` file
+ Run `npm install` to install the app's dependencies
+ Run `npm start` to start the app
+ Access the running app in a browser at <http://localhost:3000>

[Install Node.js]: https://nodejs.org/en/download/
