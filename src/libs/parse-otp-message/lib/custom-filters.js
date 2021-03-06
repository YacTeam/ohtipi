const config = require("../../../config.js")

module.exports = [
    // user-requested data transformations
    // to standardize behavior across vendors

    // kotak bank
    {
        notes: "Kotak Bank, includes a bunch of numbers",
        example: "123456 is the OTP for transaction of INR 1234.00 on your Kotak Bank Card 1234 at AMAZON PAY INDIA PRIVATET valid for 15 mins. DONT SHARE OTP WITH ANYONE INCLUDING BANK OFFICIALS.",
        ifServiceMatches: "transaction",
        ensure(messageText) {
            try {
                return messageText.includes("Kotak Bank") && messageText.split(" ").length > 5 && Number.isInteger(Number(messageText.split(" ")[0]))
            } catch (e) {
                return false;
            }
        },
        handler(messageText) {
            return {
                code: messageText.split(" ")[0],
                service: "kotak bank"
            }
        }
    },

    // google authenticator
    {
        notes: "Google Authenticator, provides G-<code>, when user only desires to paste <code>",
        example: "G-412157 is your Google verification code.",
        ifServiceMatches: "google",
        ensure(messageText) {
            try {
                return messageText.includes("G-") && !Number.isNaN(messageText.split("G-")[1].substring(0, 6))
            } catch (e) {
                return false;
            }
        },
        handler(messageText) {
            return {
                code: messageText.split("G-")[1].substring(0, 6),
                service: "google"
            }
        }
    },

    // generics (use "unknown" as service name)
    {
        notes: "Generic catch 1 (Epic Games, possibly others)",
        example: "Your verification code is 732825",
        ifServiceMatches: "undefined",
        ensure(messageText) {
            try {
                return messageText && messageText.startsWith("Your verification code is") && !Number.isNaN(messageText.split(" ")[4])
            } catch (e) {
                return false;
            }
        },
        handler(messageText) {
            return {
                code: messageText.split(" ")[4],
                service: config.text.unknown_string
            }
        }
    },
    {
        notes: "Generic catch 2",
        example: "Your security code: 274934. Valid for 1 minutes.",
        ifServiceMatches: "undefined",
        ensure(messageText) {
            try {
                return messageText && messageText.startsWith("Your security code:") && !Number.isNaN(messageText.split(" ")[3].replace(".", ""))
            } catch (e) {
                return false;
            }
        },
        handler(messageText) {
            return {
                code: messageText.split(" ")[3].replace(".", ""),
                service: config.text.unknown_string
            }
        }
    },

    // misc. unknown user reported

    // unknown
    {
        notes: "Portal Verification",
        example: "Your portal verification code is : jh7112 Msg&Data rates may apply. Reply STOP to opt-out",
        ifServiceMatches: "undefined",
        ensure(messageText) {
            try {
                return messageText.includes("portal verification") && messageText.split(" ").length > 5 && messageText.split(" ")[6] && messageText.split(" ")[6].length === 6
            } catch (e) {
                return false;
            }
        },
        handler(messageText) {
            return {
                code: messageText.split(" ")[6],
                service: config.text.unknown_string
            }
        }
    },

    // cater allen
    {
        notes: "Cater Allen's complex OTP",
        example: "OTP to MAKE A NEW PAYMENT of GBP 9.94 to 560027 & 27613445. Call us if this wasn't you. NEVER share this code, not even with Cater Allen staff 699486",
        ifServiceMatches: "cater allen",
        ensure(messageText) {
            try {
                if (!Number.isInteger(Number(messageText.split(" ")[messageText.split(" ").length - 1]))) return false;
                return messageText.includes("Cater Allen staff") && messageText.includes("OTP to MAKE A NEW PAYMENT") && Number.isInteger(Number(messageText.split(" ")[messageText.split(" ").length - 1]))
            } catch (e) {
                return false;
            }
        },
        handler(messageText) {
            return {
                code: messageText.split(" ")[messageText.split(" ").length - 1],
                service: "Cater Allen"
            }
        }
    },
]