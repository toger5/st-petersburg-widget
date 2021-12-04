import React, { Component } from "react";
import { CardCategory, Cards } from "./cards";
import "./Field.css";
import { TurnType } from "./gameState";
export function Card(props) {
    let curP = props.currentPlayer;
    let cardOwnerPlayer = props.cardOwnerPlayer;
    let gs = props.gs;
    let cardId = props.cardId;
    let cardObj = Cards.byId(cardId);
    let skipFieldChecks = props.skipFieldChecks ?? false;
    let cardGotActivatedInThisRound = cardOwnerPlayer?.disabledCards.includes(cardId);
    
    let onCardTake = curP?.canTakeCard(cardId, gs, skipFieldChecks)
    ? props.onCardTake?.bind(null, cardId) : null;

    let onCardBuy = curP?.canBuyCard(cardId, gs, undefined, skipFieldChecks)
        ? props.onCardBuy?.bind(null, cardId) : null;
    
    let onCardActivate = curP?.canActivateCard(cardId, gs)
        ? props.onCardActivate?.bind(null, cardId) : null;

    let onCardDiscard = props.onCardDiscard?.bind(null, cardId);
    let style = {};
    if (cardObj) {
        style.backgroundImage = `url(${cardObj.image})`;
    }
    let cardSelector = props.cardSelector;
    let selectable = cardSelector?.optionCardIds.includes(cardId);
    return <div className={"card" + (selectable ? " selectable" : "")} style={style}>
        {(cardObj && !cardSelector) &&
            <>
                {onCardBuy && <button onClick={onCardBuy}>Buy</button>}
                {onCardTake && <button onClick={onCardTake}>Take</button>}
                {onCardDiscard && <button onClick={onCardDiscard}>Discard</button>}
                {onCardActivate && <button onClick={onCardActivate}>Activate</button>}
                {cardGotActivatedInThisRound && <div className="Activated">🚫</div>}
            </>
        }
        {selectable &&
            <button onClick={cardSelector.onSelect.bind(null, cardId)}>Select</button>
        }


    </div>
}

function CardFieldRow(props) {
    let cardIds = props.cardIds;
    let currentPlayer = props.currentPlayer;
    let gs = props.gs;
    let onCardBuy = props.onCardBuy;
    let onCardTake = props.onCardTake;
    let onCardActivate = props.onCardActivate;
    let cardSelector = props.cardSelector;

    return <div className={"CardFieldRow" + " " + (props.className || "")}>
        {cardIds.map(
            (cardId, index) => {
                return <Card
                    cardId={cardId}
                    currentPlayer={currentPlayer}
                    gs={gs}
                    onCardBuy={onCardBuy}
                    onCardTake={onCardTake}
                    onCardActivate={onCardActivate}
                    key={index}
                    cardSelector={cardSelector}
                    cardOwnerPlayer={props.cardOwnerPlayer}
                />
            }
        )}
    </div>
}

function createCardIdArray(cardIndices, amount, inverse = false) {
    let indexArray;
    if (inverse) {
        indexArray = Array.apply(null, { length: amount - cardIndices.length }).map(_ => -1).concat(cardIndices);
    } else {
        indexArray = cardIndices.concat(Array.apply(null, { length: amount - cardIndices.length }).map(_ => -1));
    }
    return indexArray
}

function StartPhaseIndicator(props) {
    let classes = {
        [CardCategory.Worker]: "Worker",
        [CardCategory.Aristocrat]: "Aristocrat",
        [CardCategory.Building]: "Building",
        [CardCategory.Exchange]: "Exchange",
    }
    return <div className={classes[props.phase]}></div>;
}

function PlayerBox(props) {
    let p = props.player;
    let curP = props.currentPlayer;
    let gs = props.gs;
    let isCurrent = curP.matrixId == p.matrixId;
    let cardSelector = props.cardSelector;
    let expanded = props.expanded;

    let handCards = createCardIdArray(p.handCards, p.handSize, false);
    let yourPlayer = p.matrixId == props.thisPlayerMatrixId;
    let idLabel = p.matrixId;
    if (yourPlayer) {
        expanded = true;
        idLabel = <>You: <b>{idLabel}</b></>;
    }
    let playerInfo = <div>
        <div className={"playerInfo"}>
            <div style={{ flexGrow: 1 }}>
                <p>Money: <b>{p.money}</b> </p>
                <p>Points: <b>{p.points}</b></p>
            </div>
            <div className={"StartPhaseIndicatorContainer"}>
                {p.startPhases.map(phase => <StartPhaseIndicator phase={phase} key={phase} />)}
            </div>
        </div>
    </div >
    let playerField = <CardFieldRow
        className={"playerField"}
        currentPlayer={curP}
        gs={gs}
        cardIds={p.getSortedField()}
        onCardActivate={props.onCardActivate}
        cardSelector={cardSelector}
        cardOwnerPlayer={p}
    />
    return <div style={{ position: "relative" }} className={"playerBox"+(isCurrent ? " current" : "")+(expanded?" expanded":"")}>
        <p>{idLabel}</p>
        <div style={{ display: "flex", flexDirection: "row" }}>
            {playerInfo}

            <CardFieldRow className={"hand"} currentPlayer={curP} gs={gs} cardIds={handCards} onCardBuy={props.onCardBuy} cardSelector={cardSelector} />
            {!expanded && playerField}
        </div>
        {expanded && playerField}
    </div>
}

function ControlElement(props) {
    return <div style={{ display: "flex", flexDirection: "row" }}>
        <button disabled={props.disabled} style={{ flexGrow: 1 }} onClick={props.onPassClick}>Pass</button>
        {!props.gameStateHistory && <button style={{ flexGrow: 1 }} onClick={props.onActivateHistoryView}>History View</button>}
        {!!props.gameStateHistory && <button style={{ flexGrow: 1 }} onClick={props.onActivateHistoryView}>Gameplay View</button>}
        <button style={{ flexGrow: 0, backgroundColor:"white", color:"grey" }} onClick={props.onEndClicked}>End Game</button>
    </div>;
}
class GameField extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() { }
    static letUserSelectExchangeCradId(cardId, currentPlayer, gameState){
        const p = new Promise((resolve)=>{
            if (!currentPlayer) { console.log("EEEEEEEE currentPlayer is undefined") }
            let possibleUpgrades = currentPlayer.getPossibleUpgradesForCard(cardId);
            let possiblePayableUpgrades = possibleUpgrades.filter((c) => currentPlayer.canBuyCard(cardId, gameState, c));
            window.Actions.selectCard(possiblePayableUpgrades).then(
                (selectedCard) => {
                    resolve(selectedCard)
                }
            );
        })
        return p;
    }
    render() {
        console.log("render field with props: ", this.props)
        let gs = this.props.gameState;
        let curP = gs.getCurrentPlayer();
        let topCards = createCardIdArray(gs.fieldTop, 8, false);//gs.fieldTop.concat(Array.apply(null, { length: 8 - gs.fieldTop.length }).map(_ => -1));
        let botCards = createCardIdArray(gs.fieldBottom, 8, true);//Array.apply(null, { length: 8 - gs.fieldBottom.length }).map(_ => -1).concat(gs.fieldBottom);
        let cardSelector = this.props.cardSelector;
        let yourTurn = curP.matrixId == this.props.userId
        console.log("top: ", topCards, "bottom: ", botCards);
        let onCardBuy = (cardId) => {
            let card = Cards.byId(cardId);
            if (!card) {
                console.log("on empty field card click: ", cardId, " NOTHING WAS DONE");
                return;
            }
            console.log("on field card click: ", cardId, " card: ", card)
            let turn = {
                type: TurnType.BuyCard,
                cardId: cardId
            }
            if (card.category == CardCategory.Exchange) {
                GameField.letUserSelectExchangeCradId(cardId, curP, gs).then( (selectedCard)=>{
                    turn["exchangeCardId"] = selectedCard;
                    this.props.onTurn(turn);
                })
                // if (!curP) { console.log("EEEEEEEE curP is undefined") }
                // let possibleUpgrades = curP.getPossibleUpgradesForCard(cardId);
                // let possiblePayableUpgrades = possibleUpgrades.filter((c) => curP.canBuyCard(cardId, gs, c));
                // window.Actions.selectCard(possiblePayableUpgrades).then(
                //     (selectedCard) => {
                //         turn["exchangeCardId"] = selectedCard;
                //         this.props.onTurn(turn);
                //     }
                // );
            } else {
                this.props.onTurn(turn);
            }
        }
        let onCardTake = (cardId) => {
            let turn = {
                type: TurnType.TakeCard,
                cardId: cardId
            }
            this.props.onTurn(turn);
        }
        let onCardActivate = (cardId) => {
            Cards.byId(cardId).getActionPayload(gs).then((payload)=>{
                let turn = {
                    type: TurnType.ActivateCard,
                    cardId: cardId,
                    payload: payload,
                }
                this.props.onTurn(turn);
            })
        }
        if (!yourTurn || cardSelector != null) {
            onCardTake = null;
            onCardBuy = null;
            onCardActivate = null;
        }

        return (
            <>
                <div className={'field' + (yourTurn ? ' yourTurn' : '') + " "+(CardCategory.label(gs.phase))} >
                    <CardFieldRow currentPlayer={curP} gs={gs} cardIds={topCards} onCardTake={onCardTake?.bind(this)} onCardBuy={onCardBuy?.bind(this)} cardSelector={cardSelector} />
                    <CardFieldRow currentPlayer={curP} gs={gs} cardIds={botCards} onCardTake={onCardTake?.bind(this)} onCardBuy={onCardBuy?.bind(this)} cardSelector={cardSelector} />
                </div>
                <ControlElement
                        disabled={this.props.controlsDisabled}
                        onPassClick={this.props.onPass}
                        onEndClicked={this.props.onEnd}
                        gameStateHistory={this.props.gameStateHistory}
                        onActivateHistoryView={this.props.onHistoryToggle}
                    />
                <div className={'playerArea'} style={{ display: "flex" }}>
                    {gs.players.map((p) => {
                        return <PlayerBox
                            key={p.matrixId}
                            player={p}
                            currentPlayer={curP}
                            thisPlayerMatrixId={this.props.userId}
                            gs={gs}
                            onCardBuy={onCardBuy?.bind(this)}
                            onCardActivate={onCardActivate?.bind(this)}
                            cardSelector={cardSelector}
                        />
                    }
                    )}
                </div>
            </>
        );
    }
}

export default GameField;