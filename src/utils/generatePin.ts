export function generateRandomNumber() {
    var minValue = 100000;
    var maxValue = 999999;
    return Math.floor(Math
    .random() * (maxValue - minValue + 1)) + minValue;
}