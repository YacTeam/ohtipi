const {
    remote,
    ipcRenderer
} = require("electron");

window.ipcRenderer = ipcRenderer;

window.ohtipiApi = {
    "send": function (data) {
        ipcRenderer.send("request", data);
    }
};