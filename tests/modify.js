"use strict";
const hashtrie = require('../hashtrie');
const assert = require('chai').assert;

describe('modify', () => {
    it('should update entry in single map', () => {
        const h = hashtrie.set(3, 'a', hashtrie.empty);
        const h1 = hashtrie.modify(x => x * 2, 'a', h);

        assert.strictEqual(6, hashtrie.get('a', h1));
        assert.strictEqual(3, hashtrie.get('a', h));
    });

    it('should work on with method calls', () => {
        const h = hashtrie.empty.set('a', 3);
        const h1 = h.modify('a', x => x * 2);

        assert.strictEqual(6, h1.get('a'));
        assert.strictEqual(3, h.get('a'));
    });


    it('should insert into empty map', () => {
        const h = hashtrie.empty.modify('a', _ => 10);
        assert.strictEqual(10, hashtrie.get('a', h));
    });
    
    
    it('should call `f` with zero args on insert', () => {
        const h = hashtrie.modify(function(x) {
            assert.strictEqual(0, arguments.length);
            assert.strictEqual(undefined, x);
        }, 'a',  hashtrie.empty);
    });
    
    it('should insert if no value in map matches', () => {
        const h = hashtrie.empty.set('a', 3).set('b', 5);
        const h1 = hashtrie.modify(_ => 10, 'c', h);
        
        assert.strictEqual(3, hashtrie.get('a', h1));
        assert.strictEqual(5, hashtrie.get('b', h1));
        assert.strictEqual(10, hashtrie.get('c', h1));

        assert.strictEqual(3, hashtrie.get('a', h));
        assert.strictEqual(5, hashtrie.get('b', h));
        assert.strictEqual(undefined, hashtrie.get('c', h));
    });

    it('should modify collision values correctly', () => {
        const h1 = hashtrie.empty
            .modifyHash(0, 'a', () => 3)
            .modifyHash(0, 'b', () => 5);
    
        const h3 = h1.modifyHash(0, 'a', x => x * 2);
        assert.strictEqual(6, h3.getHash(0, 'a'));
        assert.strictEqual(5, h3.getHash(0, 'b'));
    
        const h4 = h3.modifyHash(0, 'b', x => x * 2);
        assert.strictEqual(6, h4.getHash(0, 'a'));
        assert.strictEqual(10, h4.getHash(0, 'b'));
    
        // Non existant
        const h5 = h4.modifyHash(0, 'c', _ => 100);
        assert.strictEqual(6, h5.getHash(0, 'a'));
        assert.strictEqual(10, h5.getHash(0, 'b'));
        assert.strictEqual(100, h5.getHash(0, 'c'));
    });
});
