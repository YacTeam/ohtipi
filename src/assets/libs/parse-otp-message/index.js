'use strict'

const authWords = require('./lib/auth-words')
const knownServices = require('./lib/known-services')
const servicePatterns = require('./lib/service-patterns')
const stopwords = require('./lib/stopwords')

module.exports = (message) => {
  const service = inferService(message)
  const s = message.toLowerCase()
  let code

  const m = message.match(/\b(g-\d{4,8})\b/i)
  if (m) return {
    code: m[1],
    service: 'google'
  }

  code = validateAuthCode(s, /\b(\d{4,8})\b/)
  if (code) return {
    code,
    service
  }

  code = validateAuthCode(s, /\b(\d{3}[- ]\d{3})\b/)
  if (code) return {
    code,
    service
  }

  code = validateAuthCode(s, /\b(\d{4,8})\b/g, {
    isGlobal: true
  })
  if (code) return {
    code,
    service
  }

  code = validateAuthCode(s, /\b(\d{3}[- ]\d{3})\b/g, {
    isGlobal: true
  })
  if (code) return {
    code,
    service
  }

  code = validateAuthCode(message, /\b([\dA-Z]{6,8})\b/g, {
    isGlobal: true,
    cleanCode: (code) => code.replace(/[^\dA-Z]/g, '').trim()
  })
  if (code) return {
    code,
    service
  }

  // no auth code found
  if (service) {
    return {
      code: undefined,
      service
    }
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
    if (next && [/\s/g, ",", ".", "!"].indexOf(next) < 1) {
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
