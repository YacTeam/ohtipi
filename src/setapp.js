const {
  app,
  BrowserWindow
} = require('electron');

const config = require("./config.js");

const Setapp = new class Setapp {
  constructor() {
    this.isActive = config.build.setApp;
    console.log("setApp active:", this.isActive)
  }

  init() {
    if (!this.isActive) return;
    this.setapp = require('./setapp-nodejs-wrapper/build/Release/setapp.node')
  }

  reportUsageEvent(name = null) {
    if (!this.isActive || !this.setapp || !name) return;
    this.setapp.SCReportUsageEvent(name)
  }

}()

module.exports = {
  Setapp: Setapp
}