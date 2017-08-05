import { expect } from 'chai';
import { Observable } from 'rxjs';

import { search } from '../search';

describe('Github Repository Search', () => {
    it('should be a function', () => {
        expect(search).to.be.a('function');
    });

    it('should return an Observable', () => {
        expect(search('express')).to.be.an.instanceOf(Observable);
    });
});
