declare module 'through2-filter' {
    interface Through2Filter {
        <T>(filter: (chunk: T) => boolean): NodeJS.ReadWriteStream;
    }
    interface ExportingModule extends Through2Filter {
        obj: Through2Filter;
    }
    const exportingModule: ExportingModule;
    export = exportingModule;
}
