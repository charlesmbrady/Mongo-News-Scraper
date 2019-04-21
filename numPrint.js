function numPrint(x) {
    if(typeof x == 'number'){
        return x;
    }
    
}
console.log(numPrint(33));

module.exports = numPrint;