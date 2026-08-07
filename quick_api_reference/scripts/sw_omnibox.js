

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
        


    const suggestions = matches.map((api)=>{
        const suggestion_description = (api_state === state.GD_STATE)
        ? `Open Godot's ${api} Class` 
        : `Open Chrome.${api} API`;
        return{
            content:api,
            description:suggestion_description
        };
    });
    suggest(suggestions);
});

//open the reference page on the chosen api
chrome.omnibox.onInputEntered.addListener((input)=>{
    let url = URL_CHROME_EXTENSIONS_DOC;
    let suffix = '';
    //if godot -> godot url else if chrome -> chrome url, also change suffix accordingly
    if(api_state === state.GD_STATE){
        url = URL_GODOT_CLASSES_DOC;
        suffix = '.html';
    }

    let api = input.split(" ")[1];
    
    chrome.tabs.create({url:url+api+suffix});
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