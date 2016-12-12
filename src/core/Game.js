const createLogger = require('./createLogger');

class Game {
  constructor(gamebot, gameKey, channel, ts) {
    this.gamebot = gamebot;
    this.channel = channel;
    this.ts = ts;
    this.name = `${gameKey}:${channel}:${ts}`;
    this.isFinished = false;
    this.logger = createLogger(this.name);
    this.logger.info(`New game created(${this.name}).`);
  }

  async draw(text) {
    if (this.isFinished) {
      return;
    }
    return await this.gamebot.update(this, text);
  }

  end() {
    this.isFinished = true;
    this.gamebot.endGame(this);
  }

  getButtons() {
    return [];
  }

  initialize(...args) {
    this.logger.info(`Initialize with [${JSON.stringify(args)}] !`);
  }

  onPushButton(reactionType, user) {
    this.logger.info(`${user.name} pushed button ${reactionType} !`);
  }
}
module.exports = Game;
