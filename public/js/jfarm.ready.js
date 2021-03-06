$(function() {

	/***********************************
	 *****    JFARM RELATED CODE    *****
	 ***********************************/

	// WINDOW
	$(document).on('keyup', function(event) {
		jfarm.keyup(event);
	});

	// UI CHANGES
	// templates && game properties initialization
	$('.game').on("initTemplatesUI", function(e, templates) {
		console.log(templates);
	});

	$('.game').on('onUIUpdatePlayer', function(e, player) {
		if (player) {
			if (player.allianceId != null && player.allianceId != 0) {
				$.ajax({
					url: "/alliance/" + player.allianceId,
					dataType: 'json'
				}).done(function(response) {
					if (player.allianceId != null && player.allianceId != 0) {
						$('#player-alliance').text(response.name);
					};
					if (player.id != response.ownerId) {
						$("#player-alliance").append(' ' + '<a href="/player/leaveAlliance" id="leaveAlliance">Leave</a>');
					};
				});
			} else {
				$('#player-alliance').text("no alliance");
			}
			$('#player-data-level').text(player.level);
			// $.ajax({
			// 	url: "/player/level",
			// 	dataType: 'json'
			// }).done(function(response) {
			// 	$('#player-data-level').text(player.level);
			// });
			$('#player-money').text(player.money + " ch.");
			if (player.allianceId != null && player.allianceId != 0) {
				$.ajax({
					url: "/alliance/" + player.allianceId,
					dataType: 'json'
				}).done(function(response) {
					if (player.allianceId != null && player.allianceId != 0) {
						$('#player-alliance').text(response.name);
					};
					if (player.id != response.ownerId) {
						$("#player-alliance").append(' ' + '<a href="/player/leaveAlliance" id="leaveAlliance">Leave</a>');
					};
				});
			} else {
				$('#player-alliance').text("no alliance");
			}
		} else {
			console.log("No player");
		}
	});

	// DISPLAY BUILDING POPUP DETAILS
	$('.game').on('onBuildingClick', function(e, buildingObj) {
		if (buildingObj) {
			jfarm.getObjectDetails(buildingObj, function(response) {
				if (response.success) {
					// we check if this building belongs to logged player
					if (response.obj.owner.id == jfarm.player.data.id) {
						jfarm.requestAjax("/building/getstoragedetails/" + response.obj.id, null, function(response) {
							$("#modal-b").show();
							$('#building-name span').text(response.template.name);
							$('#building-maxCapacity span').text(response.template.storageCapacity);
							$("#building-currentCapacity span").text(response.building.currentStorageCapacity);
							$("#elements-harvesting, #elements-stored").html("");

							// stored items templating
							$("#elements-stored").append($('<div/>').addClass("txt-blue").html("Stored items :"));
							$('<ul/>').appendTo($("#elements-stored"));
							var sList = $("#elements-stored ul");
							for (var i = 0; i < response.storedItems.length; i++) {
								var li = $('<li/>')
									.addClass('clear-fix')
									.appendTo(sList);
								var divText = $('<div/>')
									.addClass('pull-left')
									.html(response.storedItems[i].quantity + ' ' + response.storedItems[i].name)
									.appendTo(li);
								var divAction = $('<div/>')
									.addClass('action-element action-sell')
									.appendTo(li);
							};

							// harvestings templating
							$("#elements-harvesting").append($('<div/>').addClass("txt-blue").html("Harvestings :"));
							$('<ul/>').appendTo($("#elements-harvesting"));
							var hList = $("#elements-harvesting ul");
							for (var i = 0; i < response.harvestings.length; i++) {
								var li = $('<li/>')
									.addClass('clear-fix')
									.appendTo(hList);
								var divText = $('<div/>')
									.addClass('pull-left')
									.html(response.harvestings[i].quantity + ' ' + response.harvestings[i].name)
									.appendTo(li);
								var divAction = $('<div/>')
									.addClass('action-element action-harvest')
									.attr('data-harvestingid',response.harvestings[i].id)
									.attr('data-buildingid',response.building.id)
									.attr('data-buildingtemplateid',response.building.buildingTemplateId)
									.appendTo(li);
							};

						});
					} else {
						console.log("Hey dude, this building doesn't belong to you");
					}
				} else {
					$("#content-actions-notif").trigger('launch', [response.message]);
				}
			});
		} else {
			console.log("onBuildingClick : no buildingObj passed");
		}
	});

	$('.game').on('onCharacterArrivedAtCrop', function(e, cropObj) {
		jfarm.getObjectDetails(cropObj, function(response) {
			if (response.success) {
				if (response.obj.ownerId == jfarm.player.data.id) {
					$('#modal-c').show();
				} else {
					console.log("Hey dude, this building doesn't belong to you");
				}
			} else {
				$("#content-actions-notif").trigger('launch', [response.message]);
			}
		});
	});

	$(document).on('click', '#modal-b .action-harvest', function(e) {
		var $this = $(this),
			harvestingId = $this.data('harvestingid'),
			buildingId = $this.data('buildingid'),
			buildingTemplateId = $this.data('buildingtemplateid'),
			harvestingToDel = $(this).parent();

		if (harvestingId && buildingId && buildingTemplateId) {
			$.ajax({
				url: "/building/storeharvesting/" + harvestingId + "/" + buildingId + "/" + buildingTemplateId,
				dataType: 'json'
			}).done(function(response) {
				if (response.success) {
					var harvestingQuantity = response.item.quantity,
						currentCapacity = response.building.currentStorageCapacity,
						maxCapacity = response.template.storageCapacity;
					$("#building-currentCapacity span").text(response.building.currentStorageCapacity);
					$("#elements-stored").html("");
					harvestingToDel.remove();
					for (var i = 0; i < response.storedItems.length; i++) {
						$("#elements-stored").append('<li class="clear-fix"><div class="pull-left">' + response.storedItems[i].quantity + ' ' + response.storedItems[i].name + '</div><div class="action-element action-sell"></div></li>');
					};
				} else {
					$("#content-actions-notif").trigger('launch', [response.message]);
				}

			});
		} else {
			console.log(response);
		}
	});

	$('.game').on('onUIUpdateTile', function(e, tile) {
		$('#tile-free').text( !! tile.free ? "yes" : "no");
		$('#tile-state').text(tile.neutral ? "neutral" : "owned");
		$('#tile-owner').text(tile.player ? tile.player.name : "");
		$('#tile-humidity').text(tile.humidity + " %"); // TODO
		$('#tile-fertility').text(tile.fertility + " %");
		$('#tile-health').text((parseInt(tile.fertility, 10) + parseInt(tile.humidity, 10)) / 2 + " %");
	});

	$(".resultShow").hide();
	$("#top-actions-notif").hide();
	$("#content-actions-notif").hide();
	$(".overlay").hide();

	// BUILDINGS
	$(".showBuildings").on('click', function() {
		$("#top-actions").hide();
		$("#right-actions").toggle();
	});

	// RIGHT CREATE ACTIONS
	$("#right-actions").hide();
	$("#right-actions button:first").addClass("active");
	$("#creator div:not(:first)").hide();
	$("#right-actions button").on('click', function() {
		var tabActions = $(this),
			index = tabActions.index(),
			content = $("#creator div").eq(index),
			contents = content.siblings();

		tabActions.addClass("active")
			.siblings().removeClass('active');
		content.show();
		contents.hide();
	});

	// CROPS AND BUILDINGS
	$('#creator').on("cancelDrawing", function() {
		$('.crop, .building').parent().removeClass('active');
	});

	$('.crop, .building').on('click', function() {
		// to be sure moving player button is pushed
		$(".game-actions button:first").trigger('click');
		var $this = $(this),
			value = $this.data('value'),
			type = $this.data('type'),
			$li = $this.parent();

		// we get template of selected item
		jfarm.drawnObj = jfarm.getAnyTemplateByName(value);
		jfarm.drawnObj.type = type;

		jfarm.getPlayerDetails(null, function(player) {
			// we check if player has enough money for crop/building
			if (player.money >= jfarm.drawnObj.price) {

				if (jfarm.dimmedObj) {
					jfarm.dimmedObj.destroy(true);
					jfarm.redraw();
				}
				// to draw object at mouse position
				var objc = {
					x: 0,
					y: 0,
					z: 0
				};
				switch (jfarm.drawnObj.name.toLowerCase()) {
					case "barn": // barn
						jfarm.dimmedObj = jfarm.defineBarn(objc);
						break;
					case "cold storage": // cold storage
						jfarm.dimmedObj = jfarm.defineColdStorage(objc);
						break;
					case "silo": // silo
						jfarm.dimmedObj = jfarm.defineSilo(objc);
						break;
					case "corn": // corn
						jfarm.dimmedObj = jfarm.defineCrops(objc, "Corn", "#fef094", true, "#319704");
						break;
					case "tomatoes": // tomatoes
						jfarm.dimmedObj = jfarm.defineTomatoesPlants(objc);
						break;
					case "wheat": // wheat
						jfarm.dimmedObj = jfarm.defineCrops(objc, "Wheat", "#fef094");
						break;
					default:
				}
				jfarm.dimmedObj.hide();

				// ui
				$('.crop, .building').each(function(index, elem) {
					var $elem = $(elem);
					if ($elem.data('value').toLowerCase() === jfarm.drawnObj.name.toLowerCase())
						$elem.parent().addClass('active');
					else
						$elem.parent().removeClass('active');
				});
			} else {
				jfarm.drawnObj = null;
				alert('Not enough money to purchase this item');
			}
		});
	});

	// WEAPONS & ACCESSORIES
	$('.weapon, .accessory').on('click', function() {
		var $this = $(this),
			name = $this.data('name');

		$('.weapon, .accessory').parent().removeClass('active');
		$this.parent().addClass('active');
		if (jfarm.getWeaponByName(name) && name != jfarm.playerWeaponData.name)
			jfarm.playerWeaponData = jfarm.getWeaponByName(name);
	});

	$(".game-actions button").click(function() {
		// in case of, we cancel drawing obj mode;
		$('.crop, .building').parent().removeClass('active');
		jfarm.drawnObj = null;

		var $this = $(this),
			action = $this.data("action"),
			siblings = $this.siblings();

		// ui process
		siblings.removeClass("active");
		$this.addClass("active");

		// jfarm process
		siblings.each(function(index, elem) {
			jfarm[$(elem).data("action")] = false;
		});
		jfarm[action] = true;
	});

	// TILES 
	$("#tile-wrapper").on("onGettingTileDetails", function(e) {
		$(this).find('.tile-property-value').html("loading...");
	});

	// OBJECTS 
	$('#object-wrapper').on('onGettingObjectDetails', function(e) {
		$(this).find('.object-property-value').html("loading...");
		$('.tile-property-value').text("...");
	});
	$("#object-wrapper").on("getObjectData", function(e, obj) {
		$(this).find('.title-b').text(jfarm.capitaliseFirstLetter(obj.objectType));
		$('#object-type').text(obj.content.name);
		$('#object-owner').text(obj.owner.name);
		// $('#object-alliance').text(obj.content.name); // TODO
	});

	// HARVEST
	$('.action-harvest').on('click', function() {
		jfarm.getObjectDetails(jfarm.currentCrop, function(response) {
			jfarm.harvest(response.obj);
		});
	});
	// WATER 
	$('.action-water').on('click', function() {
		jfarm.waterTile(jfarm.clickedYard);
	});
	// FERTILIZE
	$('.action-fertilize').on('click', function() {
		// we check if player has enough money for fertilizer
		jfarm.getPlayerDetails(null, function(player) {
			if (player.money >= 20) {
				jfarm.fertilize(jfarm.clickedYard);
			}
		});
	});

	// SEARCH ALLIANCE
	$("#searchA").on('keyup', function(e) {
		$(".results").show();
		if (e.keyCode == 16) // shift 
			return;
		$(".resultsA").html("");
		var kw = $("#searchA").val();
		if (kw != '') {
			$.ajax({
				url: "/alliance/search",
				dataType: 'json',
				data: "kw=" + kw
			}).done(function(response) {
				$.each(response.alliances, function(i) {
					var allianceName = response.alliances[i].name,
						allianceId = response.alliances[i].id;
					$(".resultsA").append('<li class="showA clear-fix">' + '<input class="allianceId" type="hidden" value="' + allianceId + '">' + allianceName + '</li>');
				});
			});
		} else {
			$(".resultsA").html("");
		}
		return false;
	});

	// SHOW ALLIANCE
	$(document).on('click', "li.showA", function(e) {
		$(".resultsA").hide();
		$(".resultShow").show();
		e.stopPropagation();
		$(".resultShowA").html("");
		var kw = $(".allianceId", this).val();
		if (kw != '') {
			$.ajax({
				url: "/alliance/show",
				dataType: 'json',
				data: "kw=" + kw
			}).done(function(response) {
				var allianceName = response.alliance.name,
					allianceId = response.alliance.id;
				$(".resultShowA").append("<li>id : " + allianceId + "</li>" + "<li>Name : " + allianceName + "</li>" + '<li class="txt-green">Membres : ');
				$.each(response.players, function(i) {
					var playerName = response.players[i].name;
					$(".resultShowA").append("<li>" + playerName + "</li>");
				})
			});
		}
	});

	// SEARCH PLAYER
	$("#searchP").on('keyup', function(e) {
		$(".results").show();
		if (e.keyCode == 16)
			return;
		$(".resultsP").html("");
		var kw = $("#searchP").val();
		if (kw != '') {
			$.ajax({
				url: "/player/search",
				dataType: 'json',
				data: "kw=" + kw
			}).done(function(response) {
				$.each(response.players, function(i) {
					var playerName = response.players[i].name,
						playerId = response.players[i].id;
					$(".resultsP").append('<li class="showP clear-fix">' + '<input class="playerId" type="hidden" value="' + playerId + '">' + playerName + '</li>');
				});
			});
		} else {
			$(".resultsP").html("");
		}
		return false;
	});

	// SHOW PLAYER
	$(document).on('click', "li.showP", function(e) {
		$(".resultsP").hide();
		$(".resultShow").show();
		e.stopPropagation();
		$(".resultShowP").html("");
		var kw = $(".playerId", this).val();
		if (kw != '') {
			$.ajax({
				url: "/player/show",
				dataType: 'json',
				data: "kw=" + kw
			}).done(function(response) {
				var playerName = response.player.name,
					playerId = response.player.id,
					allianceId = response.player.allianceId,
					currentPlayerId = response.currentPlayer.id,
					form, alliance;
				console.log(allianceId);
				if (allianceId != null && allianceId != 0) {
					var allianceOwnerId = response.alliance.ownerId,
						alliance = response.alliance.name;
					if (currentPlayerId == allianceOwnerId) {
						form = '<li><form action="/alliance/removePlayer" method="post" id="formRemPlayer">' + '<input type="hidden" name="playerId" value="' + playerId + '">' + '<button type="submit" class="btn-flat btn-flat-red">Remove</button></form></li>';
					} else {
						form = "";
					}
					if (playerId == allianceOwnerId) {
						form = "";
					}
					$(".resultShowP").append("<li>id : " + playerId + "</li>" + "<li>Name : " + playerName + "</li>" + "<li>Alliance : " + alliance + "</li>" + form);
				} else {
					alliance = "Pas d'alliance";
					form = '<li><form action="/alliance/addPlayer" method="post" id="formAddPlayer">' + '<input type="hidden" name="playerId" value="' + playerId + '">' + '<button type="submit" class="btn-flat btn-flat-grey-light">Add</button></form></li>';
					$(".resultShowP").append("<li>id : " + playerId + "</li>" + "<li>Name : " + playerName + "</li>" + "<li>Alliance : " + alliance + "</li>" + form);
				}
			});
		}
	});


	// NOTIFICATIONS
	$("#top-actions-notif").on('launch', function(e, msg) {
		var $this = $(this);
		$this.fadeIn().html("<li>" + msg + "</li>");
		setTimeout(function() {
			$("#top-actions-notif").fadeOut().html("");
		}, 2000);
	});

	$("#content-actions-notif").on('launch', function(e, msg) {
		var $this = $(this);
		$this.fadeIn().html("<li>" + msg + "</li>");
		setTimeout(function() {
			$("#content-actions-notif").fadeOut().html("");
		}, 2000);
	});

	// AJAX CREATE ALLIANCE
	$("#formCreateAlliance").on('submit', function() {
		var $form = $(this);
		jfarm.requestAjax($form.attr('action'), $form.serialize(), function(response) {
			$("#top-actions-notif").trigger('launch', [response.message]);
		});
		return false;
	});

	// AJAX ADD/REMOVE PLAYER FROM ALLIANCE
	$(document).on('submit', '#formAddPlayer,#formRemPlayer', function() {
		var answer = confirm("Etes vous sur ?");
		if (answer) {
			var $form = $(this);
			jfarm.requestAjax($form.attr('action'), $form.serialize(), function(response) {
				$("#top-actions-notif").trigger('launch', [response.message]);
				$(".resultShow").toggle();
				$(".results").toggle();
			});
		}
		return false;

	});

	// AJAX PLAYER LEAVE ALLIANCE
	$(document).on('click', '#leaveAlliance', function() {
		var answer = confirm("Etes vous sur de vouloir quitter l'alliance ?");
		if (answer) {

			var $link = $(this);
			jfarm.requestAjax($link.attr('href'), null, function(response) {
				$('#content-actions').trigger('onUIUpdatePlayer', [response.player]);
				$("#content-actions-notif").trigger('launch', [response.message]);
			});
		}
		return false;
	});

	$(".resultShow").on('click', function(e) {
		e.stopPropagation();
	});
	$(document).on('click', function() {
		$(".resultShow").hide();
	});
	window.onunload = window.onbeforeunload = (function() {
		var didMyThingYet = false;
		return function() {
			if (didMyThingYet) return;
			didMyThingYet = true;
			jfarmio.sendLogout(jfarm.playerId);
		}
	}());
});