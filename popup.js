let globalSearch = "";

$(function() {
    $('#search').change(function() {
        globalSearch = $('#search').val().toLowerCase();
    });
});

function formatSeconds(seconds){
    var date = new Date(1970,0,1);
    date.setSeconds(seconds);
    return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
}

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
        if(globalTabs[tab].title.toLowerCase().search(globalSearch) != -1){
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
            textNode = document.createTextNode(formatSeconds(Math.round(globalTabs[tab].time)));
            el.appendChild(textNode);
            times.appendChild(el);
        }
    };

    setTimeout(update, 1000);
};

window.onload = update;
