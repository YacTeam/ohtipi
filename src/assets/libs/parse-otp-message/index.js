'use strict'

const authWords = require('./lib/auth-words')
const knownServices = require('./lib/known-services')
const servicePatterns = require('./lib/service-patterns')
const stopwords = require('./lib/stopwords')
const interventions = require("./lib/interventions")

let debug = false

module.exports = (message) => {
  const service = inferService(message)
  const s = message.toLowerCase()
  let code

  if (debug) {
    console.log({
      step: 0,
      service: service,
      string: s,
    })
  }

  const handler = (obj) => {
    if (debug) {
      console.log({
        step: 1,
        matchedOnLevel: obj.level,
        matchedObject: obj
      })
    }

    delete obj.level; // it's only included so we can debug
    const secondPassResult = interventions(obj, message);

    if (debug) {
      console.log({
        step: 2,
        secondPassResult: secondPassResult,
        original: {
          obj,
          message
        }
      })
    }

    return secondPassResult;
  }

  const m = message.match(/\b(g-\d{4,8})\b/i)
  if (m) return handler({
    code: m[1],
    service: 'google',
    level: 0
  })

  code = validateAuthCode(s, /\b(\d{4,8})\b/)
  if (code) return handler({
    code,
    service,
    level: 1
  })

  code = validateAuthCode(s, /\b(\d{3}[- ]\d{3})\b/)
  if (code) return handler({
    code,
    service,
    level: 2
  })

  code = validateAuthCode(s, /\b(\d{4,8})\b/g, {
    isGlobal: true
  })
  if (code) return handler({
    code,
    service,
    level: 3
  })

  code = validateAuthCode(s, /\b(\d{3}[- ]\d{3})\b/g, {
    isGlobal: true
  })
  if (code) return handler({
    code,
    service,
    level: 4
  })

  code = validateAuthCode(message, /\b([\dA-Z]{6,8})\b/g, {
    isGlobal: true,
    cleanCode: (code) => code.replace(/[^\dA-Z]/g, '').trim()
  })
  if (code) return handler({
    code,
    service,
    level: 5
  })

  // no auth code found
  if (service) {
    return handler({
      code: undefined,
      service,
      level: 6
    })
  }
}

function validateAuthCode(message, pattern, opts = {}) {
  const {
    isGlobal = false,
      cleanCode = (code) => code.replace(/[^\d]/g, '').trim()
  } = opts
  const match = message.match(pattern)

  if (match) {
    if (isGlobal) {
      let i = 0

      do {
        const code = match[i]
        const index = message.indexOf(code)
        const validated = validateAuthCodeMatch(message, index, code, cleanCode)
        if (validated) return validated
      } while (++i < match.length)
    } else {
      return validateAuthCodeMatch(message, match.index, match[1], cleanCode)
    }
  }
}

function validateAuthCodeMatch(message, index, code, cleanCode) {
  if (!code || !code.length) return
  // check for false-positives like phone numbers
  if (index > 0) {
    const prev = message.charAt(index - 1)
    if (prev && (prev === "-" || prev === "/" || prev === "\\" || prev === "$")) return
  }

  if (index + code.length < message.length) {
    const next = message.charAt(index + code.length)
    // make sure next character is whitespace or ending grammar
    if (next && [/\s/g, ",", ".", "!", " "].indexOf(next) < 1) {
      return;
    };
  }

  return cleanCode(code)
}

function inferService(message) {
  const s = message.toLowerCase()

  for (let i = 0; i < servicePatterns.length; ++i) {
    const pattern = servicePatterns[i]
    const match = s.match(pattern)
    const service = match && match[1] && match[1].trim()

    if (service && /\w+/.test(service) && !authWords.has(service)) {
      // check for some false-positive cases
      if (stopwords.has(service)) {
        if (message.substr(match.index, service.length) !== service.toUpperCase()) {
          continue
        }
      }

      return service
    }
  }

  // fallback to checking if the message contains any names of known services
  for (let i = 0; i < knownServices.length; ++i) {
    const service = knownServices[i]
    if (s.indexOf(service) >= 0) {
      return service
    }
  }
}