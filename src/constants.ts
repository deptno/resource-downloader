export const NEXT = 'next';
export const PREV = 'prev';

export const JUST             = 'just';
export const SPLIT            = 'split';
export const SPLIT_RIGHT      = 'splitRight';
export const ZIP              = 'zip';
export const PARENT_DIRECTORY = '..';

export const MULTI_SELECTION = 'multi_selection';
export const SELECTION       = 'selection';

class Mode {
    constructor(public name: string, public url?: string) {
        if (!url) {
            this.url = name;
        }
    }
}

export const MODES = [
    new Mode(MULTI_SELECTION, 'checkbox'),
    new Mode(SELECTION, 'list')
];

export const SELECT_MODE = '[change selection mode]';
export const MODE_SELECTOR = new Mode(SELECT_MODE);
