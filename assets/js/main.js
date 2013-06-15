$(function() {

	//var serverRoot = 'http://localhost:1337';
	//var socket = io.connect(serverRoot);

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
			index = tab.parent().index() - 2,
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
		items_per_page: 5
	});

	// FOOTER ON/OFF
	$(".round").on('click', function() {
		var fActions = $("#content-actions");
		fActions.animate({
			height: 'toggle'
		}, 1000, function() {
			$(".round").toggleClass('off');
		});
	});

	// TOOLTIP FOOTER
	$("#main-circle div:not(:first)").hide();
	$("#tooltip-b span:not(:first)").hide();
	$("#labels label").on('click', function() {
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

	// MODAL
	$(".popup-r").on('click', function(e) {
		$(".modal").toggle();
		e.stopPropagation();
	});
	$(".modal").on('click', function(e) {
		e.stopPropagation();
	});
	$(document).on('click', function() {
		$(".modal").hide();
	});

	// MODAL TABS
	$("#modal-tabs-content .tab-content:not(:first)").hide();
	$("#modal-tabs .tab-link").on('click', function() {
		var tab = $(this),
			index = tab.parent().index(),
			content = $("#modal-tabs-content .tab-content").eq(index),
			contents = content.siblings();

		tab.addClass("current")
			.siblings().removeClass('current');
		content.show();
		contents.hide();
	});

	// DISPLAY TEXT ACTIONS
	$(".action-display .action-txt").hide();
	$(".element-actions .action-element").on('mouseover', function() {
		var tab = $(this),
			index = tab.index(),
			content = $(".action-display .action-txt").eq(index),
			contents = content.siblings();

		tab.addClass("current")
			.siblings().removeClass('current');
		content.show();
		contents.hide();
	});

	// ALLIANCES
	$('#top-actions').hide();
	$('#search-p').hide();
	$('.popup-t').on('click', function(e) {
		$('#right-actions').hide();
		$('#top-actions').toggle();
	});

	// change search bar
	$('.switch').on('click', function() {
		$('#search-a').toggle();
		$('#search-p').toggle();
	});

	// HIDE ELEMENTS BY ESC
	$(document).on('keydown', function (e) {
	    if (e.keyCode === 27) {
	        $(".modal").hide();
	        $(".modal-elements").hide();
	        $("#top-actions").hide();
	        $(".overlay").hide();
	    }
	});
});