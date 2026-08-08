

console.log("sw-omnibox.js");

const  CHROME_DEFAULT = 'Enter a Chrome API or choose from past searches';
const GODOT_DEFAULT = 'Enter a Godot Class or choose from past searches';

//save initial API suggestion
chrome.runtime.onInstalled.addListener(({reason})=>{
    if( reason === 'install'){
        chrome.storage.local.set({
            chromeApiSuggestions: ['tabs', 'storage', 'scripting'],
            godotApiSuggestions: ['vector2d','array','area2d']
        });
    }
});


const URL_CHROME_EXTENSIONS_DOC = 'https://developer.chrome.com/docs/extensions/reference/';
const URL_GODOT_CLASSES_DOC = 'https://docs.godotengine.org/en/stable/classes/class_'//+.html
const GODOT_FALL_BACK_URL = `https://docs.godotengine.org/en/stable/search.html?q=`;

const PREV_SEARCH_COUNT = 4;

const state = {
    GD_STATE: 0,
    CHROME_STATE: 1
}

let api_state = '';
let suggestions_key = '';

//display default suggestion
chrome.omnibox.onInputStarted.addListener(()=>{
    chrome.omnibox.setDefaultSuggestion({
        description: 'Enter cr for Chrome or gd for Godot'
    });
    //reset 
    api_state = '';
    suggestions_key = '';
})



//display the suggestions after user typing
chrome.omnibox.onInputChanged.addListener(async(text,suggest)=>{
    //if godot -> godotApiSuggestions else if chrome -> chromeApiSuggestions
    const input = text.trim();
    if(input.startsWith('gd') || input.startsWith('go')){
        api_state = state.GD_STATE;
        suggestions_key = 'godotApiSuggestions';
        chrome.omnibox.setDefaultSuggestion({description: GODOT_DEFAULT});
    }
    else if(input.startsWith('cr') || input.startsWith('ch')){
        api_state = state.CHROME_STATE;
        suggestions_key = 'chromeApiSuggestions';
        chrome.omnibox.setDefaultSuggestion({description: CHROME_DEFAULT});
    }
    else{
        return;
    }

    const storageData = await chrome.storage.local.get(suggestions_key);
    const list = storageData[suggestions_key] || [];

    const query = input.split(' ').slice(1).join(' ').trim().toLowerCase();
    let matches = query ? 
        list.filter((api) => api.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>{
            const index_a = a.toLowerCase().indexOf(query);
            const index_b = b.toLowerCase().indexOf(query);
            if(index_a!=index_b){
                return(index_a - index_b);
            }
            return(a.localeCompare(b));
        }) : list;
        


    const suggestions = matches
    .filter((api)=> typeof api === 'string' && api.trim() !== '')
    .map((api)=>{
        const is_godot = api_state === state.GD_STATE;
        const suggestion_description = (is_godot)
        ? `Open Godot's ${api} Class` 
        : `Open Chrome.${api} API`;
        return{
            content:`${is_godot? 'gd' : 'cr'} ${api}`,
            description:suggestion_description
        };
    });
    suggest(suggestions);
});


async function is_url_valif(url){
    const controller = new AbortController();
    let is_valid = false;
    try{
        const response = await fetch(url,{
            method:'GET',signal:controller.signal
        });
        is_valid = response.ok;
        return is_valid;
    }
    catch(err){
        const message = 'API EITHER DOES NOT EXIST OR TYPED WRONGLY. GOING TO SITE SEARCH!';
        console.log(message);
        console.log("Fetch failed with error:", err);
    }
    return is_valid;
}
    


//open the reference page on the chosen api
chrome.omnibox.onInputEntered.addListener(async(input)=>{
    let url = URL_CHROME_EXTENSIONS_DOC;
    let suffix = '';
    //if godot -> godot url else if chrome -> chrome url, also change suffix accordingly
    if(api_state === state.GD_STATE){
        url = URL_GODOT_CLASSES_DOC;
        suffix = '.html';
    }

    const parts = input.trim().split(/\s+/);
    const api = parts.slice(1).join(' ').trim().toLowerCase();

    let full_url = url+api+suffix;


    if(api_state === state.GD_STATE){
        const is_valid = await is_url_valif(full_url);
        if(!is_valid){
            const fall_back = GODOT_FALL_BACK_URL+`${encodeURIComponent(api)}`;
            chrome.tabs.create({url:fall_back});
            return;
        }
    }
    
    chrome.tabs.create({url:full_url});
    //save the latest input
    update_history(api);
});

async function update_history(input){
    //if godot -> godotApiSuggestions else if chrome -> chromeApiSuggestions
    const storageData = await chrome.storage.local.get(suggestions_key);

    const list = storageData[suggestions_key] || [];

    if(list.includes(input)){return;}

    list.unshift(input);
    list.splice(PREV_SEARCH_COUNT);
    return chrome.storage.local.set({[suggestions_key]:list});

}