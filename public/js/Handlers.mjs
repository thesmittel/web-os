import * as Util from "./modules/Util.mjs";
import * as Server from "./modules/Connect.mjs"
import {handlers} from "./Error.mjs"

document.querySelector("taskbar-button#home").addEventListener("click", openStartmenu)
document.querySelector("taskbar-button#search").addEventListener("click", openSearch)



document.addEventListener("mousedown", loseFocus);

function openLogin(event) {
    event.stopPropagation();
    function loginTbKeydown(event) {
        if (event.key == "Enter") {
            login();
        }
    }
    const loginscreen = Util.create({
        tagname: "login-main",
        childElements: [
            {
                tagname: "div",
                classList: ["login-big"],
                childElements: [
                    {
                        tagname: "div",
                        classList: ["login-container"],
                        id: "login-container",
                        dataset: {error: "none"},
                        childElements: [
                            {
                                tagname: "div",
                                classList: ["default-pfp"]
                            },
                            {
                                tagname: "input",
                                type: "text",
                                placeholder: "Username",
                                id: "login-user",
                                dataset: {form: "login"},
                                eventListener: {keydown: loginTbKeydown}
                            },
                            {
                                tagname: "input",
                                type: "password",
                                id: "login-password",
                                placeholder: "Password",
                                dataset: {form: "login"},
                                eventListener: {keydown: loginTbKeydown}
                            }
                        ]
                    },
                    {
                        tagname: "div",
                        classList: ["login-buttons"],
                        childElements: [
                            {
                                tagname: "a",
                                classList: ["login-button"],
                                childElements: [
                                    {
                                        tagname: "i",
                                        classList: ["fa-solid", "fa-xmark", "fa-xl"]
                                    }
                                ],
                                eventListener: {click: closeLogin}
                            },
                            
                            {
                                tagname: "div"
                            },
                            {
                                tagname: "a",
                                classList: ["login-button"],
                                childElements: [
                                    {
                                        tagname: "i",
                                        classList: ["fa-solid", "fa-arrow-right", "fa-xl"]
                                    }
                                ],
                                eventListener: {
                                    "click": login
                                }
                            }
                        ]
                    }
                ]
            },
            
        ]
    })
    document.body.append(loginscreen)
    loginscreen.querySelector("#login-user").focus()
    function closeLogin(e) {
        loginscreen.remove();
    }
    function login(e) {
        Server.Auth({
            req: "login",
            data: {
                username: loginscreen.querySelector("input#login-user").value,
                password: loginscreen.querySelector("input#login-password").value
            }
        })
    }
}

function openSignup(event) {
    let metRequirements = 0;
    function sendUsername(event) {
        setTimeout(() => {
            Server.Auth({req: "signupCheckUsernameAvailable", data: event.target.value})
            }
        , 1)
        sendSignup(event)
    }
    
    function sendEmail(event) {
        setTimeout(() => {
            Server.Auth({req: "signupCheckEmailRegistered", data: event.target.value})
            }
        , 1)
        sendSignup(event)
    }
    function sendSignup(event) {
        if (event.key == "Enter") {
            Server.Auth({
                req: "signup",
                data: {
                    username: event.target.parentNode.parentNode.querySelectorAll("input")[0].value,
                    email: event.target.parentNode.parentNode.querySelectorAll("input")[1].value,
                    password: event.target.parentNode.parentNode.querySelectorAll("input")[2].value,
                    passwordconfirm: event.target.parentNode.parentNode.querySelectorAll("input")[3].value,
                }
            })
        }
    }

    function sendSignupBtn(event) {
        console.log(event.target.parentNode.parentNode.parentNode)
        Server.Auth({
            req: "signup",
            data: {
                username: event.target.parentNode.parentNode.parentNode.querySelectorAll("input")[0].value,
                email: event.target.parentNode.parentNode.parentNode.querySelectorAll("input")[1].value,
                password: event.target.parentNode.parentNode.parentNode.querySelectorAll("input")[2].value,
                passwordconfirm: event.target.parentNode.parentNode.parentNode.querySelectorAll("input")[3].value,
            }
        })
    }
    
    function matchPasswords(event) {
        const p1 = event.target.parentNode.children[0];
        const p2 = event.target.parentNode.children[2];
        console.log(p1, p2)
        setTimeout(() => {
            if (p1.value != p2.value) {
                handlers["A-0006"]({code: "A-0006", message: "Passwords don't match"})
            } else {
                handlers["A-0006"]({code: "None", message: ""})
            }

            // p2.parentNode.parentNode.dataset.errorpassword = (p1.value != p2.value)?"A-0006":"None"
            // p2.parentNode.dataset.errorpassword = (p1.value != p2.value)?"Passwords don't match":""
        }, 1);
        sendSignup(event)
    }

    function showPasswordHint(event) {
        const hint = event.target.parentNode.children[1];
        hint.dataset.visible = true
    }
    function hidePasswordHint(event) {
        const hint = event.target.parentNode.children[1];
        checkPasswordRequirements(event.target.value)
        if (metRequirements < 3 || event.target.value.length < 8) return;
        hint.dataset.visible = false
    }
    function checkPasswordRequirements(val) {
        const lengthRequirement = (val.length >= 8);
        const uppercase = val.match(/[A-Z]/g) != null;
        const lowercase = val.match(/[a-z]/g) != null;
        const numbers = val.match(/[0-9]/g) != null;
        const special = val.match(/[*.!@$%^&(){}\[\]:;<>,.?\/~_+\-=|\]§´`#'°]/g) != null
        metRequirements = 0;
        metRequirements += uppercase;
        metRequirements += lowercase;
        metRequirements += numbers;
        metRequirements += special;
        return [lengthRequirement, uppercase, lowercase, numbers, special]
    }
    function legalUsername(event) {
        const username = event.target.value;
        const match = username.match(/^[^.](((?<!\.)\.)|\w){2,32}[^.]$/g)
        if (match == null) handlers["A-0009"]({code:"A-0009", message: "Invalid username"})
    }
    function updatePasswordHint(event) {
        matchPasswords(event)
        setTimeout(() => {
            const hint = event.target.parentNode.children[1];
            const val = event.target.value;
            const req = checkPasswordRequirements(val);
            console.log(metRequirements)
            let reqElements = hint.querySelectorAll(".pw-requirement");
            for (let i = 0; i < 5; i++) {
                reqElements[i].dataset.met = req[i]
            }

        }, 1)
        sendSignup(event)
    }
    const loginscreen = Util.create({
        tagname: "login-main",
        childElements: [
            {
                tagname: "div",
                classList: ["signup-big"],
                childElements: [
                    {
                        tagname: "div",
                        classList: ["signup-container"],
                        id: "signup-container",
                        dataset: {
                            errorusername: "None",
                            erroremail: "None",
                            errorpassword: "None"
                        },
                        childElements: [
                            {
                                tagname: "div",
                                classList: ["signup-element-container"],
                                id: "signup-username-div",
                                childElements: [
                                    {
                                        tagname: "input",
                                        dataset: {form: "login"},
                                        type: "text",
                                        id: "signup-username",
                                        placeholder: "Username",
                                        eventListener: {
                                            keydown: sendUsername,
                                            focusout: legalUsername,
                                        }
                                    }
                                ]
                            },{
                                tagname: "div",
                                classList: ["signup-element-container"],
                                id: "signup-email-div",
                                childElements: [
                                    {
                                        tagname: "input",
                                        dataset: {form: "login"},
                                        type: "text",
                                        id: "signup-email",
                                        placeholder: "E-mail (optional)",
                                        eventListener: {
                                            focusout: sendEmail,
                                            keydown: sendSignup
                                        }
                                    }
                                ]
                            },{
                                tagname: "div",
                                classList: ["signup-element-container"],
                                id: "signup-password-div",
                                childElements: [
                                    {
                                        tagname: "input",
                                        dataset: {form: "login"},
                                        type: "password",
                                        id: "signup-password",
                                        placeholder: "Password",
                                        eventListener: {
                                            focus: showPasswordHint,
                                            focusout: hidePasswordHint,
                                            keydown: updatePasswordHint
                                        }
                                    },
                                    {
                                        tagname: "div",
                                        classList: ["password-hint"],
                                        id: "password-hint",
                                        dataset: {visible: false},
                                        childElements: [
                                            {tagname: "div", innerHTML: "Your password must be"},
                                            {tagname: "div", innerHTML: "more than 8 characters long", classList:["pw-requirement"], dataset: {met: false}},
                                            {tagname: "div", innerHTML: "and fulfill 3 of these requirements:"},
                                            {tagname: "div", innerHTML: "Contain uppercase letters", classList:["pw-requirement"], dataset: {met: false}},
                                            {tagname: "div", innerHTML: "Contain lowercase letters", classList:["pw-requirement"], dataset: {met: false}},
                                            {tagname: "div", innerHTML: "Contain numbers", classList:["pw-requirement"], dataset: {met: false}},
                                            {tagname: "div", innerHTML: "Contain special characters", classList:["pw-requirement"], dataset: {met: false}},
                                        ]
                                    },
                                    {
                                        tagname: "input",
                                        dataset: {form: "login"},
                                        type: "password",
                                        id: "signup-password-confirm",
                                        placeholder: "Confirm Password",
                                        eventListener: {keydown: matchPasswords}
                                    }
                                ]
                            }
                        ]
                    },{
                        tagname: "div",
                        classList: ["signup-buttons"],
                        childElements: [
                            {
                                tagname: "a",
                                classList: ["login-button"],
                                childElements: [
                                    {
                                        tagname: "i",
                                        classList: ["fa-solid", "fa-xmark", "fa-xl"]
                                    }
                                ],
                                eventListener: {click: closeSignup}
                            },
                            
                            {
                                tagname: "div"
                            },
                            {
                                tagname: "a",
                                classList: ["login-button"],
                                childElements: [
                                    {
                                        tagname: "i",
                                        classList: ["fa-solid", "fa-arrow-right", "fa-xl"]
                                    }
                                ],
                                eventListener: {
                                    "click": sendSignupBtn
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    })
    function closeSignup(e) {
        loginscreen.remove();
    }
    document.body.append(loginscreen)
}

function openStartmenu(event) {
    const startmenu = document.querySelector("start-menu");
    startmenu.dataset.active = startmenu.dataset.active == "false"
}

function openSearch(event) {
    const search = document.querySelector("desktop-search");
    search.dataset.active = search.dataset.active == "false"
    search.children[0].value = ""
    search.children[0].focus();
}

function loseFocus(event) {
    let elements = document.querySelectorAll("[data-closeonfocus='true']")
    for (let e of elements) {
        if (event.target.dataset.ignore=="startmenu" && e.tagName=="START-MENU") {
            continue;
        }
        if (event.target.dataset.ignore=="search" && e.tagName=="DESKTOP-SEARCH") continue;
        e.dataset.active = "false"
    }
}


function openSettings(e) {
    console.log("eventFIred")
    Server.System( {req: "fetch_app", data: { id: "settings" }})
    document.querySelector("start-menu").dataset.active = "false"
    e.stopPropagation();
}



let intervals = [];
let initialMouseX = null;
let initialMouseY = null;
let mouseDown = false;
let targetWindow = null;
let resizeDirection = null;
let originalWindow = null;
/**
 * Saves the initial parameters required for properly resizing windows with the new and improved system
 * @listens mousedown
 * @param {Event} event 
 */
function startResize (event) {
	mouseDown = true;
	initialMouseX = event.clientX;
	initialMouseY = event.clientY;
	targetWindow = event.target.parentNode;
	resizeDirection = event.target.classList[1];
	originalWindow = [
		parseInt(event.target.parentNode.style.width),
		parseInt(event.target.parentNode.style.height),
		event.target.parentNode.offsetTop,
		event.target.parentNode.offsetLeft
	]
}


/**
 * Calculates the required new values for resizing the windows. Resizing from the top/left edge is equivalent to moving and resizing under the hood
 * @listens mousemove
 * @param {Event} event 
 * @returns 
 */
function windowResize(event) {
	event.preventDefault()
	if (!mouseDown) return;
    
	if (targetWindow == null) return;
	if (initialMouseX == null || initialMouseY == null) return;
	
	function top(target) {
		let newTopTop    = originalWindow[2] - (initialMouseY - event.clientY);
		let newTopHeight = originalWindow[1] + (initialMouseY - event.clientY);
		if (newTopHeight < target.dataset.minHeight) return
		if (newTopTop < 0 || newTopTop > window.innerHeight - 30) return
		target.style.height = newTopHeight + "px"
		target.style.top    = newTopTop    + "px"
	}
	function left(target) {
		let newval = originalWindow[0] - (initialMouseX - event.clientX);
		if (newval < target.dataset.minWidth) return;
		target.style.width = newval + "px";
	}
	function bottom(target) {
		let newBottomHeight = originalWindow[1] - (initialMouseY - event.clientY)
		if (newBottomHeight < target.dataset.minHeight) return
		target.style.height = newBottomHeight + "px"
	}
	function right(target) {
		let newRightLeft = originalWindow[3] - (initialMouseX - event.clientX);
		let newRightWidth = originalWindow[0] + (initialMouseX - event.clientX);
		if (newRightWidth < target.dataset.minWidth) return;
		target.style.width = newRightWidth + "px";
		target.style.left = newRightLeft + "px";
	}

	switch(resizeDirection) {
		case "top":
			top(targetWindow)
			break
		case "left":
			right(targetWindow);
			break
		case "bottom":
			bottom(targetWindow);
			break
		case "right":
			left(targetWindow)
			break
		case "topleft":
			top(targetWindow);
			right(targetWindow)
			break
		case "topright":
			top(targetWindow)
			left(targetWindow);
			break
		case "bottomleft":
			bottom(targetWindow);
			right(targetWindow)
			break
		case "bottomright":
			bottom(targetWindow);
			left(targetWindow);
			break
	}
}



/**
 * Resets all initial values because they are no longer needed.
 * @listens mouseup
 * @param {Event} event 
 */
function endResize(event) {
    setTimeout(() => {
	targetWindow = null;
	initialMouseX = null;
	initialMouseY = null;
	mouseDown = false;
	resizeDirection = null;
	originalWindow = null;
    }, 1);
}



export {startResize, windowResize, endResize, openLogin, openSignup, openSettings, loseFocus}