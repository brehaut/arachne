export function cycleGet<T>(array:T[], index: number):T {
    if (index >= 0) {
        return array[index % array.length];
    }

    // index is negative (including after mod, so adding it subtracts it from length);
    return array[array.length + (index % array.length)];
}


export function rotate<T>(arr: T[], offset: number) {
    let front:T[] = arr.slice(offset % arr.length);
    let back:T[] = arr.slice(0, offset % arr.length);

    return front.concat(back);
}


export function distribution<T, TKey>(arr: T[], key:(v:T) => TKey) {
    const dist = new Map();
    arr.forEach(v => {
        const k = key(v); 
        dist.set(k, (dist.get(k) || 0) + 1);
    });
    return dist;
}