var canvasElement = document.getElementById('mapcanvas');
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
basesheet.color = '#5D7E36';

function defineMinCharacter(centerp) {
	var characterSheet = new sheetengine.Sheet({
		x: 0,
		y: 0,
		z: 0
	}, {
		alphaD: 90,
		betaD: 0,
		gammaD: 0
	}, {
		w: 5,
		h: 5
	});

	ctx = characterSheet.context;

	ctx.beginPath();
	ctx.arc(0, 0, 4, 0, 2 * Math.PI);
	ctx.fillStyle = '#FFFFFF';
	ctx.fill();

	var minCharacter = new sheetengine.SheetObject(centerp, {
		alphaD: 0,
		betaD: 0,
		gammaD: 0
	}, [characterSheet], {
		w: 5,
		h: 5,
		relu: 2,
		relv: 2
	});
	minCharacter.name = "playerMin";

	return minCharacter;
};

// define a character
var minCharacter = defineMinCharacter({
	x: sheetengine.scene.yardcenter.yardx,
	y: sheetengine.scene.yardcenter.yardy,
	z: 0
});

// draw the scene
sheetengine.calc.calculateAllSheets();
sheetengine.drawing.drawScene(true);

function redrawMinCharacter() {
	// find and delete character
	minCharacter.destroy();
	minCharacter.draw();

	// define new character
	minCharacter = defineMinCharacter({
		x: sheetengine.scene.yardcenter.yardx,
		y: sheetengine.scene.yardcenter.yardy,
		z: 0
	});
	// draw scene
	sheetengine.calc.calculateAllSheets(true);
	sheetengine.drawing.drawScene();
}