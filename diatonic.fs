module Diatonic

open Tones

// NoteNames are the diatonic names for notes. A heptatonic scale will
// have one of each, modified by an AlterationSign
//
// These values have integer representations that correspond to the 
// equivalent representations in the Tone type. This is an internal 
// convenience
type NoteName = 
    | A = 0 
    | B = 2 
    | C = 3 
    | D = 5
    | E = 7 
    | F = 8
    | G = 10

// Arachne assumes only two degrees of sharp or flat
type Alteration =
    | DoubleFlat = -2 
    | Flat = -1 
    | Natural = 0
    | Sharp = 1 
    | DoubleSharp = 2

// This is the name for an underlying tone in a given 
// scale
type DiatonicNote = {
    Name: NoteName;
    Sign: Alteration;
}
  
let diatonics = List.map (fun (name, sign) -> { Name = name; Sign = sign })

let toneNames (t:Tone) =
    let whiteNames ds n df = [ ds, Alteration.DoubleSharp ; n, Alteration.Natural ; df, Alteration.DoubleFlat ]
    let blackNames s f = [ s, Alteration.Sharp; f, Alteration.Flat ]

    match t with
        | Tone.A ->  whiteNames NoteName.G NoteName.A NoteName.B
        | Tone.AB -> blackNames NoteName.A NoteName.B
        | Tone.B ->  [ NoteName.A, Alteration.DoubleSharp ; NoteName.B, Alteration.Natural; NoteName.C, Alteration.Flat ]
        | Tone.C ->  [ NoteName.B, Alteration.Sharp; NoteName.C, Alteration.Natural; NoteName.D, Alteration.DoubleFlat ]
        | Tone.CD -> blackNames NoteName.C NoteName.D
        | Tone.D ->  whiteNames NoteName.C NoteName.D NoteName.E
        | Tone.DE -> blackNames NoteName.D NoteName.E
        | Tone.E ->  [ NoteName.D, Alteration.DoubleSharp; NoteName.E, Alteration.Natural; NoteName.F, Alteration.Flat ]
        | Tone.F ->  [ NoteName.E, Alteration.Sharp; NoteName.F, Alteration.Natural; NoteName.G, Alteration.DoubleFlat ]
        | Tone.FG -> blackNames NoteName.F NoteName.G
        | Tone.G ->  whiteNames NoteName.F NoteName.G NoteName.A
        | Tone.GA -> blackNames NoteName.G NoteName.A
        | _ -> failwith "unexpected tone value"
      |> diatonics



type DiatonicScale = DiatonicNote list