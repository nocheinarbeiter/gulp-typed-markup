import * as pathUtil from 'path';
import {createTransformStream} from './vinyl-transform-stream-creator';
import {getModuleSource} from './';


function gulpReactMarkup(options: {suffix?: string}) {
    var fileNameSuffix = (options && options.suffix) || '';
    return (
        createTransformStream('gulp-react-markup', ({base, path, contents}, cb) =>
            getModuleSource(extractName(path), contents)
                .then(moduleSource => cb(null, {
                    base,
                    path: changePathExtension(path, fileNameSuffix + '.ts'),
                    contents: new Buffer(moduleSource)
                }))
                .catch(err => process.nextTick(() => cb(err)))
        )
    );
}
export = gulpReactMarkup;


function changePathExtension(path: string, ext: string) {
    var {dir, name} = pathUtil.parse(path);
    name = trimExtension(name);
    return pathUtil.format({dir, name, ext})
}

function extractName(path: string) {
    return trimExtension(pathUtil.basename(path));
}

function trimExtension(basename: string) {
    return basename.replace(/(\..*)/, '');
}
