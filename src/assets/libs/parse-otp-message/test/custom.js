const parse = require('..');

const trickyStrings = [
    "588873 is the OTP for transaction of INR 3373.00 on your Kotak Bank Card 9688 at AMAZON PAY INDIA PRIVATET valid for 15 mins. DONT SHARE OTP WITH ANYONE INCLUDING BANK OFFICIALS.",
    "342562 is your Twitter authentication code. Don’t reply to this message with your code.?"
]

const test = () => {
    trickyStrings.forEach(str => {
        const result = parse(str);
        console.log({
            message: str,
            result: result
        })
    })
}

test()