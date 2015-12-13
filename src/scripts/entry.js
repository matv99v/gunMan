require('../styles/mainStyles.scss');
require('../styles/sprite-base.css');
require('../styles/animation.css');
require('../styles/canvas.scss');
require('../styles/prompts.scss');
require('./sounds.js');
require('./canvas.js');


alert('start');

													// win (shoot -> talk)
// walk -> stand -> unholster('fire!') -> setTimeout
													// lose (fall)


var game = {
	names: ['billy', 'bob', 'mark', 'randy', 'sheffer'],
	opponents: [],

	defineGunmanSkill: function(){
		return Math.floor( (1.5 + Math.random()) * 1000 );
	},

	randomTrueOrFalse : function(){
		return ((Math.random() - 0.5) < 0) ? false : true;
	},
	defineRandomOpponentName: function(){
		var randNum = Math.floor( Math.random() * game.names.length );
		return game.names[randNum];
	},
	spawnOpponents: function(num){
		var dimension = Math.round( 100 / num );
		for (var i = 0, len = game.names.length, position = -dimension / 2; i < num; i++){
			var name = game.names[ i % len ];
			position += dimension;
			game.opponents.push( new Opponent( name, position + '%' ));
		}
	},

	showStats: function(){
		setTimeout(function () {
			var statElement = document.querySelector('#opponentStats');

				game.opponents.forEach( function(opp) {
					aDiv = document.createElement('div');
					aDiv.innerHTML = (opp.skill / 1000).toPrecision(3);
					aDiv.id = 'stats-' + opp.domElement.id;
					aDiv.className = 'skillsOptions';
					aDiv.style.left = opp.domElement.style.left;
					statElement.appendChild(aDiv);
				});

		}, 25);
	},

	kill : function(killedOpp){
		canvas.flick();
		// game.removeAllChildren(killedOpp.domElement);


		var newArr = [];
		game.opponents.forEach(function(opp){
			if (opp.name != killedOpp.name ){
				newArr.push(opp);
			}
		});
		game.opponents = newArr;
	},

	removeAllChildren : function(domElement){
		while (domElement.firstChild) {
			domElement.removeChild(domElement.firstChild);
		}
	},

	getOpponentById : function (killedId) {
		for (var i = game.opponents.length; i > 0; i--){
			if(game.opponents[i-1].domElement.id == killedId){
				return game.opponents[i-1];
			}
		}
	},

	opponentsWaitThenDo : function(ms, action, sfx){

		setTimeout(function () {
			game.opponents.forEach(function(opp){
				opp[action]();
			});

			if (sfx) {sounds.playNewStopOld(sfx);}
		}, ms);
	},
};





var gamePlay = {

	turn : 0,


	checkIfInGame : function () {
		var flag = true;
		for (i = game.opponents.length - 1; i >= 0; i--){
			 flag = flag && (gamePlay.gameDurationMs < game.opponents[i].skill);
		}
		return flag;
	},

	startTimer : function(){
		gamePlay.timer = setTimeout(function tick() {

				gamePlay.gameDurationMs += 10;
				points.myStatsDivElement.innerHTML = 'time ' + (gamePlay.gameDurationMs / 1000).toPrecision(3);


				if ( !gamePlay.checkIfInGame() && !gamePlay.foulState) {
					clearTimeout(gamePlay.timer);
					console.log('you lose!');


					canvas.winLose.style.visibility = 'visible';
					canvas.winLose.innerHTML = 'you lose!';


					game.opponents.forEach(function(opp){
						opp.gunmanSayDomElement.innerHTML = "You're dead";
						opp.domElement.removeChild(opp.svgIcon);
					});

					sounds.playOnTop('shoot');
					canvas.red();
					sounds.playNewStopOld('youLost');
					canvas.domElement.removeEventListener('click', gamePlay.shootPhase, true);

					game.opponents[game.opponents.length - 1].domElement.removeEventListener('transitionend', startGame);

					game.opponentsWaitThenDo(10, 'talk');
					game.opponentsWaitThenDo(3500, 'walkOut');


				}

				else{
					if (game.opponents.length === 0) {
						console.log('you win!');

						points.resolveKilledTimePoints();

						canvas.winLose.style.visibility = 'visible';
						canvas.winLose.innerHTML = 'You win!';

						game.opponents.forEach(function(opp){
							opp.gunmanSayDomElement.innerHTML = 'you win!';
						});

						clearTimeout(gamePlay.timer);
						canvas.domElement.removeEventListener('click', gamePlay.shootPhase, true);
						sounds.playNewStopOld('youWon');

						gamePlay.turn += 1;
						setTimeout(newRound , 2500);
					}
					else {
						gamePlay.timer = setTimeout(tick, 10);
					}
				}
		}, 10);
	},

	gameDurationMs : 0,

	shootPhase : function (e) {
		e.stopPropagation();
		sounds.playOnTop('shoot');

		if (!gamePlay.gameDurationMs) {
			gamePlay.foul();
		} else if (e.target.id == "head" || e.target.id == "arm" || e.target.id == "belly" || e.target.id == "leg") {

			var killingTime = gamePlay.gameDurationMs + 10;
			var killedBodyPart = e.target.id;
			var killedDOMEl = e.target.offsetParent;
			var killedOpponent = game.getOpponentById(killedDOMEl.id);
			points.updateBodyParts(killedBodyPart);



			points.killedTime.push(killedOpponent.skill - killingTime);


			killedOpponent.gunmanSayDomElement.innerHTML = killedBodyPart + ' ' + points[killedBodyPart] + ' pts';

			console.log('you hit ' + killedBodyPart + ' ' + points[killedBodyPart] + 'pts');

			var infoEl = document.querySelector('#stats-' + killedDOMEl.id);
			infoEl.innerHTML = '<strike>' + infoEl.innerHTML + '</strike>' + '<br>' + killingTime / 1000;

			game.kill(killedOpponent);
			killedOpponent.fall();

			if (game.opponents.length === 0) {
				var endTime = Date.now();
			}
		 }
	},

	foul : function(){
		console.log('foul');
		clearTimeout(gamePlay.startTimer);
		canvas.foul();


		canvas.winLose.style.visibility = 'visible';
		canvas.winLose.innerHTML = 'Foul';



		canvas.domElement.removeEventListener('click', gamePlay.shootPhase, true);
		game.opponents[game.opponents.length - 1].domElement.removeEventListener('transitionend', startGame);

		game.opponents.forEach(function(opp){
			opp.domElement.style.left = opp.startPosition;
			game.opponentsWaitThenDo(10, 'walkOut', 'foul');
		});
		gamePlay.foulState = true;
	},

	foulState : false
};

var points = {
	myStatsDivElement : document.querySelector('#myStats'),
	pointsDomElement : document.querySelector('#points'),
	amount: 0,

	head: 20,
	belly: 15,
	arm: 5,
	leg: 5,

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

	printPoints: function(){
		points.pointsDomElement.innerHTML = 'points ' + points.amount;
	}

};





Opponent.prototype = {
	init : function(){
		this.domElement = document.createElement('div');
		this.domElement.id = 'outlaw-' + (game.opponents.length);
		this.domElement.classList.add('shooter');

		this.startPosition = ( game.randomTrueOrFalse() ) ?
				this.domElement.style.left = "-7%" :
				this.domElement.style.left = "107%";

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
		this.gunmanSayDomElement.innerHTML = 'fire!';
		this.gunmanSayDomElement.style.visibility = 'visible';

	},

	fall : function(){



		this.domElement.removeChild(this.svgIcon);
		this.switchClass('icon-' + this.name + '-fall');
		hatDomElement = document.createElement('div');
		hatDomElement.className = 'hat icon-' + this.name + '-hat';
		hatDomElement.style.top = "25%";

		if ( game.randomTrueOrFalse() ) {
			hatDomElement.style.animationName = 'flying-hat-right';
		} else {
			hatDomElement.style.animationName = 'flying-hat-left';
		}
		this.domElement.appendChild(hatDomElement);
		sounds.playOnTop('guyHitFloor');
	},

	talk : function(){
		this.switchClass('icon-' + this.name + '-talk');
	},


};

function Opponent(name, position){
	this.name = name;
	this.skill = game.defineGunmanSkill();
	this.position = position;
	this.init();

}



function clearOldData(){

	points.killedTime = [];

	gamePlay.gameDurationMs = 0;
	points.myStatsDivElement.innerHTML = 'time 00.00';

	game.removeAllChildren(document.querySelector('#opponentStats'));

	canvas.winLose.style.visibility = 'hidden';



	var canvasChildren = canvas.domElement.children;
	for(var ind = canvasChildren.length-1; ind > 0; ind-- ){
		if (canvasChildren[ind].id.substring(0,6) == 'outlaw' ){
			canvas.domElement.removeChild(canvasChildren[ind]);
		}
	}
}


function newRound(){
	console.log('---------------------------');
	console.log('game turn', gamePlay.turn % game.names.length + 1);


	clearOldData();





	game.spawnOpponents(gamePlay.turn % game.names.length + 1);
	game.showStats();

	// each opponent perform action after the specified delay in ms
	// and the last arg is music to play along

	game.opponentsWaitThenDo(10, 'walkIn', 'oneOutlawIntro');
	game.opponentsWaitThenDo(3600, 'stand', 'prepareToShoot');

	// listen to the last opponent trasition (walk 3.5sec) to end
	game.opponents[game.opponents.length - 1].domElement.addEventListener('transitionend', startGame);
}

function startGame(){
	//listen to shoot clik
	canvas.domElement.addEventListener('click', gamePlay.shootPhase, true);

	// pause before shooting
	setTimeout(function () {

		if (!gamePlay.foulState) {		//checks if there is no foul
			gamePlay.startTimer();
			game.opponentsWaitThenDo(1, 'unholster');
			game.opponentsWaitThenDo(150, 'aim', 'fire');
		}
	}, game.defineGunmanSkill() * 2);

}

newRound();
