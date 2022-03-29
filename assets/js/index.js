const handEl = document.getElementById("hand");

const hcpEl = document.getElementById("hcp");
const lengthPointsEl = document.getElementById("length-points");

const biddingInputEl = document.getElementById("bidding-input");

const userBidEl = document.getElementById("user-bid");
const userMsgEl = document.getElementById("user-msg");

userBidEl.textContent = " ";
userMsgEl.textContent = " ";

const canvasEl = document.getElementById("canvas");

let bidRankEl,
  bidStrainEl,
  alreadyBid = false; // to process bidding entry

const CLUBS = 0,
  DIAMONDS = 1,
  HEARTS = 2,
  SPADES = 3;

const suitArray = ["C", "D", "H", "S"];
const suitSymbolArray = ["&clubs", "&diams", "&hearts", "&spades"];

function Card(cardNum) {
  let suitNum = Math.floor(cardNum / 13); // 0,1,2,3
  let rank = (cardNum % 13) + 2; // num in 2-14

  return {
    suitNum,
    suitCode: suitArray[suitNum],
    suitSymbol: suitSymbolArray[suitNum],
    rank,
    name: rank < 10 ? rank : ["T", "J", "Q", "K", "A"][rank - 10], // Cards: 23456789TJQKA
  };
}

function Hand(suitArray) {
  let hcp = getAndDisplayHCP(suitArray);
  let lengthPoints = getAndDisplayLengthPoints(suitArray);
  return {
    suitArray,
    hcp,
    lengthPoints,
  };
}

function getAndDisplayCards() {
  function getCards(cardCount = 13) {
    let numArray = [];
    let cardArray = [];
    while (numArray.length < cardCount) {
      let newNum = Math.floor(Math.random() * 52); // a random number from 0-51
      while (numArray.includes(newNum)) {
        // no repeats allowed
        newNum = Math.floor(Math.random() * 52); // a random number from 0-51
      }
      numArray.push(newNum);
      cardArray.push(Card(newNum));
    }

    return cardArray.sort((a, b) =>
      a.suitNum === b.suitNum ? b.rank - a.rank : a.suitNum - b.suitNum
    );
  }

  let cardArray = getCards();

  let suitArray = [[], [], [], []];
  cardArray.forEach((card) => suitArray[card.suitNum].push(card));

  // now display the visual cards

  let handHTML = "";
  for (let st = 0; st < suitArray.length; st++) {
    let suit = suitArray[[SPADES, HEARTS, CLUBS, DIAMONDS][st]]; // order the suits this way.
    for (let cd = 0; cd < suit.length; cd++) {
      let card = suit[cd];
      let color =
        card.suitNum === CLUBS || card.suitNum === SPADES ? "black" : "red";
      handHTML += `
      <div class="card-holder">
      <div class="card ${color}">
        <div class="card-top">
          <span class="bottom">${card.name}</span>
          <span class="top">${card.suitSymbol};</span>
        </div>
        <h1 class="card-mid">${card.suitSymbol};</h1>
        <div class="card-bottom">
        <span class="bottom">${card.name}</span>
        <span class-"top">${card.suitSymbol};</span>
        </div>
        </div>
      </div>`;
    }
  }

  handEl.innerHTML = handHTML;
  return suitArray;
}

function getAndDisplayHCP(suitArray) {
  let hcp = suitArray.reduce(
    (suitHcp, cards, idx, array) =>
      suitHcp +
      cards.reduce((cardHcp, card) => cardHcp + Math.max(0, card.rank - 10), 0),
    0
  );

  hcpEl.textContent += hcp;
  return hcp;
}

function getAndDisplayLengthPoints(suitArray) {
  let lengthPoints = suitArray.reduce(
    (total, cards) => total + Math.max(0, cards.length - 4),
    0
  );
  lengthPointsEl.textContent += lengthPoints;
  return lengthPoints;
}

function openingBid(hand) {
  if (hand.hcp + hand.lengthPoints >= 22) return "2C";

  if (hand.hcp + hand.lengthPoints > 12) {
    if (hand.suitArray.filter((suit) => suit.length < 2)?.length)
      // unbalanced Hand
      return oneSuitBid(hand);

    if (hand.suitArray.filter((suit) => suit.length === 2)?.length > 1) {
      if (hand.hcp === 20 || hand.hcp === 21)
        return semiBalancedNT(hand, 2) ? "2N" : oneSuitBid(hand);
      if (hand.hcp > 14 && hand.hcp < 18)
        return semiBalancedNT(hand, 1) ? "1N" : oneSuitBid(hand);
      return oneSuitBid(hand);
    }

    // balanced hands
    if (hand.hcp === 20 || hand.hcp === 21) return "2N";
    if (hand.hcp > 14 && hand.hcp < 18) return "1N";

    return oneSuitBid(hand);

    function oneSuitBid(hand) {
      let spadeCount = hand.suitArray[3].length;
      let heartCount = hand.suitArray[2].length;
      let diamondCount = hand.suitArray[1].length;
      let clubCount = hand.suitArray[0].length;

      if (heartCount > 4 && heartCount > spadeCount) return "1H";
      if (spadeCount > 4) return "1S";
      if (diamondCount > clubCount) return "1C";
      if (diamondCount === clubCount) return diamondCount === 3 ? "1C" : "1D";

      return "1C";
    }

    function semiBalancedNT(hand, bid = 1) {
      if (hand.suitArray.filter((suit) => suit.length > 5)?.length)
        return false; // don't bid NT with a 6-card suit

      if (bid === 1) {
        let longSuits = hand.suitArray.filter((suit) => suit.length > 2);
        if (longSuits[0].length > longSuits[1].length) return true; // don't force a reverse situation, just bid 1N
      }

      // require an A or K in both doubletons when considering 2N; allow Qx in both when considering 1N
      hand.suitArray.forEach((cards) => {
        if (
          cards.length === 2 &&
          cards.reduce((count, card) => count + max(0, rank - 10), 0) < bid + 1
        )
          return false;
      });

      return true;
    }
  }

  // is there a possible preempt?
  let longSuits = hand.suitArray.filter((suit) => suit.length > 5);
  if (
    longSuits?.length === 1 &&
    longSuits[0].reduce((total, card) => total + (card.rank > 11 ? 1 : 0), 0) >
      1
  ) {
    // if 2 of top 3
    let bid = `${longSuits[0].length - 4}${longSuits[0][0].suitCode}`;
    if (bid === "2C") return "PASS";
    return bid;
  }

  // if (longSuits?.length === 2) {

  return "PASS";
}

let hand = Hand(getAndDisplayCards());

// let myBid = openingBid(hand);
// userMsgEl.textContent = `I would ${myBid === "PASS" ? myBid : "bid " + myBid}`;

function buttonClick() {
  console.log("HI!");
  event.preventDefault();
  console.log(this);
  userMsgEl.textContent = this.textContent;
}

function createBiddingButtons() {
  buttonHTML = "";
  for (button = 1; button < 8; button++) {
    buttonHTML += makeButton(button);
  }
  buttonHTML += "</br>";

  buttonHTML += makeButton("C");
  buttonHTML += makeButton("D");
  buttonHTML += makeButton("H");
  buttonHTML += makeButton("S");
  buttonHTML += makeButton("NT");

  buttonHTML += "</br>";

  buttonHTML += makeButton("PASS");
  buttonHTML += makeButton("X");
  buttonHTML += makeButton("XX");

  biddingInputEl.innerHTML = buttonHTML;

  function makeButton(txt) {
    return `<button class="bidding-button" id='${txt}'>${txt}</button>`;
  }
}

createBiddingButtons();

let buttonEls = document.getElementsByClassName("bidding-button");

for (idx = 0; idx < buttonEls.length; idx++) {
  buttonEls[idx].addEventListener("click", handleBiddingButtons);
}

function handleBiddingButtons() {
  if (alreadyBid) {
    console.log("Ignoring click as bid already made");
    return;
  }

  if (this.id == "X" || this.id == "XX")
    return (userBidEl.textContent = `Doubles have not yet been implemented`);

  if (this.id == "PASS") {
    alreadyBid = true;
    if (bidRankEl) bidRankEl.classList.remove("button-selected");
    if (bidStrainEl) bidStrainEl.classList.remove("button-selected");
    bidRankEl = null;
    bidStrainEl = null;
    console.log(userBidEl);
    userBidEl.textContent = "Your bid was 'PASS'";
    this.classList.add("button-selected");

    displayMyBid();

    render();

    return;
  }

  if (["1", "2", "3", "4", "5", "6", "7"].includes(this.id)) {
    if (bidRankEl === this) {
      this.classList.remove("button-selected");
      return (bidRankEl = null);
    }

    if (bidRankEl) {
      bidRankEl.classList.remove("button-selected");
      bidRankEl = this;
      bidRankEl.classList.add("button-selected");
      return;
    }

    bidRankEl = this;
    bidRankEl.classList.add("button-selected");
  } else {
    if (bidStrainEl === this) {
      this.classList.remove("button-selected");
      return (bidStrainEl = null);
    }

    if (bidStrainEl) {
      bidStrainEl.classList.remove("button-selected");
      bidStrainEl = this;
      bidStrainEl.classList.add("button-selected");
      return;
    }

    bidStrainEl = this;
    bidStrainEl.classList.add("button-selected");
  }

  if (bidStrainEl && bidRankEl) {
    alreadyBid = true;
    userBidEl.textContent = "Your bid: " + bidRankEl.id + bidStrainEl.id;

    displayMyBid();

    render();

    return;
  }

  function displayMyBid() {
    let myBid = openingBid(hand);
    userMsgEl.textContent = `I would ${
      myBid === "PASS" ? myBid : "bid " + myBid
    }`;
    canvasEl.style.zIndex = 9;
  }
}

/*********************************************************************************************/
/*                                  C O N F E T T I   L O G I C                              */
/*********************************************************************************************/

//-----------Var Inits--------------
canvas = document.getElementById("canvas");
ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
cx = ctx.canvas.width / 2;
cy = ctx.canvas.height / 2;

let confetti = [];
const confettiCount = 300;
const gravity = 0.5;
const terminalVelocity = 5;
const drag = 0.075;
const colors = [
  { front: "red", back: "darkred" },
  { front: "green", back: "darkgreen" },
  { front: "blue", back: "darkblue" },
  { front: "yellow", back: "darkyellow" },
  { front: "orange", back: "darkorange" },
  { front: "pink", back: "darkpink" },
  { front: "purple", back: "darkpurple" },
  { front: "turquoise", back: "darkturquoise" },
];

//-----------Functions--------------
resizeCanvas = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  cx = ctx.canvas.width / 2;
  cy = ctx.canvas.height / 2;
};

randomRange = (min, max) => Math.random() * (max - min) + min;

initConfetti = () => {
  for (let i = 0; i < confettiCount; i++) {
    confetti.push({
      color: colors[Math.floor(randomRange(0, colors.length))],
      dimensions: {
        x: randomRange(10, 20),
        y: randomRange(10, 30),
      },

      position: {
        x: randomRange(0, canvas.width),
        y: canvas.height - 1,
      },

      rotation: randomRange(0, 2 * Math.PI),
      scale: {
        x: 1,
        y: 1,
      },

      velocity: {
        x: randomRange(-25, 25),
        y: randomRange(0, -50),
      },
    });
  }
};

//---------Render-----------
render = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  confetti.forEach((confetto, index) => {
    let width = confetto.dimensions.x * confetto.scale.x;
    let height = confetto.dimensions.y * confetto.scale.y;

    // Move canvas to position and rotate
    ctx.translate(confetto.position.x, confetto.position.y);
    ctx.rotate(confetto.rotation);

    // Apply forces to velocity
    confetto.velocity.x -= confetto.velocity.x * drag;
    confetto.velocity.y = Math.min(
      confetto.velocity.y + gravity,
      terminalVelocity
    );
    confetto.velocity.x += Math.random() > 0.5 ? Math.random() : -Math.random();

    // Set position
    confetto.position.x += confetto.velocity.x;
    confetto.position.y += confetto.velocity.y;

    // Delete confetti when out of frame
    if (confetto.position.y >= canvas.height) confetti.splice(index, 1);

    // Loop confetto x position
    if (confetto.position.x > canvas.width) confetto.position.x = 0;
    if (confetto.position.x < 0) confetto.position.x = canvas.width;

    // Spin confetto by scaling y
    confetto.scale.y = Math.cos(confetto.position.y * 0.1);
    ctx.fillStyle =
      confetto.scale.y > 0 ? confetto.color.front : confetto.color.back;

    // Draw confetti
    ctx.fillRect(-width / 2, -height / 2, width, height);

    // Reset transform matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  });

  // Fire off another round of confetti
  if (confetti.length <= 10) initConfetti();

  window.requestAnimationFrame(render);
};

//---------Execution--------
initConfetti();
// render();

//----------Resize----------
window.addEventListener("resize", function () {
  resizeCanvas();
});

// ------------Click------------
// window.addEventListener("click", function () {
//   console.log(event.target.id);
// });
