const suitArray = ["C", "D", "H", "S"];
const suitSymbolArray = ["&clubs", "&diams", "&hearts", "&spades"];

function Card(cardNum) {
  //2-14, 15-27, 28-40, 41-53 ... -2
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

function findRank(card) {
  switch (card) {
    case "2":
      return 2;
    case "3":
      return 3;
    case "4":
      return 4;
    case "5":
      return 5;
    case "6":
      return 6;
    case "7":
      return 7;
    case "8":
      return 8;
    case "9":
      return 9;
    case "10":
      return 10;
    case "J":
      return 11;
    case "Q":
      return 12;
    case "K":
      return 13;
    case "A":
      return 14;
  }
}
let fixedCards = {
  spades: ["Q", "6"],
  hearts: ["K", "Q", "10", "9", "5", "4"],
  diamonds: ["J", "7", "6"],
  clubs: ["Q", "6"],
};

let suits = [[], [], [], []];
fixedCards.spades.forEach((card) => suits[3].push(Card(37 + findRank(card))));
fixedCards.hearts.forEach((card) => suits[2].push(Card(24 + findRank(card))));
fixedCards.diamonds.forEach((card) => suits[1].push(Card(11 + findRank(card))));
fixedCards.clubs.forEach((card) => suits[0].push(Card(-2 + findRank(card))));

let hand = { suitArray: suits };

function getBid() {
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
}

console.log(getBid());
