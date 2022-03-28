const handEl = document.getElementById("hand");

const hcpEl = document.getElementById("hcp");
const lengthPointsEl = document.getElementById("length-points");

const biddingInputEl = document.getElementById("bidding-input");

const userMsgEl = document.getElementById("user-msg");

let bidSuitEl, bidStrainEl; // to process bidding entry

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
        console.log("Fixing Duplicate: " + newNum);
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
  let longSuits = hand.suitArray.filter((suit) => suit.length > 5)?.length;
  if (longSuits?.length === 1) {
    if (longSuits[0].reduce((total, card) => total + card.rank > 11, 0) > 1) {
      // if 2 of top 3
      let bid = `${longSuits[0].length - 4}${longSuits[0].suitCode}`;
      if (bid === "2C") return "PASS";
      return bid;
    }
  }

  // if (longSuits?.length === 2) {

  return "PASS";
}

let hand = Hand(getAndDisplayCards());

let myBid = openingBid(hand);
userMsgEl.textContent = `I would ${myBid === "PASS" ? myBid : "bid " + myBid}`;

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
  if (this.id == "X" || this.id == "XX")
    return (userMsgEl = `Doubles have not yet been implemented`);

  if (this.id == "PASS") {
    disableBiddingButtons();
    userMsgEl = "Your bid was 'PASS'";
    return;
  }

  userMsgEl = `Still working on implementing the rank/strain bids`;
}
