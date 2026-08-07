

console.log("sw-tips.js");

const CHROME_TIP = "tip";

let api_state = 'chrome';

//fetch tip and save in storage
const update_tip = async()=>{
    const response = await fetch('https://chrome.dev/f/extension_tips/');
    const tips = await response.json();
    const rand_index = Math.floor(Math.random() * tips.length);
    return chrome.storage.local.set({tip:tips[rand_index]});
};



const ALARM_NAME = CHROME_TIP;

//check if alarm exists to avoid reseting the timer
//The alarm might be removed when the browser session starts
async function create_alarm(){
    const alarm = await chrome.alarms.get(ALARM_NAME);
    if(typeof alarm === 'undefined'){
        chrome.alarms.create(ALARM_NAME,{
            delayInMinutes:1,
            periodInMinutes:1440
        });
        update_tip();
    }
}

create_alarm();

//update tip once a day
chrome.alarms.onAlarm.addListener(update_tip);

//sends tip to content script via messaging
chrome.runtime.onMessage.addListener((message,sender,send_response)=>{
    if(message.greeting === CHROME_TIP){
        chrome.storage.local.get(CHROME_TIP).then(send_response);
        return true;
    }
});
