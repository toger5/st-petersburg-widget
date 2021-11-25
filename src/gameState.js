import { Cards, CardCategory } from "./cards";
import * as Helper from "./helper"
import * as InitialCards from "./cardIndex"
export class GameState {
    constructor(playerCount) {
        if (playerCount === undefined) return;
        // Init Players
        let startPhases = [CardCategory.Worker, CardCategory.Building, CardCategory.Aristocrat, CardCategory.Exchange];
        let randomStartPhases = Helper.shuffle(startPhases);
        let phaseChunksPerPlayer = new Map();
        phaseChunksPerPlayer.set(2, [2, 2])
        phaseChunksPerPlayer.set(3, Helper.shuffle([2, 1, 1]))
        phaseChunksPerPlayer.set(4, [1, 1, 1, 1])

        let startPhaseForPlayer = Helper.splitIntoChunks(randomStartPhases, phaseChunksPerPlayer.get(playerCount))

        for (let i = 0; i < playerCount; i++) {
            let p = new Player(startPhaseForPlayer[i])
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
        [CardCategory.Worker]: InitialCards.INITIAL_WORKER,
        [CardCategory.Building]: InitialCards.INITIAL_BUILDINGS,
        [CardCategory.Aristocrat]: InitialCards.INITIAL_ARISTOCRATS,
        [CardCategory.Exchange]: InitialCards.INITIAL_EXCHANGE,
    };
    turns = [];

    getBeginningPlayerIndexForPhase(phase) {
        return this.players.indexOf(this.players.find(p => (p.startPhases.includes(phase))));
    }
    drawCardsForNewPhase(initial) {
        // Todo Make random determined by seeds
        // todo add checks for end of game
        let drawAmount = initial ? this.players.length * 2 : 8 - this.fieldTop.length;
        let [newDeck, drawnCards] = Helper.randomFromArray(this.cards[this.phase], drawAmount);
        this.cards[this.phase] = newDeck;
        this.fieldBottom = this.fieldTop;
        this.fieldTop = drawnCards;
    }
    nextPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }

    // Public
    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex]
    }
    nextPhase() {
        for (let p of this.players) {
            p.phaseEvalutation(this)
        }
        this.phase = (this.phase + 1) % 4;
        this.drawCardsForNewPhase(false)
        this.currentPlayer = this.getBeginningPlayerIndexForPhase(this.phase);
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
                } else
                    this.nextPlayer();

                break;
            }
            case TurnType.TakeCard: {
                this.getCurrentPlayer().handcards.push(turn.card);
                this.nextPlayer();
            }
            case TurnType.BuyCard: {
                let playerCards = this.getCurrentPlayer().field;
                // discount from dublicate cards
                let discount = playerCards.filter(c => c == turn.card).length;
                // discount from other cards
                let buyCard = Cards[turn.card];
                discount += playerCards.filter(c => Cards[c].discount == buyCard.category).length;
                let price = Math.min(buyCard.price - discount, 1)
                console.log("Buying card, cost:", buyCard.price, " for:", price, " with discount:", discount)
                this.getCurrentPlayer().money -= price;
                this.getCurrentPlayer().field.push(turn.card);
                this.nextPlayer();
            }
            case TurnType.ActivateCard: {
                let card = Cards[turn.card];
                card.activate();
                this.getCurrentPlayer().disabledCards.push(turn.card);
                this.nextPlayer();
            }
        }
        this.turns.push(turn);
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
    card = "";
}
export class Player {
    constructor(startPhases) {
        this.startPhases = startPhases;
    }
    matrixId = "@id:server.domain"
    money = 25;
    points = 0;
    handCards = [];
    handSize = 3;
    field = [];
    startPhases = [];
    phaseEvalutation(gameState) {
        let cardsToEvaluate = this.field.map((cardType) => { return Cards[cardType] }).filter((card) => { return card.category === gameState.phase })
        let m = 0;
        let p = 0;
        for (let c of cardsToEvaluate) {
            m += typeof c === 'function' ? c.money() : c.money;
            p += typeof p === 'function' ? p.point() : c.points;
        }
        this.money += m;
        this.points += p;
    }
}

export function getGameState(turns, initialGameState) {
    let gameState = initialGameState;
    for (let t of turns) {
        gameStateAfterTurn(t, gameState)
    }
    return gameState;
}

