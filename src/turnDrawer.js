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
    let cardId = turn.cardId;
    switch(turn.type){
        case TurnType.Pass:
            elem = <div>⏩ <span style={{fontSize: "x-small"}}>Pass</span></div>;
            break;
        case TurnType.BuyCard:
            card = Cards.byId(cardId);
            let player = prevState.getCurrentPlayer();
            let cardPrice = player.minPriceForCard(cardId, prevState);
            let exchangeCard = null;
            elem = <div><CardPreview card={card}/>💰 <span style={{fontSize: "x-small"}}>Bought card for {cardPrice} rubel.<b></b></span></div>;
            if(card.category == CardCategory.Exchange){
                cardPrice = player.priceForExchangeCard(cardId, prevState, turn.exchangeCardId);
                exchangeCard = Cards.byId(turn.exchangeCardId);
                elem = <div><CardPreview card={exchangeCard}/>💰 <span className="exchangeIcon">↬</span><CardPreview card={card}/> <span style={{fontSize: "x-small"}}>Exchanged card for {cardPrice} rubel.<b></b></span></div>;
            }
        break;
        case TurnType.TakeCard:
            card = Cards.byId(cardId);
            elem = <div><CardPreview card={card}/>🤙 <span style={{fontSize: "x-small"}}>Took card on Hand.<b></b></span></div>;
        case TurnType.ActivateCard:
            card = Cards.byId(cardId);
            elem = <div><CardPreview card={card}/>🎆 <span style={{fontSize: "x-small"}}>Activated card.<b></b></span></div>;
        break;
    }
    return <div className="turnDrawer">{elem}</div>;
}