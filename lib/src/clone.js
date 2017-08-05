import { Observable } from 'rxjs';
import { compose, replace } from 'ramda';

import child from 'child_process';
import fs from 'fs';

const getRepoPath = compose(
    replace('/', '_'),
    replace(/.*github\.com[:|/](.*).git$/, '$1')
);

const exists = path => {
    const stat = Observable.bindNodeCallback(fs.lstat);

    return stat(path)
        .switchMap(stats => stats && stats.isDirectory())
        .catch(err => Observable.of(false));
};

const deleteDirectoryIfExists = (path, source$) => {
    const rmdir = Observable.bindNodeCallback(fs.unlink);

    return source$.map(exists => exists && rmdir(path));
};

export const clone = function(repo) {
    const exec = Observable.bindNodeCallback(child.exec);

    const path = getRepoPath(repo);

    return deleteDirectoryIfExists(path, exists(path)).map(() => {
        return exec(`git clone ${repo} /tmp/${path}`).map(process =>
            process.on('exit', console.log)
        );
    });
};
