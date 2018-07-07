import * as through from 'through2';
import * as Vinyl from 'vinyl';
import * as PluginError from 'plugin-error';


export type BufferFile = {
    base: string;
    path: string;
    contents: Buffer;
}

// export type TransformFn = (file: BufferFile) => Promise<BufferFile>;
// такой вариант не прокатывает — если внутри catch у промиса вызывать done('error') или emit('error'),
// то получим unhandlerd promise rejection

export type TransformFn = (file: BufferFile, cb: (error: Error | null, result?: BufferFile) => void) => void;
// это все равно не помогает, нужно вызывать callback с ошибкой в nextTick

export function createTransformStream(pluginName: string, transformFn: TransformFn) {
    return through.obj(function (file, enc, done) {
        if (file.isStream()) {
            done(new PluginError(pluginName, 'Streams are not supported'));
            return;
        }
        if (file.isBuffer()) {
            transformFn(file, (err, result) =>
                err ?
                    done(new PluginError(pluginName, err))
                    :
                    done(null, new Vinyl(result))
            );
            return;
        }
        // file.isNull(), etc
        done(null, file);
    });
}
