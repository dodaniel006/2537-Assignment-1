// const { select } = require("async");

let start = document.getElementById("start");
let reset = document.getElementById("reset");
let game = document.getElementById("game_grid");

let rendered = false;
let pokemonCount = 0;

async function renderGame(pokemon, row) {
  rendered = true;

  cards = [];

  pokemonCount = pokemon;
  let rowCount = row;

  for (let i = 0; i < rowCount; i++) {
    let row = document.createElement("div");
    row.classList.add("row");
    row.classList.add("mx-auto");
    row.id = `row_${i + 1}`;
    game.appendChild(row);
  }

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
}

let flipCount = 0;
let selectedCards = [];
let finishedCards = [];

function flip(id, className) {

  if (!finishedCards.includes(id)) {
    console.log(`flipping: `, id);
    selectedCards.push({ id, className });
    let card = document.getElementById(id);
    card.classList.toggle("flip");
    flipCount++;
  } else {
    console.log("That card is already finished.")
  }

  if (flipCount % 2 == 0) {
    let flip1 = selectedCards.pop();
    let flip2 = selectedCards.pop();
    console.log(flip1, flip2);
    if (flip1.className == flip2.className) {
      finishedCards.push(flip1.id, flip2.id);
      console.log("That's a match!");
    } else {
      setTimeout(() => {
        let card1 = document.getElementById(flip1.id);
        let card2 = document.getElementById(flip2.id);
        if (card1) card1.classList.toggle("flip");
        if (card2) card2.classList.toggle("flip");
      }, 3000);
    }

    if (finishedCards.length >= pokemonCount * 2) {
      setTimeout(() => {
        alert("You've matched all of the cards! You win!");
      }, 1000);

    }
  }


}

document.getElementById("start").addEventListener("click", async function () {
  if (rendered) {
    alert("Game already started");
    return;
  } else {
    renderGame(3, 2)
  }
});

// function setup () {
//   let firstCard = undefined
//   let secondCard = undefined
//   $(".card").on(("click"), function () {
//     $(this).toggleClass("flip");

//     if (!firstCard)
//       firstCard = $(this).find(".front_face")[0]
//     else {
//       secondCard = $(this).find(".front_face")[0]
//       console.log(firstCard, secondCard);
//       if (
//         firstCard.src
//         ==
//         secondCard.src
//       ) {
//         console.log("match")
//         $(`#${firstCard.id}`).parent().off("click")
//         $(`#${secondCard.id}`).parent().off("click")
//       } else {
//         console.log("no match")
//         setTimeout(() => {
//           $(`#${firstCard.id}`).parent().toggleClass("flip")
//           $(`#${secondCard.id}`).parent().toggleClass("flip")
//         }, 1000)
//       }
//     }
//   });
// }

// $(document).ready(setup)