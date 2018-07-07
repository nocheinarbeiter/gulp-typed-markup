import * as pathUtil from 'path';
import {createTransformStream} from './vinyl-transform-stream-creator';
import {getModuleSource} from './';


function gulpReactMarkup(options: {suffix?: string}) {
    var fileNameSuffix = (options && options.suffix) || '';
    return createTransformStream('gulp-react-markup', async ({base, path, contents}) => ({
        base,
        path: changePathExtension(path, fileNameSuffix + '.ts'),
        contents: new Buffer(await getModuleSource(extractName(path), contents))
    }));
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
