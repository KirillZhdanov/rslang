import create from '../../utils/сreate';
import dateFormat from '../../utils/dateformat';
import {
  statisticsText,
  StatisticsGameCodes,
} from '../../constants/constants';
import {
  updateUserStatistics,
  getUserStatistics,
} from '../../service/service';
import StatisticsChart from './Chart';

const {
  MAIN_GAME_CODE,
} = StatisticsGameCodes;

export default class Statistics {
  constructor(userData) {
    if (Statistics.exists) {
      return Statistics.instance;
    }

    this.user = userData || false;

    Statistics.exists = true;
    Statistics.instance = this;
    this.initialized = false;
  }

  async init() {
    if (!this.initialized) {
      this.initialized = true;
      this.chrt = new StatisticsChart();
      const date = new Date();
      this.currentdate = dateFormat(date.getDate(), date.getMonth() + 1, date.getFullYear());

      await this.loadStatistics();
    }
  }

  async loadStatistics() {
    const res = await getUserStatistics(this.user.userId, this.user.token);
    if (res) {
      this.statistics = {
        learnedWords: res.learnedWords,
        optional: Statistics.filterForOptional(res.optional) || {},
      };
    } else {
      this.statistics = {
        learnedWords: 0,
        optional: {},
      };
    }
  }

  async saveStatistics() {
    await updateUserStatistics(this.user.userId, this.user.token, this.statistics);
  }

  async resetStatistics() {
    const body = {
      learnedWords: 0,
      optional: {},
    };
    await updateUserStatistics(this.user.userId, this.user.token, body);
  }

  getGameStatistics(group, requestedDate) {
    const date = requestedDate || this.currentdate;
    this.controlGroupInStatistics(group, date);

    return this.statistics.optional[date][group];
  }

  async saveMainGameStatistics(
    incrementPlayingCount,
    correct,
    wrong,
    learnedWords,
    additionalObject,
    replaceValues = false,
  ) {
    const group = MAIN_GAME_CODE;
    this.controlGroupInStatistics(group);

    if (incrementPlayingCount) {
      this.incrementPlayingCounts(group);
    }

    this.updateAnswersStatistics(group, correct, wrong, replaceValues);

    if (learnedWords) {
      this.updateLearnedWords(group, learnedWords, replaceValues);
    }

    if (additionalObject) {
      this.addAdditionalObject(group, additionalObject);
    }

    await this.saveStatistics();
  }

  async saveGameStatistics(
    group,
    correct,
    wrong,
    learnedWords,
    additionalObject,
    replaceValues = false,
  ) {
    this.controlGroupInStatistics(group);

    this.incrementPlayingCounts(group);
    this.updateAnswersStatistics(group, correct, wrong, replaceValues);

    if (learnedWords) {
      this.updateLearnedWords(group, learnedWords, replaceValues);
    }

    if (additionalObject) {
      this.addAdditionalObject(group, additionalObject);
    }

    await this.saveStatistics();
  }

  incrementPlayingCounts(group) {
    this.statistics.optional[this.currentdate][group].playingCount += 1;
  }

  updateAnswersStatistics(group, correct, wrong, replaceValues = false) {
    if (replaceValues) {
      this.statistics.optional[this.currentdate][group].correctAnswers = correct;
      this.statistics.optional[this.currentdate][group].wrongAnswers = wrong;
    } else {
      this.statistics.optional[this.currentdate][group].correctAnswers += correct;
      this.statistics.optional[this.currentdate][group].wrongAnswers += wrong;
    }
  }

  updateLearnedWords(group, wordsCount, replaceValues = false) {
    this.statistics.learnedWords += Number(wordsCount);

    if (
      Object.prototype.hasOwnProperty.call(this.statistics.optional[this.currentdate][group], 'learnedWords')
      && !replaceValues
    ) {
      this.statistics.optional[this.currentdate][group].learnedWords += wordsCount;
    } else {
      this.statistics.optional[this.currentdate][group].learnedWords = wordsCount;
    }
  }

  addAdditionalObject(group, additionalObject) {
    this.statistics.optional[this.currentdate][group].additional = additionalObject;
  }

  static createStatisticObject() {
    const obj = {};

    return obj;
  }

  controlGroupInStatistics(group, requestedDate) {
    const date = requestedDate || this.currentdate;
    if (!Object.prototype.hasOwnProperty.call(this.statistics.optional, date)) {
      this.statistics.optional[date] = {};
    }

    if (!Object.prototype.hasOwnProperty.call(this.statistics.optional[date], group)) {
      this.statistics.optional[date][group] = Statistics.getDefaultStatisticObject();
    }
  }

  static getDefaultStatisticObject() {
    const obj = {
      playingCount: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
    };

    return obj;
  }

  render(mainContainer) {
    this.chrt.myDiv.innerHTML = '';
    const appContainer = document.querySelector(mainContainer) || document.body;
    const statContainer = create('div', 'statistics__container', [
      this.renderShortTerm(),
      this.renderLongTerm(),
    ]);

    const exitButton = create('span', 'exit-button statistics__exit-button', undefined, undefined, ['id', 'button-go-to-main-page']);

    const mainStatistics = create('div', 'statistics', [
      Statistics.renderNavigation(),
      statContainer,
      exitButton,
    ]);

    create('div', 'statistics__wrapper', mainStatistics, appContainer);
  }

  static renderNavigation() {
    const shortterm = create('li', 'statictics-tab-list__item statictics-tab-list_active', statisticsText.tabtitels.shortterm, undefined, ['tabId', 'shortterm']);
    const longterm = create('li', 'statictics-tab-list__item', statisticsText.tabtitels.longterm, undefined, ['tabId', 'longterm']);

    const ulNavigation = create('ul', 'statictics-tab-list', [shortterm, longterm]);
    ulNavigation.addEventListener('click', Statistics.changeTabHandler);

    const div = create('div', 'statistics__navigation', ulNavigation);

    return div;
  }

  renderShortTerm() {
    const gamesOptions = Statistics.getOptionsArrayForGames(statisticsText.gametitles);
    const gamesSelect = Statistics.createSelect('game_select', 'game_select', ...gamesOptions);
    gamesSelect.addEventListener('change', (this.selectOptionsHandler).bind(this));
    const games = create('label', 'statistics-selects__label', [`${statisticsText.select.game}: `, gamesSelect]);

    const datesOptions = this.getOptionsArrayForDates(this.statistics.optional);
    const dateSelect = Statistics.createSelect('data_select', 'data_select', ...datesOptions);
    dateSelect.addEventListener('change', (this.selectOptionsHandler).bind(this));
    const dates = create('label', 'statistics-selects__label', [`${statisticsText.select.date}: `, dateSelect]);
    const selects = create('div', 'statistics-selects', [games, dates], document.body);
    const gamestat = create('div', 'statistics__game-statistic', this.selectOptionsController(gamesSelect, dateSelect), undefined, ['id', 'gamestatistics']);

    return create('div', 'statistics-tab__item statistics__short-term statistics-tab_active', [selects, gamestat], undefined, ['tabId', 'shortterm']);
  }

  renderLongTerm() {
    const learnedWordsData = this.getLearnedWordsByDate();
    const summaryByAnswers = this.getSummaryByAnswers();
    const summaryByGames = this.getSummaryByGames();

    this.chrt.clearRenderedCharts();
    this.chrt.summaryByAnswersChart(summaryByAnswers);
    this.chrt.summaryByGamesChart(summaryByGames);
    this.chrt.learnedWordsChart(this.statistics.learnedWords, learnedWordsData);
    return create(
      'div', 'statistics-tab__item statistics__long-term',
      this.chrt.renderStatisticsCharts(), undefined,
      ['tabId', 'longterm'],
    );
  }

  static createSelect(name, id, ...options) {
    const select = create('select', 'statistics-selects__select', undefined, undefined, ['name', name], ['id', id]);
    options.forEach(([key, value], index) => {
      const el = create('option', 'statistics-selects__options', value, select, ['value', key]);
      if (index === 0) {
        el.selected = true;
      }
    });

    return select;
  }

  getOptionsArrayForDates(obj) {
    const keysArr = Object.keys(obj);
    const options = [];
    keysArr.forEach((key) => {
      const keysOps = [key, key];
      options.push(keysOps);
    });

    if (!keysArr.length) {
      options.push([this.currentdate, this.currentdate]);
    }

    return options.reverse();
  }

  static getOptionsArrayForGames(obj) {
    return Object.entries(obj);
  }

  selectOptionsHandler() {
    this.selectOptionsController();
  }

  selectOptionsController(...args) {
    let gameSelect;
    let dateSelect;
    if (!args.length) {
      gameSelect = document.querySelector('#game_select').value;
      dateSelect = document.querySelector('#data_select').value;
    } else {
      [
        gameSelect,
        dateSelect,
      ] = args;
      gameSelect = gameSelect.value;
      dateSelect = dateSelect.value;
    }

    return this.getShortGameStatistic(gameSelect, dateSelect);
  }

  getShortGameStatistic(game, date) {
    const gameStat = this.getGameStatistics(game, date);

    const {
      playingCount,
      correctAnswers,
      wrongAnswers,
      learnedWords,
    } = gameStat;
    const answers = correctAnswers + wrongAnswers;
    const correctPercents = Math.round((correctAnswers / answers) * 100);
    const wrongPercents = Math.round((wrongAnswers / answers) * 100);

    const pPlayingCount = create('p', 'statistics-short-term__param', `${statisticsText.texts.playingCount}: <i>${playingCount}</i>`);
    const pCorrect = create('p', 'statistics-short-term__param', `${statisticsText.texts.correctAnswers}: <i>${correctAnswers} (${correctPercents || 0}%)</i>`);
    const pWrong = create('p', 'statistics-short-term__param', `${statisticsText.texts.wrongAnswers}: <i>${wrongAnswers} (${wrongPercents || 0}%)</i>`);
    let pLearnedWords;
    if (learnedWords) {
      pLearnedWords = create('p', 'statistics-short-term__param', `${statisticsText.texts.learnedWords}: <i>${learnedWords}</i>`);
    }

    const gamestatistics = document.querySelector('#gamestatistics');
    if (gamestatistics) {
      gamestatistics.innerHTML = '';
      if (pLearnedWords) {
        gamestatistics.append(pLearnedWords);
      }
      gamestatistics.append(pPlayingCount, pCorrect, pWrong);
    }

    let elementsArr = [pPlayingCount, pCorrect, pWrong];
    if (pLearnedWords) {
      elementsArr = [pLearnedWords, ...elementsArr];
    }
    return elementsArr;
  }

  getSummaryByGames() {
    const arrData = Object.values(this.statistics.optional);
    const resObj = {};

    arrData.forEach((gameValue) => {
      const gameData = Object.entries(gameValue);
      gameData.forEach(([key, value]) => {
        if (Object.prototype.hasOwnProperty.call(resObj, key)) {
          resObj[key] += value?.playingCount || 0;
        } else {
          resObj[key] = value?.playingCount || 0;
        }
      });
    });

    return resObj;
  }

  getSummaryByAnswers() {
    const arrData = Object.values(this.statistics.optional);
    const resObj = {
      correctAnswers: 0,
      wrongAnswers: 0,
    };

    arrData.forEach((gameValue) => {
      const gameData = Object.values(gameValue);
      gameData.forEach((value) => {
        resObj.correctAnswers += value.correctAnswers;
        resObj.wrongAnswers += value.wrongAnswers;
      });
    });

    return resObj;
  }

  getLearnedWordsByDate() {
    const arrData = Object.entries(this.statistics.optional);
    const resObj = {};

    arrData.forEach(([key, value]) => {
      resObj[key] = value?.maingame?.learnedWords;
    });

    return resObj;
  }

  static changeTabHandler(event) {
    const TAB_EL = 'LI';
    if (event.target.tagName === TAB_EL) {
      const element = event.target;
      const id = element.dataset.tabId;
      const tabsList = document.querySelectorAll('.statictics-tab-list__item');
      tabsList.forEach((el) => el.classList.remove('statictics-tab-list_active'));
      element.classList.add('statictics-tab-list_active');

      const tabs = document.querySelectorAll('.statistics-tab__item');
      tabs.forEach((el) => {
        el.classList.remove('statistics-tab_active');
        if (el.dataset.tabId === id) {
          el.classList.add('statistics-tab_active');
        }
      });
    }
  }

  static filterForOptional(optional) {
    const resObj = {};
    if (optional) {
      const dataArr = Object.entries(optional);
      dataArr.forEach(([key, value]) => {
        if (/^[0-9]{2}\.[0-9]{2}\.[0-9]{4}$/.test(key)) {
          resObj[key] = value;
        }
      });
    }

    return resObj;
  }

  getCharts() {
    const chrt = new StatisticsChart();
    const learnedWordsData = this.getLearnedWordsByDate();
    const summaryByAnswers = this.getSummaryByAnswers();
    const summaryByGames = this.getSummaryByGames();
    setTimeout(() => {
      chrt.summaryByAnswersChart(summaryByAnswers);
      chrt.summaryByGamesChart(summaryByGames);
      chrt.learnedWordsChart(this.statistics.learnedWords, learnedWordsData);
    }, 5000);
  }
}
