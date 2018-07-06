declare module 'bem-classname-parser' {
    type BEMInfo = {
        name: string;
        mod?: {name: string; sep: string; val: string | null};
    };
    function parse(classname: string): {block: BEMInfo; elem?: BEMInfo};
}
