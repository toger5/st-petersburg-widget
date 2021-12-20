import { CardCategory } from "./cards";
import React from "react";
import { TurnType } from "./gameState";
import "./turnDrawer.css"
import { Cards } from "./cards";
function CardPreview(props){
    const style = {
        backgroundImage: `url(${props.card.image})`,
    }
    return <div style={style} className="cardPreview"></div>
}
export function TurnDrawer(props){
    const turn = props.turn;
    const prevState = props.prevState;
    let elem;
    let card;
    let cardId = turn?.cardId;
    switch(turn?.type){
        case TurnType.Pass:
            let passLabel =turn?.nextPhase ?<span>⏩⏩ Started <b>Next Phase</b>.</span> : <span>⏩ Passed.</span>
            elem = <div>{passLabel}</div>;
            break;
        case TurnType.BuyCard:
            card = Cards.byId(cardId);
            let player = prevState.getCurrentPlayer();
            let cardPrice = player.minPriceForCard(cardId, prevState);
            let exchangeCard = null;
            elem = <div>💰 <span>Bought card for <b>{cardPrice} rubel.</b></span><CardPreview card={card}/></div>;
            if(card.category == CardCategory.Exchange){
                cardPrice = player.priceForExchangeCard(cardId, prevState, turn.exchangeCardId);
                exchangeCard = Cards.byId(turn.exchangeCardId);
                elem = <div>💰 <span className="exchangeIcon">↬</span><CardPreview card={card}/> <span style={{fontSize: "x-small"}}>Exchanged card for {cardPrice} rubel.<b></b></span><CardPreview card={exchangeCard}/></div>;
            }
        break;
        case TurnType.TakeCard:
            card = Cards.byId(cardId);
            elem = <div>🤙 <span>Took card on <b>Hand</b>.</span><CardPreview card={card}/></div>;
            break;
        case TurnType.ActivateCard:
            card = Cards.byId(cardId);
            elem = <div>🎆<span><b>Activated</b> card.</span><CardPreview card={card}/></div>;
        break;
    }
    return <div className="turnDrawer">{elem}</div>;
}