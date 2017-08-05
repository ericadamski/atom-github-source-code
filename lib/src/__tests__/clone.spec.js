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

    describe('cloning the repo into /tmp', () => {
        const path = `/tmp/ericadamski_atom-github-source-code`;

        it('should delete the directory before cloning', () => {
            const repo =
                'git@github.com:ericadamski/atom-github-source-code.git';

            const mkdir = Observable.bindNodeCallback(fs.mkdir);

            return mkdir(path)
                .toPromise()
                .then(() => {
                    return Observable.bindNodeCallback(fs.lstat)(path)
                        .toPromise()
                        .then(stats => expect(stats.isDirectory()).to.be.true);
                })
                .then(() =>
                    clone(repo)
                        .switchMap(() =>
                            Observable.bindNodeCallback(fs.stat)(path)
                        )
                        .toPromise()
                        .then(stats => expect(stats.isDirectory()).to.be.true)
                );
        });

        it('should clone using ssh', () => {
            const repo =
                'git@github.com:ericadamski/atom-github-source-code.git';

            return clone(repo)
                .switchMap(() => Observable.bindNodeCallback(fs.stat)(path))
                .toPromise()
                .then(stats => {
                    expect(stats).to.not.be.undefined;
                    expect(stats.isDirectory()).to.be.true;
                });
        });

        it('should clone using https', () => {
            const repo =
                'https://github.com/ericadamski/atom-github-source-code.git';

            return clone(repo)
                .switchMap(() => Observable.bindNodeCallback(fs.stat)(path))
                .toPromise()
                .then(stats => {
                    expect(stats).to.not.be.undefined;
                    expect(stats.isDirectory()).to.be.true;
                });
        });
    });
});
