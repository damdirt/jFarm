$(document).ready(function() {

	var serverRoot = 'http://localhost:1337';
	var socket = io.connect(serverRoot);

	// NAV MAIN ACTIVE
	$("nav.main ul a").click(function() {
		$("nav.main ul a").each(function() {
			$(this).removeClass("active");
		});
		$(this).addClass("active");
	});

	// DISPLAY SUB NAV
	$("nav.sub").hide();
	$("nav.main ul a:last").on('click', function() {
		var tab = $(this),
			index = tab.parent().index()-2,
			content = $("nav.sub").eq(index),
			contents = $('nav.sub:visible');
		if (content.is(':visible')) {
			content.slideUp();
			$("nav.main ul a").removeClass("active");
		} else {
			contents.hide(100);
			content.slideDown(500);
		}
	});

	// NAV SUB ACTIVE
	$("nav.sub ul a").click(function() {
		$("nav.sub ul a").each(function() {
			$(this).removeClass("active");
		});
		$(this).addClass("active");
	});


	var consoleTimeout;
	$('.minicolors').each(function() {
		$(this).minicolors({
			control: $(this).attr('data-control') || 'hue',
			defaultValue: $(this).attr('data-default-value') || '',
			inline: $(this).hasClass('inline'),
			letterCase: $(this).hasClass('uppercase') ? 'uppercase' : 'lowercase',
			opacity: $(this).hasClass('opacity'),
			position: $(this).attr('data-position') || 'default',
			styles: $(this).attr('data-style') || '',
			swatchPosition: $(this).attr('data-swatch-position') || 'left',
			textfield: !$(this).hasClass('no-textfield'),
			theme: 'bootstrap',
			change: function(hex, opacity) {
				// Generate text to show in console
				text = hex ? hex : 'transparent';
				if (opacity) text += ', ' + opacity;
				text += ' / ' + $(this).minicolors('rgbaString');

				// Show text in console; disappear after a few seconds
				$('#console').text(text).addClass('busy');
				clearTimeout(consoleTimeout);
				consoleTimeout = setTimeout(function() {
					$('#console').removeClass('busy');
				}, 3000);
			}
		});
	});

	// DELETE PROCESS
	$(".action-delete").on('click', function() {
		if (confirm('Confirm remove ?')) {
			var $this = $(this),
				url = $this.data('url'),
				id = $this.data('id');

			socket.request(url + id, {
				message: 'delete' + id
			}, function(response) {
				if (response.id == id) {
					$this.parents('.object-line').fadeOut();
				} else {
					alert(response);
				}
			});
		}
	});

	$(".action-get").on('click', function() {
			var $this = $(this),
				url = $this.data('url'),
				id = $this.data('id');

			socket.request(url + id, {
				message: 'get' + id
			}, function(response) {
				if (response.id == id) {
					$("#method").val('edit');
					$("#id").val(id);
					$("#name").val(response.name);
					$("#value").val(response.content);
				} else {
					alert(response);
				}
			});
	});

	// PAGINATION LISTS
	$('.pag-objects').pajinate({
		items_per_page : 5
	});

	// FOOTER ON/OFF
	$(".round").on('click', function() {
		var fActions = $("#content-actions");
		fActions.animate({
			height: 'toggle'
		},1000, function(){
			$(".round").toggleClass('off');
		});
	});

	// TOOLTIP FOOTER
	$("#main-circle div:not(:first)").hide();
	$("#tooltip-b span:not(:first)").hide();
	$("#labels label").on('click',function(){
		var tab = $(this),
		    index = tab.index(),
		    content = $("#main-circle div").eq(index),
		    contents = content.siblings();

		tab.addClass("current").parent()
		    .siblings().removeClass('current');
		content.show();
		contents.hide();

		var tabLeg = $(this),
		    indexLeg = tabLeg.index(),
		    contentLeg = $("#tooltip-b span").eq(indexLeg),
		    contentsLeg = contentLeg.siblings();

		tabLeg.addClass("current").parent()
		    .siblings().removeClass('current');
		contentLeg.show();
		contentsLeg.hide();
	});

	// POPUP
	$(".popup").on('click', function(e) {
		$(".modal").toggle();
		e.stopPropagation();
	});
	$(".modal").on('click', function(e) {
		e.stopPropagation();
	});
	$(document).on('click', function() {
		$(".modal").hide();
	});
	
	/***********************************
	*****    JFARM RELATED CODE    *****
	***********************************/

	// WINDOW
	$(document).on('keyup', function(event){
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
	$("#right-actions button").on('click',function(){
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
	$('#creator').on("cancelDrawing", function(){
		$('.crop, .building').parent().removeClass('active');
	});

	$('.crop, .building').on('click', function(){
		// to be sure moving player button is pushed
		$(".game-actions button:first").trigger('click');
		// we check if player has enough money for crop/building
		// jfarm.getPlayerDetails(null, function(player){
			
			var $this = $(this)
				,value = $this.data('value')
				,$li = $this.parent()

			$('.crop, .building').parent().removeClass('active');
			$li.addClass('active');
			jfarm.drawnObj = jfarm.enumAppObjectsObj[value];
		// })
	});

	// WEAPONS & ACCESSORIES
	$('.weapon, .accessory').on('click', function(){
		var $this = $(this)
			,name = $this.data('name');

		$('.weapon, .accessory').parent().removeClass('active');
		$this.parent().addClass('active');
		if(jfarm.playerObjectsData[name] && name != jfarm.playerObjectData.name)
			jfarm.playerObjectData = jfarm.playerObjectsData[name];
	});

	$(".game-actions button").click(function() {
		var $this = $(this)
			,action = $this.data("action")
			,siblings = $this.siblings();

		// ui process
		siblings.removeClass("active");
		$this.addClass("active");

		// jfarm process
		siblings.each(function(index, elem){
			jfarm[$(elem).data("action")] = false;
		});
		jfarm[action] = true;
	});

	// PLAYER DETAILS
	$('#content-actions').on('getPlayerData', function(e, player){
		$('#player-data-level').text(player.level);
		$('#player-money').text(player.money + " ch.");
		// $('#player-data-life').text(player.);
		// $('#player-data-tiles').text(player.);
		// $('#player-data-buildings').text(player.);
	});

	// TILES 
	$("#tile-wrapper").on("onGettingTileDetails", function(e){
		$(this).find('.tile-property-value').html("loading...");
	});	
	$("#tile-wrapper").on("getTileData", function(e, tile){
		$('#tile-owner').text(tile.player ? tile.player.name : "");
		$('#tile-fertility').text(tile.fertility);
		$('#tile-humidity').text("tile.humidity"); // TODO
		$('#tile-state').text(tile.neutral ? "neutral" : "no" );
		$('#tile-free').text(!!tile.free ? "yes" : "no" );
	});

	// OBJECTS 
	$("#object-wrapper").on("getObjectData", function(e, obj){
		$('#object-type').text(obj.content.name);
		$('#object-owner').text(obj.owner.name);
		// $('#object-alliance').text(obj.content.name); // TODO
	});
});
