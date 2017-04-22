let globalTabs = {};
let globalT = 0;
let globalConfig = {};

function getGlobalTabs(){
    return globalTabs;
}

function getGlobalConfig(){
    return globalConfig;
}

function setConfig(name, value){
    globalConfig[name] = value;

    chrome.storage.local.set(globalConfig);
}

function goto_tab(tabId){
    chrome.tabs.update(tabId, {active: true});
}

function on_clicked(id) {
    if (globalTabs[id].onWindow)
    {
        goto_tab(globalTabs[id].id);
    }
    else
    {
        let options = {};
        options.url = globalTabs[id].url;
        chrome.tabs.create(options, function(tabn){
            tabn.time = 0;
            tabn.onWindow = true;
            globalTabs[tabn.id] = tabn;
            delete globalTabs[id];
        });
    }
}

function update()
{
    let d = new Date();
    let t = d.getTime();

    if(globalT === 0)
        globalT = t;

    let dt = t - globalT;
    globalT = t;

    // check if browser was supended
    // and if so, don't update the timers
    if (dt < 10000)
    {
        // show how many tabs we're keeping track of
        let badge = {};
        badge.text = Object.keys(globalTabs).length.toString();
        chrome.browserAction.setBadgeText(badge);

        for(let tab in globalTabs){
            if(!globalTabs[tab].active)
            {
                globalTabs[tab].time += dt / 1000;
            }

            if(Object.keys(globalConfig).length !== 0 && globalTabs[tab].time > globalConfig['max_unused_tab_timer'] && globalTabs[tab].onWindow)
            {
                close_tab(globalTabs[tab]);
                globalTabs[tab].onWindow = false;
            }
        }
    }

    setTimeout(update, 1000);
}

function init()
{
    // read config file
    chrome.storage.local.get(null, function(items){
        globalConfig = items;
        if (Object.keys(globalTabs).length !== 0)
        {
            for (let id in globalTabs)
            {
                if (!globalConfig['persistent_timer'])
                {
                    globalTabs[id].time = 0;
                }
            }
        }
    });

    // initialize tabs
    chrome.tabs.query({}, function(tabs){
        for(let tab of tabs){
            tab.time = 0;
            tab.onWindow = true;
            globalTabs[tab.id] = tab;
        }
        if (localStorage['tabs'])
        {
            let previous_tabs = JSON.parse(localStorage['tabs']);
            for (let id in previous_tabs)
            {
                let tab = previous_tabs[id];

                if (Object.keys(globalConfig).length !== 0)
                {
                    if (!globalConfig['persistent_timer'])
                    {
                        tab.time = 0;
                    }
                }
                globalTabs[tab.id] = tab;
            }
        }

        // then start updating
        update();
    });
}

function get_duplicated_tab(tab)
{
    // NOTE: this is a hack
    // For some reason chrome is way to slow to send 'loading'
    // notifications when trying to access a new url, this causes
    // unwanted tabs to close when quickly opening a new tab after
    // trying to go to a new site on a previous one
    //
    // This line fixes that problem by making an exception for 'newtabs'
    if (tab.url === 'chrome://newtab/') return null;

    for (let id in globalTabs)
    {
        if (globalTabs[id].url === tab.url && globalTabs[id].id !== tab.id)
        {
            return globalTabs[id];
        }
    }

    return null;
}

// NOTE: this doesn't remove the tag from `globalTags`
// if you want the tab to be removed you should do so manually
// this behavior is intended (not a bug)
function close_tab(tab)
{
    try
    {
        if(tab.onWindow) chrome.tabs.remove(tab.id, function(){});
    }
    catch (e)
    {
        // NOTE: This probably doesn't work because async errors cannot
        // be caught like this, needs further investigation.
        console.error('Error trying to close tab, retrying...', e);
        close_tab(tab);
        setTimeout(close_tab.bind(tab), 500);
    }
}

function delete_old_tabs_with_same_url(tab)
{
    // NOTE: this is a hack
    // For some reason chrome is way to slow to send 'loading'
    // notifications when trying to access a new url, this causes
    // unwanted tabs to close when quickly opening a new tab after
    // trying to go to a new site on a previous one
    //
    // This line fixes that problem by making an exception for 'newtabs'
    if (tab.url === 'chrome://newtab/') return;

    for (let id in globalTabs)
    {
        if (globalTabs[id].url === tab.url && globalTabs[id].id !== tab.id)
        {
            if (!globalTabs[id].onWindow)
            {
                delete globalTabs[id];
            }
        }
    }
}

function store_new_tab(tab)
{
    // initialize tab data
    tab.time = 0;
    tab.onWindow = true;
    globalTabs[tab.id] = tab;

    // handle duplication
    delete_old_tabs_with_same_url(tab);
    let duplicate = get_duplicated_tab(tab);
    if (duplicate !== null)
    {
        goto_tab(duplicate.id);
        close_tab(tab);
        delete globalTabs[tab.id];
    }
}

function update_popup_list(){
    let prop = {};
    prop.type = 'popup';
    let array = chrome.extension.getViews(prop);
    if(typeof array[0] != 'undefined'){
        array[0].update_list();
    }

    localStorage.clear();
    localStorage['tabs'] = JSON.stringify(globalTabs);
}

chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {

    // wait for page to load completely
    if (info.status !== 'loading' && info.status !== 'complete') return;

    // if tab was closed already, do nothing
    if (!globalTabs[tabId]) return;

    // otherwise, update stored tab data
    tab.time = globalTabs[tabId].time;
    tab.onWindow = globalTabs[tabId].onWindow;
    delete globalTabs[tabId];
    globalTabs[tabId] = tab;

    // handle duplication
    delete_old_tabs_with_same_url(tab);
    let duplicate = get_duplicated_tab(tab);
    if (duplicate !== null)
    {
        goto_tab(duplicate.id);
        close_tab(tab);
        delete globalTabs[tabId];
    }
    update_popup_list();
});

chrome.tabs.onRemoved.addListener(function(tabId, info){
    for(let tab in globalTabs){
        if(globalTabs[tab].id === tabId)
        {
            // if user has manually closed it, let it go
            if(globalTabs[tab].onWindow)
                delete globalTabs[tab];

            // also let it go if we closed it but it is a local tab
            else if(globalTabs[tab].url.includes('chrome://'))
                delete globalTabs[tab];
        }
    }
    update_popup_list();
});

chrome.tabs.onCreated.addListener(function(tab){
    store_new_tab(tab);
    update_popup_list();
});

chrome.tabs.onReplaced.addListener(function(added_tab_id, removed_tab_id) {
    delete globalTabs[removed_tab_id];
    chrome.tabs.get(added_tab_id, (tab) => store_new_tab(tab));
    update_popup_list();
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
    }
});

window.onload = init;
