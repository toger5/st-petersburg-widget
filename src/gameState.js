import { Cards, CardCategory } from "./cards";
import * as Helper from "./helper"
import * as CardIndex from "./cardIndex"
import App from "./App";
const stringHash = require("string-hash");

export class GameState {
    constructor(playerIds) {
        if (!playerIds || playerIds === []) return;
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
    isGameOver = false;
    isPlayedToEnd = false;
    sender = "";
    
    getBeginningPlayerIndexForPhase(phase) {
        return this.players.indexOf(this.players.find(p => (p.startPhases.includes(phase))));
    }
    drawCardsForNewPhase(initial) {
        // todo add checks for end of game
        if (this.phase == CardCategory.Worker) {
            this.fieldBottom = this.fieldTop;
            this.fieldTop = [];
        }
        let drawAmount = initial ? this.players.length * 2 : 8 - (this.fieldTop.length + this.fieldBottom.length);
        let [newDeck, drawnCards] = Helper.randomFromArray(this.cards[this.phase], drawAmount, initial ? undefined : this.seed);
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
                    if(this.hasEmptyDeck() && (this.phase == CardCategory.Exchange)){
                        // the game is over!
                        for(let p of this.players){
                            p.aristocratPoints()
                        }
                        this.isGameOver = true;
                        this.isPlayedToEnd = true;
                        // make the final point calculations for aristocrats!
            
                    }else{
                        turn.nextPhase = true;
                        this.nextPhase();
                    }
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
                const curP = this.getCurrentPlayer();

                let price = curP.minPriceForCard(turn.cardId, this);
                if (turn.exchangeCardId != null) {
                    price = curP.priceForExchangeCard(turn.cardId, this, turn.exchangeCardId);
                    this.removeCardFromGame(turn.exchangeCardId);
                }

                this.removeCardFromGame(turn.cardId);
                curP.field.push(turn.cardId);
                curP.money -= price;
                this.nextPlayer();
                break;
            }
            case TurnType.ActivateCard: {
                let card = Cards.byId(turn.cardId);
                if (!card.action) { console.log("could not activate card: ", card); return; }
                card.action(this, turn);
                this.getCurrentPlayer().disabledCards.push(turn.cardId);
                this.nextPlayer();
                break;
            }
        }
        this.turns.push(turn);
    }
    isCancelled() {
        return this.isGameOver && !this.isPlayedToEnd;
    }
    hasEmptyDeck(){
        let oneStackEmpty = false;
        for (let i = 0; i < 4; i++) {
            if(this.cards[i].length == 0) {oneStackEmpty = true};
        }
        return oneStackEmpty;
    }

    getSendObj(){
        let sendObj = App.cloneGameState(this);
        delete sendObj.seed;
        delete sendObj.sender;
        console.log("sendObj: ", sendObj)
        return sendObj;
    }

    getHash(){
        return stringHash(JSON.stringify(this.getSendObj()));
    }

    static createGameStateHistory(startState, turns){
        let gs = App.cloneGameState(startState);
        gs.seed = startState.getHash();
        let states = [App.cloneGameState(gs)]
        for(let t of turns){
            let prevStateHash = gs.getHash();
            gs.nextStateAfterTurn(t);
            states.push(App.cloneGameState(gs));
            gs.seed = prevStateHash;
        }
        return states;
    }
    static gameSummary(startState, turns){
        let playerSummarys = []
        for(let p of startState.players){
            playerSummarys.push({
                points: 0,
                money: 0,
                pointsFromMoney: 0,
                matrixId: p.matrixId,
                pointsWorker: 0,
                moneyWorker: 0,
                pointsBuildings: 0,
                moneyBuildings: 0,
                pointsAristocrats: 0,
                moneyAristocrats: 0,
                pointsFinalAristocrats: 0,
                countFinalAristocrats: 0,
                pointsFinalHandCards: 0,
                countFinalHandCards: 0,
            });
        }
        const history = GameState.createGameStateHistory(startState, turns);
        for(let i = 0; i < history.length;i++){
            let gs = history[i];
            let prevGs;
            if(i > 1){prevGs = history[i-1];}
            if(prevGs){
                for(const [pIndex, p] of playerSummarys.entries()){
                    if(prevGs.phase != gs.phase && !gs.isGameOver){
                        switch(prevGs.phase){
                            case CardCategory.Worker:
                                p.moneyWorker += gs.players[pIndex].money - prevGs.players[pIndex].money;
                                p.pointsWorker += gs.players[pIndex].points - prevGs.players[pIndex].points;
                            break;
                            case CardCategory.Building:
                                p.moneyBuildings += gs.players[pIndex].money - prevGs.players[pIndex].money;
                                p.pointsBuildings += gs.players[pIndex].points - prevGs.players[pIndex].points;
                            break;
                            case CardCategory.Aristocrat:
                                p.moneyAristocrats += gs.players[pIndex].money - prevGs.players[pIndex].money;
                                p.pointsAristocrats += gs.players[pIndex].points - prevGs.players[pIndex].points;
                            break;
                        }
                    }
                    if(gs.isGameOver){
                        p.pointsFinalAristocrats = gs.players[pIndex].points - prevGs.players[pIndex].points;
                        p.countFinalAristocrats = gs.players[pIndex].aristocratsCount();
                        p.countFinalHandCards = gs.players[pIndex].handCards.length;
                        p.pointsFinalHandCards = -5 * p.pointsFinalHandCards;
                        p.pointsFromMoney = Math.floor(gs.players[pIndex].money/10);
                        p.points = gs.players[pIndex].points + p.pointsFromMoney + p.pointsFinalHandCards;
                        p.money = gs.players[pIndex].money;
                    }
                }
            }
        }

        return {
            amountTurns: turns.length,
            playerSummarys: playerSummarys.sort((a,b)=>b.points-a.points) // sorted so that the winner is the first player in the list
        };
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
    getSortedField(){
        return [...this.field].sort((cIdA, cIdB) => {
            const [cA, cB] = [Cards.byId(cIdA), Cards.byId(cIdB)]
            const categoryA = cA.category == CardCategory.Exchange ? cA.upgradeCategory :cA.category;
            const categoryB = cB.category == CardCategory.Exchange ? cB.upgradeCategory :cB.category;
            return ((categoryA * 1000) + cIdA) - ((categoryB * 1000) + cIdB)
        });
    }
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
            m += typeof c.money === 'function' ? c.money(this) : c.money;
            p += typeof p.points === 'function' ? c.points(this) : c.points;
        }
        this.money += m;
        this.points += p;
        this.disabledCards = [];
    }
    aristocratsCount(){
        let aristocrats = this.field.filter((cardId)=>{
            let card = Cards.byId(cardId);
            return card.category == CardCategory.Aristocrat || 
                (card.category == CardCategory.Exchange && card.upgradeCategory == CardCategory.Aristocrat);
        })
        let aristocratsByType = aristocrats.map(a=> Cards.byId(a).type);
        const aristocratSet = new Set(aristocratsByType);
        return Array.from(aristocratSet).length;
    }
    aristocratPoints(){
        let ariCount = this.aristocratsCount();
        this.points += Math.min((ariCount + 1) * (ariCount/2), 55)
    }
    canTakeCard(cardId, gs, skipFieldCheck) {
        if (!Cards.byId(cardId)) return false;
        // check if card  if on one of the field
        let cardsPossibleToTake = gs.fieldBottom.concat(gs.fieldTop);
        let cardIsOnAccessibleField = cardsPossibleToTake.includes(cardId);
        
        // check if there is enough space in the player hand
        let handHasSpace = this.handCards.length < this.handSize;

        return (cardIsOnAccessibleField || skipFieldCheck) && handHasSpace;
    }

    canBuyCard(cardId, gs, exchangeId, skipFieldCheck) {
        if (!Cards.byId(cardId)) return false;
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
            canBeExchanged = (exchangeId == null)
                ? posExchanges.length > 0
                : posExchanges.includes(exchangeId)
            // check if card can be afforded with the specific exchange card
            enoughMoney = (exchangeId == null)
                ? enoughMoney
                : this.money >= this.priceForExchangeCard(cardId, gs, exchangeId)
        }
        return (cardIsOnAccessibleField || skipFieldCheck) && enoughMoney && exchangeCardValid && canBeExchanged;

    }
    canActivateCard(cardId, gs) {
        if (!Cards.byId(cardId)) return false;
        // check if card  if on one of the field
        let cardIsOnAccessibleField = this.field.includes(cardId);

        // check if card has action
        let card = Cards.byId(cardId);
        let hasAction = !!card.action;
        // check if the phase matches with the card
        let cardCategory = (Cards.byId(cardId).category == CardCategory.Exchange ? Cards.byId(cardId).upgradeCategory : Cards.byId(cardId).category)
        let phaseMatches = (gs.phase == cardCategory)
        // check if card is deactivated
        let cardIsNotDeactivated = !this.disabledCards.includes(cardId);
        return cardIsOnAccessibleField && hasAction && cardIsNotDeactivated && phaseMatches;
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
        let buyCardCategory = buyCard.category == CardCategory.Exchange ? buyCard.upgradeCategory : buyCard.category;
        discount += this.field.filter(c => Cards.byId(c).discountCategory == buyCardCategory).length;

        // discount from fieldBottom
        discount += gs.fieldBottom.includes(cardId) ? 1 : 0;
        return discount
    }
    
    priceForExchangeCard(cardId, gs, exchangeId) {
        const exchangeCardWorth = Cards.byId(exchangeId).exchangePrice ?? Cards.byId(exchangeId).price
        let discountTotal = exchangeCardWorth + this.discountsForCard(cardId, gs);
        let price = Math.max(Cards.byId(cardId).price - discountTotal, 1)
        return price;
    }
    
    minPriceForCard(cardId, gs) {
        let discount = this.discountsForCard(cardId, gs);
        let buyCard = Cards.byId(cardId);
        let price = Math.max(buyCard.price - discount, 1)
        if (buyCard.category == CardCategory.Exchange) {
            let exchangeOptions = this.getPossibleUpgradesForCard(cardId);
            let cheapestExchangeCardId = exchangeOptions.sort((a, b) =>{
                return this.priceForExchangeCard(cardId,gs,a) - this.priceForExchangeCard(cardId,gs,b)
            } )[0]
            if(cheapestExchangeCardId){
                price = this.priceForExchangeCard(cardId, gs, cheapestExchangeCardId);
            }
        }
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

