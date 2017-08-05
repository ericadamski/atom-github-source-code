'use babel';

import fetch from 'unfetch';

import { Observable } from 'rxjs';

import { GITHUB } from './constants';

export const search = function(q) {
    const URI = `${GITHUB}/search/repositories?q=${q}`;

    return Observable.fromPromise(fetch(URI).then(response => response.json()));
};
