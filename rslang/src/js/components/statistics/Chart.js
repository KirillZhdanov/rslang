import Chart from 'chart.js';
import create from '../../utils/сreate';
import {
  statisticsText,
} from '../../constants/constants';

const GameTitles = statisticsText.gametitles;

export default class StatisticsChart {
  constructor() {
    this.myDiv = create('div', 'statistics__charts');
  }

  renderStatisticsCharts() {
    return this.myDiv;
  }

  clearRenderedCharts() {
    if (this.myDiv) {
      this.myDiv.innerHTML = '';
    }
  }

  learnedWordsChart(learnedWords, learnedWordsObj) {
    const div = create('div', 'mainChart', '', this.myDiv);
    const ctx = create('canvas', 'myChart', '', div);
    const arr = Object.entries(learnedWordsObj);
    const dateLabels = [];
    const data = [];
    for (let i = 0; i < arr.length; i += 1) {
      dateLabels.push(arr[i][0]);
      data.push(arr[i][1] || 0);
    }
    Chart.defaults.global.responsive = true;
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: dateLabels,
        datasets: [{
          label: statisticsText.texts.learnedWords,
          data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
          cubicInterpolationMode: 'linear',
        }],
      },
      options: {
        scales: {
          yAxes: [{
            type: 'linear',
            ticks: {
              beginAtZero: true,
            },
          }],
        },
        elements: {
          line: {
            tension: 0,
          },
        },
      },
    });
  }

  summaryByAnswersChart(summaryByAnswers) {
    const div = create('div', 'pieChart', '', this.myDiv);
    const ctx = create('canvas', 'myChart', '', div);
    Chart.defaults.global.legend.position = 'bottom';
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: [statisticsText.texts.correctAnswers, statisticsText.texts.wrongAnswers],
        datasets: [
          {
            fill: true,
            backgroundColor: [
              'green',
              'red'],
            data: [summaryByAnswers.correctAnswers, summaryByAnswers.wrongAnswers],
          },
        ],
      },
    });
  }

  summaryByGamesChart(summaryByGames) {
    const div = create('div', 'pieChart', '', this.myDiv);
    const ctx = create('canvas', 'myChart', '', div);
    const arr = Object.entries(summaryByGames);
    const gameLabels = [];
    const data = [];
    for (let i = 0; i < arr.length; i += 1) {
      gameLabels.push(GameTitles[arr[i][0]]);
      data.push(arr[i][1]);
    }
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: gameLabels,
        datasets: [
          {
            fill: true,
            backgroundColor: ['aquamarine', 'green', 'red', 'blue', 'orange', 'yellow', 'purple'],
            data,
          },
        ],
      },
    });
  }
}
