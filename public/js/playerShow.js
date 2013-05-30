var canvasElement = document.getElementById('playercanvas');
sheetengine.scene.init(canvasElement, {
	w: 300,
	h: 500
});

// define some basesheets
var basesheet = new sheetengine.BaseSheet({
	x: 0,
	y: 0,
	z: 0
}, {
	alphaD: 90,
	betaD: 0,
	gammaD: 0
}, {
	w: 150,
	h: 150
});
basesheet.color = '#7EBD26';

function defineCharacter(centerp) {
	cSkin = $("#inputSkin").val();
	cShirt = $("#inputShirt").val();
	cPants = $("#inputPants").val();
	cHair = $("#inputHair").val();
	username = $("#inputUsername").val();

	// character definition for animation with sheet motion
	var body = new sheetengine.Sheet({
		x: 0,
		y: 0,
		z: 28
	}, {
		alphaD: 0,
		betaD: 0,
		gammaD: 0
	}, {
		w: 22,
		h: 28
	});
	var backhead = new sheetengine.Sheet({
		x: 0,
		y: -2,
		z: 19
	}, {
		alphaD: 0,
		betaD: 0,
		gammaD: 0
	}, {
		w: 16,
		h: 12
	});
	backhead.context.fillStyle = '#550';
	backhead.context.fillRect(0, 0, 16, 12);
	// legs
	var leg1 = new sheetengine.Sheet({
		x: -6,
		y: 0,
		z: 8
	}, {
		alphaD: 0,
		betaD: 0,
		gammaD: 0
	}, {
		w: 10,
		h: 16
	});
	leg1.context.fillStyle = '#0000ff';
	leg1.context.fillRect(0, 0, 10, 20);
	var leg2 = new sheetengine.Sheet({
		x: 6,
		y: 0,
		z: 8
	}, {
		alphaD: 0,
		betaD: 0,
		gammaD: 0
	}, {
		w: 10,
		h: 16
	});
	leg2.context.fillStyle = '#0000ff';
	leg2.context.fillRect(0, 0, 10, 20);

	// define character object
	var character = new sheetengine.SheetObject(centerp, {
		alphaD: 0,
		betaD: 0,
		gammaD: 90
	}, [body, backhead, leg1, leg2], {
		w: 60,
		h: 100,
		relu: 30,
		relv: 70
	});
	character.name = "player";

	character.leg1 = leg1;
	character.leg2 = leg2;

	var ctx = body.context;

	// head
	ctx.fillStyle = '#ffff00';
	ctx.fillRect(4, 4, 14, 8);
	ctx.fillStyle = '#555500';
	ctx.fillRect(4, 0, 14, 4);
	ctx.fillRect(4, 4, 2, 2);
	ctx.fillRect(16, 4, 2, 2);

	// body
	ctx.fillStyle = '#ff00ff';
	ctx.fillRect(0, 12, 22, 14);

	// hands
	ctx.fillStyle = '#ffff00';
	ctx.fillRect(0, 22, 2, 4);
	ctx.fillRect(20, 22, 2, 4);

	return character;
};

// define a character
defineCharacter({
	x: 0,
	y: 0,
	z: 0
});
// draw the scene
sheetengine.calc.calculateAllSheets();
sheetengine.drawing.drawScene(true);