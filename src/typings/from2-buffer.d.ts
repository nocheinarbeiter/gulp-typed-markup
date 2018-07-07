declare module 'from2-buffer' {
    function fromBufferToStream(buffer: Buffer): NodeJS.ReadableStream;
    export = fromBufferToStream;
}
