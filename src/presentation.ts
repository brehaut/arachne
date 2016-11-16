import { Note, isWhite, WhiteNote } from './notes';
import { Scale } from './scales';

// DisplayNotes are all the possible human readible versions of the above notes.     
// Converting between Note and DisplayNote requires knowing which direction a given
// key choses for naming  
export type DisplayNote = "Ab" | "A" | "A#" | "Bb" | "B" | "C" | "C#" | "Db" | "D" | "D#" | "Eb" | "E" | "F" | "F#" | "Gb" | "G" | "G#";
export type SpelledScale = DisplayNote[];

// The Shift is used to determine if a scale is described in terms of flats or sharps 
export enum Shift { Flat, Sharp };

const toneNames:{[index:string]: [DisplayNote, DisplayNote]} = {
    "AB": ["A#", "Bb"],
    "CD": ["C#", "Db"],
    "DE": ["D#", "Eb"],
    "FG": ["F#", "Gb"],
    "GA": ["G#", "Ab"]
};  

// Convert an internal representation of a note into a display note.
export function noteToDisplay(note:Note, direction: Shift): DisplayNote {
    if (toneNames.hasOwnProperty(note)) {
        const [sharp, flat] = toneNames[note]; 
        return (direction === Shift.Sharp) ? sharp : flat;
    }
    return note as DisplayNote;
}

// Converts '#' and 'b' into sharp and flat unicode characters
export function presentDisplayNote(note: DisplayNote): string {
    if (note.length === 1) {
        return note;
    }
    else if (note.length === 2) {
        return `${note[0]}${note[1] === "#" ? "♯" : "♭" }`;
    }
    throw new Error(`${note} has a surprising number of characters (not 1 or 2)`);
}


// When a black note is reference outside of a given scale it has a default
// shift. For example FG is F# while DE is Eb. This function provides that
// mapping.  
//
// This is useful for determinig the name of a scale and first choice for 
// the shifts used within that scale.
export function abstractShift(note: Note): Shift {
    switch (note) {
        case 'AB': return Shift.Flat;
        case 'CD': return Shift.Sharp;
        case 'DE': return Shift.Flat;
        case 'FG': return Shift.Sharp;
        case 'GA': return Shift.Sharp;
    }

    throw new Error(`${note} is not a black note`);
}

type BaseNoteName = WhiteNote;

function baseNoteName(note: Note, shift: Shift):BaseNoteName {
    if (isWhite(note)) {
        return note;
    }
    return note[shift === Shift.Flat ? 1 : 0] as BaseNoteName;
} 


export function getScaleShift(scale: Scale): Shift {
    var seenBases = new Set<BaseNoteName>(scale.map(n => baseNoteName(n, Shift.Flat)));
    return seenBases.size === new Set(scale).size ? Shift.Flat : Shift.Sharp;
}


export function spellScale(scale: Scale): SpelledScale {
    // Naive implementaion of spellScale.
    //
    // A better algorithm would produce all the spellings for a given scale and from there
    // figure out the cost of each spelling and return the lowest cost ones.
    const shift = getScaleShift(scale);
    const spelledScale = scale.map(n => noteToDisplay(n, shift));

    return spelledScale;
}