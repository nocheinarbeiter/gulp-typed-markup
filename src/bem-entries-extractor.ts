import * as BemParser from 'bem-classname-parser';
import {ClassEntry, BemEntry, BemEntryMods, BemModValue} from './types';


function getBemEntries(classEntries: ClassEntry[]): BemEntry[] {
    var primaryBlock: string | undefined;
    var elemList: string[] = [];
    var modsMap: {[elemName: string]: BemEntryMods} = {};
    var tagMap: {[elemName: string]: string} = {};
    for (var {className, tagName} of classEntries) {
        var {block, elem} = BemParser.parse(className);
        if (!primaryBlock) {
            primaryBlock = block.name;
        }
        if (!block.name) {
            // it is a feature to skip classes without a block
            continue;
        }
        if (block.name !== primaryBlock) {
            console.warn("found more then more then one blocks in module: " +
                `   "${primaryBlock}" and "${block.name}", second block will be ignored`
            );
            continue;
        }
        if (!elem || block.mod) {
            throw new Error('block is just a namespace, it should not have content or mods: ' + className);
        }
        if (!elemList.includes(elem.name)) {
            elemList.push(elem.name);
        }

        if (tagName) {
            if (tagMap[elem.name] && tagMap[elem.name] !== tagName) {
                throw new Error('found different tag names for same element: ' + className);
            }
            tagMap[elem.name] = tagName;
        }

        var mod = elem.mod;
        if (mod) {
            if (!(elem.name in modsMap)) {
                modsMap[elem.name] = {};
            }
            var storedModVal = modsMap[elem.name][mod.name];
            if (
                (mod.val !== null && storedModVal === null) ||
                (mod.val === null && Array.isArray(storedModVal))
            ) {
                throw new Error('modifier type cannot be either boolean and enum: ' + className);
            }
            modsMap[elem.name][mod.name] = mod.val ? (storedModVal || []).concat(mod.val) : null;
        }
    }
    return elemList.map(elemName => ({
        block: primaryBlock!,
        tag: tagMap[elemName] || 'div',
        elem: elemName,
        mods: modsMap[elemName] || null
    }))
}
