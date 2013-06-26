//var socket = io.connect();

var serverRoot = location.href;
var socket = io.connect(serverRoot);

var jfarmio = {
	listener: function() {
		socket.on('data', jfarmio.recvData);
		socket.on('login', jfarmio.recvLogin);
		socket.on('logout', jfarmio.recvLogout);
		socket.on('newobj', jfarmio.newObj);
		socket.on('harvest', jfarmio.recvHarvest);
	},

	newObj: function(data) {
		var centerp = jfarm.correctPointAfterReceive(data.objCenterp);
		var newObj;
		switch (data.objName.toLowerCase()) {
			case "barn": // barn
				newObj = jfarm.defineBarn(centerp);
				break;
			case "cold storage": // cold storage
				newObj = jfarm.defineColdStorage(centerp);
				break;
			case "silo": // silo
				newObj = jfarm.defineSilo(centerp);
				break;
			case "corn": // corn
				newObj = jfarm.defineCrops(centerp, "Corn", "#fef094", true, "#319704");
				break;
			case "tomatoes": // tomatoes
				newObj = jfarm.defineTomatoesPlants(centerp);
				break;
			case "wheat": // wheat
				newObj = jfarm.defineCrops(centerp, "Wheat", "#fef094");
				break;
			default:
		}
		newObj.idDB = data.idDB;
		newObj.type = data.type
		sheetengine.calc.calculateChangedSheets();
		jfarm.redraw();
	},

	recvData: function(data) {
		jfarm.recvData(data);
	},

	recvLogin: function(data) {
		jfarm.newEnemy(data);
	},
	recvLogout: function(data) {
		console.log(data);
		jfarm.recvLogout(data.playerId);
	},

	recvHarvest: function(data){
		console.log("harvest");
		var cropToDestroy = jfarm.getCropObjByIdDB(data.cropId);
		if(cropToDestroy){
			cropToDestroy.destroy();
			jfarm.redraw();
		}
	},

	sendLogout: function(id) {
		socket.request('/io/action', {
			data: {
				action: 'logout',
				playerId: id
			}
		}, function(response) {

		});
	},
	sendData: function(player, action) {
		socket.request('/io/action', {
			data: {
				action: action,
				player: player.data,
				centerp: jfarm.correctPointBeforeSend(player.centerp),
				armName: player.arm.name,
				rot: player.rot,
				animationState: player.animationState
			}
		}, function(response) {
			var players = response.playingUsers
			for (var index in players) {

				var data = players[index]

				if (data.player.id != jfarm.player.data.id) {
					console.log(data);
					jfarm.newEnemy(data);
				}
			}
		});
	},

	sendObj: function(player, action, objName, objCenterp, idDB, objType) {
		socket.request('/io/action', {
			data: {
				action: action,
				player: player.data,
				objName: objName,
				objCenterp: objCenterp,
				idDB: idDB,
				type: objType
			}
		}, function(response) {
			console.log("send new object");
		});
	},

	sendHarvest: function(cropId, action) {
		socket.request('/io/action', {
			data: {
				action: action,
				cropId: cropId
			}
		}, function(response) {
			console.log("crop harvested");
		});
	}


}