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

    type LexerTokenWithoutText = {type: TokenWithoutText, start: LexerPosition};
    type LexerTokenWithText = {type: TokenWithText, start: LexerPosition, text: string};
    type LexerTokenWithInterpolation = {type: TokenType.Interpolation, start:LexerPosition, interpolation: any};

    type LexerToken = LexerTokenWithoutText
                    | LexerTokenWithText
                    | LexerTokenWithInterpolation
                    ;

    type Lexable = string 
                 | {interpolation: any}
                 ;

    function isInterpolable(l:Lexable): l is {interpolation: any} {
        return (typeof l === "object" && "interpolation" in l);
    }

    function* stringStream(string: string): IterableIterator<string> {
        for (const ch of string) {
            yield ch;
        }
    }

    function* pairwise<TA, TB>(as:TA[], bs:TB[]): IterableIterator<[TA | undefined, TB | undefined]> {
        for (let i = 0, j = Math.max(as.length, bs.length); i < j; i++) {
            yield [as[i], bs[i]];
        }
    }

    function* stringSegmentsStream(strings: string[], interpolations: any[]): IterableIterator<Lexable> {
        for (const [s, i] of pairwise(strings, interpolations)) {
            if (s) yield* stringStream(s);
            if (i) yield {interpolation: i};
        }
    }


    export class Lexer {
        private readonly input: IterableIterator<Lexable>

        private current: IteratorResult<Lexable>;
        private inTag = false;
        private position:LexerPosition = {line: 1, character: 1};

        constructor(input: string | string[], iterpolations: any[] | undefined = undefined) {
            this.input = typeof input === "string" ? stringStream(input) : stringSegmentsStream(input, iterpolations || []);
            this.consumeOne();
        }

        // methods to consume the input
        private currentLexable(): Lexable | undefined {
            return this.current.value;
        }

        private currentPosition(): LexerPosition {
            return {line: this.position.line, character: this.position.character};
        }

        private consumeOne(): Lexable|undefined {
            this.current = this.input.next();

            if (this.currentLexable() === "\n") {
                this.position.line += 1
                this.position.character = 0;
            }
            else {
                this.position.character += 1;
            }

            return this.currentLexable();
        }

        private isEndOfInput(): boolean {
            return this.current.done;
        }

        private findSpan(until: RegExp): string {
            const span:string[] = [];

            const slice = () => {
                return span.join("");
            }

            let lexable = this.currentLexable();
            while (!this.isEndOfInput()) {                                
                 // an iterpolatable is always the end of a span
                if (typeof lexable !== "string") {
                    return slice();
                }

                if (lexable.match(until)) {
                    return slice();
                }

                span.push(lexable);
                lexable = this.consumeOne();
            }

            return slice();
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
            return {type: TokenType.Interpolation, start: start, interpolation: content.interpolation};
        }

        // get the next token
        public next(): LexerToken {
            if (this.isEndOfInput()) return { type: TokenType.EOI, start: this.currentPosition()};

            let ch = this.currentLexable()!;

            if (isInterpolable(ch)) {
                this.consumeOne();
                return this.tokenWithInterpolation(ch, this.currentPosition());
            }

            if (this.inTag) {
                return this.consumeInTag();
            }
            else {
                return this.consumeOutsideTag();
            }
        }

        private consumeInTag(): LexerToken {
            let pos = this.currentPosition();

            // consume whitespace
            this.consumeWhitespace();
            const ch = this.currentLexable()!;

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

                return this.tokenWithText(TokenType.Quoted, content, pos);
            }
            
            // consume an interpolatable
            if (isInterpolable(ch)) {
                this.consumeOne();
                return this.tokenWithInterpolation(ch, pos);
            }

            // consume an atom
            let content = this.findSpan(/[>'"&\s=/]/);
            return this.tokenWithText(TokenType.Atom, content, pos);
        }

        private consumeOutsideTag(): LexerToken {
            const pos = this.currentPosition();
            const ch = this.currentLexable()!;

            if (ch === "<") {
                this.inTag = true;
                this.consumeOne();
                return this.token(TokenType.Angle, pos);
            }
            else if (ch === "&") {
                this.consumeOne();
                const content = this.findSpan(/[;]/); 
                this.consumeOne();
                
                return this.tokenWithText(TokenType.Entity, content, pos);
            }
            else if (isInterpolable(ch)) {
                this.consumeOne();
                return this.tokenWithInterpolation(ch, pos);
            }

            const content = this.findSpan(/[<&]/);      
                        
            return this.tokenWithText(TokenType.Text, content, pos);
        }
    }

    export function debugLexer(l: Lexer) {
        let t: LexerToken | undefined;
        t = l.next();
        let limit = 2000;
        while (limit-- > 0 && t && t.type != TokenType.EOI) {
            console.log(TokenType[t.type], !!t ? `"${(t as any).text}"` : "", `${JSON.stringify((t as any).interpolation)}`);
            t = l.next();
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

        private getTextOrFlatten(t: LexerTokenWithText | LexerTokenWithInterpolation): string {
            if (t.type === TokenType.Interpolation) {
                return typeof t.interpolation === "function" || t.interpolation instanceof Function ? t.interpolation() : t.interpolation.toString()
            }  
            return t.text.toString();
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

                if (t.type === TokenType.Text || t.type === TokenType.Interpolation) {
                    children.push(this.getTextOrFlatten(t));
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
                    if (t.type !== TokenType.Atom && t.type !== TokenType.Interpolation) {
                        throw new ParserError(`Unexpected token ${TokenType[t.type]} at line ${t.start.line}, character ${t.start.character}. Expected an attribute name.`);
                    }
                    const attrName = this.getTextOrFlatten(t);

                    if (attributes.hasOwnProperty(attrName)) {
                        throw new ParserError(`Duplicate attribute name '${attrName}' at line ${t.start.line}, character ${t.start.character}.`);
                    }

                    t = this.consumeOne();
                    t = this.consumeOne();
                    
                    if (t.type !== TokenType.Atom && t.type !== TokenType.Quoted && t.type !== TokenType.Interpolation) {
                        throw new ParserError(`Unexpected token ${TokenType[t.type]} at line ${t.start.line}, character ${t.start.character}. Expected an attribute value.`);
                    }
                    
                    attributes[attrName] = this.getTextOrFlatten(t);                     
                }
                else {
                    if (t.type !== TokenType.Atom && t.type !== TokenType.Interpolation) {
                        throw new ParserError(`Unexpected token ${TokenType[t.type]} at line ${t.start.line}, character ${t.start.character}. Expected an attribute name`);
                    }

                    const attrName = this.getTextOrFlatten(t);

                    if (attributes.hasOwnProperty(attrName)) {
                        throw new ParserError(`Duplicate attribute name '${attrName}' at line ${t.start.line}, character ${t.start.character}.`);
                    }

                    attributes[attrName] = attrName;                     
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


    export function template(text: string[], ...interpolations: any[]): Fragment {
        return new Parser(new Lexer(text, interpolations)).getRoot();
    }
}