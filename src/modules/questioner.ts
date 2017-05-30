import {ChoiceType, prompt, Question} from 'inquirer';

export default class Questioner {
    static async ask(question: Question, root = false) {
        if (!root) {
            const name = '..';
            const upper = {
                name,
                value: JSON.stringify({name})
            };
            question.choices = [upper, ...<ChoiceType[]>question.choices];
        }
        const answer = await prompt(question);
        return JSON.parse(answer.name);
    }
}
