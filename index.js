var pathUtil = require('path');
var createTransformStream = require('./lib/vinyl-transform-stream-creator');
var generateFactoryModule = require('./lib/generate-markup-module');


function gulpReactMarkup(options) {
    var fileNameSuffix = (options && options.suffix) || '';
    return createTransformStream('gulp-react-markup', ({base, path, contents}, cb) => {
        generateFactoryModule(extractName(path), contents)
            .then(moduleSource => cb(null, {
                base,
                path: changePathExtension(path, fileNameSuffix + '.ts'),
                contents: new Buffer(moduleSource)
            }))
            .catch(error => cb(error))
    });
}
module.exports = gulpReactMarkup;

function changePathExtension(path, ext) {
    var {dir, name} = pathUtil.parse(path);
    name = trimExtension(name);
    return pathUtil.format({dir, name, ext})
}

function extractName(path) {
    return trimExtension(pathUtil.basename(path));
}

function trimExtension(basename) {
    return basename.replace(/(\..*)/, '');
}
