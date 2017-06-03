import {ChoiceType, prompt, Question} from 'inquirer';
import {
    MODE_SELECTOR, MODES, MULTI_SELECTION,
    PARENT_DIRECTORY, SELECTION
} from '../constants';

export default class Questioner {
    static async askSelection(question: Question, root?: boolean, changeMode?): Promise<ChoiceOptionValue|ChoiceOptionValue[]> {
        const originalChoices = (<ChoiceType[]>question.choices).slice(0);
        if (!root) {
            const choices = <ChoiceType[]>question.choices;

            if (changeMode) {
                choices.unshift(Questioner.fill(MODE_SELECTOR.name));
            }
            choices.unshift(Questioner.fill(PARENT_DIRECTORY));
        }
        question.name  = 'answer';
        const {answer} = await prompt(question);

        if (MODE_SELECTOR.name === answer.name) {
            return await Questioner.modeHandler({
                ...question,
                choices: originalChoices
            }, root, changeMode);
        }

        return answer;
    }

    static async askCheckBox(question: Question): Promise<ChoiceOptionValue[]> {
        question.type  = 'checkbox';
        const {answer} = await prompt(question);
        return answer;
    }

    static async modeHandler(...args) {
        const {answer} = await Questioner.modes();
        const mode     = MODES.find(mode => mode.name === answer.name);

        if (mode.name === MULTI_SELECTION) {
            return await Questioner.askCheckBox.apply(null, args);
        } else if (mode.name == SELECTION) {
            return await Questioner.askSelection.apply(null, args);
        }
    }

    static async modes(currentMode?: string) {
        const fill  = Questioner.fill;
        const modes = MODES
            .filter(mode => mode.name !== currentMode)
            .map(mode => fill(mode.name));

        const question = {
            type:      'list',
            name:      'answer',
            message:   '[select mode]',
            paginated: true,
            pageSize:  20,
            choices:   modes
        };
        return await prompt(question);
    }

    static fill(name: string): ChoiceType {
        return {
            name,
            value: {
                name,
                url: name
            }
        } as any as ChoiceType;
    }
}
