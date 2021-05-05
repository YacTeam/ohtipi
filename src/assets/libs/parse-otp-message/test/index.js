'use strict'

const { test } = require('ava')

const parse = require('..')

const testCases = [
  {
    message: '',
    result: undefined
  },
  {
    message: 'G-412157 is your Google verification code.',
    result: {
      code: 'G-412157',
      service: 'google'
    }
  },
  {
    message: '469538 is your verification code for your Sony Entertainment Network account.',
    result: {
      code: '469538',
      service: 'sony entertainment network'
    }
  },
  {
    message: '512665 (NetEase Verification Code)',
    result: {
      code: '512665',
      service: 'netease'
    }
  },
  {
    message: '2-step verification is now deactivated on your Sony Entertainment Network account.',
    result: {
      code: undefined,
      service: 'sony entertainment network'
    }
  },
  {
    message: '[Alibaba Group]Your verification code is 797428',
    result: {
      code: '797428',
      service: 'alibaba group'
    }
  },
  {
    message: '[HuomaoTV]code: 456291. Please complete the verification within 5 minutes. If you did not operate, please ignore this message.',
    result: {
      code: '456291',
      service: 'huomaotv'
    }
  },
  {
    message: 'Auth code: 2607 Please enter this code in your app.',
    result: {
      code: '2607',
      service: undefined
    }
  },
  {
    message: 'Welcome to ClickSend, for your first login you\'ll need the activation PIN: 464120',
    result: {
      code: '464120',
      service: 'clicksend'
    }
  },
  {
    message: 'Here is your ofo verification code: 2226',
    result: {
      code: '2226',
      service: 'ofo'
    }
  },
  {
    message: 'Use 5677 as Microsoft account security code',
    result: {
      code: '5677',
      service: 'microsoft'
    }
  },
  {
    message: 'Your Google verification code is 596465',
    result: {
      code: '596465',
      service: 'google'
    }
  },
  {

    message: 'Your LinkedIn verification code is 804706.',
    result: {
      code: '804706',
      service: 'linkedin'
    }
  },
  {
    message: 'Your WhatsApp code is 105-876 but you can simply tap on this link to verify your device: v.whatsapp.com/105876',
    result: {
      code: '105876',
      service: 'whatsapp'
    }
  },
  {
    message: 'This is your secret password for REGISTRATION. GO-JEK never asks for your password, DO NOT GIVE IT TO ANYONE. Your PASSWORD is 1099 .',
    result: {
      code: '1099',
      service: undefined
    }
  },
  {
    message: 'Your confirmation code is 951417. Please enter it in the text field.',
    result: {
      code: '951417',
      service: undefined
    }
  },
  {
    message: '588107 is your LIKE verification code',
    result: {
      code: '588107',
      service: 'like'
    }
  },
  {
    message: 'Your one-time eBay pin is 3190',
    result: {
      code: '3190',
      service: 'ebay'
    }
  },
  {
    message: 'Telegram code 65847',
    result: {
      code: '65847',
      service: 'telegram'
    }
  },
  {
    message: 'Helllo',
    result: undefined
  },
  {
    message: '858365 is your 98point6 security code.',
    result: {
      code: '858365',
      service: '98point6'
    }
  },
  {
    message: '0013 is your verification code for HQ Trivia',
    result: {
      code: '0013',
      service: 'hq trivia'
    }
  },
  {
    message: '750963 is your Google Voice verification code',
    result: {
      code: '750963',
      service: 'google voice'
    }
  },
  {
    message: 'Пароль: 1752 (никому не говорите) Доступ к информации',
    result: {
      code: '1752',
      service: undefined
    }
  },

  {
    message: 'FWD from (817) 697-4520: Mark me',
    result: undefined
  },
  {
    message: '2715',
    result: {
      code: '2715',
      service: undefined
    }
  },
  {
    message: 'Snapchat code: 481489. Do not share it or use it elsewhere!',
    result: {
      code: '481489',
      service: 'snapchat'
    }
  },
  {
    message: '[#] Your Uber code: 5934 qlRnn4A1sbt',
    result: {
      code: '5934',
      service: 'uber'
    }
  },
  {
    message: '128931 is your BIGO LIVE verification code',
    result: {
      code: '128931',
      service: 'bigo live'
    }
  },
  {
    message: 'Humaniq code: 167-262',
    result: {
      code: '167262',
      service: 'humaniq'
    }
  },
  {
    message: '373473(Weibo login verification code) This code is for user authentication, please do not send it to anyone else.',
    result: {
      code: '373473',
      service: 'weibo'
    }
  },
  {
    message: '[zcool]Your verification code is 991533',
    result: {
      code: '991533',
      service: 'zcool'
    }
  },
  {
    message: 'G-830829',
    result: {
      code: 'G-830829',
      service: 'google'
    }
  },
  {
    message: '117740 ist dein Verifizierungscode für dein Sony Entertainment Network-Konto.',
    result: {
      code: '117740',
      service: 'sony'
    }
  },
  {
    message: 'Your Lyft code is 744444',
    result: {
      code: '744444',
      service: 'lyft'
    }
  },
  {
    message: 'Cash Show - 賞金クイズ の確認コードは 764972 です。',
    result: {
      code: '764972',
      service: undefined
    }
  },
  {
    message: '[SwiftCall]Your verification code: 6049',
    result: {
      code: '6049',
      service: 'swiftcall'
    }
  },
  {
    message: 'Your Proton verification code is: 861880',
    result: {
      code: '861880',
      service: 'proton'
    }
  },
  {
    message: 'VerifyCode:736136',
    result: {
      code: '736136',
      service: undefined
    }
  },
  {
    message: 'WhatsApp code 507-240',
    result: {
      code: '507240',
      service: 'whatsapp'
    }
  },
  {
    message: '[EggOne]Your verification code is: 562961, valid for 10 minutes. If you are not operating, please contact us as soon as possible.',
    result: {
      code: '562961',
      service: 'eggone'
    }
  },
  {
    message: '(Zalo) 8568 la ma kich hoat cua so dien thoai 13658014095. Vui long nhap ma nay vao ung dung Zalo de kich hoat tai khoan.',
    result: {
      code: '8568',
      service: 'zalo'
    }
  },
  {
    message: 'You are editing the phone number information of your weibo account, the verification code is: 588397 (expire in 10 min).',
    result: {
      code: '588397',
      service: 'weibo'
    }
  },
  {
    message: 'Your CloudSigma verification code for MEL is 880936',
    result: {
      code: '880936',
      service: 'cloudsigma'
    }
  },
  {
    message: 'G-718356() Google .',
    result: {
      code: 'G-718356',
      service: 'google'
    }
  },
  {
    message: 'G-723210(이)가 Google 인증 코드입니다.',
    result: {
      code: 'G-723210',
      service: 'google'
    }
  },
  {

    message: 'You requested a secure one-time password to log in to your USCIS Account. Please enter this secure one-time password: 04352398',
    result: {
      code: '04352398',
      service: 'uscis'
    }
  },
  {
    message: 'Your Stairlin verification code is 815671',
    result: {
      code: '815671',
      service: 'stairlin'
    }
  },
  {
    message: 'Your Purchase Code is 39M4W',
    result: undefined
  },
  {
    message: 'Your mCent confirmation code is: 6920',
    result: {
      code: '6920',
      service: 'mcent'
    }
  },
  {
    message: 'Your Zhihu verification code is 756591.',
    result: {
      code: '756591',
      service: 'zhihu'
    }
  },
  {
    message: 'Hello! Your BuzzSumo verification code is 823 815',
    result: {
      code: '823815',
      service: 'buzzsumo'
    }
  },
  {
    message: 'WhatsApp code 569-485. You can also tap on this link to verify your phone: v.whatsapp.com/569485',
    result: {
      code: '569485',
      service: 'whatsapp'
    }
  },
  {
    message: 'Use the code (7744) on WeChat to log in to your account. Don\'t forward the code!',
    result: {
      code: '7744',
      service: 'wechat'
    }
  },
  {
    message: 'grubhub order 771332',
    result: {
      code: '771332',
      service: 'grubhub'
    }
  },
  {
    message: 'Your boa code is "521992"',
    result: {
      code: '521992',
      service: 'boa'
    }
  },
  {
    message: 'Your Twilio verification code is: 9508',
    result: {
      code: '9508',
      service: 'twilio'
    }
  },
  {
    message: 'Your Twitter confirmation coce is 180298',
    result: {
      code: '180298',
      service: 'twitter'
    }
  },
  {
    message: 'Use 003407 as your password for Facebook for iPhone.',
    result: {
      code: '003407',
      service: 'facebook'
    }
  },
  {
    message: 'Reasy. Set. Get. Your new glasses are ready for pick up at LensCrafters! Stop in any time to see th enew you. Questions? 718-858-7036',
    result: {
      code: undefined,
      service: 'lenscrafters'
    }
  },
  {
    message: '6635 is your Postmates verification code.',
    result: {
      code: '6635',
      service: 'postmates'
    }
  },
  {
    message: '388-941-',
    result: undefined
  },
  {
    message: '388-941-4444 your code is 333222',
    result: {
      code: '333222',
      service: undefined
    }
  },
  {
    message: '+1-388-941-4444 your code is 333-222',
    result: {
      code: '333222',
      service: undefined
    }
  },
  {
    message: 'Microsoft access code: 6907',
    result: {
      code: '6907',
      service: 'microsoft'
    }
  },
  {
    message: `<#> Your ExampleApp code is: 123ABC78 FA+9qCX9VSu`,
    result: {
      code: '123ABC78',
      service: 'exampleapp'
    }
  }
]

testCases.forEach((testCase) => {
  test(testCase.message, (t) => {
    const result = parse(testCase.message)
    t.deepEqual(result, testCase.result)
  })
})
