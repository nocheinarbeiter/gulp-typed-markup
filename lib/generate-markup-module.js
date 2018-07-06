var getStream = require('get-stream');
var tokenizeStylesheet = require('css-tokenize');
var fromBuffer = require('from2-buffer');
var through = require('through2');


function generateMarkupModule(fileName, cssSourceBuffer) {
    return getCssRules(cssSourceBuffer)
        .then(cssRules => getModuleSource(fileName, cssRules));
}
module.exports = generateMarkupModule;

/*---*/


/*---*/

function getModuleSource(fileName, cssRules) {
    return new Promise((resolve, reject) => {
        try {
            resolve(getModuleSourceWorker(fileName, cssRules));
        } catch (e) {
            reject(e)
        }
    });
}

function getModuleSourceWorker(fileName, cssRules) {
    var classEntries = getClassEntries(cssRules);
    var bemEntries = getBemEntries(classEntries);
    var moduleSource = generateModuleSource(fileName, bemEntries);
    return moduleSource;
}
