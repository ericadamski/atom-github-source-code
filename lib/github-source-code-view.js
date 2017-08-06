'use babel';

import Search from './search.etch';

export default class GithubSourceCodeView {
    constructor(serializedState, toggle) {
        // Create root element
        this.element = document.createElement('div');
        this.element.classList.add('github-source-code');

        const search = new Search({ cancel: toggle });

        this.element.appendChild(search.element);

        search.focus();
    }

    // Returns an object that can be retrieved when package is activated
    serialize() {}

    // Tear down any state and detach
    destroy() {
        this.element.remove();
    }

    getElement() {
        return this.element;
    }
}
