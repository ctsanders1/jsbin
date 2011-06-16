//= require "errors"
//= require "download"
//= require "../render/live"
//= require "tips"
this.livePreview = function () {
  $('#live').trigger('toggle');
};

var debug = jsbin.settings.debug === undefined ? false : jsbin.settings.debug,
    documentTitle = null, // null = JS Bin
    $bin = $('#bin'),
    loadGist,
    $document = $(document),
    unload = function () {
      sessionStorage.setItem('javascript', editors.javascript.getCode());
      sessionStorage.setItem('html', editors.html.getCode());
      sessionStorage.setItem('url', template.url);
      
      localStorage.setItem('settings', JSON.stringify(jsbin.settings));
      
      var panel = getFocusedPanel();
      sessionStorage.setItem('panel', panel);
      try { // this causes errors in IE9 - so we'll use a try/catch to get through it
        sessionStorage.setItem('line', editors[panel].getCursor().line);
        sessionStorage.setItem('character', editors[panel].getCursor().ch);
      } catch (e) {
        sessionStorage.setItem('line', 0);
        sessionStorage.setItem('character', 0);
      }
    };

//= require "storage"
//= require "navigation"
//= require "save"
//= require "file-drop"

$(window).unload(unload);

// hack for Opera because the unload event isn't firing to capture the settings, so we put it on a timer
if ($.browser.opera) {
  setInterval(unload, 500);
}

/* Boot code */
// if the user linked directly to #html, initially hide the JS panel
if (({ '#html':1, '#javascript':1 })[window.location.hash]) {
  document.getElementById('bin').className += ' ' + window.location.hash.substr(1) + '-only';
} else if (localStorage && localStorage.getItem('visible-panel')) {
  $bin.addClass(localStorage.getItem('visible-panel') + '-only');
}

if (window.location.hash == '#preview') {
  $('body').removeClass('source').addClass('preview');
  window.scrollTo(0, 0);
  $document.bind('jsbinReady', function () {
    $('#control .preview').click();
  });
}

$document.one('jsbinReady', function () {
  // if (localStorage && localStorage.getItem('livepreview') == 'true') { // damn string coersion
  //   $('#live').trigger('show');
  // }

  $('.code.html').splitter();
  $live.splitter();

  for (panel in jsbin.settings.show) {
    if (jsbin.settings.show[panel]) {
      $('#show' + panel).attr('checked', 'checked')[0].checked = true;
    } else {
      $('#show' + panel).removeAttr('checked')[0].checked = false;
    }
  }
  
  for (panel in jsbin.settings.show) {
    updatePanel(panel, jsbin.settings.show[panel]);
  }

  $bin.removeAttr('style').addClass('ready');
});

// if a gist has been requested, lazy load the gist library and plug it in
if (/gist\/\d+/.test(window.location.pathname) && (!sessionStorage.getItem('javascript') && !sessionStorage.getItem('html'))) {
  window.editors = editors; // needs to be global when the callback triggers to set the content
  loadGist = function () {
    $.getScript('/js/chrome/gist.js', function () {
      window.gist = new Gist(window.location.pathname.replace(/.*?(\d+).*/, "$1"));
    });
  };
  
  if (editors.ready) {
    loadGist();
  } else {
    editors.onReady = loadGist;
  }
}

$document.keydown(function (event) {
  if (event.metaKey && event.which == 83) {
    $('#save').click();
    event.preventDefault();
  }
});

window.CodeMirror = CodeMirror; // fix to allow code mirror to break naturally

// $(window).bind('online', function () {
//   console.log("we're online");
// }).bind('offline', function () {
//   console.log("we're offline");
// });

