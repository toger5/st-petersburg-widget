import React, { Component } from "react";
import { WidgetApiToWidgetAction } from 'matrix-widget-api'
import {
    ST_PETERSBURG_EVENT_NAME,
} from './main'
import { GameState, Player, getGameState, TurnType } from './gameState'
import GameField from './gameField'
import "./App.css"
const NOTIFY = false;
const LOGGING = false;
class App extends Component {
    constructor(props) {
        super(props);
        this.widgetApi = props.widgetApi;
        this.userId = props.userId;
        window.Actions = {
            selectCard: this.selectCard.bind(this),
        }
        this.state = {
            roomMembers: [],
            selectedRoomMember: new Set(),
            turns: [],
            gameState: new GameState(),
            yourTurn: false,
            
            cardSelector: undefined,
            // deckSelector: undefined,
            // trashSelector: undefied,
            // pubSelector: undefined
        };
    }
    test=10;
    componentDidMount() {
        this.widgetApi.on(`action:${WidgetApiToWidgetAction.SendEvent}`, (ev) => {
            switch (ev.detail.data.type) {
                case "m.room.message":
                    ev.preventDefault();
                    this.widgetApi.transport.reply(ev.detail, {});
                    break;
                case ST_PETERSBURG_EVENT_NAME:
                    ev.preventDefault();
                    this.widgetApi.transport.reply(ev.detail, {});
                    console.log("ST_PETERSBURG_EVENT: ", ev)
                    this.handleStPetersburgEvent(ev.detail.data)
                    break;
            }

        })
        this.widgetApi.readStateEvents(
            "m.room.member",
            25,
        ).then((events) => {
            let roomMembers = events.map(ev => ev.state_key);
            console.log('read member: ', roomMembers)
            this.setState({ selectedRoomMember: new Set(roomMembers), roomMembers: roomMembers })
        });
        this.widgetApi.readStateEvents(
            ST_PETERSBURG_EVENT_NAME,
            25,
        ).then((events) => {
            events.find((ev) => ev.state_key == this.props.widgetId)
            let stPetersEvent = events.filter(
                ev => ev.state_key == this.props.widgetId
            )[0];
            console.log('read st events: ', stPetersEvent)
            this.handleStPetersburgEvent(stPetersEvent)
        });

    }

    sendStPetersburgEvent(gameState) {
        let content = { "gameState": gameState }
        let roomMessageContent = {
            "msgtype": "m.text",
            "body": "# hallo\n_test_",
            "format": "org.matrix.custom.html",
            "formatted_body": "<h3>St. Petersburg Event</h3>\n<p>Turn:</p>\n<pre><code class=\"language-json\">" + JSON.stringify(gameState.turns.last, null, "\t") + "\n</code></pre>\n<p>GameState:</p>\n<pre><code class=\"language-json\">" + JSON.stringify(gameState, null, "\t") + "\n</code></pre>\n"
        }
        let roomNotifyContent = {
            "msgtype": "m.text",
            "body": "🕍 "+gameState.getCurrentPlayer().matrixId+" It's your turn!\n_Automatically created by the St. Petersburg Widget_",
            "format": "org.matrix.custom.html",
            "formatted_body": "🕍 @toger5:matrix.org It's your turn!<br><em>Automatically created by the St. Petersburg Widget</em>"
        }
        // might need to change event key to: "" -> widgetsId
        this.widgetApi.sendStateEvent(ST_PETERSBURG_EVENT_NAME, this.props.widgetId, content);
        if (LOGGING) this.widgetApi.sendRoomEvent("m.room.message", roomMessageContent, "");
        if (NOTIFY) this.widgetApi.sendRoomEvent("m.room.message", roomNotifyContent, "");
    }

    // passTurn() {
    //     console.log("passPressed")
    //     let turn = {
    //         "type": TurnType.Pass,
    //     }
    //     this.makeTurn(turn);
    // }
    endGame() {
        this.state.gameState.isFinished = true;
        this.sendStPetersburgEvent(this.state.gameState);
    }
    makeTurn(turn) {
        // the turn type gets extended with a nextTurn: true field in nextStateAfterTurn if the next phase is started
        this.state.gameState.nextStateAfterTurn(turn);
        this.sendStPetersburgEvent(this.state.gameState);
    }

    selectCard(optionCardIds){
        let promise = new Promise( (cardSelected) => {
            let cardSelector = {
                optionCardIds: optionCardIds,
                onSelect: (cardId)=>{
                    cardSelected(cardId)
                    this.setState({
                        cardSelector: null,
                    })
                }
            }
            this.setState({
                cardSelector: cardSelector,
            })
        });
        return promise;
    }

    handleStPetersburgEvent(evData) {
        let content = evData.content;
        let oldGs = this.state.gameState;
        content.gameState.players = content.gameState.players.map((p) => {
            let pl = new Player();
            return Object.assign(pl, p);
        })
        let newGsContent = content.gameState;
        this.setState({
            turns: content.gameState.turns,
            gameState: Object.assign(oldGs, newGsContent),
            yourTurn: this.state.gameState.getCurrentPlayer().matrixId == this.userId
        });
        this.validateGameState(this.state.gameState)
    }
    validateGameState(gameState) {
        return;
        if (this.state.turns == gameState.turns.slice[-this.state.turns.length]) {
            console.log("turns match local turns")
        } else {
            console.error("Turns from the participating players dont match!!!");
        }
        // TODO (need to make part of the game state static)
        // if (getGameState(newTurns, new GameState())) {
        //     console.log("game state seems to be correct")
        // } else {
        //     console.error("Game state is wrong!!!");
        // }
    }

    gameRunning() {
        return !this.state.gameState.isFinished && this.state.gameState.players.length > 0;
    }
    // onSendButtonClick() {
    //     this.widgetApi.sendRoomEvent("m.room.message",
    //         {
    //             "msgtype": "m.text",
    //             "body": "Hallo!"
    //         }
    //     );
    // }
    initializeGame() {
        let gameState = new GameState(Array.from(this.state.selectedRoomMember));
        this.sendStPetersburgEvent(gameState);
    }

    playerChanged(member) {
        let newSet = new Set(this.state.selectedRoomMember)
        newSet.has(member)
            ? newSet.delete(member)
            : newSet.add(member);
        this.setState({
            selectedRoomMember: newSet
        })
    }

    render() {
        console.log("current game state: ", this.state.gameState);
        console.log("current is startGame: ", this.state.gameState == {});
        console.log("current game is cancelled: ", this.state.gameState.isCancelled());
        let startGamePage = <div style={{ backgroundColor: "#99cc99" }}>
            {(this.state.gameState.isFinished) &&
                <div>
                    {this.state.gameState.isCancelled() && <>The game got cancelld. Start a new one!</>}
                    {!this.state.gameState.isCancelled() &&
                        <> The game is over, the winner is: <br />
                            {this.state.gameState?.players?.sort((a, b) => a.points - b.points).length > 0
                                ? this.state.gameState?.players?.sort((a, b) => a.points - b.points)[0].userId
                                : null
                            }
                        </>}
                </div>
            }
            <div><button onClick={this.initializeGame.bind(this)}>Start Game</button></div>
            {this.state.roomMembers.map((m) =>
                <p key={m} ><label>
                    <input
                        name={m}
                        type={"checkbox"}
                        onChange={this.playerChanged.bind(this, m)}
                        checked={this.state.selectedRoomMember.has(m)}
                    />
                    {m}
                </label></p>
            )}
        </div>
        let game;
        if (this.gameRunning()) {
            game =
                <div style={{ backgroundColor: (this.state.yourTurn?"#cc9999":"#fff") }}>
                    <div>
                        <p> Hello, {this.props.userId}! </p>
                        <p>{["Worker", "Buildings", "Aristocrats", "Exchange"][this.state.gameState.phase]}</p>
                    </div>
                    <GameField gameState={this.state.gameState} onTurn={this.makeTurn.bind(this)} userId={this.userId} cardSelector={this.state.cardSelector}/>
                    <ControlElement
                        yourTurn={this.state.yourTurn}
                        onPassClick={this.makeTurn.bind(this, { type: TurnType.Pass })}
                        onEndClicked={this.endGame.bind(this)} />
                    {this.state.gameState.turns.map((stEv,index) => <div key={index} style={{ fontFamily: "monospace" }}> {JSON.stringify(stEv)} </div>)}
                </div>
        }
        return (
            <div className={"App"}>
                {game || startGamePage}
            </div>
        );
    }
}
function ControlElement(props) {
    return <div style={{ display: "flex", flexDirection: "row" }}>
        <button disabled={!props.yourTurn} style={{ flexGrow: 1 }} onClick={props.onPassClick}>Pass</button>
        <button disabled={!props.yourTurn} style={{ flexGrow: 1 }} onClick={props.onEndClicked}>End Game</button>
    </div>;
}

export default App;