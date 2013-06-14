/* 
 jfarm 
*/

// Adding and Overriding of some prototype methods
sheetengine.SheetObject.prototype.getData = function() {
	return {
		name: this.name || ""
		, centerp: this.centerpdb
		, rot: { 
			alphaD: this.rot.alphaD
			,betaD: this.rot.betaD
			,gammaD: this.rot.gammaD
		}
	};
};

sheetengine.SheetObject.prototype.getString = function(){
	// sheets
	var sheets = [];
	for (var i=0;i<this.sheets.length;i++) {
	  var s = this.sheets[i];
	  
	  sheets.push({
	    centerp: s.centerp,
	    rot: {alphaD:s.rot.alphaD, betaD:s.rot.betaD, gammaD:s.rot.gammaD},
	    width: s.width, 
	    height: s.height, 
	    canvas: s.canvas.toDataURL()
	  });
	}
	// 'my object' replaced by this.name 
	var retobj = {name:this.name, thumbnail:'', hidden:false, intersectionsenabled: this.intersectionsenabled, canvasSize:this.canvasSize, sheets:sheets};
	return JSON.stringify(retobj);
};

jfarm = {
	appid: '4f244f4db41abbfd2c00018c' //"jfarm"
	,timerInterval: 40
	,sceneIsReady: 0
	,levelsize: 5
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
	,movingPlayer: true
	,selectingObject: false
	,drawingLocation: false
	,conquer: false

	// buildings & crops
	,locationCorners: []
	,currentLocationBaseSheets: []
	,drawnObj: null
	,enumAppObjects: []
	,appobjectsRots: { // TODO : retrieve from DB
		"silo": {alphaD:0,betaD:0,gammaD:0},
		"barn": {alphaD:0,betaD:0,gammaD:0},
		"cold storage": {alphaD:0,betaD:0,gammaD:0},
		"wheat": {alphaD:0,betaD:0,gammaD:0},
		"corn": {alphaD:0,betaD:0,gammaD:0},
		"tomatoes": {alphaD:0,betaD:0,gammaD:0}
	}
	,appobjectsCenterp: { // TODO : retrieve from DB
		"silo": {x:0,y:0,z:0},
		"barn": {x:-40,y:0,z:0},
		"cold storage": {x:0,y:-40,z:0}, //jfarm.tileWidth/2 <==> 40
		"wheat": {x:0,y:0,z:0},
		"corn": {x:0,y:0,z:0},
		"tomatoes": {x:0,y:0,z:0}
	}

	// player 
	,startp: {x:0,y:0,z:0}
	,playerFarm: {} // contains all player buildings and crops available on the map

	// playerObjects
	,playerWeaponChanged: false
	,playerWeaponData: {}
	
	,init: function() {

		// sheetengine.debug = true; // remove in prod

		jfarm.lineWidth = 1/jfarm.zoom/2;

		// init canvas
		// sheetengine.drawObjectContour = true;
		var canvasElement = document.getElementById('maincanvas');
		sheetengine.scene.init(canvasElement, {w:1200,h:1500});
		var ctx = sheetengine.context
			,text = "Loading...";

		ctx.save();
		ctx.font = '14px "century gothic"';
		ctx.strokeStyle = '#000';
		ctx.strokeText(text,canvasElement.width/2 - 20, canvasElement.height/2);
		ctx.restore();

		// set zoom
		var zoom = jfarm.zoom;
		sheetengine.context.scale(zoom,zoom);
		sheetengine.context.translate(-sheetengine.canvas.width/(2*zoom)*(zoom-1),-sheetengine.canvas.height/(2*zoom)*(zoom-1)); //???

		// set tile width
		sheetengine.scene.tilewidth = jfarm.tileWidth; // default is 300

		// jfarm.respawnX & jfarm.respawnY are defined in home.ejs
		var yardcenter = {
			yardx: jfarm.respawnX,
			yardy: jfarm.respawnY
		};
		// retrieve yards from localhost/yards
		sheetengine.scene.getYards('', yardcenter, jfarm.levelsize, jfarm.appid, jfarm.sceneReady); //http://www.crossyards.com
	},
	sceneReady: function(){
		
		//init density map 
		jfarm.densityMap = new sheetengine.DensityMap(5);
		jfarm.densityMap.addSheets(sheetengine.sheets); // uncomment if some sheets are created before

		// we retrieve templates from server
		// weapons / crop / building / properties
		jfarm.requestAjax("/templates", null, function(ajaxResponse){
			jfarm.initTemplates(ajaxResponse);
			// we retrieve Player details from server
			jfarm.requestAjax("/player/" + jfarm.playerId, null, jfarm.definePlayerObj);
		});

		// define scene center
		sheetengine.scene.setCenter(jfarm.startp);

		//get relative yard coordinates and set initial boundary for visible yards
		var yardpos = sheetengine.scene.getYardFromPos(jfarm.startp);
		jfarm.setBoundary(yardpos);
		
		sheetengine.calc.calculateAllSheets();
		jfarm.redraw(true);

		$('#maincanvas').on('click', jfarm.click);
		jfarm.timer();
		jfarm.sceneIsReady = 1;
	},
	initTemplates: function(ajaxResponse){
		if(ajaxResponse.success){
			var templates = ajaxResponse.templates;

			// ui trigger
			// $('.game').trigger("initTemplatesUI", [templates]); // TODO : place data-attributes in html page

			// weapons
			jfarm.weaponTpls = templates.weaponTpls;
			for (var i = 0; i < jfarm.weaponTpls.length; i++) {
				var img = new Image();
				img.src = jfarm.weaponTpls[i].img64;
				jfarm.weaponTpls[i].image = img;	
				//json parsing of centerp & rot
				jfarm.weaponTpls[i].centerp = JSON.parse(jfarm.weaponTpls[i].centerp);
				jfarm.weaponTpls[i].rot = JSON.parse(jfarm.weaponTpls[i].rot);
			};
			// buildings
			jfarm.buildingTpls = templates.buildingTpls;
			for (var i = 0; i < jfarm.buildingTpls.length; i++) {
				// we populate a array to find easier building || crop
				jfarm.enumAppObjects.push(jfarm.buildingTpls[i].name);
			};
			// crops
			jfarm.cropTpls = templates.cropTpls;
			for (var i = 0; i < jfarm.cropTpls.length; i++) {
				// we populate a array to find easier building || crop
				jfarm.enumAppObjects.push(jfarm.cropTpls[i].name);
			};
			jfarm.gameProperties = templates.properties;

		} else {
			console.log(ajaxResponse.message);
			jfarm.sceneIsReady = 0;
		}
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
	definePlayerObj: function(playerData) {

		// update ui player labels
		$('.game').trigger('onUIUpdatePlayer', [playerData]);

		// character definition for animation with sheet motion
		var body = new sheetengine.Sheet({x:0,y:0,z:15}, {alphaD:0,betaD:0,gammaD:0}, {w:11,h:14});
		var backhead = new sheetengine.Sheet({x:0,y:-1,z:19}, {alphaD:0,betaD:0,gammaD:0}, {w:8,h:6});
		backhead.context.fillStyle = playerData.hairColor || '#550';
		backhead.context.fillRect(0,0,8,6);
		// legs
		var leg1 = new sheetengine.Sheet({x:-3,y:0,z:4}, {alphaD:0,betaD:0,gammaD:0}, {w:5,h:8});
		leg1.context.fillStyle = playerData.pantsColor || '#00F';
		leg1.context.fillRect(0,0,5,10);
		var leg2 = new sheetengine.Sheet({x:3,y:0,z:4}, {alphaD:0,betaD:0,gammaD:0}, {w:5,h:8});
		leg2.context.fillStyle = playerData.pantsColor || '#00F';
		leg2.context.fillRect(0,0,5,10);
		leg1.angle = 0;
		leg2.angle = 0;
		
		var ctx = body.context;
		
		// head
		ctx.fillStyle = playerData.skinColor || '#FF0';
		ctx.fillRect(2,2,7,4);
		ctx.fillStyle = playerData.hairColor || '#550';
		ctx.fillRect(2,0,7,2);
		ctx.fillRect(2,2,1,1);
		ctx.fillRect(8,2,1,1);

		// body
		ctx.fillStyle = playerData.tshirtColor || '#F0F';
		ctx.fillRect(0,6,11,7);
		  
		// hands
		ctx.fillStyle = playerData.skinColor || '#FF0';
		ctx.fillRect(0,11,1,2);
		ctx.fillRect(10,11,1,2);

		// set arm, it's fork by default
		jfarm.playerWeaponData = jfarm.getWeaponByName("Fork");
		var arm = new sheetengine.Sheet(jfarm.playerWeaponData.centerp, jfarm.playerWeaponData.rot, {w:25,h:25});

		arm.context.drawImage(jfarm.playerWeaponData.image, jfarm.playerWeaponData.x, jfarm.playerWeaponData.y);
		arm.canvasChanged();
		arm.name = jfarm.playerWeaponData.name;
		jfarm.playerWeaponChanged = true;

		// define player object
		jfarm.player = new sheetengine.SheetObject(
							jfarm.startp
							, {alphaD:0,betaD:0,gammaD:0}
							, [arm, body,backhead,leg1,leg2]
							, {w:40,h:40,relu:20,relv:30}
						);
		jfarm.player.arm = arm;
		jfarm.player.leg1 = leg1;
		jfarm.player.leg2 = leg2;
		
		jfarm.player.animationState = 0;
		jfarm.player.speed = {x:0,y:0,z:0};
		jfarm.player.health = 100;
		jfarm.player.name = playerData.name || "It's me";
		jfarm.player.data = playerData;

		// set object dimming for player: character will dim other sheets, and other objects will not dim the character
		jfarm.player.setDimming(true, true);

		sheetengine.calc.calculateAllSheets();
		jfarm.redraw(true);
	},
	setPlayerWeapon: function(){
		var arm = jfarm.player.arm;
		arm.context.clearRect(0,0,25, 25);

		// arm.context.fillStyle = '#F00';
		// arm.context.strokeStyle = '#000';
		// arm.context.fillRect(0,0,25,25);
		// arm.context.strokeRect(0,0,25,25);

		// fout la merde 
		jfarm.player.setSheetPos(arm, sheetengine.geometry.clonePoint(jfarm.playerWeaponData.centerp),jfarm.playerWeaponData.rot);

		arm.context.drawImage(jfarm.playerWeaponData.image, jfarm.playerWeaponData.x, jfarm.playerWeaponData.y);
		arm.canvasChanged();
		arm.name = jfarm.playerWeaponData.name;
		jfarm.playerWeaponChanged = true;
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
		sheetengine.scene.getNewYards("", yardpos, jfarm.levelsize, jfarm.appid, jfarm.newYardsAdded);
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
				
			// if (obj.name == 'Enemy') {
			// 	obj.setPosition(deleted.centerp);
			// 	obj.setOrientation(deleted.rot);
			// 	obj.health = deleted.health;
			// 	obj.killed = deleted.killed;
			// }
			// if (obj.name == 'Health potion') {
			// 	if (deleted.drunk)
			// 		obj.hide();
			// }
			// if (obj.name.indexOf('Key') != -1) {
			// 	if (deleted.picked)
			// 		obj.hide();
			// }
			// if (obj.name.indexOf('Gate') != -1) {
			// 	obj.opening = deleted.opening ? 1 : 0;	// opening restarts if it was interrupted when object was deleted
			// 	obj.opened = deleted.opened;
			// 	if (obj.opened) {
			// 		var left = obj.sheets[1];
			// 		var right = obj.sheets[2];
			// 		obj.rotateSheet(left, {x:-21,y:0,z:0}, {x:0,y:0,z:1}, -Math.PI/32*20);
			// 		obj.rotateSheet(right, {x:21,y:0,z:0}, {x:0,y:0,z:1}, Math.PI/32*20);
			// 	}
			// }
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
		if(jfarm.player)
			jfarm.drawTarget();
		// jfarm.drawHealth();
		// jfarm.drawBubble();

		if (jfarm.hoveredObj)
			jfarm.highlightObject(jfarm.hoveredObj);

		if(jfarm.drawnObj && jfarm.locationCorners){
			jfarm.highlightLocation();
		}
		else {
			// we highlight hovered basesheet
			// TODO : player can't reach tile behind buildings because of "&& !jfarm.hoveredObj" condition
			if(jfarm.hoveredBaseSheet && !jfarm.hoveredObj){
				if(jfarm.conquer)
					jfarm.highlightHoveredBaseSheet("#52A8EC");
				else 
					jfarm.highlightHoveredBaseSheet();
			}
		}
		
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

		if(obj.cornerYard){

			// first, we parse corners yards of current hovered obj
			var yardArr = [];
			obj.cornerYard.split(',').forEach(function(elem, index){ 
				yardArr[index] = parseInt(elem); 
			});
			var yard = {
				yardx: yardArr[0],
				yardy: yardArr[1]
			};
			var basesheet = jfarm.getBaseSheetFromYard(yard);
			if(basesheet){
				// we retrieve corners of hovered object
				jfarm.getLocationCornersuv(obj.name, basesheet);
				if(jfarm.locationCorners){

					// we draw our "location" on the map
					var ctx = sheetengine.context;
					ctx.save();
					ctx.scale(1, 0.5);
					ctx.lineWidth = 2;

					ctx.strokeStyle = strokeStyle || '#000';
					var puvC1 = sheetengine.drawing.getPointuv(jfarm.locationCorners[0])
						,puvC2 = sheetengine.drawing.getPointuv(jfarm.locationCorners[1])
						,puvC3 = sheetengine.drawing.getPointuv(jfarm.locationCorners[2])
						,puvC4 = sheetengine.drawing.getPointuv(jfarm.locationCorners[3]);
					ctx.beginPath();
					ctx.moveTo(puvC1.u, puvC1.v*2);
					ctx.lineTo(puvC2.u, puvC2.v*2);
					ctx.lineTo(puvC3.u, puvC3.v*2);
					ctx.lineTo(puvC4.u, puvC4.v*2);
					ctx.lineTo(puvC1.u, puvC1.v*2);
					ctx.stroke();
					ctx.restore();
				}
			}
		}
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
	highlightHoveredBaseSheet: function(strokeStyle){
		var ctx = sheetengine.context;
		ctx.save();
		ctx.scale(1, 0.5);
		ctx.lineWidth = 2;
  		ctx.strokeStyle = strokeStyle || '#000';
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
	getDrawingLocationBaseSheets: function(basesheet, obj){
		switch(jfarm.drawnObj.name.toLowerCase()){
			case "barn": // barn
				return jfarm.getBarnLocationBaseSheets(basesheet);
			break;
			case "cold storage": // cold storage
				return jfarm.getColdStorageLocationBaseSheets(basesheet); 
			break;
			case "silo": // silo
				return [basesheet];
			break;
			case "corn": // corn
				return [basesheet];
			break;
			case "tomatoes": // tomatoes
				return [basesheet];
			break;
			case "wheat": // wheat
				return [basesheet];
			break;
			default:
				return [];
		}
	},
	getYardsFromBasesheets: function(basesheets){
		var yards = [];
		for (var i = 0; i < basesheets.length; i++) {
			yards.push(sheetengine.scene.getYardFromPos(basesheets[i].centerp));
		};
		return yards;
	},
	getYardsStringFromYards: function(yards){
		var yardsStr = '';
		for (var i=0;i<yards.length;i++) {
		  yardsStr += yards[i].yardx+','+yards[i].yardy;
		  if (i < yards.length-1)
		    yardsStr += ';';
		}
		return yardsStr;
	},
	getBaseSheetFromYard: function(yard){
		for (var i = 0; i < sheetengine.basesheets.length; i++) {
			var bs = sheetengine.basesheets[i];
			if(bs.yardx == yard.yardx 
					&& bs.yardy == yard.yardy){
				return bs
			}
		};
	},
	getBaseSheetsFromYardsString: function(yardstr){
		var basesheets = []
			,coordsArr = yardstr.split(';');
		for (i = 0; i < coordsArr.length; i++) {
			var coord = coordsArr[i].split(',')
				,yard = {
					'yardx': coord[0],
					'yardy': coord[1]
				}
				,bs = jfarm.getBaseSheetFromYard(yard);

			if(bs) basesheets.push(bs);
		}
		return basesheets;
	},
	// Data
	getAnyTemplateByName: function(tplName){
		return jfarm.getCropByName(tplName) || jfarm.getBuildingByName(tplName) || null;
	},
	getWeaponByName: function(weaponName){
		for(var i=0; i < jfarm.weaponTpls.length; i++){
			if(jfarm.weaponTpls[i].name.toLowerCase() == weaponName.toLowerCase())
				return jfarm.weaponTpls[i];
		}
		return null;
	},
	getCropByName: function(cropName){
		for(var i=0; i < jfarm.cropTpls.length; i++){
			if(jfarm.cropTpls[i].name.toLowerCase() == cropName.toLowerCase())
				return jfarm.cropTpls[i];
		}
		return null;
	},
	getBuildingByName: function(buildingName){
		for(var i=0; i < jfarm.buildingTpls.length; i++){
			if(jfarm.buildingTpls[i].name.toLowerCase() == buildingName.toLowerCase())
				return jfarm.buildingTpls[i];
		}
		return null;
	},
	getObjectDetails: function(obj){
		jfarm.requestAjax("/gameobject/getdetails/"+ obj.idDB+ "/" + obj.type , null, function(response){
				if(response.success)
					$("#object-wrapper").trigger("getObjectData", [response.obj]); // ui
			},
			null,
			function(){
				jfarm.getObjectDetailsDone = true;
			});
	},
	getTileDetails: function(yard){
		jfarm.requestAjax("/yard/getdetails/"+ yard.yardx + "/"+ yard.yardy, null, function(response){
				if(response.success)
					$("#tile-wrapper").trigger("getTileData", [response.yard]);
			},
			null,
			function(){
				jfarm.getTileDetailsDone = true;
			});
	},
	getPlayerDetails: function(playerId, callback){
		var id = playerId || jfarm.player.data.id;
		jfarm.requestAjax("/player/"+ id, null, callback);
	},

	// location
	isPossibleToDrawHere: function(basesheet) {
		// obsolete : replaced by sendNewObject
		switch(jfarm.drawnObj.name.toLowerCase()){
			case "barn": // barn
				// return false if any of basesheets.free property is true
				jfarm.currentLocationBaseSheets = jfarm.getBarnLocationBaseSheets(basesheet);
				for (var i = 0; i < jfarm.currentLocationBaseSheets.length; i++) {
					if(jfarm.currentLocationBaseSheets[i].free != undefined && !jfarm.currentLocationBaseSheets[i].free)
						return false;
				};
				return true;
			break;
			case "cold storage": // cold storage
				jfarm.currentLocationBaseSheets = jfarm.getColdStorageLocationBaseSheets(basesheet); 
				for (var i = 0; i < jfarm.currentLocationBaseSheets.length; i++) {
					if(jfarm.currentLocationBaseSheets[i].free != undefined && !jfarm.currentLocationBaseSheets[i].free)
						return false;
				};
				return true;
			break;
			case "silo": // silo
				jfarm.currentLocationBaseSheets = [basesheet];
				return (basesheet.free != undefined) ? basesheet.free : true;
			break;
			case "corn": // corn
				jfarm.currentLocationBaseSheets = [basesheet];
				return (basesheet.free != undefined) ? basesheet.free : true;
			break;
			case "tomatoes": // tomatoes
				jfarm.currentLocationBaseSheets = [basesheet];
				return (basesheet.free != undefined) ? basesheet.free : true;
			break;
			case "wheat": // wheat
				jfarm.currentLocationBaseSheets = [basesheet];
				return (basesheet.free != undefined) ? basesheet.free : true;
			break;
			default:
				jfarm.currentLocationBaseSheets = [];
				return false;
		}
	},
	getDrawingCenterp: function(centerp) { // TODO gérer l'orientation
		switch(jfarm.drawnObj.name.toLowerCase()){
			case "barn": // barn
				return {x: centerp.x+(jfarm.tileWidth*3)/2, y: centerp.y, z:null};
			break;
			case "cold storage": // cold storage
				return {x: centerp.x+jfarm.tileWidth, y: centerp.y - jfarm.tileWidth/2, z:null};
			break;
			default:
				return centerp; // for silo and crops because it's only on one basesheet
		}
	},

	getLocationCornersuv: function(obj, basesheet){
		switch(obj.toLowerCase()){
			case "barn": // barn
				jfarm.locationCorners = jfarm.getBarnLocationCornersuv(basesheet);
			break;
			case "cold storage": // cold storage
				jfarm.locationCorners = jfarm.getColdStorageLocationCornersuv(basesheet);
			break;
			case "silo": // silo
				jfarm.locationCorners = basesheet.corners;
			break;
			case "corn": // corn
				jfarm.locationCorners = basesheet.corners;
			break;
			case "tomatoes": // tomatoes
				jfarm.locationCorners = basesheet.corners;
			break;
			case "wheat": // wheat
				jfarm.locationCorners = basesheet.corners;
			break;
			default:
		}
	},
	getLocationCornersYards: function(obj){
		jfarm.drawingLocationCornersYards = [];
		switch(obj.toLowerCase()){
			case "barn": // barn
				jfarm.drawingLocationCornersYards[0] = jfarm.clickedYard; 
				jfarm.drawingLocationCornersYards[1] = sheetengine.scene.getYardFromPos(jfarm.currentLocationBaseSheets[3].centerp);
			break;
			case "cold storage": // cold storage
				console.log(obj);
				jfarm.drawingLocationCornersYards[0] = jfarm.clickedYard; 
				jfarm.drawingLocationCornersYards[1] = sheetengine.scene.getYardFromPos(jfarm.currentLocationBaseSheets[0].centerp);
				jfarm.drawingLocationCornersYards[2] = sheetengine.scene.getYardFromPos(jfarm.currentLocationBaseSheets[4].centerp);
				jfarm.drawingLocationCornersYards[3] = sheetengine.scene.getYardFromPos(jfarm.currentLocationBaseSheets[5].centerp);
			break;
			case "silo": // silo
				jfarm.drawingLocationCornersYards[0] = jfarm.clickedYard;
			break;
			case "corn": // corn
				jfarm.drawingLocationCornersYards[0] = jfarm.clickedYard;
			break;
			case "tomatoes": // tomatoes
				jfarm.drawingLocationCornersYards[0] = jfarm.clickedYard;
			break;
			case "wheat": // wheat
				jfarm.drawingLocationCornersYards[0] = jfarm.clickedYard;
			break;
			default:
		}
	},
	getColdStorageLocationCornersuv: function(basesheet) { // TODO : Check boundaries
		var corners = basesheet.corners
			, centerp = basesheet.centerp
			, westNorthBaseSheet = jfarm.getBasesheetByCenterp({x: centerp.x, y:centerp.y - jfarm.tileWidth})
			, eastNorthBaseSheet = jfarm.getBasesheetByCenterp({x: centerp.x+jfarm.tileWidth*2, y:centerp.y - jfarm.tileWidth})
			, eastSouthBaseSheet = jfarm.getBasesheetByCenterp({x: centerp.x+jfarm.tileWidth*2, y:centerp.y});
		
		if(westNorthBaseSheet && eastNorthBaseSheet && eastSouthBaseSheet)
			return [corners[3], eastSouthBaseSheet.corners[2], eastNorthBaseSheet.corners[1], westNorthBaseSheet.corners[0]];
		else
			return null;
	},
	getColdStorageLocationBaseSheets: function(basesheet) { // TODO : Check boundaries
		var centerp = basesheet.centerp
			, westNorthBaseSheet = jfarm.getBasesheetByCenterp({x: centerp.x, y:centerp.y - jfarm.tileWidth})
			, centerNorthBaseSheet = jfarm.getBasesheetByCenterp({x: centerp.x+jfarm.tileWidth, y:centerp.y - jfarm.tileWidth})
			, eastNorthBaseSheet = jfarm.getBasesheetByCenterp({x: centerp.x+jfarm.tileWidth*2, y:centerp.y - jfarm.tileWidth})
			, eastSouthBaseSheet = jfarm.getBasesheetByCenterp({x: centerp.x+jfarm.tileWidth*2, y:centerp.y})
			, centerSouthBaseSheet = jfarm.getBasesheetByCenterp({x: centerp.x+jfarm.tileWidth, y:centerp.y});
		
		if(basesheet && westNorthBaseSheet && centerNorthBaseSheet && eastSouthBaseSheet, eastNorthBaseSheet, centerSouthBaseSheet)
			return [westNorthBaseSheet, basesheet, centerNorthBaseSheet, centerSouthBaseSheet, eastNorthBaseSheet, eastSouthBaseSheet];
		else
			return null;
	},
	getBarnLocationBaseSheets: function(basesheet) {
		var centerp = basesheet.centerp
			, secondBaseSheet = jfarm.getBasesheetByCenterp({x: centerp.x+jfarm.tileWidth, y:centerp.y})
			, thirdBaseSheet = jfarm.getBasesheetByCenterp({x: centerp.x+jfarm.tileWidth*2, y:centerp.y})
			, fourthBaseSheet = jfarm.getBasesheetByCenterp({x: centerp.x+jfarm.tileWidth*3, y:centerp.y});

		if(basesheet && secondBaseSheet && thirdBaseSheet && fourthBaseSheet)
			return [basesheet,secondBaseSheet, thirdBaseSheet, fourthBaseSheet];
		else
			return null;
	},
	getBarnLocationCornersuv: function(basesheet) { // TODO : Check boundaries
		var corners = basesheet.corners
			, centerp = basesheet.centerp
			, lastBaseSheet = jfarm.getBasesheetByCenterp({x: centerp.x+jfarm.tileWidth*3, y:centerp.y});
		
		if(lastBaseSheet)
			return [corners[0], lastBaseSheet.corners[1], lastBaseSheet.corners[2], corners[3]];
		else 
			return null;
	}

	// buildings & crops
	,highlightLocation: function(){
		if(jfarm.locationCorners){
			var ctx = sheetengine.context;
			ctx.save();
			ctx.scale(1, 0.5);
			ctx.lineWidth = 2;

			ctx.strokeStyle = '#333';
			var puvC1 = sheetengine.drawing.getPointuv(jfarm.locationCorners[0])
				,puvC2 = sheetengine.drawing.getPointuv(jfarm.locationCorners[1])
				,puvC3 = sheetengine.drawing.getPointuv(jfarm.locationCorners[2])
				,puvC4 = sheetengine.drawing.getPointuv(jfarm.locationCorners[3]);
			ctx.beginPath();
			ctx.moveTo(puvC1.u, puvC1.v*2);
			ctx.lineTo(puvC2.u, puvC2.v*2);
			ctx.lineTo(puvC3.u, puvC3.v*2);
			ctx.lineTo(puvC4.u, puvC4.v*2);
			ctx.lineTo(puvC1.u, puvC1.v*2);
			ctx.stroke();
			ctx.restore();
		}
	},
	conquerTerritory: function(basesheets){
		var yards = jfarm.getYardsFromBasesheets(basesheets)
			,yardStr = jfarm.getYardsStringFromYards(yards)
			,data = {
				yards: yardStr
			};

		jfarm.requestAjax("/player/conquer", data, function(response){
				if(response.success){
					var basesheets = jfarm.getBaseSheetsFromYardsString(response.yards);
					for (var i = 0; i < basesheets.length; i++) {
						basesheets[i].playerId = jfarm.player.data.id;
						basesheets[i].free = false;
						basesheets[i].neutral = false;
						basesheets[i].color = "#52A8EC";
					};
					jfarm.conquerDone = true;
				} else {
					alert(response.message);
				}
			});
	},
	createSelectedObj: function(basesheet){

		var rot = jfarm.appobjectsRots[jfarm.drawnObj.name.toLowerCase()] // we retrieve object rot
			,objCenterpStatic= jfarm.appobjectsCenterp[jfarm.drawnObj.name.toLowerCase()] // and static centerp
			,objc = jfarm.getDrawingCenterp(basesheet.centerp, jfarm.drawnObj.name)
			,yard = sheetengine.scene.getYardFromPos(objc);
		
		if(objc.z == undefined)
			objc.z = 0;

		jfarm.currentLocationBaseSheets = jfarm.getDrawingLocationBaseSheets(basesheet, jfarm.drawnObj.name);
		if(jfarm.currentLocationBaseSheets.length > 0){
			jfarm.currentLocationYards = jfarm.getYardsFromBasesheets(jfarm.currentLocationBaseSheets);

			// we run this function to set corners yards of current drawing to jfarm.drawingLocationCornersYards
			jfarm.getLocationCornersYards(jfarm.drawnObj.name);

			var obj = {
				name: jfarm.drawnObj.name
				,type: jfarm.drawnObj.type
				,centerp: objCenterpStatic
				,rot: { 
					alphaD: rot.alphaD
					,betaD: rot.betaD
					,gammaD: rot.gammaD
				}
				,centerpToReturn: objc // this centerp is resend by server to "drawSelectedObj" function
			};
			jfarm.sendNewObject(obj,yard,jfarm.currentLocationYards);
		} else {
			console.log("Error createSelectedObj function : jfarm.currentLocationBaseSheets array is empty");
		}
	},
	sendNewObject: function(obj, yard, yards){
		var yardsStr = jfarm.getYardsStringFromYards(yards)
		       ,cornerYardStr = jfarm.clickedYard.yardx + "," + jfarm.clickedYard.yardy;

		var data = {
		       x: yard.yardx,
		       y: yard.yardy,
		       objectName: obj.name,
		       object: obj,
		       yards: yardsStr,
		       objectType: obj.type,
		       cornerYard: cornerYardStr// we send our clicked yard for reference
		};
		jfarm.requestAjax("/gameobject/create",data,jfarm.drawSelectedObj);
    },
	drawSelectedObj: function(ajaxResponse){
		if(ajaxResponse.success){

			ajaxResponse.centerp.x = parseInt(ajaxResponse.centerp.x);
			ajaxResponse.centerp.y = parseInt(ajaxResponse.centerp.y);
			ajaxResponse.centerp.z = parseInt(ajaxResponse.centerp.z);

			var createdObj = null
				,objc = ajaxResponse.centerp; // we retrieve building centerp in server response

			console.log(jfarm.drawnObj.name);
			switch(jfarm.drawnObj.name.toLowerCase()){
				case "barn": // barn
					createdObj = jfarm.defineBarn(objc);
	  				jfarm.currentLocationBaseSheets.forEach(function(elem){ elem.free = false; });
				break;
				case "cold storage": // cold storage
					createdObj = jfarm.defineColdStorage(objc);
					jfarm.currentLocationBaseSheets.forEach(function(elem){ elem.free = false; });
				break;
				case "silo": // silo
					createdObj = jfarm.defineSilo(objc);
					jfarm.currentLocationBaseSheets[0].free = false;
				break;
				case "corn": // corn
					createdObj = jfarm.defineCrops(objc, "Corn", "#fef094", true, "#319704");
					jfarm.currentLocationBaseSheets[0].free = false;
				break;
				case "tomatoes": // tomatoes
					createdObj = jfarm.defineTomatoesPlants(objc);
					jfarm.currentLocationBaseSheets[0].free = false;
				break;
				case "wheat": // wheat
					createdObj = jfarm.defineCrops(objc, "Wheat", "#fef094");
					jfarm.currentLocationBaseSheets[0].free = false;
				break;
				default:
			}
			jfarm.drawnObj = null;
			// in case of default switch
			if(createdObj){ 
				// ui update 
				$('.game').trigger('onUIUpdatePlayer', [ajaxResponse.player]);
				// we assign immediately cornerYard to new added object
				createdObj.type = ajaxResponse.type;
				createdObj.idDB = ajaxResponse.id; 
				createdObj.cornerYard = ajaxResponse.cornerYard; 
				if(createdObj.type.toLowerCase() == "building")
					jfarm.densityMap.addSheets(createdObj.sheets);
				jfarm.validateCreationObj = true;
			} 
		} else {
			alert(ajaxResponse.message);
		}
	},
	defineColdStorage: function(centerp) {
		//TODO calculate relative centerp for each sheet
		var csLength = jfarm.tileWidth*3
			, csHeight = 80
			, csWidth = jfarm.tileWidth*2;

	  	var roofSheet = new sheetengine.Sheet({x:0,y:0,z:csHeight}, jfarm.rotTop, {w:csLength,h:csWidth});
			roofSheet.context.fillStyle = '#FFF'; // Top
			roofSheet.context.fillRect(0,0,csLength,csWidth);

	  	var northSheet = new sheetengine.Sheet({x:0,y:-csHeight,z:csHeight/2}, jfarm.rotSouthNorth, {w:csLength,h:csHeight});
			northSheet.context.fillStyle = '#FFF'; // South
			northSheet.context.fillRect(0,0,csLength,jfarm.tileWidth);

	  	var southSheet = new sheetengine.Sheet({x:0,y:csHeight,z:csHeight/2}, jfarm.rotSouthNorth, {w:csLength,h:csHeight});
			southSheet.context.fillStyle = '#FFF'; // South
			southSheet.context.fillRect(0,0,csLength,jfarm.tileWidth);

	  	var westSheet = new sheetengine.Sheet({x:-csLength/2,y:0,z:csHeight/2}, jfarm.rotWestEast, {w:csWidth,h:csHeight});
	  	westSheet.context.fillStyle = '#FFF'; // East
	  	westSheet.context.fillRect(0,0,csWidth,csHeight);

	  	var eastSheet = new sheetengine.Sheet({x:csLength/2,y:0,z:csHeight/2}, jfarm.rotWestEast, {w:csWidth,h:csHeight});
	  	eastSheet.context.fillStyle = '#FFF'; // East
	  	eastSheet.context.fillRect(0,0,csWidth,csHeight);

	  	var cs = new sheetengine.SheetObject(
	  					centerp
	  					, jfarm.rotSouthNorth
	  					, [roofSheet, northSheet, southSheet, westSheet, eastSheet]
	  					, {w:330,h:250,relu:160,relv:160}); // TODO : Dynamic values
	  	cs.name = "Cold Storage";

	  	// Cold Storage doors
	  	var ctx = southSheet.context;
	  	ctx.fillStyle = '#424242';
	  	ctx.fillRect(jfarm.tileWidth*2/3,csHeight/3,jfarm.tileWidth*2/3, csHeight*2/3); 
	  	ctx.fillRect(jfarm.tileWidth*2,csHeight/2,30, csHeight/2); 

	  	// poignées
	  	ctx.fillStyle = '#000';
	  	ctx.fillRect(jfarm.tileWidth,csHeight-10,3, 4);
	  	ctx.fillRect(jfarm.tileWidth*2+20,60,3, 4);
	  	cs.centerpdb = {x:0,y:0,z:0};
	  	return cs;
	},

	defineBarn:function(centerp){
		var bLength = jfarm.tileWidth*4
			, bHeight = 80
			, bWidth = jfarm.tileWidth;

		var roofSouthSheet = new sheetengine.Sheet({x:0,y:bHeight/2 -12,z:bHeight + 14}, {alphaD:-45,betaD:0,gammaD:0}, {w:bLength +10,h:bHeight});
		roofSouthSheet.context.fillStyle = '#9ba5a4'; // South
		roofSouthSheet.context.fillRect(0,0,bLength +10,bHeight-15);

		var roofNorthSheet = new sheetengine.Sheet({x:0,y:-bHeight/2 +12,z:bHeight + 14}, {alphaD:45,betaD:0,gammaD:0}, {w:bLength +10,h:bHeight});
		roofNorthSheet.context.fillStyle = '#9ba5a4'; // South
		roofNorthSheet.context.fillRect(0,0,bLength +10,bHeight-15);

		var southSheet = new sheetengine.Sheet({x:0,y:bWidth/2,z:bHeight/2}, jfarm.rotSouthNorth, {w:bLength,h:bHeight});
		southSheet.context.fillStyle = '#aa3114'; // South //aa3114
		southSheet.context.fillRect(0,0,bLength,jfarm.tileWidth);

		var northSheet = new sheetengine.Sheet({x:0,y:-bWidth/2,z:bHeight/2}, jfarm.rotSouthNorth, {w:bLength,h:bHeight});
		northSheet.context.fillStyle = '#aa3114'; // South //aa3114
		northSheet.context.fillRect(0,0,bLength,jfarm.tileWidth);

		var eastSheetH = bHeight + 40;
		var eastSheet = new sheetengine.Sheet({x:bLength/2,y:0,z:(bHeight+40)/2}, jfarm.rotWestEast, {w:bWidth,h:eastSheetH});

		var westSheet = new sheetengine.Sheet({x:-bLength/2,y:0,z:(bHeight+40)/2}, jfarm.rotWestEast, {w:bWidth,h:eastSheetH});

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
		var yard = sheetengine.scene.getYardFromPos(centerp);
		barn.centerpdb = {x:0,y:0,z:0};
		barn.type
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
		silo.name = "Silo";
		silo.centerpdb = {x:0,y:0,z:0};

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
		tomatoes.name = "Tomatoes";
		tomatoes.centerpdb = {x:0,y:0,z:0};
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
		crop.centerpdb = {x:0,y:0,z:0};

		return crop;
	},
	// event handlers
	click: function(event) {
		// if (jfarm.player.killed)
		// 	return;
		
		if (!jfarm.hoveredObj) {
			// set target location
			var puv = {
				u:event.clientX - sheetengine.canvas.offsetLeft + pageXOffset, 
				v:event.clientY - sheetengine.canvas.offsetTop + pageYOffset
			};
			// var pxy = sheetengine.transforms.inverseTransformPoint({u:puv.u + sheetengine.scene.center.u, v:puv.v + sheetengine.scene.center.v});
			// pxy.x = (pxy.x - sheetengine.scene.center.x) / jfarm.zoom + sheetengine.scene.center.x;
			// pxy.y = (pxy.y - sheetengine.scene.center.y) / jfarm.zoom + sheetengine.scene.center.y;

			// get clicked basesheet/tile
			jfarm.clickedBaseSheet = jfarm.getBaseSheetByPuv(puv);
			if(jfarm.clickedBaseSheet){
				jfarm.clickedYard =  sheetengine.scene.getYardFromPos(jfarm.clickedBaseSheet.centerp);
				console.log(jfarm.clickedYard.yardx + "," + jfarm.clickedYard.yardy);
				// console.log(yard);
				// console.log(jfarm.clickedBaseSheet);
				
				// different gaming mode
				jfarm.player.targetObj = null;

				// Drawing
				if(jfarm.clickedBaseSheet && jfarm.drawnObj && !jfarm.conquer)
					jfarm.validatePosObj = true;

				// conquering
				if(jfarm.conquer){
					jfarm.conquerTerritory([jfarm.clickedBaseSheet]);
				}
				// moving
				if(jfarm.movingPlayer && !jfarm.drawnObj){
					// get tile details from server
					// jfarm.getTileDetails(jfarm.clickedYard); // already in timer()
					jfarm.setTarget(jfarm.player, jfarm.hoveredBaseSheet.centerp);
				}
			}
			
		} else {
			jfarm.hoveredObjisClicked = true;
			// get object details from server
			// if(jfarm.selectingObject){
				// already done in mousemove
				// jfarm.getObjectDetails(jfarm.hoveredObj);
			// }

			// set target object
			// jfarm.player.targetObj = jfarm.hoveredObj;
			// if (jfarm.characterAtTargetObj(jfarm.player))
			// 	jfarm.characterArrived(jfarm.player);
			// else
			// 	jfarm.setTarget(jfarm.player, jfarm.player.targetObj.centerp);
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
		
		// get hovered tile 
		jfarm.hoveredBaseSheet = jfarm.getBaseSheetByPuv(puv); 
		if(jfarm.hoveredBaseSheet)
			jfarm.hoveredYard = sheetengine.scene.getYardFromPos(jfarm.hoveredBaseSheet.centerp);

		// get hovered object
		if(!jfarm.drawnObj)
			jfarm.hoveredObj = jfarm.getHoveredObject(puv);

		if (jfarm.hoveredObj){
			$(sheetengine.canvas).css('cursor','pointer');
		} else {
			$(sheetengine.canvas).css('cursor','crosshair');
		}
	},
	keyup: function(event){
		var keyCode = event.keyCode;
		switch(keyCode){
			case 27:
				if(jfarm.drawnObj){
					// remove active class of current drawing
					$('#creator').trigger("cancelDrawing");
					jfarm.drawnObj = null;
					jfarm.redraw();
				}
			break;
			default:
		}
	},
	// utils
	requestAjax: function (url, data, callback, callbackFail, callbackAlways) {
		$.ajax({
			url: url,
			data: data,
			cache: false,
			dataType: "json"
			})
		.done(callback)
		.fail(callbackFail || function(){ console.log("ajax request failed")})
		.always(callbackAlways || null);
	},
	capitaliseFirstLetter: function(string)
	{
	    return string.charAt(0).toUpperCase() + string.slice(1);
	},
	// main timer
	timer: function() {
		var startTime = new Date().getTime()
			,sceneChanged = 0;
		
		// hovered basesheets
		if(jfarm.preHoveredBaseSheet != jfarm.hoveredBaseSheet && !jfarm.drawnObj){
			jfarm.tileDelayTime = new Date().getTime();
			jfarm.getTileDetailsDone = false;
			jfarm.preHoveredBaseSheet = jfarm.hoveredBaseSheet;
		  	sceneChanged = 1;
		}
		// get hovered baseheet details
		if(jfarm.preHoveredBaseSheet == jfarm.hoveredBaseSheet && !jfarm.hoveredObj){
			// we get tile details if we stay on it more than 1 sec
			var cond  = jfarm.tileDelayTime + 1000 < new Date().getTime() && !jfarm.getTileDetailsDone;
			if(cond && jfarm.hoveredBaseSheet){
				$("#tile-wrapper").trigger("onGettingTileDetails");
				jfarm.getTileDetails(sheetengine.scene.getYardFromPos(jfarm.hoveredBaseSheet.centerp));
			}
		}

		// hovered objects
		if (jfarm.prevHoveredObj != jfarm.hoveredObj) {
			jfarm.objectDelayTime = new Date().getTime();
			jfarm.getObjectDetailsDone = false;
			jfarm.prevHoveredObj = jfarm.hoveredObj;
			sceneChanged = 1;
		}
		if(jfarm.prevHoveredObj == jfarm.hoveredObj){
			// we get object details if we stay on it more than 1 sec
			var cond  = jfarm.objectDelayTime + 1000 < new Date().getTime() && !jfarm.getObjectDetailsDone;
			if(cond && jfarm.hoveredObj){
				$("#object-wrapper").trigger("onGettingObjectDetails");
				jfarm.getObjectDetails(jfarm.hoveredObj);
				if(jfarm.hoveredObj.type == "crop")
					jfarm.getTileDetails(jfarm.hoveredYard);
			}
		}
		if(jfarm.hoveredObjisClicked){
			// console.log(jfarm.hoveredObj);
			if(jfarm.hoveredObj.type == "crop"){
				console.log("Afficher un modal crop");
			} else {
				console.log("Afficher un modal building");
			}
			jfarm.hoveredObjisClicked = false;
		}

		// player actions
		if(jfarm.player){
			if (jfarm.player.target) {
				jfarm.moveCharacter(jfarm.player);
				jfarm.loadYards();
				sceneChanged = 1;
			}

			// player weapon has changed
			if(jfarm.player.arm.name != jfarm.playerWeaponData.name){
				jfarm.setPlayerWeapon();
				sceneChanged = 1;
				// sheetengine.calc.calculateChangedSheets();
			}
			if(jfarm.conquerDone){
				jfarm.redraw(true);
			}
		}
		

		// Draw object location on the map
		if(jfarm.drawnObj && jfarm.hoveredBaseSheet && jfarm.preHoveredBaseSheet != jfarm.hoveredBaseSheet){
			jfarm.preHoveredBaseSheet = jfarm.hoveredBaseSheet;
			jfarm.getLocationCornersuv(jfarm.drawnObj.name, jfarm.hoveredBaseSheet);
			sceneChanged = 1;
		}

		// draw object on the map
		if(jfarm.validatePosObj && jfarm.clickedBaseSheet){
			jfarm.validatePosObj = false;
			jfarm.createSelectedObj(jfarm.clickedBaseSheet);
			// sceneChanged = 1;
		}

		if(jfarm.validateCreationObj){
			jfarm.validateCreationObj = true;
			sceneChanged = 1;	
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