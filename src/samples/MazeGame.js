const _ = require('lodash');
const {Game} = require('../index.js');

const EMOJIS = {
  up    : 'arrow_up',
  down  : 'arrow_down',
  left  : 'arrow_left',
  right : 'arrow_right',
  player: 'runner',
  wall  : 'black_large_square',
  empty : 'mu',
  goal  : 'small_red_triangle_down',
  start : 'small_blue_diamond'
};
class MazeGame extends Game {
  getButtons() {
    return [EMOJIS.up, EMOJIS.down, EMOJIS.left, EMOJIS.right];
  }

  async drawMaze() {
    const left = Math.min(this.width - 7, Math.max(0, this.player.x - 3));
    const top = Math.min(this.height - 7, Math.max(0, this.player.y - 3));

    await this.draw(this.field.map((c, i) => {
      const x = i % this.width;
      const y = Math.floor(i / this.width);
      if (this.player.x === x && this.player.y === y) {
        return `:${EMOJIS.player}:`;
      }
      if (x === 1 &&  y === 1) {
        return `:${EMOJIS.start}:`;
      }
      if (x === this.width - 2 &&  y === this.height - 2) {
        return `:${EMOJIS.goal}:`;
      }

      if (c === 1) {
        return `:${EMOJIS.wall}:`;
      }
      return `:${EMOJIS.empty}:`;
    }).filter((c, i) => {
      const x = i % this.width;
      const y = Math.floor(i / this.width);
      return (x >= left && x < left + 7 && y >= top && y < top + 7);
    }).map((c, i) => {
      const x = i % 7;
      if (x === 6) {
        return c + '\n';
      }
      return c;
    }).join(''));
  }

  async initialize() {
    this.player = {x: 1, y: 1};
    this.width = 31;
    this.height = 31;
    // 0=floor、1=wall
    this.field = _.range(this.width * this.height).map(() => 0);
    for (let i = 0; i < this.field.length; i++) {
      const x = i % this.width;
      const y = Math.floor(i / this.width);
      if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
        this.field[x + y * this.width] = 1;
      } else if (x % 2 === 0 && y % 2 === 0) {
        this.field[x + y * this.width] = 1;

        const coords = [[x + 1, y], [x - 1, y], [x, y - 1], [x, y + 1]].filter(coord => {
          if (coord[0] < 0 || coord[0] >= this.width || coord[1] < 0 || coord[1] >= this.height) {
            return false;
          }
          return this.field[coord[0] + coord[1] * this.width] === 0;
        });

        const coord = coords[Math.floor(Math.random() * coords.length)];
        if (coord) {
          this.field[coord[0] + coord[1] * this.width] = 1;
        }
      }
    }

    await this.drawMaze();
  }

  async onPushButton(type) {
    const coord = {
      [EMOJIS.up]   : [0, -1],
      [EMOJIS.down] : [0, 1],
      [EMOJIS.left] : [-1, 0],
      [EMOJIS.right]: [1, 0]
    }[type];

    if (!coord) {
      return;
    }

    const newPlayer = {
      x: this.player.x + coord[0],
      y: this.player.y + coord[1]
    };
    if (this.field[newPlayer.x + newPlayer.y * this.width] !== 1) {
      this.player = newPlayer;
    }
    await this.drawMaze();
  }
}
module.exports = MazeGame;
