$(function() {
  $('#search').change(function() {
     $('#term').text($('#search').val());
  });
});

function update()
{
    let globalTabs = chrome.extension.getBackgroundPage().getGlobalTabs();

    let urls = document.getElementById('urls');
    let times = document.getElementById('times');
    let icons = document.getElementById('icons');

    urls.innerHTML = '';
    times.innerHTML = '';
    icons.innerHTML = '';

    for(let tab in globalTabs) {
        let el = document.createElement('label');
        el.style = "float: left; white-space: nowrap; overflow: hidden; width: 100%; height: 20px; margin-bottom: 5px;";
        let textNode = document.createTextNode(globalTabs[tab].title);
        el.appendChild(textNode);
        urls.appendChild(el);

        el = document.createElement('label');
        let icon_url = globalTabs[tab].favIconUrl;
        if (icon_url) el.style = "background-position: top; background-image: url(" + icon_url + "); float: left; white-space: nowrap; overflow: hidden; width: 100%; height: 20px; background-size: 20px; background-repeat: no-repeat; margin-bottom: 5px;";
        else el.style = "float: left; white-space: nowrap; overflow: hidden; width: 100%; height: 20px; margin-bottom: 5px;";
        icons.appendChild(el);

        el = document.createElement('label');
        el.style = "text-align: right; float: right; white-space: nowrap; overflow: hidden; width: 100%; height: 20px; margin-bottom: 5px;";
        textNode = document.createTextNode(Math.round(globalTabs[tab].time));
        el.appendChild(textNode);
        times.appendChild(el);
    };

    setTimeout(update, 1000);
};

window.onload = update;
