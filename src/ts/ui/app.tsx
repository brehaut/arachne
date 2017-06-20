import * as React from "react";
import * as ReactDOM from "react-dom";


class Clef extends React.Component<{x: number, y: number, height: number}, void> {
    private scale = 0.02222; // calculated by hand

    public render() {
        return <g transform={`translate(${this.props.x}, ${this.props.y}), scale(${this.props.height * this.scale}, ${this.props.height * this.scale})`}>
                    <g transform="translate(-29.503316,-285.3248)">
                        <g transform="matrix(2.1692658,0,0,2.1692658,-0.49889493,-345.48536)">
                            <g fill="#000000" fill-opacity="1" stroke="none"
                                transform="scale(0.9703071,1.0306015)"
                                aria-label="𝄞 ">
                                <path stroke-width="0.57544422"
                                      d="m 12.958008,271.05728 0.640631,3.18068 q 0.101152,-0.0112 0.202304,-0.0112 0.101153,0 0.191066,0 0.876653,0 1.618437,0.34841 0.741783,0.33718 1.281262,0.91037 0.539479,0.56196 0.831697,1.30374 0.303457,0.73055 0.303457,1.51729 0,0.64063 -0.202305,1.2363 -0.191065,0.58444 -0.573196,1.07896 -0.370892,0.48329 -0.910371,0.85418 -0.539479,0.35965 -1.225067,0.53948 l 0.382131,1.98933 q 0.02248,0.15734 0.03372,0.29221 0.02248,0.14611 0.02248,0.30346 0,0.58444 -0.213544,1.10144 -0.202304,0.517 -0.573196,0.91037 -0.359653,0.39337 -0.842936,0.61815 -0.483283,0.23602 -1.034001,0.23602 -0.505762,0 -0.989045,-0.15735 -0.483283,-0.14611 -0.865414,-0.42708 -0.370892,-0.26974 -0.606914,-0.67435 -0.224783,-0.40461 -0.224783,-0.91037 0,-0.48329 0.26974,-0.86542 0.280978,-0.37089 0.91037,-0.4608 0.0562,-0.0112 0.112392,-0.0225 0.06743,0 0.12363,0 0.314696,0 0.573197,0.12363 0.2585,0.13487 0.438326,0.34841 0.191066,0.21355 0.280979,0.47205 0.101152,0.26974 0.101152,0.55072 0,0.37089 -0.191065,0.7193 -0.191066,0.34841 -0.606914,0.53948 0.157348,0.0562 0.303457,0.0674 0.146109,0.0225 0.303457,0.0225 0.427087,0 0.764262,-0.17982 0.348413,-0.16859 0.584435,-0.46081 0.236022,-0.29222 0.359653,-0.69683 0.13487,-0.39337 0.13487,-0.85417 0,-0.13487 -0.03372,-0.37089 -0.02248,-0.23602 -0.04496,-0.37089 l -0.325936,-1.68588 q -0.303456,0.0787 -0.797979,0.0787 -1.112675,0 -2.202872,-0.23602 -1.078958,-0.23603 -1.9556115,-0.80922 -0.8654142,-0.5732 -1.4386106,-1.51729 -0.5731963,-0.95532 -0.6518704,-2.3827 -0.011239,-0.11239 -0.011239,-0.22478 0,-0.11239 0,-0.22478 0,-1.05648 0.2922178,-2.068 0.2922177,-1.02277 0.932849,-1.89942 0.7417836,-0.96657 1.6071977,-1.65215 0.865414,-0.68559 1.921894,-1.24755 -0.168587,-0.85417 -0.292218,-1.47233 -0.112392,-0.61815 -0.191066,-1.04524 -0.07867,-0.43832 -0.12363,-0.7193 -0.04496,-0.28098 -0.07867,-0.46081 -0.02248,-0.17982 -0.03372,-0.29222 0,-0.11239 0,-0.21354 0,-0.42709 0.123631,-0.80922 0.123631,-0.39337 0.359653,-0.68559 0.236022,-0.30345 0.573196,-0.48328 0.348414,-0.17982 0.78674,-0.17982 0.539479,0 0.955328,0.2585 0.415848,0.24726 0.685587,0.64063 0.280979,0.39337 0.415849,0.87665 0.146109,0.48328 0.146109,0.94409 0,0.66311 -0.213544,1.31498 -0.202305,0.65187 -0.539479,1.25878 -0.325935,0.60692 -0.741784,1.15763 -0.415848,0.53948 -0.831696,0.97781 z m 0.303457,-5.69825 q -0.359653,0 -0.573197,0.15735 -0.202304,0.14611 -0.314696,0.34842 -0.101152,0.2023 -0.13487,0.41584 -0.02248,0.20231 -0.02248,0.3147 0,0.82046 0.157348,1.53976 0.157348,0.71931 0.280979,1.4049 0.427087,-0.24727 0.741783,-0.5732 0.325935,-0.33718 0.539479,-0.70807 0.213544,-0.37089 0.314696,-0.75302 0.112392,-0.38213 0.112392,-0.71931 0,-0.24726 -0.0562,-0.50576 -0.04496,-0.2585 -0.168587,-0.4608 -0.123631,-0.20231 -0.337175,-0.32594 -0.213543,-0.13487 -0.539478,-0.13487 z m 0.854175,16.07198 -0.966567,-5.14753 q -0.427087,0.10115 -0.753023,0.34842 -0.314696,0.23602 -0.528239,0.57319 -0.213544,0.32594 -0.325936,0.71931 -0.101152,0.38213 -0.101152,0.7755 0,0.14611 0.01124,0.29222 0.02248,0.14611 0.04496,0.28098 -0.52824,-0.24727 -0.79798,-0.69683 -0.269739,-0.44957 -0.269739,-1.00029 0,-0.55071 0.191065,-1.04524 0.191066,-0.49452 0.517001,-0.89913 0.337174,-0.40461 0.764262,-0.70806 0.438327,-0.30346 0.92161,-0.48329 -0.123631,-0.65187 -0.236022,-1.21382 l -0.292218,-1.49481 q -0.78674,0.74178 -1.562241,1.48357 -0.7755011,0.73054 -1.4948064,1.57348 -0.236022,0.28097 -0.4608049,0.58443 -0.2247829,0.30346 -0.3933701,0.64063 -0.1685872,0.32594 -0.2697395,0.68559 -0.1011523,0.34841 -0.1011523,0.73055 0.011239,0.78674 0.2472612,1.39365 0.2472612,0.59567 0.6518704,1.05648 0.4046092,0.44956 0.9328491,0.76426 0.5394785,0.30346 1.1239145,0.49452 0.584435,0.19107 1.18011,0.28098 0.606914,0.0787 1.146393,0.0787 0.415848,0 0.820458,-0.0674 z m -0.157348,-5.2262 0.989044,5.00142 q 0.505762,-0.13487 0.887893,-0.41585 0.382131,-0.29222 0.629392,-0.66311 0.2585,-0.37089 0.382131,-0.78674 0.12363,-0.42709 0.12363,-0.84294 0,-0.65187 -0.269739,-1.09019 -0.2585,-0.43833 -0.685588,-0.70807 -0.427087,-0.26974 -0.966566,-0.38213 -0.539479,-0.11239 -1.090197,-0.11239 z" />
                            </g>
                        </g>
                    </g>
                </g>
    }
}


class Stave extends React.Component<{}, void> {
    public render() {
        const drawingHeight = 300;
        const drawingWidth = 1000;
        const padding = 50

        const lineYPosition = (n:number) => ((n - 0.5) * ((drawingHeight - (2 * padding)) / 5)) + padding;
            
        return <svg viewBox={`0 0 ${drawingWidth} ${drawingHeight}`} version="1.1" ref="drawing">
            { [1,2,3,4,5].map(n => 
                <line x1="10" y1={lineYPosition(n)} x2="990" y2={lineYPosition(n)} stroke="black" strokeWidth="1" />
            )}
            <line x1="10" y1={lineYPosition(1)} x2="10" y2={lineYPosition(5)} stroke="black" strokeWidth="1" />
            <Clef x={120} y={lineYPosition(5)} height={drawingHeight - (2 * padding)} />
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