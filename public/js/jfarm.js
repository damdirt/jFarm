/* 
 jfarm 
*/

jfarm = {
	appid: '4f244f4db41abbfd2c00018c' //"jfarm"
	,timerInterval: 40
	,sceneIsReady: 0
	,levelsize: 1
	,boundarySize:  0.6
	,zoom: 1
	,lineWidth: 0
	,densityMap: null

	// orientations 
	,rotSouthNorth: {alphaD:0,betaD:0,gammaD:0}
	,rotWestEast: {alphaD:0,betaD:0,gammaD:90}
	,rotTop: {alphaD:90,betaD:0,gammaD:0}

	// moves
	,gravity: -2
	,maxmove: 5
	,bypassAngleLeft: -Math.PI/3
	,bypassAngleRight: Math.PI/3
	,bypassDistLeft: 40
	,bypassDistRight: 20
	,maxbypass: 80

	// tiles properties
	,tileWidth: 80

	//objects
	,hoveredObj: null
	,hoveredBaseSheet: null
	,deletedObjects: {}
	,cameraMaxDistance: 30

	// gaming modes
	,movingPlayer: false
	,selectingObject: false
	,drawingLocation: false

	// buildings & crops
	,locationCorners: []
	,currentLocationBaseSheets: []
	,drawnObj: null
	,enumAppObjects: ["barn", "cold storage", "silo", "corn", "tomatoes", "wheat"] // TODO : retrieve from DB ???

	// player 
	,startp: {x:0,y:0,z:0}
	,playerFarm: {} // contains all player buildings and crops available on the map

	// playerObjects
	,playerObjectChanged: false
	,playerObjects: {}
	,playerObjectsData: {
			fork: {
				name: "fork"
				,centerp: {x:-3,y:2,z:10}
				,rot: {alphaD:90,betaD:0,gammaD:90}
				,x: 5
				,y: 0
			}
			,bat: {
				name: "bat"
				,centerp: {x:-3,y:5,z:12}
				,rot: {alphaD:45,betaD:0,gammaD:90}
				,x: 10
				,y: 0
			}
			,chainsaw: {
				name: "chainsaw"
				,centerp: {x:9,y:2,z:9}
				,rot: {alphaD:0,betaD:0,gammaD:0}
				,x: 0
				,y: 9
			}
			,ak47: {
				name: "ak47"
				,centerp: {x:-3,y:5,z:12}
				,rot: {alphaD:-45,betaD:0,gammaD:-90}
				,x: 5
				,y: 10
			}
			,watercan: {
				name: "watercan"
				,centerp: {x:-3,y:7,z:8}
				,rot: {alphaD:30,betaD:0,gammaD:-90}
				,x: 7
				,y: 10
			}
		} // contains all available "objects" (sheets actually) wearable by the player (weapons etc)
	,playerObjectData: {}
	,playerObject: null // current wore object 
	,playerObjectPos: {} // current wore player object position
	,playerObjectsPos: {}
	
	,init: function() {

		// sheetengine.debug = true; // remove in prod

		jfarm.lineWidth = 1/jfarm.zoom/2;

		// init canvas
		// sheetengine.drawObjectContour = true;
		var canvasElement = document.getElementById('maincanvas');
		sheetengine.scene.init(canvasElement, {w:1200,h:1500});

		// set zoom
		var zoom = jfarm.zoom;
		sheetengine.context.scale(zoom,zoom);
		sheetengine.context.translate(-sheetengine.canvas.width/(2*zoom)*(zoom-1),-sheetengine.canvas.height/(2*zoom)*(zoom-1)); //???

		// set tile width
		// sheetengine.scene.tilewidth = jfarm.tileWidth; // default is 300

		// retrieve initial yards from server
		var yardcenter = sheetengine.scene.getUrlLoadInfo().yardcenter; // in url, ex: /?x=9&y=2
		// OR
		// var centerp = {x:0,y:0,z:0};
		// var centerpuv = sheetengine.transforms.transformPoint(centerp);
		// sheetengine.scene.center = {x:centerp.x, y:centerp.y, u:centerpuv.u, v:centerpuv.v};
		sheetengine.scene.getYards('http://www.crossyards.com', yardcenter, jfarm.levelsize, jfarm.appid, jfarm.sceneReady);
	},
	sceneReady: function(){
		
		//init density map 
		jfarm.densityMap = new sheetengine.DensityMap(5);
		jfarm.densityMap.addSheets(sheetengine.sheets); // uncomment if some sheets are created before

		jfarm.definePlayerObjects();

		var img = new Image();
		img.src = jfarm.fork64;
		jfarm.playerTestObject = img;

		// define player at starting point
		jfarm.definePlayerObj(jfarm.startp); // Pass also player retrieve from registration
		sheetengine.scene.setCenter(jfarm.startp);

		//get relative yard coordinates and set initial boundary for visible yards
		var yardpos = sheetengine.scene.getYardFromPos(jfarm.startp);
		jfarm.setBoundary(yardpos);

		// set object dimming for player: character will dim other sheets, and other objects will not dim the character
		jfarm.player.setDimming(true, true);
		
		sheetengine.calc.calculateAllSheets();
		jfarm.redraw(true);

		$('#maincanvas').on('click', jfarm.click);
		jfarm.timer();
		jfarm.sceneIsReady = 1;
	},
	initObjectProperties: function(objects) {
		// for (var i=0;i<objects.length;i++) {
		// 	var obj = objects[i];
		// 	// these objects are not registered in the density map
		// 	// wheat, tomatoes, corn 
		// 	if (obj.name == 'Health potion' || obj.name == 'Key (yellow)' || obj.name == 'Key (red)' || 
		// 		obj.name == 'Key (blue)' || obj.name == 'Enemy' || obj.name == 'Respawn point') {
		// 		obj.setCollision(false);
		// 	}
		// 	// init enemy objects
		// 	if (obj.name == 'Enemy') {
		// 		obj.arm = obj.sheets[0];
		// 		obj.leg1 = obj.sheets[3];
		// 		obj.leg2 = obj.sheets[4];
		// 		obj.leg1.angle = 0;
		// 		obj.leg2.angle = 0;

		// 		obj.animationState = 0;
		// 		obj.speed = {x:0,y:0,z:0};
		// 		obj.health = 100;
		// 		jfarm.initCharacterSounds(obj);
		// 	}
		// 	// set object dimming: these objects will dim other sheets, and other objects will not dim them
		// 	if (obj.name == 'Enemy' || obj.name == 'Old man' || obj.name == 'Road') {
		// 		obj.setDimming(true, true);
		// 	}
		// 	// these objects will not dim other sheets but they also cannot be dimmed by others
		// 	if (obj.name == 'Road' || obj.name == 'Health potion' || obj.name == 'Key (yellow)' || obj.name == 'Key (red)' || 
		// 		obj.name == 'Key (blue)' || obj.name == 'Respawn point' || obj.name == 'Grail') {
		// 		obj.setDimming(false, true);
		// 	}
		// }
	},

	// player 
	definePlayerObj: function(centerp, playerLogged) {
		// player definition for animation with sheet motion
		var body = new sheetengine.Sheet({x:1,y:0,z:13}, {alphaD:0,betaD:0,gammaD:45}, {w:8,h:14});
		var ctx = body.context;
		// head
		ctx.fillStyle = '#3d1e14';
		ctx.fillRect(1,0,5,5);
		ctx.fillStyle = '#bfbf00';
		ctx.fillRect(2,1,3,3);
		// body
		ctx.fillStyle = '#459';
		ctx.fillRect(1,5,6,1);
		ctx.fillRect(0,6,8,6);
		// left hand
		ctx.fillStyle = '#bfbf00';
		ctx.fillRect(6,12,2,2);
		// belt
		ctx.fillStyle = '#000'; 
		ctx.fillRect(0,12,6,2);
		var backhead = new sheetengine.Sheet({x:1,y:-0.5,z:17}, {alphaD:0,betaD:0,gammaD:0}, {w:5,h:5});
		backhead.context.fillStyle = '#3d1e14';
		backhead.context.fillRect(0,0,5,5);

		// set arm, it's fork by default
		jfarm.playerObjectData = jfarm.playerObjectsData.chainsaw;
		var arm = new sheetengine.Sheet(jfarm.playerObjectData.centerp, jfarm.playerObjectData.rot, {w:25,h:25});

		arm.context.drawImage(jfarm.playerObjectData.image, jfarm.playerObjectData.x, jfarm.playerObjectData.y);
		arm.canvasChanged();
		arm.name = jfarm.playerObjectData.name;
		jfarm.playerObjectChanged = true;

		// legs
		var leg1 = new sheetengine.Sheet({x:-1.5,y:0,z:4}, {alphaD:0,betaD:0,gammaD:0}, {w:3,h:8});
		leg1.context.fillStyle = '#3d1e14';
		leg1.context.fillRect(0,0,4,10);
		var leg2 = new sheetengine.Sheet({x:1.5,y:0,z:4}, {alphaD:0,betaD:0,gammaD:0}, {w:3,h:8});
		leg2.context.fillStyle = '#3d1e14';
		leg2.context.fillRect(0,0,4,10);
		leg1.angle = 0;
		leg2.angle = 0;

		// define player object
		jfarm.player = new sheetengine.SheetObject({x:centerp.x,y:centerp.y,z:centerp.z}, {alphaD:0,betaD:0,gammaD:0}, [arm, body,backhead,leg1,leg2], {w:80,h:80,relu:40,relv:40});
		jfarm.player.arm = arm;
		jfarm.player.leg1 = leg1;
		jfarm.player.leg2 = leg2;
		
		jfarm.player.animationState = 0;
		jfarm.player.speed = {x:0,y:0,z:0};
		jfarm.player.health = 100;
		jfarm.player.name = 'player';
	},
	// weapons and player objects
	definePlayerObjects: function(){
		// FORK
		// var fork = new sheetengine.Sheet(jfarm.playerObjectsData.fork.centerp, {alphaD:90,betaD:0,gammaD:90}, {w:11,h:25})
		// 	,forkCtx = fork.context;
		// fork.hidden = true;
		// fork.name = "fork";
		// forkCtx.fillStyle = "#dfc991"; // handle
		// forkCtx.fillRect(4,10,2,15);
		// forkCtx.fillStyle = "#413b32"; // pics
		// forkCtx.fillRect(0,0,10,10);
		// forkCtx.clearRect(1,0,2,8);
		// forkCtx.clearRect(4,0,2,8);
		// forkCtx.clearRect(7,0,2,8);
		// fork.setDimming(true,true);
		// jfarm.playerObjects.fork = fork;
		// var forkImg = new Image();
		// forkImg.src = fork.canvas.toDataURL();
		// jfarm.playerObjectsData.fork.image = forkImg;
		var forkImg = new Image();
		forkImg.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAZCAYAAADnstS2AAAALElEQVQ4jWNwtDb6zwAFBNmjiilSTAwmXTE6uH9y4v/7JydilxxVPKqY7ooB1c+3tcuPBsEAAAAASUVORK5CYII=";
		jfarm.playerObjectsData.fork.image = forkImg;

		// BAT
		// var bat = new sheetengine.Sheet(jfarm.playerObjectsData.bat.centerp, {alphaD:45,betaD:0,gammaD:90}, {w:3,h:17}) //d3a475
		// 	,batCtx = bat.context;
		// bat.hidden = true;
		// bat.name = "bat";
		// batCtx.fillStyle = "#dfc991";
		// batCtx.beginPath();
		// batCtx.moveTo(2, 0);
		// batCtx.lineTo(3, 1);
		// batCtx.lineTo(3, 2);
		// batCtx.lineTo(2, 16);
		// batCtx.lineTo(2.5, 16);
		// batCtx.lineTo(3, 17);
		// batCtx.lineTo(0, 17);
		// batCtx.lineTo(0, 16);
		// batCtx.lineTo(1.5, 16);
		// batCtx.lineTo(0, 1);
		// batCtx.lineTo(2, 0);
		// batCtx.fill();
		// bat.setDimming(true,true);
		// jfarm.playerObjects.bat = bat;
		// var batImg = new Image();
		// batImg.src = bat.canvas.toDataURL();
		// jfarm.playerObjectsData.bat.image = batImg;

		var batImg = new Image();
		batImg.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAARCAYAAAAYNhYvAAAAqUlEQVQImTXOIQ4CMRAF0G9JuAEexxmWM+DwnACBXolY2hmNBscZdhOStiMRiA3pjOEEkGCLoMiXn5//8Yh+qcJDjr6FJnqZcDHhAhUeTbhYog8sUV/xhAmdTLhoohs0UVeTHjn6bcUFWfzahIsKH2HBNSZcstAe+XqY150d7n07NeGi0W8AAJr4naNf/SA8WnANAMAS9Tm4xR/nMbhZ7VAXgpvgf1+Fhy/N9oRkGdFVpwAAAABJRU5ErkJggg==";
		jfarm.playerObjectsData.bat.image = batImg;
		

		// CHAINSAW
		// var chainsaw = new sheetengine.Sheet(jfarm.playerObjectsData.chainsaw.centerp,{alphaD:0,betaD:0,gammaD:0}, {w:20,h:7}) //ce3b10
		// 	,chainsawCtx = chainsaw.context;
		// chainsaw.hidden = true;
		// chainsaw.name = "chainsaw";
		// // engine
		// chainsawCtx.fillStyle = "#ce3b10"; 
		// chainsawCtx.fillRect(0,0,7,7);
		// // handle
		// chainsawCtx.strokeStyle = "#222"; 
		// chainsawCtx.beginPath(); 
		// chainsawCtx.lineWidth = 1;
		// chainsawCtx.moveTo(0,5);
		// chainsawCtx.lineTo(5,0);
		// chainsawCtx.stroke();
		// // blade
		// chainsawCtx.fillStyle = "#c4bec2"; 
		// chainsawCtx.fillRect(5,3,10,3);
		// chainsawCtx.lineWidth = 1;
		// chainsawCtx.strokeRect(5,3,10,3);
		// chainsaw.setDimming(true,true);
		// jfarm.playerObjects.chainsaw = chainsaw;
		// var chainsawImg = new Image();
		// chainsawImg.src = chainsaw.canvas.toDataURL();
		// jfarm.playerObjectsData.chainsaw.image = chainsawImg;

		var chainsawImg = new Image();
		chainsawImg.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAHCAYAAAAIy204AAAAfklEQVQokaXRoQ2AMBCFYUZAIIprHv4UjqGAkjR1hFnYA0HQrPQwkJBSTkCT3365u2Z7k/NqrgtKZTnXBfcmZ/blvWG/wBjzUtJLSQCTVhKMsSCGADh0Tg0Ak2i8ZhBD1/bcllXtRJ/g/VPuE7q2V3udMAYvNIihtXbUSp3wAI0rrQLjqZEtAAAAAElFTkSuQmCC";
		jfarm.playerObjectsData.chainsaw.image = chainsawImg;

		

		// AK-47
		// var ak47 = new sheetengine.Sheet(jfarm.playerObjectsData.ak47.centerp,{alphaD:-45,betaD:0,gammaD:-90}, {w:18,h:6})
		// 	,akCtx = ak47.context;
		// ak47.name = "ak47";
		// ak47.hidden = true;
		// // crosse
		// akCtx.fillStyle = "#000"; //"#d18150"; 
		// akCtx.beginPath(); 
		// akCtx.moveTo(0,2);
		// akCtx.lineTo(1,5);
		// akCtx.lineTo(4.7,2.3);
		// akCtx.lineTo(4.7,1.5);
		// akCtx.lineTo(0,2);
		// akCtx.fill();
		// // barillier
		// akCtx.fillStyle = "#000";
		// akCtx.fillRect(4.7,0.6,9,1.5);
		// // crosse 1
		// akCtx.fillStyle = "#000";
		// akCtx.fillRect(5,2,1.3,2.7);
		// // chargeur
		// akCtx.fillStyle = "#000";
		// akCtx.beginPath();
		// akCtx.moveTo(8,2);
		// akCtx.lineTo(8.7,4);
		// akCtx.lineTo(10,6);
		// akCtx.lineTo(11,4.9);
		// akCtx.lineTo(10,3.5);
		// akCtx.lineTo(9.4,2);
		// akCtx.fill();
		// // canon
		// akCtx.fillStyle = "#000";
		// akCtx.fillRect(13.7,0.8,4.3,0.5);
		// chainsaw.setDimming(true,true);
		// jfarm.playerObjects.ak47 = ak47;
		// var akImg = new Image();
		// akImg.src = ak47.canvas.toDataURL();
		// jfarm.playerObjectsData.ak47.image = akImg;

		var akImg = new Image();
		akImg.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAGCAYAAADOic7aAAAAhUlEQVQYlY3PIQoCYRDF8d8BNGwRLGYxKp7AahA2i0m8gMVk8iJ6AzF4ETF4AA9gMq1lFj7Wxc8Hf3g83swwfGuAdYYFxg10McQMKxxQZbhi3sAtKbyxCb9EH3ecwtcULZ/Yx+ADk8iq+gp2eKHXNpxqhCM6SXbGNHyBJy65Rf+oxPZX4QO++CCk+Lv1qQAAAABJRU5ErkJggg==";
		jfarm.playerObjectsData.ak47.image = akImg;


		// WATERING CAN
		// var watercan = new sheetengine.Sheet(jfarm.playerObjectsData.watercan.centerp,{alphaD:30,betaD:0,gammaD:-90}, {w:14,h:10})
		// 	,watercanCtx = watercan.context;
		// watercan.hidden = true;
		// watercan.name = "watercan";
		// watercanCtx.fillStyle = "#3b5d67";
		// watercanCtx.fillRect(3,3,5,6); // réservoir

		// var startAngle = 0.6 * Math.PI;
		// var endAngle = 1.9 * Math.PI;
		// var counterClockwise = false;

		// watercanCtx.beginPath();
		// watercanCtx.arc(4,5,4, startAngle, endAngle, counterClockwise);
		// watercanCtx.lineWidth = 1;
		// watercanCtx.strokeStyle = '#3b5d67';
		// watercanCtx.stroke();

		// watercanCtx.beginPath();
		// watercanCtx.moveTo(7,8);
		// watercanCtx.lineTo(12,4);
		// watercanCtx.lineWidth = 2;
		// watercanCtx.strokeStyle = '#3b5d67';
		// watercanCtx.stroke();

		// watercanCtx.beginPath();
		// watercanCtx.moveTo(11,4);
		// watercanCtx.lineTo(13,2);
		// watercanCtx.lineTo(14,4);
		// watercanCtx.fillStyle = '#000';
		// watercanCtx.fill();
		// chainsaw.setDimming(true,true);
		// jfarm.playerObjects.watercan = watercan;
		// var watercanImg = new Image();
		// watercanImg.src = watercan.canvas.toDataURL();
		// jfarm.playerObjectsData.watercan.image = watercanImg;

		var watercanImg = new Image();
		watercanImg.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAKCAYAAACE2W/HAAAA6ElEQVQokYWRrU4DURCFT0WDQaExJOtKMCvonTG1ra9o74za25lXaMAgy8PgEQ3hHZq0CodBNSTY5iIWSNhstycZMT/fJDMHAFCW1h9KGoVoyxBtOYwV45SK8fiMxNaktiNZrOrwT1J/L0vrHwVZ/I3EN41yj8W+SP0ZQK/RewAwAqvnvyXquRmk1TUABKmKi8urNYAM4BUU7bELBACepwmr7Vk9B0kzAADJYtUFstgdqR/q3J4G0+l5DaptO0H1TOoHinb/715Se/l9Tjtoe56nSasdP5/9aAODVMVRSwDgdpZuOgca+gaCeIMuwChpKwAAAABJRU5ErkJggg==";
		jfarm.playerObjectsData.watercan.image = watercanImg;

		
	},
	setPlayerObject: function(){
		var arm = jfarm.player.arm;
		arm.context.clearRect(0,0,25, 25);

		// arm.context.fillStyle = '#F00';
		// arm.context.strokeStyle = '#000';
		// arm.context.fillRect(0,0,25,25);
		// arm.context.strokeRect(0,0,25,25);

		// fout la merde 
		jfarm.player.setSheetPos(arm, sheetengine.geometry.clonePoint(jfarm.playerObjectData.centerp),jfarm.playerObjectData.rot);

		arm.context.drawImage(jfarm.playerObjectData.image, jfarm.playerObjectData.x, jfarm.playerObjectData.y);
		arm.canvasChanged();
		arm.name = jfarm.playerObjectData.name;

		arm.canvasChanged();
		jfarm.playerObjectChanged = true;
	},

	// character movements
	dist: function(obj1, obj2) {

		return sheetengine.geometry.pointDist(obj1.centerp, obj2.centerp);
	},
	characterAtTargetObj: function(obj) {
		if (!obj.targetObj)
			return false;
		var dist = jfarm.dist(obj.targetObj, obj);
		return dist < 25;
	},
	moveTowardsTarget: function(obj, move) {
		// character constantly falls with gravity
		obj.speed.z += jfarm.gravity;
		var speed = {x:0, y:0, z:obj.speed.z};

		// calculate resulting displacement from orientation of player
		var angle = obj.rot.gamma;
		speed.x = Math.sin(angle) * move;
		speed.y = Math.cos(angle) * move;
		
		// try moving character
		var targetInfo = jfarm.densityMap.getTargetPoint(obj.centerp, speed, 20, 10);
		var targetp = targetInfo.targetp;
		obj.falling = obj.centerp.z > targetp.z;
		if (targetInfo.stopFall) {
			obj.speed.z = 0;
			obj.falling = 0;
		}
		obj.moved = targetInfo.movex != 0 && targetInfo.movey != 0;
		return targetp;
	}, 
	moveBypass: function(obj, angle, dist){
		obj.rotate({x:0, y:0, z:1}, angle);
		var c = obj.centerp;
		var angle = obj.rot.gamma;
		obj.targetDistance = dist;
		obj.target = {x:c.x+(Math.sin(angle))*dist,y:c.y+(Math.cos(angle)*dist),z:0};
		obj.steps = 0;
	},
	turnTowardsTarget: function(obj, targetp) {
		var dx = targetp.x - obj.centerp.x;
		var dy = targetp.y - obj.centerp.y;
		var angle = -Math.atan2(dy, dx) + Math.PI/2;
		obj.setOrientation({alpha: 0, beta: 0, gamma: angle});
	},
	setTarget: function(obj, targetp){
		if(!targetp)
			return;

		obj.target = targetp;
		obj.finalTarget = targetp;
		var dx = targetp.x - obj.centerp.x;
		var dy = targetp.y - obj.centerp.y;
		obj.targetDistance = Math.sqrt(dx*dx+dy*dy);
		jfarm.turnTowardsTarget(obj, targetp);

		obj.steps = 0;		// steps taken towards the target
		obj.bypass = 0; 	// heading directly towards the target
		obj.bypassSteps = 0;
		obj.falling = 0;
		obj.arrived = 0;
		obj.fighting = 0;
		// jfarm.stopFight(obj);
	},
	characterArrived: function(obj){
		// character has arrived to its target / target location
		obj.target = null;
		obj.finalTarget = null;
		obj.animationState = 0;
		jfarm.resetCharacterAnimation(obj);
		// jfarm.stopFootsteps(obj);
		
		if (obj.targetObj) {
			// turn towards target
			jfarm.turnTowardsTarget(obj, obj.targetObj.centerp);
		}
	},
	moveCharacter: function(obj){
		// move towards target
		var targetp = jfarm.moveTowardsTarget(obj, jfarm.maxmove);

		if (jfarm.characterAtTargetObj(obj)) {
			jfarm.characterArrived(obj);
			return;
		}
		
		// moved?
		if (obj.moved) {
			obj.steps += jfarm.maxmove;
			obj.arrived = obj.steps >= obj.targetDistance;
			jfarm.animateCharacter(obj, obj.animationState);
			obj.animationState++;
			obj.setPosition(targetp);
			if (obj == jfarm.player)
				jfarm.moveCamera();
			
			// jfarm.checkRoadWalk(obj);
		}
		
		// arrived to target?
		if (obj.arrived && !obj.falling) {
			if (obj.bypass) {
				obj.bypassSteps += obj.steps;
				if (obj.bypassSteps > jfarm.maxbypass) {
					// turn to original target
					jfarm.setTarget(obj, obj.finalTarget);
				} else {
					// move to left 
					jfarm.moveBypass(obj, jfarm.bypassAngleLeft, jfarm.bypassDistLeft);
				}
			} else {
				// arrived at final target
				jfarm.characterArrived(obj);
			}
		}
		
		// bumped into obstacle?
		if (!obj.moved && !obj.falling && !obj.arrived) {
			if (!obj.bypass) {
				// start bypassing
				obj.bypass = 1;
				obj.bypassSteps = 0;
				obj.finalTarget = obj.target;
			}
			// move to right
			jfarm.moveBypass(obj, jfarm.bypassAngleRight, jfarm.bypassDistRight);
		}
	},
	moveCamera: function() {
		// camera is only moved if player moves out of a certain box
		var center = {u:sheetengine.scene.center.u, v:sheetengine.scene.center.v};
		var player = sheetengine.transforms.transformPoint({x:jfarm.player.centerp.x, y:jfarm.player.centerp.y, z:0});
		
		if (center.u - player.u > jfarm.cameraMaxDistance) {
			center.u = player.u + jfarm.cameraMaxDistance;
		} else if (player.u - center.u > jfarm.cameraMaxDistance) {
			center.u = player.u - jfarm.cameraMaxDistance;
		}
		if (center.v - player.v > jfarm.cameraMaxDistance) {
			center.v = player.v + jfarm.cameraMaxDistance;
		} else if (player.v - center.v > jfarm.cameraMaxDistance) {
			center.v = player.v - jfarm.cameraMaxDistance;
		}
		sheetengine.scene.setCenter(null, center);
	},
	animateCharacter: function(obj, state) {
		// animate character movement
		state = Math.floor( (state % 8) / 2);
		var dir = (state == 0 || state == 3) ? 1 : -1;
		
		obj.rotateSheet(obj.leg1, {x:0,y:0,z:8}, {x:1,y:0,z:0}, dir * Math.PI/8);
		obj.rotateSheet(obj.leg2, {x:0,y:0,z:8}, {x:1,y:0,z:0}, -dir * Math.PI/8);
		
		obj.leg1.angle += dir;
		obj.leg2.angle += -dir;
	},
	resetCharacterAnimation: function(obj) {
		obj.rotateSheet(obj.leg1, {x:0,y:0,z:8}, {x:1,y:0,z:0}, -obj.leg1.angle * Math.PI/8);
		obj.rotateSheet(obj.leg2, {x:0,y:0,z:8}, {x:1,y:0,z:0}, -obj.leg2.angle * Math.PI/8);
		
		obj.leg1.angle = 0;
		obj.leg2.angle = 0;
	},
	// dynamic yard loading
	loadYards: function() {
		// check if player moved out of boundary
		if (jfarm.player.centerp.x >= jfarm.boundary.x1 &&
			jfarm.player.centerp.y >= jfarm.boundary.y1 &&
			jfarm.player.centerp.x <= jfarm.boundary.x2 &&
			jfarm.player.centerp.y <= jfarm.boundary.y2) 
			return;
			
		// set new boundary
		var yardpos = sheetengine.scene.getYardFromPos(jfarm.player.centerp);
		jfarm.setBoundary(yardpos);

		// get new yards and remove old yards
		sheetengine.scene.getNewYards("http://www.crossyards.com", yardpos, jfarm.levelsize, jfarm.appid, jfarm.newYardsAdded);
	},
	newYardsAdded: function(newsheets, newobjects, removedsheets, removedobjects) {
		// store deleted objects' properties for later use
		// for (var i=0;i<removedobjects.length;i++) {
		// 	var obj = removedobjects[i];
		// 	if (obj.name == 'Enemy' || obj.name == 'Health potion' || obj.name.indexOf('Key') != -1 || obj.name.indexOf('Gate') != -1) {
		// 		jfarm.deletedObjects[obj.id] = obj;
		// 	}
		// 	if (obj.name == 'Enemy')
		// 		jfarm.stopFootsteps(obj);
		// }

		// set default properties of objects just like at init phase
		// jfarm.initObjectProperties(newobjects);
		// restore object states
		for (var i=0;i<newobjects.length;i++) {
			var obj = newobjects[i];
			var deleted = jfarm.deletedObjects[obj.id];
			if (!deleted)
				continue;
				
			if (obj.name == 'Enemy') {
				obj.setPosition(deleted.centerp);
				obj.setOrientation(deleted.rot);
				obj.health = deleted.health;
				obj.killed = deleted.killed;
			}
			if (obj.name == 'Health potion') {
				if (deleted.drunk)
					obj.hide();
			}
			if (obj.name.indexOf('Key') != -1) {
				if (deleted.picked)
					obj.hide();
			}
			if (obj.name.indexOf('Gate') != -1) {
				obj.opening = deleted.opening ? 1 : 0;	// opening restarts if it was interrupted when object was deleted
				obj.opened = deleted.opened;
				if (obj.opened) {
					var left = obj.sheets[1];
					var right = obj.sheets[2];
					obj.rotateSheet(left, {x:-21,y:0,z:0}, {x:0,y:0,z:1}, -Math.PI/32*20);
					obj.rotateSheet(right, {x:21,y:0,z:0}, {x:0,y:0,z:1}, Math.PI/32*20);
				}
			}
			delete jfarm.deletedObjects[obj.id];
		}

		jfarm.densityMap.removeSheets(removedsheets);
		for (var i=0;i<removedobjects.length;i++) {
			jfarm.densityMap.removeSheets(removedobjects[i].sheets);
		}
		jfarm.densityMap.addSheets(newsheets);
		sheetengine.calc.calculateAllSheets();
		//sheetengine.calc.calculateChangedSheets();
		jfarm.redraw(true);
	},
	setBoundary: function(yardpos) {
		var b = jfarm.boundarySize;
		jfarm.boundary = {
			x1: (yardpos.relyardx - b) * sheetengine.scene.tilewidth,
			y1: (yardpos.relyardy - b) * sheetengine.scene.tilewidth,
			x2: (yardpos.relyardx + b) * sheetengine.scene.tilewidth,
			y2: (yardpos.relyardy + b) * sheetengine.scene.tilewidth
		};
	},	

	// drawing
	redraw: function(full) {
		sheetengine.drawing.drawScene(full);
		
		// static drawing
		jfarm.drawTarget();
		// jfarm.drawHealth();
		// jfarm.drawBubble();
		if (jfarm.hoveredObj)
			jfarm.highlightObject(jfarm.hoveredObj);
	},
	drawTarget: function() {
		if (!jfarm.player.finalTarget && !jfarm.player.targetObj)
			return;
			
		var ctx = sheetengine.context;

		ctx.save();
		ctx.scale(1, 0.5);
		ctx.lineWidth = 2;
		ctx.globalAlpha = 0.2;

		// draw arc at static point
		ctx.strokeStyle = jfarm.player.targetObj ? '#5BB3D3' : '#D6B931';
		ctx.beginPath();
		var p = jfarm.player.targetObj ? 
			sheetengine.drawing.getPointuv(jfarm.player.targetObj.centerp) :
			sheetengine.drawing.getPointuv(jfarm.player.finalTarget);
		ctx.arc(p.u, p.v*2, 15, 0, Math.PI*2);
		ctx.closePath();
		ctx.stroke();
		ctx.beginPath();
		ctx.restore();
	},
	highlightObject: function(obj, strokeStyle) {

		var ctx = sheetengine.context
			,strokeStyle = strokeStyle || '#000'
			,canvasSize = obj.canvasSize
			,text = obj.name || ""
			,p = sheetengine.drawing.getPointuv(obj.centerp);

		ctx.save();
		ctx.lineWidth = jfarm.linewidth;
		ctx.globalAlpha = 0.8;
		ctx.strokeStyle = strokeStyle;
		var ouv = sheetengine.drawing.getPointuv(obj.centerp);
		ctx.strokeRect(Math.round(ouv.u) - canvasSize.relu , Math.round(ouv.v) - canvasSize.relv, canvasSize.w, canvasSize.h);

		// displaying object's name above object canvassize
		ctx.font = '14px "century gothic"';
		ctx.strokeStyle = '#000';
		ctx.strokeText(text, p.u - canvasSize.relu, p.v - canvasSize.relv - 5);
		ctx.restore();
	},
	getHoveredObject: function(puv) {
	  	for (var i = 0; i < sheetengine.objects.length; i++) {
			var obj = sheetengine.objects[i]
				,ouv = sheetengine.drawing.getPointuv(obj.centerp)
				,canvasSize = obj.canvasSize;

			if(puv.u > ouv.u - canvasSize.relu &&
				puv.u < ouv.u - canvasSize.relu + canvasSize.w &&
				puv.v > ouv.v - canvasSize.relv &&
				puv.v < ouv.v - canvasSize.relv + canvasSize.h){
				lastHoveredObj = obj || lastHoveredObj;
				return obj;
			}
	  	};
	  	return null;
	},
	isObjectHovered: function(puv, object) {
		var ouv = sheetengine.drawing.getPointuv(object.centerp)
			, canvasSize = object.canvasSize;

		if (puv.u > ouv.u - canvasSize.relu && 
			puv.u < ouv.u - canvasSize.relu + canvasSize.w &&
			puv.v > ouv.v - canvasSize.relv && 
			puv.v < ouv.v - canvasSize.relv + canvasSize.h)
		  return true;

		return false;
	},
	highlightHoveredBaseSheet: function(){
		var ctx = sheetengine.context;
		ctx.save();
		ctx.scale(1, 0.5);
		ctx.lineWidth = 2;
  		ctx.strokeStyle = '#000';
  		var puvC1 = sheetengine.drawing.getPointuv(jfarm.hoveredBaseSheet.corners[0])
  			,puvC2 = sheetengine.drawing.getPointuv(jfarm.hoveredBaseSheet.corners[1])
  			,puvC3 = sheetengine.drawing.getPointuv(jfarm.hoveredBaseSheet.corners[2])
  			,puvC4 = sheetengine.drawing.getPointuv(jfarm.hoveredBaseSheet.corners[3]);

	  	ctx.beginPath();
	  	ctx.moveTo(puvC1.u, puvC1.v*2);
	  	ctx.lineTo(puvC2.u, puvC2.v*2);
	  	ctx.lineTo(puvC3.u, puvC3.v*2);
	  	ctx.lineTo(puvC4.u, puvC4.v*2);
	  	ctx.lineTo(puvC1.u, puvC1.v*2);
	  	ctx.stroke();
	  	ctx.restore();
	},
	getBasesheetByCenterp: function(centerp) {
		for (var i = 0; i < sheetengine.basesheets.length; i++) {
			var obj = sheetengine.basesheets[i]
				,objCenter = obj.centerp;
			if (objCenter.x == centerp.x && objCenter.y == centerp.y)
				return obj;
		}
		return null;
	},
	getBaseSheetByPuv: function(puv) {
		var pxy = sheetengine.transforms.inverseTransformPoint({
				  u:puv.u + sheetengine.scene.center.u, 
				  v:puv.v + sheetengine.scene.center.v
				});
		for (var i = 0; i < sheetengine.basesheets.length; i++) {
			var obj = sheetengine.basesheets[i]
				,corner1 = obj.corners[0] 
				,corner2 = obj.corners[1]
				,corner3 = obj.corners[2] 
				,corner4 = obj.corners[3];

			if (pxy.y >= corner1.y && pxy.y <= corner3.y && pxy.x >= corner4.x && pxy.x <= corner2.x)
				return obj;
		}
		return null;
	},

	// location
	isPossibleToDrawHere: function(basesheet) {
		switch(jfarm.drawnObj){
			case jfarm.enumAppObjects[0]: // barn
				// return false if any of basesheets.neutral property is true
				jfarm.currentLocationBaseSheets = jfarm.getBarnLocationBaseSheets(basesheet); 
				for (var i = 0; i < jfarm.currentLocationBaseSheets.length; i++) {
					if(!jfarm.currentLocationBaseSheets[i].neutral)
						return false;
				};
				return true;
			break;
			case jfarm.enumAppObjects[1]: // cold storage
				jfarm.currentLocationBaseSheets = jfarm.getColdStorageLocationBaseSheets(basesheet); 
				for (var i = 0; i < jfarm.currentLocationBaseSheets.length; i++) {
					if(!jfarm.currentLocationBaseSheets[i].neutral)
						return false;
				};
				return true;
			break;
			case jfarm.enumAppObjects[2]: // silo
				return basesheet.neutral;
			break;
			case jfarm.enumAppObjects[3]: // corn
				return basesheet.neutral;
			break;
			case jfarm.enumAppObjects[4]: // tomatoes
				return basesheet.neutral;
			break;
			case jfarm.enumAppObjects[5]: // wheat
				return basesheet.neutral;
			break;
			default:
				return false;
		}
	},
	getDrawingCenterp: function(centerp) { // TODO gérer l'orientation
		switch(jfarm.drawnObj){
			case jfarm.enumAppObjects[0]: // barn
				return {x: centerp.x+(tileWidth*3)/2, y: centerp.y, z:null};
			break;
			case jfarm.enumAppObjects[1]: // cold storage
				return {x: centerp.x+tileWidth, y: centerp.y - tileHeight/2, z:null};
			break;
			default:
				return centerp;
		}
	},
	getColdStorageLocationCornersuv: function(basesheet) { // TODO : Check boundaries
		var corners = basesheet.corners
			, centerp = basesheet.centerp
			, westNorthBaseSheet = jfarm.getBasesheetByCenterp({x: centerp.x, y:centerp.y - tileHeight})
			, eastNorthBaseSheet = jfarm.getBasesheetByCenterp({x: centerp.x+tileWidth*2, y:centerp.y - tileHeight})
			, eastSouthBaseSheet = jfarm.getBasesheetByCenterp({x: centerp.x+tileWidth*2, y:centerp.y});
		
		return [corners[0], eastSouthBaseSheet.corners[1], eastNorthBaseSheet.corners[2], westNorthBaseSheet.corners[3]];
	},
	getColdStorageLocationBaseSheets: function(basesheet) { // TODO : Check boundaries
		var centerp = basesheet.centerp
			, westNorthBaseSheet = jfarm.getBasesheetByCenterp({x: centerp.x, y:centerp.y - tileHeight})
			, centerNorthBaseSheet = jfarm.getBasesheetByCenterp({x: centerp.x+tileWidth, y:centerp.y - tileHeight})
			, eastNorthBaseSheet = jfarm.getBasesheetByCenterp({x: centerp.x+tileWidth*2, y:centerp.y - tileHeight})
			, eastSouthBaseSheet = jfarm.getBasesheetByCenterp({x: centerp.x+tileWidth*2, y:centerp.y})
			, centerSouthBaseSheet = jfarm.getBasesheetByCenterp({x: centerp.x+tileWidth*2, y:centerp.y - tileHeight});
		
		return [basesheet,westNorthBaseSheet, centerNorthBaseSheet, eastSouthBaseSheet, eastNorthBaseSheet, centerSouthBaseSheet];
	},
	getBarnLocationBaseSheets: function(basesheet) {
		var centerp = basesheet.centerp
			, secondBaseSheet = jfarm.getBasesheetByCenterp({x: centerp.x+tileWidth, y:centerp.y})
			, thirdBaseSheet = jfarm.getBasesheetByCenterp({x: centerp.x+tileWidth*2, y:centerp.y})
			, fourthBaseSheet = jfarm.getBasesheetByCenterp({x: centerp.x+tileWidth*3, y:centerp.y});

		return [basesheet,secondBaseSheet, thirdBaseSheet, fourthBaseSheet];
	},
	getBarnLocationCornersuv: function(basesheet) { // TODO : Check boundaries
		var corners = basesheet.corners
			, centerp = basesheet.centerp
			, lastBaseSheet = jfarm.getBasesheetByCenterp({x: centerp.x+tileWidth*3, y:centerp.y});
		
		return [corners[0], lastBaseSheet.corners[1], lastBaseSheet.corners[2], corners[3]];
	},

	// buildings & crops
	defineColdStorage: function(centerp) {
		//TODO calculate relative centerp for each sheet
		var csLength = tileWidth*3
			, csHeight = 80
			, csWidth = tileHeight*2;

	  	var roofSheet = new sheetengine.Sheet({x:0,y:0,z:csHeight}, rotTopSide, {w:csLength,h:csWidth});
			roofSheet.context.fillStyle = '#FFF'; // Top
			roofSheet.context.fillRect(0,0,csLength,csWidth);

	  	var northSheet = new sheetengine.Sheet({x:0,y:-csHeight,z:csHeight/2}, rotSouthSide, {w:csLength,h:csHeight});
			northSheet.context.fillStyle = '#FFF'; // South
			northSheet.context.fillRect(0,0,csLength,tileHeight);

	  	var southSheet = new sheetengine.Sheet({x:0,y:csHeight,z:csHeight/2}, rotSouthSide, {w:csLength,h:csHeight});
			southSheet.context.fillStyle = '#FFF'; // South
			southSheet.context.fillRect(0,0,csLength,tileHeight);

	  	var westSheet = new sheetengine.Sheet({x:-csLength/2,y:0,z:csHeight/2}, rotEastSide, {w:csWidth,h:csHeight});
	  	westSheet.context.fillStyle = '#FFF'; // East
	  	westSheet.context.fillRect(0,0,csWidth,csHeight);

	  	var eastSheet = new sheetengine.Sheet({x:csLength/2,y:0,z:csHeight/2}, rotEastSide, {w:csWidth,h:csHeight});
	  	eastSheet.context.fillStyle = '#FFF'; // East
	  	eastSheet.context.fillRect(0,0,csWidth,csHeight);

	  	var cs = new sheetengine.SheetObject(
	  					centerp
	  					, rotSouthSide
	  					, [roofSheet, northSheet, southSheet, westSheet, eastSheet]
	  					, {w:330,h:250,relu:160,relv:160}); // TODO : Dynamic values
	  	cs.name = "Cold Storage";

	  	// Cold Storage doors
	  	var ctx = southSheet.context;
	  	ctx.fillStyle = '#424242';
	  	ctx.fillRect(tileWidth*2/3,csHeight/3,tileWidth*2/3, csHeight*2/3); 
	  	ctx.fillRect(tileWidth*2,csHeight/2,30, csHeight/2); 

	  	// poignées
	  	ctx.fillStyle = '#000';
	  	ctx.fillRect(tileWidth,csHeight-10,3, 4);
	  	ctx.fillRect(tileWidth*2+20,60,3, 4);

	  	return cs;
	},

	defineBarn:function(centerp){
		var bLength = tileWidth*4
			, bHeight = 80
			, bWidth = tileHeight;

		var roofSouthSheet = new sheetengine.Sheet({x:0,y:bHeight/2 -12,z:bHeight + 14}, {alphaD:-45,betaD:0,gammaD:0}, {w:bLength +10,h:bHeight});
		roofSouthSheet.context.fillStyle = '#9ba5a4'; // South
		roofSouthSheet.context.fillRect(0,0,bLength +10,bHeight-15);

		var roofNorthSheet = new sheetengine.Sheet({x:0,y:-bHeight/2 +12,z:bHeight + 14}, {alphaD:45,betaD:0,gammaD:0}, {w:bLength +10,h:bHeight});
		roofNorthSheet.context.fillStyle = '#9ba5a4'; // South
		roofNorthSheet.context.fillRect(0,0,bLength +10,bHeight-15);

		var southSheet = new sheetengine.Sheet({x:0,y:bWidth/2,z:bHeight/2}, rotSouthSide, {w:bLength,h:bHeight});
		southSheet.context.fillStyle = '#aa3114'; // South //aa3114
		southSheet.context.fillRect(0,0,bLength,tileHeight);

		var northSheet = new sheetengine.Sheet({x:0,y:-bWidth/2,z:bHeight/2}, rotSouthSide, {w:bLength,h:bHeight});
		northSheet.context.fillStyle = '#aa3114'; // South //aa3114
		northSheet.context.fillRect(0,0,bLength,tileHeight);

		var eastSheetH = bHeight + 40;
		var eastSheet = new sheetengine.Sheet({x:bLength/2,y:0,z:(bHeight+40)/2}, rotEastSide, {w:bWidth,h:eastSheetH});

		var westSheet = new sheetengine.Sheet({x:-bLength/2,y:0,z:(bHeight+40)/2}, rotEastSide, {w:bWidth,h:eastSheetH});

		// South
		var ctxSS = southSheet.context
			, ctxNS = northSheet.context
			, nbWindows = 7;

		ctxSS.strokeStyle = ctxNS.strokeStyle = '#FFF';
		for (var i = 0; i < nbWindows; i++) {
			ctxSS.strokeRect(bLength/nbWindows - 5 + i*40,bHeight/2+5,10,10);
			ctxSS.clearRect(bLength/nbWindows - 5 + i*40,bHeight/2+5,9,9);
			ctxNS.strokeRect(bLength/nbWindows - 5 + i*40,bHeight/2+5,10,10);
			ctxNS.clearRect(bLength/nbWindows - 5 + i*40,bHeight/2+5,9,9);
		};

		// west 
		var ctxWS = westSheet.context;
		ctxWS.fillStyle = '#aa3114';
		ctxWS.beginPath();
		ctxWS.moveTo(bWidth/2,0);
		ctxWS.lineTo(bWidth,bHeight/2);
		ctxWS.lineTo(bWidth,eastSheetH);
		ctxWS.lineTo(0,eastSheetH);
		ctxWS.lineTo(0,bHeight/2);
		ctxWS.closePath();
		ctxWS.fill();

		// east
		var ctxES = eastSheet.context;

		ctxES.fillStyle = '#aa3114';
		ctxES.beginPath();
		ctxES.moveTo(bWidth/2,0);
		ctxES.lineTo(bWidth,bHeight/2);
		ctxES.lineTo(bWidth,eastSheetH);
		ctxES.lineTo(0,eastSheetH);
		ctxES.lineTo(0,bHeight/2);
		ctxES.closePath();
		ctxES.fill();

		// east door 
		ctxES.strokeStyle = '#FFF';
		ctxES.beginPath();
		ctxES.strokeRect(bWidth/4,eastSheetH-bHeight/2, bWidth/2,bHeight/2 );
		ctxES.moveTo(bWidth/2,eastSheetH);
		ctxES.lineTo(bWidth/2, eastSheetH-bHeight/2);
		ctxES.stroke();
		ctxES.restore();
		//window
		ctxES.strokeRect(bWidth/2-10,eastSheetH/3, 20, 20);
		ctxES.clearRect(bWidth/2-10,eastSheetH/3, 19, 19);

		var barn = new sheetengine.SheetObject(
						centerp
						,{alphaD:0,betaD:0,gammaD:0}
						,[westSheet, eastSheet, southSheet, northSheet, roofSouthSheet, roofNorthSheet]
						,{w:350,h:270,relu:170,relv:190}); 
		barn.name = "Barn";

		return barn;
	},

	defineSilo: function(centerp){
		// square
		var sud = new sheetengine.Sheet({x:0,y:40,z:115}, {alphaD:0,betaD:0,gammaD:0}, {w:80,h:80});
		sud.context.fillStyle = '#b5b4b3';
		sud.context.fillRect(0,0,80,80);
		var est = new sheetengine.Sheet({x:40,y:0,z:115}, {alphaD:0,betaD:0,gammaD:90}, {w:80,h:80});
		est.context.fillStyle = '#b5b4b3';
		est.context.fillRect(0,0,80,80);
		var top = new sheetengine.Sheet({x:0,y:0,z:155}, {alphaD:90,betaD:0,gammaD:0}, {w:80,h:80});
		top.context.fillStyle = '#b5b4b3';
		top.context.fillRect(0,0,80,80);

		// Tri Top
		var tri1 = new sheetengine.Sheet({x:0,y:20,z:40}, {alphaD:30,betaD:0,gammaD:0}, {w:80,h:80});
		var ctx1 = tri1.context;
		ctx1.beginPath();
		ctx1.moveTo(0,0);
		ctx1.lineTo(40,80);
		ctx1.lineTo(80, 0);
		ctx1.fillStyle = '#656565';
		ctx1.fill();

		// Tri Est
		var tri2 = new sheetengine.Sheet({x:20,y:0,z:40}, {alphaD:0,betaD:-30,gammaD:90}, {w:80,h:80});
		var ctx2 = tri2.context;
		ctx2.beginPath();
		ctx2.moveTo(0,0);
		ctx2.lineTo(40,80);
		ctx2.lineTo(80, 0);
		ctx2.fillStyle = '#656565';
		ctx2.fill();

		// Pillier left
		var pillierLeftSud = new sheetengine.Sheet({x:-37,y:40,z:40}, {alphaD:0,betaD:0,gammaD:0}, {w:6,h:80});
		pillierLeftSud.context.fillStyle = '#b5b4b3';
		pillierLeftSud.context.fillRect(0,0,80,80);
		var pillierLeftEst = new sheetengine.Sheet({x:-40,y:37,z:40}, {alphaD:0,betaD:0,gammaD:90}, {w:6,h:80});
		pillierLeftEst.context.fillStyle = '#b5b4b3';
		pillierLeftEst.context.fillRect(0,0,80,80);

		// Pillier middle
		var pillierBottomSud = new sheetengine.Sheet({x:37,y:40,z:40}, {alphaD:0,betaD:0,gammaD:0}, {w:6,h:80});
		pillierBottomSud.context.fillStyle = '#b5b4b3';
		pillierBottomSud.context.fillRect(0,0,80,80);
		var pillierBottomEst = new sheetengine.Sheet({x:40,y:37,z:40}, {alphaD:0,betaD:0,gammaD:90}, {w:6,h:80});
		pillierBottomEst.context.fillStyle = '#b5b4b3';
		pillierBottomEst.context.fillRect(0,0,80,80);

		// Pillier right
		var pillierRightSud = new sheetengine.Sheet({x:37,y:-40,z:40}, {alphaD:0,betaD:0,gammaD:0}, {w:6,h:80});
		pillierRightSud.context.fillStyle = '#b5b4b3';
		pillierRightSud.context.fillRect(0,0,80,80);
		var pillierRightEst = new sheetengine.Sheet({x:40,y:-37,z:40}, {alphaD:0,betaD:0,gammaD:90}, {w:6,h:80});
		pillierRightEst.context.fillStyle = '#b5b4b3';
		pillierRightEst.context.fillRect(0,0,80,80);

		var silo = new sheetengine.SheetObject(
		centerp,
		{alphaD:0,betaD:0,gammaD:0},
		[sud,est,top,tri1,tri2,pillierLeftSud,pillierLeftEst,pillierBottomSud,pillierBottomEst,pillierRightSud,pillierRightEst],
		{w:150,h:225,relu:75,relv:190}
		);
		silo.name = "silo";

		return silo;
	},
	defineTomatoesPlants: function(centerp){
		var coords = [{x:-20,y:20,z:10}, {x:20,y:0,z:10}, {x:20,y:-20,z:10}, {x:-20,y:-20,z:10}, {x:-20,y:0,z:10}, {x:20,y:20,z:10}]
			,plantsArr = [];

		for (var i = 0; i < coords.length; i++) {
			var plant = new sheetengine.Sheet(coords[i], {alphaD:0,betaD:0,gammaD:90}, {w:20,h:20})
				,ctx = plant.context
				,y = 4;
				
			ctx.fillStyle = '#3a6e2a';
			ctx.fillRect(0,0,4,20);
			// we draw some red tomatoes 
			for (var j = 0; j < 3; j++) {
				ctx.beginPath();
				ctx.arc(4,y,2.5,0,2*Math.PI);
				ctx.stroke();
				ctx.fillStyle = '#ff0000'; // red
				ctx.fill();
				y+=6;
			};
			
			plantsArr.push(plant);
		};

		var tomatoes = new sheetengine.SheetObject(
								centerp,
								{alphaD:0,betaD:0,gammaD:0},
								plantsArr,
								{w:120,h:70,relu:60,relv:40});
		tomatoes.name = "tomatoes";
		return tomatoes
	},
	defineCrops: function(centerp, name, color, gradient, gradientColor){
		var rowsArr = []
			,nbRows = 15
			,y = -(jfarm.tileWidth/2) +7;

	  	for (var i = 0; i < nbRows; i++) {
	  		var rowCenter = {x:0,y:y,z:4}
	  			,rowSheet = new sheetengine.Sheet(rowCenter,{alphaD:0,betaD:0,gammaD:0}, {w:jfarm.tileWidth,h:8})
	  			,ctx = rowSheet.context
	  			,fillStyle = color
	  			,x = 0;

	  		// if gradient is not undefined, we create it
	  		if(gradient){
	  			var grd = ctx.createLinearGradient(0,0,0,8);
	  			grd.addColorStop(0, color); 
	  			grd.addColorStop(1, gradientColor);
	  			fillStyle = grd;
	  		}
	  		ctx.fillStyle = fillStyle;
	  		// we fill some part of the context to draw crop plant
	  		for (var j = 0; j < nbRows+1; j++) {
	  			ctx.fillRect(x,0,2,8);
					x+=5;
	  		};
	  		rowsArr.push(rowSheet); // we add sheet to the array
	  		y+= 5;
	  	};
	  	// we create an object with all created sheets
	  	var crop = new sheetengine.SheetObject(
		  centerp,
		  {alphaD:0,betaD:0,gammaD:0},
		  rowsArr,
		  {w:120,h:70,relu:60,relv:40}
		);
		crop.name = name;

		return crop;
	},

	// event handlers
	click: function(event) {
		// if (jfarm.player.killed)
		// 	return;
		
		if (!jfarm.hoveredObj) {
			// set target location
			// var puv = {
			// 	u:event.clientX - sheetengine.canvas.offsetLeft + pageXOffset, 
			// 	v:event.clientY - sheetengine.canvas.offsetTop + pageYOffset
			// };
			// var pxy = sheetengine.transforms.inverseTransformPoint({u:puv.u + sheetengine.scene.center.u, v:puv.v + sheetengine.scene.center.v});
			// pxy.x = (pxy.x - sheetengine.scene.center.x) / jfarm.zoom + sheetengine.scene.center.x;
			// pxy.y = (pxy.y - sheetengine.scene.center.y) / jfarm.zoom + sheetengine.scene.center.y;
			
			jfarm.player.targetObj = null;
			if(jfarm.hoveredBaseSheet)
				jfarm.setTarget(jfarm.player, jfarm.hoveredBaseSheet.centerp);
		} else {
			// set target object
			jfarm.player.targetObj = jfarm.hoveredObj;
			if (jfarm.characterAtTargetObj(jfarm.player))
				jfarm.characterArrived(jfarm.player);
			else
				jfarm.setTarget(jfarm.player, jfarm.player.targetObj.centerp);
		}
	},
	mousemove: function(event) {
		if (!jfarm.sceneIsReady)
			return;
		
		// calculate hovered object
		var puv = {
			u:event.clientX - sheetengine.canvas.offsetLeft + pageXOffset, 
			v:event.clientY - sheetengine.canvas.offsetTop + pageYOffset
		};

		if(jfarm.selectingObject){
			// get hovered object
			jfarm.hoveredObj = jfarm.getHoveredObject(puv);
			if (jfarm.hoveredObj)
				$(sheetengine.canvas).css('cursor','pointer');
			else 
				$(sheetengine.canvas).css('cursor','crosshair');
		}
		else {
			// get hovered tile 
			jfarm.hoveredBaseSheet = jfarm.getBaseSheetByPuv(puv); 
			if(jfarm.drawingLocation && jfarm.hoveredBaseSheet){
				switch(jfarm.drawnObj){
					case jfarm.enumAppObjects[0]: // barn
						jfarm.locationCorners = jfarm.getBarnLocationCornersuv(jfarm.hoveredBaseSheet);
					break;
					case jfarm.enumAppObjects[1]: // cold storage
						jfarm.locationCorners = jfarm.getColdStorageLocationCornersuv(jfarm.hoveredBaseSheet);
					break;
					case jfarm.enumAppObjects[2]: // silo
						jfarm.locationCorners = jfarm.hoveredBaseSheet.corners;
					break;
					case jfarm.enumAppObjects[3]: // corn
						jfarm.locationCorners = jfarm.hoveredBaseSheet.corners;
					break;
					case jfarm.enumAppObjects[4]: // tomatoes
						jfarm.locationCorners = jfarm.hoveredBaseSheet.corners;
					break;
					case jfarm.enumAppObjects[5]: // wheat
						jfarm.locationCorners = jfarm.hoveredBaseSheet.corners;
					break;
					default:
				}
			}
			else { // moving character process ???

			}
		}
	},
	// main timer
	timer: function() {
		var startTime = new Date().getTime();
	
		var sceneChanged = 0;
		
		if(jfarm.hoveredBaseSheet){
			// we redraw scene to erase previous highlighted basesheet
			jfarm.redraw();
			// we highlight new basesheet
			jfarm.highlightHoveredBaseSheet();
		  	// sceneChanged = 1;
		}

		if(jfarm.playerObjectChanged){
			jfarm.playerObjectChanged = false;
			sceneChanged = 1;
		}

		// player actions
		if (jfarm.player.target) {
			jfarm.moveCharacter(jfarm.player);
			jfarm.loadYards();
			sceneChanged = 1;
		}

		// player object has changed 
		if(jfarm.player.arm.name != jfarm.playerObjectData.name){
			jfarm.setPlayerObject();
			sceneChanged = 1;
			sheetengine.calc.calculateChangedSheets();
		}
		
		// if (jfarm.player.fighting) {
		// 	jfarm.doFight(jfarm.player);
		// 	sceneChanged = 1;
		// }
		
		// // enemy actions
		// for (var i=0;i<sheetengine.objects.length;i++) {
		// 	var obj = sheetengine.objects[i];
		// 	if (obj.name != 'Enemy')
		// 		continue;
			
		// 	if (obj.killed)
		// 		continue;
			
		// 	if (!obj.fighting && !jfarm.player.killed) {
		// 		var dist = jfarm.dist(obj, jfarm.player);
		// 		if (dist < 100) {
		// 			obj.targetObj = jfarm.player;
		// 			jfarm.setTarget(obj, jfarm.player.centerp);
		// 		}
		// 	}
		// 	if (obj.target) {
		// 		jfarm.moveCharacter(obj);
		// 		sceneChanged = 1;
		// 	}
		// 	if (obj.fighting) {
		// 		jfarm.doFight(obj);
		// 		sceneChanged = 1;
		// 	}
		// }

		// // gate actions
		// for (var i=0;i<sheetengine.objects.length;i++) {
		// 	var obj = sheetengine.objects[i];
		// 	if (!obj.opening)
		// 		continue;
				
		// 	jfarm.openGate(obj);
		// 	sceneChanged = 1;
		// }
		
		// // hovered objects
		// if (jfarm.prevhoveredObj != jfarm.hoveredObj) {
		// 	jfarm.prevhoveredObj = jfarm.hoveredObj
		// 	sceneChanged = 1;
		// }
		
		// // control message bubble
		// if (jfarm.bubbleDim > 0) {
		// 	if (jfarm.bubbleCounter > 0)
		// 		jfarm.bubbleCounter--;
		// 	if (jfarm.bubbleCounter == 0)
		// 		jfarm.bubbleDim -= 0.05;
		// 	if (jfarm.bubbleDim < 0)
		// 		jfarm.bubbleDim = 0;
		// 	sceneChanged = 1;
		// }
			
		if (sceneChanged) {
			sheetengine.calc.calculateChangedSheets();
			jfarm.redraw();
		}

		var endTime = new Date().getTime();
		var duration = endTime - startTime;
		var remaining = jfarm.timerInterval - duration;
		setTimeout(jfarm.timer, remaining > 0 ? remaining : 0);
	}
}

$(function(){
	jfarm.init();
});