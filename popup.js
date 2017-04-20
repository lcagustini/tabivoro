let globalSearch = '';

$(function() {
    $('#search').change(function() {
        globalSearch = $('#search').val().toLowerCase();
    });
});

function formatSeconds(seconds){
    let date = new Date(1970,0,1);
    date.setSeconds(seconds);
    return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
}

function update()
{
    let bsPage = chrome.extension.getBackgroundPage();
    let globalTabs = bsPage.getGlobalTabs();

    let list = document.getElementById('list');

    list.innerHTML = '';

    for(let tab in globalTabs) {
        if(globalTabs[tab].title.toLowerCase().search(globalSearch) != -1){
            let row = document.createElement('div');
            row.style = 'width: 100%; height: 22px; display: table-row;';

            let el = document.createElement('label');
            let icon_url = globalTabs[tab].favIconUrl;
            if (icon_url && !(icon_url.includes('chrome://'))) el.style = 'display: table-cell; background-position: top; background-image: url(' + icon_url + '); min-width: 30px; height: 22px; background-size: 22px; background-repeat: no-repeat;';
            else el.style = 'display: table-cell; min-width: 30px; height: 22px;';
            row.appendChild(el);

            let wrapper = document.createElement('div');
            wrapper.style = 'display: table-cell; width = 100%; height = 22px;';
            el = document.createElement('label');
            if(globalTabs[tab].onWindow)
                el.style = 'display: block; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; width: 250px; height: 22px; margin-top: 2px;';
            else
                el.style = 'display: block; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; width: 250px; height: 22px; color: red; margin-top: 2px;';
            let textNode = document.createTextNode(globalTabs[tab].title);
            el.appendChild(textNode);
            wrapper.appendChild(el);
            row.appendChild(wrapper);

            el = document.createElement('label');
            el.style = 'display: table-cell; text-align: right; min-width: 90px !important; height: 22px; margin-top: 2px;';
            textNode = document.createTextNode(formatSeconds(Math.round(globalTabs[tab].time)));
            el.appendChild(textNode);
            row.appendChild(el);

            list.appendChild(row);

            row.id = tab;
            row.onmouseover = function() { this.style.backgroundColor = '#ee9955'; };
            row.onmouseout = function() { this.style.backgroundColor = '#ffbb77'; };
        }
        $('#'+tab).click(function(){
            bsPage.on_clicked(tab);
        });
    }

    setTimeout(update, 1000);
}

window.onload = update;
