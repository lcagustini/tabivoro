var globalTabs = {};

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
            globalTabs[tab].active = true;
            globalTabs[tab].time = 0;
    };
});

function getGlobalTabs(){
    return globalTabs;
};
