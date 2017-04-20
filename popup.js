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
            let row = document.createElement('span');
            row.style = 'width: 350px;';
            if(bsPage.get_hover(tab))
                row.className = "row mdl-chip mdl-chip--contact mdl-chip--deletable mdl-shadow--3dp mdl-color--blue-grey-200";
            else
                row.className = "row mdl-chip mdl-chip--contact mdl-chip--deletable mdl-shadow--3dp mdl-color--blue-grey-100";

            let left = document.createElement('div');
            left.style = "float: left";

            let icon_url = globalTabs[tab].favIconUrl;
            let icon = document.createElement('img');
            icon.className = "mdl-chip__contact";
            if (icon_url && !(icon_url.includes('chrome://')))
                icon.src = icon_url;
            else
                icon.src = "lib/blank.png";

            let title = document.createElement('span');
            title.className = "mdl-chip__text";
            title.innerHTML = globalTabs[tab].title;

            left.appendChild(icon);
            left.appendChild(title);
            row.appendChild(left);

            let right = document.createElement('div');
            right.style = "float: right;";

            let clock = document.createElement('span');
            clock.className = "mdl-chip__text";
            clock.innerHTML = formatSeconds(Math.round(globalTabs[tab].time));

            let cancel = document.createElement('img');
            cancel.src = "lib/cancel.svg";
            cancel.className = "mdl-chip__action";
            cancel.id = "close"+tab;

            right.appendChild(clock);
            right.appendChild(cancel);
            row.appendChild(right);

            list.appendChild(row);

            row.id = tab;
        }

        $('#close'+tab).click(function(){
            bsPage.close_tab(globalTabs[tab]);
        });

        $('#'+tab).click(function(){
            bsPage.on_clicked(tab);
        });

        $('#'+tab).hover(function(){
            bsPage.set_hover(tab, true);
        }, function(){
            bsPage.set_hover(tab, false);
        });
    }

    setTimeout(update, 400);
}

window.onload = update;
window.onunload = function(){
    let bsPage = chrome.extension.getBackgroundPage();
    let globalTabs = bsPage.getGlobalTabs();
    for(let tab in globalTabs) {
        bsPage.set_hover(tab, false);
    }
};
