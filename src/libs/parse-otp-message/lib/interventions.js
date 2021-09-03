'use strict'

const rules = require("./custom-filters")

module.exports = (passingResult, originalString) => {
    let result = passingResult;
    rules.forEach((rule) => {
        const matched = result.service && result.service.toString() === rule.ifServiceMatches.toString();
        const ensured = rule.ensure(originalString);
        const handlerResult = ensured ? rule.handler(originalString) : null;

        if (matched && ensured) {
            result = handlerResult;
            return result;
        }
    })
    return result;
}