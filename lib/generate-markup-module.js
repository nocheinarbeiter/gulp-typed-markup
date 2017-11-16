var getStream = require('get-stream');
var BemParser = require('bem-classname-parser');
var tokenizeStylesheet = require('css-tokenize');
var SelectorTokenizer = require('css-selector-tokenizer');
var fromBuffer = require('from2-buffer');
var through = require('through2');


function generateMarkupModule(fileName, cssSourceBuffer) {
    return getCssRules(cssSourceBuffer)
        .then(cssRules => getModuleSource(fileName, cssRules));
}
module.exports = generateMarkupModule;

/*---*/

function getCssRules(stylesheetSourceBuffer) {
    if (!stylesheetSourceBuffer.length) {
        // prevent css-tokenize warning for empty buffer
        return Promise.resolve([]);
    }
    return getStream.array(fromBuffer(stylesheetSourceBuffer)
        .pipe(tokenizeStylesheet())
        .pipe(through.obj(function(token, enc, next) { // this mattres, no arrow function here
            var [name, body] = token;
            if (name === 'rule_start') {
                this.push(
                    body.toString()   // convert from buffer
                        .slice(0, -1) // drop last char — {
                        .trim()       // trim spaces
                )
            }
            next();
        }))
    );
}

/*---*/

function getModuleSource(fileName, cssRules) {
    return new Promise((resolve, reject) => {
        try {
            resolve(getModuleSourceWorker(fileName, cssRules));
        } catch (e) {
            reject(e)
        }
    });
}

function getModuleSourceWorker(fileName, cssRules) {
    var classEntries = getClassEntries(cssRules);
    var bemEntries = getBemEntries(classEntries);
    var moduleSource = generateModuleSource(fileName, bemEntries);
    return moduleSource;
}

/*---*/

function getClassEntries(cssRules) {
    var entries = []; //: {className: string, tagName?: string}[]
    for (var rule of cssRules) {
        fillClassEntriesForSelectors(SelectorTokenizer.parse(rule).nodes, entries);
    }
    // get distinct results
    var classList = [];
    var tagMap = {};
    for (var {className, tagName} of entries) {
        if (! classList.includes(className)) {
            classList.push(className);
        }
        if (tagName) {
            tagMap[className] = tagName;
        }
    }
    return classList.map(className => ({className, tagName: tagMap[className]}));
}

function fillClassEntriesForSelectors(cssSelectors, result) {
    for (var selector of cssSelectors) {
        fillClassEntriesForSelector(selector, result);
    }
}

function fillClassEntriesForSelector(cssSelector, result) {
    var contextTagName = undefined;
    for (var node of cssSelector.nodes) {
        switch (node.type) {
            case 'nested-pseudo-class':
                fillClassEntriesForSelectors(node.nodes, result);
                break;
            case 'element':
                contextTagName = node.name;
                break;
                break;
            case 'class':
                result.push({className: node.name, tagName: contextTagName});
                break;
            // case 'pseudo-class':
            // case 'pseudo-element':
            // case 'attribute':
            // case 'id':
            // practically, deep selector inpection not necessary for contextTagName resolution
            // break;
            default:
                contextTagName = undefined;
        }
    }
}

/*---*/

function getBemEntries(classEntries) {
    var primaryBlock;
    var elemList = [];
    var modsMap = {};
    var tagMap = {};
    for (var {className, tagName} of classEntries) {
        // parsed as {block: {name, mod?: {name, sep, val}}, elem?: {name, mod?: {name, sep, val}}}
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
        if (! elemList.includes(elem.name)) {
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
            if (! (elem.name in modsMap)) {
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
    //{block: string, elem: string, tag: string, mods: {[name: string]: string[] | null} | null}
    return elemList.map(elemName => ({
        block: primaryBlock,
        tag: tagMap[elemName] || 'div',
        elem: elemName,
        mods: modsMap[elemName] || null
    }))
}

/*---*/

function generateModuleSource(fileName, bemEntries) {
    return concat(
        'import * as Markup from \'react-typed-markup\';',
        `declare var require: any; require('./${fileName}.css');`,
        '',
        bemEntries.map(generateFactoryFunction)
    );
}

function generateFactoryFunction({tag, block, elem, mods}) {
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

function generateModsTypeDeclaration(elem, mods) {
    return concat(
        `export type ${getModsTypeName(elem)} = {`,
        Object.keys(mods).map(mod =>
            `    ${mod}?: ${generateModType(mods[mod])};`
        ),
        '}'
    );
}

function getModsTypeName(elem) {
    return [
        elem.slice(0, 1).toUpperCase(),
        elem.slice(1),
        'Mods'
    ].join('')
}

function generateModType(modValue) {
    if (modValue === null) {
        return 'boolean';
    }
    return modValue.map(val => `'${val}'`).join(' | ');
}

function concat() {
    return Array.prototype.concat.apply([], arguments).join('\n');
}
