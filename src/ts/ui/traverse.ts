import html_wrapped = require("./html");    


module arachne.ui.traverse {
    import html = html_wrapped.arachne.ui.html;

    interface SelectorMatch {
        matches: true;
        next: Selector | undefined;
    }

    interface SelectorMismatch {
        matches: false;
    }
    
    type SelectorResult = SelectorMatch | SelectorMismatch;

    type Selector = (node: html.Node) => SelectorResult; 
    type Transformer = (node: html.Node) => html.Node;

    export function traverse(selector: Selector, transform: Transformer, node:html.Node): html.Node {
        const match = selector(node);

        if (match.matches) {
            if (match.next !== undefined && node.children) {
                const newChildren = node.children.map(child => {
                    if (typeof child === "string") {
                        return child;
                    }
                    return traverse(match.next!, transform, child)
                }); 

                return {
                    tag: node.tag,
                    attributes: node.attributes,
                    children: newChildren
                };
            } 
            return transform(node);
        }

        return node;
    }

    export function traverseFragment(selector: Selector, transform: Transformer, fragment: html.Fragment): html.Fragment {
        if (typeof fragment === "string") return fragment;

        return fragment.map(n => (typeof n === "string") ? n : traverse(selector, transform, n));
    }


    export module selectors {
        function predicated(p: (n: html.Node) => boolean, next: Selector | undefined): Selector {
            return (n) => p(n) ? { matches: true, next: next } : { matches: false };
        }

        export function tag(tagName: string, next: Selector | undefined): Selector {
            return predicated((n) => n.tag === tagName, next);
        }

        export function cls(className: string, next: Selector | undefined): Selector {
            return predicated((n) => (n.attributes != undefined && n.attributes["class"] === className), next)
        }

        export function child(s1: Selector, s2: Selector): Selector {
            return (n: html.Node) => {
                const match = s1(n);
                if (match.matches) {
                    return {
                        matches: true,
                        next: (match.next) ? child(match.next, s2) : s2
                    };
                }
                return match;
            };
        } 
    }
}
