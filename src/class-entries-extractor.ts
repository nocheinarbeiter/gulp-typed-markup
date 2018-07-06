import {Selector} from 'css-selector-tokenizer';
import * as SelectorTokenizer from 'css-selector-tokenizer';
import {ClassEntry} from './types';


function getClassEntries(cssRules: string[]): ClassEntry[] {
    var entries: ClassEntry[] = [];
    for (var rule of cssRules) {
        fillClassEntriesForSelectors(SelectorTokenizer.parse(rule).nodes, entries);
    }
    // get distinct results
    var classList: string[] = [];
    var tagMap: {[className: string]: string} = {};
    for (var {className, tagName} of entries) {
        if (!classList.includes(className)) {
            classList.push(className);
        }
        if (tagName) {
            //fixme: нужно отслеживать, что тега еще нет или он тот же самый
            tagMap[className] = tagName;
        }
    }
    return classList.map(className => ({className, tagName: tagMap[className]}));
}

function fillClassEntriesForSelectors(cssSelectors: Selector[], result: ClassEntry[]) {
    for (var selector of cssSelectors) {
        fillClassEntriesForSelector(selector, result);
    }
}

function fillClassEntriesForSelector(cssSelector: Selector, result: ClassEntry[]) {
    var contextTagName: string | undefined;
    for (var node of cssSelector.nodes) {
        switch (node.type) {
            case 'nested-pseudo-class':
                fillClassEntriesForSelectors(node.nodes, result);
                break;
            case 'element':
                contextTagName = node.name;
                break;
            case 'class':
                result.push({className: node.name, tagName: contextTagName});
                break;
            case 'spacing':
            case 'operator':
                contextTagName = undefined;
        }
    }
}
