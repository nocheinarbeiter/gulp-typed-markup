export type ClassEntry = {
    className: string;
    tagName?: string;
};

export type BemEntry = {
    tag: string;
    block: string;
    elem: string;
    mods: BemEntryMods | null;
};
export type BemEntryMods = {
    [name: string]: BemModValue;
};
export type BemModValue = string[] | null;
