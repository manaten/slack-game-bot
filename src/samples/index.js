const {GameBot} = require('../');

const JankensGame = require('./JankensGame');
const MazeGame = require('./MazeGame');
const SlotGame = require('./SlotGame');
const SoukobanGame = require('./SoukobanGame');

new GameBot({
  janken  : JankensGame,
  maze    : MazeGame,
  slot    : SlotGame,
  soukoban: SoukobanGame
}).run();
