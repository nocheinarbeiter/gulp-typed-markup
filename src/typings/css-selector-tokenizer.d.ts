declare module 'css-selector-tokenizer' {
    type Selectors = {
        type: 'selectors';
        nodes: Selector[];
    };
    type Selector = {
        type: 'selector';
        nodes: Node[];
        before?: string; // whitespace before
        after?: string; // whitespace after
    };
    type Node =
        OperatorNode |
        IdNode |
        ElementNode |
        UniversalElementNode |
        PseudoElementNode |
        ClassNode |
        PseudoClassNode |
        NestedPseudoClassNode |
        AttributeNode |
        CommentNode |
        SpacingNode |
        InvalidNode
    ;
    type OperatorNode = {
        type: 'operator';
        operator: string;
        before?: string;
        after?: string;
    };
    type IdNode = {
        type: 'id';
        name: string;
    };
    type UniversalElementNode = {
        type: 'universal';
        namespace?: string;
    };
    type ElementNode = {
        type: 'element';
        name: string;
        namespace?: string;
    };
    type PseudoElementNode = {
        type: 'pseudo-element';
        name: string;
    };
    type ClassNode = {
        type: 'class';
        name: string;
    };
    type PseudoClassNode = {
        type: 'pseudo-class';
        name: string;
    };
    type NestedPseudoClassNode = {
        type: 'nested-pseudo-class';
        name: string;
        nodes: Selector[];
    };
    type AttributeNode = {
        type: 'attribute';
        content: string;
    };
    type CommentNode = {
        type: 'comment';
        content: string;
    };
    type SpacingNode = {
        type: 'spacing';
        value: string;
    };
    type InvalidNode = {
        type: 'invalid';
        value: string;
    };
    function parse(input: string): Selectors;
}
