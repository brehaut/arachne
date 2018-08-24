module Tones

// Tones are the fundamental data for everything in arachne. 
// While they technically have a numbered ordering, that is managed 
// with some utility functions for doing math on notes
//
// The paired note names correspond to black keys on piano.
type Tone = 
    | A = 0
    | AB = 1
    | B = 2
    | C = 3
    | CD = 4
    | D = 5
    | DE = 6
    | E = 7
    | F = 8
    | FG = 9
    | G = 10
    | GA = 11

// ToneColor uses piano key terminology for the abstraction idea of
// whether – typically — a note is described as being a black note
// (the name would sharp or flat of an adjacent white note), or white
// (the name is typically just its letter name).
type ToneColor = Black | White

// ToneColor provides the mapping of tones to colors.
let noteColor (t:Tone) = function
    | Tone.GA -> ToneColor.Black
    | Tone.AB -> ToneColor.Black
    | Tone.CD -> ToneColor.Black
    | Tone.DE -> ToneColor.Black
    | Tone.FG -> ToneColor.Black
    | _ -> ToneColor.White

// This is an internal function used to make it easier to do interval 
// arithmetic 
let intToTone (n:int) = 
    let n' = n % 12
    enum<Tone>(if n' < 0 then (11 + n') else n')


let twelveTones = List.init 12 intToTone