'use babel';
/** @jsx etch.dom */

import { Disposable, CompositeDisposable, TextEditor } from 'atom';
import etch, { dom as $, render } from 'etch';
import SelectList from 'atom-select-list';

import { compose, not, isEmpty } from 'ramda';

import { search } from './src/search';
import { clone } from './src/clone';

import { Subject } from 'rxjs';

export default class Search {
    constructor(props = {}, children) {
        this.change$ = new Subject();
        this.cancelled$ = new Subject();

        this.props = props;

        this.items = [];
        this.disposables = new CompositeDisposable();
        etch.initialize(this);

        const didLoseFocus = this.didLoseFocus.bind(this);

        const editorElement = this.refs.queryEditor.element;

        editorElement.addEventListener('blur', didLoseFocus);

        this.disposables.add(
            new Disposable(() => {
                editorElement.removeEventListener('blur', didLoseFocus);
            })
        );

        this.changeSub = this.watchQuery(this.change$);

        this.disposables.add(
            global.atom.commands.add(this.element, {
                'core:confirm': event => {
                    this.didChangeQuery();
                    event.stopPropagation();
                },
                'core:cancel': event => {
                    this.cancelled$.next();
                    this.cancel();
                    event.stopPropagation();
                },
            })
        );

        this.changeSub = this.watchQuery(this.change$);
    }

    focus() {
        this.refs.queryEditor.element.focus();
    }

    didLoseFocus(event) {
        if (this.element.contains(event.relatedTarget)) {
            this.refs.queryEditor.element.focus();
        } else if (document.hasFocus() && this.items.length < 1) {
            this.cancelled$.next();
            this.cancel();
        }
    }

    watchQuery(change$) {
        return change$
            .filter(compose(not, isEmpty))
            .switchMap(q => search(q).takeUntil(this.cancelled$))
            .subscribe(({ items }) => {
                this.items = items;
                this.update().then(
                    () => this.refs.fuzzy && this.refs.fuzzy.focus()
                );
            });
    }

    cloneAndOpenRepo(item) {
        const method = { ssh: 'ssh_url', https: 'clone_url' }[
            atom.config.get('github-source-code.clone_method') || 'ssh'
        ];

        const repo = item[method];

        clone(repo).subscribe(path => {
            atom.open({ pathsToOpen: [path], newWindow: true });
            this.cancel();
        });
    }

    didChangeQuery() {
        this.change$.next(this.getQuery());
    }

    itemFactory(item) {
        return render($.li({}, item.full_name));
    }

    renderSelectList() {
        if (this.items.length < 1) return null;

        return $(SelectList, {
            ref: 'fuzzy',
            items: this.items,
            elementForItem: this.itemFactory,
            filterKeyForItem: item => item.name,
            didConfirmSelection: this.cloneAndOpenRepo.bind(this),
            didCancelSelection: this.cancel.bind(this),
        });
    }

    renderSearchField() {
        if (this.items.length > 0) return null;

        return $(TextEditor, { ref: 'queryEditor', mini: true });
    }

    render() {
        return $.div({}, this.renderSearchField(), this.renderSelectList());
    }

    getQuery() {
        if (this.refs && this.refs.queryEditor) {
            return this.refs.queryEditor.getText();
        } else {
            return '';
        }
    }

    cancel() {
        this.items = [];
        this.props.cancel && this.props.cancel();

        this.update();
    }

    update(props = {}, children) {
        if (props.cancel) {
            this.props.cancel = props.cancel;
        }

        return etch.update(this);
    }

    async destory() {
        this.changeSub && this.changeSub.unsubcribe();
        this.disposables.dispose();
        await etch.destory(this);
    }
}
