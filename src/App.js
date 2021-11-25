import React, { Component } from "react";
import { WidgetApiToWidgetAction } from 'matrix-widget-api'
import {
    ST_PETERSBURG_EVENT_NAME,
} from './main'
import { GameState, Player, getGameState, TurnType } from './gameState'
import GameField from './gameField'
import "./App.css"

class App extends Component {
    constructor(props) {
        super(props);
        this.widgetApi = props.widgetApi;
        this.userId = props.userId;
        this.state = {
            member: [],
            turns: [],
            gameState: new GameState(),
        };
    }
    componentDidMount() {
        // this.widgetApi.on(`action:${WidgetApiToWidgetAction.SendEvent}`, (ev) => {
        //     ev.preventDefault(); // we're handling it, so stop the widget API from doing something.
        //     api.transport.reply(ev.detail, { custom: "reply" });
        //     switch (ev.detail.data.type) {
        //         case ST_PETERSBURG_EVENT_NAME:
        //             ev.preventDefault();
        //             this.widgetApi.transport.reply(ev.detail, {});

        //             this.handleStPetersburgEvent(ev)
        //             break;
        //     }
        // });

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
                    this.handleStPetersburgEvent(ev)
                    break;
            }

        })
        this.widgetApi.readStateEvents(
            "m.room.member",
            25,
        ).then((events) => { console.log("read m.room.member state \n", events.map(ev => ev.state_key).join("\n")) })

    }

    // called from button event
    // sendTurnEvent(gameState) {
    //     let content = {
    //         "gameState": { gameState }
    //     }
    //     let roomMessageContent = {
    //         "msgtype": "m.text",
    //         "body": "# hallo\n_test_",
    //         "format": "org.matrix.custom.html",
    //         "formatted_body": "<h3>St. Petersburg Event</h3>\n<p>Turn:</p>\n<pre><code class=\"language-json\">"+content.turn+"\n</code></pre>\n<p>GameState:</p>\n<pre><code class=\"language-json\">"+content.gameState+"\n</code></pre>\n"
    //     }
    //     this.widgetApi.sendStateEvent(ST_PETERSBURG_EVENT_NAME, content)
    //     // might need to change event key to: "" -> widgetsId
    //     this.widgetApi.sendRoomEvent("m.room.message", roomMessageContent, "")
    // }
    sendStPetersburgEvent(gameState) {
        let content = { "gameState": gameState }
        let roomMessageContent = {
            "msgtype": "m.text",
            "body": "# hallo\n_test_",
            "format": "org.matrix.custom.html",
            "formatted_body": "<h3>St. Petersburg Event</h3>\n<p>Turn:</p>\n<pre><code class=\"language-json\">" + JSON.stringify(gameState.turns.last, null, "\t") + "\n</code></pre>\n<p>GameState:</p>\n<pre><code class=\"language-json\">" + JSON.stringify(gameState, null, "\t") + "\n</code></pre>\n"
        }
        // might need to change event key to: "" -> widgetsId
        this.widgetApi.sendStateEvent(ST_PETERSBURG_EVENT_NAME, "widgetId1", content)
        this.widgetApi.sendRoomEvent("m.room.message", roomMessageContent, "")
    }
    passTurn(ev) {
        console.log("passPressed")
        let turn = {
            "type": TurnType.Pass,
        }
        // the turn type gets extended with a nextTurn: true field in nextStateAfterTurn if the next phase is started
        this.state.gameState.nextStateAfterTurn(turn);
        this.sendStPetersburgEvent(this.state.gameState);
    }

    handleStPetersburgEvent(ev) {
        let content = ev.detail.data.content;
        let oldGs = this.state.gameState;
        content.gameState.players = content.gameState.players.map((p)=>{
            let pl = new Player();
            return Object.assign(pl, p);
        })
        let newGsContent = content.gameState;
        this.setState({
            turns: content.gameState.turns,
            gameState: Object.assign(oldGs, newGsContent),
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


    // onSendButtonClick() {
    //     this.widgetApi.sendRoomEvent("m.room.message",
    //         {
    //             "msgtype": "m.text",
    //             "body": "Hallo!"
    //         }
    //     );
    // }
    initializeGame() {
        let gameState = new GameState(2)
        this.sendStPetersburgEvent(gameState);
    }

    render() {
        console.log("current game state: ", this.state.gameState)
        console.log("current is startGame: ", this.state.gameState == {})
    
        let startGamePage =
            <div><button onClick={this.initializeGame.bind(this)}>Start Game</button></div>
        let game;
        if (this.state.gameState.players.length > 1) {
            game =
                <>
                    <div>
                        <p> Hello, {this.props.userId}! </p>
                    </div>
                    <GameField gameState={this.state.gameState} />
                    <ControlElement onPassClick={this.passTurn.bind(this)}/>
                    {this.state.gameState.turns.map((stEv) => <div style={{fontFamily:"monospace"}}> {JSON.stringify(stEv)} </div>)}
                </>
        }
        return (
            <div className={"App"}>
                {game || startGamePage}
            </div>
        );
    }
}
function ControlElement(props) {
    return <div style={{display: "flex", flexDirection: "row"}}>
        <button style={{flexGrow:1}} onClick={props.onPassClick}>Pass</button>
        <button style={{flexGrow:1}} >TestButton</button>
    </div>;
}

export default App;