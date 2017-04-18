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

    let badge = {};
    badge.text = Object.keys(globalTabs).length.toString();
    chrome.browserAction.setBadgeText(badge);

    for(let tab in globalTabs){
        if(!globalTabs[tab].active)
            globalTabs[tab].time += dt / 1000;

        if(globalTabs[tab].time > 20 && globalTabs[tab].onWindow){
            globalTabs[tab].onWindow = false;
            chrome.tabs.remove(parseInt(tab), function(){});
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
            tab.onWindow = true;
            globalTabs[tab.id] = tab;
        };

        // then start updating
        update();
    });
};

//FIXME: doesn't work everytime user changes website
chrome.tabs.onUpdated.addListener(function(tabId, info, tab){
    for(let tabi in globalTabs){
        if(tabi == tabId){
            tab.time = globalTabs[tabi].time;
            tab.onWindow = globalTabs[tabi].onWindow;
            delete globalTabs[tabi];
            globalTabs[tab.id] = tab;
        }
    }
});

chrome.tabs.onRemoved.addListener(function(tabId, info){
    for(let tab in globalTabs){
        if(tab == tabId)
            if(globalTabs[tab].onWindow)
                delete globalTabs[tab];
    }
});

chrome.tabs.onCreated.addListener(function(tab){
    tab.time = 0;
    tab.onWindow = true;
    globalTabs[tab.id] = tab;
});

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

function iconClick(tab){
    let options = {}
    options.url = globalTabs[tab].url;
    chrome.tabs.create(options, function(tabn){
        tabn.time = 0;
        tabn.onWindow = true;
        globalTabs[tabn.id] = tabn;
        delete globalTabs[tab]
    })
};

window.onload = init;
