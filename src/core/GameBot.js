const {WebClient, RtmClient, CLIENT_EVENTS, RTM_EVENTS} = require('@slack/client');
const promisify = require('es6-promisify');

const createLogger = require('./createLogger');

const REGEXP_GAME_KEY = /^(\w+)(\s|$)/;
class GameBot {
  constructor(games) {
    this.games = games;
    this.gameInstances = {};
    this.webClient = null;
    this.rtmClient = null;
    this.logger = createLogger('slack-game-bot');
  }

  async createGameInstance(message) {
    try {
      if (this.rtmClient.activeUserId === message.user || message.bot_id) {
        return;
      }

      const match = message.text && message.text.match(REGEXP_GAME_KEY);
      if (!match || !this.games[match[1]]) {
        return;
      }

      // post blank message.
      const res1 = await promisify(this.webClient.chat.postMessage, this.webClient.chat)(
        message.channel,
        ' ',
        {as_user: true}
      );
      this.logger.trace('Message sent: ', res1);

      const gameKey = match[1];
      const gameInstance = new this.games[gameKey](this, gameKey, res1.channel, res1.ts);
      this.gameInstances[`${res1.channel}:${res1.ts}`] = gameInstance;

      const args = message.text.split(/\s+/);
      await gameInstance.initialize(...args);

      // add reactions as buttons.
      for (const type of gameInstance.getButtons()) {
        const res2 = await promisify(this.webClient.reactions.add, this.webClient.reactions)(type, {
          channel  : res1.channel,
          timestamp: res1.ts
        });
        this.logger.trace('Reaction add: ', res2);
      }
    } catch(e) {
      this.logger.error('Error:', e.message);
    }
  }

  async onPushButton(message) {
    if (this.rtmClient.activeUserId === message.user) {
      return;
    }

    const instanceKey = `${message.item.channel}:${message.item.ts}`;

    if (!this.gameInstances[instanceKey]) {
      return;
    }
    const gameInstance = this.gameInstances[instanceKey];
    const user = this.rtmClient.dataStore.getUserById(message.user);
    gameInstance.logger.debug(`${user.name} push ${message.reaction}.`);
    try {
      await gameInstance.onPushButton(message.reaction, user);
    } catch(e) {
      this.logger.error('Error:', e.message);
    }
  }

  async update(gameInstance, text) {
    try {
      this.logger.trace('Update game:', gameInstance);
      // update message with text.
      const res = await promisify(this.webClient.chat.update, this.webClient.chat)(
        gameInstance.ts,
        gameInstance.channel,
        text,
        {as_user: true}
      );
      this.logger.trace('Message update: ', res);
    } catch(e) {
      this.logger.error('Error:', e.message);
    }
  }

  endGame(gameInstance) {
    this.gameInstances[`${gameInstance.channel}:${gameInstance.ts}`] = null;
  }

  run(token = process.env.SLACK_BOT_TOKEN) {
    if (this.rtmClient) {
      throw new Error('Gamebot already running.');
    }

    this.webClient = new WebClient(token);
    this.rtmClient = new RtmClient(token, {autoReconnect: true});

    this.rtmClient.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
      const user = this.rtmClient.dataStore.getUserById(this.rtmClient.activeUserId);
      const team = this.rtmClient.dataStore.getTeamById(this.rtmClient.activeTeamId);
      this.logger.info(`Connected to ${team.name} as ${user.name}(${user.id}).`);
    });

    this.rtmClient.on(RTM_EVENTS.MESSAGE, message => {
      this.logger.trace('MESSAGE:', message);
      this.createGameInstance(message);
    });

    this.rtmClient.on(RTM_EVENTS.REACTION_ADDED, message => {
      this.logger.trace('REACTION_ADDED:', message);
      this.onPushButton(message);
    });

    this.rtmClient.on(RTM_EVENTS.REACTION_REMOVED, message => {
      this.logger.trace('REACTION_REMOVED:', message);
      this.onPushButton(message);
    });

    this.rtmClient.start();
  }

  stop() {
    if (!this.rtmClient) {
      throw new Error('Gamebot not running.');
    }
    this.rtmClient.disconnect();
    this.webClient = null;
    this.rtmClient = null;
  }
}
module.exports = GameBot;
