module Diatonic

// NoteNames are the diatonic names for notes. A heptatonic scale will
// have one of each, modified by an AlterationSign
type NoteNames =  A | B | C | D | E | F | G

// Arachne assumes 
type AlterationSign =
    | DoubleFlat = -2 
    | Flat = -1 
    | Neutral = 0
    | Sharp = 1 
    | DoubleSharp = 2

// This is the name for an underlying tone in a given 
// scale
type DiatonicNote = {
    Name: NoteNames;
    Sign: AlterationSign;
}