declare module 'through2-map' {
    interface Through2Map {
        <T>(map: (chunk: T) => any): NodeJS.ReadWriteStream;
    }
    interface ExportingModule extends Through2Map {
        obj: Through2Map;
    }
    const exportingModule: ExportingModule;
    export = exportingModule;
}
