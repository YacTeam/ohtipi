
# iMessage OTP
AutoFill in any browser

## How's it work?
OhTipi relies on a local macOS app that looks for incoming texts with OTP codes in them. The macOS app copies those codes to your clipboard along with a notification. Everything happens locally and nothing is ever sent to a server.

![OpenGraph Image.](https://sofriendly.s3.amazonaws.com/ohtipiopengraph.png "OpenGraph")

Download for macOS at [Ohtipi.com](https://ohtipi.com/)

## Possible Upgrades

> Originally built as a Chrome Extension to do true autofill, but form detection wasn't reliable. If anyone would like to contribute we have open sourced this as well. There's an opportunity to also proxy the codes from a local webserver on the Mac to other devices such as Windows or ChromeOS and auto fill remotely with the extension.

## Run for development

```shell
npm run install;
npm run dev;
```

## Release flow

*The following will only function with proprietary signing keys, etc. It is for internal use only.*

### Standard release


```shell
npm run install;
npm run release;
```

### Setapp release

Open `config.js` and set `{ build.setApp }` to `true`.

```shell
npm run build:setapp;
```

Distribution can now be found in `/dist`.