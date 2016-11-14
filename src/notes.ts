import { rotate } from './array';

// Notes are the unique names of each note within a twelve tone scale, 
// without having to take into account whether we want to refer to them as
// flats or sharps.
export type Note = "GA" | "A" | "AB" | "B" | "C" | "CD" | "D" | "DE" | "E" | "F" | "FG" | "G";
export type Scale = Note[];
// The Shift is used to determine if a scale is described in terms of flats or sharps 
export enum Shift { Flat, Sharp };


const twelveTones:Note[] = ["A", "AB", "B", "C", "CD", "D", "DE", "E", "F", "FG", "G", "GA"];

enum Interval {
    Semitone = 1, 
    Tone = 2,
}

export type ScaleSeries = Interval[]; 

export namespace scaleSeries {
    export const major:ScaleSeries = [Interval.Tone, Interval.Tone, Interval.Semitone, Interval.Tone, Interval.Tone, Interval.Tone, Interval.Semitone];

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
    const offset = twelveTones.indexOf(root);
    return rotate(twelveTones, offset);
}


export function scale(root: Note, series: ScaleSeries) {
    const notes = chromatic(root);
    const scale:Scale = [];

    let idx = 0;
    for (let i = 0, len = series.length; i < len; i++) {
        idx += series[i];
        scale.push(notes[idx]);
    }

    return scale;
}
