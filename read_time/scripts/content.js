function render_read_time(article){
    if(!article){
        console.log("Extension Notice: No <article> found on this page yet.");
        return;}
    console.log("Extension Notice: Found an article! Calculating reading time...");
    const text = article.textContent;
    const wordMatchRegExp = /[^\s]+/g;
    const words = text.matchAll(wordMatchRegExp);
    const word_count = [...words].length;

    const reading_time = Math.round(word_count/200) || 1;

    const badge = document.createElement("p");
    badge.classList.add("color-secondary-text", "type--caption");
    badge.style.margin = "10px 0";
    badge.style.opacity = "0.7";
    badge.textContent = `⏱️ ${reading_time} min read`;
    const heading = article.querySelector("h1");
    const date = article.querySelector("time")?.parentNode;
    if (date) {
        date.insertAdjacentElement("afterend", badge);
        console.log("Extension Success: Inserted badge after the date.");
    }
    else if(heading){
        heading.insertAdjacentElement("afterend", badge);
        console.log("Extension Success: No date found, inserted badge after H1.");
    }
    else{
        article.prepend(badge);
        console.log("Extension Success: No H1 or date found. Prepended badge to the top of the article.");
    }
}

const main_content = document.querySelector("article") || document.querySelector("div[itemprop='articleBody']");
render_read_time(main_content);

const observer = new MutationObserver((mutations) => {
    for(const mutation of mutations){
        for(const node of mutation.addedNodes){
            if(node instanceof Element && (node.tagName === 'ARTICLE' || node.matches?.("div[itemprop='articleBody']"))){
                render_read_time(node)
            }
        }
    }
});

observer.observe(document.querySelector('devsite-content'),{childList:true});