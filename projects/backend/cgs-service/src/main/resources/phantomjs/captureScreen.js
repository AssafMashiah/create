var system = require('system');
var url = system.args[1];
var outputFile = system.args[2];
if (!url) {
    console.log("Error: URL cannot be empty");
    phantom.exit(1);
}

if (!outputFile) {
    console.log("Error: output file cannot be empty");
    phantom.exit(1);
}

var width = system.args[3] != null ? system.args[3] : 980;
var height = system.args[4] != null ? system.args[4] : 1437;

if (width < 0 || width != ~~width) {// make sure it's positive and that there's no decimal part
    console.log("Error: invalid width " + width);
    phantom.exit(1);
}

if (height < 0 || height != ~~height) { // make sure it's positive and that there's no decimal part
    console.log("Error: invalid height " + height);
    phantom.exit(1);
}

var page = require('webpage').create();
page.viewportSize = { width: width, height: height};
page.clipRect = {top: 0, left: 0, width: width, height: height};

console.log("About to take a web page snapshot from: " + url);
page.open(url, function(status) {
    if (status === 'fail') {
        console.log('Error: failed to open web page for URL: ' + url);
        phantom.exit(1);
    }

    // if the background is transparent - change it to white so it won't cause a black background color in JPG output files
    if (getComputedStyle(document.body, null).backgroundColor === 'rgba(0, 0, 0, 0)') {
        console.log("Changing transparent background to white..."); // this will prevent black backgrounds in thumbnails in case of JPG output files.
        page.evaluate(function() {
            // a solution for transparent background issue explanation on: http://uggedal.com/journal/phantomjs-default-background-color/
            var style = document.createElement('style');
            var text = document.createTextNode('body { background: #fff }');
            style.setAttribute('type', 'text/css');
            style.appendChild(text);
            document.head.appendChild(style);
        });
    }

    page.includeJs("{{jQueryPath}}", function() {
        page.evaluate(function(width) {
            $('body').css({
                position: 'absolute',
                overflow: 'hidden'
            });

            var scaleFactor = null;
            var currentWidth = $('body').width();
            if (width != currentWidth) {
                scaleFactor = (width / currentWidth).toFixed(3);
            } else {
                scaleFactor = 1;
            }

            // scale frame inner content
            $('body').css('transform', 'scale(' + scaleFactor + ')').css('transform-origin', 'top left');
        }, width);
    });

    window.setTimeout(function () {
        page.render(outputFile);
        console.log("Web page snapshot had been successfully taken.");
        phantom.exit(0);
    }, 1);
});