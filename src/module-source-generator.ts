import {BemEntry, BemEntryMods, BemModValue} from './types';


export function generateModuleSource(moduleName: string, bemEntries: BemEntry[]) {
    return concat(
        'import * as Markup from \'react-typed-markup\';',
        `declare var require: any; require('./${moduleName}.css');`,
        '',
        bemEntries.map(generateFactoryFunction)
    );
}

function generateFactoryFunction({tag, block, elem, mods}: BemEntry) {
    var TAG = tag.toUpperCase();
    var modsTypeParam = mods !== null ? getModsTypeName(elem) : 'null';
    return concat(
        `export var ${elem}: Markup.Tag${TAG}<${modsTypeParam}> = Markup.bind(`,
        `    '${tag}', '${block}', '${elem}'`,
        ');',
        mods !== null ? generateModsTypeDeclaration(elem, mods) : [],
        ''
    );
}

function generateModsTypeDeclaration(elem: string, mods: BemEntryMods) {
    return concat(
        `export type ${getModsTypeName(elem)} = {`,
        Object.keys(mods).map(mod =>
            `    ${mod}?: ${generateModType(mods[mod])};`
        ),
        '}'
    );
}

function getModsTypeName(elem: string) {
    return [
        elem.slice(0, 1).toUpperCase(),
        elem.slice(1),
        'Mods'
    ].join('')
}

function generateModType(modValue: BemModValue) {
    if (modValue == null) {
        return 'boolean';
    }
    return modValue.map(val => `'${val}'`).join(' | ');
}

function concat(...args: (string | string[])[]): string;
function concat() {
    return Array.prototype.concat.apply([], arguments).join('\n');
}
