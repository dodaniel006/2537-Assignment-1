let start = document.getElementById("start");
let reset = document.getElementById("reset");
let game = document.getElementById("game_grid");

document.getElementById("start").addEventListener("click", async function () {

  cards = [];

  let pokemonCount = 3;
  let rowCount = 2;

  for (let i = 0; i < rowCount; i++) {
    let row = document.createElement("div");
    row.classList.add("row");
    row.classList.add("mx-auto");
    row.id = `row_${i + 1}`;
    game.appendChild(row);
  }

  for (let i = 0; i < pokemonCount; i++) {
    let card = document.createElement("div");
    card.classList.add("card");
    let randomId = Math.floor(Math.random() * 1301) + 1;
    let result = await fetch(`https://pokeapi.co/api/v2/pokemon/?limit=1&offset=${randomId}`);
    let jsonObj = await result.json();

    await new Promise(resolve => setTimeout(resolve, 500));

    let response2 = await fetch(`https://pokeapi.co/api/v2/pokemon/${jsonObj.results[0].name}`);
    let jsonObj2 = await response2.json();
    console.log(jsonObj2);

    card.innerHTML = `<img src="${jsonObj2.sprites.other['official-artwork'].front_default}" alt="${jsonObj2.name}" class="front_face">
    <img class="back_face" src="back.webp" alt="">`;
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
      card.id = `img${cardIndex + 1}`;
      card.style.width = "150px";
      card.style.height = "150px";

      card.addEventListener("click", function () {
        flip(card.id);
      });

      row.appendChild(card);
      cardIndex++;
    }
  }
});

function flip(id) {
  let card = document.getElementById(id);
  card.classList.toggle("flip");
  console.log(id);
}

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