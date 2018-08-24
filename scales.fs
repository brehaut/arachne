module Scales

open Tones
open Intervals

type Scale = Tone list
type ScaleSeries = PrimativeInterval list

// Rotate is used to flip a list around to a new starting point
// this is a primative for working with scales and scale series
let rotate (l:'a list) (n:int) = 
    let len = List.length l
    let n' = n % len
    let pivot = if n' < 0 then len + n' else n'
    (List.take pivot l) @ (List.skip pivot l)


module ScaleSeries =


    let major:ScaleSeries = [PrimativeInterval.Tone; PrimativeInterval.Tone; PrimativeInterval.SemiTone; PrimativeInterval.Tone; PrimativeInterval.Tone; PrimativeInterval.Tone; PrimativeInterval.SemiTone]

    // modes
    let ionian = major
    let dorian:ScaleSeries = rotate major 1
    let phyrgian:ScaleSeries = rotate major 2
    let lydian:ScaleSeries = rotate major 3
    let mixolydian:ScaleSeries = rotate major 4
    let aeolian:ScaleSeries = rotate major 5
    let locrian:ScaleSeries = rotate major 6

    let naturalMinor = aeolian


let chromatic (root:Tones.Tone) : Scale =
    let offset = int root
    rotate twelveTones offset
