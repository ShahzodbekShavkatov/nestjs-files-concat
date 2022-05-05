var excelrange = require('../index');
var expect  = require('chai').expect;

describe('excel-range', function(done) {
	it('should return function', function(done) {
    	expect(excelrange).to.be.a('function');
    	done();
  	});
  	it('should return range A', function(done) {
    	expect(excelrange(1)).to.equal('A');
    	done();
	});
	it('should return range Z', function(done) {
    	expect(excelrange(26)).to.equal('Z');
    	done();
	});
	it('should return range AA', function(done) {
    	expect(excelrange(27)).to.equal('AA');
    	done();
	});
	it('should return range AAA', function(done) {
    	expect(excelrange(702)).to.equal('AAA');
    	done();
	});
});