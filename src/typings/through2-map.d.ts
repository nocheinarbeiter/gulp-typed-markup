declare module 'through2-map' {
    export default function <T>(map: (chunk: T) => any): NodeJS.ReadWriteStream;
}
