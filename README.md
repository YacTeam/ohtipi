
# Ohtipi

iMessage OTP AutoFill in any browser on macOS

### How's it work?

OhTipi relies on a local macOS app that looks for incoming texts with OTP codes in them. The macOS app copies those codes to your clipboard along with a notification. Everything happens locally and nothing is ever sent to a server.

[![OpenGraph Image.](https://sofriendly.s3.amazonaws.com/ohtipiopengraph.png "OpenGraph")](https://ohtipi.com/)

Download for macOS at [Ohtipi.com](https://ohtipi.com/)

***

## Run for development

```shell
npm run install;
npm run dev;
```

💡 Note: During development, Full Disk Access permission must be granted to whichever app is running the `npm run dev` command (usually `Terminal.app` or `Visual Studio Code.app`). [More info...](https://github.com/Yac-Team/ohtipi/issues/6)

## Find the important bits

* [Main process](https://github.com/Yac-Team/ohtipi/blob/main/src/index.js)
* [iMessage service](https://github.com/Yac-Team/ohtipi/tree/main/src/libs/imessage) which queries the local `sqlite` database
* [Modified fork](https://github.com/Yac-Team/ohtipi/tree/main/src/libs/parse-otp-message) of [`parse-otp-message`](https://github.com/transitive-bullshit/parse-otp-message), includes [service list](https://github.com/Yac-Team/ohtipi/blob/main/src/libs/parse-otp-message/lib/known-services.js), [service patterns](https://github.com/Yac-Team/ohtipi/blob/main/src/libs/parse-otp-message/lib/service-patterns.js) and [auth words](https://github.com/Yac-Team/ohtipi/blob/main/src/libs/parse-otp-message/lib/auth-words.js). Particuarly difficult cases can otherwise be caught and handled within [custom filters](https://github.com/Yac-Team/ohtipi/blob/main/src/libs/parse-otp-message/lib/custom-filters.js)

## Release flow

The following will only function with proprietary signing keys, etc. It is for internal use only.

### Standard release


```shell
npm run install;
npm run release;
```

### Universal Mac App release

Open `config.js` and set `{ build.universal }` to `true`.

Make sure all `.node` native modules are compiled against the correct version of Node, Electron, etc. This project currently uses `sqlite3` and `node-mac-permissions`. The build script can be seen in `./build/build-universal.sh`. `lipo` is used to cross-compile `.node` modules for both `arm64` and `x64`.

```shell
npm run build:mac-universal;
```

Distribution can now be found in `/dist/mac-universal`.

💡 Note: You may need to re-codesign the Universal app bundle:

```shell
codesign -fv --deep -s CBA[..................] ./dist/mac-universal/Ohtipi.app
```


### Setapp release

Open `config.js` and set `{ build.setApp }` to `true`.

Make sure all `.node` native modules are compiled against the correct version of Node, Electron, etc. This project currently uses `sqlite3`, `node-mac-permissions` and `setapp-nodejs-wrapper`. The build script can be seen in `./build/build-setapp.sh`. `lipo` is used to cross-compile `.node` modules for both `arm64` and `x64`.

```shell
npm run build:setapp;
```

Distribution can now be found in `/dist/mac-universal`.

💡 Note: You may need to re-codesign the Universal app bundle:

```shell
codesign -fv --deep -s CBA[..................] ./dist/mac-universal/Ohtipi.app
```
