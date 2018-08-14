# Sample application: Node.js with Cloudant on Kubernetes
[![Build Status](https://travis-ci.org/gabriele-decapoa/nodejs-cloudant.svg?branch=master)](https://travis-ci.org/gabriele-decapoa/nodejs-cloudant) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/8ab6e058324b4d34a8889a8c8a1f1487)](https://www.codacy.com/project/gabriele.decapoa/nodejs-cloudant/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=gabriele-decapoa/nodejs-cloudant&amp;utm_campaign=Badge_Grade_Dashboard) [![Codacy Badge](https://api.codacy.com/project/badge/Coverage/8ab6e058324b4d34a8889a8c8a1f1487)](https://www.codacy.com/app/gabriele.decapoa/nodejs-cloudant?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=gabriele-decapoa/nodejs-cloudant&amp;utm_campaign=Badge_Coverage) 

This sample, based on [the public boilerplate for Cloud Foundry](https://github.com/IBM-Cloud/nodejs-cloudant), shows how to build a Node.js application that uses IBM Cloud Cloudant NoSQL DB service instance and deploy it on a IBM Cloud Kubernetes cluster.  
The application is very simple: it helps users organize their favorite files.
The UI, written in HTML and jQuery, interacts to a RESTful Express CRUD backend API.

## How to run and develop the app locally

1. Install Node.js (**Boron** version) using [nvm](https://github.com/creationix/nvm) (or its version for [Windows](https://github.com/coreybutler/nvm-windows))
2. Once you've cloned this repository, `cd` into this project's root directory
3. You could work with Cloudant as Docker container or IBM Cloud service instance
   1. In the first case, you have to issue those commands:
   ```bash
   docker run -d --privileged --volume cloudant:/srv --name cloudant --hostname cloudant.dev -p 8080:80 ibmcom/cloudant-developer:latest
   docker exec -ti cloudant cast license --silent
   docker exec cloudant cast database init -v -y -p pass
   curl -s -X 'PUT' http://admin:pass@localhost:8080/my_sample_db
   ```
   2. In the second case, you have to create an free instance of *Cloudant NoSQL* on IBM Cloud via UI or via CLI, create a set of credentials then copy the URL from credentials and put in `config/configuration-local.json` file under `cloudant.credentials.url` path
4. Run `npm install` to install the app's dependencies
5. Set `NODE_ENV` environment variable to `development`
6. Run `npm start` to start the app
7. Access the running app in a browser at <http://localhost:3000>

For each changes you'll perform, set `NODE_ENV` environment variable to `test` run `npm test` and eventually add more test cases.

## How to deploy on IBM Cloud Kubernetes cluster
To build a new Docker image and deploy the application on IBM Cloud Kubernetes cluster, you have to issue the following command:
```bash
sh ./scripts/build-and-deploy-all.sh
```

