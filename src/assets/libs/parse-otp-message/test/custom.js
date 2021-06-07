const parse = require('..');

const trickyStrings = [
    "588873 is the OTP for transaction of INR 3373.00 on your Kotak Bank Card 9688 at AMAZON PAY INDIA PRIVATET valid for 15 mins. DONT SHARE OTP WITH ANYONE INCLUDING BANK OFFICIALS."
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