//main js file for GunMan game

require('../styles/mainStyles.scss');
require('../styles/sprite-base.css');
require('../styles/animation.css');
require('../styles/canvas.scss');
require('../styles/prompts.scss');
require('../styles/options.scss');

var canvas = require('./canvas.js');
var points = require('./points.js');
var sounds = require('./sounds.js');

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
		optionsEl.innerHTML = require('../htmlElements/options.html');
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
			optionsEl.innerHTML = require('../htmlElements/about.html');
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
		this.svgIcon.innerHTML = require('../htmlElements/' + this.name + '_inlineSVG.html');
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

		opponents.WaitThenDo(10, 'walkIn', 'oneOutlawIntro'); //'oneOutlawIntro'
		opponents.WaitThenDo(3600, 'stand'); //'prepareToShoot'

		// listen to the last opponent trasition (walk 3.5sec) to end
		opponents.alive[opponents.alive.length - 1].domElement.addEventListener('transitionend', startGame);
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
