function defineMinCharacter(respawnX,respawnY) {
	var canvasElement = document.getElementById('mapcanvas');
	var ctx = canvasElement.getContext("2d");
	ctx.fillStyle = '#5D7E36';
	ctx.fillRect(20,20,220,220);

	ctx.beginPath();
	ctx.arc(respawnX, respawnY, 4, 0, 2 * Math.PI);
	ctx.fillStyle = '#FFFFFF';
	ctx.fill();
};
defineMinCharacter(25,25);