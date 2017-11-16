var through = require('through2');
var Vinyl = require('vinyl');
var {PluginError} = require('gulp-util');


function createTransformStream(pluginName, transformFn) {
    return through.obj(function(file, enc, cb) {
        if (file.isStream()) {
            this.emit('error', new PluginError(pluginName, 'Streams are not supported'));
            return cb();
        }
        if (file.isBuffer()) {
            transformFn(file, (error, result) => {
                if (error) {
                    this.emit('error', new PluginError(pluginName, error));
                    return cb();
                }
                this.push(result ? new Vinyl(result) : file);
                cb();
            });
            return;
        }
        this.push(file);
        cb();
    });
}

module.exports = createTransformStream;
