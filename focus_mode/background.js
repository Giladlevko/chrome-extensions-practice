


//recives a signal when the extension is first installed
chrome.runtime.onInstalled.addListener(()=>{
    chrome.action.setBadgeText({
        text:'OFF',//we use the action badge's text to know it the extension is on or off
    });
});

const extension = "https://developer.chrome.com/docs/extensions";
const web_store = "https://developer.chrome.com/docs/webstore";
const godot_docs = "https://docs.godotengine.org";

let curr_state = 'OFF';

chrome.action.onClicked.addListener(async(tab)=>{
    await handle_extension(tab);
});

chrome.tabs.onUpdated.addListener(async (tabId,changeInfo, tab)=>{
    if(changeInfo.status === "complete"){
        if(curr_state === 'ON'){
            await chrome.action.setBadgeText({text:'OFF',tabId:tab.id});
            await handle_extension(tab);
        }
    }
});

async function handle_extension(tab){
    if (tab.url.startsWith(extension) || tab.url.startsWith(web_store) || tab.url.startsWith(godot_docs)){
        console.log("correct site");
        //get the previous state of the extension
        const prev_state = await chrome.action.getBadgeText({tabId:tab.id});
        //gets the opposite of the previous state
        const next_state = prev_state === 'ON' ? 'OFF':'ON';

        //sets the new state
        await chrome.action.setBadgeText({text:next_state,tabId:tab.id});
        curr_state = next_state;

        //handles new state
        if(next_state === 'ON'){
            //inserts the css file when extension is on
            await apply_css(tab);

        }
        else if(next_state === 'OFF'){
            //when extension off remove the css file
            await remove_css(tab);
            console.log("NOT FOCUSED");
        }
    }
    else{
        //await chrome.action.setBadgeText({text:'OFF',tabId:tab.id});
        await chrome.action.setBadgeText({text:'OFF',tabId:tab.id});
        curr_state = "OFF"
        console.log("incorrect site");
    }
}


async function apply_css(tab){
    await remove_css(tab);
    await chrome.scripting.insertCSS({
        files:["focus_mode.css"],
        target:{tabId:tab.id},
    });
    console.log("FOCUSED");
}

async function remove_css(tab){
    try{
        await chrome.scripting.removeCSS({
            files:["focus_mode.css"],
            target:{tabId:tab.id},
        });
    }
    catch(err){}
}