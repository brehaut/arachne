import array = require('../common/array');
import notes = require('../common/notes');
import scales = require('../common/scales');
import presentation = require("../common/presentation");

import ui = require("./app");

scales.chromatic("A").forEach(element => {
    console.log(presentation.spellScale(scales.scale(element, scales.scaleSeries.major)));    
});

function awaitContentLoaded() {
    return new Promise((resolve, reject) => {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", ({}) => {
                resolve(undefined);
            })
        }
        else {
            resolve(undefined);
        }
    });
}



awaitContentLoaded().then(({}) => {
    ui.install(document.querySelector(".arachne")!)
});