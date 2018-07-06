declare module 'through2-filter' {
    export default function <T>(filter: (chunk: T) => boolean): NodeJS.ReadWriteStream;
}
