import { rotate, cycleGet } from './array';
import { twelveTones, toneIndex, Note } from './notes';

export type Scale = Note[];

export enum PrimativeInterval {
    Semitone = 1, 
    Tone = 2,
}

export type ScaleSeries = PrimativeInterval[]; 

export namespace scaleSeries {
    export const major:ScaleSeries = [PrimativeInterval.Tone, PrimativeInterval.Tone, PrimativeInterval.Semitone, PrimativeInterval.Tone, PrimativeInterval.Tone, PrimativeInterval.Tone, PrimativeInterval.Semitone];

    export const ionian:ScaleSeries = major;
    export const dorian:ScaleSeries = rotate(major, 1);
    export const phrygian:ScaleSeries = rotate(major, 2);
    export const lydian:ScaleSeries = rotate(major, 3);
    export const mixolydian:ScaleSeries = rotate(major, 4);
    export const aeolian:ScaleSeries = rotate(major, 5);
    export const locrian:ScaleSeries = rotate(major, 6);

    export const modes:ScaleSeries[] = [
        locrian,
        ionian,
        dorian,
        phrygian,
        lydian,
        mixolydian,
        aeolian,
        locrian
    ];

    export const naturalMinor:ScaleSeries = aeolian;
}


export function chromatic(root: Note):Scale {
    const offset = toneIndex[root];
    return rotate(twelveTones, offset);
}


export function scale(root: Note, series: ScaleSeries):Scale {
    const notes = chromatic(root);
    const scale:Scale = [];

    let idx = 0;
    for (let i = 0, len = series.length; i < len; i++) {
        scale.push(cycleGet(notes, idx));
        idx += series[i];
    }

    return scale;
}

