let start = document.getElementById("start");
let reset = document.getElementById("reset");
let timer = document.getElementById("timer");
let clicks = document.getElementById("clicks");
let total = document.getElementById("total");
let remaining = document.getElementById("remaining");
let matched = document.getElementById("matched");
let game = document.getElementById("game_grid");

let rendered = false;
let pokemonCount = 0;
let rowCount = 0;
let gameDifficulty = "";

let gameRunning = false;
let time = 0;
let countdown = 0;
let cardsClicked = 0;
let cardsMatched = 0;
let timerPromise = null;

function startTimer() {
  countdown = time;
  return new Promise(async (resolve) => {
    while (gameRunning) {

      await new Promise(resolve => setTimeout(resolve, 1000));

      if (countdown <= 0 && gameRunning) {
        gameRunning = false;
        alert("You ran out of time! Game over.");
      } else if (gameRunning) {
        console.log("subtracting");
        countdown--;
        timer.innerHTML = `<h1>Time: ${countdown}</h1>`;
      }

    }
    resolve();
  });

}

async function renderGame(pokemon, row, difficulty) {

  rendered = true;
  gameDifficulty = difficulty;
  pokemonCount = pokemon;
  rowCount = row;
  let cards = [];

  game.innerHTML = "<h1>Loading...</h1>";
  timer.innerHTML = `<h1>Time: ${time}</h1>`;
  total.innerHTML = `<h3>Total Number of Pairs: ${pokemonCount}</h3>`;
  remaining.innerHTML = `<h3>Number of Pairs Remaining: ${pokemonCount}</h3>`;


  let result = await fetch(`https://pokeapi.co/api/v2/pokemon/?limit=1302`);
  let jsonObj = await result.json();

  for (let i = 0; i < pokemonCount; i++) {
    let card = document.createElement("div");
    card.classList.add(`img_${i + 1}`);
    card.classList.add("card");
    let index = Math.floor(Math.random() * jsonObj.results.length);

    let response2 = await fetch(`https://pokeapi.co/api/v2/pokemon/${jsonObj.results[index].name}`);
    let jsonObj2 = await response2.json();
    console.log(jsonObj2);

    card.innerHTML = `<img src="${jsonObj2.sprites.other['official-artwork'].front_default}" alt="${jsonObj2.name}" class="front_face">
      <img class="back_face" src="back.webp" alt="Pokeball">`;

    cards.push(card);

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  game.innerHTML = "";

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

    for (let col = 0; col < pokemonCount; col++) {
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
  gameRunning = true;
  timerPromise = startTimer();
}

let flipCount = 0;
let selectedCards = [];
let finishedCards = [];
let flipping = false;

async function flip(id, className) {

  if (finishedCards.includes(id)) {
    console.log("That card is already finished.");
  } else {

    if (flipping || document.getElementById(id).classList.length >= 3) {
      console.log("Already Flipped!");
    } else {

      cardsClicked++;
      clicks.innerHTML = `<h3>Number of Clicks: ${cardsClicked}</h3>`;

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

        if (flip1.className == flip2.className) {
          finishedCards.push(flip1.id, flip2.id);
          cardsMatched++;
          remaining.innerHTML = `<h3>Number of Pairs Remaining: ${pokemonCount - cardsMatched}</h3>`;
          matched.innerHTML = `<h3>Number of Pairs Matched: ${cardsMatched}</h3>`;
          console.log("That's a match!");

        } else {
          await new Promise(resolve => setTimeout(resolve, 1500));
          let card1 = document.getElementById(flip1.id);
          let card2 = document.getElementById(flip2.id);
          if (card1) card1.classList.toggle("flip");
          if (card2) card2.classList.toggle("flip");
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

async function resetGame() {
  gameRunning = false;
  game.innerHTML = "<h1>Loading...</h1>";
  if (timerPromise) await timerPromise;
  timer.innerHTML = `<h1>Time: ${time}</h1>`;
  matched.innerHTML = `<h3>Number of Pairs Matched: 0`;
  clicks.innerHTML = `<h3>Number of Clicks: 0</h3>`;
  rendered = false;
  flipping = false;
  flipCount = 0;
  cardsClicked = 0;
  cardsMatched = 0;
  selectedCards = [];
  finishedCards = [];
  renderGame(pokemonCount, rowCount, gameDifficulty);
}

document.getElementById("start").addEventListener("click", async function () {
  if (rendered) {
    alert("Game already started");
    return;
  } else {
    time = 30;
    renderGame(3, 2, "easy");
  }
});

document.getElementById("reset").addEventListener("click", async function () {
  if (!rendered) {
    alert("There is no active game instance");
  } else {
    resetGame();
  }
});
