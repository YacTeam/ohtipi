const {
  app,
  BrowserWindow
} = require('electron');

const config = require("./config.js");

const Setapp = new class Setapp {
  constructor() {
    this.isActive = config.build.setApp
    // eslint-disable-next-line
    console.log('is setapp:', this.isActive)
  }
  init() {
    if (!this.isActive) {
      return
    }
    // this is a hack, but it works.
    // attempt loading intel setapp module
    try {
      this.setapp = require('./binaries/setapp-nodejs-wrapper-x64.node')
    } catch (e) {
      console.error("Intel Setapp native module couldn't load, reason: ", e)
    }
    // attempt loading apple silicon setapp module
    if (!this.setapp) {
      try {
        this.setapp = require('./binaries/setapp-nodejs-wrapper-arm64.node')
      } catch (e) {
        console.error("Apple Silicon Setapp native module couldn't load, reason: ", e)
      }
    }
  }
  reportUsageEvent(name = null) {
    if (!this.isActive || !this.setapp || !name) {
      return
    }
    this.setapp.SCReportUsageEvent(name)
  }
}()

module.exports = {
  Setapp: Setapp
}