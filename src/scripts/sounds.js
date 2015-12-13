var sounds = {
	bonusPoint : new Audio('./src/sounds/bonus-point.mp3'),
	doorOpening : new Audio('./src/sounds/door-opening.mp3'),
	fire : new Audio('./src/sounds/fire.mp3'),
	foul : new Audio('./src/sounds/foul.mp3'),
	gameOver : new Audio('./src/sounds/game-over.mp3'),
	guyFalling : new Audio('./src/sounds/guy-falling.mp3'),
	guyHitFloor : new Audio('./src/sounds/guy-hit-floor.mp3'),
	oneOutlawIntro : new Audio('./src/sounds/one-outlaw-intro.mp3'),
	prepareToPlay : new Audio('./src/sounds/prepare-to-play.mp3'),
	prepareToShoot : new Audio('./src/sounds/prepare-to-shoot.mp3'),
	shoot : new Audio('./src/sounds/shoot.mp3'),
	title : new Audio('./src/sounds/title.mp3'),
	twoOutlawsIntro : new Audio('./src/sounds/two-outlaws-intro.mp3'),
	youLost : new Audio('./src/sounds/you-lost.mp3'),
	youWon : new Audio('./src/sounds/you-won.mp3'),


	playOnTop : function(sfx){
		sounds[sfx].load();
		sounds[sfx].play();
	},

	oldSfx : new Audio('./src/sounds/click.ogg'),
	playNewStopOld : function(sfx) {
		sounds.oldSfx.pause();
		sounds.oldSfx = sounds[sfx];
		sounds[sfx].load();
		sounds[sfx].play();
	},
};

global.sounds = sounds;
