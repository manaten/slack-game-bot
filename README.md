# slack-game-bot
A bot framework for slack gaming.

# usage

```js
const {Game, GameBot} = require('slack-game-bot');

class MyGame extends Game {
  getButtons() {
    return ['one', 'two', 'three'];
  }

  async initialize() {
    await this.draw('press button!');
  }

  async onPushButton(reactionType) {
    await this.draw(reactionType);
  }
}

new GameBot({
  myGame: MyGame,
}).run(process.env.SLACK_TOKEN);
```

![mygame.gif (320×240)](http://manaten.net/wp-content/uploads/2016/12/mygame.gif)

For more information, read below samples.

# sample games

## Janken

![janken.gif (320×240)](http://manaten.net/wp-content/uploads/2016/12/janken.gif)

## Slot

![slot.gif (320×240)](http://manaten.net/wp-content/uploads/2016/12/slot.gif)

## Soukoban

![soukoban.gif (320×320)](http://manaten.net/wp-content/uploads/2016/12/soukoban.gif)

## Maze

![maze.gif (320×320)](http://manaten.net/wp-content/uploads/2016/12/maze.gif)

# LICENSE

MIT.
