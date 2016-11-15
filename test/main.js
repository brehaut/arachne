var notes = require('../build/notes');
var scales = require('../build/scales');
var presentation = require('../build/presentation');

function pad(s) {
    return s.length === 1 ? s + " " : s;
}

notes.twelveTones.forEach(n => {    
    console.log();

    [[scales.scaleSeries.major, "Major"], 
     [scales.scaleSeries.naturalMinor, "Minor"],
     [scales.scaleSeries.dorian, "Dorian"],
     [scales.scaleSeries.phrygian, "Phrygian"],
     [scales.scaleSeries.lydian, "Lydian"],
     [scales.scaleSeries.mixolydian, "Mixolydian"],
     [scales.scaleSeries.locrian, "Locrian"]
     ].forEach((p) => {
        const series = p[0];
        const label = p[1];
        const scale = scales.scale(n, series);
        const shift = presentation.getScaleShift(scale);
        const display = (n) => presentation.noteToDisplay(n, shift); 
        
        console.log(`${pad(display(n))} ${label}`, scale.map(display));
    });

});
