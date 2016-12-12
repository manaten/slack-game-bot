const _ = require('lodash');
const {Game} = require('../index.js');

const PATTERN = [
  'apple', 'seven', 'bell', 'lemon'
];

const wait = msec => new Promise(resolve => setTimeout(resolve, msec));

class SlotGame extends Game {
  getButtons() {
    return ['radio_button'];
  }

  async drawSlot() {
    const digit1 = Math.floor(this.numbers / 16);
    const digit2 = Math.floor(this.numbers / 4) % 4;
    const digit3 = this.numbers % 4;
    await this.draw(`:${PATTERN[digit1]}::${PATTERN[digit2]}::${PATTERN[digit3]}:`);
  }

  initialize() {
    this.stop = false;

    (async () => {
      while(!this.stop) {
        this.numbers = _.random(0, 4 * 4 * 4);
        await this.drawSlot();
        await wait(500);
      }
    })();
  }

  onPushButton() {
    this.stop = true;
    this.end();
  }
}
module.exports = SlotGame;
