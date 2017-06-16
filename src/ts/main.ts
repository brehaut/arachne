import array = require('./array');
import notes = require('./notes');
import scales = require('./scales');
import presentation = require("./presentation");

import ui = require("./ui/app");

scales.chromatic("A").forEach(element => {
    console.log(presentation.spellScale(scales.scale(element, scales.scaleSeries.major)));    
});

function awaitContentLoaded() {
    return new Promise((resolve, reject) => {
        document.addEventListener("DOMContentLoaded", ({}) => {
            resolve(undefined);
        })
    });
}



awaitContentLoaded().then(({}) => {
    ui.install(document.querySelector(".arachne")!)
});