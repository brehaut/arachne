const jsc = require("jsverify");
const _ = require("lodash");
const fs = require("fs");

const property = jsc.property;
const assert = jsc.assert;


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



const allNotes = jsc.elements(notes.twelveTones);
const diatonicSeries = jsc.elements(scales.scaleSeries.modes.slice(1));



describe("diatonic scales", () => {
  property("Scale presentation uses each letter only once", diatonicSeries, allNotes, (series, rootNote) => {
    const scale = scales.scale(rootNote, series);
    const shift = presentation.getScaleShift(scale);
    const spelledScale = scale.map(n => presentation.noteToDisplay(n, shift));

    const lettersInScale = spelledScale.map(n => n[0]);

    const expectedLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G']; 
    const seen = new Map();
    lettersInScale.forEach(l => seen.set(l, (seen.get(l) || 0) + 1));

    return _.every( Array.from(seen.values()), c => c === 1);
  });
});
