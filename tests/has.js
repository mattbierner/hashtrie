"use strict";
const hashtrie = require('../hashtrie');
const assert = require('chai').assert;

describe('has', () => {
    it('should return false for empty map', () => {
        assert.strictEqual(false, hashtrie.has('a', hashtrie.empty));
        assert.strictEqual(false, hashtrie.has('b', hashtrie.empty));
    });
    
    it('should return if entry exists for single map', () => {
        var h1 = hashtrie.empty.set('a', 3);
    
        assert.strictEqual(true, h1.has('a'));
        assert.strictEqual(false, h1.has('b'));
    });
    
     it('should not depend on stored value', () => {    
        assert.strictEqual(true, hashtrie.has('a', hashtrie.empty.set('a', 3)));
        assert.strictEqual(true, hashtrie.has('a', hashtrie.empty.set('a', false)));
        assert.strictEqual(true, hashtrie.has('a', hashtrie.empty.set('a', null)));
        assert.strictEqual(true, hashtrie.has('a', hashtrie.empty.set('a', undefined)));
    });
    
    it('should return if entry exists in map', () => {
        var h = hashtrie.empty;
        for (let i = 'A'.charCodeAt(0); i < 'z'.charCodeAt(0); i += 2) {
            h = h.set(String.fromCharCode(i), i);
        }
    
        for (let i = 'A'.charCodeAt(0); i < 'z'.charCodeAt(0);) {
            assert.strictEqual(true, hashtrie.has(String.fromCharCode(i++), h));
            assert.strictEqual(false, hashtrie.has(String.fromCharCode(i++), h));
        }
    });
});
