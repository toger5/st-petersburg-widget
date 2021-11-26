import { WidgetApi } from 'matrix-widget-api'
import React from "react";
import ReactDOM from "react-dom";
import App from './App';
import {parseFragment,assertParam, handleError} from "./utils"

export const ST_PETERSBURG_EVENT_NAME = 'org.github.st-petersburg';

try {
    const qs = parseFragment();
    const widgetId = assertParam(qs, 'widgetId');
    const userId = assertParam(qs, 'userId');

    const api = new WidgetApi(widgetId);
    
    api.requestCapabilityToReceiveState("m.room.member");

    api.requestCapabilityToReceiveEvent("m.room.message");
    api.requestCapabilityToSendEvent("m.room.message");

    api.requestCapabilityToSendState(ST_PETERSBURG_EVENT_NAME);
    api.requestCapabilityToReceiveState(ST_PETERSBURG_EVENT_NAME);
    // Add custom action handlers (if needed)
    // api.on(`action:${WidgetApiToWidgetAction.UpdateVisibility}`, (ev: CustomEvent<IVisibilityActionRequest>) => {
    //     ev.preventDefault(); // we're handling it, so stop the widget API from doing something.
    //     console.log(ev.detail); // custom handling here
    //     api.transport.reply(ev.detail, <IWidgetApiRequestEmptyData>{});
    // });
    // api.on("action:com.example.my_action", (ev: CustomEvent<ICustomActionRequest>) => {
    //     ev.preventDefault(); // we're handling it, so stop the widget API from doing something.
    //     console.log(ev.detail); // custom handling here
    //     api.transport.reply(ev.detail, {custom: "reply"});
    // });

    api.on("ready", function () {
        // api.sendRoomEvent("m.room.message", {
        //     "msgtype": "m.text",
        //     "body": "hi from widget"
        // }).then((val) => { console.log("after send evetn: ", val) })
        // api.readRoomEvents("m.room.message",100).then((val)=>{console.log("SOMETHING READ",val)})
        let a = document.getElementById("root");
        window.app = <App widgetApi={api} userId={userId} widgetId={widgetId}/>;
        ReactDOM.render(window.app, a);
    });

    api.start();

} catch (e) {
    handleError(e);
}



