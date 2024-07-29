/**
 * Served to client on page load. Handles general tasks.
 * @file System.mjs
 * @author Smittel
 * @copyright 2024
 * @name Client:System
 * @see <a href="./client.Client_System.html">Module</a>
 */
/**
 * Served to client on page load. Handles general tasks.
 * @file System.mjs
 * @author Smittel
 * @copyright 2024
 * @name Client:System
 * @see <a href="./client.Client_System.html">Module</a>
 * @namespace ClientCode
 */
/**
 * @module System
 * @memberof client
 * @description System.mjs handles general management, handles intercommunication between system apps, initialisation as well as general UI
 * @name Client:System
 * @author Smittel
 */

import { System as emit, App } from "./Connect.mjs"
import { handlers } from "../Error.mjs";
import * as Util from "./Util.mjs";

let lastheartbeat = Date.now();

/**
 * @constant registeredSysApps Array of apps that registered for intercommunication
 * @name Internal:registeredSysApps
 */
const registeredSysApps = []

/**
 * To be able to talk to other apps, it must first register using this function.
 * @param {String} fullId The full id of the application instance (AppID + InstanceID + WindowID)
 * @param {Function} func Callback function
 * @method registerSysApp
 * @name Export:registeredSysApp
 * @todo Implement actual communications
 */
function registerSysApp(fullId, func) {
    registeredSysApps.push({id: fullId, handle: func})
}

/**
 * Handles incoming server messages that passed through the Connect module.
 * @see Client:Connect
 * @param { Object } data Server Data
 * @method handle
 * @name Export:handle 
 */
function handle(data) {
    console.log("System", data)
    switch (data.res) {
        case "heartbeat":
            lastheartbeat = Date.now();
            break;
        case "notification":
            makeNotification(data.data);
            break;
        case "desktop-symbols":
            setupDesktopSymbols(data)
            break
        case "sysapp":
            break
        case "usermessage": // messages and requests
            for (let i in messageListeners) {
                messageListeners[i](data)
            }
            break;
    }
}

const messageListeners = {};

function addMessageListener(app, func) {
    messageListeners[app] = func;
}

/**
 * Sets up the desktop symbols supplied by the server based on user preference
 * @param { Object } data Server Data
 * @method setupDesktopSymbols
 * @name Internal:setupDesktopSymbols 
 */
function setupDesktopSymbols({ data }) {
    const container = document.getElementById("sysdsouter");

    for (let i = 0; i < data.length; i++) {
        const curr = Util.create({
            tagname: "desktop-symbol",
            style: `background-image: url(/media/desktopicons?i=${data[i].appid});
                filter: drop-shadow(0px 0px 5px #2228);
                top: ${data[i].position[1] * 72}px;
                left: ${data[i].position[0] * 96}px`,
            dataset: {
                appid: data[i].appid,
                name: data[i].text
            },
            eventListener: {
                click: () => {
                    if (data[i].appid.match(/^\d{12}$/g)) {
                        App({req: "fetch_app", data: { id: data[i].appid } })
                    } else {
                        emit({req: "fetch_app", data: { id: data[i].appid } })
                    }
                },
                mousedown: dragSymbol
            }
        })

        container.append(curr)
    }
}

/**
 * Handles incoming server messages that passed through the Connect module.
 * @param { Event } e 
 * @method dragSymbol
 * @name Internal:dragSymbol
 * @todo Actually implement something
 */
function dragSymbol (e) {
    const timer = setTimeout(() => {
        console.log("dragged", e.target)
    }, 100);
    
    e.target.addEventListener("mouseup", () => {clearTimeout(timer)})
}

/**
 * Creates a push notification including sliding in and out, deletes it after.
 * @todo Add click listener with attached application, screen or other event
 * @param { Object } notificationData Icon, title, text and app associated with the notification
 * @method makeNotification
 * @name Internal:makeNotification 
 */
function makeNotification({ icon, title, text, app }) {
    const box = Util.create({
        tagname: "notification-box",
        dataset: { visible: "false" },
        childElements: [
            {
                tagname: "div",
                classList: ["notification-icon"],
                childElements: [
                    {
                        tagname: "img",
                        src: `/media/icons?i=${icon}`
                    }
                ]
            }, {
                tagname: "div",
                classList: ["notification-main"],
                childElements: [
                    {
                        tagname: "div",
                        classList: ["notification-title"],
                        innerText: title
                    }, {
                        tagname: "div",
                        classList: ["notification-text"],
                        innerText: text
                    }
                ]
            }
        ]
    })
    if (app) {
        box.style.cursor = "pointer"
        box.addEventListener(click, (e) => { console.log(app) })
    }
    document.body.append(box);
    setTimeout(() => {
        box.dataset.visible = "true"
        setTimeout(() => {
            box.dataset.visible = "false";
            setTimeout(() => {
                box.remove()
            }, 100);
        }, 4100);
    }, 1);

}

// setInterval(() => {
//     emit({req: "heartbeat"})
//     if (Date.now() - lastheartbeat > 10) handlers["S-0001"]({code: "S-0001", message: "Connection to server timed out"})
// }, 1000)

export { handle, registerSysApp, addMessageListener }