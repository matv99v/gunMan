var sfx = {

	audioFile : new Audio('./src/sound-groups/gunMan_sfx.mp3'),



	sfxPlay : function(currSound){
		sfx.audioFile.pause();

		var start = timeCodes[currSound][0];
		var end = timeCodes[currSound][1];

		console.log(currSound, start, end);
		sfx.audioFile.currentTime = start;
		sfx.audioFile.play();

		function stopAudio() {
			console.log('currTime', sfx.audioFile.currentTime);
			if (sfx.audioFile.currentTime >= end) {
				sfx.audioFile.currTime = 0;
				sfx.audioFile.removeEventListener('timeupdate', stopAudio);

			}
		}
		debugger;
		sfx.audioFile.addEventListener('timeupdate', stopAudio, false);
	}
};



var timeCodes = {
	bonusPoint : [0, 1],
	cashRegister : [2, 4],
	fire : [5, 6],
	reload : [7, 8],
	shoot : [9, 9.5],
	weapon : [12, 13]
};

// sfx.sfxPlay('shoot');

sfx.clone = sfx.audioFile.cloneNode(true);
sfx.clone2 = sfx.audioFile.cloneNode(true);


module.exports = sfx;
