// Require moment.js
const Chart = require('chart.js')
const {ipcRenderer} = require('electron');
const {shell} = require('electron')
const isOnline = require('is-online');

ipcRenderer.on('connection-status', (event, online) => {
  displayStatus(online);
});

function displayStatus(online){
  let led = document.getElementsByClassName('led')[0];
  let status = document.getElementById('conn-status');
	if (online){
    led.style.backgroundColor = '#ABFF00';
    status.innerText = 'Connection Active';
  }
  else {
    led.style.backgroundColor = '#F00';
    status.innerText = 'Connection Not Active';
  }
}
var uname, pass;

var quit = document.getElementById('quit');
quit.addEventListener('click', () => {
  ipcRenderer.send('quit');
});

function gotoSubmitPage(){
  document.getElementsByClassName('error-mssg')[0].style.display = 'none';
  document.querySelector('div.login-box.animated.fadeInUp').style.display = 'block'
}

var btn = document.getElementById('submit-btn');
btn.addEventListener('click', () => {
  uname = username.value;
  pass = password.value;
  submit(bootScreen=true);
});

var password = document.getElementById('password');
password.addEventListener('keydown', (e) => {
  if (e.keyCode==13){
    uname = username.value;
    pass = password.value;
    submit(bootScreen=true);
  }
});

function submit(bootScreen=false){
  if (bootScreen) bootLoading();
  ipcRenderer.send('get-data', uname, pass);
}
ipcRenderer.on('update-data', (event, data) => {
  console.log(data);
  document.getElementsByClassName('spinner')[0].style.display = 'none';
  if (data==undefined){
      document.getElementsByClassName('error-mssg')[0].style.display = 'block';
  }
  else{
    updateChart(data);
  }
});

function bootLoading(){
  document.getElementsByClassName('error-mssg')[0].style.display = 'none';
  document.querySelector('div.login-box.animated.fadeInUp').style.display = 'none'
  document.getElementsByClassName('spinner')[0].style.display = 'block'
}

function updateChart(userData){
  document.querySelector('.chart').style.display = 'block'
  let ctx = document.getElementById('donut-airtel').getContext("2d");
  let config = {
    type: 'doughnut',
    data: {
        datasets: [{
            data: [
                parseFloat(userData['consumed'].replace(" GB")),
                parseFloat(userData['avail'].replace(" GB")),
            ],
            backgroundColor: [
                "#ff0008",
                "#efe3e4",
            ],
            hoverBackgroundColor: [
              "#F7464A",
              "#efe3e4",
            ]
        }],
        labels: [
            "Consumed: " + userData['consumed'],
            "Available: " + userData['avail'],
        ]
    },
    options: {
        tooltips: {enabled: false},
        hover: {mode: null},
        rotation: 0.5 * Math.PI,
        legend: {
          onClick: (e) => e.stopPropagation(),
          display: true,
          position: 'bottom',
          labels: {
            boxWidth: 20
          }
        },
        responsive: true,
        percentageInnerCutout: 50,
    		animationSteps: 100,
    		animationEasing: "easeOutBounce",
    		animateRotate: true,
    		animateScale: false,
    		responsive: true,
    		maintainAspectRatio: true,
        elements: {
          arc: {
              borderWidth: 0
          }
        },
    		showScale: true,
    }
  };
  let donut = new Chart(ctx, config);
  document.getElementById('inner-text').innerText = userData['percentage'].replace(/\s*(\(\d*.\d*\s*GB\))/i, '');
  document.getElementById('welcome').innerText = userData['name'].replace('Welcome, ', '');
  document.getElementById('number').innerText = userData['number'];
}

const fifteenMinutes = 15 * 60 * 1000;
setInterval(submit, fifteenMinutes, bootScreen=false);
