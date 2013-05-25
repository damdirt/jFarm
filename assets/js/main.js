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
	$("nav.main ul a").on('click', function() {
		var tab = $(this),
			index = tab.parent().index(),
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

	// BTN ACTIVE
	$(".buttons button").click(function() {
		$(this).siblings().removeClass("active");
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

	// delete process
	$(".action-delete").on('click', function() {
		if (confirm('Confirm remove ?')) {
			var $this = $(this),
				url = $this.data('url'),
				id = $this.data('id');

			socket.request(url + id, {
				message: 'delete' + id
			}, function(response) {
				if (response.id == id) {
					$this.parent().fadeOut();
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

});