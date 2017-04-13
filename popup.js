$(function() {
  $('#search').change(function() {
     $('#term').text($('#search').val());
  });
});

function update()
{
    let globalTabs = chrome.extension.getBackgroundPage().getGlobalTabs();

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

    for(let tab in globalTabs) {
        let el = document.createElement('label');
        el.style = "float: left; white-space: nowrap; overflow: hidden; width: 100%; height: 40px";
        let textNode = document.createTextNode(globalTabs[tab].title);
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

window.onload = update;
