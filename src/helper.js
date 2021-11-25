export function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}
export function splitIntoChunks(array, chunkSizes) {
    let ret = [];
    let j = 0;
    for (let i = 0; i < chunkSizes.length; i++) {
        ret.push(array.slice(j, j + chunkSizes[i]));
        j+=chunkSizes[i];
    }
    return ret;
}
export function randomFromArray(array, amount){
    let arrayShuffled = shuffle(array);
    let choices = arrayShuffled.slice(0, amount)
    let ret_array = arrayShuffled.slice(amount)
    return [ret_array.sort(), choices]
}