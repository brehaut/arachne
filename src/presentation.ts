import { Note, isWhite, WhiteNote, relativeNote } from './notes';
import { Scale } from './scales';
import { distribution } from './array'; 


// DisplayNotes are all the possible human readible versions of the above notes.     
// Converting between Note and DisplayNote requires knowing which direction a given
// key choses for naming  
export type DisplayNote = "Ab" | "A" | "A#" | "Bb" | "B" | "B#" | "Cb" | "C" | "C#" | "Db" | "D" | "D#" | "Eb" | "E" | "E#" | "Fb" | "F" | "F#" | "Gb" | "G" | "G#";
export type SpelledScale = DisplayNote[];

// The Shift is used to determine if a scale is described in terms of flats or sharps 
export enum Shift { Flat = -1, Sharp = 1};

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




function noteSpellings(note: Note, shift: Shift): DisplayNote[] {
    if (isWhite(note)) {
        const adjacent = relativeNote(note, -1 * shift);
        if (isWhite(adjacent)) {
            return [note, (adjacent + (shift === Shift.Flat ? "b" : "#")) as DisplayNote];
        }
        else {
            return [note];
        }
    }
    else { 
        return [noteToDisplay(note, shift)];
    }    
}


function combine<T>(arr:T[][]): T[][] {
    let res = [[]] as T[][];

    for (let i = 0; i < arr.length; i++) {
        const choices = arr[i];
        const lastRes = res;

        res = [];
        lastRes.forEach(acc => {
            choices.forEach(choice => {
                const l = acc.slice();
                l.push(choice);
                res.push(l);
            });
        });
    }

    return res;
}


function priceScaleSpelling(scale: SpelledScale): number {
    let sum = 0;
    for (var i = 0; i < scale.length; i++) {
        const note = scale[0];
        if (note.length === 1) continue;

        const letter = note[0];
        const shift = note[1];

        if ((shift === "#" && (letter === "B" || letter === "E"))
         || (shift === "b" && (letter === "C" || letter === "F"))) {
            sum += 2;
        }
        else {
            sum += 1;
        }        
    } 

    return sum;
}





export function spellScale(scale: Scale): SpelledScale[] {
    const shifts = [Shift.Flat, Shift.Sharp];

    const spellingsByShift = shifts.map(shift => scale.map(note => noteSpellings(note, shift))).map(combine);
    const spellings = Array.prototype.concat.apply([], spellingsByShift); // flatten
    

    let cheapest = [[]];
    let minCost = Number.MAX_SAFE_INTEGER;

    spellings
        .filter(scale => {
            const dist = distribution(scale, n => n[0]);
            return Array.from(dist.values()).reduce((acc, v) => acc && v === 1, true);
        })
        .forEach(spelling => {
        const cost = priceScaleSpelling(spelling);
        if (cost < minCost) {
            minCost = cost;
            cheapest = [spelling];
        }
        else if (cost === minCost) {
            cheapest.push(spelling);
        }
    })

    return cheapest as SpelledScale[];
}