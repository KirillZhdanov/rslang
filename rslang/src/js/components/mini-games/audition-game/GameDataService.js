import create from '../../../utils/сreate';
import { getWords, getWordsAdditionalInfo } from '../../../service/service';
import { simpleShuffle, shuffle } from '../../../utils/shuffle';
import { auditionGameVariables } from '../../../constants/constants';

export default class GameDataService {
  async mapping(currentRound, isMuted) {
    const curr = currentRound <= auditionGameVariables.maxGroups && currentRound > 0 ? currentRound - 1 : Math.floor(Math.random() * Math.floor(auditionGameVariables.maxGroups));
    this.data = await getWords(Math.floor(Math.random() * Math.floor(auditionGameVariables.maxPages)), curr);
    this.shuffledValue = this.data.sort(simpleShuffle);
    const wrapper = document.querySelector('.audition-game__wrapper');
    this.container = create('div', 'audition-game__container hide', '', wrapper);
    const soundCont = create('div', 'audition-game__sound__container', '', this.container);
    const hintCont = create('div', 'audition-game__hint__container', '', this.container);
    if (!isMuted) create('div', 'audition-game__sound__button', '', soundCont);
    else create('div', 'audition-game__sound__button audition-game__sound__buttonMuted', '', soundCont);
    create('div', 'audition-game__hint__button', '', hintCont);
    create('div', 'close', '', this.container);
    const game = create('div', 'audition-game__game', '', this.container);
    create('div', 'audition-game__audio__pulse', '', game);
    create('p', 'audition-game__correctanswer', '', game);
    create('div', 'audition-game__answers', '', game);
    create('button', 'audition-game__button__next Enter', `${auditionGameVariables.idkBtn}`, game);
    const wordsInfo = [];
    for (let i = 0; i < this.shuffledValue.length - 1; i += 1) {
      const test = await getWordsAdditionalInfo(this.shuffledValue[i].word);
      const partOfSpeech = test.results ? test?.results[0]?.partOfSpeech : auditionGameVariables.IDK;
      if (this.shuffledValue[i]?.wordTranslate) {
        wordsInfo.push({
          word: this.shuffledValue[i].word, translate: this.shuffledValue[i].wordTranslate, audio: this.shuffledValue[i].audio, partOfSpeech, image: this.shuffledValue[i].image, id: this.shuffledValue[i].id,
        });
      }
    }
    const filteredWordsInfo = wordsInfo.filter((word) => word.partOfSpeech === auditionGameVariables.noun);
    const possibleAnswers = filteredWordsInfo.slice(0, auditionGameVariables.possibleWordsAmount);
    const mainWordToAsk = possibleAnswers[0];
    const shuffledPossibleAnswers = shuffle(possibleAnswers);
    return { mainWordToAsk, array: shuffledPossibleAnswers , test:this.shuffledValue[0]};
  }
}
