import { Cards, CardCategory } from "./cards";
import * as Helper from "./helper"
import * as CardIndex from "./cardIndex"
export class GameState {
    constructor(playerIds) {
        if (playerIds === undefined) return;
        // Init Players
        let playerCount = playerIds.length;
        if (playerCount < 2) { console.error("too little players"); }
        let startPhases = [CardCategory.Worker, CardCategory.Building, CardCategory.Aristocrat, CardCategory.Exchange];
        let randomStartPhases = Helper.shuffle(startPhases);
        let phaseChunksPerPlayer = new Map();
        phaseChunksPerPlayer.set(2, [2, 2])
        phaseChunksPerPlayer.set(3, Helper.shuffle([2, 1, 1]))
        phaseChunksPerPlayer.set(4, [1, 1, 1, 1])

        let startPhaseForPlayer = Helper.splitIntoChunks(randomStartPhases, phaseChunksPerPlayer.get(playerCount))

        for (let i = 0; i < playerCount; i++) {
            let p = new Player(startPhaseForPlayer[i], playerIds[i])
            this.players.push(p)
        }
        this.currentPlayerIndex = this.getBeginningPlayerIndexForPhase(CardCategory.Worker)

        // Init Cards
        this.drawCardsForNewPhase(true)
    }

    players = [];
    currentPlayerIndex = this.getBeginningPlayerIndexForPhase(CardCategory.Worker);
    phase = CardCategory.Worker;
    fieldTop = [];
    fieldBottom = [];
    cards = {
        [CardCategory.Worker]: CardIndex.INITIAL_WORKER,
        [CardCategory.Building]: CardIndex.INITIAL_BUILDINGS,
        [CardCategory.Aristocrat]: CardIndex.INITIAL_ARISTOCRATS,
        [CardCategory.Exchange]: CardIndex.INITIAL_EXCHANGE,
    };
    turns = [];
    isFinished = false;
    getBeginningPlayerIndexForPhase(phase) {
        return this.players.indexOf(this.players.find(p => (p.startPhases.includes(phase))));
    }
    drawCardsForNewPhase(initial) {
        // Todo Make random determined by seeds
        // todo add checks for end of game
        if (this.phase == CardCategory.Worker) {
            this.fieldBottom = this.fieldTop;
            this.fieldTop = [];
        }
        let drawAmount = initial ? this.players.length * 2 : 8 - (this.fieldTop.length + this.fieldBottom.length);
        let [newDeck, drawnCards] = Helper.randomFromArray(this.cards[this.phase], drawAmount);
        this.cards[this.phase] = newDeck;

        this.fieldTop = drawnCards.concat(this.fieldTop);

    }

    nextPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }

    removeCardFromGame(cardId) {
        let rmCard = c => (c !== cardId);
        this.fieldTop = this.fieldTop.filter(rmCard);
        this.fieldBottom = this.fieldBottom.filter(rmCard);
        for (let p of this.players) {
            p.handCards = p.handCards.filter(rmCard);
            p.field = p.field.filter(rmCard);
        }
    }

    // Public
    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex]
    }

    nextPhase() {
        for (const p of this.players) {
            p.phaseEvalutation(this);
        }
        this.phase = (this.phase + 1) % 4;
        if (this.phase == CardCategory.Worker) {
            let prevStartPhases = this.players.map(p => Array.from(p.startPhases))
            for (const [i, p] of this.players.entries()) {
                p.disabledCards = [];
                p.startPhases = prevStartPhases[(i + 1) % this.players.length]
            }
        }
        this.drawCardsForNewPhase(false);
        this.currentPlayerIndex = this.getBeginningPlayerIndexForPhase(this.phase);
    }

    nextStateAfterTurn(turn) {
        switch (turn.type) {
            case TurnType.Pass: {
                // check if new phase starts
                let newPhase = false
                if (this.turns.length >= this.players.length - 1) {
                    newPhase = true;
                    for (let i = 0; i < this.players.length - 1; i++) {
                        let prevTurn = this.turns[this.turns.length - 1 - i];
                        if (prevTurn.type != TurnType.Pass || prevTurn.nextPhase) {
                            newPhase = false
                        }
                    }
                }

                if (newPhase) {
                    turn.nextPhase = true;
                    this.nextPhase();
                } else {
                    this.nextPlayer();
                }

                break;
            }
            case TurnType.TakeCard: {
                this.removeCardFromGame(turn.cardId);
                this.getCurrentPlayer().handCards.push(turn.cardId);
                this.nextPlayer();
                break;
            }
            case TurnType.BuyCard: {
                // let playerCards = this.getCurrentPlayer().field;
                // // discount from dublicate cards
                // let discount = playerCards.filter(c => Cards.byId(c).type == Cards.byId(turn.cardId).type).length;
                // // discount from other cards
                // let buyCard = Cards.byId(turn.cardId);
                // discount += playerCards.filter(c => Cards.byId(c).discountCategory == buyCard.category).length;
                // let price = Math.max(buyCard.price - discount, 1)
                // console.log("Buying card, cost:", buyCard.price, " for:", price, " with discount:", discount)
                const curP = this.getCurrentPlayer();
                let price = curP.minPriceForCard(turn.cardId, this);
                this.removeCardFromGame(turn.cardId);
                if (turn.exchangeCardId !== undefined) {
                    // window.app
                    this.removeCardFromGame(turn.exchangeCardId);
                    price = curP.priceForExchangeCard(turn.cardId, this, turn.exchangeCardId);
                }
                curP.field.push(turn.cardId);
                curP.money -= price;
                this.nextPlayer();
                break;
            }
            case TurnType.ActivateCard: {
                let card = Cards.byId(turn.cardId);
                if (!card.activate) { console.log("could not activate card: ", card); return; }

                card.activate();
                this.getCurrentPlayer().disabledCards.push(turn.cardId);
                this.nextPlayer();
                break;
            }
        }
        this.turns.push(turn);
    }
    isCancelled() {
        let isFinished = this.isFinished
        let oneStackEmpty = false;
        for (let i = 0; i < 4; i++) {
            oneStackEmpty = this.cards[i].length == 0
        }
        let phaseIsExchange = this.phase == CardCategory.Exchange;
        return !(isFinished && oneStackEmpty && phaseIsExchange);
    }
}
export const TurnType = {
    Pass: "pass",
    TakeCard: 'takeCard',
    BuyCard: 'buyCard',
    ActivateCard: 'activateCard',
}
class Turn {
    type = "";
    cardId = "";
    exchangeCardId = "";
}
export class Player {
    constructor(startPhases, matrixId) {
        this.startPhases = startPhases;
        this.matrixId = matrixId
    }
    matrixId = "@id:server.domain"
    money = 25;
    points = 0;
    handCards = [];
    get handSize() { return this.field.map(c => Cards.byId(c).type).includes(CardIndex.CardType.WareHouse) ? 4 : 3 };
    field = [];
    startPhases = [];
    disabledCards = []
    phaseEvalutation(gameState) {
        if(gameState.phase == CardCategory.Exchange) return;
        let cardsToEvaluate = this.field
            .map((cardId) => { return Cards.byId(cardId) })
            .filter((card) => {
                return card.category === gameState.phase || card.upgradeCategory === gameState.phase
            });
        let m = 0;
        let p = 0;
        for (let c of cardsToEvaluate) {
            m += typeof c === 'function' ? c.money() : c.money;
            p += typeof p === 'function' ? p.point() : c.points;
        }
        this.money += m;
        this.points += p;
    }
    canTakeCard(cardId, gs) {
        if (Cards.byId(cardId) == undefined) return false;
        // check if card  if on one of the field
        let cardsPossibleToTake = gs.fieldBottom.concat(gs.fieldTop);
        let cardIsOnAccessibleField = cardsPossibleToTake.includes(cardId);

        // check if there is enough space in the player hand
        let handHasSpace = this.handCards.length < this.handSize;

        return cardIsOnAccessibleField && handHasSpace;
    }

    canBuyCard(cardId, gs, exchangeId) {
        if (Cards.byId(cardId) == undefined) return false;
        // check if card  if on one of the field
        let cardsPossibleToBuy = gs.fieldBottom.concat(gs.fieldTop).concat(this.handCards);
        let cardIsOnAccessibleField = cardsPossibleToBuy.includes(cardId);

        // check if card can be afforded
        let enoughMoney = this.money >= this.minPriceForCard(cardId, gs)

        let exchangeCardValid = true;
        let canBeExchanged = true;
        if (Cards.byId(cardId).category == CardCategory.Exchange) {
            let posExchanges = this.getPossibleUpgradesForCard(cardId);

            // is exchange card valid
            canBeExchanged = (exchangeId === undefined)
                ? posExchanges.length > 0
                : posExchanges.includes(exchangeId)
            // check if card can be afforded with the specific exchange card
            enoughMoney = (exchangeId === undefined)
                ? enoughMoney
                : this.money >= this.priceForExchangeCard(cardId, gs, exchangeId)
        }
        return cardIsOnAccessibleField && enoughMoney && exchangeCardValid && canBeExchanged;

    }
    canActivateCard(cardId, gs) {
        if (Cards.byId(cardId) == undefined) return false;
        // check if card  if on one of the field
        let cardIsOnAccessibleField = this.field.includes(cardId);

        // check if card has action
        let card = Cards.byId(cardId);
        let hasAction = !!card.action;

        // check if card is deactivated
        let cardIsNotDeactivated = !this.disabledCards.includes(cardId);
        return cardIsOnAccessibleField && hasAction && cardIsNotDeactivated;
    }
    getPossibleUpgradesForCard(cardId) {
        let card = Cards.byId(cardId);
        if (card.category == CardCategory.Exchange) {
            if (card.upgradeCategory == CardCategory.Worker) {
                return this.field.filter(c => card.upgradeCards.includes(Cards.byId(c).type));
            } else {
                return this.field.filter(c => (card.upgradeCategory == Cards.byId(c).category));
            }
        }
        return [];
    }
    discountsForCard(cardId, gs) {
        // discount from dublicate cards
        let discount = this.field.filter(c => Cards.byId(c)?.type == Cards.byId(cardId)?.type).length;

        // discount from other cards
        let buyCard = Cards.byId(cardId);
        discount += this.field.filter(c => Cards.byId(c).discountCategory == buyCard.category).length;

        // discount from fieldBottom
        discount += gs.fieldBottom.includes(cardId) ? 1 : 0;
        return discount
    }
    priceForExchangeCard(cardId, gs, exchangeId) {
        let discountTotal = Cards.byId(exchangeId).price + this.discountsForCard(cardId, gs);
        let price = Math.max(Cards.byId(cardId).price - discountTotal, 1)
        return price;
    }
    minPriceForCard(cardId, gs) {

        let discount = this.discountsForCard(cardId, gs);
        let buyCard = Cards.byId(cardId);
        if (buyCard.category == CardCategory.Exchange) {
            let exchangeOptions = this.getPossibleUpgradesForCard(cardId);
            let cheapestToUpgradeCardId = exchangeOptions.sort((a, b) => Cards.byId(b).price - Cards.byId(a).price)[0]
            discount += Cards.byId(cheapestToUpgradeCardId)?.price || 0;
        }
        let price = Math.max(buyCard.price - discount, 1)
        return price;
    }

}

export function getGameState(turns, initialGameState) {
    let gameState = initialGameState;
    for (let t of turns) {
        gameStateAfterTurn(t, gameState)
    }
    return gameState;
}

