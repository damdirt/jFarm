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
	$('.game').on("initTemplatesUI", function(e, templates){
		console.log(templates);
	});

	$('.game').on('onUIUpdatePlayer', function(e, player){
		if(player){
			$('#player-data-level').text(player.level);
			$('#player-money').text(player.money);
		} else {
			console.log("No player");
		}
	});

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
		var $this = $(this),
			value = $this.data('value'),
			type = $this.data('type'),
			$li = $this.parent();

		// we get template of selected item
		jfarm.drawnObj = jfarm.getAnyTemplateByName(value);
		jfarm.drawnObj.type = type;

		jfarm.getPlayerDetails(null, function(player){
			// we check if player has enough money for crop/building
			if(player.money >= jfarm.drawnObj.price){
				$('.crop, .building').each(function(index, elem){
					var $elem = $(elem);
					if($elem.data('value').toLowerCase() === jfarm.drawnObj.name.toLowerCase())
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

	// PLAYER DETAILS
	// $('#content-actions').on('getPlayerData', function(e, player) {
	// 	$('#player-data-level').text(player.level);
	// 	$('#player-money').text(player.money);
	// 	// $('#player-data-life').text(player.);
	// 	// $('#player-data-tiles').text(player.);
	// 	// $('#player-data-buildings').text(player.);
	// });

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
	$('#object-wrapper').on('onGettingObjectDetails', function(e){
		$(this).find('.object-property-value').html("loading...");
		$('#tile-owner').text("...");
		$('#tile-fertility').text("...");
		$('#tile-humidity').text("..."); // TODO
		$('#tile-state').text("...");
		$('#tile-free').text("...");
	});
	$("#object-wrapper").on("getObjectData", function(e, obj) {
		$(this).find('.title-b').text(jfarm.capitaliseFirstLetter(obj.objectType));
		$('#object-type').text(obj.content.name);
		$('#object-owner').text(obj.owner.name);
		// $('#object-alliance').text(obj.content.name); // TODO
	});
});