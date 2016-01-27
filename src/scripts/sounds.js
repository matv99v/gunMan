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

// sounds.bonusPoint.addEventListener('ended', function() {
// 	sounds.bonusPoint.play();
// }, false);

sounds.bonusPoint.volume = 0.2;
module.exports = sounds;
