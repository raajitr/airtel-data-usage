var Nightmare = require('nightmare');
var resp = {'name': '',
            'number': '',
            'total': '',
            'consumed': '',
            'avail': '',
            'percentage': ''};

uname = process.argv[2];
pass = process.argv[3];
getResponse(uname, pass);

function getResponse(uname, pass){
  nightmare = new Nightmare({ show: false,
  webPreferences: {
    images: false,
  },
  })
  .goto('https://www.airtel.in/personal/myaccount/telemedia/?telemediaMsisdn=LH/Ka+KZbLeiH6+3JIWdSw==')
  .wait('#number-one')
  .insert('#number-one', uname)
  .click('#one')
  .wait(2000)
  .exists('input[name="password"]')
  .type('[name="password"]', pass+'\u000d')
  .wait('#welcome-name')
  .wait(2000)
  .evaluate(function(resp) {
    resp['name'] = document.querySelector('#welcome-name').innerText;
    resp['number'] = document.querySelector('#mobile-number').innerText;
    resp['total'] = document.querySelector('#tot_quota').innerText;
    resp['consumed'] = document.querySelector('#con_quota').innerText;
    resp['avail'] = document.querySelector('#avl_quota').innerText;
    resp['percentage'] = document.querySelector('#total_per').innerText;
    return JSON.stringify(resp)
  }, resp)
  .end()
  .then(function (result) {
    console.log(result)
  })
  .catch(function (error, i, uname, pass) {
    console.error('Search failed:', error);
  });
}
