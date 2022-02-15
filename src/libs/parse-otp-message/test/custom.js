const parse = require('..');

const trickyStrings = [
    "TD Ameritrade: Your Security Code is 931313" // example
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
