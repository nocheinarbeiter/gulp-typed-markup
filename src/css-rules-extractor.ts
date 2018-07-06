import * as fromStreamTo from 'get-stream';
import fromBufferToStream from 'from2-buffer';
import tokenizeStylesheet from 'css-tokenize';
import filter from 'through2-filter';
import map from 'through2-map';

type StylesheetToken = [/*name*/ string, /*body*/ Buffer];

function getCssRules(stylesheetSourceBuffer: Buffer): Promise<string[]> {
    if (!stylesheetSourceBuffer.length) {
        // prevent css-tokenize warning for empty buffer
        return Promise.resolve([]);
    }
    var tokensStream = fromBufferToStream(stylesheetSourceBuffer)
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
