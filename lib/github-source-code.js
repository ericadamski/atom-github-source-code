'use babel';

import GithubSourceCodeView from './github-source-code-view';
import { CompositeDisposable } from 'atom';

export default {
    config: {
        clone_method: {
            type: 'string',
            title: 'Clone Method',
            default: 'ssh',
            description:
                'How would you like to clone the repos (`ssh` or `https`)',
        },
    },
    githubSourceCodeView: null,
    modalPanel: null,
    subscriptions: null,

    activate(state) {
        this.githubSourceCodeView = new GithubSourceCodeView(
            state.githubSourceCodeViewState,
            () => this.modalPanel && this.modalPanel.hide()
        );
        this.modalPanel = atom.workspace.addModalPanel({
            item: this.githubSourceCodeView.getElement(),
            visible: false,
        });

        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();

        // Register command that toggles this view
        this.subscriptions.add(
            atom.commands.add('atom-workspace', {
                'github-source-code:toggle': () => this.toggle(),
            })
        );
    },

    deactivate() {
        this.modalPanel.destroy();
        this.subscriptions.dispose();
        this.githubSourceCodeView.destroy();
    },

    serialize() {
        return {
            githubSourceCodeViewState: this.githubSourceCodeView.serialize(),
        };
    },

    toggle() {
        console.log('GithubSourceCode was toggled!');
        return this.modalPanel.isVisible()
            ? this.modalPanel.hide()
            : this.modalPanel.show();
    },
};
