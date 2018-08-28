module Scales

open Utils
open Tones
open Intervals

type Scale = Tone list
type ScaleSeries = PrimativeInterval list


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
