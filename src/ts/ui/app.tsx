import * as React from "react";
import * as ReactDOM from "react-dom";


class Stave extends React.Component<{}, void> {
    public render() {
        const drawingHeight = 300;
        const drawingWidth = 1000;

        const lineYPosition = (n) => (n * ((drawingHeight * 0.9) / 5)) + (drawingHeight * 0.05);
            
        return <svg viewBox={`0 0 ${drawingWidth} ${drawingHeight}`} version="1.1" ref="drawing">
            { [1,2,3,4,5].map(n => 
                <line x1="10" y1={lineYPosition(n)} x2="990" y2={lineYPosition(n)} stroke="black" strokeWidth="1" />
            )}
            <line x1="10" y1={lineYPosition(1)} x2="10" y2={lineYPosition(5)} stroke="black" strokeWidth="1" />
        </svg>;
    }
}


class Application extends React.Component<{}, void> {
    public render() {
        return <div className="comp main-frame">
            <div className="question">
                <Stave />
            </div>

            <div className="choices">
                choices
            </div>

            <div className="action">
                confirm
            </div>
        </div>;
    }
}

export function install(root: Element): void {
    ReactDOM.render(<Application />, root);
}