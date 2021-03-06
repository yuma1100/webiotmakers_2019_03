const MAX_GAIN = 1650;
const FSR_VARIATION = 10;
const FSR_LOOP = 10;
const FSR_SLEEP = 20;

// noprotect
var head;
window.addEventListener(
  "load",
  function() {
    head = document.querySelector("#head");
    mainFunction();
  },
  false
);

async function mq303a(ads1015) { //alcohol
  try {
    var alc = await ads1015.read(0);
    return MAX_GAIN - alc;
  } catch (error) {
    if (error.code != 4) {
      head.innerHTML = "ERROR";
    }
    console.log("error: code:" + error.code + " message:" + error.message);
  }
}

async function fsr406(ads1015) { // 圧力
  var pow_before = 2047;
  var pow_after = 0;
  var count = 0;
  try {
    while (1) {
      pow_after = await ads1015.read(1);
      if (Math.abs(pow_after - pow_before) < FSR_VARIATION) {
        count++;
      } else {
        count = 0;
      }
      
      if (count > FSR_LOOP) return pow_after;
      pow_before = pow_after;
      await sleep(FSR_SLEEP);
    }
  } catch (error) {
    if (error.code != 4) {
      head.innerHTML = "ERROR";
    }
    console.log("error: code:" + error.code + " message:" + error.message);
  }
}

async function mainFunction() {
  var i2cAccess = await navigator.requestI2CAccess();
  var alc = 0;
  var pow = 0;
  try {
    var port = i2cAccess.ports.get(1);
    var ads1015 = new ADS1015(port, 0x49);
    await ads1015.init();
    console.log("new");
    while (1) {
      alc = await mq303a(ads1015);
      pow = await fsr406(ads1015);
      console.log("alc:", alc);
      console.log("pow:", pow);
      
      if (alc > 400) {
        console.log("You are drunk!");
      }
      await sleep(200);
    }
  } catch (error) {
    console.log("ADS1015.init error" + error.message);
  }
}

function sleep(ms) {
  return new Promise(function(resolve) {
    setTimeout(resolve, ms);
  });
}