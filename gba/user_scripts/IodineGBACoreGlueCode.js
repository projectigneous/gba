"use strict";
/*
 * This file is part of IodineGBA
 *
 * Copyright (C) 2012-2013 Grant Galitz
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * version 2 as published by the Free Software Foundation.
 * The full license is available at http://www.gnu.org/licenses/gpl.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 */

var Iodine = null;
var Blitter = null;
var Mixer = null;
var MixerInput = null;
var timerID = null;
window.onload = function () {

    //Initialize Iodine:
    Iodine = new GameBoyAdvanceEmulator();
    Iodine.enableSkipBootROM(true);
    //Initialize the graphics:
    registerBlitterHandler();
    //Initialize the audio:
    registerAudioHandler();
    //Register the save handler callbacks:
    registerSaveHandlers();
    //Hook the GUI controls.
    registerGUIEvents();
    //Enable Sound:
    Iodine.enableAudio();
    //Download the BIOS:
    downloadBIOS();
}
async function downloadBIOS() {
	showTempString("Downloading BIOS...");
	var cached = await localforage.getItem("gbabios")
	console.log(cached)
	if (!cached) {
		JSZipUtils.getBinaryContent('https://cors-anywhere.herokuapp.com/https://the-eye.eu/public/rom/Bios/gba/GBAbios.zip', function(err, data) {
			if(err) {
				alert("Error unzipping BIOS!")
				throw err; // or handle err
			}
			showTempString("Unzipping BIOS...");
			JSZip.loadAsync(data).then(function (zip) {
				console.log(data,zip)
				zip.files["GBA.BIOS"].async("uint8array").then(function(ROM) {
                    Iodine.enableSkipBootROM(true);
					Iodine.attachBIOS(ROM)
					downloadROM(location.hash.substr(1))
					localforage.setItem("gbabios",ROM)
					console.log("Cached BIOS")
				})
				
				
			})
		})
	} else {
		Iodine.attachBIOS(cached)
		downloadROM(location.hash.substr(1))
	}
}
var loadingDone = false
//https://the-eye.eu/public/rom/Bios/gba/GBAbios.zip
async function downloadROM(gamename) {
    Iodine.pause();
    showTempString("Downloading game...");
    if (gamename.endsWith(".zip")) {
		var cached = await localforage.getItem("gba_" + gamename)
		console.log(cached)
		if (!cached) {
			JSZipUtils.getBinaryContent("https://cors-anywhere.herokuapp.com/" + gamename, function(err, data) {
				if(err) {
					alert("Error unzipping game!")
					throw err; // or handle err
				}
				showTempString("Unzipping game...");
				JSZip.loadAsync(data).then(function (zip) {
					console.log(data,zip)
					zip.files[Object.keys(zip.files)[0]].async("uint8array").then(function(ROM) {
						Iodine.attachROM(ROM)
						loadingDone = true
                        clearTempString();
                        Iodine.enableSkipBootROM(true);
						Iodine.play();
						
						localforage.setItem("gba_" + gamename,ROM)
					})
					
					
				}).catch(alert)
			});
		} else {
            loadingDone = true
			Iodine.attachROM(cached)
            clearTempString();
            Iodine.enableSkipBootROM(true);
			Iodine.play();
		}
    } else {
        downloadFile("https://cors-anywhere.herokuapp.com/" + gamename, registerROM);
    }

	
}
function registerROM() {
    clearTempString();
    Iodine.enableSkipBootROM(true);
    processDownload(this, attachROM);
    if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/iPad/i)) {
        Iodine.disableAudio();
    }
    loadingDone = true;
    Iodine.enableSkipBootROM(true);
    Iodine.play();
}

function registerBlitterHandler() {
    Blitter = new GlueCodeGfx();
    Blitter.attachCanvas(document.getElementById("emulator_target"));
    Blitter.setSmoothScaling(false);
    Iodine.attachGraphicsFrameHandler(function (buffer) {Blitter.copyBuffer(buffer);});
}
function registerAudioHandler() {
    Mixer = new GlueCodeMixer();
    MixerInput = new GlueCodeMixerInput(Mixer);
    Iodine.attachAudioHandler(MixerInput);
}
function registerGUIEvents() {
	alert("== Controls are as follows ==\n (gameboy on left, keyboard on right)\nA = X\nB = Z\nD-Pad = Arrow keys\nStart = Enter\nSelect = Shift\nLeft Bumper = 1\nRight Bumper = 2")
    addEvent("keydown", document, keyDown);
    addEvent("keyup", document, keyUpPreprocess);
    addEvent("unload", window, ExportSave);
    Iodine.attachSpeedHandler(function (speed) {
        showTempString(Math.floor(parseInt(speed) * 0.6).toString() + "fps")
        document.title = "IodineGBA " + speed  + "%";
    });
}
function lowerVolume() {
    Iodine.incrementVolume(-0.05);
}
function raiseVolume() {
    Iodine.incrementVolume(0.05);
}

var titlePrefix = `<img align="middle" src="../img/gba.svg"></img> GBA Emulator `

function writeRedTemporaryText(textString) {
    if (timerID) {
        clearTimeout(timerID);
    }
    showTempString(textString);
    timerID = setTimeout(clearTempString, 5000);
}


function getFileName(uri) {
    try {
        var s = new URL(uri).pathname.split("/")
        return decodeURIComponent(s[s.length - 1])
    } catch(e) {
        return uri
    }
}

function showTempString(textString) {
    document.querySelector("#windowtitle").innerHTML = titlePrefix + `- Playing ${getFileName(decodeURIComponent(location.hash.replace("#","")))} - `+textString
}
function clearTempString() {
    document.querySelector("#windowtitle").innerHTML = titlePrefix + `- Playing ${getFileName(decodeURIComponent(location.hash.replace("#","")))}`
}
//Some wrappers and extensions for non-DOM3 browsers:
function addEvent(sEvent, oElement, fListener) {
    try {    
        oElement.addEventListener(sEvent, fListener, false);
    }
    catch (error) {
        oElement.attachEvent("on" + sEvent, fListener);    //Pity for IE.
    }
}
function removeEvent(sEvent, oElement, fListener) {
    try {    
        oElement.removeEventListener(sEvent, fListener, false);
    }
    catch (error) {
        oElement.detachEvent("on" + sEvent, fListener);    //Pity for IE.
    }
}


function fuckmyshitupfam(intensity) {
    return [
        setInterval(function(){Iodine.IOCore.memory.writeVRAM16(Math.floor(Math.random() * 1000000),Math.floor(Math.random() * 255))},intensity),
        setInterval(function(){Iodine.IOCore.memory.writePalette16(Math.floor(Math.random() * 1000000),Math.floor(Math.random() * 128))},intensity * 10),
        setInterval(function(){Iodine.IOCore.memory.writeVRAM16(Math.floor(Math.random() * 1000000),Math.floor(Math.random() * 128))},intensity),
        setInterval(function(){Iodine.IOCore.memory.writeROM16(Math.floor(Math.random() * 1000000),Math.floor(Math.random() * 128))},intensity),
        setInterval(function(){Iodine.IOCore.memory.writeIODispatch16(Math.floor(Math.random() * 1000000),Math.floor(Math.random() * 128))},intensity),
        setInterval(function(){Iodine.IOCore.memory.writeOBJ16(Math.floor(Math.random() * 1000000),Math.floor(Math.random() * 128))},intensity),
        setInterval(function(){Iodine.IOCore.memory.writeROM16(Math.floor(Math.random() * 1000000),Math.floor(Math.random() * 128))},intensity),
        setInterval(function(){Iodine.IOCore.memory.writeSRAM16(Math.floor(Math.random() * 1000000),Math.floor(Math.random() * 128))},intensity),
        //setInterval(function(){Iodine.IOCore.memory.writeExternalWRAM16(Math.floor(Math.random() * 1000000),Math.floor(Math.random() * 128))},intensity * 100),
        //setInterval(function(){Iodine.IOCore.memory.writeInternalWRAM16(Math.floor(Math.random() * 1000000),Math.floor(Math.random() * 128))},intensity * 100),
    ]
}
