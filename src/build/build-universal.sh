#!/bin/bash
source .env;
export IS_SETAPP=false;

npm install --unsafe-perm;

# arm64 steps (apple silicon)
echo "Rebuilding all native modules in project for ARM64...";
npm run rebuild-arm64;

# x64 steps (intel mac)
echo "Rebuilding all native modules in project for x64...";
npm run rebuild-x64;

# convert x64/arm64 binaries into glued fats
echo "Lipo native modules to Universal type...";
# node-mac-permissions
lipo ./node_modules/node-mac-permissions/bin/darwin-arm64-85/node-mac-permissions.node ./node_modules/node-mac-permissions/bin/darwin-x64-85/node-mac-permissions.node -create -output ./node_modules/node-mac-permissions/build/Release/permissions.node;
lipo -i ./node_modules/node-mac-permissions/build/Release/permissions.node;
# sqlite3
lipo ./node_modules/sqlite3/bin/darwin-arm64-85/sqlite3.node ./node_modules/sqlite3/bin/darwin-x64-85/sqlite3.node -create -output ./node_modules/sqlite3/build/Release/node_sqlite3.node;
lipo -i ./node_modules/sqlite3/build/Release/node_sqlite3.node;
echo "Done lipo-ing native modules to Universal type!";

# build steps
echo "Building ARM64...";
npm run build-setapp-arm64;
echo "Done building ARM64!";

echo "Building x64...";
npm run build-setapp-x64;
echo "Done building x64!";

# universal steps (intel/arm64 mac)
echo "Building universal app...";
npm run build-universal;

echo "Codesigning universal app...";
# you may need to change the cert profile identifier signature
# note: must use hardened runtime option
codesign -fv --deep -s CBA966CA6CC43CD196A9372C0AE024B0D839A4E5 ./dist/mac-universal/Ohtipi.app --options runtime --entitlements ./build/entitlements.mac.plist;

echo "Notarizing universal app...";
npm run setapp-notarize;

echo "Universal app is ready for distribution!";