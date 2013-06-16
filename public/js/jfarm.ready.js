$(function() {

	/***********************************
	 *****    JFARM RELATED CODE    *****
	 ***********************************/

	// WINDOW
	$(document).on('keyup', function(event) {
		jfarm.keyup(event);
	})
	$(".resultShow").hide();
	// BUILDINGS
	$(".showBuildings").on('click', function() {
		$('#top-actions').hide();
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
		// we check if player has enough money for crop/building
		// jfarm.getPlayerDetails(null, function(player){

		var $this = $(this),
			value = $this.data('value'),
			$li = $this.parent()

			$('.crop, .building').parent().removeClass('active');
		$li.addClass('active');
		jfarm.drawnObj = jfarm.enumAppObjectsObj[value];
		// })
	});

	// WEAPONS & ACCESSORIES
	$('.weapon, .accessory').on('click', function() {
		var $this = $(this),
			name = $this.data('name');

		$('.weapon, .accessory').parent().removeClass('active');
		$this.parent().addClass('active');
		if (jfarm.playerObjectsData[name] && name != jfarm.playerObjectData.name)
			jfarm.playerObjectData = jfarm.playerObjectsData[name];
	});

	$(".game-actions button").click(function() {
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

	// PLAYER DETAILS
	$('#content-actions').on('getPlayerData', function(e, player) {
		$('#player-data-level').text(player.level);
		$('#player-money').text(player.money + " ch.");
		// $('#player-data-life').text(player.);
		// $('#player-data-tiles').text(player.);
		// $('#player-data-buildings').text(player.);
	});

	// TILES 
	$("#tile-wrapper").on("onGettingTileDetails", function(e) {
		$(this).find('.tile-property-value').html("loading...");
	});
	$("#tile-wrapper").on("getTileData", function(e, tile) {
		$('#tile-owner').text(tile.player ? tile.player.name : "");
		$('#tile-fertility').text(tile.fertility);
		$('#tile-humidity').text(tile.humidity); // TODO
		$('#tile-state').text(tile.neutral ? "neutral" : "no");
		$('#tile-free').text( !! tile.free ? "yes" : "no");
	});

	// OBJECTS 
	$('#object-wrapper').on('onGettingObjectDetails', function(e) {
		$(this).find('.tile-property-value').html("loading...");
		$('#tile-owner').text("...");
		$('#tile-fertility').text("...");
		$('#tile-humidity').text("..."); // TODO
		$('#tile-state').text("...");
		$('#tile-free').text("...");
	});
	$("#object-wrapper").on("getObjectData", function(e, obj) {
		$('#object-type').text(obj.content.name);
		$('#object-owner').text(obj.owner.name);
		// $('#object-alliance').text(obj.content.name); // TODO
	});

	// SEARCH ALLIANCE
	$("#searchA").on('keyup', function(e) {
		$(".results").show();
		if (e.keyCode == 16)
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
					var allianceName = response.alliances[i].name;
					var allianceId = response.alliances[i].id;
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
				var allianceName = response.alliance.name;
				var allianceId = response.alliance.id;
				$(".resultShowA").append("<li>id : " + allianceId + "</li>" + "<li>Name : " + allianceName + "</li>" + "<li>Membres : ");
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
					var playerName = response.players[i].name;
					var playerId = response.players[i].id;
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
				var playerName = response.player.name;
				var playerId = response.player.id;
				var allianceId = response.player.allianceId;
				var currentPlayerId = response.currentPlayer.id;
				var form;
				var alliance;
				console.log(allianceId);
				if (allianceId != null && allianceId != 0) {
					var allianceOwnerId = response.alliance.ownerId;
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

	$("#formCreateAlliance").on('submit', function() {
		var $form = $(this);
		jfarm.requestAjax($form.attr('action'), $form.serialize(), function(response) {
			console.log(response);
		});
		return false;
	});

	$(document).on('submit', '#formAddPlayer,#formRemPlayer', function() {
		var $form = $(this);
		jfarm.requestAjax($form.attr('action'), $form.serialize(), function(response) {
			console.log(response);
			$(".resultShow").toggle();
			$(".results").toggle();
		});
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