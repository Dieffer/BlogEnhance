////////////////////// Forwarded clicks (see sshweblib/postprocess.py) ///

$(function() {
    setTimeout(function() {
	$('.forwarded-click').click(function(e) {
	    var dupof = $(this).data("dup");
	    $('#' + dupof).trigger(e);
	});
    }, 2200);
});

///////////////////// Local storage warning /////////////////////////////

(function() {
    var mod = "ssh-ls-test";
    try {
	localStorage.setItem(mod, mod);
	localStorage.removeItem(mod);
	window.ssh_ls_supported = true;
    } catch(e) {
	$(".localstorage-warning").css({display: "block"});
    }
})();

///////////////////// Cookie consent ////////////////////////////////////

var localStorageKey = "el1GQ6o71h4"; /* Unique id for our local data. */

/* Retrieves our data from local storage. */
function getLocalData() {
    if (!window.ssh_ls_supported) {
	return {};
    }
    var data = localStorage.getItem(localStorageKey);
    if (!data) {
	return {};
    }
    return JSON.parse(data);
}

/* Saves our data in local storage. */
function setLocalData(data) {
    if (window.ssh_ls_supported) {
	data = JSON.stringify(data);
	localStorage.setItem(localStorageKey, data);
    }
}

var showCookieTimer = null;
var consent_ver = 0;  // change this to require new consent from all

function markConsentShown() {
    if (!trk_get_visible()) {
	setTimeout(markConsentShown, 10000);
    } else {
	var text = $(".cookie-consent").text();
	var t = Date.now();
	var new_shown = [t, consent_ver, text];
	var new_data = getLocalData();
	new_data.cookieConsent = new_shown;
	setLocalData(new_data);
    }
}

function showCookieConsent() {
    if (showCookieTimer) {
	clearTimeout(showCookieTimer);
	showCookieTimer = null;
    }
    $(".cookie-consent").css({display: "inline-block"});
    setTimeout(markConsentShown, 10000);
}

/* Cookie consent message. */
(function() {
    if (!window.ssh_ls_supported) {
	// Local storage is not supported.  Thus no need to show a cookie
	// notice as nothing will be stored (and we would have no way to
	// track if it has already been displayed).
	return;
    }
    var data = getLocalData();
    var shown = data.cookieConsent;
    var ua = navigator.userAgent;
    var is_bot = (ua.indexOf("Googlebot") >= 0 || ua.indexOf("AdsBot") >= 0 ||
		  ua.indexOf("Mediapartners-Google") >= 0 ||
		  ua.indexOf("Bingbot") >= 0 ||
		  ua.indexOf("DuckDuckBot") >= 0 ||
		  ua.indexOf("Baiduspider") >= 0 ||
		  ua.indexOf("YandexBot") >= 0 ||
		  ua.indexOf("Sogou") >= 0 ||
		  ua.indexOf("Exabot") >= 0 ||
		  ua.indexOf("facebookexternalhit") >= 0 ||
		  ua.indexOf("facebot") >= 0 ||
		  ua.indexOf("ia_archiver") >= 0);
    var t = Date.now();
    if (!is_bot &&
	(!shown || !$.isArray(shown) ||
	 shown[1] != consent_ver)) {
	showCookieTimer = setTimeout(showCookieConsent, 2000);
    }
})();

///////////////////// scoped CSS compat code, needed for /manuals/

// From: http://thomaspark.co/2015/07/polyfill-for-scoped-css/
// This is needed for /manuals/ and other product manual pages.
function init(){var e=document.createElement("style");e.appendChild(document.createTextNode("")),document.head.appendChild(e),e.sheet.insertRule("body { visibility: hidden; }",0)}function scoper(e,t){var n=new RegExp("([^\r\n,{}]+)(,(?=[^}]*{)|s*{)","g");return e=e.replace(n,function(e,n,d){return n.match(/^\s*(@media|@keyframes|to|from)/)?n+d:(n.match(/:scope/)&&(n=n.replace(/([^\s]*):scope/,function(e,t){return""===t?"> *":"> "+t})),n=n.replace(/^(\s*)/,"$1"+t+" "),n+d)})}function process(){var e=document.body.querySelectorAll("style[scoped]");if(0===e.length)return void(document.getElementsByTagName("body")[0].style.visibility="visible");for(var t=document.head||document.getElementsByTagName("head")[0],n=document.createElement("style"),d="",o=0;o<e.length;o++){var r=e[o],c=r.innerHTML;if(c&&"BODY"!==r.parentElement.nodeName){var a="scoper-"+o,s="#"+a,i=document.createElement("span");i.id=a;var l=r.parentNode,p=l.parentNode;p.replaceChild(i,l),i.appendChild(l),r.parentNode.removeChild(r),d+=scoper(c,s)}}n.styleSheet?n.styleSheet.cssText=d:n.appendChild(document.createTextNode(d)),t.appendChild(n),document.getElementsByTagName("body")[0].style.visibility="visible"}!function(){"use strict";"scoped"in document.createElement("style")||(init(),"complete"===document.readyState||"loaded"===document.readyState?process():document.addEventListener("DOMContentLoaded",process))}(),"undefined"!=typeof exports&&(exports.scoper=scoper);

/**********************************************************************
 * Saving history information in local storage on browser.  This does
 * not identify the person in any way, and we don't store the
 * information on the server side in an identifiable way without first
 * obtaining user permission.  However, we do pass some of this
 * information to the server for processing (without storing it there)
 * for offering the most relevant content to the user.
 **********************************************************************/

/* Creates a new pseudonym (essentially a 64-bit hex number) that
   can be used to correlate actions by the user but that is not identifiable
   to a specific person using any data accessible to us, even with the
   assistance of any third parties. */
function createPseudonym() {
    var u = "";
    var x = Date.now();
    var y = x / 1000;
    try {
	var array = new Uint32Array(2);
	window.crypto.getRandomValues(array);
	for (var i = 0; i < 2; i++) {
	    x = (x * 0x73534ecb) >>> 16;
	    u += ((array[i] ^ x) >>> 0).toString(16);
	}
    } catch (error) {
	for (var i = 0; i < 2; i++) {
	    x = (x * 0x73534ecb) >>> 16;
	    var v = Math.floor(0x100000000 * Math.random());
	    v = (v ^ x ^ y) >>> 0;
	    u += v.toString(16);
	}
    }
    return u;
}

function getQueryString() {
    var qs = window.location.href;
    if (qs.indexOf("?") >= 0) {
	qs = qs.replace(/.*\?/, "");
    } else {
	qs = "";
    }
    return qs;
}

/* Sets whether tracking this user's activities will be allowed. Calling
   this with `disallow` set to true will clear any accumulated tracking data
   and prevent collection of additional data. */
function setTracking(disallow) {
    var data = getLocalData();
    data.preventTracking = disallow;
    setLocalData(data);
}

//////////////////// Custom analytics code ///////////////////////////////

// Helper function for determining DOM element path.  This returns a
// path or selector for the jquery DOM element `target`.
function trk_path(target) {
    var path = [];
    while (target) {
	var tag = target.prop("tagName");
	if (!tag) {
	    break;
	}
	tag = tag.toLowerCase();
	var parent = target.parent();
	var idx = parent.children(tag).index(target);
	var id = target.attr("id");
	var cls = target.attr("class");
	var desc = tag;
	if (id) {
	    desc += "#" + id;
	}
	if (cls) {
	    cls = cls.split(" ");
	    cls = cls.join(".");
	    desc += "." + cls;
	}
	if (idx != 0) {
	    desc += "%" + idx;
	}
	path.push(desc);
	if (tag == "body") {
	    break;
	}
	target = parent;
    }
    path = path.reverse();
    path = path.join(" ");
    return path;
}

// Helper function, determines whether the window is visible
function trk_get_visible() {
    var hidden = false;
    if (typeof document.hidden !== "undefined") {
	hidden = document.hidden;
    } else if (typeof document.msHidden !== "undefined") {
	hidden = document.msHidden;
    } else if (typeof document.webkitHidden !== "undefined") {
	hidden = document.webkitHidden;
    }
    return hidden ? 0 : 1;
}

// Helper function, returns browser type
function trk_get_browser() {
    // Opera 8.0+
    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

    // Firefox 1.0+
    var isFirefox = typeof InstallTrigger !== 'undefined';

    // Safari 3.0+ "[object HTMLElementConstructor]"
    var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification);

    // Internet Explorer 6-11
    var isIE = /*@cc_on!@*/false || !!document.documentMode;

    // Edge 20+
    var isEdge = !isIE && !!window.StyleMedia;

    // Chrome 1+
    var isChrome = !!window.chrome && !!window.chrome.webstore;

    // Blink engine detection
    var isBlink = (isChrome || isOpera) && !!window.CSS;

    return isOpera ? 'Opera' :
        isFirefox ? 'Firefox' :
        isSafari ? 'Safari' :
        isChrome ? 'Chrome' :
        isIE ? 'IE' :
        isEdge ? 'Edge' :
        "-";
}

// Helper function, returns platform type
function trk_get_platform() {
    if (navigator.platform) {
	return navigator.platform;
    } else {
	return "-";
    }
}

// Track mouse click positions for building heatmaps
var trk_positions = [];
var trk_clicks = [];
var trk_extra = [];
var trk_x = undefined;
var trk_y = undefined;
var trk_yofs = undefined;
var trk_body_w = undefined;
var trk_body_h = undefined;
var trk_inner_w = undefined;
var trk_inner_h = undefined;
var trk_t = Date.now();
var trk_prev_move = 0;
var trk_seq = 0;

function trk_push_extra_op(op) {
    var t = Date.now();
    trk_extra.push(op);
    trk_extra.push(t - trk_t);
}

function trkEvent(e) {
    var t = Date.now();
    var x = e.pageX;
    var y = e.pageY;
    var yofs = window.pageYOffset;
    var interval = t - trk_prev_move;
    var min_interval = 100;
    if (trk_positions.length >= 1000 / 5) {
	min_interval = 1000;
    }
    if (interval >= min_interval &&
	(x != trk_x || y != trk_y ||
	 yofs != trk_yofs)) {
	trk_positions.push(t - trk_t);
	trk_positions.push(x);
	trk_positions.push(y);
	trk_positions.push(yofs);
	trk_prev_move = t;
	trk_yofs = yofs;
	trk_x = x;
	trk_y = y;
    }
    trk_reset_freq();
}
$(document).on("mousemove", trkEvent);
$(document).on("scroll", trkEvent);
$(document).on("click", function (e) {
    trk_reset_freq();
    var x = e.pageX;
    var y = e.pageY;
    var cx = e.clientX;
    var cy = e.clientY;
    var which = e.which;
    var path = trk_path($(e.target));
    var t = Date.now();
    trk_clicks.push(which);
    trk_clicks.push(x);
    trk_clicks.push(y);
    trk_clicks.push(cx);
    trk_clicks.push(cy);
    trk_clicks.push(path);
    trk_clicks.push(t - trk_t);
});
$(document).on("mouseenter", function(e) {
    trk_reset_freq();
});
$(document).on("pagehide", function(e) {
    trk_push_extra_op("closed-by-back");
});
$(document).on("popstate", function(e) {
    trk_push_extra_op("returned-by-back");
});
$(document).on("beforeprint", function(e) {
    trk_push_extra_op("print");
});

// Track how far videos have been played
var yt_players = [];
var yt_ids = [];
var yt_api_ready = false;
function trk_onPlayerReady(e) {
    var player = e.target;
    var video_id = player.getIframe().id;
    yt_players.push(player);
    yt_ids.push(video_id);
    return true;
}
function trk_onStateChange(e) {
    var video_id = "";
    for (var i = 0; i < yt_players.length; i += 1) {
	if (yt_players[i] === e.target) {
	    video_id = yt_ids[i];
	    break;
	}
    }
    if (e.data == YT.PlayerState.PLAYING) {
	ga('send', 'event', 'Video', 'play');
	trk_push_extra_op("youtube-play");
	trk_extra.push(video_id);
    } else if (e.data == YT.PlayerState.ENDED) {
	ga('send', 'event', 'Video', 'end');
	trk_push_extra_op("youtube-ended");
	trk_extra.push(video_id);
    } else if (e.data == YT.PlayerState.PAUSED) {
	ga('send', 'event', 'Video', 'pause');
	trk_push_extra_op("youtube-paused");
	trk_extra.push(video_id);
    }
    trk_reset_freq();
    return true;
}
function onYouTubeIframeAPIReady() {
    yt_api_ready = true;
    trk_update_tracked_videos();
    initVideoPosters();
}
function trk_update_tracked_videos() {
    if ($(".video-container iframe").length == 0) {
	return;
    }
    /* Ensure the YouTube API has been loaded. */
    if (!("YT" in window)) {
	var tag = document.createElement('script');
	tag.src = "https://www.youtube.com/iframe_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    /* Update which videos are being tracked. */
    if ("YT" in window && "Player" in YT) {
	$(".video-container iframe").each(function() {
	    var v = $(this);
	    if (v.data("trk_enabled")) {
		return;
	    }
	    v.data("trk_enabled", true);
	    var video_id = v.attr("id");
	    var player = new YT.Player(video_id, {
		events: {
		    onReady: trk_onPlayerReady,
		    onStateChange: trk_onStateChange
		}
	    });
	});
    }
}
trk_update_tracked_videos();

// Generates video playing status report
function trk_get_video_st() {
    var video_st = [];
    var cnt = yt_players.length;
    var active = false;
    for (var i = 0; i < cnt; i += 1) {
	var player = yt_players[i];
	var st = player.getPlayerState();
	if (st == YT.PlayerState.PLAYING) {
	    active = true;
	}
	video_st.push(yt_ids[i]);
	video_st.push(st);
	video_st.push(Math.floor(player.getCurrentTime()));
	video_st.push(Math.floor(player.getDuration()));
    }
    return [active, video_st];
}

// Generates chat status report
function trk_chat_st() {
    var chat = $(".olrk-available");
    var statediv = chat && chat.find("#habla_window_state_div");
    var cls = statediv && statediv.attr("class");
    var win = chat && chat.find("#habla_window_div");
    var chat_shown = win && win.css("display") != "none";
    var chat_open = cls && cls.indexOf("olrk-state-expanded") >= 0;
    var prechat = chat && chat.find("#habla_pre_chat_div");
    var in_prechat = prechat && prechat.css("display") != "none";
    var conv = win && win.find("#habla_conversation_div");
    var conv_sent = conv && conv.find(".habla_conversation_person1").length > 0;
    var conv_answered = conv && conv.find(".habla_conversation_person2").length > 0;
    var conv_ended = conv && conv.find(".habla_conversation_notification").length > 0;
    var sane = chat && statediv && win && conv;
    sane = sane ? 1 : 0;
    chat_shown = chat_shown ? 1 : 0;
    chat_open = chat_open ? 1 : 0;
    in_prechat = in_prechat ? 1 : 0;
    conv_sent = conv_sent ? 1 : 0;
    conv_answered = conv_answered ? 1 : 0;
    conv_ended = conv_ended ? 1 : 0;
    if (!sane || !chat_shown || chat_open || conv_sent || conv_answered ||
	conv_ended) {
	return [sane, chat_open, in_prechat, conv_sent, conv_answered,
		conv_ended];
    }
    return [];
}
function trk_chat_msg() {
    var msgs = $("#habla_conversation_div p");
    var msg = "";
    if (msgs.length > 0) {
	msg = msgs.eq(msgs.length - 1).text();
	if (!msg && msgs.length > 1) {
	    msg = msgs.eq(msgs.length - 2).text();
	}
    }
}
function trk_chat_enter_st() {
    function get_value(selector) {
	var inputs = $(selector);
	for (var i = 0; i < inputs.length; i += 1) {
	    var v = $(inputs[i]).val();
	    if (v) {
		return v;
	    }
	}
	return "";
    }
    var name = get_value("#habla_name_input, #habla_pre_chat_name_input");
    var email = get_value("#habla_offline_email_input, #habla_pre_chat_email_input");
    var phone = get_value("#habla_offline_phone_input, #habla_pre_chat_phone_input");
    var msg = get_value("#habla_offline_body_input, #habla_wcsend_input");
    if (!name && !email && !phone && !msg) {
	return [];
    }
    return ["chat", name, email, phone, msg];
}
function trk_chat_click_st(target) {
    var id = target.attr("id");
    if (id == "habla_pre_chat_submit_input" ||
	id == "habla_offline_submit_input") {
	return trk_chat_enter_st();
    }
    return [];
}

function trk_hubspot_st(target) {
    var form = target ? target.parents(".hbspt-form") : $(".hbspt-form");
    if (form.length == 0) {
	return [];
    }

    function get_hubspot_value(inputname) {
	var input = form.find("input[name=" + inputname + "]");
	var v = input && input.val();
	if (!input) {
	    return "";
	}
	return v;
    }

    var url = form && form.attr("action");
    if (!url) {
	url = "";
    }
    var first_name = get_hubspot_value("firstname");
    var last_name = get_hubspot_value("lastname");
    var name = "";
    if (first_name && last_name) {
	name = first_name + " " + last_name;
    } else if (first_name) {
	name = first_name;
    } else if (last_name) {
	name = last_name;
    }
    var email = get_hubspot_value("email");
    var phone = get_hubspot_value("phone");
    var company = get_hubspot_value("company");
    var jobtitle = get_hubspot_value("jobtitle");
    if (!name && !email && !phone && !company && !jobtitle) {
	return [];
    }
    return ["hubspot", name, email, phone, company, jobtitle, url];
}

function trk_cta_st(target) {
    var cta = target.parents(".cta");
    var href = target.attr("href")
    if (cta.length == 0 || !href || href.endsWith("legal/notices")) {
	return [];
    }
    var cta_path = trk_path(cta);
    function get_value(inputname) {
	var input = cta.find("input[name=" + inputname + "]");
	var v = input && input.val();
	if (!input) {
	    return "";
	}
	return v;
    }
    var email = get_value("email");
    var name = get_value("name");
    var phone = get_value("phone");
    var company = get_value("company");
    var jobtitle = get_value("jobtitle");
    if (!name && !email && !phone && !company && !jobtitle) {
	return [];
    }

    return ["cta", name, email, phone, company, jobtitle];
}

function trk_push_once_per_page() {
    var c = document.cookie.split(";");
    function g(name, event_name) {
	name += "=";
	for (var i = 0; i < c.length; i += 1) {
	    var v = $.trim(c[i]);
	    if (v.startsWith(name)) {
		v = v.substring(name.length, v.length);
		trk_extra.push(event_name);
		trk_extra.push(v);
		return;
	    }
	}
    }
    g("_ga", "ga");
    g("hblid", "olark");
    g("hubspotutk", "utk");
    var hubspot_st = trk_hubspot_st(null);
    if (hubspot_st.length > 0) {
	trk_extra = trk_extra.concat(hubspot_st);
    }
    $(".cta").each(function() {
	var cta = $(this);
	if (cta.css("display") == "none") {
	    return;
	}
	var path = trk_path(cta);
	trk_extra.push("cta-present");
	trk_extra.push(path);
    });
}

// Sends tracking report to server (result read from CloudFront access
// logs; the report does not need to reach origin server)
// Returns true if more than minimum data sent (i.e., some activity).
function trk_send(sync, extra) {
    var final_trk = 0;
    if (sync) {
	final_trk = 1;
    }
    var path = window.location.pathname;
    var visible = trk_get_visible();
    var data = [trk_seq, trk_t, final_trk, visible, path];
    var min_len = data.length;
    // Add click tracking data, if any
    if (trk_clicks.length > 0) {
	data.push(1);
	data.push(trk_clicks.length);
	data = data.concat(trk_clicks);
    }
    // Add position tracking data, if any
    if (trk_positions.length) {
	data.push(2);
	data.push(trk_positions.length);
	data = data.concat(trk_positions);
    }
    // Add video playing status, if any
    var video_stx = trk_get_video_st();
    var video_active = video_stx[0];
    var video_st = video_stx[1];
    if (video_st.length > 0) {
	data.push(3);
	data.push(video_st.length);
	data = data.concat(video_st);
	min_len += video_st.length + 2; // Allow reducing rate if not active
    }
    // Add information about window size, if it has changed
    var w = document.body.clientWidth;
    var h = document.body.clientHeight;
    var iw = window.innerWidth;
    var ih = window.innerHeight;
    var ow = window.outerWidth;
    var oh = window.outerHeight;
    if (w != trk_body_w || h != trk_body_h ||
	iw != trk_inner_w || ih != trk_inner_h ||
	ow != trk_outer_w || oh != trk_outer_h) {
	trk_body_w = w;
	trk_body_h = h;
	trk_inner_w = iw;
	trk_inner_h = ih;
	trk_outer_w = ow;
	trk_outer_h = oh;
	data.push(4);
	data.push(trk_inner_w);
	data.push(trk_inner_h);
	data.push(trk_outer_w);
	data.push(trk_outer_h);
	data.push(trk_body_w);
	data.push(trk_body_h);
    }
    // Add extra (link, submit, enter press, etc info).
    extra = trk_extra.concat(extra);
    trk_extra = [];
    if (extra.length > 0) {
	data.push(99);
	data = data.concat(extra);
    }

    // Encode data items, in case some contains unexpected characters
    safedata = [];
    for (var i = 0; i < data.length; i += 1) {
	if (data[i] == undefined) {
	    safedata.push("");
	} else {
	    safedata.push(encodeURIComponent(data[i]));
	}
    }

    /// Send the status message
    trk_seq += 1;
    trk_positions = [];
    trk_clicks = [];
    trk_t = Date.now();
    var url = "/trk?v=" + safedata.join(",");
    $.ajax({
	url: url,
	method: "GET",
	async: !sync
    });
    return data.length != min_len || video_active;
}

// This function is called periodically to send the tracking report
var trk_idle_count = 0;
var trk_base_interval = 5000; // milliseconds
var trk_max_interval = 59 * 60 * 1000; // milliseconds
var trk_first_adjust = 20000; // milliseconds
var trk_adjust_ticks = trk_first_adjust / trk_base_interval;
var trk_tick_interval = trk_base_interval;
var trk_tick_id;
function trk_reset_freq() {
    if (trk_tick_interval > trk_base_interval) {
	trk_idle_count = 0;
	trk_tick_interval = trk_base_interval;
	clearInterval(trk_tick_id);
	trk_tick_id = setInterval(trkTick, trk_tick_interval);
    }
}
function trkTick() {
    trk_idle_count += 1;
    if (trk_send(false, [])) {
	trk_reset_freq();
    } else if (trk_idle_count > trk_adjust_ticks) {
	trk_tick_interval = 2 * trk_tick_interval;
	if (trk_tick_interval > trk_max_interval) {
	    trk_tick_interval = trk_max_interval;
	}
	trk_idle_count = 0;
	clearInterval(trk_tick_id);
	trk_tick_id = setInterval(trkTick, trk_tick_interval);
    }
}

// Add initial data for tracking.
trk_extra.push("init");
trk_extra.push(window.screen.availWidth);
trk_extra.push(window.screen.availHeight);
trk_extra.push(trk_get_browser());
trk_extra.push(trk_get_platform());
trk_extra.push("");
trk_tick_id = setInterval(trkTick, trk_tick_interval);

// Send report on closing window or moving away from the page (this is
// suppressed when just following site-internal link to avoud double
// reporting) and to speed up internal transitions.
window.onbeforeunload = function() {
    trk_send(true, []);
};

// Binds reporting function to links and submit buttons on the page.  This
// is called several times, because some content on the page may be loaded
// dynamically (e.g., HubSpot forms).
function trk_bind_links() {
    $("a").on("click", function(e) {
	trk_reset_freq();
	var target = $(e.target);
	var url = target.attr("href");
	if (!url) {
	    url = ""
	}
	var text = target.text();
	var path = trk_path($(e.target));
	var which = e.which;
	var cx = e.clientX;
	var cy = e.clientY;
	var x = e.pageX;
	var y = e.pageY;
	var t = Date.now();
	var cls = target.attr("class");
	var msgtype = "link";
	if (cls && cls.indexOf("dropdown-toggle") >= 0) {
	    msgtype = "menu-open";
	} else if (cls && cls.indexOf("nav-link") >= 0) {
	    if (target.closest(".dropdown-menu").length > 0) {
		msgtype = "menu-select";
	    } else {
		msgtype = "menu-link";
	    }
	} else if (target.closest(".ssh-logo").length > 0) {
	    msgtype = "logo-link";
	} else if (target.closest(".breadcrumb").length > 0) {
	    msgtype = "breadcrumb-link";
	}
	if (target.closest("cta-item").length > 0) {
	    msgtype = "cta-item";
	    /* Save call-to-action in local data for next page. */
	    var local = getLocalData();
	    local.cta = cta.attr("id");
	    setLocalData(local);
	} else {
	    /* Clear call-to-action in local data. */
	    var local = getLocalData();
	    if (local.cta) {
		local.cta = null;
		setLocalData(local);
	    }
	}
	var extra = [msgtype, t - trk_t, url, text, which, x, y, cx, cy, path];
	var chat_st = trk_chat_click_st(target);
	if (chat_st.length > 0) {
	    extra = extra.concat(chat_st);
	}
	var hubspot_st = trk_hubspot_st(target);
	if (hubspot_st.length > 0) {
	    extra = extra.concat(hubspot_st);
	}
	var cta_st = trk_cta_st(target);
	if (cta_st.length > 0) {
	    extra = extra.concat(cta_st);
	}
	if (url &&
	    target.attr("target") != "_blank" &&
	    !url.startsWith("#") &&
	    !url.startsWith("https:") &&
	    !url.startsWith("http:") &&
	    !url.startsWith("mailto:")) {
	    // It is an internal link.  They replace current page.
	    window.onbeforeunload = null;
	    trk_send(true, extra);
	    ga('send', 'event', 'nav', msgtype, url, {
		'transport': 'beacon',
		'hitCallback': function() {
		    document.location = url;
		}
	    });
	} else {
	    // It is an outbound external link or a link with target="_blank".
	    // Such links open new tab.
	    trk_extra = trk_extra.concat(extra);
	    ga('send', 'event', 'Outbound link', msgtype);
	}
	return true;
    });
    $("input[type=submit], button[type=submit]")
	.on("click", function(e) {
	    trk_reset_freq();
	    var target = $(e.target);
	    var tag = target.prop("tagName").toLowerCase();
	    var form = target.closest("form");
	    var url = form && form.attr("action");
	    if (!url) {
		url = "";
	    }
	    var text;
	    if (tag == "input") {
		text = target.val();
	    } else {
		text = target.text();
	    }
	    var path = trk_path($(e.target));
	    var which = e.which;
	    var cx = e.clientX;
	    var cy = e.clientY;
	    var x = e.pageX;
	    var y = e.pageY;
	    var t = Date.now();
	    var extra = ["submit", t - trk_t, url, text, which,
			 x, y, cx, cy, path];
	    var chat_st = trk_chat_click_st(target);
	    if (chat_st.length > 0) {
		extra = extra.concat(chat_st);
	    }
	    var hubspot_st = trk_hubspot_st(target);
	    if (hubspot_st.length > 0) {
		extra = extra.concat(hubspot_st);
	    }
	    var cta_st = trk_cta_st(target);
	    if (cta_st.length > 0) {
		extra = extra.concat(cta_st);
	    }
	    var final = !!url;
	    if (url && url.startsWith("https://forms.hubspot.com/")) {
		final = false;
	    }
	    trk_send(final, extra);
	    if (final) {
		ga('send', 'event', 'Submit', 'submit', url, {
		    'transport': 'beacon',
		    'hitCallback': function() {
			e.preventDefault();
			form.submit();
		    }
		});
	    } else {
		ga('send', 'event', 'Submit', 'click', url);
	    }
	    return true;
	});
}
trk_bind_links();
setTimeout(trk_bind_links, 1000);  // Once hubspot forms etc loaded
setTimeout(trk_bind_links, 5000);
setTimeout(trk_bind_links, 10000);
$(document).on("keypress", function(e) {
    trk_reset_freq();
    var target = $(e.target);
    var key = e.key;
    if (key != "Enter") {
	return;
    }
    var path = trk_path($(e.target));
    var t = Date.now();
    var extra = ["key", key, t - trk_t, path];
    var chat_st = trk_chat_enter_st();
    if (chat_st.length > 0) {
	extra = extra.concat(chat_st);
    }
    trk_send(false, extra);
    return true;

});

function trk_olark() {

    function trk_chat_event(event_name, broad) {
	trk_reset_freq();
	var t = Date.now();
	var extra = [event_name, t - trk_t];
	if (broad) {
	    var chat_st = trk_chat_enter_st();
	    if (chat_st.length > 0) {
		extra = extra.concat(chat_st);
	    }
	} else {
	    extra.push(trk_chat_msg());
	}
	trk_extra = trk_extra.concat(extra);
	return true;
    }

    setTimeout(function() {
	trk_chat_event("chat-loaded", true);
    }, 5000);

    $("#havla_offline_submit_input").on("click", function() {
	ga('send', 'event', 'chat', 'submit-offline');
	return trk_chat_event("chat-offline-submit", true);
    });

    olark("api.chat.onBeginConversation", function() {
	ga('send', 'event', 'chat', 'begin');
	return trk_chat_event("chat-begin", true);
    });

    olark("api.chat.onMessageToOperator", function() {
	setTimeout(function() {
	    trk_chat_event("chat-msg-to-operator", false);
	    ga('send', 'event', 'chat', 'msg-to-operator');
	}, 1000);
	return true;
    });

    olark("api.chat.onMessageToVisitor", function() {
	setTimeout(function() {
	    trk_chat_event("chat-msg-to-visitor", false);
	    ga('send', 'event', 'chat', 'msg-to-visitor');
	}, 1000);
	return true;
    });

    olark("api.chat.onOperatorsAvailable", function() {
	return trk_chat_event("chat-operators-available", true);
    });

    olark("api.chat.onOperatorsAway", function() {
	return trk_chat_event("chat-operators-away", true);
    });
}

setTimeout(trk_push_once_per_page, 8000);

$(window).on("load", function() {
    if (trk_load_t) {
	var t = Date.now();
	trk_extra.push("load-time");
	trk_extra.push(t - trk_load_t);
    }
});

//////////////////// Calls-to-action ////////////////////////////////////////

var slideDuration = 700; /* Duration of sliding action */
var slideDelay = 5000; /* Delay for banner shown when initially visible */
var anywayDelay = 20000; /* Delay after which show even if not at bottom */

function registerCTA() {
    var cta = $(this);
    if (cta.data("cta-used")) {
	return;  // Re-registering
    }

    /* Check if data-path and data-exact-path attributes enable the CTA
       for this page. */
    var prefix = cta.data("prefix");
    var exact_path = cta.data("path");
    var path = window.location.pathname;
    var found_prefix = false;
    var found_exact_path = false;
    if (prefix) {
	var prefixes = prefix.split(" ");
	for (var i in prefixes) {
	    if (path.startsWith(prefixes[i])) {
		found_prefix = true;
		break;
	    }
	}
    }
    if (exact_path && exact_path == path) {
	found_exact_path = true;
    }
    if (prefix || exact_path) {
	if (!found_prefix && !found_exact_path) {
	    /* The CTA has data-prefix or data-exact-path, and they do not
	       match.  Ignore this CTA. */
	    cta.css({"display": "none"});
	    return;
	}
    }

    /* Make sure we only display one call-to-action per page. */
    if (window.cta) {
	console.log("More than one CTA on the page - only one will be used!");
	console.log(window.cta.clone().wrap('<p>').parent().html());
	console.log(cta.clone().wrap('<p>').parent().html());
	return;
    }
    window.cta = cta;
    cta.data("cta-used", true);

    var fraction = 0.80;
    var h;
    var w;
    var hiddenBottom = "auto";
    var shownBottom = "auto";
    var hiddenRight = "auto";
    var shownRight = "auto";
    var hiddenLeft = "auto";
    var shownLeft = "auto";
    var shown = false;
    var closed = false;
    var opened = false;
    var shownAnyway = false;
    var trigger = $("#cta-trigger");

    function isScrolledTo() {
	var viewTop = $(window).scrollTop();
	var viewBottom = viewTop + $(window).outerHeight();
	var elemTop = $(document).height() * fraction;
	if (trigger.length > 0) {
	    elemTop = $(trigger).offset().top - 30;
	}
	var ret = elemTop <= viewBottom;
	return ret;
    }
    function getTop(bottom) {
	if (hiddenBottom != "auto") {
	    return "auto";
	}
	var viewTop = $(window).scrollTop();
	var winHeight = $(window).outerHeight();
	var footer = $("footer");
	var bottom = footer.length > 0 ? footer.offset().top :
	    $(document).height();
	var top = bottom - viewTop;
	if (top <= 100 || top >= winHeight - h || viewTop > 0) {
	    return (winHeight - h) + "px";
	}
	return (top + 10) + "px";
    }
    function show() {
	if (!shown) {
	    cta.animate({bottom: shownBottom,
			 top: getTop(),
			 left: shownLeft,
			 right: shownRight},
			slideDuration);
	    shown = true;
	}
    }
    function hide() {
	if (shown) {
	    cta.animate({bottom: hiddenBottom,
			 top: getTop(),
			 left: hiddenLeft,
			 right: hiddenRight},
			slideDuration);
	    shown = false;
	}
    }
    function updateState() {
	if (shownAnyway && !closed) {
	    show();
	} else if (isScrolledTo() && !closed) {
	    show();
	} else {
	    hide();
	}
    }

    /* Add close button to CTA */
    var img = $('<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANAgMAAAAPhQzvAAAACVBMVEUODg7V1dX///8cxkkxAAAAI0lEQVQI12MIDQ11YMhatQqF0NICEh0g1qJVMBZYDFUdSC8A0bsWHUQEcqkAAAAASUVORK5CYII=" alt="Close">');
    function closeCTA() {
	closed = true;
	hide();
    }
    img.on("click", closeCTA);
    var div = $('<div class="cta-close"></div>');
    div.append(img);
    cta.append(div);

    function submitClick(e) {
	e.preventDefault();
	var target = $(e.target);
	var name = target.find('[name="name"]').val();
	var email = target.find('[name="email"]').val();
	var phone = target.find('[name="phone"]').val();
	var company = target.find('[name="company"]').val();
	var jobtitle = target.find('[name="jobtitle"]').val();
	var pagepath = window.location.pathname;
	var pagetitle = document.title;
	var local = getLocalData();
	if (name) {
	    local.name = name;
	}
	if (email) {
	    local.email = email;
	}
	if (phone) {
	    local.phone = phone;
	}
	if (company) {
	    local.company = company;
	}
	if (jobtitle) {
	    local.jobtitle = jobtitle;
	}
	setLocalData(local);
	var data = {
	    cta_keys: local.cta_keys,
	    email: email,
	    phone: phone,
	    name: name,
	    company: company,
	    jobtitle: jobtitle,
	    pagepath: pagepath,
	    consent: target.data("consent"),
	    pagetitle: pagetitle }
	$.post("/api/form/v1/", data)
	    .done(function() {
		var form = $(target).find(".cta-form");
		form.children().remove();
		form.append("<p>Your request has been submitted.</p>");
		form.append("<p>Thank you!</p>");
		setTimeout(closeCTA, 500);
	    })
	    .fail(function() {
		alert("Submitting the form failed.  Please use your work " +
		      "email, not a free email provider.  If you think this " +
		      "message unwarranted, please contact us by " +
		      "chat or call us and notify us of the problem.");
	    });
    }

    function checkEmail(target) {
	var email = target.val();
	var m = /^[-A-Za-z0-9$%!+=^~_.{|}\/]+@(([A-Za-z0-9-]+[.])+[A-Za-z0-9-][A-Za-z0-9-]+)$/.exec(email);
	var disabled = true;
	if (m) {
	    disabled = false;
	    /*
	    var domain = m[1];
	    if (domain.match(/^(outlook.com|gmail.com|inbox.com|icloud.com|mail.com|aol.com|yahoo.com|yahoo.com.(ar|au|br|cn|hk|is|mx|ru|sg)|yahoo.(de|dk|es|fr|ie|it|jp|ru|se)|yandex.ru)$/i)) {
		disabled = true;
	    } */
	}
	target.parent().find(".cta-button").prop("disabled", disabled);
    }

    /* If data-action attribute set, create a form with that as the action
       button.  If cta-ask-name class, ask for name (in addition to email). */
    var action = cta.data("action");
    if (action) {
	var form = '<form class="cta-form">';
	if (cta.hasClass("cta-ask-name")) {
	    form += '<input type="text" size="20" class="cta-field" name="name" placeholder="Your name">';
	}
	form += '<input type="text" size="20" class="cta-field" name="email" placeholder="Your work email*">' +
	    '<button class="cta-button" type="submit" disabled>' +
	    action + '</button>';
	if (cta.hasClass("cta-ask-phone") ||
	    cta.hasClass("cta-ask-company") ||
	    cta.hasClass("cta-ask-title")) {
	    form += '<br>';
	    if (cta.hasClass("cta-ask-phone")) {
		form += '<input type="text" size="20" class="cta-field" name="phone" placeholder="Your phone number">';
	    }
	    if (cta.hasClass("cta-ask-company")) {
		form += '<input type="text" size="20" class="cta-field" name="company" placeholder="Company name">';
	    }
	    if (cta.hasClass("cta-ask-phone")) {
		form += '<input type="text" size="20" class="cta-field" name="jobtitle" placeholder="Your job title / role">';
	    }
	}
	consent = '<p class="cta-notice">' +
	    'By submitting you consent to us reaching out to you and ' +
	    'tracking your interaction with us. ' +
	    'We may store your information in the United States. ' +
	    'You can cancel at any time. ' +
	    '<a href="/legal/notices" target="_blank">Details</a>' +
	    '</p></form>';
	form += consent;
	cta.append(form);
	cta.on("submit", submitClick);
	cta.find('[name="email"]').on("input", function(e) {
	    checkEmail($(e.target));
	});
	cta.find('.cta-form').data("consent", consent);
	var local = getLocalData();
	cta.find('[name="email"]').val(local.email);
	cta.find('[name="name"]').val(local.name);
	cta.find('[name="phone"]').val(local.phone);
	cta.find('[name="company"]').val(local.company);
	cta.find('[name="jobtitle"]').val(local.jobtitle);
	checkEmail(cta.find('[name="email"]'));
    }

    /* Interpret CTA style. */
    var h = cta.outerHeight();
    var w = cta.width();
    if (cta.hasClass("cta-bottom")) {
	hiddenBottom = -(h + 30) + "px";
	shownBottom = 0;
	hiddenRight = 0;
	shownright = 0;
    } else if (cta.hasClass("cta-right")) {
	hiddenRight = -(w + 30) + "px";
	shownRight = 0;
    } else if (cta.hasClass("cta-left")) {
	hiddenLeft = -(w + 30) + "px";
	shownLeft = 0;
    }

    /* Initially hide the CTA. */
    cta.css({bottom: hiddenBottom,
	     top: getTop(),
	     left: hiddenLeft,
	     right: hiddenRight});
    if (isScrolledTo() && $(window).scrollTop() == 0) {
	/* If page so small that it is immediately visible, show by timeout. */
	setTimeout(show, slideDelay);
    } else {
	updateState();
	/* Trigger the CTA to be shown anyway after some time. */
	setTimeout(function() {
	    shownAnyway = true;
	    updateState();
	}, anywayDelay);
    }
    $(window).scroll(function() {
	updateState();
    });
}

function registerCTAs() {
    $(".cta").each(registerCTA);
}

/* Proto:host for the API host.  This is used to prefix API URLs. */
// var apiprefix = "https://staging.ssh.com"; // XXX remove prefix 20170812 tatu
var apiprefix = "";

/* Start loading dynamic content as soon as the DOM is ready. */
$(function() {
    function gotResponse(data) {
	/* Save the keys used to get CTAs for this page. */
	var local = getLocalData();
	if (data.statisticalId) {
	    local.statisticalId = data.statisticalId;
	}
	setLocalData(local);

	/* Insert dynamic content onto the page. */
	if (data.head) {
	    $("head").append(data.head);
	}
	if (data.asideStart) {
	    $("aside").prepend(data.asideStart);
	}
	if (data.asideEnd) {
	    $("aside").append(data.asideEnd);
	}
	if (data.beginning) {
	    $("main").prepend(data.beginning);
	}
	if (data.end) {
	    $("main").append(data.end);
	}
	if (data.nav) {
	    $("#dynamic-nav").append(data.nav);
	}
	if (data.transparent) {
	    $("body").append(data.transparent);
	}
	if (data.call) {
	    $(".phone-icon").attr("href", data.call[1]);
	    $(".phone-icon .tooltiptext").text(data.call[0]);
	}
	if (data.para) {
	    for (var i = 0; i < data.para.length; i++) {
		var item = data.para[i];
		var idx = item[0];
		var content = item[1];
		var paras = $("article>p");
		if (idx >= paras.length) {
		    idx = paras.length;
		}
		if (idx == 0) {
		    paras.eq(idx).before(content);
		} else {
		    var target = paras.eq(idx - 1);
		    var n = target.next();
		    var nn = n && n.next();
		    if ((!n ||
			 (!n.is("ul") && !n.is("ol") &&
			  !n.is("img") && !n.is("pre") &&
			  !n.find(">:first-child").is("img"))) &&
			(!nn || (!nn.is("ul") && !nn.is("ol")))) {
			target.after(content);
		    }
		}
	    }
	}
	if (data.showCookieConsent !== undefined) {
	    if (data.showCookieConsent) {
		showCookieConsent();
	    } else {
		if (showCookieTimer) {
		    clearTimeout(showCookieTimer);
		    $(".cookie-consent").css({display: "none"});
		}
	    }
	}
	/* Make sure we process CTAs and videos from the dynamic content. */
	setTimeout(registerCTAs, 500);
	setTimeout(trk_update_tracked_videos, 700);
    }

    /* Fetch dynamic content for the web page. */
    var local = getLocalData();
    var d = new Date();
    var day = d.getDay();
    var hour = d.getHours();
    var dayhour;
    if (day == 0 || day == 6) {
	dayhour = "e" + hour;
    } else {
	dayhour = "w" + hour;
    }

    var statisticalId = local.statisticalId || local.u;
    var req = Object.assign({}, ssh_topicdata, {
	statisticalId: statisticalId,
	cookieConsent: local.cookieConsent,
	hour: dayhour,
	num_para: $("article>p").length,
	aside_visible: $("aside").css("display") != "none",
	num_aside: $("aside>p, aside img, aside .video-container").length,
	w: document.body.clientWidth,
	h: document.body.clientHeight,
	mainw: $("main").width(),
	asidew: $("aside").width(),
	sw: window.screen.availWidth,
	sh: window.screen.availHeight,
	notrack: !navigator.cookieEnabled,
	localstorage: window.ssh_ls_supported,
	url: window.location.pathname,
	qs: getQueryString(),
	referrer: document.referrer});
    $.post({url: apiprefix + "/api/content/v1/dynamic",
	    data: JSON.stringify(req),
	    contentType: "application/json",
	    success: gotResponse,
	    dataType: "json"})
	.fail(function() {
	    console.log("Fetching dynamic content failed");
	});
});

function clickAlt1(altSpan) {
    var sel = altSpan.parents(".clickable-selections");
    var spans = sel.find("span");
    spans.css("color", "#a0a0a0");
    altSpan.css("color", "#fff");
    var alt = altSpan.data("alt");
    var alts = sel.parent().find(".clickable-alt");
    alts.css({display: "none"});
    $("#" + alt).css({display: "block"});
}

function clickAlt(e) {
    clickAlt1($(e.target));
}

function initClickableAlts() {
    $(".clickable-selections").each(function() {
	var sel = $(this);
	var maxh = 0;
	var alts = sel.parent().find(".clickable-alt");
	alts.each(function() {
	    var alt = $(this);
	    if (alt.height() > maxh) {
		maxh = alt.height();
	    }
	});
	alts.each(function() {
	    var alt = $(this);
	    alt.css({minHeight: maxh + "px"});
	});
	var spans = sel.find("span");
	spans.on("click", clickAlt);
	spans.on("mouseenter", clickAlt);
	clickAlt1(spans.eq(0));
    });
}

function starfield() {
    var canvas = $(this);
    var timer = canvas.data("timer");
    if (timer) {
	clearInterval(timer);
    }
    var w = canvas.width();
    var h = canvas.height();
    console.log("starfield", w, h);
    canvas.attr("width", w);
    canvas.attr("height", h);
    var m = w > h ? w : h;
    var num_stars = m * m / 500;
    var stars = [];
    for (var i = 0; i < num_stars; i++) {
	var r = Math.sqrt(Math.random()) * m * 1.42;
	var a = Math.random() * 2 * 3.14159;
	var s = Math.floor(Math.random() * 2 + 1.5);
	stars.push([r, a, s]);
    }
    var mountain = [0.85, 0.8, 0.7, 0.75, 0.7, 0.8];

    function draw(a0) {
	var ctx = canvas[0].getContext("2d");
	var w = canvas.width();
	var h = canvas.height();
	var segw = w / (mountain.length - 1);
 	ctx.fillStyle = "#222";
	ctx.fillRect(0, 0, w, h);
	ctx.fillStyle = "#111";
	ctx.moveTo(0, h);
	for (var i = 0; i < mountain.length; i++) {
	    ctx.lineTo(i * segw, mountain[i] * h);
	}
	ctx.lineTo(w, h);
	ctx.closePath();
	ctx.fill();
	ctx.fillStyle = "#888";
	var x0 = w / 2;
	var y0 = h / 2;
	for (var i = 0; i < stars.length; i++) {
	    var star = stars[i];
	    var r = star[0];
	    var a = star[1];
	    var s = star[2];
	    var x = x0 + r * Math.cos(a0 + a);
	    if (x < 0 || x > w) {
		continue;
	    }
	    var y = y0 + r * Math.sin(a0 + a);
	    var segi = x / segw;
	    var j = Math.floor(segi);
	    var hh;
	    if (j >= mountain.length - 1) {
		hh = h * mountain[j];
	    } else {
		var md = (mountain[j + 1] - mountain[j]);
		hh = h * (mountain[j] + (segi - j) * md);
	    }
	    if (y >= hh - 3) {
		continue;
	    }
	    ctx.fillRect(x, y, s, s);
	}
    }

    function isVisible() {
	var top = $(window).scrollTop();
	var bottom = top + $(window).outerHeight();
	var canvasTop = canvas.offset().top;
	var canvasBottom = canvasTop + canvas.height();
	var visible = canvasBottom >= top && canvasTop <= bottom;
	return visible;
    }

    var angle = 0;
    var interval = 100;
    var rotation_secs = 180;

    function update() {
	if (isVisible()) {
	    console.log("drawing starfield", angle);
	    angle -= 2 * 3.14159 * interval / (rotation_secs * 1000);
	    draw(angle);
	}
    }

    timer = setInterval(update, interval);
    canvas.data("timer", timer);
}

function initStarfields() {
    function reinit() {
	$(".starfield").each(starfield);
    }
    reinit();

    var resizeTimeout = null;
    $(window).on("resize", function() {
	if (resizeTimeout) {
	    clearTimeout(resizeTimeout);
	}
	resizeTimeout = setTimeout(reinit, 1000);
    });
}

function initVideoPosters() {
    console.log("initVideoPosters");
    $(".video-with-poster").each(function() {
	var video = $(this);
	var img = video.find("img");
	var container = video.find(".video-container");
	console.log("video img container", video, img, container);
	container.css({display: "none"});
	img.css({display: "block"});
	var playButton = document.createElement("div");
	playButton.className = "video-with-poster-play";
	playButton = $(playButton);
	playButton.insertAfter(img);
	img.on("click", function() {
	    img.css({display: "none"});
	    playButton.css({display: "none"});
	    container.css({display: "block"});
	    var iframe = container.find("iframe");
	    var id = iframe.attr("id");
	    for (var i = 0; i < yt_ids.length; i++) {
		if (yt_ids[i] == id) {
		    var player = yt_players[i];
		    player.playVideo();
		}
	    }
	});
    });
}

function initScrolldown() {
    $(".scrolldown, .scrolldown-click").each(function() {
	console.log("scrolldown init", $(this));
	$(this).on("click", function(e) {
	    e.preventDefault();
	    var h = $(window).innerHeight();
	    console.log("scrolldown click", h);
	    var num_steps = 50;
	    var duration = 750;
	    var stepMs = Math.round(duration / num_steps);
	    var step = h / num_steps;
	    var sofar = 0;
	    var steps = 1;
	    var timer = setInterval(function() {
		var target = Math.round(steps * step);
		var delta = target - sofar;
		sofar += delta;
		steps++;
		if (delta > 0) {
		    window.scrollBy(0, delta);
		}
		if (steps >= num_steps) {
		    clearInterval(timer);
		}
	    }, stepMs)
	});
    });
}

$(window).on("load", function() {
    setTimeout(registerCTAs, 500);

    initClickableAlts();
    initStarfields();
    initScrolldown();
});

/* OAuth2 login form handling when using customer accounts to log into, e.g.,
   support site. */
$(function() {
    var href = window.location.href;
    var client_id = "";
    console.log("login-form href:", href);
    if (href.search(/[?&]client_id=/) >= 0) {
	client_id = href.replace(/.*[?&]client_id=([^&#]*)([&#].*)?$/, "$1");
    }
    console.log("client_id:", client_id);
    var failed = "";
    if (href.search(/[?&]client_id=/) >= 0) {
	failed = href.replace(/.*[?&]failed=([^&#]*)([&#].*)?$/, "$1");
    }
    console.log("failed:", failed);
    if (failed == "True") {
	$(".login-frame .login-error").text("Login failed.  Probably invalid email or password.");
    }
    var loginUrl = "/api/customer/authorize?response_type=token&client_id=" + client_id;
    console.log("loginUrl:", loginUrl);
    $(".login-form").attr("action", loginUrl);
});

/* Set password form handling for customers setting their password via
   email invite / password reset email. */
$(function() {
    var href = window.location.href;
    var invite = "";
    console.log(" href:", href);
    if (href.search(/[?&]invite=/) >= 0) {
	invite = href.replace(/.*[?&]invite=([^&#]*)([&#].*)?$/, "$1");
    }
    if (!invite) {
	$(".set-password-error").text("No invite argument in URL.  " +
				      "This page does not work without it.");
    }
    var setPasswordUrl = "/api/customer/v1/inviteset/" + invite;
    console.log("setPasswordUrl:", setPasswordUrl);
    $(".set-password-form button").on("click", function(e) {
	console.log("calling preventDefault");
	e.preventDefault();
	var password =
	    $('.set-password-form input[name="newPassword"]').val();
	console.log("password:", password);
	function okFn2(data) {
	    console.log("okFn2 data:", data);
	    var at = data.access_token;
	    var rt = data.refresh_token;
	    var url = "/login/customer/app.html?access_token=" + at +
		"&refresh_token=" + rt;
	    window.location = url;
	}
	function okFn(data) {
	    console.log("okFn data:", data);
	    var username = data.username;
	    console.log("Password set successfully", username);
	    $.post({url: "/api/customer/token",
		    data: { client_id: "website",
			    client_secret: "public",
			    request_type: "token",
			    grant_type: "password",
			    username: username,
			    password: password },
		    success: okFn2}).fail(function() {
			console.log("Login using the password we just set " +
				    "failed");
			$(".set-password-error").html(
			    "Password was set successfully but login using " +
				"it failed.  This should not happen.  Try " +
				"setting it again and if this repeats, " +
				"please " +
				'<a href="/about/contact">contact us</a>.');
		    });
	}
	$.post({url: setPasswordUrl,
		data: JSON.stringify({newPassword: password}),
		contentType: "application/json",
		success: okFn,
		dataType: "json"})
	    .fail(function() {
		console.log("Fetching dynamic content failed");
		$(".set-password-error").text(
		    "Failed to set password. Make sure your password is long " +
		    "and complex enough.  If it satisfies the requrements, " +
		    "try sending yourself a new invite in case the old one " +
		    "has expired or already been used.");
	    });
    });
});

/* Contact and Subscribe form submissions.  This also handles disabling the
   button until email has been entered. */
$(function() {
    $(".contact-form-submit").on("click", function(e) {
	console.log("contact-form-submit");
	e.preventDefault();
	var target = $(e.target);
	var form = target.parents(".contact-form, .subscribe-form, .footer-subscribe-form");
	var name = form.find('[name="name"]').val();
	var email = form.find('[name="email"]').val();
	var phone = form.find('[name="phone"]').val();
	var company = form.find('[name="company"]').val();
	var jobtitle = form.find('[name="jobtitle"]').val();
	var consent = form.find(".consent-text").text();
	var pagepath = window.location.pathname;
	var pagetitle = document.title;
	var data = {
	    email: email,
	    phone: phone,
	    name: name,
	    company: company,
	    jobtitle: jobtitle,
	    consent: consent,
	    pagepath: pagepath,
	    pagetitle: pagetitle }
	console.log(data);
	$.post("/api/form/v1/", data)
	    .done(function(ret) {
		console.log("success", ret);
		var submitted = form.find(".contact-form-submitted");
		submitted.removeClass("contact-form-error");
		submitted.html("Your information has been submitted.  " +
			       "Thank you!");
	    })
	    .fail(function() {
		console.log("failure");
		submitted.addClass("contact-form-error");
		submitted.html("Submitting the form failed.  " +
			       "Please notify us by chat or " +
			       '<a href="/about/contact">call us</a>.');
	    });
    });
    $(".contact-form, .subscribe-form, .footer-subscribe-form")
	.each(function() {
	var form = $(this);
	var email = form.find('[name="email"]');
	var button = form.find(".contact-form-submit");
	button.addClass("disabled");
	email.on("input", function() {
	    var v = email.val();
	    var m = /^[-A-Za-z0-9$%!+=^~_.{|}\/]+@(([A-Za-z0-9-]+[.])+[A-Za-z0-9-][A-Za-z0-9-]+)$/.exec(v);
	    if (m) {
		button.removeClass("disabled");
	    } else {
		button.addClass("disabled");
	    }
	});
    });
});
