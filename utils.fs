module Utils

// Rotate is used to flip a list around to a new starting point
// this is a primative for working with scales and scale series
let rotate (l:'a list) (n:int) = 
    let len = List.length l
    let n' = n % len
    let pivot = if n' < 0 then len + n' else n'
    (List.take pivot l) @ (List.skip pivot l)
