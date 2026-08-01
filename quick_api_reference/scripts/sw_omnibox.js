

console.log("sw-omnibox.js");

//save initial API suggestion
chrome.runtime.onInstalled.addListener(({reason})=>{
    if( reason === 'install'){
        chrome.storage.local.set({
            apiSuggestions: ['tabs', 'storage', 'scripting']
        });
    }
});


const URL_CHROME_EXTENSIONS_DOC = 'https://developer.chrome.com/docs/extensions/reference/';
const PREV_SEARCH_COUNT = 4;

//display default suggestion
chrome.omnibox.onInputStarted.addListener(()=>{
    chrome.omnibox.setDefaultSuggestion({
        description: 'Enter a Chrome API or choose from past searches'
    });
})

//display the suggestions after user typing
chrome.omnibox.onInputChanged.addListener(async(Input,suggest)=>{
    const {apiSuggestions} = await chrome.storage.local.get('apiSuggestions');
    
    const list = apiSuggestions || ['tabs', 'storage', 'scripting'];

    const matches = Input ? 
        list.filter((api) => api.toLowerCase().includes(Input.toLowerCase())).sort((a,b)=>{
            const query = Input.toLowerCase();
            const index_a = a.toLowerCase().indexOf(query);
            const index_b = b.toLowerCase().indexOf(query);
            if(index_a!=index_b){
                return(index_a - index_b);
            }
            return(a.localCompare(b));
        }) : list;
        

        

    const suggestions = matches.map((api)=>{
        return{content:api,description:`Open Chrome.${api} API`};
    });
    suggest(suggestions);
});

//open the reference page on the chosen api
chrome.omnibox.onInputEntered.addListener((input)=>{
    chrome.tabs.create({url:URL_CHROME_EXTENSIONS_DOC+input});
    //save the latest input
    update_history(input);
});

async function update_history(input){
    const {apiSuggestions} = await chrome.storage.local.get('apiSuggestions');

    const list = apiSuggestions || [];

    if(list.includes(input)){return;}

    list.unshift(input);
    list.splice(PREV_SEARCH_COUNT);
    return chrome.storage.local.set({apiSuggestions:list});

}