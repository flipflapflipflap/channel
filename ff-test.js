// stolen from https://cytu.be/r/25_days_of_autism
// removed majority of effects
// danmaku implementation uses someone else's modification of 25day's nico nico nii 
// user interface, chat icons, stream countdown, and 
//		video times kept from 25days (slightly modified)
// probably a lot of junk in here that could be cleaned up, but I've 
//		never worked with javascript before, and getting just this far
//		was a pain. I'll try to come back later and fix things up.
// also, something's wrong with the message history when the page loads up,
//		but I can't figure out a solution. Seems to work fine during runtime though
//		
//



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* ----- DETAILED BASIC CONFIGURATION ----- */

// Absolute path to the folder this script is running in. Helpful for adding relative paths to images
let SCRIPT_FOLDER_URL = document.currentScript.src.split('/');
SCRIPT_FOLDER_URL.pop();
SCRIPT_FOLDER_URL = SCRIPT_FOLDER_URL.join('/');

var adPercent = 0.1;

var Favicon_URL = `${SCRIPT_FOLDER_URL}/Images/uex.png`;

var ChannelName_Caption = "Let's Flip Flapping!";

var TitleBarDescription_Caption = '>Streaming:';

var ThemesCSS = [
];

var TopUserLogo = [
];

let TEAMCOLORREGEX = /( |)<span style="display:none" class="teamColorSpan">.+/gi;


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* ----- END OF CONFIGURATION, DO NOT CHANGE ANYTHING BELOW ----- */

/* ----- Initial channel options ----- */

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* ----- POLYFILLS ------ */
(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                 || window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame)
      window.requestAnimationFrame = function(callback, element) {
          var currTime = new Date().getTime();
          var timeToCall = Math.max(0, 16 - (currTime - lastTime));
          var id = window.setTimeout(function() { callback(currTime + timeToCall); },
            timeToCall);
          lastTime = currTime + timeToCall;
          return id;
      };

  if (!window.cancelAnimationFrame)
      window.cancelAnimationFrame = function(id) {
          clearTimeout(id);
      };
}());

/* ----- getting channel options ----- */

var defplayer = "right";
var defuserlist = "left";
var defqueue = "right";

var UCONF = {
	"player":getOrDefault(CHANNEL.name + "_player", defplayer),
	"userlist":getOrDefault(CHANNEL.name + "_userlist", defuserlist),
	"queue":getOrDefault(CHANNEL.name + "_queue", defqueue),
	"qsize":getOrDefault(CHANNEL.name + "_qsize", "wide"),
	"main":getOrDefault(CHANNEL.name + "_main", "top"),
	"motd":getOrDefault(CHANNEL.name + "_motd", "top"),
	"logo":getOrDefault(CHANNEL.name + "_logo", "no"),
	"logourl":getOrDefault(CHANNEL.name + "_logourl", ""),
	"logoht":getOrDefault(CHANNEL.name + "_logoht", "200"),
	"header":getOrDefault(CHANNEL.name + "_header", "detached"),
	"css":getOrDefault(CHANNEL.name + "_css", "no"),
	"csscode":getOrDefault(CHANNEL.name + "_csscode", ""),
	"showname":getOrDefault(CHANNEL.name + "_showname", "no")
};
var USERTHEME = getOrDefault(CHANNEL.name + "_theme", "/css/themes/slate.css");
var USERVISITS = getOrDefault(CHANNEL.name + "_visits", 0);
var USERONLINE = 0;
var NOPLAYER = false;
var FULLPL = false;
var FLUID = getOrDefault(CHANNEL.name + "_FLUID", true);
var LAYOUTBOX = getOrDefault(CHANNEL.name + "_LAYOUTBOX", true);
var MINIMIZED = false;
var WEBKIT = "webkitRequestAnimationFrame" in window;
var MAXH = getOrDefault(CHANNEL.name + "_MAXH", "300");
var MAXW = getOrDefault(CHANNEL.name + "_MAXW", "300");
var HIDEHF = getOrDefault(CHANNEL.name + "_HIDEHF", false);
var HIDEPL = getOrDefault(CHANNEL.name + "_HIDEPL", false);
var HIDEANN = getOrDefault(CHANNEL.name + "_HIDEANN", false);
var HIDEMOTD = getOrDefault(CHANNEL.name + "_HIDEMOTD", false);
var CHATFUNC = false;
var CLEARING = false;
var ANTIAFK = false;
var ADDONESECOND = '';
var PLAYERHTML = '';
var PINGLINK = getOrDefault(CHANNEL.name + "_PINGLINK", "");
var PINGVOL = getOrDefault(CHANNEL.name + "_PINGVOL", 1);
var SHOWPROF = getOrDefault(CHANNEL.name + "_SHOWPROF", false);
var MAXUSERS = getOrDefault(CHANNEL.name + "_MAXUSERS" + (new Date().getFullYear()), CHANNEL.usercount);
var SHOWING = false;
var CHATMAXSIZE = getOrDefault(CHANNEL.name + "_CHATMAXSIZE", 150);	// Override Cytube's default limit
// The interval of time (in ms) to flush messages to the screen
var EFFECTSOFF = getOrDefault(CHANNEL.name + "_EFFECTSOFF", false);
var AUTOREFRESH = getOrDefault(CHANNEL.name + "_AUTOREFRESH", false);
var EMBEDVID = getOrDefault(CHANNEL.name + "_EMBEDVID", true);
var AUTOVID = getOrDefault(CHANNEL.name + "_AUTOVID", true);
var LOOPWEBM = getOrDefault(CHANNEL.name + "_LOOPWEBM", true);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* ----- Global functions ----- */

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(function trimChatBuffer() {
	var maxSize = window.CHATMAXSIZE;
	if (!maxSize || typeof maxSize !== "number")
		maxSize = parseInt(maxSize || 100, 10) || 100;
	var buffer = document.getElementById("messagebuffer");
	var count = ($("#messagebuffer.linewrap div:visible").length - 1) - maxSize;

	for (var i = 0; i < count; i++) {
		buffer.firstChild.remove();
	}
})();

// toggle elements visibility
function toggleDiv(a) {
	$(a).css('display') == "none" ? $(a).show() : $(a).hide();
}

// create modal window
function createModal(title) {
	outer=$('<div />').addClass('modal fade').appendTo($("body"));
	modal=$('<div />').addClass('modal-dialog').appendTo(outer);
	modal=$('<div />').addClass('modal-content').appendTo(modal);
	head=$('<div />').addClass('modal-header').appendTo(modal);
	$('<button />').addClass('close').attr('data-dismiss', 'modal').attr('aria-hidden', 'true').html('&times;')
		.appendTo(head);
	$('<h3 />').text(title).appendTo(head);
	body=$('<div />').addClass('modal-body').appendTo(modal);
	footer=$('<div />').addClass('modal-footer').appendTo(modal);
	outer.on("hidden.bs.modal", function() {
		outer.remove();
	});
	outer.modal();
}
// fit player height
function fitPlayer() {
	VWIDTH = $("#videowrap-header").width();
	VHEIGHT = Math.floor(VWIDTH * 9 / 16 + 1);
	$("#ytapiplayer").width(VWIDTH).height(VHEIGHT);
}

// fit chat height
function fitChat(a) {
	if (a === "auto") {
		VW = $("#messagebuffer").width();
		VH = (window.innerHeight * .75) - $("#chatheader").height() - $("#chatline").height();
	} else {
		VH = a;
	}
	$("#messagebuffer").height(VH);
	$("#userlist").height(VH);
}

// toggle "/clear" button depends on rank
function toggleClearBtn() {
	!hasPermission("chatclear") ? $("#clear-btn, #spamclear").hide() : $("#clear-btn, #spamclear").show();
}

// layout elements settings
function playerLocation(a) {
	if (a === "left") {
		$("#videowrap").after($("#chatwrap").detach());
		normalPlayer();
		normalChat();
	} else if (a === "right") {
		$("#videowrap").before($("#chatwrap").detach());
		normalPlayer();
		normalChat();
	}
}

function userlistLocation(a) {
	a === "left" ? $("#userlist").css('float', 'left') : $("#userlist").css('float', 'right');
}

function queueLocation(a) {
	if (a === "right") {
		$("#rightpane").before($("#leftpane").detach());
	} else if (a === "left") {
		$("#rightpane").after($("#leftpane").detach());
	}
	b = (a === "right") ? "left" : "right";
	$("#playlistrow").css('background-position', b + ' bottom');
}

function queueSize(a) {
	if (a === "wide") {
		$("#leftpane").removeClass().addClass('col-lg-5 col-md-5');
		$("#rightpane").removeClass().addClass('col-lg-7 col-md-7');
	} else if (a === "narrow") {
		$("#leftpane").removeClass().addClass('col-lg-7 col-md-7');
		$("#rightpane").removeClass().addClass('col-lg-5 col-md-5');
	}
}

function mainLocation(a) {
	if (a === "top") {
		$("#main").before($("#titlerow").detach()).after($("#playlistrow").detach());
	} else if (a === "bottom") {
		$("#main").before($("#playlistrow").detach()).before($("#titlerow").detach());
	}
	$("#main").after($("#chatpanel").detach());
}

function motdLocation(a) {
	if (a === "top") {
		$("#zerorow").after($("#announcements").detach()).after($("#motdrow").detach());
	} else if (a === "bottom") {
		$("#resizewrap").before($("#motdrow").detach()).before($("#announcements").detach());
	}
}

function logoInsert(a) {
	if (a != "no") {
		link = (a != "user") ? TopUserLogo[a][1] : UCONF.logourl;
		ht = (a != "user") ? TopUserLogo[a][2] : UCONF.logoht;
		azukirow.css('min-height', ht + 'px').css('background-image', 'url(' + link + ')');
	} else if (a === "no") {
		azukirow.css('min-height', '5px').css('background-image', '');
	}
}

function headerMode(a) {
	$(".navbar-fixed-top").unbind();
	if (a === "fixed") {
		$(".navbar-fixed-top").css('position', 'fixed').css('top', '0px');
		$("#mainpage").css('margin-top', '0px');
	} else if (a === "detached") {
		$(".navbar-fixed-top").css('position', 'inherit');
		$("#mainpage").css('margin-top', '-72px');
	} else if (a === "mouseover") {
		$(".navbar-fixed-top").css('position', 'fixed').css('top', '-40px')
			.on("mouseover", function() {
				$(".navbar-fixed-top").css('top', '0px');
			})
			.on("mouseout", function() {
				$(".navbar-fixed-top").css('top', '-40px');
			});
		$("#mainpage").css('margin-top', '-40px');

	}
}

function customCSS(a) {
	$("#usercss").remove();
	a === "yes" ? $("head").append('<style id="usercss" type="text/css">' + UCONF.csscode + '</style>') : '';
}

// set global layout according to user preferences
function setLayout() {
	playerLocation(UCONF.player);
	userlistLocation(UCONF.userlist);
	queueLocation(UCONF.queue);
	queueSize(UCONF.qsize);
	mainLocation(UCONF.main);
	motdLocation(UCONF.motd);
	logoInsert(UCONF.logo);
	headerMode(UCONF.header);
	customCSS(UCONF.css);
	$("#queue").css("width","100%");
}

// display mode helper functions
function bigPlayer() {
	$("#videowrap").removeClass().addClass("col-lg-12 col-md-12");
	fitPlayer();
}

function bigChat() {
	$("#chatwrap").removeClass().addClass('col-lg-12 col-md-12');
	fitChat("auto");
}

function normalPlayer() {
	$("#videowrap").removeClass().addClass("col-lg-7 col-md-7");
	fitPlayer();
}

function normalChat() {
	c = 'col-lg-5 col-md-5';
	$("#chatwrap").removeClass().addClass(c);
	VWIDTH = $("#videowrap").width();
	VHEIGHT = Math.floor(VWIDTH * 9 / 16 + 1);
	fitChat(VHEIGHT - $("#chatline").outerHeight() - 1);
}

// set display mode
function setMode(a) {
	if (NOPLAYER) {
		$("#videowrap").show();
		ytapiplayer = $('<div id="ytapiplayer" />').insertBefore("#playercontrols");
		$("#mediarefresh").click();
		NOPLAYER = false;
	}

	$("#main").show();
	expandbtn.hide();
	modesel.find("option[value='chMode'], option[value='rMode']").show();

	switch (a) {
		case "syMode":
		$("#videowrap, #videowrap p, #videowrap div, #chatwrap, #rightpane").show();
		$("#config-btn, #configbtnwrap br").show();
		$("#min-layout").parent().show();
		normalPlayer();
		normalChat();
		playerLocation(UCONF.player);
		handleWindowResize();
		break;

		case "kMode":
		$("#videowrap").show();
		bigPlayer();
		$("#fontspanel, #emotespanel").hide();
		break;

		case "chMode":
		$("#chatwrap").show();
		if (WEBKIT) {
			$("#videowrap").hide();
		} else {
			$("#videowrap div, #videowrap p").hide();
			$("#ytapiplayer").width(1).height(1);
		}
		bigChat();
		break;

		case "sMode":
		$("#chatwrap").show();
		$("#videowrap").hide();
		$("#ytapiplayer").remove();
		bigChat();
		modesel.find("option[value='chMode'], option[value='rMode']").hide();
		$("#fontspanel, #emotespanel").hide();
		NOPLAYER = true;
		break;

		case "rMode":
		if (WEBKIT) {
			$("#main").hide();
		} else {
			$("#videowrap div, #videowrap p").hide();
			$("#ytapiplayer").width(1).height(1);
		}
		break;
	}
}

// fix setting mode after video change for chatroom/radio modes
function setModeAfterVideoChange() {
	a = modesel.val();
	(a === "chMode" || a === "rMode") ? setMode(a) : '';
}

// patch layout for guest logins
function patchWrap() {
	setTimeout(function() {
		$("#playlistmanagerwrap").show();
	}, 1500);
}

// set user online time
function onlineTime() {
	USERONLINE++;
	hours = Math.floor(USERONLINE / 60);
	minutes = USERONLINE-hours * 60;
	minutes < 10 ? minutes = '0' + minutes : '';
	$("#onlinetime").html(hours + ":" + minutes);
}

// set user CSS
function setUserCSS() {
	$("#usertheme").attr('href', '/css/themes/slate.css');
	$("#usertheme-fix").remove();
	if (USERTHEME.indexOf("/css/themes/")>-1) {
		$("#usertheme").attr('href', USERTHEME);
	} else {
		$('<link id="usertheme-fix" rel="stylesheet" type="text/css" href="' + USERTHEME + '"></link>')
			.appendTo("head");
	}
	$("#usercss").remove();
	if (UCONF.css != "no") {
		$("head").append('<style id="usercss" type="text/css">' + UCONF.csscode + '</style>');
	}
}

function fixUserlistHover() {
	$(".userlist_item").mousemove(function(ev) {
		var top = ev.clientY + 5;
		var horiz = ev.clientX;
		if (UCONF.userlist === "right") horiz -= $(".profile-box").outerWidth();
		$(".profile-box").css("left", horiz + "px")
			.css("top", top + "px");
	});
}

fixUserlistHover();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* ----- UI events functions ----- */

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// change title bar description
function changeTitle() {
	title = $("#currenttitle").text();
	$("#currenttitle").text(title.replace(/^Currently Playing:/, TitleBarDescription_Caption));
}

// expand/collapse queue
function expandQueue() {
	if (!FULLPL) {
		$("#queue").css('max-height', '100000px');
		expandbtn.addClass('btn-success');
	} else {
		$("#queue").css('max-height', '500px');
		expandbtn.removeClass('btn-success');
		scrollQueue();
	}
	FULLPL = !FULLPL;
}

// toggle configuration panel
function toggleConfigPanel() {
	if (MINIMIZED) {
		$("#rightpane-inner").show();
		$("#azukirow, #leftpane-inner").show();
		!$("#hidemotd-btn").hasClass('btn-danger') ? $("#motdrow").show() : '';
		!$("#hideann-btn").hasClass('btn-danger') ? $("#announcements").show() : '';
		!$("#hidehf-btn").hasClass('btn-danger') ? $("footer").show() : '';
		expandbtn.show();
		layoutbtn.removeClass('btn-danger').addClass('btn-success')
			.html('<span class="glyphicon glyphicon-cog"></span> Layout');
		$("#min-layout").prop('checked', false);
		$("#plcontrol button, #db-btn, #newpollbtn").removeAttr('disabled');
		MINIMIZED=false;
	} else {
		toggleDiv(configwrap);
		if (configwrap.css('display')=="none") {
			layoutbtn.removeClass('btn-success');
		} else {
			layoutbtn.addClass('btn-success');
		}
		LAYOUTBOX = !LAYOUTBOX;
		setOpt(CHANNEL.name + "_LAYOUTBOX", LAYOUTBOX);
	}
}

// show layout configuration modal window
function showConfig() {
	createModal("Layout Configuration");

	form=$('<form />').addClass('form-horizontal').appendTo(body);

	function addOption(lbl, thing) {
		g=$('<div />').addClass('form-group').appendTo(form);
		$('<label />').addClass('control-label col-sm-4').text(lbl).appendTo(g);
		c=$('<div />').addClass('col-sm-8').appendTo(g);
		thing.appendTo(c);
	}

	playerlocation=$('<select />').addClass('form-control');
	$('<option />').attr('value', 'left').text('left').appendTo(playerlocation);
	$('<option />').attr('value', 'right').text('right').appendTo(playerlocation);
	playerlocation.val(UCONF.player);
	addOption('Player location', playerlocation);

	userlistlocation=$('<select />').addClass('form-control');
	$('<option />').attr('value', 'left').text('left').appendTo(userlistlocation);
	$('<option />').attr('value', 'right').text('right').appendTo(userlistlocation);
	userlistlocation.val(UCONF.userlist);
	addOption('Userlist location', userlistlocation);

	queuelocation=$('<select />').addClass('form-control');
	$('<option />').attr('value', 'left').text('left').appendTo(queuelocation);
	$('<option />').attr('value', 'right').text('right').appendTo(queuelocation);
	queuelocation.val(UCONF.queue);
	addOption('Playlist location', queuelocation);

	queuesize=$('<select />').addClass('form-control');
	$('<option />').attr('value', 'wide').text('wide').appendTo(queuesize);
	$('<option />').attr('value', 'narrow').text('narrow').appendTo(queuesize);
	queuesize.val(UCONF.qsize);
	addOption('Playlist column size', queuesize);

	mainlocation=$('<select />').addClass('form-control');
	$('<option />').attr('value', 'top').text('above playlist').appendTo(mainlocation);
	$('<option />').attr('value', 'bottom').text('below playlist').appendTo(mainlocation);
	mainlocation.val(UCONF.main);
	addOption('Player & chat', mainlocation);

	motdlocation=$('<select />').addClass('form-control');
	$('<option />').attr('value', 'top').text('channel top').appendTo(motdlocation);
	$('<option />').attr('value', 'bottom').text('channel bottom').appendTo(motdlocation);
	motdlocation.val(UCONF.motd);
	addOption('MOTD & announcements', motdlocation);

	logoinsert=$('<select />').addClass('form-control');
	$('<option />').attr('value', 'no').text('no image').appendTo(logoinsert);
	$('<option />').attr('value', 'user').text('user image').appendTo(logoinsert);
	for (i in TopUserLogo) {
		$("<option />").attr('value', i).text(TopUserLogo[i][0]).appendTo(logoinsert);
	}
	logoinsert.val(UCONF.logo);
	addOption('Top logo', logoinsert);

	userlogo=$('<input />').addClass('form-control').attr('type', 'text')
		.attr('placeholder', 'Image URL');
	userlogo.val('');
	addOption('User logo URL', userlogo);

	userlogoht=$('<input />').addClass('form-control').attr('type', 'text')
		.attr('placeholder', 'Image Height (in px)');
	userlogoht.val('');
	addOption('User logo height', userlogoht);

	if (UCONF.logo!="user") {
		userlogo.parent().parent().hide();
		userlogoht.parent().parent().hide();
	} else {
		userlogo.val(UCONF.logourl);
		userlogoht.val(UCONF.logoht);
	}

	headermode=$('<select />').addClass('form-control')
	$('<option />').attr('value', 'fixed').text('fixed').appendTo(headermode);
	$('<option />').attr('value', 'detached').text('detached').appendTo(headermode);
	$('<option />').attr('value', 'mouseover').text('mouseover').appendTo(headermode);
	headermode.val(UCONF.header);
	addOption('Header menu', headermode);

	customcss=$('<select />').addClass('form-control');
	$('<option />').attr('value', 'no').text('no').appendTo(customcss);
	$('<option />').attr('value', 'yes').text('yes').appendTo(customcss);
	customcss.val(UCONF.css);
	addOption('Custom CSS', customcss);

	usercss=$('<textarea rows="8" />').addClass('form-control')
		.attr('placeholder', 'Insert CSS code');
	usercss.val(UCONF.csscode);
	addOption('CSS code', usercss);

	if (UCONF.css=="no") {
		usercss.parent().parent().hide();
	}

	showname=$('<select />').addClass('form-control');
	$('<option />').attr('value', 'yes').text('yes').appendTo(showname);
	$('<option />').attr('value', 'no').text('no').appendTo(showname);
	showname.val(UCONF.showname);
	addOption('Always show username in chat', showname);

	chatlines=$('<input type="text" placeholder="Default chat lines is 150." />').addClass('form-control');
	chatlines.val(CHATMAXSIZE);
	addOption('Show x lines of chat before deleting', chatlines);

	nicoDelay=$('<input type="text" placeholder="Default nico delay is 250 ms." />').addClass('form-control');
	nicoDelay.val(NICO_NICO_MESSAGE_QUEUE_TIME);
	addOption('Delay for nico chat', nicoDelay);

	submit=$('<button />').addClass('btn btn-default btn-success').text("Save changes").appendTo(footer);
	reset=$('<button />').addClass('btn btn-default pull-left').text('Default').appendTo(footer);

	logoinsert.on("change", function() {
		if (logoinsert.val()=="user") {
			userlogo.parent().parent().show();
			userlogoht.parent().parent().show();
			userlogo.val(UCONF.logourl);
			userlogoht.val(UCONF.logoht);
		} else {
			userlogo.parent().parent().hide();
			userlogoht.parent().parent().hide();
		}
	});

	customcss.on("change", function() {
		if (customcss.val()=="yes") {
			usercss.parent().parent().show();
		} else {
			usercss.parent().parent().hide();
		}
	});

	submit.on("click", function() {
		outer.modal('hide');

		UCONF.player=playerlocation.val();
		setOpt(CHANNEL.name + "_player",UCONF.player);

		UCONF.userlist=userlistlocation.val();
		setOpt(CHANNEL.name + "_userlist",UCONF.userlist);

		UCONF.queue=queuelocation.val();
		setOpt(CHANNEL.name + "_queue",UCONF.queue);

		UCONF.qsize=queuesize.val();
		setOpt(CHANNEL.name + "_qsize",UCONF.qsize);

		UCONF.main=mainlocation.val();
		setOpt(CHANNEL.name + "_main",UCONF.main);

		UCONF.motd=motdlocation.val();
		setOpt(CHANNEL.name + "_motd",UCONF.motd);

		if (logoinsert.val()=="user") {
			if (userlogo.val()=="") {
				logoinsert.val("no");
			} else if (userlogoht.val()=="") {
				userlogoht.val('200');
			} else {
				a=userlogoht.val()*1;
				if (isNaN(a) || a<1) {
					userlogoht.val('200');
				}
			}
			UCONF.logourl=userlogo.val();
			UCONF.logoht=userlogoht.val();
			setOpt(CHANNEL.name + "_logourl",UCONF.logourl);
			setOpt(CHANNEL.name + "_logoht",UCONF.logoht);
		}

		UCONF.logo=logoinsert.val();
		setOpt(CHANNEL.name + "_logo",UCONF.logo);

		UCONF.header=headermode.val();
		setOpt(CHANNEL.name + "_header",UCONF.header);

		if (customcss.val()=="yes") {
			UCONF.csscode=usercss.val();
			setOpt(CHANNEL.name + "_csscode",UCONF.csscode);
		}

		UCONF.css=customcss.val();
		setOpt(CHANNEL.name + "_css",customcss.val());

		UCONF.showname=showname.val();
		setOpt(CHANNEL.name + "_showname",UCONF.showname);


		CHATMAXSIZE=parseInt(chatlines.val()) || 150;
		setOpt(CHANNEL.name + "_CHATMAXSIZE",CHATMAXSIZE);

		NICO_NICO_MESSAGE_QUEUE_TIME=parseInt(nicoDelay.val()) || 250;
		setOpt(CHANNEL.name + "_NICO_NICO_MESSAGE_QUEUE_TIME",NICO_NICO_MESSAGE_QUEUE_TIME);

		setLayout();
		scrollChat();
		scrollQueue();
		showProfiles();
	});

	reset.on("click", function() {
		outer.modal("hide");

		UCONF.player = defplayer;
		setOpt(CHANNEL.name + "_player", defplayer);

		UCONF.userlist = defuserlist;
		setOpt(CHANNEL.name + "_userlist", defuserlist);

		UCONF.queue = defqueue;
		setOpt(CHANNEL.name + "_queue", defqueue);

		UCONF.qsize = "wide";
		setOpt(CHANNEL.name + "_qsize",UCONF.qsize);

		UCONF.main = "top";
		setOpt(CHANNEL.name + "_main",UCONF.main);

		UCONF.motd = "top";
		setOpt(CHANNEL.name + "_motd",UCONF.motd);

		UCONF.logo = "no";
		setOpt(CHANNEL.name + "_logo",UCONF.logo);

		UCONF.header = "detached";
		setOpt(CHANNEL.name + "_header",UCONF.header);

		UCONF.css = "no";
		setOpt(CHANNEL.name + "_css",UCONF.css);

		UCONF.showname="no";
		setOpt(CHANNEL.name + "_showname",UCONF.showname);

		CHATMAXSIZE=150;
		setOpt(CHANNEL.name + "_CHATMAXSIZE",CHATMAXSIZE);

		NICO_NICO_MESSAGE_QUEUE_TIME=250;
		setOpt(CHANNEL.name + "_NICO_NICO_MESSAGE_QUEUE_TIME",NICO_NICO_MESSAGE_QUEUE_TIME);

		setLayout();
		scrollChat();
		scrollQueue();
		showProfiles()
	});
}

// toggle fluid layout
function toggleFluidLayout() {
	if (!$("body").hasClass('fullscreen')) {
		$("body").addClass('fullscreen');
		$(".container").removeClass('container').addClass('container-fluid');
		$("footer .container-fluid").removeClass('container-fluid').addClass('container');
	} else {
		$("body").removeClass('fullscreen');
		$(".container-fluid").removeClass('container-fluid').addClass('container');
	}
	handleWindowResize();
	scrollChat();
}

// toggle minimized layout
function toggleMinLayout() {
	if (!MINIMIZED) {
		$("#rightpane-inner").hide();
		$("#azukirow, #motdrow, #announcements, #leftpane-inner, footer").hide();
		expandbtn.hide();
		layoutbtn.removeClass('btn-success').addClass('btn-danger').html('Maximize');
		$("#plcontrol button, #db-btn, #newpollbtn").attr('disabled', 'disabled');
		MINIMIZED=true;
	}
}


//////////////////
//////////////////
//////////////////
//////////////////

// *** BEGIN SEARCH

//////////////////
//////////////////
//////////////////
//////////////////
//////////////////
//////////////////
//////////////////


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* ----- User Interface ----- */

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// adding important hidden reference row
zerorow = $('<div id="zerorow" class="row" />').insertBefore("#motdrow");

// adding top logo row
azukirow = $('<div id="azukirow" class="row" />').insertBefore(zerorow);

// adding video wrap if user has enabled "Hide Player" option
if (USEROPTS.hidevid) {
	$("#chatwrap, #chatline").removeClass('col-lg-12 col-md-12').addClass('col-lg-5 col-md-5');
	videowrap = $('<div id="videowrap" class="col-lg-7 col-md-7" />')
		.insertBefore("#chatwrap");
	currenttitle = $('<p id="currenttitle" />')
		.html('Currently Playing: ' + $(".queue_active a").html())
		.appendTo(videowrap);
	ytapiplayer = $('<div id="ytapiplayer" />')
		.appendTo(videowrap);

	html = 'According to your User Preferences, video player is hidden. '
		+ 'Click a button below to continue hiding player. '
		+ 'Click default "Reload" icon to show player in this session. '
		+ 'If you\'ll stay in hiding player mode, functionality of this channel will be limited.<br /><br />';
	makeAlert("No Player", html).appendTo(ytapiplayer);
	$("#ytapiplayer .alert").css({'text-align':'left', 'margin':'0px -15px'});

	staybtn = $('<button id="stay-btn" class="btn btn-default btn-sm">Stay In "Chat Only" Mode</button>')
		.appendTo("#ytapiplayer .alert")
		.on("click", function() {
			videowrap.remove();
			$("#chatwrap").removeClass().addClass('col-lg-12 col-md-12');
			$("#configform, #modeform").hide();
			fitChat("auto");
		});
}

//Team Colour
$('head').append('<script type="text/javascript" src="' + `${SCRIPT_FOLDER_URL}/ffteamcolor.js` + '">');

// changing initial layout to compact
$("body").addClass('fluid');
compactLayout();
toggleFluidLayout();

// adding "id" attributes
$(".navbar-collapse .navbar-nav").children().first().attr('id', 'home-link');
$("#home-link").next().attr('id', 'account-link');
$("#account-link").next().attr('id', 'options-link');
$("#options-link").next().attr('id', 'channelset-link');
$("#channelset-link").next().attr('id', 'layout-link');

// changing location of some layout elements
$("#main").prepend($("#drinkbar").detach());
$("#videowrap").append('<div id="playercontrols" class="btn-group" />');
$("#playercontrols").append($("#mediarefresh").detach());
$("#rightpane").prepend($("#videocontrols").detach());
$("#rightpane").prepend($("#plcontrol").detach());
$("#leftpane").prepend($("#newpollbtn,#emotelistbtn").detach());
$("#plcontrol").prepend($("#showmediaurl").detach());

// header and footer links open in a new tab
$("#home-link a, #account-link ul a, .credit a").attr('target', '_blank');

// adding favicon
if (Favicon_URL!=="") {
	$(document).ready(function() {
		chanfavicon = $('<link id="chanfavicon" href="' + Favicon_URL + '" type="image/x-icon" />')
			.attr('rel', 'shortcut icon')
			.appendTo("head");
	});
}

// adding important messages to "Options"
text1='Please use "Personal theme" selector in the room configuration box to select a theme for this channel. ';
text2='Please use "Click to configure" button in the room configuration box to configure this channel. ';
text3='If you want to make global changes, please go to another channel.';
$("#us-theme").hide();
$("#us-theme").parent().append('<p class="text-danger">' + text1 + '' + text3 + '</p>');
$("#us-layout").hide();
$("#us-layout").parent().append('<p class="text-danger">' + text2 + '' + text3 + '</p>');

// fix layout after saving user options
$("#useroptions .modal-footer button:nth-child(1)").on("click", function() {
	USEROPTS.hidevid ? location.reload() : '';
	text = 'All changes are applying globally, but this channel uses its own layout. '
		+ 'Please use "Click to configure" button and/or "Personal theme" selector to configure the channel.<br />'
		+ 'Reload player if the wrong title is displaying. '
		+ 'In HD layout or if player is removed, you may not see some elements due to CyTube API. '
		+ 'If so, reload channel.';
	makeAlert("User Preferences change", text, "alert-info").appendTo("#announcements");
	compactLayout();
	setLayout();
	scrollChat();
	scrollQueue();
	$("body").hasClass('fullscreen') ? fluidLayout() : '';
});

// changing channel name
ChannelName_Caption !== "" ? $(".navbar-brand").html(ChannelName_Caption) : '';

LINKS = setOpt(CHANNEL.name + "_LINKS", {});

var rdmLinkInterval = false;
var iRefreshes = 0;
var videoElement = false;

function clearAutoRefresh() {
	clearInterval(rdmLinkInterval);
	rdmLinkInterval = false;
	iRefreshes = 0;
}

autorefreshbtn = $('<button id="autorefreshbtn" class="btn btn-sm ' + (!AUTOREFRESH ? 'btn-danger' : 'btn-default') + '" title="Toggle to auto refresh the player. Please note this is still experimental.">Auto Refresh ' + (!AUTOREFRESH ? 'OFF' : 'ON') + '</button>')
	.appendTo("#playercontrols")
	.on("click", function() {
		AUTOREFRESH = !AUTOREFRESH;
		setOpt(CHANNEL.name + "_AUTOREFRESH", AUTOREFRESH);
		if (AUTOREFRESH) {
			this.className = "btn btn-sm btn-default";
			this.textContent = "Auto Refresh ON";
		} else {
			this.className = "btn btn-sm btn-danger";
			this.textContent = "Auto Refresh OFF";
			clearAutoRefresh();
		}
	});


function autoRefreshPlayer(data) {
	if (typeof data.type !== "undefined") {
		if (AUTOREFRESH && data.type === "fi" && !vidRemoved) {
			videoElement = document.getElementById("ytapiplayer_html5_api") || false;
			clearAutoRefresh();

			if (!rdmLinkInterval) {
				rdmLinkInterval = setInterval(function() {
					iRefreshes++;
					videoElement = document.getElementById("ytapiplayer_html5_api") || false;
					vidError = videoElement.error || false;

					if (vidError) {
						document.getElementById("mediarefresh").click();
					} else if (iRefreshes > 15 || videoElement.readyState !== 0) {
						clearAutoRefresh();
					}
				}, 2050 + Math.floor(700 * Math.random()));
			}
		}
	}
}

_loadMediaPlayer = loadMediaPlayer;
loadMediaPlayer = function(data) {
	selectRandomLink(data);
    _loadMediaPlayer(data);
	autoRefreshPlayer(data);
}

_handleMediaUpdate = handleMediaUpdate;
handleMediaUpdate = function(data) {
	selectRandomLink(data);
    _handleMediaUpdate(data);
	autoRefreshPlayer(data);
}

const PlaylistDelimiter = "???streamurl???";

function selectRandomLink(data) {
	if (typeof data.id !== "undefined") {
		if (data.type === "fi") {
			if (data.id.indexOf(PlaylistDelimiter) > -1) {
				LeaderLink = data.id;
				var rdmLinks = data.id.split(PlaylistDelimiter);
				data.id = rdmLinks[Math.floor(Math.random() * rdmLinks.length)];
				setTimeout(function () {
					PLAYER.mediaId = LeaderLink; // Media ID must match playlist link or else this does not let you set the time.
				}, 1000);
			}
		}
	}
}

setTimeout(document.getElementById("mediarefresh").click(), 500);


//////////////
//////////////
// GOOD
//////////////
//////////////



function setPanelProperties(div) {
	height = $("#userlist").height();
	width = $("#userlist").width();
	$(div).css({'background-color':'black', 'height':height + 2 + 'px', 'width':width + 'px'});
}

function antiAFKfunction() {
	$(".userlist_item").each(function() {
		var ulthis = $(this);
		if (ulthis.children().eq(1).text() === CLIENT.name && ulthis.hasClass("userlist_afk")) {
			socket.emit("chatMsg", {msg: '/afk'});
			return;
		}
	});
}

function turnOffBtn() {
	turnoffbtn = true;
	$("#chatfunc-dropdown").find('button').each(function() {
		$(this).hasClass("btn-danger") ? turnoffbtn = false : '';
	});
	turnoffbtn ? $("#chatflair").removeClass("label-success").addClass("label-default") : $("#chatflair").removeClass("label-default").addClass("label-success");
}

function makeChatPanel() {
	$("#userlist").append('<div id="chatfunc-dropdown" />');
	$("#chatfunc-dropdown").append('<div id="spamclear">Auto clear chat</div>');
	spamcleardiv = $("<div/>").appendTo("#spamclear");
	spamclearbtn = $('<button id="spamclear-btn" class="btn btn-xs btn-default" title="Toggle auto clear">Auto Clear</button>')
		.appendTo(spamcleardiv)
		.on("click", function() {
			if (!CLEARING) {
				$(this).text('Stop Clearing').addClass('btn-danger');
				CLEARING = setInterval(function() {
					socket.emit("chatMsg", {msg: '/clear'});
				}, 500);
			} else {
				$(this).text('Auto Clear').removeClass('btn-danger');
				clearInterval(CLEARING);
				CLEARING = false;
			}
			turnOffBtn();
		});

	$("#chatfunc-dropdown").append('<div id="antiafk">Never go AFK</div>');
	antiafkdiv = $("<div/>").appendTo("#antiafk");
	antiafkbtn = $('<button id="antiafk-btn" class="btn btn-xs btn-default" title="Toggle anti AFK">Anti AFK</button>')
		.appendTo(antiafkdiv)
		.on("click", function() {
			if (!ANTIAFK) {
				antiAFKfunction();
				$(this).addClass('btn-danger');
				ANTIAFK = socket.on("setAFK", antiAFKfunction);
			} else {
				$(this).removeClass('btn-danger');
				socket.removeListener("setAFK", antiAFKfunction);
				ANTIAFK = false;
			}
			turnOffBtn();
		});
// maybe
	$("#chatfunc-dropdown").append('<div id="imgsize">Adjust image/webm size</div>');
	imgsizediv = $("<div/>").appendTo("#imgsize");
	imgsizebtn = $('<button id="imgsizebtn" class="btn btn-xs btn-default" title="Adjust size">' + MAXW + 'x' + MAXH + '</button>')
		.appendTo(imgsizediv)
		.on("click", function() {
			var tempvar = $("#chatline").val();
			var tempvar2 = tempvar.split(" ");
			if (tempvar2[0] > 0 && tempvar2[1] > 0) {
				MAXW = tempvar2[0];
				setOpt(CHANNEL.name + "_MAXW", MAXW);
				MAXH = tempvar2[1];
				setOpt(CHANNEL.name + "_MAXH", MAXH);
				$(".pm-buffer.linewrap img, .pm-buffer.linewrap video, #messagebuffer.linewrap img, #messagebuffer.linewrap video").css({"max-width": MAXW + "px","max-height": MAXH + "px"});
				$("#chatline").val("");
				$(this).text(MAXW + 'x' + MAXH);
			} else {
				alert("Invalid input. Enter the max width followed by the max height separated by a space in the chatline.\nEx. \"400 200\"");
			}
	});
// maybe
	_chatBuffer = addChatMessage;
	addChatMessage = function(data) {
		_chatBuffer(data);
		//$("#messagebuffer.linewrap img").css({"max-height": MAXH + "px","max-width": MAXW + "px"});
	}
}
//$("#messagebuffer.linewrap img").css({"max-height": MAXH + "px","max-width": MAXW + "px"});

makeChatPanel();
chatfunc = $("#chatfunc-dropdown").detach();


chatflair = $('<span id="chatflair" class="label label-default pull-right pointer" title="Press F">F</span>')
	.insertAfter("#modflair")
	.on("click", function() {
		!CHATFUNC ? chatfunc.appendTo($("#userlist")) : chatfunc.detach();
		CHATFUNC = !CHATFUNC;
		toggleClearBtn();
		setPanelProperties("#chatfunc-dropdown");
	});


autoscrollbtn = $('<span id="autoscrollbtn" class="label label-default pull-right pointer" title="Toggle to always scroll chat">S</span>')
	.insertAfter("#modflair")
	.on("click", function() {
		if ($(this).hasClass("label-success")) {
			$(this).removeClass("label-success").addClass("label-default");
			socket.removeListener("chatMsg", scrollChat);
		} else {
			$(this).addClass("label-success").removeClass("label-default");
			socket.on("chatMsg", scrollChat);
		}
	});


// optional removing of "Home" menu from header
$("#home-link").remove();

$("#layout-link li:nth-child(2) a").on("click", function() {
	$("#transformationform, #modeform").hide();
	fitChat("auto");
});

var _chatOnly = chatOnly;
chatOnly = function () {
	$("#currenttitle").css({"display":"inline","border-width":"0px"}).appendTo($("#chatheader"));
	webmthing = $("<div/>").appendTo($('<div id="webmthing">Toggle webms</div>').appendTo(chatfunc));
	embedvid.removeClass("btn-sm").addClass("btn-xs").appendTo(webmthing);
	loopwebm.removeClass("btn-sm").addClass("btn-xs").appendTo(webmthing);
	autovid.removeClass("btn-sm").addClass("btn-xs").appendTo(webmthing);
	_chatOnly();
	scrollChat();
	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
		$("#findtime,#currenttitle").remove();
		$("span.label.label-default.pull-right.pointer").each(function() {
			var btext = $(this).text();
			if (btext.length > 1) {
				$(this).text(btext.charAt(0));
			}
		});
	}
};

var	vidRemoved = false;

//////////////
//////////////
// BAD ABOVE
//////////////
//////////////



//////////////////
//////////////////
//////////////////
//////////////////

// *** END SEARCH

//////////////////
//////////////////
//////////////////
//////////////////
//////////////////
//////////////////
//////////////////
