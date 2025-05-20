let container = document.getElementById("game");
let clicks = document.getElementById("clicks");
let total = document.getElementById("total");
let remaining = document.getElementById("remaining");
let matched = document.getElementById("matched");
let easy = document.getElementById("easy");
let medium = document.getElementById("medium");
let hard = document.getElementById("hard");
let start = document.getElementById("start");
let reset = document.getElementById("reset");
let timer = document.getElementById("timer");
let game = document.getElementById("game_grid");
document.getElementById("powerupContainer").style.visibility = "hidden";

let rendered = false;
let pokemonCount = 0;
let rowCount = 0;
let colCount = 0;
let gameDifficulty = null;

let gameRunning = false;
let time = 0;
let countdown = 0;
let cardsClicked = 0;
let cardsMatched = 0;
let powerupCount = 1;

async function renderGame(pokemon, row, col, gameTime) {

  rendered = true;
  pokemonCount = pokemon;
  rowCount = row;
  colCount = col;
  time = gameTime;
  let cards = [];
  let loading = true;
  loadingScreen();
  timer.innerHTML = `<h5 class="mb-0 text-primary">Time: <span class="fw-bold">${time}</span></h5>`;
  total.innerHTML = `<h6 class="mb-0 text-primary">Total Number of Pairs: <span class="fw-bold">${pokemonCount}</span></h6>`;
  remaining.innerHTML = `<h6 class="mb-0 text-primary">Number of Pairs Remaining: <span class="fw-bold">${pokemonCount}</span></h6>`;

  let result = await fetch(`https://pokeapi.co/api/v2/pokemon/?limit=1302`);
  let jsonObj = await result.json();

  for (let i = 0; i < pokemonCount; i++) {
    let card = document.createElement("div");
    card.classList.add(`img_${i + 1}`);
    card.classList.add("pokeCard");
    card.classList.add("mx-2");

    let index = Math.floor(Math.random() * jsonObj.results.length);

    let jsonObj2;
    while (true) {
      try {
        let response2 = await fetch(`https://pokeapi.co/api/v2/pokemon/${jsonObj.results[index].name}`);
        if (response2.status === 429) {
          // Too Many Requests, wait and try again
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        jsonObj2 = await response2.json();
        break;
      } catch (err) {
        // Network or other error, wait and try again
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    console.log(jsonObj2);

    card.innerHTML = `<img src="${jsonObj2.sprites.other['official-artwork'].front_default}" alt="${jsonObj2.name}" class="front_face">
      <img class="back_face" src="back.webp" alt="Pokeball">`;

    cards.push(card);

    await new Promise(resolve => setTimeout(resolve, 100));
  }
  loading = false;
  if (game.innerHTML != "") {
    game.innerHTML = "";
  }

  for (let i = 0; i < rowCount; i++) {
    let row = document.createElement("div");
    row.classList.add("row");
    row.classList.add("mx-auto");
    row.id = `row_${i + 1}`;
    game.appendChild(row);
  }

  // Duplicate each card to have pairs
  let cardPairs = [...cards, ...cards];

  // Shuffle the cardPairs array
  for (let i = cardPairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
  }

  // Insert shuffled cards into rows (2 rows, 3 cards per row)
  let cardIndex = 0;
  for (let rowNum = 1; rowNum <= rowCount; rowNum++) {
    let row = document.getElementById(`row_${rowNum}`);
    for (let colNum = 0; colNum < colCount; colNum++) {
      let card = cardPairs[cardIndex].cloneNode(true);
      card.id = `card_${cardIndex + 1}`;

      // Pass the first class (e.g., "img_1", "img_2", etc.) to flip instead of the id
      let className = card.classList[0];

      card.addEventListener("click", function () {
        flip(card.id, className);
      });

      row.appendChild(card);
      cardIndex++;
    }
  }

  document.getElementById("powerupContainer").style.visibility = "visible";
  gameRunning = true;
  startTimer();

  async function loadingScreen() {
    dots = 0;
    while (loading) {
      dots = (dots) % 3 + 1;
      let loading = "<h1>Loading" + ".".repeat(dots) + "</h1>";
      game.innerHTML = loading;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

}

let flipCount = 0;
let selectedCards = [];
let finishedCards = [];
let flipping = false;

async function flip(id, className) {

  if (gameRunning) {
    if (finishedCards.includes(id)) {
      console.log("That card is already finished.");
    } else {

      if (flipping || document.getElementById(id).classList.length >= 4) {
        console.log("Already Flipped!");
      } else {

        cardsClicked++;
        clicks.innerHTML = `<h6 class="mb-0 text-primary">Number of Clicks: <span class="fw-bold">${cardsClicked}</span></h6>`;

        flipping = true;

        console.log(`flipping: `, id);
        selectedCards.push({ id, className });

        let card = document.getElementById(id);
        card.classList.toggle("flip");
        flipCount++;

        if (flipCount % 2 == 0) {
          let flip1 = selectedCards.pop();
          let flip2 = selectedCards.pop();
          console.log(flip1, flip2);

          let card1 = document.getElementById(flip1.id);
          let card2 = document.getElementById(flip2.id);

          if (flip1.className == flip2.className) {
            finishedCards.push(flip1.id, flip2.id);
            cardsMatched++;
            remaining.innerHTML = `<h6 class="mb-0 text-primary">Number of Pairs Remaining: <span class="fw-bold">${pokemonCount - cardsMatched}</span></h6>`;
            matched.innerHTML = `<h6 class="mb-0 text-primary">Number of Pairs Matched: <span class="fw-bold">${cardsMatched}</span></h6>`;
            console.log("That's a match!");
            if (card1) card1.classList.add("matched");
            if (card2) card2.classList.add("matched");
          } else {
            await new Promise(resolve => setTimeout(resolve, 1500));
            if (card1) flipCard(card1);
            if (card2) flipCard(card2);

          }

          if (finishedCards.length >= pokemonCount * 2) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            gameRunning = false;
            alert("You've matched all of the cards! You win!");
          }
        }
        flipping = false;
      }
    }
  }

}

function flipCard(card) {
  card.classList.toggle("flip");
}

async function startTimer() {
  countdown = time;

  await new Promise(resolve => setTimeout(resolve, 1000));

  while (gameRunning) {

    if (countdown <= 0 && gameRunning) {
      gameRunning = false;
      alert("You ran out of time! Game over.");
    } else if (gameRunning) {
      console.log("subtracting");
      countdown--;
      timer.innerHTML = `<h5 class="mb-0 text-primary">Time: <span class="fw-bold">${countdown}</span></h5>`;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function resetGame() {
  gameRunning = false;
  game.innerHTML = "<h3>Loading...</h3>";
  timer.innerHTML = `<h5 class="mb-0 text-primary">Time: <span class="fw-bold">${time}</span></h5>`;
  matched.innerHTML = `<h6 class="mb-0 text-primary">Number of Pairs Matched: <span class="fw-bold">0</span></h6>`;
  clicks.innerHTML = `<h6 class="mb-0 text-primary">Number of Clicks: <span class="fw-bold">0</span></h6>`;
  rendered = false;
  flipping = false;
  flipCount = 0;
  cardsClicked = 0;
  cardsMatched = 0;
  powerupCount = 1;
  document.getElementById("powerupCount").innerText = `${powerupCount} use(s) remaining`;
  document.getElementById("powerupContainer").style.visibility = "hidden";
  selectedCards = [];
  finishedCards = [];
  gameStats = getDifficultyStats();
  renderGame(gameStats.numPokemon, gameStats.numRows, gameStats.numCols, gameStats.time);
}

async function flipPowerup() {
  powerupCount--;
  let cardsToFlip = document.querySelectorAll(".pokeCard:not(.matched)");
  for (card of cardsToFlip) {
    flipCard(card);
  }
  await new Promise(resolve => setTimeout(resolve, 2000));
  for (card of cardsToFlip) {
    flipCard(card);
  }
}

function getDifficultyStats() {
  if (gameDifficulty == "easy") {
    return { numPokemon: 3, numRows: 2, numCols: 3, time: 30 };
  } else if (gameDifficulty == "medium") {
    return { numPokemon: 6, numRows: 3, numCols: 4, time: 40 };
  } else if (gameDifficulty == "hard") {
    return { numPokemon: 10, numRows: 4, numCols: 5, time: 50 };
  }
}

function setDifficulty(difficulty, element) {
  if (gameDifficulty == null) {
    gameDifficulty = difficulty;
    element.classList.toggle("selected");
  } else if (gameDifficulty == difficulty) {
    gameDifficulty = null;
    element.classList.toggle("selected");
  }
}

easy.addEventListener("click", async function () {
  setDifficulty("easy", easy);
});

medium.addEventListener("click", async function () {
  setDifficulty("medium", medium);
});

hard.addEventListener("click", async function () {
  setDifficulty("hard", hard);
});

start.addEventListener("click", async function () {
  if (rendered) {
    alert("Game already started");
  } else if (!gameDifficulty) {
    alert("You haven't selected a difficulty!");
  } else {
    gameStats = getDifficultyStats();
    renderGame(gameStats.numPokemon, gameStats.numRows, gameStats.numCols, gameStats.time);
  }
});

reset.addEventListener("click", async function () {
  if (!rendered) {
    alert("There is no active game instance");
  } else {
    resetGame();
  }
});

document.getElementById("powerup").addEventListener("click", function () {
  if (powerupCount > 0) {
    flipPowerup();
    document.getElementById("powerupCount").innerText = `${powerupCount} use(s) remaining`;
  }
});

document.getElementById("darkModeToggle").addEventListener("click", function () {
  document.body.classList.toggle("dark-mode");
});