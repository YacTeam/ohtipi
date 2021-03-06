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

    this.setapp = require('./binaries/setapp-nodejs-wrapper.node')

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