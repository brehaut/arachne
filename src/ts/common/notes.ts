import { rotate, cycleGet } from './array';

// Notes are the unique names of each note within a twelve tone scale, 
// without having to take into account whether we want to refer to them as
// flats or sharps.
export type Note = "GA" | "A" | "AB" | "B" | "C" | "CD" | "D" | "DE" | "E" | "F" | "FG" | "G";
export type WhiteNote =  "A" | "B" | "C" | "D" | "E" | "F" | "G";
export type BlackNote = "GA" | "AB" | "CD" | "DE" | "FG";


// A black note is any note that would be represented by a black key on a piano
export function isBlack(n: Note): n is BlackNote {
    switch(n) {
        case "GA": return true;
        case "AB": return true;
        case "CD": return true;
        case "DE": return true;
        case "FG": return true;
        default: return false;
    }
}

// A black note is any note that would be represented by a white key on a piano
export function isWhite(n: Note): n is WhiteNote {
    return !isBlack(n);
}


export const twelveTones:Note[] = ["A", "AB", "B", "C", "CD", "D", "DE", "E", "F", "FG", "G", "GA"];

export const toneIndex:{[index:string]: number} = {}
twelveTones.forEach((tone, idx) => toneIndex[tone] = idx);



export function relativeNote(note: Note, offset: number):Note {
    const baseIndex = toneIndex[note];

    return cycleGet(twelveTones, baseIndex + offset);
}