import { Note, Shift } from './notes';


namespace presentation {
    // DisplayNotes are all the possible human readible versions of the above notes.     
    // Converting between Note and DisplayNote requires knowing which direction a given
    // key choses for naming  
    export type DisplayNote = "Ab" | "A" | "A#" | "Bb" | "B" | "C" | "C#" | "Db" | "D" | "D#" | "Eb" | "E" | "F" | "F#" | "Gb" | "G" | "G#";

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


    export function presentDisplayNote(note: DisplayNote): string {
        if (note.length === 1) {
            return note;
        }
        else if (note.length === 2) {
            return `${note[0]}${note[1] === "#" ? "♯" : "♭" }`;
        }
        throw new Error(`${note} has a surprising number of characters (not 1 or 2)`);
    }
}