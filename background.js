let globalTabs = {};
let globalT = 0;

function update()
{
    let d = new Date();
    let t = d.getTime();

    if(globalT === 0)
        globalT = t;

    let dt = t - globalT;
    globalT = t;

    for(let tab in globalTabs){
        if(!globalTabs[tab].active) {
            globalTabs[tab].time += dt / 1000;
        }
    };

    setTimeout(update, 1000);
};

function init()
{
    // initialize tabs
    //TODO: restore time when browser reopens
    chrome.tabs.query({}, function(tabs){
        for(let tab of tabs){
            tab.time = 0;
            globalTabs[tab.url] = tab;
        };

        // then start updating
        update();
    });
};

//TODO: Updated globalTabs on add and remove

chrome.tabs.onActivated.addListener(function(info) {
    //TODO: handle ID changes when browser closes
    for(let tab in globalTabs){
        globalTabs[tab].active = false;
        if(globalTabs[tab].id === info.tabId)
        {
            globalTabs[tab].active = true;
            globalTabs[tab].time = 0;
        }
    };
});

function getGlobalTabs(){
    return globalTabs;
};

window.onload = init;
