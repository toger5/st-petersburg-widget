import React, { Component } from "react";
import { CardCategory, Cards } from "./cards";
import "./Field.css";
import { TurnType } from "./gameState";
import { TurnDrawer } from "./turnDrawer";
import { StPetersburgContext } from "./context";
import {rotatedArrayForPlayer} from "./helper"

export function Card(props) {
    const curP = props.currentPlayer;
    const cardOwnerPlayer = props.cardOwnerPlayer;
    const gs = props.gs;
    const cardId = props.cardId;
    const isHighlighted = props.isHighlighted;
    const cardObj = Cards.byId(cardId);
    const skipFieldChecks = props.skipFieldChecks ?? false;
    const cardGotActivatedInThisRound = cardOwnerPlayer?.disabledCards.includes(cardId);

    let onCardTake = curP?.canTakeCard(cardId, gs, skipFieldChecks)
        ? props.onCardTake?.bind(null, cardId) : null;

    let onCardBuy = curP?.canBuyCard(cardId, gs, undefined, skipFieldChecks)
        ? props.onCardBuy?.bind(null, cardId) : null;

    let onCardActivate = curP?.canActivateCard(cardId, gs)
        ? props.onCardActivate?.bind(null, cardId) : null;

    let onCardDiscard = props.onCardDiscard?.bind(null, cardId);
    let style = { color: "white" };
    if (cardObj) {
        color: "white";
        style.backgroundImage = `url(${cardObj.image})`;
    }
    const cardSelector = props.cardSelector;
    const selectable = cardSelector?.optionCardIds.includes(cardId);
    return <div className={"card" + (selectable ? " selectable" : "") + (isHighlighted ? " highlighted" : "")} style={style}>
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
        {props.showCardIds && cardId}

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
    let highlightedCardId = props.highlightedCardId
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
                    showCardIds={props.showCardIds}
                    isHighlighted={highlightedCardId == cardId}
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
class PlayerBox extends React.Component {
    render(){
        let p = this.props.player;
        let curP = this.props.currentPlayer;
        let gs = this.props.gs;
        let isCurrent = curP.matrixId == p.matrixId;
        let cardSelector = this.props.cardSelector;
        let expanded = this.props.expanded;
        let gameStateHistory = this.props.gameStateHistory;

        let handCards = createCardIdArray(p.handCards, p.handSize, false);
        let yourPlayer = (p.matrixId == this.props.thisPlayerMatrixId);
        let value = this.context;
        let member = value.roomMembers[p.matrixId];
        if (yourPlayer) {
            expanded = true;
        }
        const style = {backgroundImage: `url(${member.avatar_url})`};
        const memberLabel = <>
            <div class={"avatar"} style={style} />
            <b>{member.displayname}</b>
        </>;
        const playerInfo = <div>
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
        const lastActionForPlayer = p.lastTurn(gameStateHistory) ?? { turn: null, prevState: null };
        const highlightedCardId = lastActionForPlayer?.turn?.cardId;
        const playerField = <CardFieldRow
            className={"playerField"}
            currentPlayer={curP}
            gs={gs}
            cardIds={p.getSortedField()}
            onCardActivate={this.props.onCardActivate}
            cardSelector={cardSelector}
            cardOwnerPlayer={p}
            showCardIds={this.props.showCardIds}
            highlightedCardId={highlightedCardId}
        />
        return <div style={{ position: "relative" }} className={"playerBox" + (isCurrent ? " current" : "") + (expanded ? " expanded" : "")}>
            <p>{memberLabel} <TurnDrawer turn={lastActionForPlayer.turn} prevState={lastActionForPlayer.prevState}></TurnDrawer></p>
            <div style={{ display: "flex", flexDirection: "row" }}>
                {playerInfo}

                <CardFieldRow
                    className={"hand"}
                    currentPlayer={curP}
                    gs={gs}
                    cardIds={handCards}
                    onCardBuy={this.props.onCardBuy}
                    cardSelector={cardSelector}
                    showCardIds={this.props.showCardIds} h
                    highlightedCardId={highlightedCardId}
                />
                {!expanded && playerField}
            </div>
            {expanded && playerField}
        </div>
    }
}
PlayerBox.contextType = StPetersburgContext;

function ControlElement(props) {
    return <div style={{ display: "flex", flexDirection: "row" }}>
        <button disabled={!props.onPassClick} style={{ flexGrow: 1 }} onClick={props.onPassClick}>Pass</button>
        <button style={{ flexGrow: 1 }} onClick={props.onHistoryViewClick}>{props.showGameStateHistory ? "Gameplay View" : "History View"}</button>
        <button style={{ flexGrow: 0, backgroundColor: "white", color: "grey" }} onClick={props.onEndClicked}>End Game</button>
    </div>;
}
class GameField extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() { }
    static letUserSelectExchangeCradId(cardId, currentPlayer, gameState, skipFieldCheck) {
        const p = new Promise((resolve) => {
            if (!currentPlayer) { console.log("EEEEEEEE currentPlayer is undefined") }
            let possibleUpgrades = currentPlayer.getPossibleUpgradesForCard(cardId);
            let possiblePayableUpgrades = possibleUpgrades.filter((c) => currentPlayer.canBuyCard(cardId, gameState, c, skipFieldCheck));
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
                GameField.letUserSelectExchangeCradId(cardId, curP, gs).then((selectedCard) => {
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
            Cards.byId(cardId).getActionPayload(gs).then((payload) => {
                let turn = {
                    type: TurnType.ActivateCard,
                    cardId: cardId,
                    payload: payload,
                }
                this.props.onTurn(turn);
            })
        }
        let onPass = this.props.onPass;
        if (!yourTurn || cardSelector != null) {
            onCardTake = null;
            onCardBuy = null;
            onCardActivate = null;
            onPass = null;

        }

        return (
            <>
                <div className={'field' + (yourTurn ? ' yourTurn' : '') + " " + (CardCategory.label(gs.phase))} >
                    <CardFieldRow currentPlayer={curP} gs={gs} cardIds={topCards} onCardTake={onCardTake?.bind(this)} onCardBuy={onCardBuy?.bind(this)} cardSelector={cardSelector} showCardIds={this.props.showCardIds} />
                    <CardFieldRow currentPlayer={curP} gs={gs} cardIds={botCards} onCardTake={onCardTake?.bind(this)} onCardBuy={onCardBuy?.bind(this)} cardSelector={cardSelector} showCardIds={this.props.showCardIds} />
                </div>
                <ControlElement
                    onPassClick={onPass}
                    onEndClicked={this.props.onEnd}
                    showGameStateHistory={this.props.showGameStateHistory}
                    onHistoryViewClick={this.props.onHistoryToggle}
                />
                <div className={'playerArea'} style={{ display: "flex" }}>
                    {rotatedArrayForPlayer(gs.players, this.props.userId).map((p) => {
                        return <PlayerBox
                            key={p.matrixId}
                            player={p}
                            currentPlayer={curP}
                            thisPlayerMatrixId={this.props.userId}
                            gs={gs}
                            onCardBuy={onCardBuy?.bind(this)}
                            onCardActivate={onCardActivate?.bind(this)}
                            cardSelector={cardSelector}
                            showCardIds={this.props.showCardIds}
                            gameStateHistory={this.props.gameStateHistory}
                        />
                    }
                    )}
                </div>
            </>
        );
    }
}

export default GameField;