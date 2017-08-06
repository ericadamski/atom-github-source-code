import { expect } from 'chai';
import { Observable } from 'rxjs';
import fs from 'fs';

import { tap } from 'ramda';

import { clone } from '../clone';

describe('Github Repo Clone', () => {
    it('should be a function', () => {
        expect(clone).to.be.a('function');
    });

    it('should return an observable', () => {
        expect(clone('repo')).to.be.an.instanceOf(Observable);
    });

    it('should return an observable of the path', () => {
        return clone('git@github.com:ericadamski/atom-github-source-code.git')
            .toPromise()
            .then(path => {
                expect(path).to.be.a('string');
                expect(path).to.equal(
                    '/tmp/ericadamski_atom-github-source-code'
                );
            });
    });

    describe('cloning the repo into /tmp', () => {
        const lstat = Observable.bindNodeCallback(fs.lstat);
        const path = `/tmp/ericadamski_atom-github-source-code`;

        it('should clone using ssh', () => {
            const repo =
                'git@github.com:ericadamski/atom-github-source-code.git';

            return clone(repo)
                .switchMap(() => lstat(path))
                .mergeMap(() => lstat(`${path}/.git`))
                .map(stats => {
                    expect(stats).to.not.be.undefined;
                    expect(stats.isDirectory()).to.be.true;
                })
                .toPromise();
        });

        it('should clone using https', () => {
            const repo =
                'https://github.com/ericadamski/atom-github-source-code.git';

            return clone(repo)
                .switchMap(() => lstat(path))
                .mergeMap(() => lstat(`${path}/.git`))
                .map(stats => {
                    expect(stats).to.not.be.undefined;
                    expect(stats.isDirectory()).to.be.true;
                })
                .toPromise();
        });
    });
});
