$(function() {

	/***********************************
	 *****    JFARM RELATED CODE    *****
	 ***********************************/

	// WINDOW
	$(document).on('keyup', function(event) {
		jfarm.keyup(event);
	})
	// BUILDINGS
	$(".showBuildings").on('click', function() {
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
		$('#tile-humidity').text("tile.humidity"); // TODO
		$('#tile-state').text(tile.neutral ? "neutral" : "no");
		$('#tile-free').text( !! tile.free ? "yes" : "no");
	});

	// OBJECTS 
	$('#object-wrapper').on('onGettingObjectDetails', function(e){
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

	$.ajax({
		url: "/settings/weapontemplate/jsonlist",
		dataType: 'json'
	}).done(function(response){
		console.log(response);
	});
});