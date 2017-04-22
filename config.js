$(function() {
    $('#sec').change(function() {
        let seconds = parseInt($('#sec').val());
        if(!isNaN(seconds))
            chrome.extension.getBackgroundPage().setConfig('max_unused_tab_timer', seconds);
    });
    $('#pers').change(function() {
        chrome.extension.getBackgroundPage().setConfig('persistent_timer', $('#pers').prop('checked'));
    });
});

function init(){
    let bsPage = chrome.extension.getBackgroundPage();
    let globalConfig = bsPage.getGlobalConfig();

    $('#sec').attr('value', globalConfig['max_unused_tab_timer']);
    if(globalConfig['persistent_timer'])
        $('#pers').prop('checked', true);
    else
        $('#pers').prop('checked', false);
}

window.onload = init;
