const _ = require('lodash');

const {Game} = require('../');
const MAPS = require('./SoukobanMaps');

const EMOJIS = {
  up          : 'arrow_up',
  down        : 'arrow_down',
  left        : 'arrow_left',
  right       : 'arrow_right',
  player      : 'runner',
  playerOnGoal: 'runner',
  wall        : 'black_large_square',
  box         : 'white_circle',
  boxOnGoal   : 'large_blue_circle',
  empty       : 'mu',
  goal        : 'small_blue_diamond'
};

const strToMatrix = str => str.split('\n').map(s => s.split(''));
const matrixToStr = matrix => matrix.map(a => a.join('')).join('\n');
const translocateMatrix = matrix => _.range(matrix[0].length).map(j => _.range(matrix.length).map(i => matrix[i][j]));
const translocateStr = str => matrixToStr(translocateMatrix(strToMatrix(str)));
const flipStr = str => matrixToStr(strToMatrix(str).map(_.reverse));
const moveRight = state => state
  .replace(/[PBg]/g, s => ({P: 'ap', B: 'ab', g: 'a.'}[s]))
  .replace(/(a?)p(a?)b(a?)\./, '$1.$2p$3b')
  .replace(/(a?)p(a?)\./, '$1.$2p')
  .replace(/a[pb\.]/g, s => ({ap: 'P', ab: 'B', 'a.': 'g'}[s]));

class SoukobanGame extends Game {
  getButtons() {
    return [EMOJIS.up, EMOJIS.down, EMOJIS.left, EMOJIS.right];
  }

  async initialize(command, number) {
    this.number = Number(number) || _.random(0, MAPS.length - 1);
    this.logger.info(`Game start (No.${this.number}).`);
    this.state = MAPS[this.number];
    this.walk = 0;
    await this.drawMap();
  }

  isClear() {
    return !/[gP]/.test(this.state);
  }

  updateState(newState) {
    if (newState !== this.state) {
      this.state = newState;
      this.walk++;
    }
  }

  right() {this.updateState(moveRight(this.state));}
  up() {this.updateState(translocateStr(flipStr(moveRight(flipStr(translocateStr(this.state))))));}
  down() {this.updateState(translocateStr(moveRight(translocateStr(this.state))));}
  left() {this.updateState(flipStr(moveRight(flipStr(this.state))));}

  async drawMap() {
    await this.draw(`No.${this.number}\n` + this.state.replace(/[#bBpP\.g]/g, c => `:${{
      '#': EMOJIS.wall,
      '.': EMOJIS.empty,
      'g': EMOJIS.goal,
      'b': EMOJIS.box,
      'B': EMOJIS.boxOnGoal,
      'p': EMOJIS.player,
      'P': EMOJIS.playerOnGoal
    }[c]}:`) + `\ncount: ${this.walk} ${this.isClear() ? '*Game clear!!*' : ''}`);
  }

  async onPushButton(reactionType) {
    if (this.isClear()) {
      return;
    }
    const emojiKey = _.findKey(EMOJIS, emoji => emoji === reactionType);
    if (/^(up|down|left|right)$/.test(emojiKey)) {
      this[emojiKey]();
      await this.drawMap();
      if (this.isClear()) {
        this.logger.info('Game finish.');
        this.end();
      }
    }
  }
}

module.exports = SoukobanGame;
