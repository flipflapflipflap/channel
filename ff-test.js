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



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* ----- Chat and window extensions and events ----- */

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

$("#cs-motdtext").on("keydown", function(ev) {
	if (ev.which == 83 && ev.ctrlKey && !ev.shiftKey && !ev.altKey) {
		socket.emit("setMotd", {
			motd: $("#cs-motdtext").val()
		});
		return false;
	}
});

$("#cs-csstext").on("keydown", function(ev) {
	if (ev.which == 83 && ev.ctrlKey && !ev.shiftKey && !ev.altKey) {
		socket.emit("setChannelCSS", {
			css: $("#cs-csstext").val()
		});
		return false;
	}
});

$("#cs-jstext").on("keydown", function(ev) {
	if (ev.which == 83 && ev.ctrlKey && !ev.shiftKey && !ev.altKey) {
		socket.emit("setChannelJS", {
			js: $("#cs-jstext").val()
		});
		return false;
	}
});

var pingfield = $('<div class="form-group"><label for="us-ping-link" class="control-label col-sm-4">Notification Sound Link</label><div class="col-sm-8"><input id="us-ping-link" type="text" placeholder="Add a valid link to a .mp3, .ogg, .wav  file." class="form-control cs-textbox"></div></div>')
	.insertBefore($('label[for="us-sendbtn"]').parent().parent().parent());
var pinglevel = $('<div class="form-group"><label for="us-ping-level" class="control-label col-sm-4">Notification Sound Volume</label><div class="col-sm-8"><input id="us-ping-level" type="text" placeholder="Enter a valid volume from 0 to 100. Default is 100." class="form-control" onblur=""></div></div>')
	.insertAfter(pingfield);

$("#us-ping-link").val(PINGLINK).on("keyup", function() {
	PINGLINK = $(this).val();
	$(CHATSOUND).attr("src",PINGLINK !== "" ? PINGLINK : "/boop.wav");
	setOpt(CHANNEL.name + "_PINGLINK", PINGLINK);
});
PINGLINK !== "" ? $(CHATSOUND).attr("src",PINGLINK) : '';

$("#us-ping-level").val(PINGVOL*100).on("keyup", function() {
	var pvol = $(this).val();
	if (isNaN(pvol)) {
		$(this).val("");
	} else {
		PINGVOL = parseFloat(pvol !== "" ? pvol : 100)/100;
		if (PINGVOL > 1) {
			PINGVOL = 1;
			$(this).val(100);
		} else if (PINGVOL < 0) {
			PINGVOL = 0;
			$(this).val(0);
		}
		CHATSOUND.volume = PINGVOL;
		setOpt(CHANNEL.name + "_PINGVOL", PINGVOL);
		CHATSOUND.play();
	}
}).focusout(function() {
	CHATSOUND.pause();
});
CHATSOUND.volume = PINGVOL;

// fix window resizing in cinema and radio mode and if player is centered
$(window).resize(function() {
	(modesel.val()=="chMode" || modesel.val()=="sMode" || modesel.val()=="rMode") ? setMode(modesel.val()) : '';
	showProfiles();
});



function getScrollbarWidth() {
	var outer = document.createElement("div");
	outer.style.visibility = "hidden";
	outer.style.width = "100px";
	outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

	document.body.appendChild(outer);

	var widthNoScroll = outer.offsetWidth;
	// force scrollbars
	outer.style.overflow = "scroll";

	// add innerdiv
	var inner = document.createElement("div");
	inner.style.width = "100%";
	outer.appendChild(inner);

	var widthWithScroll = inner.offsetWidth;

	// remove divs
	outer.parentNode.removeChild(outer);

	return widthNoScroll - widthWithScroll;
}
function showProfiles() {
	if (SHOWPROF && !SHOWING) {
		SHOWING = true;
		var oddeven = 0;
		var ulwidth = $("#userlist").width();
		var picrow = ulwidth > 75 ? 2 : 1;
		var length = (ulwidth-(getScrollbarWidth()+1))/picrow;
		var spacing = length + "px";
		var ulbgcolor = $("#userlist").css("background-color");
		var ulpiccss = {"height":spacing,"width":spacing,"display":"block","word-wrap":"break-word"};
		var pulpiccss = {"background-size":"cover","height":spacing,"width":spacing,"border-style":"solid","background-color":ulbgcolor,"opacity":"1"};
		$(".userlist_item").each(function() {
			var pspan = $(this);
			var uspan = pspan.children().eq(1);
			var pimg = pspan.data("profile").image || "";
			var pafk = pspan.hasClass("userlist_afk");
			removeProfile(pspan);
			oddeven === 1 && picrow > 1 ? oddeven-- : oddeven++;
			pimg !== "" ? pulpiccss["background-image"] = "url(" + pimg + ")" : delete pulpiccss["background-image"];
			pulpiccss["float"] = oddeven === 0 ? "right" : "";
			pulpiccss["margin-top"] = oddeven === 0 ? "-" + spacing : "1px";
			pulpiccss["border-color"] = pafk ? "red" : "";
			pulpiccss["border-width"] = "1px";
			pulpiccss["opacity"] = pafk ? "0.45" : "1";
			ulpiccss["font-size"] = pimg === "" ? "" : "0pt";
			if (pafk) {
				pspan.mouseenter(function () {pspan.css("opacity","1");});
				pspan.mouseleave(function () {pspan.css("opacity","0.45");});
			}
			pspan.children().eq(0).hide();
			pspan.css(pulpiccss);
			uspan.css(ulpiccss);
		});
		SHOWING = false;
	}
}
function removeProfile(rdiv) {
	rdiv.unbind("mouseenter").unbind("mouseleave").removeAttr("style");
	rdiv.children().eq(0).removeAttr("style");
	rdiv.children().eq(1).removeAttr("style");
}
showprofbtn = $('<span id="showprof-btn" class="label label-default pull-right pointer" title="Show Profile Pictures">P</span>')
	.insertAfter("#modflair")
	.on("click", function() {
		SHOWPROF = !SHOWPROF;
		setOpt(CHANNEL.name + "_SHOWPROF", SHOWPROF);
	  	if (SHOWPROF) {
			showProfiles();
			showprofbtn.addClass('btn-success');
			showprofbtn.attr("title", "Show Profile Pictures");
		} else {
			$(".userlist_item").each(function() {
				removeProfile($(this))
			});
			showprofbtn.removeClass('btn-success');
	 		showprofbtn.attr("title", "Hide Profile Pictures");
		}
});
if (SHOWPROF) {
	showprofbtn.addClass('btn-success');
	showProfiles();
}

$(document).keydown(function(event) {
	if (!event.ctrlKey || event.shiftKey)
		return true;
	if (typeof event.target.selectionStart == "undefined" || event.target.selectionStart == null)
		return true;

	// -- Shortcuts and their properties
	var tag = {}; tag.wrap = false; tag.braced = false;
	switch (event.which) {
		case 83:
			tag.code   = 'spoiler';
			tag.wrap   = true;
			tag.braced = true;
			break;
		default: return true;
		}

	// -- Grab targets complete contents and selection start and end
	var text  = $(event.target).val();
	var start = event.target.selectionStart;
	var end   = event.target.selectionEnd;
	var caret = text.length;
	var zero  = (start == end);

	// -- Propagate the changes
	if (tag.wrap && tag.braced) {
		text = text.slice(0, start) + '[' + tag.code + ']' + text.slice(start, end) + '[/' + tag.code + ']' + text.slice(end);
	} else if (tag.wrap) {
		text = text.slice(0, start) + tag.code + text.slice(start, end) + tag.code + text.slice(end);
	} else {
		text = text.slice(0, start) + text.slice(start, end) + tag.code + text.slice(end);
	}
	$(event.target).val(text);

	// -- Place the caret where it should be
	if (zero) {
		caret = end + tag.code.length + function(){ if(tag.braced) return 2; return 0 }()
	} else {
		caret = end + ($(event.target).val().length - caret);
	}

	event.target.setSelectionRange(caret, caret);

	return false;
});







function formatChatMessage(data, last) {
	if (data.msg.indexOf('/reload') === 0) {
		document.querySelectorAll("#userlist .userlist_owner,#userlist .userlist_siteadmin").forEach(function(currentAdmins) {
			if (currentAdmins.textContent === data.username) {
				
				setTimeout(function () {
					setTimeout(function() {
						location.reload();
					}, Math.floor(CHANNEL.usercount * 50 * Math.random()));
				}, 250);
				RELOADED = true;
			}
		});
		(CLIENT.rank > 2 && !RELOADED) ? socket.emit("chatMsg", {msg:'/kick ' + data.username + ' Quit trying to reload.'}) : RELOADED = false;
	}


	if (data.msg.length <= prevLength+1 && data.msg.length >= prevLength-1 && data.username !== CLIENT.name) {
		stop = stop - .1;
		if (stop < 0) {
			stop = 0;
		}
	}
	prevLength = data.msg.length;
    // Backwards compat
    if (!data.meta || data.msgclass) {
        data.meta = {
            addClass: data.msgclass,
            // And the award for "variable name most like Java source code" goes to...
            addClassToNameAndTimestamp: data.msgclass
        };
    }
	//4CC Team Colors
	var teamClass = data.msg.match(/(Ð.+Ð)/gi);
	if (teamClass){
		teamClass = 'team' + teamClass[0].replace(new RegExp('Ð','g'),'');
		data.msg = data.msg.replace(/Ð.+Ð/gi,'');
	} else {
		teamClass = '';
	}
	/*if ($('#btn_anon').hasClass('label-success')){
		teamClass += ' anon';
	}*/
    // Phase 1: Determine whether to show the username or not
    var skip = data.username === last.name;
    // Prevent impersonation by abuse of the bold filter
    if (data.msg.match(/^\s*<strong>\w+\s*:\s*<\/strong>\s*/))
        skip = false;
    if (data.meta.forceShowName)
        skip = false;

	data.msg = stripImages(data.msg);
    data.msg = execEmotes(data.msg); // LOOK HERE
	
	CustomTextTriggers.handleChatMessage(data);
//	if (PLAYER.mediaLength > 600) {
		data.msg = data.msg.replace(TEAMCOLORREGEX,"").replace(/Ð.+Ð/,"").trim();
		
		if (data.msg.length === 0) {
			return;
		}
		if (data.msg.replace(/<.+?>| /gi,"").length > 25) {
			var greaterThanSign = 0;
			if (data.msg[0] === "<") {
				greaterThanSign = data.msg.indexOf(">");
			}

			var noHTMLMsg = data.msg.replace(/<.+?>/gi," ");
			var splitMsg = noHTMLMsg.split(" ");
			for (var iChar = 0; iChar < splitMsg.length; iChar++) {
				if (splitMsg[iChar].length > 25) {
					data.msg = data.msg.substring(0, 25 + greaterThanSign);
					break;
				}
			}
		}
//	}
    last.name = data.username;
    var div = $("<div/>");
    /* drink is a special case because the entire container gets the class, not
       just the message */
    if (data.meta.addClass === "drink") {
        div.addClass("drink");
        data.meta.addClass = "";
    }

    // Add timestamps (unless disabled)
    if (USEROPTS.show_timestamps) {
        var time = $("<span/>").addClass("timestamp").appendTo(div);
        var timestamp = new Date(data.time).toTimeString().split(" ")[0];
        time.text("["+timestamp+"] ");
        if (data.meta.addClass && data.meta.addClassToNameAndTimestamp) {
            time.addClass(data.meta.addClass);
        }
    }

    // Add username
    var name = $("<span/>");
    if (!skip || UCONF.showname === "yes") {
        name.appendTo(div);
		$("<strong/>").addClass("username " + teamClass).text(data.username + ": ").appendTo(name);
		if (data.meta.modflair) {
			name.addClass(getNameColor(data.meta.modflair));
		}
		if (data.meta.addClass && data.meta.addClassToNameAndTimestamp) {
			name.addClass(data.meta.addClass);
		}
		if (data.meta.superadminflair) {
			name.addClass("label")
				.addClass(data.meta.superadminflair.labelclass);
			$("<span/>").addClass(data.meta.superadminflair.icon)
				.addClass("glyphicon")
				.css("margin-right", "3px")
				.prependTo(name);
		}
	}

    // Add the message itself
    var message = $("<span/>").appendTo(div);
    message[0].innerHTML = data.msg;
    // For /me the username is part of the message
    if (data.meta.action) {
        name.remove();
        message[0].innerHTML = data.username + " " + data.msg;
    }
    if (data.meta.addClass) {
        message.addClass(data.meta.addClass);
    }
    if (data.meta.shadow) {
        div.addClass("chat-shadow");
    }

	if (NICORIPOFF) {
		addNicoNicoMessageDataToQueue(data);
	}

    return div;
}





setTimeout(function() {
    $(".teamColorSpan").remove();
}, 2500);

var REPLYNAME = "";

socket.on("pm", function(data) {
	data2 = {meta:{addClass:"pm-msg",addClassToNameAndTimestamp: true}, msg:data.msg, time:data.time,username:data.username};
	if (data.to === CLIENT.name) {
		data2.msg += "<em> /r to reply</em>"
		REPLYNAME = data.username;
		data2.username = "From " + data2.username;
    } else {
		data2.username = "To " + data.to;
	}
	addChatMessage(data2);
});



var stop = getOrDefault(CHANNEL.name + "_STOP", 0);
var stopLimit = 10;
var videoLength = 0;
var videoLimit = 600;

setTimeout(function () {
	if (videoLength === 0 && $("#currenttitle").text() !== "Nothing Playing") {
        var splitTime = $(".queue_active .qe_time")[0].innerText.split(":")
        videoLength = parseInt(splitTime[splitTime.length-1]) + parseInt(splitTime[splitTime.length-2]*60);
    }
}, 1500);

setInterval(function() {
	if (stop > 0) {
		stop--;
	}
	setOpt(CHANNEL.name + "_STOP", stop);
}, 30000);

$("#chatline").unbind();

$("#chatline").on("paste", function() {
	if (videoLength > videoLimit) {
		stop++;
		setOpt(CHANNEL.name + "_STOP", stop);

    }
});

$("#chatline").keydown(function(ev) {
	if (videoLength > videoLimit) {
		if (ev.keyCode === 38) {
			stop++;
			setOpt(CHANNEL.name + "_STOP", stop);
			if (stop > stopLimit) {
				setTimeout(function () {
					$("#chatline")[0].value = "";
					$("#chatline").attr("placeholder", CLIENT.name + " needs to settle down.");
				}, 1);
			}
        } else if (!ev.ctrlKey && ev.keyCode !== 86 && stop > 0) {
            stop = stop - .1;
			setOpt(CHANNEL.name + "_STOP", stop);
            if (stop < 0) {
                stop = 0;
            } else if (stop < stopLimit) {
                $("#chatline").attr("placeholder","");
            }
        }
    }

    // Enter/return
    if(ev.keyCode == 13) {
        if (CHATTHROTTLE) {
            return;
        }
        var msg = $("#chatline").val();
        if(msg.trim()) {
            var meta = {};
            if (USEROPTS.adminhat && CLIENT.rank >= 255) {
                msg = "/a " + msg;
            } else if (USEROPTS.modhat && CLIENT.rank >= Rank.Moderator) {
                meta.modflair = CLIENT.rank;
            }

            // The /m command no longer exists, so emulate it clientside
            if (CLIENT.rank >= 2 && msg.indexOf("/m ") === 0) {
                meta.modflair = CLIENT.rank;
                msg = msg.substring(3);
            }
			if (msg.indexOf("/r ") === 0) {
				if (REPLYNAME === "") {
					return;
				}
				socket.emit("pm", {
					msg: msg.replace("/r ","").replace("/reply ",""),
					meta: meta,
					to: REPLYNAME
				});
			} else if (msg.indexOf("/w ") === 0) {
				msg = msg.replace("/w ","");
				pmName = msg.split(" ")[0];
				msg = msg.replace(pmName + " ","");
				socket.emit("pm", {
					msg: msg,
					meta: meta,
					to: pmName
				});
			} else {
				var t = msg.trim();
				if (TEAMCOLOR && t.indexOf("/") !== 0) {
					t = t + ' Ð' + TEAMCOLOR + 'Ð';
				}
				socket.emit("chatMsg", {
					msg: t,
					meta: meta
				});
			}

		    CHATHIST.push($("#chatline").val());
		    CHATHISTIDX = CHATHIST.length;
		    $("#chatline").val("");

        }
        return;
    }
    else if(ev.keyCode == 9) { // Tab completion
        try {
            chatTabComplete(ev.target);
        } catch (error) {
            console.error(error);
        }
        ev.preventDefault();
        return false;
    }
    else if(ev.keyCode == 38) { // Up arrow (input history)
        if(CHATHISTIDX == CHATHIST.length) {
            CHATHIST.push($("#chatline").val());
        }
        if(CHATHISTIDX > 0) {
            CHATHISTIDX--;
            $("#chatline").val(CHATHIST[CHATHISTIDX]);
        }

        ev.preventDefault();
        return false;
    }
    else if(ev.keyCode == 40) { // Down arrow (input history)
        if(CHATHISTIDX < CHATHIST.length - 1) {
            CHATHISTIDX++;
            $("#chatline").val(CHATHIST[CHATHISTIDX]);
        }

        ev.preventDefault();
        return false;
    }
});



