$(function() {
  $('#search').change(function() {
     $('#term').text($('#search').val());
  });
});

chrome.tabs.onActivated.addListener(function(info) {
    //TODO: handle ID changes when browser closes
    for(let tab in globalTabs){
        globalTabs[tab].active = false;
        if(globalTabs[tab].id === info.tabId)
            globalTabs[tab].active = true;
            globalTabs[tab].time = 0;
    };
});

//TODO: Updated globalTabs on add and remove

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

var globalT = 0;

function update()
{
    var d = new Date();
    var t = d.getTime();

    if(globalT === 0)
        globalT = t;

    var dt = t - globalT;
    globalT = t;

    let urls = document.getElementById('urls');
    let cNode = urls.cloneNode(false);
    urls.parentNode.replaceChild(cNode, urls);
    urls = cNode;

    let times = document.getElementById('times');
    cNode = times.cloneNode(false);
    times.parentNode.replaceChild(cNode, times);
    times = cNode;

    let icons = document.getElementById('icons');
    cNode = icons.cloneNode(false);
    icons.parentNode.replaceChild(cNode, icons);
    icons = cNode;

    for(let tab in globalTabs){
        if(!globalTabs[tab].active){
            globalTabs[tab].time += dt / 1000;
        };

        let el = document.createElement('label');
        el.style = "float: left; white-space: nowrap; overflow: hidden; width: 100%; height: 40px";
        let textNode = document.createTextNode(globalTabs[tab].url);
        el.appendChild(textNode);
        urls.appendChild(el);

        el = document.createElement('label');
        let icon_url = globalTabs[tab].favIconUrl;
        if (icon_url) el.style = "background-image: url(" + icon_url + "); float: left; white-space: nowrap; overflow: hidden; width: 100%; height: 40px; background-size: 20px; background-repeat: no-repeat;";
        else el.style = "float: left; white-space: nowrap; overflow: hidden; width: 100%; height: 40px";
        icons.appendChild(el);

        el = document.createElement('label');
        el.style = "text-align: right; float: right; white-space: nowrap; overflow: hidden; width: 100%; height: 40px";
        textNode = document.createTextNode(Math.round(globalTabs[tab].time));
        el.appendChild(textNode);
        times.appendChild(el);
    };

    setTimeout(update, 1000);
};

window.onload = init;
