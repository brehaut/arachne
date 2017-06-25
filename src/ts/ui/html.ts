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

    type LexerToken = {type: TokenWithoutText, start: number}
                    | {type: TokenWithText, start: number, text: string}
                    | {type: TokenType.Interpolation, start:number, interpolation: any}
                    ;

    type Lexable = string 
                 | {interpolation: any}
                 ;

    interface LexerPosition {
        line: number;
        character: number;
    }

    export class Lexer {
        private index = 0;
        private inTag = false;
        private position:LexerPosition = {line: 1, character: 1};

        constructor(private input: string) {

        }

        // methods to consume the input
        private currentLexable(): Lexable {
            return this.input.charAt(this.index);
        }

        private currentPosition(): LexerPosition {
            return {line: this.position.line, character: this.position.character};
        }

        private newLine(): LexerPosition {
            this.position = {line: this.position.line + 1, character: 1};
            return this.currentPosition();
        }

        private consumeOne(): Lexable {
            this.index += 1;
            this.position.character += 1;
            return this.currentLexable();
        }

        private isEndOfInput(): boolean {
            return this.index >= this.input.length;
        }

        private findSpan(idx: number, until: RegExp) {
            let extent = 1;
            while (idx + extent < this.input.length) {
                if (this.input[idx + extent].match(until)) return extent;
                extent += 1;
            }

            return extent;
        }

        // this implementation will replace findSpan so that the internal tracking of character 
        // position is abstracted away from lexing rules
        private findSpan2(until: RegExp): [Lexable, LexerPosition] {
            const start = this.index;
            const pos = this.currentPosition();

            while (!this.isEndOfInput()) {
                const lexable = this.consumeOne();
                if (typeof lexable === "object" && "interpolation" in lexable) {
                    return [lexable, pos];
                }
                if (typeof lexable === "string" && lexable.match(until)) {
                    return [this.input.slice(start, this.index), pos];
                }
            }

            return [this.input.slice(start, this.index), pos];
        }


        private consumeWhitespace() {
            const ch = this.currentLexable();
            if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
                if (ch === "\n") {
                    this.newLine();
                }
                this.findSpan2(/\S/); // bug here: it will not advance the line numbers correctly if new lines are inthe midst of whitespace
            }
        }

        // generate tokens
        private token(t: TokenWithoutText, start: number, extent: number): LexerToken {
            return {type:t, start: start};
        }

        private tokenWithText(t: TokenWithText, start: number, extent: number): LexerToken {
            return {type:t, text: this.input.slice(start, start + extent), start: start};
        }

        private token2(t: TokenWithoutText, start: LexerPosition): LexerToken {
            return {type:t, start: start.character};
        }

        private tokenWithText2(t: TokenWithText, text: string, start: LexerPosition): LexerToken {
            return {type:t, text: text, start: start.character};
        }

        // get the next token
        public next(): LexerToken {
            let idx = this.index;
            if (this.isEndOfInput()) return { type: TokenType.EOI, start: this.index};

            let ch = this.currentLexable();

            if (typeof ch === "object" && "interpolation" in ch) {
                return {type: TokenType.Interpolation, start: idx, interpolation: ch.interpolation};
            }

            if (this.inTag) {
                // consume whitespace
                this.consumeWhitespace();
                ch = this.currentLexable();

                const intialIdx = this.index;
                // consume a closing angle and switch mode to not in a tag.
                if (ch === ">") {
                    this.inTag = false;
                    this.index += 1
                    return this.token(TokenType.UnAngle, intialIdx, 1);
                }                

                if (ch === "/") {
                    this.index += 1
                    return this.token(TokenType.Slash, intialIdx, 1);
                }     

                if (ch === "=") {
                    this.index += 1
                    return this.token(TokenType.Equals, intialIdx, 1);
                }                

                // consume both styles of quotes
                if (ch === "\"") {
                    this.index += 1;
                    const extent = this.findSpan(this.index, /["]/);
                    this.index += extent;
                    return this.tokenWithText(TokenType.Atom, intialIdx, extent + 1);
                }

                if (ch === "\'") {
                    this.index += 1;
                    const extent = this.findSpan(intialIdx, /[']/);
                    this.index += extent;
                    return this.tokenWithText(TokenType.Quoted, intialIdx, extent + 1);
                }
                
                // consume an atom
                let extent = this.findSpan(intialIdx, /[>'"&\s=/]/);
                this.index += extent;
                return this.tokenWithText(TokenType.Atom, intialIdx, extent);
            }
            else {
                const intialIdx = this.index;

                if (ch === "<") {
                    this.inTag = true;
                    this.index += 1;
                    return this.token(TokenType.Angle, intialIdx, 1);
                }
                else if (ch === "&") {
                    this.index += 1;

                    let extent = this.findSpan(this.index, /[;]/); 
                    this.index += extent;
                    return this.tokenWithText(TokenType.Entity, intialIdx, extent);
                }

                let extent = this.findSpan(this.index, /[<&]/);                
                this.index += extent;
                 
                return this.tokenWithText(TokenType.Text, intialIdx, extent);
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

            throw new ParserError(`Unexpected token ${TokenType[t.type]} at position ${t.start}. Expected one of ${tokenTypes.map(t => TokenType[t]).join(", ")}`);
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
                    throw new ParserError(`Unexpected token ${TokenType[t.type]} at position ${t.start}.`);
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
                    throw new ParserError(`Unexpected token ${TokenType[t.type]} at position ${t.start}.`);
                }
            }
        }

        private consumeOpeningTag(): [string, Attributes, boolean] {
            const attributes: Attributes = {}
            let t = this.getCurrentToken();

            t = this.matchAndConsume(TokenType.Angle);
            
            if (t.type !== TokenType.Atom) {
                throw new ParserError(`Unexpected token ${TokenType[t.type]} at position ${t.start}. Expected a tagname.`);
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
                        throw new ParserError(`Unexpected token ${TokenType[t.type]} at position ${t.start}. Expected an attribute name.`);
                    }
                    const attrName = t.text;

                    if (attributes.hasOwnProperty(attrName)) {
                        throw new ParserError(`Duplicate attribute name '${attrName}' at position ${t.start}.`);
                    }

                    t = this.consumeOne();
                    t = this.consumeOne();
                    
                    if (t.type !== TokenType.Atom && t.type !== TokenType.Quoted) {
                        throw new ParserError(`Unexpected token ${TokenType[t.type]} at position ${t.start}. Expected an attribute value.`);
                    }
                    
                    attributes[attrName] = t.text;                     
                }
                else {
                    if (t.type !== TokenType.Atom) {
                        throw new ParserError(`Unexpected token ${TokenType[t.type]} at position ${t.start}. Expected an attribute name`);
                    }

                    if (attributes.hasOwnProperty(t.text)) {
                        throw new ParserError(`Duplicate attribute name '${t.text}' at position ${t.start}.`);
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
                throw new ParserError(`Unexpected token ${TokenType[t.type]} at position ${t.start}. Expected a tagname.`);
            }

            const tagname = t.text;
            if (tagname.toLowerCase() !== expectedTagname.toLowerCase()) {
                throw new ParserError(`Unexpected closing tag ${tagname} at ${t.start}. Expected ${expectedTagname}.`);
            }

            this.consumeOne();

            this.matchAndConsume(TokenType.UnAngle);
        }
    }
}