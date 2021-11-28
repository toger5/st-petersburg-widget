import React, { Component } from "react";
import { WidgetApiToWidgetAction } from 'matrix-widget-api'
import {
    ST_PETERSBURG_EVENT_NAME,
} from './main'
import { GameState, Player, getGameState, TurnType } from './gameState'
import GameField from './gameField'
import { StartGamePage } from "./StartGamePage"
import "./App.css"
import { deepEqual } from './helper'
const stringHash = require("string-hash");

const NOTIFY = false;
const LOGGING = false;
class App extends Component {
    constructor(props) {
        super(props);
        this.widgetApi = props.widgetApi;
        this.userId = props.userId;
        this.prev_gameState = null;
        window.Actions = {
            selectCard: this.selectCard.bind(this),
        }
        this.state = {
            roomMembers: [],
            selectedRoomMember: new Set(),
            // turns: [],
            gameState: new GameState(),
            yourTurn: false,
            lockUI: false,
            cardSelector: undefined,
            // deckSelector: undefined,
            // trashSelector: undefied,
            // pubSelector: undefined
        };
    }
    test = 10;
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
                    // TODO always keep track of the previous event to than check if the turn was valid. 
                    // otherwise give the player form that turn the option to reset to that state.
                    // this is the only next event that is accepted by other clients
                    // this.state.previousEvent = ev.detail.data.unsigned.prev_content
                    // this.prev_gameState = App.cloneGameState(this.state.gameState);
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
            let stPetersEvent = events.filter(
                ev => ev.state_key == this.props.widgetId
            )[0];
            console.log('read st events: ', stPetersEvent)
            this.handleStPetersburgEvent(stPetersEvent)
        });
    }

    sendStPetersburgEvent(gameState, hashFromPrevState) {
        this.setState({
            lockUI: true,
        })
        let content = { "gameState": gameState.getSendObj(), "hash": hashFromPrevState }
        let roomMessageContent = {
            "msgtype": "m.text",
            "body": "# hallo\n_test_",
            "format": "org.matrix.custom.html",
            "formatted_body": "<h3>St. Petersburg Event</h3>\n<p>Turn:</p>\n<pre><code class=\"language-json\">" + JSON.stringify(gameState.turns.last, null, "\t") + "\n</code></pre>\n<p>GameState:</p>\n<pre><code class=\"language-json\">" + JSON.stringify(gameState, null, "\t") + "\n</code></pre>\n"
        }
        let roomNotifyContent = {
            "msgtype": "m.text",
            "body": "🕍 " + gameState.getCurrentPlayer().matrixId + " It's your turn!\n_Automatically created by the St. Petersburg Widget_",
            "format": "org.matrix.custom.html",
            "formatted_body": "🕍 @toger5:matrix.org It's your turn!<br><em>Automatically created by the St. Petersburg Widget</em>"
        }
        // might need to change event key to: "" -> widgetsId
        this.widgetApi.sendStateEvent(ST_PETERSBURG_EVENT_NAME, this.props.widgetId, content);
        if (LOGGING) this.widgetApi.sendRoomEvent("m.room.message", roomMessageContent, "");
        if (NOTIFY) this.widgetApi.sendRoomEvent("m.room.message", roomNotifyContent, "");
    }
    sendCheatAlert(cheatMessages, sender){
        let cheatErrorList = cheatMessages.map(err => "\n" + err.msg + "\n" + err.details)
        let cheatErrorListFormatted = cheatMessages.map(err => "<br><strong>" + err.msg + "</strong><br><em>" + err.details+"</em>")
        let roomCheatAlert = {
            "msgtype": "m.text",
            "body": "🕍 I think, that " + sender + " cheated!<br>Those are my suspicions:<br>"+cheatErrorList+"\n_Automatically created by the St. Petersburg Widget_",
            "format": "org.matrix.custom.html",
            "formatted_body": "🕍 I think, that " + sender + " cheated!<br>Those are my suspicions:<br>"+cheatErrorListFormatted+"<br><em>Automatically created by the St. Petersburg Widget</em>",
        }
        this.widgetApi.sendRoomEvent("m.room.message", roomCheatAlert, "");
    }
    initializeGame() {
        let gameState = new GameState(Array.from(this.state.selectedRoomMember));
        this.sendStPetersburgEvent(gameState, gameState.getHash());
    }

    endGame() {
        this.state.gameState.isFinished = true;
        this.sendStPetersburgEvent(this.state.gameState, null);
    }

    makeTurn(turn) {
        // the turn type gets extended with a nextTurn: true field in next state after turn if the next phase is started
        let hash = this.state.gameState.getHash()
        this.state.gameState.nextStateAfterTurn(turn);
        this.sendStPetersburgEvent(this.state.gameState, hash);
    }

    selectCard(optionCardIds) {
        let promise = new Promise((cardSelected) => {
            let cardSelector = {
                optionCardIds: optionCardIds,
                onSelect: (cardId) => {
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
    static cloneGameState(gameStateA) {
        let gameStateB = new GameState(gameStateA.players.map(p => p.matrixId));
        Object.assign(gameStateB, gameStateA)
        gameStateB.players = gameStateA.players.map((p) => {
            let pl = new Player();
            return Object.assign(pl, p);
        })
        return gameStateB;
    }
    handleStPetersburgEvent(evData) {
        let newGs = App.cloneGameState(evData.content.gameState)
        // newGs.seed = // will be set accodingly depending on newGs.turns.length != 0
        newGs.sender = evData.sender;

        if (newGs.turns.length != 0 && !newGs.isFinished) {
            // Do validation and track previous event
            if (evData.unsigned?.prev_content?.gameState) {
                // handle from readEvent callback
                this.prev_gameState = App.cloneGameState(evData.unsigned?.prev_content?.gameState)
                this.prev_gameState.sender = evData.unsigned?.prev_sender;
                this.prev_gameState.seed = evData.unsigned?.prev_content.hash;
            } else if (this.prev_gameState) {
                // handle from on callback
                let seed = this.prev_gameState.getHash();
                this.prev_gameState = App.cloneGameState(this.state.gameState);
                this.prev_gameState.sender = this.state.gameState.sender;
                this.prev_gameState.seed = seed;
            } else {
                console.error("somehow there is no prev GameState")
            }
            newGs.seed = this.prev_gameState.getHash();
            this.validateGameState(newGs, this.prev_gameState)
        } else if (newGs.turns.length == 0) {
            console.log("-----GAME-----INITIALIZED-----,\n not validating the state since it seems to be the initial event")
            newGs.seed = evData.content.hash; // getting the hash from the init event for the net round
        } else if (newGs.isFinished) {
            console.log("-----GAME-----ENDED-----,\n not validating the state since it seems to be the initial event")
            // here we dont care about the seed
        }

        this.setState({
            lockUI: false,
            gameState: newGs,//Object.assign(oldGs, newGsContent),
            yourTurn: newGs.getCurrentPlayer().matrixId == this.userId
        });
    }
    validateGameState(gs, prev_gs) {
        let cheatMessages = [];

        // check that the correct player sended:
        let expected_sender = prev_gs.players.map(p => p.matrixId)[(prev_gs.currentPlayerIndex) % prev_gs.players.length]
        if (gs.sender != expected_sender) {
            cheatMessages.push({
                msg: "A user tried to update the state who is not at turn.",
                details: "last turn was:" + prev_gs.sender + " which implies that " + expected_sender + " is now at turn, but then " + gs.sender + " sent the next turn."
            })
        }

        // check turns array:
        let temp1 = prev_gs.turns;
        let temp2 = gs.turns.slice(0, -1);
        if (!deepEqual(temp1, temp2)) {
            // if (prev_gs.turns != gs.turns.slice(0, -1)) {
            cheatMessages.push({
                msg: "The turn history from the previous state does not match",
                details: "someone manually changed the turn history or added multiple turns to the end of the list"
            })
        }
        let newTurn = gs.turns.slice(-1)[0];
        prev_gs.nextStateAfterTurn(newTurn);
        console.log("compared Game States\nPrevious:\n", prev_gs.getSendObj(), "\nCurrent:", gs.getSendObj())
        if (prev_gs.getHash() != gs.getHash()) {
            cheatMessages.push({
                msg: "The state send does not match the expected state.",
                details: "The turn applied to the previous state was: " + JSON.stringify(newTurn) + " and this does not result in the state sent by the sender"
            })
        }
        if (cheatMessages.length > 0) {
            console.log("AAARRRG cheater with errors: " + cheatMessages.map(err => "\nMESSAGE: " + err.msg + "\nDETAILS: " + err.details))
            this.sendCheatAlert(cheatMessages, gs.sender);
        } else {
            console.log("Uhh Lala this turn was done without cheating!! congratulation!")
        }
    }

    gameRunning() {
        return !this.state.gameState.isFinished && this.state.gameState.players.length > 0;
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
        let startGamePage = <StartGamePage
            gameState={this.state.gameState}
            initializeGame={this.initializeGame.bind(this)}
            selectedRoomMember={this.state.selectedRoomMember}
            onPlayerChanged={this.playerChanged.bind(this)}
            roomMembers={this.state.roomMembers}
        />

        let game;
        if (this.gameRunning()) {
            game =
                <div>
                    <div>
                        <p> Hello, {this.props.userId}! </p>
                        <p>{["Worker", "Buildings", "Aristocrats", "Exchange"][this.state.gameState.phase]}</p>
                    </div>
                    <GameField
                        gameState={this.state.gameState}
                        onTurn={this.makeTurn.bind(this)}
                        userId={this.userId}
                        cardSelector={this.state.cardSelector}
                    />
                    <ControlElement
                        disabled={!this.state.yourTurn || !(this.state.cardSelector == undefined)}
                        onPassClick={this.makeTurn.bind(this, { type: TurnType.Pass })}
                        onEndClicked={this.endGame.bind(this)}
                    />
                    {this.state.gameState.turns.map((stEv, index) => <div key={index} style={{ fontFamily: "monospace" }}> {JSON.stringify(stEv)} </div>)}
                </div>
        }
        return (
            <div className={"App"}>

                {!this.state.lockUI && (game || startGamePage)}
                {this.state.lockUI && <><h1>Loading</h1><p>This is a very unfortuned lock iu implemntation</p></>}
            </div>
        );
    }
}
function ControlElement(props) {
    return <div style={{ display: "flex", flexDirection: "row" }}>
        <button disabled={props.disabled} style={{ flexGrow: 1 }} onClick={props.onPassClick}>Pass</button>
        <button style={{ flexGrow: 1 }} onClick={props.onEndClicked}>End Game</button>
    </div>;
}

export default App;