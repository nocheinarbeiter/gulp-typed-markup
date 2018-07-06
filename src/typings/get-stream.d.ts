declare module 'get-stream' {
    function array<T>(stream: NodeJS.ReadableStream): Promise<T[]>;
}
