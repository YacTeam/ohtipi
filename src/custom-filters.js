module.exports = [{
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
}, ]