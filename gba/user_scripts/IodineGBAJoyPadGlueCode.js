
/*
 Copyright (C) 2012-2015 Grant Galitz
 
 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 
 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var keyZones = [
    //Use this to control the key mapping:
                //A:
                [88, 74], // x or j
                //B:
                [90, 81, 89], // z, q or y
                //Select:
                [16], // shift
                //Start:
                [13], // enter
                //Right:
                [39], // arrow keys
                //Left:
                [37],
                //Up:
                [38],
                //Down:
                [40],
                //R:
                [50], //2
                //L:
                [49], //1
];
function keyDown(e) {
    var keyCode = e.keyCode | 0;
    for (var keyMapIndex = 0; (keyMapIndex | 0) < 10; keyMapIndex = ((keyMapIndex | 0) + 1) | 0) {
        var keysMapped = keyZones[keyMapIndex | 0];
        var keysTotal = keysMapped.length | 0;
        for (var matchingIndex = 0; (matchingIndex | 0) < (keysTotal | 0); matchingIndex = ((matchingIndex | 0) + 1) | 0) {
            if ((keysMapped[matchingIndex | 0] | 0) == (keyCode | 0)) {
            	console.log(keyMapIndex | 0)
                Iodine.keyDown(keyMapIndex | 0);
                if (e.preventDefault) {
                    e.preventDefault();
                }
            }
        }
    }
}
function keyUp(keyCode) {
    keyCode = keyCode | 0;
    for (var keyMapIndex = 0; (keyMapIndex | 0) < 10; keyMapIndex = ((keyMapIndex | 0) + 1) | 0) {
        var keysMapped = keyZones[keyMapIndex | 0];
        var keysTotal = keysMapped.length | 0;
        for (var matchingIndex = 0; (matchingIndex | 0) < (keysTotal | 0); matchingIndex = ((matchingIndex | 0) + 1) | 0) {
            if ((keysMapped[matchingIndex | 0] | 0) == (keyCode | 0)) {
                Iodine.keyUp(keyMapIndex | 0);
            }
        }
    }
}
function keyUpPreprocess(e) {
    var keyCode = e.keyCode | 0;
    
    switch (keyCode | 0) {
        case 68:
            lowerVolume();
            break;
        case 82:
            raiseVolume();
            break;
        case 51:
            Iodine.incrementSpeed(0.10);
            break;
        case 52:
            Iodine.incrementSpeed(-0.10);
            break;
        case 17:
            if (Iodine.paused) {
                Iodine.play()
            } else {
                Iodine.pause()
            }
            break;
        default:
            //Control keys / other
            keyUp(keyCode);
    }
}
  var wsUri = "ws://127.0.0.1:8080";
  var output;

  function init()
  {
    testWebSocket();
  }

  function testWebSocket()
  {
    websocket = new WebSocket(wsUri);
    websocket.onopen = function(){showTempString("connected")}
    websocket.onclose = testWebSocket
    websocket.onmessage = function(evt) { onMessage(evt) };
    websocket.onerror = testWebSocket
  }

var down1 = false
var down2 = false
var pup =false
var pdwn = false
var plft = false
var pright = false
var oldPot = 1
  function onMessage(evt)
  {
    var data = evt.data.split(",");
    var joyY = parseInt(data[0]);
    var joyX = parseInt(data[1]);
    var joyZ = data[2] == "0";
    var btn1 = data[3] == "1";
    var btn2 = data[4].split("")[0] == "1";
    var pot = parseInt(data[5])
    
    pot = Math.floor(pot / 51.2) / 10 ;    
    var up = joyY > 1000;
    var down = joyY < 24;
    var left = joyX < 24;
    var right= joyX > 1000;
    
    console.log(joyX,joyY,joyZ,btn1,btn2,pot)
    if (btn1 != down1) {
    	if (btn1) {
    		Iodine.keyDown(0)
    	} else {
    		Iodine.keyUp(0)
    	}
    	down1 = btn1
    }
    if (btn2 != down2) {
    	if (btn2) {
    		Iodine.keyDown(1)
    	} else {
    		Iodine.keyUp(1)
    	}
    	down2 = btn2
    }
    if (up != pup) {
    	if (up) {
    		Iodine.keyDown(6)
    	} else {
    		Iodine.keyUp(6)
    	}
    	pup = up
    }
    if (down != pdwn) {
    	if (down) {
    		Iodine.keyDown(7)
    	} else {
    		Iodine.keyUp(7)
    	}
    	pdwn = down
    }
    if (left != plft) {
    	if (left) {
    		Iodine.keyDown(5)
    	} else {
    		Iodine.keyUp(5)
    	}
    	plft = left
    }
    if (pright != right) {
    	if (right) {
    		Iodine.keyDown(4)
    	} else {
    		Iodine.keyUp(4)
    	}
    	pright = right
    }
    if (pot != oldPot) {
    	Iodine.incrementSpeed(pot - oldPot);
    	oldPot = pot
    }
  }

  //window.addEventListener("load", init, false);
