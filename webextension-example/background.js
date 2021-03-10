var ws;
var connected = false;
var badgeTimeout;

function openSocket() {
    ws = new WebSocket("ws://localhost:9097/");

    ws.onopen = function () {
        connected = true;
        chrome.browserAction.setBadgeText({
            "text": "✓"
        });

        if (badgeTimeout) clearTimeout(badgeTimeout);

        badgeTimeout = setTimeout(() => {
            chrome.browserAction.setBadgeText({
                "text": ""
            });
        }, 2000);
    };

    ws.onmessage = function (e) {
        if (e.data) {
            const data = JSON.parse(e.data);
            const otpCode = data.otpRaw;

            chrome.tabs.getAllInWindow(null, function (tabs) {
                tabs.forEach(tab => {
                    if (!tab.active) return;
                    chrome.tabs.sendMessage(tab.id, {
                        action: "otp-display",
                        otpCode
                    });
                })
            });

            chrome.browserAction.setBadgeText({
                "text": "💬"
            });

            if (badgeTimeout) clearTimeout(badgeTimeout);

            badgeTimeout = setTimeout(() => {
                chrome.browserAction.setBadgeText({
                    "text": ""
                });
            }, 5000);

        }
    };

    ws.onclose = function (e) {
        connected = false;
        ws = undefined;

        chrome.browserAction.setBadgeText({
            "text": "!"
        });
    };

    ws.onerror = function (e) {
        chrome.browserAction.setBadgeText({
            "text": "!"
        });
        setTimeout(() => {
            openSocket();
        }, 3000)
    }
}

(function () {
    openSocket();

    chrome.browserAction.onClicked.addListener(function () {
        if (ws === undefined) {
            openSocket();
        } else {
            // if (ws.readyState === WebSocket.OPEN) {
            //     ws.send(prompt('send text'));
            // }
        }
    });
})();