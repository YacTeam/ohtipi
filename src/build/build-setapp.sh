#!/bin/bash
source .env;
export IS_SETAPP=true;

npm install --unsafe-perm;

# build local setapp wrapper
echo "Building Setapp wrapper!";
npm install --unsafe-perm --prefix ./binaries/setapp-nodejs-wrapper;
npm run rebuild --unsafe-perm --prefix ./binaries/setapp-nodejs-wrapper;

# copy binaries out
echo "Copying ARM64 build of Setapp into ./src/binaries folder";
cp -R ./binaries/setapp-nodejs-wrapper/bin/darwin-arm64-85/setapp-nodejs-wrapper.node ./binaries/setapp-nodejs-wrapper-arm64.node;
echo "Verifying ARM64 build of Setapp";
lipo -i ./binaries/setapp-nodejs-wrapper-arm64.node;
echo "Copying x64 build of Setapp into ./src/binaries folder";
cp -R ./binaries/setapp-nodejs-wrapper/bin/darwin-x64-85/setapp-nodejs-wrapper.node ./binaries/setapp-nodejs-wrapper-x64.node;
echo "Verifying x64 build of Setapp";
lipo -i ./binaries/setapp-nodejs-wrapper-x64.node;
echo "Finished building Setapp wrapper!";

# arm64 steps (apple silicon)
echo "Rebuilding all native modules in project for ARM64...";
npm run rebuild-arm64;
echo "Overwriting original native modules with ARM64 build...";
echo "--> node-mac-permissions";
cp -R ./node_modules/node-mac-permissions/bin/darwin-arm64-85/node-mac-permissions.node ./node_modules/node-mac-permissions/build/Release/permissions.node;
lipo -i ./node_modules/node-mac-permissions/build/Release/permissions.node;
echo "--> sqlite3";
cp -R ./node_modules/sqlite3/bin/darwin-arm64-85/sqlite3.node ./node_modules/sqlite3/build/Release/node_sqlite3.node;
lipo -i ./node_modules/sqlite3/build/Release/node_sqlite3.node;
echo "Done overwriting original native modules with ARM64 build!";

echo "Building ARM64...";
npm run build-setapp-arm64;
echo "Done building ARM64!";

# x64 steps (intel mac)
echo "Rebuilding all native modules in project for x64...";
npm run rebuild-x64;
echo "Overwriting original native modules with x64 build...";
echo "--> node-mac-permissions";
cp -R ./node_modules/node-mac-permissions/bin/darwin-x64-85/node-mac-permissions.node ./node_modules/node-mac-permissions/build/Release/permissions.node;
lipo -i ./node_modules/node-mac-permissions/build/Release/permissions.node;
echo "--> sqlite3";
cp -R ./node_modules/sqlite3/bin/darwin-x64-85/sqlite3.node ./node_modules/sqlite3/build/Release/node_sqlite3.node;
lipo -i ./node_modules/sqlite3/build/Release/node_sqlite3.node;
echo "Done overwriting original native modules with x64 build!";

echo "Building x64...";
npm run build-setapp-x64;
echo "Done building x64!";

# universal steps (intel/arm64 mac)
echo "Building universal app...";
npm run build-universal;
echo "Done building universal app!"