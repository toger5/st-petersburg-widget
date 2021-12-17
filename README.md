# Saint Petersburg Widget
This is a matrix widget that implements the board game "Saint Petersburg".

<img height="500px" src="https://user-images.githubusercontent.com/16718859/146571173-ac75e0aa-77d2-4b06-a070-7f4fc368bd69.png">

### Thank you, Hans Im Glueck
This was only made possible by the publisher "Hans Im Glueck" who provided me with a license that I can share the code including their art and host it as a static site so the widget can be made accessible in a matrix room by calling:
`/addwidget https://vibrant-swanson-5be55c.netlify.app/#/?widgetId=$matrix_widget_id&userId=$matrix_user_id` \
It is against copyright law to host this application (and by doing so use licensed IP and Art from "Hans Im Glueck") without a license.

## How it works

### Get started
First, join: [#st-petersburg-auth](https://matrix.to/#/#st-petersburg-auth:matrix.org) to get help during the setup process. \
_(it is also necessary to be part of that room to use the widget. It is required by the License, that all users of the widget have an account (in this case a matrix account) and can be counted, to know if it is on a scale, so that the free license I got provided is reasonable.)_ \
To get up and running, the following steps are needed:
 - create a matrix room with the ppl who are going to participate
 - add the widget by sending: `/addwidget https://vibrant-swanson-5be55c.netlify.app/#/?widgetId=$matrix_widget_id&userId=$matrix_user_id` into the room
 - Sadly the permissions need to be adapted to make it playable for non Default (non Moderator or Admin) users
   - either change to role of all the participating users to `Moderator`
   - or change: `Room Settings`/`Roles & Permissions`/`Change Settings` to `Default`
 - Open the widget, accept the permission, and start a game. (The widget will only work if you are part of the lobby/auth room. So you need to join that room before playing)

### Under the hood
This is where things become interesting. This project is a prove of concept for collaborative applications that are independent of any server and therefor are available (in theory) for eternity. Like a local application. Currently things are heading in a way, where this is less common. Most documents/applications/services rely on cloud implementations that are only available as long as they are profitable for the one hosting it. Of course WoW or google docs are planned to stay, but as soon as this plan, for whatever reason, changes, they are gone.
Matrix differs in that regard. It allows us to host our data anywhere. Change where its hosted. And host it ourselves. A matrix account can be looked at like a editable shared database (with an amazing permissions architecture) that persists "forever" (forever is a big word and rarely means what it is defined as... in this context is means: as long as someone cares to host a server)\
A widget is the easiest way to make use of that database and don't care about any of the complexity: encryption, account management/login, permissions, server databases (e.g. sql...). It lets you create an app that will run like any other local app or static website BUT with the power and complexity of collaborative apps, like: multiplayer games, documents, shared to do lists, calenders or what other apps, ppl use nowadays, where it is beneficial to collaborate.\
A shared online todo app, for example, would involve a backend, some hosted database (sth like firebase), a login and an account management system and is than vulnerable to: expiring hosting accounts, database maintenance, data abuse and privacy concerns on the user side... With a matrix widget it is as simple as a static site. The equation now looks like this:\
**some js, some HTML -> collaborative Todo app**

But of course that comes with some issues. And thats what I wanted to explore with this project. For a lot of things it is necessary to be able to run some logic outside of the client. Especially with games, things like drawing random cards already become an issue without logic that runs by a third party (on a server). When using our analogy about matrix just being a database it is not capable of executing custom logic for specific logic like randomly drawing cards. Those kind of things then need to be done in the widget itself.\
_(It is important to note here, that it is still possible to host a server that runs a bot who participates in the room and takes care of all the logic/changes that would need to be done server-side for applications where this is inevitable. But the challenge with this project is to stick with the simplicity of only hosting static files!)_

**How can we still have a game where you know that the participants obey the rules without relying on trusting them.**\
Drawing cards need to be deterministic. So that all participants can check if the new game state that was sent conforms to the rules. But it should not be deterministic to a degree, that you know what is going to happen next.
With this in mind we can look at the high level flow of the game:
```
--> A valid game state is present --> 

--> All the widgets displays the game state and waits for user input (if at turn) to then calculate a new game state (conformant to the rules) -->

--> the new game state is send -->

--> all the widgets receive the game state and validate it: was it sent by the right user, did it use the "correct rules (PRNG) for drawing cards" ...
     --> The game state is not valid, all the widgets raise an error by posting a message into the room explaining why they are unhappy -->
     --> or they approve the game state so we are at the beginning again. -->
```
The main topic now is to find a solution for the ambiguous "correct rules (PRNG) for drawing cards" step. We need a deterministic random mechanism a Pseudo random dumber generator (PRNG) that uses a seed.\
The first solution for to obtain this seed, that came to mind, is using the last state events timestamp. It is only available when the event was send
 -> no one can look into the future and plan ahead (that is considered cheating as well, you cannot look what card is coming up next...)\
 -> no one can control what cards are going to be drawn because the timestamp is determined by the server and network quality (that would be considered cheating, you cannot change the order of the deck during a game so that it is beneficial for you)\
Sadly the timestamp of the previous event is not available to widgets (they cannot query specific events by id.) I only can access the previous content.
The current solution is to hash the previous content and use that hash as the seed for the PRNG. This makes it possible for users to know what cards will be drawn if they decide to make move A and what cards are going to be drawn if they choose move B but they are not in full control of what cards they want to draw, because there are only a handful of moves possible and the game state cannot be altered in any other way. Adding a new field to the game state to further influence what cards are going to be drawn would immediately break the validation steps the other users are going to do and call you out for cheating.
