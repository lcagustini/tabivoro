let globalSearch = '';

// get search information
$(function() {
    $('#search').change(function() {
        globalSearch = $('#search').val().toLowerCase();
        update_list();
    });
});

// formats seconds to hh:mm:ss
function formatSeconds(seconds){
    let date = new Date(1970,0,1);
    date.setSeconds(seconds);
    return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
}

// updates only the displayed time on the list
function update_time(){
    let bsPage = chrome.extension.getBackgroundPage();
    let globalTabs = bsPage.getGlobalTabs();

    for(let tab in globalTabs){
        $('#clock'+tab).text(formatSeconds(Math.round(globalTabs[tab].time)));
    }

    setTimeout(update_time, 1000);
}

// updates the whole list of tabs
function update_list()
{
    let bsPage = chrome.extension.getBackgroundPage();
    let globalTabs = bsPage.getGlobalTabs();
    let windows = [];

    // creates a div for each window
    for(let id in globalTabs){
        if($.inArray(globalTabs[id].windowId, windows) === -1)
            windows[windows.length] = globalTabs[id].windowId;
    }

    let list = document.getElementById('list');
    list.innerHTML = '';

    for(let wId in windows){
        let win = document.createElement('div');
        win.style = 'text-align: center; margin-bottom: 12px;';
        win.id = 'win'+windows[wId]
        list.appendChild(win);
    }

    // generates all the tabs elements
    for(let tab in globalTabs) {
        if(globalTabs[tab].title.toLowerCase().search(globalSearch) != -1){
            let row = document.createElement('button');
            row.style = 'width: 350px;';
            row.className = 'row mdl-button mdl-chip mdl-chip--contact mdl-chip--deletable mdl-shadow--3dp';
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
                icon.src = 'assets/blank.svg';

            let title = document.createElement('span');
            title.className = 'mdl-chip__text';
            title.style = 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;';
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
            cancel.src = 'assets/cancel.svg';
            cancel.className = 'mdl-chip__action';
            cancel.id = 'close'+tab;

            right.appendChild(clock);
            right.appendChild(cancel);
            row.appendChild(right);

            row.id = tab;
            row.onmouseover = function() {
                if(globalTabs[tab].onWindow){
                    $(this).removeClass('mdl-color--blue-grey-100');
                    $(this).addClass('mdl-color--blue-grey-200');
                }
                else{
                    $(this).removeClass('mdl-color--red-200');
                    $(this).addClass('mdl-color--red-300');
                }
            };
            row.onmouseout = function() {
                if(globalTabs[tab].onWindow){
                    $(this).removeClass('mdl-color--blue-grey-200');
                    $(this).addClass('mdl-color--blue-grey-100');
                }
                else{
                    $(this).removeClass('mdl-color--red-300');
                    $(this).addClass('mdl-color--red-200');
                }
            };
            $('#win'+globalTabs[tab].windowId).append(row);
        }

        $('#close'+tab).click(function(){
            bsPage.close_tab(globalTabs[tab]);
            delete globalTabs[tab];
            bsPage.update_popup_list();
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
