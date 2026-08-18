

const tabs = await chrome.tabs.query({
    url:[
        "https://developer.chrome.com/docs/webstore/*",
        "https://developer.chrome.com/docs/extensions/*",
        "https://docs.godotengine.org/*"
    ]
});


//the tabs will be sorted alphabetically, 
//then when the user clicks on a list item
//the corresponding tab will be focused using tabs.update() 
//and bring the window to the fron using window.update()

//used to sort the tabs in the user's perfered language
const collator = new Intl.Collator();
tabs.sort((a,b)=>collator.compare(a.title,b.title));

const template = document.getElementById("li_template");
const elements = new Set();
for(const tab of tabs){
    const element = template.content.firstElementChild.cloneNode(true);

    const title = tab.title.split("-")[0].trim();

    let clear_path = "";
    //removes /docs or /en/ and whatever is after it untill the next /
    // so it removes this /en/stable for example
    if (tab.url){
        clear_path = new URL(tab.url).pathname.replace(/^\/(docs|en\/[^\/]+)/, "");
    }

    element.querySelector(".title").textContent = title;
    element.querySelector(".pathname").textContent = clear_path;
    element.querySelector("a").addEventListener("click",async()=>{
        //activate the tab and focus the window
        await chrome.tabs.update(tab.id,{active:true});
        await chrome.windows.update(tab.windowId,{focused: true});
    });
    elements.add(element);
}

document.querySelector("ul").append(...elements);


const button = document.querySelector("button");
button.addEventListener("click", async()=>{

    const gd_ids = [];
    const ch_ids = [];

    for(const tab of tabs){
        if(tab.url.includes("docs.godot")){
            gd_ids.push(tab.id);
        }
        else if(tab.url.includes("developer.chrome")){
            ch_ids.push(tab.id);
        }
    }

    if(gd_ids.length){
        const group = await chrome.tabs.group({tabIds:gd_ids});
        await chrome.tabGroups.update(group,{title:"GD-DOCS",color: "blue"});
    }
    if(ch_ids.length){
        const group = await chrome.tabs.group({tabIds:ch_ids});
        await chrome.tabGroups.update(group,{title:"CH-DOCS",color: "yellow"});
    }

});

