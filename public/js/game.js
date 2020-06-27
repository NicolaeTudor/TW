const mainSpace = document.getElementById("mainSpace");
const asideSpace = document.getElementById("asideSpace");
const gameBtn = document.getElementById("gameBtn");
const url = '/game';

gameBtn.onclick = initializeGame;
let ChampBgPositionX = 320; //start position for the image slicer
let gameboard;
let player;
let keppAnimating = false;
let scoreValue;
let highScoresDiv;
let Items = Array();

let mouseX, 
    mouseY,
    xp,
    yp,
    combo = 1;

let tID;


function rectRect(r1x, r1y, r1s, r2x, r2y, r2s) {

    // are the sides of one rectangle touching the other?
    
    if (r1x + r1s >= r2x &&    // r1 right edge past r2 left
        r1x <= r2x + r2s &&    // r1 left edge past r2 right
        r1y + r1s >= r2y &&    // r1 top edge past r2 bottom
        r1y <= r2y + r2s)      // r1 bottom edge past r2 top
    { 
            console.log("ouch!");
            return true;
    }
    return false;
}

function animate(){
    if(mainSpace.classList.contains('gameSpace') && keppAnimating == true)
    {
        requestAnimationFrame(animate);
        xp += ~~((mouseX - xp) / 12);
        yp += ~~((mouseY - yp) / 12);
        player.style.left = xp + 'px';
        player.style.top= yp + 'px';
        for( let lane =  ~~(yp / 32), cnt = 3; cnt > 0; lane++, cnt--)
        {
            if(lane > 11) return;
            for(let i = 0; i < Items.length; i++)
            {
                let item = Items[i];
                if(rectRect(item.coordx + 8, item.coordy + 8, 16, xp + 16, yp + 16, 32))
                {
                    if(item.type == 0)
                    {
                        scoreValue.textContent = Number(scoreValue.textContent) + combo;
                        if(combo < 5)
                        { combo += 1; }
                        item.domItem.remove();
                        Items.splice(i, 1);
                    }
                    else
                    {
                        clearInterval(tID);
                        while (gameboard.firstChild) {
                            gameboard.removeChild(gameboard.lastChild);
                        }
                        gameboard.removeEventListener("click", getClickPosition);
                        gameboard.textContent = "GAME OVER!";
                        player = undefined;
                        setTimeout(() => {
                            gameboard.addEventListener("click", startGame);                  
                        }, 2000);

                        keppAnimating = false;
                        addHighScore();
                    }
                    return;
                }
            }
        }
    }
}

function Create2DArray(rows) {
    var arr = [];
  
    for (var i = 0; i < rows; i++) {
       arr[i] = [];
    }
  
    return arr;
}

// Helper function to get an element's exact position
function getPosition(el) {
    var xPos = 0;
    var yPos = 0;
   
    while (el) {
      if (el.tagName == "BODY") {
        // deal with browser quirks with body/window/document and page scroll
        var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
        var yScroll = el.scrollTop || document.documentElement.scrollTop;
   
        xPos += (el.offsetLeft - xScroll + el.clientLeft);
        yPos += (el.offsetTop - yScroll + el.clientTop);
      } else {
        // for all other non-BODY elements
        xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
        yPos += (el.offsetTop - el.scrollTop + el.clientTop);
      }
   
      el = el.offsetParent;
    }
    return {
      x: xPos,
      y: yPos
    };
}

function getClickPosition(e) {
    if(e.target.classList.contains('collectibleItem'))
    {
        return;
    }
    var parentPosition = getPosition(gameboard);
    mouseX = e.clientX - parentPosition.x - (player.clientWidth / 2);
    mouseY = e.clientY - parentPosition.y - (player.clientHeight / 2);

    if(xp > mouseX) { player.classList.add("flip"); }
    else            { player.classList.remove('flip'); }

    combo = 1;
    console.log(getDateAsString());
}

function onClickRemoveItem(event) {
    if( Number(scoreValue.textContent) > 0)
    {
        scoreValue.textContent = Number(scoreValue.textContent) - 1;
        deleteItem(this);
    }
    else
    {
        scoreValue.style.backgroundColor = "red";
        setTimeout(() => {
            scoreValue.style.backgroundColor = "";                  
        }, 500);

    }
    //event.stopPropagation();
}

function deleteItem(el) {
    let index = Items.findIndex(i => i.domItem == el);
    if(index > -1)
    {
        Items.splice(index, 1);
        el.remove();
    }   
}

function spawnItems() {

    const  interval = 500;
    tID = setInterval ( () => {
            if(!mainSpace.classList.contains('gameSpace'))
            {
                clearInterval(tID);
            }
            else
            {
                fetch(url + '/spawnItem', {
                    method: 'get',
                    headers: { "Content-Type": "application/json" }
                  })
                  .then((resp) => resp.json())
                  .then((data) => {
                    let spawnable = document.createElement("div");
                    spawnable.classList.add('collectibleItem');
                    spawnable.style.backgroundPosition = `-${data.posx}px -${data.posy}px`;
                    spawnable.dataset.type = data.type;
                    spawnable.addEventListener("click", onClickRemoveItem);
                    gameboard.appendChild(spawnable);
                    spawnable.style.left = `${data.coordx}px`;
                    spawnable.style.top = `${data.coordy}px`;
                    data.domItem = spawnable;
                    Items.push(data);
                    setTimeout(() => {
                        deleteItem(spawnable);                   
                    }, 7000);
                  })
                  .catch(function(error) {
                     console.log('oh no!:(');
                     console.log(JSON.stringify(error));
                  });
            }     
        } 
        , interval
    ); //end of setInterval
}

function startGame()
{
    gameboard.removeEventListener("click", startGame);
    if(document.getElementById("usernameGame"))
    {
        if(document.getElementById("usernameGame").value)
        {
            document.getElementById("usernameShow").textContent = document.getElementById("usernameGame").value;
        }
    }
    gameboard.textContent = '';
    player = document.createElement('div');
    player.id = "player";
    player.classList.add("character");
    player.style.backgroundPosition = `-${ChampBgPositionX}px 0px`;
    gameboard.appendChild(player);
    gameboard.addEventListener("click", getClickPosition);
    scoreValue.textContent = 0;
    mouseX = 352;
    mouseY = 160;
    xp = 352;
    yp = 160;
    Items = Array();
    keppAnimating = true;
    spawnItems();
    animate();
}

function changeChamp(ChampBgPositionX)
{
    document.getElementById("selectedChampion").style.backgroundPosition = `-${ChampBgPositionX}px 0px`;
    if(player)
    {
        player.style.backgroundPosition = `-${ChampBgPositionX}px 0px`;
    }
}

function swapChamp(e)
{
    let selectedChampion = document.getElementById("selectedChampion");

    if(this.classList.contains('left'))
    {
        if (ChampBgPositionX >= 64)
        { ChampBgPositionX = ChampBgPositionX - 64;}
        else
        { ChampBgPositionX = 64 * 9; }
    }
    else
    {
        if (ChampBgPositionX < 10 * 64)
        { ChampBgPositionX = ChampBgPositionX + 64;}
        else
        { ChampBgPositionX = 64; }
    }
    
    changeChamp(ChampBgPositionX);
}


function initializeGame()
{
    while (mainSpace.firstChild) {
        mainSpace.removeChild(mainSpace.lastChild);
    }

    mainSpace.classList.remove(...mainSpace.classList);
    mainSpace.classList.add("gameSpace");

    let gameDiv = document.createElement('div');
    gameDiv.id = "gameDiv";

    let gameMenu = document.createElement('div');
    gameMenu.id = "gameMenu";

    let selectChampionDiv = document.createElement('div');
    selectChampionDiv.id = "selectChampionDiv";

    let selectedChampionDiv = document.createElement('div');
    selectedChampionDiv.id = "selectedChampionDiv";

    let leftSwapChampion= document.createElement('button');
    leftSwapChampion.classList.add("swap", "left");
    leftSwapChampion.textContent = "◄";
    leftSwapChampion.addEventListener("click", swapChamp);

    let rightSwapChampion= document.createElement('button');
    rightSwapChampion.classList.add("swap", "right");
    rightSwapChampion.textContent = "►";
    rightSwapChampion.addEventListener("click", swapChamp);

    let selectedChampion = document.createElement('p');
    selectedChampion.id = "selectedChampion";
    selectedChampion.classList.add("character");

    let scoreDiv = document.createElement('div');
    scoreDiv.id = "scoreDiv";

    let scoreLabel = document.createElement('div');
    scoreLabel.id - "scoreLabel";
    scoreLabel.textContent = "Score: ";

    scoreValue = document.createElement('div');
    scoreValue.id = "scoreValue";
    scoreValue.textContent = "0";

    let usernameShow = document.createElement('div');
    usernameShow.id = "usernameShow";
    usernameShow.textContent = "guest";

    gameboard = document.createElement('div');
    gameboard.id = "gameboard";

    let labelName = document.createElement('label');
    labelName.htmlFor = "usernameGame";
    labelName.textContent = "username:";

    let usernameGame = document.createElement('input');
    usernameGame.id = "usernameGame";

    let startGameBtn = document.createElement('button');
    startGameBtn.id = "startGameBtn";
    startGameBtn.textContent = "start game";
    startGameBtn.addEventListener("click", startGame);

    let highScoresArea = document.createElement('div');
    highScoresArea.id = "highScoresArea";

    let highScoresMenu = document.createElement('div');
    highScoresMenu.id = "highScoresMenu";

    let showHighScoresBtn = document.createElement('button');
    showHighScoresBtn.id = "showHighScoresBtn";
    showHighScoresBtn.textContent = "show highscores";
    showHighScoresBtn.addEventListener('click', showHighScores);

    let resetHighScoresBtn = document.createElement('button');
    resetHighScoresBtn.id = "resetHighScoresBtn";
    resetHighScoresBtn.textContent = "reset highscores";
    resetHighScoresBtn.addEventListener('click', resetHighScores);

    let usernameToDelete = document.createElement('input');
    usernameToDelete.id = "usernameToDelete";

    let deleteUserHighScoresBtn = document.createElement('button');
    deleteUserHighScoresBtn.id = "deleteUserHighScoresBtn";
    deleteUserHighScoresBtn.textContent = "delete # highscores";
    deleteUserHighScoresBtn.addEventListener('click', deleteUserHighScores);


    highScoresDiv = document.createElement('div');
    highScoresDiv.id = "highScoresDiv";

    highScoresMenu.appendChild(showHighScoresBtn);
    highScoresMenu.appendChild(resetHighScoresBtn);
    highScoresMenu.appendChild(usernameToDelete);
    highScoresMenu.appendChild(deleteUserHighScoresBtn);
    highScoresArea.appendChild(highScoresMenu);
    highScoresArea.appendChild(highScoresDiv);

    gameboard.appendChild(labelName);
    gameboard.appendChild(usernameGame);
    gameboard.appendChild(startGameBtn);

    selectedChampionDiv.appendChild(selectedChampion);

    selectChampionDiv.appendChild(leftSwapChampion);
    selectChampionDiv.appendChild(selectedChampionDiv);
    selectChampionDiv.appendChild(rightSwapChampion);

    scoreDiv.appendChild(scoreLabel);
    scoreDiv.appendChild(scoreValue);

    gameMenu.appendChild(selectChampionDiv);
    gameMenu.appendChild(scoreDiv);
    gameMenu.appendChild(usernameShow);

    gameDiv.appendChild(gameMenu);
    gameDiv.appendChild(gameboard);

    mainSpace.appendChild(gameDiv);
    mainSpace.appendChild(highScoresArea);
    
    //animateScript();
}

function getDateAsString()
{
    var currentdate = new Date(); 
    var datetime =  currentdate.getFullYear() + "/"
                    + (((currentdate.getMonth() + 1 ) < 10) ? "0" : "")
                    + (currentdate.getMonth() + 1)  + "/" 
                    + ((currentdate.getDate() < 10) ? "0" : "")
                    + currentdate.getDate();

    return datetime;
}

function showHighScores()
{
    while (highScoresDiv.firstChild) {
        highScoresDiv.removeChild(highScoresDiv.lastChild);
    }

    fetch(url + '/highscores', {
        method: 'get',
        headers: { "Content-Type": "application/json" }
      })
      .then((resp) => resp.json())
      .then((data) => {
        data.forEach(highscore => {
            let highscoreDiv = document.createElement('div');
            highscoreDiv.classList.add('highscore');
            let username = document.createElement('div');
            username.textContent = highscore.username;
            let score = document.createElement('div');
            score.textContent = highscore.score
            let date = document.createElement('div');
            date.textContent = highscore.date
            highscoreDiv.appendChild(username);
            highscoreDiv.appendChild(score);
            highscoreDiv.appendChild(date);
            highScoresDiv.appendChild(highscoreDiv);
        });
      })
      .catch(function(error) {
         console.log('oh no!:(');
         console.log(JSON.stringify(error));
      });
}

function addHighScore()
{
    const newScore = {
        username: document.getElementById("usernameShow").textContent,
        score: Number(scoreValue.textContent),
        date : getDateAsString()
    }

    fetch(url + '/highscores', {
        method: 'put',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newScore)
    });
}

function resetHighScores()
{
    fetch(url + '/highscores', {
        headers: { "Content-Type": "application/json" },
        method: 'delete'
    })
    .then(() => {
        showHighScores();
    });   
}

function deleteUserHighScores()
{
    const targetUsername = {
        username: document.getElementById("usernameToDelete").value
    }

    fetch(url + '/highscores', {
        method: 'delete',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(targetUsername)
    })
    .then(() => {
        showHighScores();
    });   
}