import { Note } from "./notes";
import { Scale, ScaleSeries } from "./scales"; 
import { cycleGet } from "./array";

export type Degree = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type Chord = {
    root: Note,
    tones: Note[]
}

function newChord(tones: Note[]):Chord {
    return {
        root: tones[0],
        tones: tones
    }
}

export function triad(scale: Scale, degree: Degree): Chord {
    return chord(scale, degree, [1,3,5]);   
}

export function chord(scale: Scale, degree: Degree, intervals: Degree[]): Chord {
    const rootIndex = degree - 1;
    const intervalsOffsets = intervals.map(d => d - 1);
    return newChord(intervalsOffsets.map(degreeOffset => cycleGet(scale, rootIndex + degreeOffset)));
}