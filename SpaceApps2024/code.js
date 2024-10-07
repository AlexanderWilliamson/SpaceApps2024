// NASA Space Apps Challenge 2024
// Alexander W. Williamson and Alexander R. Williamson
// 2024-10-05 to 2024-10-06

"use strict"
var exoSky = (function() {
	var theSky = document.getElementById("theSky");
	theSky.addEventListener('click', skyClicked);
	document.getElementById("planetSelect").addEventListener("change", renderSky);
	document.getElementById("catalogueSelect").addEventListener("change", setActiveCatalogue);
	const constellationList = document.getElementById("constellationList");
	const svgns = "http://www.w3.org/2000/svg";
	const constellationNames = ["Starweaver", "Celestial Serpent", "Moonshadow", "Skyforge", "Dreamcatcher", "Starlit Bastion", "Nebula's Embrace", "Ecliptic Guardian", "Frostfire", "Aether's Wings", "Radiant Trident", "Echoing Silence", "Phantom's Veil", "Sundancer", "Twilight Enigma", "Void's Embrace", "Shattered Dreams", "Celestial Compass", "Aurora's Heart", "Wraith's Dance", "Luminous Echo", "Nightmare's Shroud", "Fable's Crest", "Chrono's Web", "Mystic Lantern", "Stardust Veil", "Echoing Twilight", "Horizon Breaker", "Zephyr's Touch", "Arcane Shield", "Illusion's Edge", "Solstice Beacon", "Whispering Shadows", "Celestial Fable", "Tempest's Eye", "Glimmering Tides", "Vortex of Stars", "Lunar Mirage", "Elysian Fields", "Crescent Guardian", "Phoenix's Flight", "Celestial Warden", "Ember's Rest", "Astral Bloom", "Nebula's Tear", "Starlight Forge", "Frosted Spire", "Harmony's Glow", "Seraphim's Path", "Dreamweaver's Ascent", "Eclipsed Heart", "Nova's Chariot", "Silhouette's Edge", "Spectral Flame", "Chimera's Grasp", "Riftwalker", "Galactic Horizon", "Veil of Whispers", "Twilight's Grasp", "Sable Enigma", "Astral Wisp", "Echoing Wave", "Celestial Grimoire", "Ember's Whisper", "Rising Phoenix", "Veil of Dreams", "Celestial Scribe", "Luminous Guardian", "Wanderer's Path", "Dawn's Embrace", "Mystic Aurora", "Astral Echo", "Shimmering Veil", "Celestial Dreamer", "Harmonic Convergence", "Sapphire Tide", "Nebula's Glow", "Twilight Horizon", "Aether's Call", "Solstice Whisper", "Astral Sentinel", "Starlight Echo", "Eclipse of Serenity", "Phantom Horizon", "Zephyr's Veil", "Dusk's Embrace", "Stellar Compass", "Arcane Mirage", "Celestial Tapestry", "Radiant Crescent", "Elysium's Crest", "Galactic Serpent", "Moonlit Reverie", "Whispers of Fate", "Sundrop's Embrace"];
	const catalogues = [{}];
	var connections = {};
	var constellations = {};
	var usedConstellationNames = {};
	var lines = {};
	catalogues[0]['connections'] = connections;
	catalogues[0]['constellations'] = constellations;
	catalogues[0]['usedConstellationNames'] = usedConstellationNames;
	catalogues[0]['lines'] = lines;
	catalogues[0]['name'] = "Human Traditional";
	addNewCatalogue("Custom2");
	addNewCatalogue("Custom3");
	var selectedLine = null;
	var bbox = theSky.getBoundingClientRect();
	var linePointer; //pointer for line object
	var planets;
	var stars;
	var lineId = 0;
	var sStar = null;
	var mouseUp = true;
	var clicked = false;
	var clickedElement = null;
	document.getElementById("deleteButton").addEventListener('click', deleteLine);
	
	const starColors = {'O':'#92B5FF' , 'B':'#A2C0FF', 'A':'#D5E0FF', 'F':'#F9F5FF', 'G':'#FFEDE3', 'K':'#FFDAB5', 'M':'#FFB56C', 'C':'#FF954C', 'W':'#4275FF'};

function addNewCatalogue(name){
	catalogues.push({});
	catalogues[catalogues.length - 1]['connections'] = {};
	catalogues[catalogues.length - 1]['constellations'] = {};
	catalogues[catalogues.length - 1]['usedConstellationNames'] = {};
	catalogues[catalogues.length - 1]['lines'] = {};
	catalogues[catalogues.length - 1]['name'] = name;
}

function setActiveCatalogue(){
	let index = Number(document.getElementById("catalogueSelect").value);
	removeAllConstellationsFromList();
	connections = catalogues[index]['connections'];
	constellations = catalogues[index]['constellations'];
	usedConstellationNames = catalogues[index]['usedConstellationNames'];
	lines = catalogues[index]['lines'];
	addAllConstellationsToList();
	renderSky();
	
}

function removeAllConstellationsFromList(){
	for (const [key, value] of Object.entries(usedConstellationNames)){
		constellationList.removeChild(document.getElementById(key));
	}
}

function addAllConstellationsToList(){
	for (const [key, value] of Object.entries(usedConstellationNames)){
		addConstellationToList(key);
	}
}

function atan3(y, x)
{
	var r = Math.atan2(y, x);
	return (r < 0)?(r + 2*Math.PI):r;
}

function shiftPosition(planet, star)
{
	var newX = star.x - planet.x;
	var newY = star.y - planet.y;
	var newZ = star.z - planet.z;
	
	var newDistance = Math.hypot(newX, newY, newZ);
	
	star.shiftedDec =  - (Math.asin(newZ/newDistance) * 180 / Math.PI);
	star.shiftedRA = 360 - (atan3(newY, newX) * 180 / Math.PI);
	star.shiftedmagV = star.MagV + 5*Math.log10(newDistance) - 5;
}


function starClicked(evt){
	event.stopPropagation();
	if (!clicked){
		starStart(evt);
	}
	else
		starEnd(evt);
}

function skyClicked(evt){
	if (!clicked) 
		return;
	
	linePointer = null;
	clicked = false;
}

function starStart(evt){
	clicked = true;
	unSelectLine(selectedLine);
	selectedLine = null;
	sStar = evt.srcElement.getAttribute('data-star');
	console.log("I've been clicked");
}	

function starEnd(evt){
	clicked = false;
	let eStar = evt.srcElement.getAttribute('data-star');
	if (eStar != sStar){
		pairStars(sStar, eStar);
		let newId = 'l' + lineId++;
		theSky.appendChild(drawLine(sStar, eStar, newId));
		lines[newId] = [sStar, eStar];
	}
	console.log("I've been released");
	console.log(connections);
	console.log(constellations);
	console.log(usedConstellationNames);
	console.log(lines);
}

function drawLine(sStar, eStar, id){
	let line = document.createElementNS(svgns, "line");
	line.setAttributeNS(null, "x1", stars[sStar].shiftedRA);
	line.setAttributeNS(null, "y1", stars[sStar].shiftedDec);
	line.setAttributeNS(null, "x2", stars[eStar].shiftedRA);
	line.setAttributeNS(null, "y2", stars[eStar].shiftedDec);
	line.setAttributeNS(null, "id", id);
	line.addEventListener('click', lineClicked);
	line.style.stroke = "#FFF";
	line.style.strokeWidth = "0.6";
	return line;
}

function pairStars(startingStar, endingStar){
	if (startingStar == null || endingStar == null)
		return false;
	if (endingStar in connections){
		if (startingStar in connections){ 
			if (connections[startingStar].includes(endingStar)) {
				return false;
			}
			else if (!areTwoStarsConnected(startingStar, endingStar)){ //if we have the scenario where we have to merge two constellations
				changeConstellationName(startingStar, constellations[endingStar]);
				connections[startingStar].push(endingStar);
				connections[endingStar].push(startingStar);
				console.log("merge two constellations: " + startingStar + ", " + endingStar);
				console.log(constellations[startingStar] + ", " + constellations[endingStar]);
			}
			else{
				connections[startingStar].push(endingStar);
				connections[endingStar].push(startingStar);
			}
		}
		else{ //if we're merging a star with no constellation into a star that is in one
			connections[startingStar] = [endingStar]; //add ending star to starting star list
			constellations[startingStar] = constellations[endingStar]; //set the starting stars constellation to the ending stars one
			connections[endingStar].push(startingStar); //add the starting star to the ending star list
			console.log("we're merging a star with no constellation into a star that is in one: " + startingStar + ", " + endingStar);
		}
	}
	else{
		if (startingStar in connections){ //if the ending star is not part of a constellation but the starting star is
			connections[endingStar] = [startingStar]; //add the starting star to the ending stars list
			constellations[endingStar] = constellations[startingStar]; //set the ending stars constellation to the starting stars one
			connections[startingStar].push(endingStar); //add the ending star to the starting star list
			console.log("the ending star is not part of a constellation but the starting star is: " + startingStar + ", " + endingStar);
		}
		else{ //if neither of them are in a constellation
			var newName = getNewConstellationName();
			connections[startingStar] = [endingStar];
			connections[endingStar] = [startingStar];
			constellations[startingStar] = newName;
			constellations[endingStar] = newName;
			usedConstellationNames[newName] = 1;
			addConstellationToList(newName);
			console.log("neither of them are in a constellation");
		}
	}
	console.log(connections[startingStar]);
	console.log(connections[endingStar]);
	return true;
}

function breakConnection(star1, star2){
	console.log("----");
	console.log("connections star1 before: ");
	console.log(connections[star1]);
	console.log("connections star2 before: ");
	console.log(connections[star2]);
	connections[star1].splice(connections[star1].indexOf(star2), 1);
	connections[star2].splice(connections[star2].indexOf(star1), 1);
	console.log("connections star1 after: ");
	console.log(connections[star1]);
	console.log("connections star2 after: ");
	console.log(connections[star2]);

	if (!areTwoStarsConnected(star1, star2)) { // if the two stars are now separate constellations
		if (connections[star1].length == 0) { // if this is just now a lone star
			console.log("star1 lone");
			delete connections[star1];
			if (document.getElementById(constellations[star1]))
				constellationList.removeChild(document.getElementById(constellations[star1]));
			delete usedConstellationNames[constellations[star1]];
			delete constellations[star1];
		} else { // if this is now a new constellation
			console.log("star1 connected");
			let newName = getNewConstellationName();
			changeConstellationName(star1, newName);
			usedConstellationNames[newName] = 1;
			addConstellationToList(newName);
		}

		if (connections[star2].length == 0) { // same logic as star 1
			console.log("star2 lone");
			delete connections[star2];
			if (document.getElementById(constellations[star2]))
				constellationList.removeChild(document.getElementById(constellations[star2]));
			delete usedConstellationNames[constellations[star2]];
			delete constellations[star2];
		} 
		else {
			console.log("star2 connected");
			let newName = getNewConstellationName();
			changeConstellationName(star2, newName);
			usedConstellationNames[newName] = 1;
			addConstellationToList(newName);
		}
	}
}

function changeConstellationName(startingStar, newName){
	var seen = {};
	var queue = [startingStar];
	seen[startingStar] = 1;
	let oldName = constellations[startingStar];
	constellations[startingStar] = newName;
	while (queue.length > 0){ //just changing all the constellations using dfs
		var curStar = queue.pop();
		connections[curStar].forEach((newStar) => {
			if (!(newStar in seen)){
				constellations[newStar] = newName;
				queue.push(newStar);
				seen[newStar] = 1;
			}
		});
	}
	if (document.getElementById(oldName))
		constellationList.removeChild(document.getElementById(oldName));
}

function areTwoStarsConnected(star1, star2){
	let seen = {}
	seen[star1] = 1
	let queue = [star1]
	while (queue.length > 0){
		var curStar = queue.pop();
		if (curStar == star2)
			return true;
		
		connections[curStar].forEach((newStar) => {
			if (!(newStar in seen)){
				queue.push(newStar);
				seen[newStar] = 1;
			}
		});
	}
	return false;
}

function getNewConstellationName(){
	var newName = constellationNames[Math.floor(Math.random() * constellationNames.length)];
	if (newName in usedConstellationNames){
		var cur = 1;
		while (newName + cur in usedConstellationNames){cur += 1;};
		newName = newName + cur;
	}
	
	return newName;
}

function lineClicked(evt){
	unSelectLine(selectedLine);
	if (selectedLine == evt.srcElement.id){
		selectedLine = null;
	}
	else{
		selectLine(evt.srcElement.id);
	}
}

function selectLine(curLine){
	document.getElementById(curLine).style.stroke = "red";
	selectedLine = curLine;
}

function unSelectLine(selectedLine){
	if (selectedLine == null)
		return;
	
	document.getElementById(selectedLine).style.stroke = "white";
}

function deleteLine(){
	if (selectedLine == null)
		return;
	
	console.log(selectedLine);
	console.log(lines);
	breakConnection(lines[selectedLine][0], lines[selectedLine][1]);
	theSky.removeChild(document.getElementById(selectedLine));
	delete lines[selectedLine];
	selectedLine = null;
}

function drawAllLines(){
	for (const [key, value] of Object.entries(lines)){
		theSky.appendChild(drawLine(value[0], value[1], key));
	}
}

function addConstellationToList(name){
	var newElement = document.createElement("span");
	newElement.id = name;
	newElement.textContent = name;
	newElement.addEventListener('click', (evt) => {
		var item = evt.srcElement;
		var input = document.createElement("input");
		input.value = item.textContent;
		delete usedConstellationNames[item.textContent];
		item.textContent = '';
		item.appendChild(input);
		input.focus();
		
		input.addEventListener('keydown', (evt) => {
			if (evt.key === 'Enter'){
				item.textContent = input.value;
				if (item.textContent == '' || item.textContent in usedConstellationNames){
					let newName = getNewConstellationName();
					item.textContent = newName;
				}
				usedConstellationNames[item.textContent] = 1;
				item.id = item.textContent;
			}
		});
	});
	constellationList.appendChild(newElement);
}

function renderSky()
{	
	// drawGridLines
	var plt = document.getElementById("planetSelect").value;
	console.log(typeof Number(plt));
	
	/*
	planets.forEach((p) => {
		var newElement = document.createElementNS(svgns, 'circle'); //Create a path in SVG's namespace
//		newElement.setAttribute("d","M 0 0 L 10 10"); //Set path's data
        newElement.setAttributeNS(null, 'cx', p.ra);
        newElement.setAttributeNS(null, 'cy', p.dec);
        newElement.setAttributeNS(null, 'r', "1");
		newElement.style.stroke = "#FFF"; //Set stroke colour
		newElement.style.strokeWidth = "0"; //Set stroke width
		newElement.style.fill = "white"
		theSky.appendChild(newElement);
	});
	*/
	
	var p0 = planets[Number(plt)];
	var planetData = document.getElementById("planetData");
	planetData.innerHTML = "For planet 0: name = "+p0.pl_name+"<br>";
	planetData.innerHTML += "The distance to the planet is = "+p0.sy_dist.toFixed(2)+"<br>";
	planetData.innerHTML += "For planet 0: (ra, dec) = ("+p0.ra.toFixed(2)+", "+p0.dec.toFixed(2)+")"+"<br>";
	planetData.innerHTML += "For planet 0: (x, y, z) = ("+p0.x.toFixed(2)+", "+p0.y.toFixed(2)+", "+p0.z.toFixed(2)+")";

	theSky.innerHTML = "";
	stars.forEach((p) => {
		shiftPosition(p0, p);
		
		var newElement = document.createElementNS(svgns, 'circle'); //Create a path in SVG's namespace
//		newElement.setAttribute("d","M 0 0 L 10 10"); //Set path's data
		newElement.setAttributeNS(null, 'cx', p.shiftedRA);
        newElement.setAttributeNS(null, 'cy', p.shiftedDec);
        newElement.setAttributeNS(null, 'r', (1/(p.shiftedmagV+4)+0.8));
		newElement.style.stroke = "#FFF"; //Set stroke colour
		newElement.style.strokeWidth = "0"; //Set stroke width
		newElement.setAttributeNS(null, 'data-star', p.idx.toString());

		if (p.shiftedmagV > 4.5 || p.class[0] == undefined)
			newElement.setAttributeNS(null, 'display', 'none');
		else{
			newElement.addEventListener('click', starClicked);
			newElement.style.fill = starColors[p.class[0].toUpperCase()];
		}
		
		
		var newTitle = document.createElementNS(svgns, 'title'); //Create a path in SVG's namespace
		newTitle.textContent = p.identifier;
		
		newElement.appendChild(newTitle);
		theSky.appendChild(newElement);
	});
	
	drawAllLines();
}

async function init() {
	const [planetsResponse, starsResponse] = await Promise.all([
		fetch('https://www.ytree.net/Alexander/SpaceApps2024/planets.json'),
		fetch('https://www.ytree.net/Alexander/SpaceApps2024/stars.json')
	]);

	planets = await planetsResponse.json();
	stars = await starsResponse.json();

	// Calculate cartesian positions and absolute magnitude.
	planets.forEach((p, idx) => {
		p.x = p.sy_dist * Math.cos(p.dec * Math.PI / 180) * Math.cos(p.ra * Math.PI / 180);
		p.y = p.sy_dist * Math.cos(p.dec * Math.PI / 180) * Math.sin(p.ra * Math.PI / 180);
		p.z = p.sy_dist * Math.sin(p.dec * Math.PI / 180);
		p.idx = idx;
	});

	stars.forEach((p, idx) => {
		p.x = p.distance * Math.cos(p.dec * Math.PI / 180) * Math.cos(p.ra * Math.PI / 180);
		p.y = p.distance * Math.cos(p.dec * Math.PI / 180) * Math.sin(p.ra * Math.PI / 180);
		p.z = p.distance * Math.sin(p.dec * Math.PI / 180);
		p.MagV = p.magV - 5*Math.log10(p.distance) + 5;
		p.idx = idx;
	});
	
	// Add planets to selector
	const planetSelect = document.getElementById("planetSelect");
	planets.forEach((p, idx) => {
		var opt = document.createElement("option");
		opt.value = idx;
		opt.textContent = p.pl_name;
		planetSelect.appendChild(opt);
	});
	
	renderSky();
}
  
if (document.readyState === 'loading') {
	// wait for page to become interactive
	document.addEventListener('DOMContentLoaded', init, false);
}
else if (document.readyState) {
	// DOM is available (page loaded or interactive)
	init();
}
else {
	// fall-back for lagacy browsers
	window.onload = init;
}
   

})();

// eof