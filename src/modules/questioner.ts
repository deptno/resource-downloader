import {ChoiceType, prompt, Question} from 'inquirer';
import {PARENT_DIRECTORY} from '../constants';

export default class Questioner {
    static async askSelection(question: Question, root = false) {
        if (!root) {
            const name = PARENT_DIRECTORY;
            const upper = {
                name,
                value: {
                    name,
                    url: name
                }
            } as any;
            question.choices = [upper, ...<ChoiceType[]>question.choices];
        }
        return await prompt(question);
    }
    static async askCheckBox(question: Question, root = false) {
        if (!root) {
            question.choices = <ChoiceType[]>question.choices;
        }
        return await prompt(question);
    }
}
