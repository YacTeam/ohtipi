#!/bin/bash
source .env;
echo "Building Setapp wrapper!";
npm install --unsafe-perm;
npm install --unsafe-perm --prefix ./setapp-nodejs-wrapper;
npm run build --unsafe-perm --prefix ./setapp-nodejs-wrapper;
npm run rebuild --unsafe-perm --prefix ./setapp-nodejs-wrapper;
echo "Finished building Setapp wrapper!";
source .env;
export IS_SETAPP=true;