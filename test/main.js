const jsc = require("jsverify");
const _ = require("lodash");
const fs = require("fs");

const property = jsc.property;
const assert = jsc.assert;


var notes = require('../build/common/notes');
var scales = require('../build/common/scales');
var presentation = require('../build/common/presentation');

const allNotes = jsc.elements(notes.twelveTones);
const diatonicSeries = jsc.elements(scales.scaleSeries.modes.slice(1));



describe("diatonic scales", () => {
  property("Scale presentation uses each letter only once", diatonicSeries, allNotes, (series, rootNote) => {
    const spelledScales = presentation.spellScale(scales.scale(rootNote, series));

    function checkScaleSpelling(spelledScale) {        
        const lettersInScale = spelledScale.map(n => n[0]);

        const expectedLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G']; 
        const seen = new Map();
        lettersInScale.forEach(l => seen.set(l, (seen.get(l) || 0) + 1));

        return _.every( Array.from(seen.values()), c => c === 1);
    }

    return _.every(spelledScales, checkScaleSpelling);
  });
});
