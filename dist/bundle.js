/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	//main js file for GunMan game
	
	__webpack_require__(1);
	__webpack_require__(3);
	__webpack_require__(5);
	__webpack_require__(6);
	__webpack_require__(12);
	__webpack_require__(15);
	
	var canvas = __webpack_require__(16);
	var points = __webpack_require__(17);
	var sounds = __webpack_require__(18);
	
	//Store local high scores
	// localStorage.clear();
	
	if (!localStorage.highScoreEasy){
		localStorage.highScoreEasy = 0;
	}
	
	if (!localStorage.highScoreHard){
		localStorage.highScoreHard = 0;
	}
	
	var helpers = { // helper functions
		randomTrueOrFalse : function(){
			return ((Math.random() - 0.5) < 0) ? false : true;
		},
		removeAllChildren : function(domElement){
			while (domElement.firstChild) {
				domElement.removeChild(domElement.firstChild);
			}
		},
		parseNum : function(num){
			return (num / 1000).toFixed(2);
		}
	};
	
	var gameData = {   // main game variables and methods for reseting them
		names: ['billy', 'bob', 'mark', 'randy', 'sheffer'],
		turn : 0,
		gameDurationMs : 0,
		lives : 3,
		timer : '',
		foulState : false,
	
		deleteAllOutlaws : function(){
			var canvasChildren = canvas.domElement.children;
			for(var ind = canvasChildren.length-1; ind > 0; ind-- ){
				if (canvasChildren[ind].id.substring(0,6) == 'outlaw' ){
					canvas.domElement.removeChild(canvasChildren[ind]);
				}
			}
		},
	
		resetGameData : function (){
			points.killedTime = [];
			opponents.dead = [];
			opponents.alive = [];
			canvas.domElement.className = 'canvas canvas-light';
			gameData.gameDurationMs = 0;
			points.myTimeDivElement.innerHTML = 'Time 0.00';
			helpers.removeAllChildren(document.querySelector('#oppEndTimes'));
			canvas.winLose.style.visibility = 'hidden';
			gameData.deleteAllOutlaws();
		}
	};
	
	var opponents = {  //describes opponents in current round
		alive: [],
		dead : [],
	
		defineSkill : function(){
			var step = points.isHard ? 500 : 750;
			var diffPercent = points.isHard ? 50 : 25;
			var minTime = points.isHard ? 400 : 500;
			var len = opponents.alive.length;
			var skillValues = [];
	
			function getSkillTime() {
				do{
					var rndDiff = Math.round( ( (step / 100) * diffPercent * 2  *
								  Math.random() ) - (step / 100) * diffPercent );
					rndDiff = Math.floor(rndDiff / 10 ) * 10;
					var skill = step * len + rndDiff;
				}while (skill < minTime);
				return skill;
			}
	
			for (; len > 0; len--) {
				var currSkill = getSkillTime();
				skillValues.push(currSkill);
			}
	
			skillValues.sort(function(){
				return Math.random() - 0.5;
			});
	
			opponents.alive.forEach(function(opp, index){
				opp.skill = skillValues[index];
			});
		},
	
		getRndName: function(){
			var randNum = Math.floor( Math.random() * gameData.names.length );
			return gameData.names[randNum];
		},
	
		spawn: function(num){  //spawn new opponent
			var dimension = Math.round( 100 / num );
			for (var i = 0, len = gameData.names.length, position = -dimension / 2; i < num; i++){
				var name = gameData.names[ i % len ];
				position += dimension;
				opponents.alive.push( new Opponent( name, position + '%' ));
			}
		},
	
		showSkills: function(){
			setTimeout(function () {
					opponents.alive.forEach( function(opp) {
						opp.skillEl = document.createElement('div');
						opp.skillEl.innerHTML = helpers.parseNum(opp.skill);
						opp.skillEl.id = 'stats-' + opp.domElement.id;
						opp.skillEl.className = 'skillsOptions';
						opp.skillEl.style.left = opp.domElement.style.left;
						canvas.statElement.appendChild(opp.skillEl);
					});
			}, 25);
		},
	
		kill : function(killedOpp){
			canvas.flick();
			var newArr = [];
			opponents.alive.forEach(function(opp){
				if (opp.name != killedOpp.name ){
					newArr.push(opp);
				}
			});
			opponents.alive = newArr;
		},
	
		getById : function (killedId) {
			for (var i = opponents.alive.length; i > 0; i--){
				if(opponents.alive[i-1].domElement.id == killedId){
					return opponents.alive[i-1];
				}
			}
		},
	
	//WaitThenDo method delays action of an opponent in ms and plays sound if passed in
	
		WaitThenDo : function(ms, action, sound){
			setTimeout(function () {
				opponents.alive.forEach(function(opp){
					opp[action]();
				});
	
				if (sound) {sounds.playNewStopOld(sound);}
			}, ms);
		},
	};
	
	//gamePlay object consisnts of gameplay methods and describes game actions
	
	var gamePlay = {
		checkIfInGame : function () {  //checks if alive opponents time to shoot
			var flag = true;
			for (i = opponents.alive.length - 1; i >= 0; i--){
				 flag = flag && (gameData.gameDurationMs < opponents.alive[i].skill);
			}
			return flag;
		},
	
		startGameTimer : function(){  //main game phase when timer starts
			gamePlay.timer = setTimeout(function tick() {
					gameData.gameDurationMs += 10;
					points.myTimeDivElement.innerHTML = 'Time ' + helpers.parseNum(gameData.gameDurationMs);
	
					if ( !gamePlay.checkIfInGame() && !gameData.foulState ) { //your time expired, you've been shoot
						clearTimeout(gamePlay.timer);
						console.log('You lose!');
						gameData.lives--;
						canvas.livesEl.innerHTML = 'Lives ' + gameData.lives;
						canvas.winLose.style.visibility = 'visible';
						canvas.winLose.innerHTML = 'You lose!';
						opponents.alive.forEach(function(opp){
							opp.gunmanSayDomElement.innerHTML = 'You\'re dead';
							opp.domElement.removeChild(opp.svgIcon);
						});
	
						sounds.playOnTop('shoot');
	
						canvas.red();
						canvas.domElement.removeEventListener('click', gamePlay.shootPhase, true);
						opponents.alive[opponents.alive.length - 1].domElement.removeEventListener('transitionend', startGame);
						opponents.WaitThenDo(10, 'talk', 'youLost');
						opponents.WaitThenDo(3500, 'walkOut');
						opponents.alive[opponents.alive.length - 1].domElement.addEventListener('transitionend', newRound);
					}
	
					else{
						if (opponents.alive.length === 0) {  //you killed all opponents
							console.log('you win!');
							points.resolveKilledTimePoints();
							canvas.winLose.style.visibility = 'visible';
							canvas.winLose.innerHTML = 'You win!';
							opponents.alive.forEach(function(opp){
								opp.gunmanSayDomElement.innerHTML = 'you win!';
							});
							clearTimeout(gamePlay.timer);
							canvas.domElement.removeEventListener('click', gamePlay.shootPhase, true);
							sounds.playNewStopOld('youWon');
							gameData.turn += 1;
							setTimeout(gamePlay.updateScore, 1500);
						}
						else {  // continue next timer count
							gamePlay.timer = setTimeout(tick, 10);
						}
					}
			}, 10);
		},
	
		shootPhase : function (e) { //detects the mouse click (the user's shoot )
			e.stopPropagation();
			sounds.playOnTop('shoot');
	
			if (!gameData.gameDurationMs) {  //checks if there is foul state (user shoot before timer starts)
				gamePlay.foul();
			} else if (e.target.id == 'Head' ||  //detects the clicked bode part element
					   e.target.id == 'Arm' ||
					   e.target.id == 'Belly' ||
					   e.target.id == 'Leg') {
	
				var killedDOMEl = e.target.parentNode.parentNode.parentNode;  //detects the shot dom element
				var killedOpponent = opponents.getById(killedDOMEl.id);
				killedOpponent.killingTime = gameData.gameDurationMs + 10;
				killedOpponent.killedBodyPart = e.target.id;
				opponents.dead.push(killedOpponent);
				killedOpponent.gunmanSayDomElement.innerHTML = killedOpponent.killedBodyPart +
				 						' ' + points[killedOpponent.killedBodyPart] + ' pts';
				console.log('you hit ' + killedOpponent.name + '\'s ' +  killedOpponent.killedBodyPart);
				killedOpponent.skillEl.innerHTML = '<strike>' +
													killedOpponent.skillEl.innerHTML +
													'</strike><br>' +
													helpers.parseNum(killedOpponent.killingTime);
				opponents.kill(killedOpponent);
				killedOpponent.fall();
			}
		},
	
		foul : function(){
			clearTimeout(gameData.timer);
			gameData.foulState = true;
			console.log('foul');
			clearTimeout(gamePlay.startGameTimer);
			canvas.foul();
			canvas.winLose.style.visibility = 'visible';
			canvas.winLose.innerHTML = 'Foul';
			canvas.domElement.removeEventListener('click', gamePlay.shootPhase, true);
			opponents.alive[opponents.alive.length - 1].domElement.removeEventListener('transitionend', startGame);
	
			opponents.alive.forEach(function(opp){
				opp.domElement.style.left = opp.startPosition;
				opponents.WaitThenDo(10, 'walkOut', 'foul');
			});
	
			gameData.lives--;
			canvas.livesEl.innerHTML = 'Lives ' + gameData.lives;
	
			opponents.alive[opponents.alive.length - 1].domElement.addEventListener('transitionend', newRound);
			gameData.foulState = false;
		},
	
		updateScore : function(){
	
			function waitAndPrint(deadOpp){
				setTimeout(function () {
					deadOpp.skillEl.innerHTML = '<strike>' + helpers.parseNum(deadOpp.skill) + '</strike>' +
												'<br>' + helpers.parseNum(deadOpp.killingTime);
					deadOpp.killingTime += 10;
	
					if (deadOpp.killingTime <= deadOpp.skill) {
						points.amount += 1;
						points.printPoints();
						sounds.playNewStopOld('bonusPoint');
						waitAndPrint(deadOpp);
					} else {
						deadOpp.gunmanSayDomElement.classList.add('blinkBodyPartsScore');
						sounds.playOnTop('cashRegister');
						setTimeout(function () {
							points.updateBodyParts(deadOpp.killedBodyPart);
							callScoringSuccessively();
						}, 350);
					}
				}, 20);
			}
	
			function callScoringSuccessively() {
				last--;
	
				if (opponents.dead[last]) {
					setTimeout(function () {
						waitAndPrint(opponents.dead[last]);
						// sounds.bonusPoint.play();
	
	
					}, 500);
				} else {
					setTimeout(newRound , 2000);
				}
			}
	
			var last = opponents.dead.length;
			callScoringSuccessively();
		},
	
		optionsPanel : function(){
	
			canvas.domElement.style.cursor = 'default';
			console.log('options');
			canvas.chooseOptions();
			points.isHard = true;
	
			var optionsEl = document.querySelector('#options');
			optionsEl.innerHTML = __webpack_require__(19);
			canvas.domElement.appendChild(optionsEl);
	
			var highscoreEl = document.querySelector('#highscoreEl');
			highscoreEl.innerHTML = 'Highscore: ' + (points.isHard ? points.addNulls(localStorage.highScoreHard)
																	: points.addNulls(localStorage.highScoreEasy));
	
			var difficultyEl = document.querySelector('#difficultyEl');
	
			difficultyEl.addEventListener('change', function(){
				sounds.playOnTop('weapon');
				points.isHard = difficultyEl.checked;
				highscoreEl.innerHTML = 'Highscore: ' + (points.isHard ? points.addNulls(localStorage.highScoreHard)
																		: points.addNulls(localStorage.highScoreEasy));
			});
	
			var startNewGameButton = document.querySelector('#startNewGame');
	
			gameData.deleteAllOutlaws();
			canvas.hideInfo();
			optionsEl.style.visibility = 'visible';
	
			startNewGameButton.addEventListener('click', function(){
				sounds.playOnTop('reload');
	
				setTimeout(function () {
					canvas.showInfo();
					points.amount = 0;
					points.printPoints();
					gameData.lives = 3;
					canvas.livesEl.innerHTML = 'Lives ' + gameData.lives;
					gameData.turn = 0;
					helpers.removeAllChildren(optionsEl);
					newRound();
				}, 400);
			});
	
			var aboutEl = document.querySelector('#about');
			aboutEl.addEventListener('click', function(){
				sounds.playOnTop('weapon');
				helpers.removeAllChildren(optionsEl);
				optionsEl.innerHTML = __webpack_require__(20);
				var xCloseEl = document.querySelector('#xClose');
				xCloseEl.addEventListener('click', function(){
					sounds.playOnTop('weapon');
					helpers.removeAllChildren(optionsEl);
					gamePlay.optionsPanel();
	
				});
	
			});
	
	
		}
	};
	
	Opponent.prototype = {
		init : function(){
			this.domElement = document.createElement('div');
			this.domElement.id = 'outlaw-' + (opponents.alive.length);
			this.domElement.classList.add('shooter');
	
			this.startPosition = ( helpers.randomTrueOrFalse() ) ?
					this.domElement.style.left = '-7%' :
					this.domElement.style.left = '107%';
	
			canvas.domElement.appendChild(this.domElement);
			this.gunmanSayDomElement = document.createElement('div');
			this.gunmanSayDomElement.className = 'prompts';
			this.domElement.appendChild(this.gunmanSayDomElement);
		},
	
		switchClass : function (newClass){
			this.domElement.className = 'shooter';
			this.domElement.classList.add(newClass);
		},
	
		addSVG : function (){
			this.svgIcon = document.createElement('div');
			this.svgIcon.innerHTML = __webpack_require__(21)("./" + this.name + '_inlineSVG.html');
			this.domElement.appendChild(this.svgIcon);
		},
	
		walkIn : function(){
			this.domElement.style.left = this.position;
			this.switchClass('icon-' + this.name + '-walk');
		},
	
		walkOut : function(){
			this.domElement.style.left = this.startPosition;
			this.switchClass('icon-' + this.name + '-walk');
			this.gunmanSayDomElement.style.visibility = 'hidden';
		},
	
		stand : function(){
			this.switchClass('icon-' + this.name + '-stand');
		},
	
		unholster : function(){
			this.switchClass('icon-' + this.name + '-unholster');
		},
	
		aim : function(){
			this.switchClass('icon-' + this.name + '-aim');
			this.addSVG();
			this.gunmanSayDomElement.innerHTML = 'Fire!';
			this.gunmanSayDomElement.style.visibility = 'visible';
		},
	
		fall : function(){
			this.domElement.removeChild(this.svgIcon);
			this.switchClass('icon-' + this.name + '-fall');
			hatDomElement = document.createElement('div');
			hatDomElement.className = 'hat icon-' + this.name + '-hat';
			hatDomElement.style.top = '25%';
	
			if ( helpers.randomTrueOrFalse() ) {
				hatDomElement.style.animationName = 'flying-hat-right';
			} else {
				hatDomElement.style.animationName = 'flying-hat-left';
			}
			this.domElement.appendChild(hatDomElement);
		},
	
		talk : function(){
			this.switchClass('icon-' + this.name + '-talk');
		},
	};
	
	function Opponent(name, position){
		this.name = name;
		this.skill = 0;
		this.skillEl = '';
		this.position = position;
		this.killingTime = 0;
		this.killedBodyPart = '';
		this.init();
	}
	
	function newRound(){
		canvas.statElement.style.visibility = 'visible';
		canvas.domElement.style.cursor = 'crosshair';
	
	 	if (gameData.lives !== 0)	 {
			console.log('---------------------------');
			console.log('Game turn', gameData.turn % gameData.names.length + 1);
			gameData.resetGameData();
	
			opponents.spawn(gameData.turn % gameData.names.length + 1);
			opponents.defineSkill();
			opponents.alive[opponents.alive.length - 1].domElement.removeEventListener('transitionend', newRound);
			opponents.showSkills();
	
			// each opponent perform action after the specified delay in ms
			// and the last arg is music to play along
	
			opponents.WaitThenDo(10, 'walkIn', 'oneOutlawIntro');
	
			readyToStart = function (){
				opponents.WaitThenDo(1, 'stand', 'prepareToShoot');
				startGame();
			};
	
			opponents.alive[opponents.alive.length - 1].domElement.addEventListener('transitionend', readyToStart);
	
	
		}
		else {
			opponents.alive[opponents.alive.length - 1].domElement.removeEventListener('transitionend', newRound);
			console.log('game over!');
			sounds.playNewStopOld('gameOver');
	
			canvas.winLose.innerHTML = 'Game over';
	
			points.highScore = points.isHard ? localStorage.highScoreHard : localStorage.highScoreEasy;
	
			if (points.highScore < points.amount){
				if (points.isHard){
					localStorage.highScoreHard = points.amount;
				} else {
					localStorage.highScoreEasy = points.amount;
				}
			}
	
			points.amount = 0;
			setTimeout(function () {
				gamePlay.optionsPanel();
				sounds.playNewStopOld('prepareToPlay');
	
			}, 6000);
		}
	}
	
	
	function startGame(){
		opponents.alive[opponents.alive.length - 1].domElement.removeEventListener('transitionend', readyToStart);
	
		//listen to shoot clik
		sounds.playNewStopOld('prepareToShoot');
		canvas.domElement.addEventListener('click', gamePlay.shootPhase, true);
		// pause before shooting
		gameData.timer = setTimeout(function () {
			if (!gameData.foulState) {		//checks if there is no foul
				gamePlay.startGameTimer();
				opponents.WaitThenDo(1, 'unholster');
				opponents.WaitThenDo(150, 'aim', 'fire');
			}
		}, 2 * Math.floor( (1.5 + Math.random()) * 1000 ));
	}
	
	gamePlay.optionsPanel();
	sounds.playNewStopOld('prepareToPlay');


/***/ },
/* 1 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 2 */,
/* 3 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 4 */,
/* 5 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 6 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 13 */,
/* 14 */,
/* 15 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 16 */
/***/ function(module, exports) {

	// canvas object describes main game window element and its methods
	
	
	var canvas = {
		domElement: document.querySelector('#canvas'),
		winLose: document.querySelector('#winLose'),
		statElement: document.querySelector('#oppEndTimes'),
		livesEl: document.querySelector('#lives'),
	
		hideInfo : function(){
			var canvasChildren = canvas.domElement.children;
			Array.prototype.forEach.call(canvasChildren, function(child){
				child.style.visibility = 'hidden';
			});
		},
	
		showInfo: function(){
			var canvasChildren = canvas.domElement.children;
			Array.prototype.forEach.call(canvasChildren, function(child){
				child.style.visibility = 'visible';
			});
		},
	
		chooseOptions : function(){
			canvas.domElement.className = 'canvas canvas-options';
		},
	
		red: function(){
			canvas.domElement.className = 'canvas canvas-red';
		},
	
		foul: function(){
			canvas.domElement.className = 'canvas canvas-foul';
		},
	
		flick: function(){
	
			var del = 65;
			canvas.domElement.className = 'canvas canvas-white';
	
			setTimeout(function () {
				canvas.domElement.className = 'canvas canvas-light';
			}, del);
	
			setTimeout(function () {
				canvas.domElement.className = 'canvas canvas-dark';
			}, del*2);
	
			setTimeout(function () {
				canvas.domElement.className = 'canvas canvas-light';
			}, del*3);
	
			setTimeout(function () {
				canvas.domElement.className = 'canvas canvas-dark';
			}, del*4);
	
			setTimeout(function () {
				canvas.domElement.className = 'canvas canvas-light';
			}, del*5);
	
			setTimeout(function () {
				canvas.domElement.className = 'canvas canvas-dark';
			}, del*6);
	
			setTimeout(function () {
				canvas.domElement.className = 'canvas canvas-light';
			}, del*7);
		}
	};
	
	
	module.exports = canvas;


/***/ },
/* 17 */
/***/ function(module, exports) {

	var points = {
	
		myTimeDivElement : document.querySelector('#gameTime'),
		pointsDomElement : document.querySelector('#points'),
		amount: 0,
		isHard: true,
	
		highScore: localStorage.highScoreEasy,
	
		Head: 20,
		Belly: 15,
		Arm: 5,
		Leg: 5,
	
		updateBodyParts: function(part){
			points.amount+= points[part];
			points.printPoints();
		},
	
		killedTime : [],
	
		resolveKilledTimePoints: function(){
	
			points.killedTime.forEach(function(pts){
				var ppp = Math.round(pts / 50);
				points.amount += ppp;
				console.log('time pts ' + ppp + 'pts');
			});
			points.printPoints();
		},
	
		addNulls: function(str){
			var len = str.toString().length;
			return '00000'.substring(0, 5 - len) + str;
		},
	
		printPoints: function(){
			points.pointsDomElement.innerHTML = 'Points ' + points.addNulls(points.amount);
		}
	};
	
	module.exports = points;


/***/ },
/* 18 */
/***/ function(module, exports) {

	//sounds object consisnts of sounds and two methods for play them
	//playNewStopOld stops the previous sound and plays new one one
	//playOnTop method plays sound on top of another sound (for example music)
	
	var sounds = {
	
		bonusPoint : new Audio('./src/sounds/bonus.mp3'),
		fire : new Audio('./src/sounds/fire.mp3'),
		foul : new Audio('./src/sounds/foul-muz.mp3'),
		gameOver : new Audio('./src/sounds/game-over.mp3'),
		oneOutlawIntro : new Audio('./src/sounds/one-outlaw-intro-muz.mp3'),
		prepareToShoot : new Audio('./src/sounds/prepare-to-shoot-muz.mp3'),
		shoot : new Audio('./src/sounds/shoot.mp3'),
		youLost : new Audio('./src/sounds/you-lost-muz.mp3'),
		youWon : new Audio('./src/sounds/you-won-muz.mp3'),
		prepareToPlay : new Audio('./src/sounds/prepare-to-play-muz.mp3'),
		reload : new Audio('./src/sounds/reload.mp3'),
		weapon : new Audio('./src/sounds/weapon.mp3'),
		cashRegister : new Audio('./src/sounds/cash-register.mp3'),
	
		playOnTop : function(sfx){
			sounds[sfx].currentTime = 0;
			sounds[sfx].play();
		},
	
		oldSfx : new Audio('./src/sounds/click.mp3'),
		playNewStopOld : function(sfx) {
			sounds.oldSfx.pause();
			sounds.oldSfx = sounds[sfx];
			sounds[sfx].currentTime = 0;
			sounds[sfx].play();
		},
	};
	
	sounds.bonusPoint.volume = 0.2;
	module.exports = sounds;


/***/ },
/* 19 */
/***/ function(module, exports) {

	module.exports = "<div id='about' class='about'>About</div>\n\n<div id='highscoreEl' class='highScore'></div>\n\n<div id='startNewGame' class='newGame'>Start new game</div>\n\n<div class='mode'>\n\t<input type='checkbox' id='difficultyEl' checked='true'>\n\t<label for='difficultyEl'>Difficulty:</label>\n\t<div></div>\n</div>\n";

/***/ },
/* 20 */
/***/ function(module, exports) {

	module.exports = "<div id='xClose' class='xClose'>[x]</div>\n\n<div class='about-text'>\n\t<ul>\n\t\t<li>A replica of 'Wild Gunman' Nintendo game orginally created\n\t\tin 1974 by Gunpei Yokoi redesigned and programmed by Vladimir Matveev\n\t\t</li>\n\t\t<li><br></li>\n\t\t<li>Used tools:</li>\n\t\t<li>- Vanilla JS</li>\n\t\t<li>- SASS</li>\n\t\t<li>- Webpack</li>\n\t\t<li>- Sprites and SVG</li>\n\t\t<li><br></li>\n\t\t<li>Features:</li>\n\t\t<li>- 'Hard' and 'practice' play modes</li>\n\t\t<li>- Highscores for each mode stored locally</li>\n\t\t<li>- Head, arm, leg, body shoot detection</li>\n\t</ul>\n</div>\n";

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./billy_inlineSVG.html": 22,
		"./bob_inlineSVG.html": 23,
		"./mark_inlineSVG.html": 24,
		"./randy_inlineSVG.html": 25,
		"./sheffer_inlineSVG.html": 26
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 21;


/***/ },
/* 22 */
/***/ function(module, exports) {

	module.exports = "<svg xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 72 126' version='1.1' xmlns:cc='http://creativecommons.org/ns#' xmlns:dc='http://purl.org/dc/elements/1.1/'>\n  <path id='Belly' d='M52,35c-4.57,10.892-6.067,11.731-15.188,11.969-8.19,0.213-11.28-1.79-13.624-3.969-0.10184-4.8527-1.4026-6.0435-3.7812-6.1875,0.06662,0.37795-0.60441,1.6075-0.53125,5.0938,0.72929,3.2032-0.53823,4.759-1.2188,17.344-0.17518,3.2396-1.7376-0.37996-3.0938,2.6562-1.5125,3.3862-0.49026,8.8689-1.0938,10.406-2.7203,6.93,2.4255-1.3914,2.5938,7.4375-0.87444,4.6777,0.35289,0.88408-1.5938,6.4062,3.2439-1.8465,3.7337-0.22177,8.5-1.6562,6.7722-2.0382,13.291,0.50305,20.5,0.375,5.4225-0.09632,11.693-2.7002,14.406-0.34375-0.73033-0.6858-1.836-1.2151-3.4062-1.2188-1.0907-0.0025-1.9109-3.9545-1.75-5.7812,0.32764-3.7205-1.3242-9.4033-2.5625-11.25,4.101-9.295,3.894-11.617,3.094-23.625,1.529-5.925-0.356-4.322-1.25-7.656zm5.875,49.531c0.18088,0.1571,0.3521,0.32777,0.5,0.53125-0.13793-0.18977-0.31457-0.35712-0.5-0.53125z' />\n  <path id='Leg' d='m10.469,100c0.63023,0-2.55-1.1101-2.5029-0.10313,0.023466,0.50135-0.92161,1.8543,0.23032,2.8822,0.65419,0.58371,3.318,5.1765,3.4298,4.5869,0.50045,5.0298,5.0486,8.1101,1.252,8.26-1.1,0-0.87801,0.824-0.87801,1.374s-2.0384,1.187-2.9027,1.187c-0.86429,0-2.5883,1.3998-3.374,2.1855-0.7857,0.78,0.2767,1.19,0.2767,2.06,0,1.1667,4.1589,1.3463,1.1892,1.3463l20.865,0.21,3.243-5.19-1.513-10.81-1.5919-6.4919,4.1837-2.6176,7.1288-0.28898,3.7559,5.4512-2.7619,6.0587-0.18066,2.0089-0.31929,7.0557,3.9476,4.8239,21.514,0.43243c-2.971,0,0.539-0.83,0.539-1.99,0-2.02-2.416-4.44-4.438-4.44-0.864,0-1.562-0.45-1.562-1s-0.9-1-2-1c-1.7604-2.5763-1.5206-5.0486,5.0732-12.904,1.4814-1.7648,0.5181-4.6568,1.3603-6.8125-3.209-8.537-2.79-7.918-5.683-10.538-1.906-4.333-9.145-0.986-15.293-0.876-7.209,0.128-13.73-2.413-20.502-0.375-4.7663,1.4345-5.2561-0.17926-8.5,1.6672-1.0841,0.6171,0.06067-0.22078-1.0826,2.3695-0.50842,1.1519-0.37413,1.0557-0.22097,3.6241,0.40828,6.8469-0.18275,5.3344-2.6828,7.8405z' />\n  <path id='Arm' d='m55.375,37.688c-1.3453-1.0695,1.0967-1.2921-3.1562-1.8438,0.32745,0.98847,1.0923,1.1938,1.25,2,0.37778,1.9314-0.21437,3.3978-0.21875,4.8125,0.79988,12.008,1.0071,14.33-3.0938,23.625,1.2383,1.8467,2.8901,7.5295,2.5625,11.25-0.16086,1.8267,0.65929,5.7787,1.75,5.7812,1.9689,0.0046,3.2251,0.81282,3.9062,1.75,0.168-1.11,1.141-0.089,3.626-3.062,0.40305-0.48234,1.8438-0.71884,2.7188-1.5938,2.0685-3.2859,3.3383-4.8256,4.2306-7.3472,0.8857-2.5031,0.36849-6.2193,0.36452-9.059-0.41417-3.3276-2.4574-7.8692-2.4574-7.8692s-1.1644-5.6106-3.8118-8.2579c-1.9067-1.9067-2.2557-4.3836-2.8784-4.3836-0.38917,0-2.8233-5.9033-4.7912-5.8017zm-36.344-1.032c-0.32485,0.02562-0.89486,0.1426-1.8438,0.21875-0.78522,1.4678-3.7706,3.3882-5.7885,5.3537-2.749,2.678-3.398,5.348-3.398,6.209,0,0.86-1.5936,1.333-2.1436,1.333s0.1436,2.479,0.1436,5.229-1.2505,5.229-1.8005,5.229c-0.5556,0-0.1995,2.438-0.1995,5.771,0,3.3333,0.44444,6,1,6,1.9054,0,0.31356,4.4791-1.9362,6.4807-1.5262,1.358-1.1617,2.933-0.3138,3.238,1.4803,0.531,1.6912,4.128,0.25,4.281-2.151,0.22872-1.8005,2.3884-1.8005,4.3318,0,2.6983,1.6219,3.5521,4.2693,6.1995,1.9067,1.9067,4.1567,3.4688,5,3.4688,2.5-2.506,3.0958-0.99688,2.6875-7.8438-0.21528-3.6101-0.12482-1.9227,1.3125-6,1.9466-5.5222,0.71931-1.7285,1.5938-6.4062-0.16828-8.8289-5.3141-0.5075-2.5938-7.4375,0.60348-1.5374-0.41872-7.0201,1.0938-10.406,1.3562-3.0362,2.9186,0.58337,3.0938-2.6562,0.68052-12.585,1.948-14.141,1.2188-17.344-0.09755-4.6484,1.1308-5.3268,0.15625-5.25z' />\n  <path id='Head' d='m90.817,15.749c-1.115,0.006-2.8844,0.91561-4.4375,2.4688-1.35,1.35-2.4375,3.15-2.4375,4,0,0.87879-0.86274,1.5312-2,1.5312-1.1,0-2,0.45-2,1s-1.1625,1-2.5625,1c-2.1922,0-7.4375,3.8647-7.4375,5.4688,0,0.3,1.8,0.53125,4,0.53125,4.4392,0,4.9984,0.83884,2,3-2.738,1.9734-2.738,8.0266,0,10,2.1094,1.5204,2.5337,3.3851,1.193,5.8864,3.7955-0.3046,5.8747-0.08895,6.0048,6.1089,2.3442,2.1793,5.4389,4.2021,13.63,3.9887,9.1203-0.23761,10.603-1.0921,15.173-11.984,0-2.0606,0.48313-3,1.5625-3,4.3903,0,6.2251-8.27,2.4375-11-2.9984-2.1612-2.4392-3,2-3,2.2,0,4-0.23125,4-0.53125,0-1.604-5.2766-5.4688-7.4688-5.4688-1.4,0-2.5312-0.45-2.5312-1s-0.9-1-2-1c-1.1372,0-2-0.65246-2-1.5312,0-0.85-1.1188-2.65-2.4688-4-2.485-2.485-5.5312-3.302-5.5312-1.4688,0,0.55-1.8,1-4,1s-4-0.45-4-1c0-0.68746-0.45599-1.0036-1.125-1z'  transform='translate(-59.941982,-13.748731)' />\n</svg>\n";

/***/ },
/* 23 */
/***/ function(module, exports) {

	module.exports = "<svg xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 52 152' version='1.1' xmlns:cc='http://creativecommons.org/ns#' xmlns:dc='http://purl.org/dc/elements/1.1/'>\n  <path id='Head' d='M20.571,50.571c1.841-1.84,1.808-2.571-0.116-2.571-2.43,0-6.455-4.648-6.455-7.455,0-1.4-0.45-2.545-1-2.545s-1-0.801-1-1.779c0-0.979-0.9-2.428-2-3.221-1.3208-0.952-2-2.589-2-4.82,0-2.463-0.8118-4.136-3-6.18-3.6377-3.398-3.7088-4.382-0.5454-7.545,2.972-2.972,6.5924-3.165,8.5454-0.455,2.1047,2.9201,5,2.6042,5-0.54546,0-2.8261,5.08-8.7146,5.7595-6.6761,0.52856,1.5857,3.9525,1.5857,4.4811,0,0.679-2.0389,5.759,3.8491,5.759,6.6761,0,3.149,2.895,3.465,5,0.545,1.953-2.71,5.573-2.517,8.545,0.455,3.164,3.163,3.093,4.147-0.545,7.545-2.188,2.044-3,3.717-3,6.18,0,2.231-0.679,3.868-2,4.82-1.1,0.793-2,2.242-2,3.221,0,0.978-0.45,1.779-1,1.779s-1,1.145-1,2.545c0,2.807-4.025,7.455-6.455,7.455-1.924,0-1.9572,0.73109-0.11688,2.5714-4.0713-0.24907-6.3529-0.12386-10.857,0z' />\n  <path id='Leg' d='M11.638,101.05c0,1.1-1.188,4.95-0.638,4.95s1,0.85208,1,1.9062c0,1.0542,0.5625,2.1792,1.25,2.5,1,0.46666,1,0.72084,0,1.1875-1.561,0.72-1.803,22.4-0.25,22.4,1.5344,0,1.1777,6.9473-0.4375,8.5625-0.785,0.79-2.8334,1.44-4.562,1.44-3.3996,0-6,1.93-6,4.44,0,1.25,1.1941,1.56,5.9062,1.56,3.7556,0,6.1297-0.45657,6.5-1.25,0.46666-1,0.72084-1,1.1875,0,0.77983,1.6711,3.2067,1.5746,4.9688-0.1875,1.68-1.68,2.074-16.56,0.437-16.56-0.57143,0-1-3-1-7s0.42857-7,1-7c0.55,0,1-0.9,1-2s0.45-2,1-2,1-0.9,1-2c0-1.3333,0.66667-2,2-2s2,0.66667,2,2c0,1.1,0.45,2,1,2s1,0.9,1,2,0.45,2,1,2c0.57143,0,1,3,1,7s-0.42857,7-1,7c-1.6371,0-1.243,14.882,0.4375,16.562,1.7621,1.7621,4.1889,1.8586,4.9688,0.1875,0.46666-1,0.72084-1,1.1875,0,0.37027,0.79343,2.7444,1.25,6.5,1.25,4.712,0,5.906-0.31,5.906-1.56,0-2.51-2.6-4.44-6-4.44-1.729,0-3.777-0.65-4.562-1.44-1.616-1.61-1.972-8.56-0.438-8.56,1.5533,0,1.3115-21.678-0.25-22.406-1-0.46666-1-0.72084,0-1.1875,0.6875-0.32084,1.25-1.4458,1.25-2.5,0-1.05,0.45-1.9,1-1.9s1.8736-4.1762,1.8736-5.2762c-11.566-1.5584-18.87-1.1008-31.236,0.32762z' />\n  <path id='Arm' d='m16.031,52c-1.976,0-4.0064,0.91269-5.5625,2.4688-2.1053,2.106-2.468,3.384-2.468,9,0,3.697-0.4352,6.531-1,6.531-0.55,0-1,1.8-1,4s-0.45,4-1,4-1,1.35-1,3-0.45,3-1,3c-0.57831,0-1,3.1676-1,7.5312,0,6.8476,0.25887,7.8214,2.6875,10.25,1.7108,1.7108,2.8022,2.2184,3.0625,1.4375,0.653-1.96,2.25-1.41,2.25,0.78,0,1.0294,0.40492,1.8633,0.90625,1.9688,0.20434-2.011-0.07352-5.6918,2.3125-5.3438,1.4773,0.0596,3.4721,0.36282,3.8438-0.59375,1.4492-3.7305-0.93311-9.7926-1-14.094-0.202-13.032,0.173-24.8-0.031-33.946zm19.938,0c-3.8391,13.154,2.62,13.903-0.84375,44.688-0.1053,0.93584,0.84873,2.5783,1.9688,3.1875,1.7622,0.95843,4.2075,0.6384,5.7812,0.84375,0,0.31329-0.11497,0.88646-0.28125,1.5312,0.52323-0.45526,1.2621-0.2138,1.6562,0.96875,0.26032,0.78095,1.3517,0.27331,3.0625-1.4375,2.429-2.427,2.688-3.401,2.688-10.249,0-4.363-0.422-7.531-1-7.531-0.55,0-1-1.35-1-3s-0.45-3-1-3-1-1.8-1-4-0.45-4-1-4c-0.56481,0-1-2.8343-1-6.5312,0-5.6162-0.36269-6.8939-2.4688-9-1.556-1.556-3.586-2.469-5.562-2.469z'/>\n  <path id='Belly' d='m26.156,50.438c-1.6423,0.01565-3.3416,0.06307-5.5938,0.125-0.785,0.785-2.816,1.437-4.531,1.437,0.20407,9.1463-0.17129,20.914,0.03125,33.938,0.06689,4.3011,2.4492,10.363,1,14.094,4.1822,0.26266,15.471-0.32912,20.719,0.125-1.315-0.481-2.746-2.157-2.656-3.472,3.464-30.785-2.995-31.534,0.844-44.688-1.715,0-3.746-0.652-4.531-1.438-2.036-0.124-3.639-0.14-5.282-0.124z'/>\n</svg>\n";

/***/ },
/* 24 */
/***/ function(module, exports) {

	module.exports = "<svg xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 82 146' version='1.1' xmlns:cc='http://creativecommons.org/ns#' xmlns:dc='http://purl.org/dc/elements/1.1/'>\n  <path id='Head' d='m85.248,68.903c1.0026,0-1.2065-0.46612-1.2065-2.174,0-1.4704,0.99336-3.5165,2.25-4.6346,1.5262-1.3579,1.8479-2.1463,1-2.4506-0.71086-0.25517-1.25-2.138-1.25-4.3654,0-3.25,0.34043-3.9167,2-3.9167,1.1,0,2-0.45,2-1s-0.9-1-2-1-2-0.45-2-1c0-0.55556-2.6667-1-6-1-5.3333,0-6-0.22222-6-2,0-1.1-0.45-2-1-2s-1-2.25-1-5v-5h10,10v-6c0-3.3333,0.44444-6,1-6,0.55,0,1-0.70714,1-1.5714,0-2.9328,2.7021-4.4286,8-4.4286s8,1.4958,8,4.4286c0,0.86429,0.45,1.5714,1,1.5714,0.55555,0,1,2.6667,1,6v6h10,10v5c0,2.75-0.45,5-1,5-0.54999,0-1,0.9-1,2,0,1.7778-0.66666,2-6,2-3.3333,0-6,0.44444-6,1,0,0.55-0.90001,1-2,1s-2,0.45-2,1,0.9,1,2,1c1.6596,0,2,0.66667,2,3.9167,0,2.1959-0.53671,4.0956-1.2216,4.3239-1.3947,0.46491,3.4292,5.7595,5.2476,5.7595-0.30242,0.86192-4.028,3.3024-4.9229,4.1932-1.6953,1.6874-1.1481,1.7713-3.5344,2.8302-3.0854,1.3691-3.8156,6.5027-10.892,6.6629-8.2723,0.1873-6.0862-3.398-9.5372-5.1786-2.1795-1.1246-2.1831-3.2786-4.3626-3.9845-1.5623-0.50604-2.7543,0.09091-3.5702-0.98176z' transform='translate(-62.041145,6.6386404)' />\n  <path id='Leg' d='m13,114c1.65,1.5413,3,3.5269,3,4.4062,0,0.87933,0.45,1.5938,1,1.5938s1,1.35,1,3c0,2.0606-0.48313,3-1.5625,3-2.361,0-4.438,2.54-4.438,5.44,0,1.41-0.45,2.56-1,2.56-1.4359,0-1.2355,6.8128,0.25,8.5,0.79824,0.90665,3.3281,1.4444,7,1.4688,5.7307,0.0379,5.75,0.0212,5.75-2.9688,0-2.5556,0.37202-3,2.5625-3,2.7868,0,5.4375-2.0586,5.4375-4.2188,0-0.74287,0.9-1.9884,2-2.7812,1.1-0.79284,2-2.0527,2-2.7812,0-0.72859,1.1179-2.4304,2.5-3.8125,2.224-2.224,2.684-2.3473,4-1.0312,0.81786,0.81786,1.5,1.9795,1.5,2.5938,0,1.66,4.689,6.03,6.469,6.03,1.222,0,1.531,1.25,1.531,6,0,5.9619,0.0081,6,2.9062,6,1.6042,0,3.1792-0.5625,3.5-1.25,0.46667-1,0.72083-1,1.1875,0,0.37026,0.79343,2.7444,1.25,6.5,1.25h5.906v-3.56c0-3.78-1.832-6.44-4.438-6.44-0.864,0-1.562-0.45-1.562-1s0.9-1,2-1c1.5556,0,2-0.66667,2-3,0-1.65-0.45-3-1-3-1.457,0-1.2274-7.7168,0.25-8.4062,1-0.46666,1-0.72084,0-1.1875-0.6875-0.32084-1.25-1.8958-1.25-3.5,0-1.6-0.45-2.9-1-2.9-4.1722-2.6436-28.133,1.3326-34.461,2.1664-6.3835,0.84121-4.1042,1.7466-6.0734,1.3431-2.2977-0.4708-1.453-5.4672-7.0661-4.5365-2.322,0.39-3.337,4.75-6.4,5.03z'/>\n  <path id='Arm' d='M60.031,72c-0.302,0.862-4.042,3.297-4.937,4.188-1.696,1.687-1.145,1.784-3.532,2.843,5.725,17.827,4.889,16.559,4.407,30.279,4.948-0.33,9.152-0.29,10.843,0.6-0.454-0.38-0.812-1.99-0.812-3.91,0-2.2-0.45-4-1-4-0.618,0-1-5.182-1-13.562,0-13.622-0.674-16.438-3.969-16.438zm-38.031,1.375c0,1.708-0.529,2.625-1.531,2.625-2.001,0-6.469,4.468-6.469,6.469,0,0.85-0.45,1.531-1,1.531s-1,1.35-1,3-0.45,3-1,3c-0.604,0-1,4.195-1,10.59,0,10.49,0.032,10.64,3,13.41,3.063-0.28,4.085-4.65,6.406-5.03,5.613-0.93,4.765,4.06,7.063,4.53-0.512-1.15,0.077-1.82-0.094-3.41-0.056-0.52-0.213-1.13-0.5-1.9-0.942-2.54-4.346-7.48-4.563-9.471-0.443-4.101,1.991-5.012,2.626-9.157,0.813-5.31,6.014-10.124,2.843-13.031-1.562-0.506-2.746,0.073-3.562-1,1.002,0-1.219-0.448-1.219-2.156z'/>\n  <path id='Belly' d='m26.781,76.531c3.1712,2.9069-2.0307,7.7211-2.8438,13.031-0.6346,4.1445-3.0689,5.055-2.625,9.1562,0.21603,1.9959,3.6208,6.9341,4.5625,9.4688,0.28671,0.77172,0.44353,1.3835,0.5,1.9062,0.17093,1.5823-0.41786,2.2567,0.09375,3.4062,1.9691,0.40347-0.32104-0.50254,6.0625-1.3438,3.9653-0.52254,14.833-2.2612,23.438-2.8438,0.483-13.74,1.319-12.472-4.406-30.299-3.085,1.369-3.798,6.496-10.874,6.657-8.273,0.187-6.112-3.407-9.563-5.188-2.18-1.125-2.164-3.263-4.344-3.969z'/>\n</svg>\n";

/***/ },
/* 25 */
/***/ function(module, exports) {

	module.exports = "<svg xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#' xmlns='http://www.w3.org/2000/svg' height='100%' width='100%' version='1.1' xmlns:cc='http://creativecommons.org/ns#' xmlns:dc='http://purl.org/dc/elements/1.1/' viewBox='0 0 76 150'>\n  <path id='Leg' d='m18.625,104.97c0,7.4113,0.26808,8.7517,2,10,2.2267,1.6049,2.7306,6.5401,0.75,7.3438-0.94656,0.38407-0.89284,0.75899,0.21875,1.5312,1.2388,0.86065,1.0869,1.3422-0.96875,3.125-2.0376,1.7672-2.1967,2.2731-0.96875,3.0625,1.2867,0.82718,1.2836,1.061-0.03125,1.9375-1.2797,0.85313-1.2973,1.1313-0.09375,1.9062,1.1073,0.71297,0.27929,2.0145-3.8125,6-4.4089,4.2944-5.0077,5.2831-3.9062,6.5312,1.6634,1.885,12.366,2.14,13.219,0.3125,0.46666-1,0.72084-1,1.1875,0,1.1783,2.5249,6.4062,0.30639,6.4062-2.7188,0-0.84342,1.5652-2.7682,3.1562-4.2188,1.1176-1.0189-0.18364-31.938,0.40625-31.938,0.21819,0,0.11503-0.64247,3.8125,0.71875,0.1397,26.845,0.63792,30.491,1.2812,31.062,1.6502,1.4653,3.3438,3.4996,3.3438,4.375,0,3.0251,5.228,5.2437,6.4062,2.7188,0.46667-1,0.72083-1,1.1875,0,0.85643,1.8352,11.144,1.6372,13.031-0.25,1.3302-1.3302,0.92631-2.0693-3.7188-6.5938-4.1044-3.9978-4.9197-5.2871-3.8125-6,1.2035-0.77495,1.1859-1.0531-0.09375-1.9062-1.3148-0.87653-1.3179-1.1103-0.03125-1.9375,1.2279-0.78941,1.0688-1.2953-0.96875-3.0625-2.0556-1.7828-2.2076-2.2644-0.96875-3.125,1.1116-0.77226,1.1653-1.1472,0.21875-1.5312-1.6978-0.6889-1.5736-5.1452,0.1875-6.9062,1.7426-1.7426,4.236-1.8544,4.7812-0.21875-6.0663-21.554-16.872-13.015-29.259-14.203-3.0643,1.435-4.2882-0.58249-12.96,3.9846z' />\n  <path id='Belly' d='m50.969,53.719c-1.2944,0.69403-3.4512,1.2467-5.552,2.7267-2.0163,1.4205-3.9447,3.7796-6.7016,3.9894-1.5568,0.11847-4.6324-1.2224-6.6992-2.648-2.7247-1.8793-4.3733-4.0184-5.1934-4.2743-2.0924-0.69632-0.97665,5.0482,0.89855,7.9492,1.1157,1.726,3.6718,2.599,3.0288,2.2258-5.0143,15.862-6.5754,20.386,0.84375,37.281,7.7132,0.73978,14.809-2.2847,20.531,0.53125,2.7548-17.009,6.1996-13.431,6.625-18.656,5.9492-7.5476,1.1955-16.985-3-25.156-1.9385-3.7755-3.7123-1.8818-4.7812-3.9688zm8.8125,58.125c0.15745,0.4371,0.28529,0.87431,0.4375,1.3438-0.1493-0.45896-0.28316-0.91581-0.4375-1.3438z' />\n  <path id='Arm' d='M54.469,46.844c0.557,0.483,2.567,2.895,1.625,4.281-1.062,1.562-5.125,2.118-5.125,2.594,1.069,2.087,2.842,0.193,4.781,3.969,4.195,8.171,8.949,17.608,3,25.156-0.425,5.225-3.87,1.647-6.625,18.656,3.461,1.71,6.433,5.57,8.719,13.69,0.613,1.84,11.781-9.8,11.781-12.28,0-1.17-1.35-3.4-3-4.941,1.527-1.953,1.358,0.075,1.563-3.438,1.665-1.665,2.053-14.562,0.437-14.562-0.556,0-1-2.667-1-6,0-3.334-0.444-6-1-6-0.55,0-1-1.8-1-4s-0.45-4-1-4-1-0.681-1-1.531c0-2.43-4.662-6.469-7.469-6.469-1.688,0-2.531-0.543-2.531-1.625,0-0.898-0.972-2.473-2.156-3.5zm-33.407,5.125c-2.021,0-4.437,2.416-4.437,4.437,0,0.865-0.45,1.563-1,1.563s-1,2.25-1,5-0.45,5-1,5c-0.583,0-1,3.333-1,8,0,4.666,0.417,8,1,8,0.55,0,1,2.152,1,4.781,0,3.632,0.48,5.123,2,6.219,1.732,1.248,2,2.588,2,10.001,8.672-4.57,9.904-2.57,12.969-4-7.424-16.908-5.866-21.427-0.844-37.314-9.594-5.58,1.953-9.438-9.312-11.625-0.135,0.252-0.243,0.286-0.376-0.062z' />\n  <path id='Head' d='m21.052,51.973c0.56208,1.4821,0.99089-3.8802,2.5714-4,1.7679,0,1.0657-3.5112-1-5-1.3552-0.97681-2-2.5887-2-5s-0.64475-4.0232-2-5c-2.8319-2.0411-2.8319-9.9589,0-12,1.1-0.79284,2-2.0376,2-2.7662,0-1.7851,4.5467-6.2338,6.3712-6.2338,0.80417,0,1.664,0.5625,1.9108,1.25,0.30436,0.84789,1.0927,0.52621,2.4506-1,2.0408-2.2936,5.2673-3.0594,5.2673-1.25,0,0.55,0.9,1,2,1s2-0.45,2-1c0-1.8094,3.2266-1.0436,5.2673,1.25,1.3579,1.5262,2.1463,1.8479,2.4506,1,0.24678-0.6875,1.1066-1.25,1.9108-1.25,1.8245,0,6.3712,4.4486,6.3712,6.2338,0,0.72858,0.9,1.9734,2,2.7662,2.8319,2.0411,2.8319,9.9589,0,12-1.3276,0.95685-2,2.5887-2,4.8535,0,2.2479-0.73453,4.049-2.153,5.2792l-2.153,1.8673,2.153,1.8673c0.55676,0.48288,2.5674,2.9007,1.6255,4.2864-1.0614,1.5615-5.1293,2.1013-5.1293,2.5771-7.8609,3.793-6.572,5.1293-12.759,7.295-16.557-6.516-3.1121-6.4659-17.156-9.0259z'/>\n</svg>\n";

/***/ },
/* 26 */
/***/ function(module, exports) {

	module.exports = "<svg xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 164' height='100%' width='100%' version='1.1' xmlns:cc='http://creativecommons.org/ns#' xmlns:dc='http://purl.org/dc/elements/1.1/'>\n <path id='Head' d='m19.181,35.54c0.51647,1.2537,2.7863,3.7005,2.7863,4.6791,0,0.97858,0.45,1.7812,1,1.7812s1,1.35,1,3c0,2.3333-0.44444,3-2,3,9.5249,3.6853,11.871,2.9765,20,0-1.5556,0-2-0.66667-2-3,0-1.65,0.45-3,1-3s1-0.80267,1-1.7812c0-0.97859,0.89948-1.9574,2-3.2188s1.1226-1.6777,1.9036-4.1032c0.38949-1.2095-0.38593-3.9201-0.77018-6.1684-0.38424-2.2483-3.5934-2.6634,4.8666-2.7285,3.3,0,6-0.24822,6-0.5625,0-1.1733-2.922-3.4375-4.4375-3.4375-0.86429,0-1.5625-0.45-1.5625-1s-1.8-1-4-1h-4v-5.532c0-7.596-2.7343-10.469-10-10.469s-10,2.8728-10,10.469v5.5312h-4c-2.2,0-4,0.45-4,1s-0.69821,1-1.5625,1c-1.5155,0-4.4375,2.2642-4.4375,3.4375,0,0.31428,2.7,0.5625,6,0.5625,3.1498,0.22614,3.4034-0.11414,6.1135-0.56296-1.4354,1.9903-2.8482,7.3729-0.89984,12.103z'/>\n <path id='Arm' d='M17.969,46c-1.251,0-2,0.669-2,1.781,0,0.979-2.525,4.27-3.625,5.063-2.6991,2.513-1.893,2.638-3.6878,7.562-3.2996,5.559-4.053,7.113-5.9374,13.906-1.2294,4.74-0.6585,7.261,1.4062,13.032,1.7455,2.159,2.9554,7.169,5.125,9.281,1.705,0.987,4.562,2.591,7.312,1.906,2.272-0.566,2.333-0.955,4.907-2.281,1.384-0.163,3.871-4.088,4.093-4.844,0.859-2.913-0.703-8.945-0.656-10,0.077-1.703-1.049-0.674-3.218,0.282-1.145,0.504-3.421,0.981-4.126,1.031-1.726,0.123,0.093-2.148-1.75-2.125-2.422,0.03-4.402-0.474-4.406-2.688-0.004-2.17,1.296-3.844,1.75-5.812,0.845-3.703,1.376-5.932,3.469-9.344,2.591-4.259,6.321-8.401,6.687-11.406,0.278-2.272,2.875-1.742-1.343-3.344-1.1,0-2-0.45-2-1s-0.9-1-2-1zm28,0c-1.1,0-2,0.45-2,1s-0.9,1-2,1c-12.707,2.265-0.433,4.421,3.062,9.031,2.668,3.519,2.982,5.673,3.157,6.907,0.457,3.232,1.097,3.557,1.781,9.531,0.195,1.705-1.361,6.78-3.657,8.843-3.234,2.908-7.775,2.949-9.687,6.282-1.147,2.001,2.51,3.866,3.219,5.718,0.849,2.22-1.091,4.262-1,4.5,4.375,2.838,9.3-2.752,12.125-2.812-2.225,0-0.903-5.289,2-8,1.65-1.541,3-3.527,3-4.406,0-0.88,0.45-1.594,1-1.594s1-2.25,1-5-0.45-5-1-5-1-1.35-1-3-0.45-3-1-3-1-1.8-1-4-0.45-4-1-4-1-1.253-1-2.781c0-1.632-0.826-3.372-2-4.219-1.1-0.793-2-2.24-2-3.219,0-1.112-0.749-1.781-2-1.781z'/>\n <path id='Belly' d='m21.967,48c4.2177,1.6021,1.6207,1.0715,1.3438,3.3438-0.36634,3.0056-4.0943,6.6433-6.6875,10.902-0.53115,0.87229,1.1271,2.2528,1.3044,3.7032,0.23318,1.9075-0.93228,3.9357-1.4076,5.0874-1.3058,3.164-0.21572,7.2697-0.21091,10.063,0.01015,5.8886,9.1185-3.5169,8.7701,0.30944-0.0957,1.051,0.99882,7.2441,0.14032,10.157-7.0853,11.306-4.8299,0.44559-3.3774,4.9965,5.7124-0.67712,15.548-2.5942,17,2.25-0.09147-0.23941,1.8492-2.2799,1-4.5-0.70866-1.8528-4.3663-3.7178-3.2188-5.7188,1.9116-3.3331,6.4532-3.3737,9.6875-6.2812,2.295-2.063,3.851-7.138,3.656-8.843-0.683-5.974-1.324-6.298-1.781-9.531-0.175-1.234-0.457-3.388-3.125-6.907-2.559-3.374-9.829-5.441-8.563-7.187-4.398,1.199-7.523,0.867-14.531-1.844z'/>\n <path id='Leg' d='m12.362,98.261c0.07705,0.45155,1.3157,14.901,1.3791,15.312,0.25433,1.647,4.0169-0.97823,4.1053,0.93579,0.153,3.3,0.121,7.45,0.121,17.49,0,11.333-0.37037,18-1,18-0.55,0-1,0.9-1,2,0,1.1372-0.65246,2-1.5312,2-2.001,0-6.469,4.47-6.469,6.47,0,1.24,1.3344,1.53,6.906,1.53,4.5556,0,7.1158-0.42671,7.5-1.25,0.46666-1,0.72084-1,1.1875,0,0.77983,1.6711,3.2067,1.5746,4.9688-0.1875,1.169-1.17,1.437-6.44,1.437-29,0-26.9,0.048-27.56,2-27.56,1.9516,0,2,0.65774,2,27.562,0,22.562,0.26849,27.831,1.4375,29,1.7621,1.7621,4.1889,1.8586,4.9688,0.1875,0.46666-1,0.72084-1,1.1875,0,0.38421,0.82329,2.9444,1.25,7.5,1.25,5.572,0,6.906-0.29,6.906-1.53,0-2-4.468-6.47-6.469-6.47-0.879,0-1.531-0.86-1.531-2,0-1.1-0.45-2-1-2-0.62963,0-1-6.6667-1-18v-18h6v-9c0-5.3333-0.40741-9-1-9-2.8246,0.05982-7.7622,5.6404-12.138,2.7989-1.4521-4.8442-11.262-2.9121-16.974-2.235-3.4812,1.1283-5.0502,2.3706-9.4919,1.6946z'/>\n</svg>\n";

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map