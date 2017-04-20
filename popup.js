let globalSearch = '';

$(function() {
    $('#search').change(function() {
        globalSearch = $('#search').val().toLowerCase();
        update_list();
    });
});

function formatSeconds(seconds){
    let date = new Date(1970,0,1);
    date.setSeconds(seconds);
    return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
}

function update_time(){
    let bsPage = chrome.extension.getBackgroundPage();
    let globalTabs = bsPage.getGlobalTabs();

    for(let tab in globalTabs){
        console.log(globalTabs[tab].time);
        $('#clock'+tab).text(formatSeconds(Math.round(globalTabs[tab].time)));
    }

    setTimeout(update_time, 1000);
}

function update_list()
{
    let bsPage = chrome.extension.getBackgroundPage();
    let globalTabs = bsPage.getGlobalTabs();

    let list = document.getElementById('list');

    list.innerHTML = '';

    for(let tab in globalTabs) {
        if(globalTabs[tab].title.toLowerCase().search(globalSearch) != -1){
            let row = document.createElement('button');
            row.style = 'width: 350px;';
            row.className = 'row mdl-button mdl-js-button mdl-chip mdl-chip--contact mdl-chip--deletable mdl-js-ripple-effect mdl-shadow--3dp';
            if(globalTabs[tab].onWindow)
                row.className += ' mdl-color--blue-grey-100';
            else
                row.className += ' mdl-color--red-200';

            let left = document.createElement('div');
            left.style = 'float: left';

            let icon_url = globalTabs[tab].favIconUrl;
            let icon = document.createElement('img');
            icon.className = 'mdl-chip__contact';
            if (icon_url && !(icon_url.includes('chrome://')))
                icon.src = icon_url;
            else
                icon.src = 'lib/blank.svg';

            let title = document.createElement('span');
            title.className = 'mdl-chip__text';
            title.style = "white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 220px;"
            title.innerHTML = globalTabs[tab].title;

            left.appendChild(icon);
            left.appendChild(title);
            row.appendChild(left);

            let right = document.createElement('div');
            right.style = 'float: right;';

            let clock = document.createElement('span');
            clock.id = 'clock'+tab;
            clock.className = 'mdl-chip__text';
            clock.innerHTML = formatSeconds(Math.round(globalTabs[tab].time));

            let cancel = document.createElement('img');
            cancel.src = 'lib/cancel.svg';
            cancel.className = 'mdl-chip__action';
            cancel.id = 'close'+tab;

            right.appendChild(clock);
            right.appendChild(cancel);
            row.appendChild(right);

            list.appendChild(row);

            row.id = tab;

            row.onmouseover = function() {
                if(globalTabs[tab].onWindow){
                    $(this).removeClass("mdl-color--blue-grey-100");
                    $(this).addClass("mdl-color--blue-grey-200");
                }
                else{
                    $(this).removeClass("mdl-color--red-200");
                    $(this).addClass("mdl-color--red-300");
                }
            };
            row.onmouseout = function() {
                if(globalTabs[tab].onWindow){
                    $(this).removeClass("mdl-color--blue-grey-200");
                    $(this).addClass("mdl-color--blue-grey-100");
                }
                else{
                    $(this).removeClass("mdl-color--red-300");
                    $(this).addClass("mdl-color--red-200");
                }
            };
        }

        $('#close'+tab).click(function(){
            bsPage.close_tab(globalTabs[tab]);
            delete globalTabs[tab];
            update_list();
        });

        $('#'+tab).click(function(){
            bsPage.on_clicked(tab);
        });

    }
}

function init(){
    update_list();
    update_time();
}

window.onload = init;
