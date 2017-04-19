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

    // show how many tabs we're keeping track of
    let badge = {};
    badge.text = Object.keys(globalTabs).length.toString();
    chrome.browserAction.setBadgeText(badge);

    for(let tab in globalTabs){
        if(!globalTabs[tab].active)
            globalTabs[tab].time += dt / 1000;

        if(globalTabs[tab].time > 20 && globalTabs[tab].onWindow)
        {
            close_tab(globalTabs[tab]);
            globalTabs[tab].onWindow = false;
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

chrome.tabs.onUpdated.addListener(function(tabId, info, tab){

    // wait for page to load completely
    if (info.status !== 'loading' && info.status !== 'complete') return;

    for(let tabi in globalTabs){
        if(tabi == tabId){
            tab.time = globalTabs[tabi].time;
            tab.onWindow = globalTabs[tabi].onWindow;
            delete globalTabs[tabi];
            globalTabs[tab.id] = tab;
            close_tabs_with_same_url(tab);
        }
    }
});

chrome.tabs.onRemoved.addListener(function(tabId, info){
    for(let tab in globalTabs){
        if(tab == tabId)
        {
            // if user has manually closed it, let it go
            if(globalTabs[tab].onWindow)
                delete globalTabs[tab];

            // also let it go if we closed it but it is a local tab
            else if(globalTabs[tab].url.includes('chrome://'))
                delete globalTabs[tab];
        }
    }
});

function close_tab(tab)
{
    try
    {
        chrome.tabs.remove(parseInt(tab.id), function(){});
    }
    catch (e)
    {
        console.log('Error trying to close tab, retrying...', e);
        close_tab(tab);
        setTimeout(close_tab.bind(tab), 500);
    }
};

function close_tabs_with_same_url(tab)
{
    if (tab.url === 'chrome://newtab/') return;

    for (let id in globalTabs)
    {
        if (globalTabs[id].url === tab.url && parseInt(id) !== tab.id)
        {
            if (globalTabs[id].onWindow === true)
            {
                close_tab(globalTabs[id]);
            }
            else
            {
                delete globalTabs[id];
            }
        }
    }
};

function store_new_tab(tab)
{
    tab.time = 0;
    tab.onWindow = true;
    globalTabs[tab.id] = tab;

    close_tabs_with_same_url(tab);
};

chrome.tabs.onCreated.addListener((tab) => store_new_tab(tab));

chrome.tabs.onReplaced.addListener(function(added_tab_id, removed_tab_id) {
    delete globalTabs[removed_tab_id];
    chrome.tabs.get(added_tab_id, (tab) => store_new_tab(tab));
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
    if (globalTabs[tab].onWindow)
    {
        chrome.tabs.update(parseInt(tab), {active: true});
    }
    else
    {
        let options = {}
        options.url = globalTabs[tab].url;
        chrome.tabs.create(options, function(tabn){
            tabn.time = 0;
            tabn.onWindow = true;
            globalTabs[tabn.id] = tabn;
            delete globalTabs[tab]
        });
    }
};

window.onload = init;
