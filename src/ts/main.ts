import * as notes from './common/notes';
import * as scales from './common/scales';
import * as presentation from './common/presentation';
import * as chord from './common/chord';

function pad(s:string) {
    return s.length === 1 ? s + " " : s;
}

notes.twelveTones.forEach(n => {    
    console.log();

    (<[ scales.PrimativeInterval[], string][] >[ 
        [scales.scaleSeries.major,        "Major     "], 
        [scales.scaleSeries.naturalMinor, "Minor     "],
        [scales.scaleSeries.dorian,       "Dorian    "],
        [scales.scaleSeries.phrygian,     "Phrygian  "],
        [scales.scaleSeries.lydian,       "Lydian    "],
        [scales.scaleSeries.mixolydian,   "Mixolydian"],
        [scales.scaleSeries.locrian,      "Locrian   "]
     ]).forEach(([series, label]) => {
        const scale = presentation.spellScale(scales.scale(n, series));        
        
        const output = scale.map(s => 
            s.map(presentation.presentDisplayNote).join(", ")
        ). join("\n              ")

        console.log(`${pad(presentation.presentDisplayNote(scale[0][0]))} ${label}`, output);
    });
});


const gIonian = scales.scale("G", scales.scaleSeries.ionian);
console.log([1,2,3,4,5,6,7].map(degree => chord.triad(gIonian, degree as chord.Degree)));