import * as through from 'through2';
import * as Vinyl from 'vinyl';
import * as PluginError from 'plugin-error';


export type BufferFile = {
    base: string;
    path: string;
    contents: Buffer;
}

export type TransformFn = (file: BufferFile) => Promise<BufferFile>;

export function createTransformStream(pluginName: string, transformFn: TransformFn) {
    return through.obj((file, enc, done) => {
        if (file.isStream()) {
            done(new PluginError(pluginName, 'Streams are not supported'));
            return;
        }
        if (file.isBuffer()) {
            transformFn(file)
                .then(result => done(null, new Vinyl(result)))
                .catch(error =>
                    // *** don't do this:
                    // done(new PluginError(pluginName, error))
                    // *** done(error) called immediately causes unhandled promise rejection (node 8.9.4)
                    process.nextTick(() => done(new PluginError(pluginName, error)))
                )
            ;
            return;
        }
        // file.isNull(), etc
        done(null, file);
    });
}
