$(function() {
  $('#search').change(function() {
     $('#term').text($('#search').val());
  });
});

$(function(){
});

chrome.tabs.onActivated.addListener(function(info){
    //TODO: ID changes when browser closes
    for(let tab in globalTabs){
        globalTabs[tab].active = false;
        if(globalTabs[tab].id === info.tabId)
            globalTabs[tab].active = true;
    };
});

//TODO: Updated globalTabs on add and remove

var globalTabs = {};

$(function checkTabs(){
    chrome.tabs.query({}, function(tabs){
        for(let tab of tabs){
            tab.time = 0;
            globalTabs[tab.url] = tab;
        };
        console.log(globalTabs);
    });
});

var globalT = 0;

function test(){
    var d = new Date();
    var t = d.getTime();

    if(globalT === 0)
        globalT = t;

    var dt = t - globalT;
    globalT = t;

    for(let tab in globalTabs){
        if(!globalTabs[tab].active){
            globalTabs[tab].time += dt;
        };
    };

    $('#term').text("olar")

    setTimeout(test, 1000);
};

window.onload = test;
