import {prompt, Question} from 'inquirer';

export default class Questioner {
    static async ask(question: Question) {
        const answer = await prompt(question);
        return JSON.parse(answer.name);
    }
}
