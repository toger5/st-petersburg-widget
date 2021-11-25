import React, { Component } from "react";
import { CardCategory, Cards } from "./cards";
import "./Field.css";
import { GameState, TurnType } from "./gameState";

function Card(props) {
    let style = {};
    if(props.card){
         style = {backgroundImage: `url(${props.card.image}`};
    }
    return <div onClick={props.onClick} style={{style}} className={"card"+(props.cardObj ? " image":"")}style={style}></div>
}

function CardFieldRow(props) {
    return <div style={{ display: "flex", flexGrow: 1 }}>
        {props.cardIds.map(
            (cardId, keyIndex) => <Card cardObj={Cards.get(cardId)} key={keyIndex} onClick={props.onClick.bind(null, cardId)} />
        )}
    </div>
}

function createCardArray(cardIndices, amount, inverse = false) {
    let indexArray;
    if (inverse) {
        indexArray = Array.apply(null, { length: amount - cardIndices.length }).map(_ => -1).concat(cardIndices);
    } else {
        indexArray = cardIndices.concat(Array.apply(null, { length: amount - cardIndices.length }).map(_ => -1));
    }
    return indexArray
}

function StartPhaseIndicator(props) {
    let colors = {
        [CardCategory.Worker]: "green",
        [CardCategory.Aristocrat]: "red",
        [CardCategory.Building]: "blue",
        [CardCategory.Exchange]: "white",
    }
    let style = {
        width: "8px",
        height: "8px",
        backgroundColor: colors[props.phase]
    }
    return <div style={style}></div>;
}
function PlayerBox(props) {
    let p = props.player;
    let handCards = createCardArray(p.handCards, p.handSize, false);
    let onPlayerCardClick = (card, ev)=>{console.log("on player card click: ", card," ev ", ev)}
    return <div style={{ position: "relative" }} className={props.isCurrent ? "current" : ""}>
        <p>{p.matrixId}</p>
        <p>Money: {p.money} </p>
        <p>Points: {p.points}</p>
        <div style={{ position: "absolute", top: "1px", right: "1px", display: "flex", }}>
            {p.startPhases.map(phase => <StartPhaseIndicator phase={phase}/>)}
        </div>
        <CardFieldRow cardIds={handCards} onClick={onPlayerCardClick}/>
        <CardFieldRow cardIds={p.field} />
    </div>
}
class GameField extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() { }

    render() {
        console.log("render field with props: ", this.props)
        let gs = this.props.gameState;
        let topCards = createCardArray(gs.fieldTop, 8, false);//gs.fieldTop.concat(Array.apply(null, { length: 8 - gs.fieldTop.length }).map(_ => -1));
        let botCards = createCardArray(gs.fieldBottom, 8, true);//Array.apply(null, { length: 8 - gs.fieldBottom.length }).map(_ => -1).concat(gs.fieldBottom);
        console.log("top: ", topCards, "bottom: ", botCards);
        let onFieldCardClick = (gs, card, ev)=>{console.log("on field card click: ", card," ev ", ev)
    turn = {
        type: TurnType.BuyCard,
        card: card.type
    }}
        return (
            <>
                <div className={'playerArea'} style={{ display: "flex" }}>
                    {gs.players.map((p) => {
                        let isCurrentPlayer = gs.getCurrentPlayer() == p;
                        console.log("player: ", gs.getCurrentPlayer(), p);
                        return <PlayerBox player={p} isCurrent={isCurrentPlayer} key={p.matrixId} />
                    }
                    )}
                </div>
                <div className={'field'} >
                    <CardFieldRow cards={topCards} onClick={onFieldCardClick.bind(gs)}/>
                    <CardFieldRow cards={botCards} onClick={onFieldCardClick.bind(gs)}/>
                </div>
            </>
        );
    }
}

export default GameField;