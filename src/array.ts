export function cycleGet<T>(array:T[], index: number):T {
    if (index >= 0) {
        return array[index % array.length];
    }
    return array[array.length - (index % array.length)];
}


export function rotate<T>(arr: T[], offset: number) {
    let front:T[] = arr.slice(offset);
    let back:T[] = arr.slice(0, offset);

    return front.concat(back);
}