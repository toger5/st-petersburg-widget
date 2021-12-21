import React from "react";

export function StartGamePage(props) {
    let gameState = props.gameState;
    let initializeGame = props.initializeGame;
    let selectedRoomMember = props.selectedRoomMember;
    let onChange = props.onPlayerChanged;
    let roomMembers = props.roomMembers;
    return <div style={{ padding: "10px" }}>
        {(gameState.isGameOver) &&
            <div>
                {gameState.isCancelled() && <>The game got cancelled. Start a new one!</>}
                {(gameState.isPlayedToEnd) &&
                    <> The game is over, the winner is: <br />
                        {gameState?.players?.sort((a, b) => a.points - b.points).length > 0
                            ? gameState?.players?.sort((a, b) => a.points - b.points)[0].userId
                            : null
                        }
                    </>
                }
            </div>
        }
        <div><button onClick={initializeGame}>Start Game</button></div>
        {Object.keys(roomMembers).map((matrixId) => { 
            let member = roomMembers[matrixId]
            return <p key={member.matrixId} ><label>
                <input
                    name={matrixId}
                    type={"checkbox"}
                    onChange={onChange.bind(null, matrixId)}
                    checked={selectedRoomMember.has(matrixId)}
                />
                {member.displayname}
            </label></p>
            }
        )}
    </div>
}