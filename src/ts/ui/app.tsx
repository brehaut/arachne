import * as React from "react";
import * as ReactDOM from "react-dom";

class Application extends React.Component<{}, void> {
    public render() {
        return <h1>Hello, world</h1>;
    }
}

export function install(root: Element): void {
    ReactDOM.render(<Application />, root);
}