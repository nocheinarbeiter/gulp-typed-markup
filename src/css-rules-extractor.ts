import * as fromStreamTo from 'get-stream';
import fromBufferToStream = require('from2-buffer');
import tokenizeStylesheet = require('css-tokenize');
import {obj as filter} from 'through2-filter';
import {obj as map} from 'through2-map';


type StylesheetToken = [/*name*/ string, /*body*/ Buffer];

export async function getCssRules(stylesheetSourceBuffer: Buffer): Promise<string[]> {
    if (!stylesheetSourceBuffer.length) {
        // prevent css-tokenize warning for empty buffer
        return [];
    }
    const tokensStream = fromBufferToStream(stylesheetSourceBuffer)
        .pipe(tokenizeStylesheet())
        .pipe(filter<StylesheetToken>(([name]) => name == 'rule_start'))
        .pipe(map<StylesheetToken>(([name, body]) => normalizeRule(body.toString())))
    ;
    return fromStreamTo.array<string>(tokensStream);
}

function normalizeRule(rule: string) {
    return (
        rule.slice(0, -1) // drop last char — {
            .trim()       // trim spaces
    );
}
