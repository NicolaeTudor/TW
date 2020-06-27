const express = require('express');
const fs = require('fs');

const gameRouter = express.Router();

//a random integer in the range [0, max)
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

const gameboard = {
  "height" : 384,
  "width" : 768
}

const badItems = {
  "startx" : 256,
  "starty" : 32,
  "size": 32,
  "nr" : 4
}

const goodItems = {
  "startx" : 0,
  "starty" : 64,
  "size": 32,
  "nr" : 4
}

gameRouter.route('/spawnItem')
          .get((req, res) => {
            console.log('here!');
              let type = getRandomInt(3);
              let posx;
              let posy;
              let coordx;
              let coordy;
              if(type <= 1) //good item
              {
                type = 0;
                posx = goodItems.startx + goodItems.size * getRandomInt(4);
                posy = goodItems.starty;
              }
              else
              {
                type = 1;
                posx = badItems.startx + badItems.size * getRandomInt(4);
                posy = badItems.starty;
              }

              coordx = getRandomInt(gameboard.width - goodItems.size + 1);
              coordy = getRandomInt(gameboard.height - goodItems.size + 1);

              let spawn = {
                type,
                posx,
                posy,
                coordx,
                coordy
              }

              console.log(spawn);
              res.send(spawn);
          });


gameRouter.route('/highscores')
          .get((req, res) => {
              var highscores = JSON.parse(fs.readFileSync('data/highscores.json'));
              res.send(highscores);
          });

gameRouter.route('/highscores')
          .put((req, res) => {
              score = req.body.score;
              username = req.body.username;
              date = req.body.date;
              let highscores = JSON.parse(fs.readFileSync('data/highscores.json'));
              let found = false;
              for(let i = 0; i < highscores.length; i++)
              {
                if(highscores[i].score < score)
                {
                  highscores.splice(i, 0, {score, username, date});
                  found = true;
                  break;
                }
              }
              if(!found)
              {
                highscores.push({score, username, date});
              }

              if(highscores.length > 25)
              {
                highscores.pop();
              }
              fs.writeFileSync('data/highscores.json', JSON.stringify(highscores), () => {});
              res.send(highscores);
          });

gameRouter.route('/highscores')
          .delete((req, res) => {
              console.log(req.body);
              if(req.body.username)
              {
                console.log("yep yepp!");
                let username = req.body.username;
                let highscores = JSON.parse(fs.readFileSync('data/highscores.json'));
                const filteredHighScores = highscores.filter(hs => hs.username != username);

                fs.writeFileSync('data/highscores.json', JSON.stringify(filteredHighScores), () => {});
              }
              else
              {
                fs.writeFileSync('data/highscores.json', JSON.stringify([]), () => {});
              }

              res.sendStatus(200);
          });

module.exports = gameRouter;