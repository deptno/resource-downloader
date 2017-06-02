import {ChoiceType, prompt, Question} from 'inquirer';

export default class Questioner {
    static async askSelection(question: Question, root = false) {
        if (!root) {
            const name = '..';
            const upper = {
                name,
                value: name
            };
            question.choices = [upper, ...<ChoiceType[]>question.choices];
        }
        const answer = await prompt(question);
        return answer;
    }
    static async askCheckBox(question: Question, root = false) {
        if (!root) {
            question.choices = <ChoiceType[]>question.choices;
        }
        const answer = await prompt(question);
        console.log('answer', answer);
        
        return answer.name;
    }
}
