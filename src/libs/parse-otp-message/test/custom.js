const parse = require('..');

const trickyStrings = [
    "588873 is the OTP for transaction of INR 3373.00 on your Kotak Bank Card 9688 at AMAZON PAY INDIA PRIVATET valid for 15 mins. DONT SHARE OTP WITH ANYONE INCLUDING BANK OFFICIALS.",
    "342562 is your Twitter authentication code. Don’t reply to this message with your code.?",
    "Verizon One Time Passcode. Your One Time Passcode is 193667. Please do not share this One Time Passcode with anyone.",
    "Verizon Msg: Verizon won’t call you for this code. The authorization code you requested for sign in is 779065. Please use this code to complete your request.",
    "验证码：805281，用于华为帐号登录。转给他人将导致华为帐号被盗和个人信息泄露，谨防诈骗。【华为】",
    "【微信支付】验证码为940816，用于商户平台安全验证，5分钟内有效。若非本人操作，请忽略此消息。",
    "【iSlide】验证码927134，您正在登录iSlide，若非本人操作，请勿泄露。",
    "<#>BofA: DO NOT share this Sign In code. We will NEVER call you or text you for it. Code 123456. Reply HELP if you didn't request it."
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
