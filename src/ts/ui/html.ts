module arachne.ui.html {

    enum TokenType {
        Angle,
        UnAngle,
        Slash,
        Equals,
        Quoted,
        Entity,
        Atom,
        Text,
        Interpolation,
        EOI
    }

    type TokenWithoutText = TokenType.EOI 
                          | TokenType.Angle
                          | TokenType.UnAngle
                          | TokenType.Slash
                          | TokenType.Equals
                          ;

    type TokenWithText = TokenType.Quoted
                       | TokenType.Entity
                       | TokenType.Atom
                       | TokenType.Text
                       ;

    interface LexerPosition {
        line: number;
        character: number;
    }

    type LexerToken = {type: TokenWithoutText, start: LexerPosition}
                    | {type: TokenWithText, start: LexerPosition, text: string}
                    | {type: TokenType.Interpolation, start:LexerPosition, interpolation: any}
                    ;

    type Lexable = string 
                 | {interpolation: any}
                 ;

    function isInterpolable(l:Lexable): l is {interpolation: any} {
        return (typeof l === "object" && "interpolation" in l);
    }


    export class Lexer {
        private input: string[]
        private index = 0;
        private segment = 0;

        private inTag = false;
        private position:LexerPosition = {line: 1, character: 1};

        constructor(input: string | string[]) {
            this.input = typeof input === "string" ? [input] : input;
        }

        // methods to consume the input
        private currentLexable(): Lexable | undefined {
            if (this.segment >= this.input.length) return undefined;
            return this.input[this.segment].charAt(this.index);
        }

        private currentPosition(): LexerPosition {
            return {line: this.position.line, character: this.position.character};
        }

        private newLine(): LexerPosition {
            this.position = {line: this.position.line + 1, character: 1};
            return this.currentPosition();
        }

        private consumeOne(): Lexable|undefined {
            this.index += 1;
            if (this.index >= this.input[this.segment].length) {
                this.index = 0;
                this.segment += 1;
            }

            if (this.currentLexable() === "\n") {
                this.position.line += 1
                this.position.character = 0;
            }
            else {
                this.position.character += 1;
            }
            return this.currentLexable();
        }

        private isEndOfSegment(): boolean {
            return this.index >= this.input[this.segment].length;
        }

        private isEndOfInput(): boolean {
            return this.segment >= this.input.length || this.index >= this.input[this.segment].length;
        }

        private findSpan(until: RegExp): Lexable {
            const start = this.index;

            while (!(this.isEndOfSegment() || this.isEndOfInput())) {
                const lexable = this.consumeOne();
                if (typeof lexable === "object" && "interpolation" in lexable) {
                    return lexable;
                }
                if (typeof lexable === "string" && lexable.match(until)) {
                    return this.input[this.segment].slice(start, this.index);
                }
            }

            return this.input[this.segment].slice(start, this.index);
        }


        private consumeWhitespace() {
            while (!this.isEndOfInput()) {
                const ch = this.currentLexable();

                if (typeof ch === "string" && ch.match(/\s/)) {
                    this.consumeOne();
                }
                else {
                    return;
                }
            }
        }

        // generate tokens
        private token(t: TokenWithoutText, start: LexerPosition): LexerToken {
            return {type:t, start: start};
        }

        private tokenWithText(t: TokenWithText, text: string, start: LexerPosition): LexerToken {
            return {type:t, text: text, start: start};
        }

        private tokenWithInterpolation(content: {interpolation: any}, start: LexerPosition): LexerToken {
            return {type: TokenType.Interpolation, start: start, interpolation: content};
        }

        // get the next token
        public next(): LexerToken {
            let pos = this.currentPosition();

            if (this.isEndOfInput()) return { type: TokenType.EOI, start: pos};

            let ch = this.currentLexable()!;

            if (isInterpolable(ch)) {
                return this.tokenWithInterpolation(ch, pos);
            }

            if (this.inTag) {
                // consume whitespace
                this.consumeWhitespace();
                ch = this.currentLexable()!;

                const intialIdx = this.index;
                // consume a closing angle and switch mode to not in a tag.
                if (ch === ">") {
                    this.inTag = false;
                    this.consumeOne();
                    return this.token(TokenType.UnAngle, pos);
                }                

                if (ch === "/") {
                    this.consumeOne();
                    return this.token(TokenType.Slash, pos);
                }     

                if (ch === "=") {
                    this.consumeOne();
                    return this.token(TokenType.Equals, pos);
                }                

                // consume both styles of quotes
                if (ch === "\"") {
                    this.consumeOne();
                    const content = this.findSpan(/["]/);
                    this.consumeOne();

                    if (isInterpolable(content)) {
                        return this.tokenWithInterpolation(content, pos);
                    }
                    return this.tokenWithText(TokenType.Atom, content, pos);
                }

                if (ch === "\'") {
                    this.consumeOne();
                    const content = this.findSpan(/[']/);
                    this.consumeOne();

                    if (isInterpolable(content)) {
                        return this.tokenWithInterpolation(content, pos);
                    }
                    return this.tokenWithText(TokenType.Quoted, content, pos);
                }
                
                // consume an atom
                let content = this.findSpan(/[>'"&\s=/]/);
                if (isInterpolable(content)) {
                    return this.tokenWithInterpolation(content, pos);
                }
                return this.tokenWithText(TokenType.Atom, content, pos);
            }
            // not inside a tag
            else {
                if (ch === "<") {
                    this.inTag = true;
                    this.consumeOne();
                    return this.token(TokenType.Angle, pos);
                }
                else if (ch === "&") {
                    this.consumeOne();

                    const content = this.findSpan(/[;]/); 
                    if (isInterpolable(content)) {
                        throw new ParserError(`Unexpected interpolation within entity token at line ${pos.line}, character ${pos.character}.`)
                    }
                    this.consumeOne();
                    return this.tokenWithText(TokenType.Entity, content, pos);
                }

                const content = this.findSpan(/[<&]/);      

                if (isInterpolable(content)) {
                    return this.tokenWithInterpolation(content, pos);
                }          
                 
                return this.tokenWithText(TokenType.Text, content, pos);
            }
        }


    }

    type Attributes = {[index:string]: string | number} 
                    | undefined
                    ;

    interface Node {
        tag: string;
        attributes: Attributes;
        children: Fragment | undefined;
    }

    type Fragment = (Node | string)[];

    export class ParserError extends Error { }

    export class Parser {        
        private root: Fragment|undefined;

        private currentToken:LexerToken;
        private lookaheadToken:LexerToken;

        constructor (private readonly lexer: Lexer) {
            this.consumeOne(); // prime lookahead
            this.consumeOne(); // prime current
        }

        public getRoot(): Fragment {
            if (this.root === undefined) {
                this.root = this.parse();
            }

            return this.root;
        }

        private consumeOne(): LexerToken {
            this.currentToken = this.lookaheadToken;
            this.lookaheadToken = this.lexer.next();            
            return this.currentToken;
        }

        private matchAndConsume(...tokenTypes: TokenType[]): LexerToken {
            const t = this.getCurrentToken();
            for (const type of tokenTypes) {
                if (t.type === type) {
                    return this.consumeOne();
                }
            }

            throw new ParserError(`Unexpected token ${TokenType[t.type]} at line ${t.start.line}, character ${t.start.character}. Expected one of ${tokenTypes.map(t => TokenType[t]).join(", ")}`);
        }

        private getCurrentToken(): LexerToken {
            return this.currentToken;
        }

        private getLookaheadToken(): LexerToken {
            return this.lookaheadToken;
        }

        private parse(): Fragment {
            const fragments: Fragment = [];

            while (this.getCurrentToken().type != TokenType.EOI) {
                const t = this.getCurrentToken();
                if (t.type === TokenType.Text) {
                    fragments.push(t.text);
                    this.consumeOne();
                }
                else if (t.type === TokenType.Entity) {
                    fragments.push(t.text); // TODO: process entity;
                    this.consumeOne();
                }
                else if (t.type === TokenType.Angle) {
                    fragments.push(this.consumeElement());                    
                }
                else {
                    throw new ParserError(`Unexpected token ${TokenType[t.type]} at line ${t.start.line}, character ${t.start.character}.`);
                }
            }

            return fragments;
        }


        private consumeElement(): Node {
            const [tagname, attributes, closed] = this.consumeOpeningTag();

            if (closed) {
                return {tag: tagname, attributes: attributes, children: undefined};
            }

            // Collect all the children.
            const children:Fragment = [];

            while (true) {
                let t = this.getCurrentToken();
                let la = this.getLookaheadToken();

                if (t.type === TokenType.EOI) {
                    throw new ParserError(`Unexpected end of input while parsing content of element '${tagname}'.`);
                }

                if (t.type === TokenType.Angle && la.type === TokenType.Slash) {
                    this.consumeClosingTag(tagname);
                    return {tag: tagname, attributes: attributes, children: children};
                }

                if (t.type === TokenType.Text) {
                    children.push(t.text);
                    this.consumeOne();
                }
                else if (t.type === TokenType.Entity) {
                    children.push(t.text); // TODO: process entity;
                    this.consumeOne();
                }
                else if (t.type === TokenType.Angle) {
                    children.push(this.consumeElement());                    
                }
                else {
                    throw new ParserError(`Unexpected token ${TokenType[t.type]} at line ${t.start.line}, character ${t.start.character}.`);
                }
            }
        }

        private consumeOpeningTag(): [string, Attributes, boolean] {
            const attributes: Attributes = {}
            let t = this.getCurrentToken();

            t = this.matchAndConsume(TokenType.Angle);
            
            if (t.type !== TokenType.Atom) {
                throw new ParserError(`Unexpected token ${TokenType[t.type]} at line ${t.start.line}, character ${t.start.character}. Expected a tagname.`);
            }
            const tagname = t.text;

            t = this.consumeOne();

            // Inside a tag we consume everything until we encounter an unangle (">") or 
            // the end of the input.        
            while (t.type !== TokenType.EOI && t.type !== TokenType.UnAngle) {
                const la = this.getLookaheadToken();
                if (t.type === TokenType.Slash) {
                    this.consumeOne();
                    this.matchAndConsume(TokenType.UnAngle);

                    return [tagname, attributes, true];
                }

                if (la.type === TokenType.Equals) {
                    if (t.type !== TokenType.Atom) {
                        throw new ParserError(`Unexpected token ${TokenType[t.type]} at line ${t.start.line}, character ${t.start.character}. Expected an attribute name.`);
                    }
                    const attrName = t.text;

                    if (attributes.hasOwnProperty(attrName)) {
                        throw new ParserError(`Duplicate attribute name '${attrName}' at line ${t.start.line}, character ${t.start.character}.`);
                    }

                    t = this.consumeOne();
                    t = this.consumeOne();
                    
                    if (t.type !== TokenType.Atom && t.type !== TokenType.Quoted) {
                        throw new ParserError(`Unexpected token ${TokenType[t.type]} at line ${t.start.line}, character ${t.start.character}. Expected an attribute value.`);
                    }
                    
                    attributes[attrName] = t.text;                     
                }
                else {
                    if (t.type !== TokenType.Atom) {
                        throw new ParserError(`Unexpected token ${TokenType[t.type]} at line ${t.start.line}, character ${t.start.character}. Expected an attribute name`);
                    }

                    if (attributes.hasOwnProperty(t.text)) {
                        throw new ParserError(`Duplicate attribute name '${t.text}' at line ${t.start.line}, character ${t.start.character}.`);
                    }

                    attributes[t.text] = t.text;                     
                }
                
                t = this.consumeOne();
            }

            this.matchAndConsume(TokenType.UnAngle);

            return [tagname, attributes, false];
        }

        private consumeClosingTag(expectedTagname: string): void {
            // This method simply consumes a tag and ensures it matches
            // the expected closing tag.
            this.matchAndConsume(TokenType.Angle);
            const t = this.matchAndConsume(TokenType.Slash);

            if (t.type !== TokenType.Atom) {
                throw new ParserError(`Unexpected token ${TokenType[t.type]} at line ${t.start.line}, character ${t.start.character}. Expected a tagname.`);
            }

            const tagname = t.text;
            if (tagname.toLowerCase() !== expectedTagname.toLowerCase()) {
                throw new ParserError(`Unexpected closing tag ${tagname} at line ${t.start.line}, character ${t.start.character}. Expected ${expectedTagname}.`);
            }

            this.consumeOne();

            this.matchAndConsume(TokenType.UnAngle);
        }
    }
}