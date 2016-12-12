const _ = require('lodash');
const {Game} = require('../');

const BUTTONS = ['facepunch', 'v', 'hand'];

class JankenGame extends Game {
  getButtons() {
    return BUTTONS;
  }

  async initialize() {
    await this.draw('じゃんけん･･･');
  }

  async onPushButton(reactionType, user) {
    const myHandIndex = _.indexOf(BUTTONS, reactionType);
    if (myHandIndex < 0) {
      return;
    }

    const comHandIndex = _.random(0, BUTTONS.length - 1);
    // 0 === あいこ、2 === かち、 1 === まけ
    const winOrLose = (BUTTONS.length + myHandIndex - comHandIndex) % BUTTONS.length;

    await this.draw(
      `ぽい！\n${user.name} :${reactionType}:   COM :${BUTTONS[comHandIndex]}:\n` +
      (winOrLose === 0 ? 'あいこ' : `${user.name} の ${winOrLose === 1 ? 'まけ' : 'かち'}`)
    );
  }
}
module.exports = JankenGame;
