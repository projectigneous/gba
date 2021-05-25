if (navigator.userAgent.includes(" Edge/")) {
    alert("This website does not work properly in Microsoft Edge. Please try again in Google Chrome or Firefox.")
    location.replace("about:blank")
}
async function pingEye() {
    var up = false
    try {
        up = (await fetch("https://cors-anywhere.herokuapp.com/https://the-eye.eu/public/rom/")).ok
    } catch(e){up = false}
    var keys = await localforage.keys()
    if (!up) {
        document.querySelector("#down > h1").innerHTML = "The game server could not be contacted.<br><a href='https://cors-anywhere.herokuapp.com/corsdemo'>Try requesting access</a><br><br><iframe width=900 height=70 src='https://cors-anywhere.herokuapp.com/corsdemo' style='border:0'></iframe><br>And then <a href='javascript:location.reload()'>reload this page.</a>"
        setTimeout(function() {
            document.querySelector("iframe").onload = () => location.reload()
        },1000)
        if (keys.length >= 2) {
            document.querySelector("#dlOnly").checked = true
            document.querySelector("#dlOnly").disabled = true
            document.querySelector("#down").style.transition = "1s top"
            setTimeout(function() {
                document.querySelector("#down").style.top = "100vh"
                document.querySelector("#down > h1").style.opacity = "0"
                search("",true)
            },100)
        }
    } else {
        document.querySelector("#down > h1").innerText = "Connected"
        document.querySelector("#down").style.transition = "1s top"
    
        setTimeout(function() {
            document.querySelector("#down").style.top = "100vh"
            document.querySelector("#down > h1").style.opacity = "0"
        })
    }
}
pingEye()


function hideGame() {
    setTimeout(function(){document.querySelector("#game").src = "about:blank"},1000)
    document.querySelector("#game").style.top = "100vh"
    document.querySelector("#game").style.transform = "translate(-50%,0%)"
    document.querySelector("#gamebox").style.top = "100vh"
    search(document.querySelector("input").value,document.querySelector("#dlOnly").checked)
}
document.querySelector("#gamebox").onclick =hideGame
function fits(number,multi) {
    return Math.floor(number/multi)
}
var consoleHeight = 160
var consoleWidth = 240
function resize() {
    var vert = fits(window.innerHeight,consoleHeight)
    var horiz = fits(window.innerWidth,consoleWidth)
    console.log(vert,horiz)
    var width = consoleWidth * vert
    var height = consoleHeight * vert
    if (vert > horiz) {
        width = consoleWidth * horiz
        height = consoleHeight * horiz
    }
    console.log(width,height)
    document.querySelector("#game").style.width = (width + 12) + "px"
    document.querySelector("#game").style.height = (height + 34) + "px"
}
window.onresize = resize
function playGame(game,console) {
    //launcher.html#
    if (console == "gba") {
        consoleWidth = 240
        consoleHeight = 160
    }
    document.querySelector("#game").src = console + "/launcher.html#" + game
    document.querySelector("#game").style.top = "50vh"
    document.querySelector("#game").style.transform = "translate(-50%,-50%)"
    document.querySelector("#gamebox").style.top = "0px"
    resize()
}
function downloadGame(game,console) {
    alert("Soon")
}
async function search(query,dlOnly) {
    var ht = ""
    var keys = await localforage.keys()
    for (var game of gbaGames) {
        if (game.toLowerCase().includes(query.toLowerCase()) && !game.includes("(J)")) {
            //console.log(game)
            var classes = ""
            if (keys.includes("gba_" + encodeURI(game))) {
                classes = "downloaded"
            }
            if (dlOnly && !keys.includes("gba_" + encodeURI(game))) {} else { 
                ht += `<a class="gbaGame game ${classes}" href='javascript:playGame("${encodeURIComponent(game).replace(/'/g, "&apos;")}","gba")'>${game.split("/").pop().replace(".zip","")}</a> <a alt="Download game" href='javascript:downloadGame("${encodeURIComponent(game).replace(/'/g, "&apos;")}","gba")'>V</a> <br>`
            }
        }
    }
    document.querySelector("#container").innerHTML = ht
}

search(document.querySelector("input").value,document.querySelector("#dlOnly").checked)
document.querySelector("button").onclick = function() {
    search(document.querySelector("input").value,document.querySelector("#dlOnly").checked)
}
document.querySelector("#dlOnly").onchange = function() {
    search(document.querySelector("input").value,document.querySelector("#dlOnly").checked)
}

async function sizeInM() {
    var total = 0
    for (var keys of await localforage.keys()) {
        total = total + (await localforage.getItem(keys)).length
    }

    return total / 1000000
}

function randomize() {
    var games = document.querySelectorAll(".game")
    var game = games[Math.floor(Math.random() * (games.length - 1))]
    game.style.fontSize = "300%"
    window.scrollTo(0,game.offsetTop - (window.innerHeight / 2))
    console.log(game)
    setTimeout(function(){game.click()},500)
    
}

window.onhashchange = function(e) {
    if (e.newURL.endsWith("#exit")) {
        hideGame()
        location.hash = ""
    }
}