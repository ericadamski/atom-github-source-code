'use babel';

import { Observable } from 'rxjs';
import { compose, replace } from 'ramda';

import rimraf from 'rimraf';

import child from 'child_process';
import fs from 'fs';

const getRepoPath = compose(
    replace('/', '_'),
    replace(/.*github\.com[:|/](.*).git$/, '$1')
);

const exists = path => {
    const stat = Observable.bindNodeCallback(fs.lstat);

    return stat(path)
        .map(stats => stats && stats.isDirectory())
        .catch(err => Observable.of(false));
};

const deleteDirectoryIfExists = (path, source$) => {
    const rmdir = Observable.bindNodeCallback(rimraf);

    return source$.switchMap(
        exists => (exists ? rmdir(`${path}`) : Observable.of(false))
    );
};

export const clone = function(repo) {
    const exec = Observable.bindNodeCallback(child.exec);

    const path = `/tmp/${getRepoPath(repo)}`;

    return deleteDirectoryIfExists(path, exists(path)).switchMap(() =>
        exec(`git clone ${repo} ${path}`).mapTo(path)
    );
};
