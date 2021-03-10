// inline content script styles
const defaultStyle = `
    position: absolute; 
    z-index: 999999 !important; 
    background: rgba(0,0,0,0.9); 
    color: white; 
    padding: 14px; 
    user-select: all !important;
    cursor: pointer;
    border-radius: 7px;
    border: 1px solid rgba(255,255,255,0.2);
    margin-top: 140px;
    font-size: 14px;
    display: flex;
    flex-direction: row;
    text-align: left;
    justify-content: start;
`

const hoverStyle = `
    position: absolute; 
    z-index: 999999 !important; 
    background: #0361ff; 
    color: white; 
    padding: 14px; 
    user-select: all !important;
    cursor: pointer;
    border-radius: 7px;
    border: 1px solid rgba(255,255,255,0.2);
    margin-top: 140px;
    font-size: 14px;
    display: flex;
    flex-direction: row;
    text-align: left;
    justify-content: start;
`

const svgIcon = `
    <svg style="height: 40px; width: 40px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
`

chrome.runtime.onMessage.addListener((message, callback) => {
    if (message.action == "otp-display") {
        const otpCode = message.otpCode;
        const inputElements = document.getElementsByTagName("input");
        var div = document.createElement('div');

        const selectAndPastePassword = () => {
            window.getSelection().selectAllChildren(
                document.getElementById("otp-passcode-text")
            );
            document.execCommand("copy");
            inputElements[0].focus();
            document.execCommand("paste");
            div.style = "display: none";
        };

        const init = () => {
            div.id = "otp-passcode";
            div.innerHTML = `
            <!-- icon -->
            ${svgIcon}
            <!-- text -->
            <div style="display: flex; flex-direction: column; margin-left: 10px;">
                <div>Fill code <span id="otp-passcode-text">${otpCode}</span></div>
                <div style="font-size: 12px; opacity: 75%">From Messages</div>
            </div>
            `;
            div.style = defaultStyle;

            div.onmouseenter = () => {
                div.style = hoverStyle;
            }

            div.onmouseleave = () => {
                div.style = defaultStyle;
            }

            div.onclick = () => {
                selectAndPastePassword();
            }
        }

        init();

        // attach to first page element in page
        inputElements[0].parentElement.appendChild(div);
    }
});