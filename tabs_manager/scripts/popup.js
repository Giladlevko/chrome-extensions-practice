

const tabs = await chrome.tabs.query({
    url:[
        "https://developer.chrome.com/docs/webstore/*",
        "https://developer.chrome.com/docs/extensions/*",
    ]
});


//the tabs will be sorted alphabetically, 
//then when the user clicks on a list item
//the corresponding tab will be focused using tabs.update() 
//and bring the window to the fron using window.update()

//used to sort the tabs in the user's perfered language
const collator = new Intl.Collator();
tabs.sort((a,b)=>collator.compare(a.title,b.title));

const template = ducument.getElementById("li_template");
const elements = new Set();
for(const tab of tabs){
    const element = template.content.firstElementChild.cloneNode(true);

    const title = tab.title.split("-")[0].trim();

    const path_name = new URL(tab.url).pathname.slice("/docs".length);

    element.querySelector(".title").textContent = title;
    element.querySelector(".pathname").textContent = path_name;
    element.querySelector("a").addEventListener("click",async()=>{
        //activate the tab and focus the window
        await chrome.tabs.update(tab.id,{active:true});
        await chrome.windows.update(tab.windowId,{focused: true});
    });
    elements.add(element);
}

document.querySelector("ul").append(...elements);
