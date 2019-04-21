const expect = require('chai').expect;
const numPrint = require('../numPrint');

describe('test for numPrint', function(){

    it('Should return the number', function(){
        expect(numPrint(4)).to.equal(4)
    })
})