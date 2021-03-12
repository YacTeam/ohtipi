const {
    remote,
    ipcRenderer
} = require("electron");

const config = require("./config.js");

window.ipcRenderer = ipcRenderer;
window.ohtipiConfig = config;
window.ohtipiApi = {
    "send": function (data) {
        ipcRenderer.send("request", data);
    }
};