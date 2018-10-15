var rx_ip='^(([01]?[0-9]?[0-9]|2([0-4][0-9]|5[0-5]))\.){3}([01]?[0-9]?[0-9]|2([0-4][0-9]|5[0-5]))$';
var rx_ttg='^[*0-1][*0-9]/[*0-3][*0-9] [*0-2][*0-9]:[*0-5][*0-9]:[*0-5][*0-9]$';
var rx_dtg='^[a-z][a-z][a-z] [0-2][0-9]:[0-6][0-9]:[0-6][0-9]$';
var rx_time='^20[0-9][0-9]/[0-1][0-9]/[0-3][0-9] [0-2][0-9]:[0-5][0-9]:[0-5][0-9]$';
var rx_str='^[a-zA-Z0-9]+$';
var rx_str5='^[a-zA-Z0-9]{5}$';
var rx_num='^[0-9]{1,2,3,4,5}$';

var port_visible = "h";
var port_visible_config = "";
var port_enabled = 1;
var port_analog = 0;
var portid = 0;

// http://www.opendomo.com/wiki/index.php?title=Comandos_de_ODControl#Enlazar_puertos_.28lnk.29
var lnktypes = 	["d",      "i",     "p",      "c",      "r",      "t",        "s",    "2",     "3",       "b",    "k",        "n", 	"N"];
var lnktypes_desc =	["direct", "invers","pulse", 	"change", "return", "t-return", "self", "double", "triple", "boot", "interlink","p-counter", "p-counter down"];

var grptypes 		= ["and","nand","or","nor","xor","not","add","sub","mul","div","max","min",
	"eq", "ne", "gt", "lt", "ge", "le"];
var grptypes_desc 	= ["and","nand","or","nor","xor","not"," + "," - "," x "," / ","max","min",
	"=", "!=", ">", "<", ">=", "<="];

var trgtypes = ["cmpeq","cmpne","cmpgt","cmplt","cmpge","cmple"];
var trgtypes_desc = ["==","!=",">","<",">=","<="];

var tags = ["light","climate","security","energy"];

if(typeof(console) == 'undefined') {
	console = {} ;
	console.log = function(){};
}

function ID(id) {
	var d = document;
	return d.getElementById(id);
}
function CE(tag, cl, id) {
	var d = document;
	var e =  d.createElement(tag);
	if (cl && cl!="") e.setAttribute("class",cl);
	if (id && id!="") e.setAttribute("id",id);
	return e;
}
function CT(text) {
	var d = document;
	return d.createTextNode(text);
}

function send_cmd(id,patt) {
	console.log("Sending command " + id);
	var i=ID(id);
	var re=new RegExp(patt);
	if(i.value.match(re)) {
		document.location='./'+id+'+'+i.value.replace(' ', '+').replace(/\//g, '+');
	} else {
		i.style.color='red';
	}
}

function validate_field(id,patt) {
	var i=ID(id);
	if (i) {
		var re=new RegExp(patt);
		if(i.value.match(re)) {
			//OK
			i.style.color='inherit';	
			return true;
		} else {
			i.style.color='red';
			alert("Invalid value in " + i.title);
			return false;
		}
	} else {
		// Field does not exist, should not be checked
		return true;
	}	
}

function add_line(text, level) {
	var log = ID("list");
	//log = document.body;
	if (log) {
		var list = CE("p",level); 
//		list.setAttribute("class", level);
		log.appendChild(list);
		var line = CT(text);
		list.appendChild(line);
		log.scrollTop = log.scrollHeight;
	}
}

function add_error_line(command, text, level) {
	var log = ID("list");
	//log = document.body;
	if (log) {
		var link = CE("a");
		link.setAttribute("href","http://www.opendomo.com/wiki/index.php?title=C%C3%B3digos_de_error_de_ODControl#" + text);
		link.setAttribute("target", "help");
		var list = CE("p",level); 
		var line = CT("Error in command '"+command+"'");
//		list.setAttribute("class", level);
		link.appendChild(line);
		list.appendChild(link);
		log.appendChild(list);
		log.scrollTop = log.scrollHeight;
	}
}

/*
function add_header() {
	var log = ID("log");
	if (log) {
		var header = CE("div");
		header.setAttribute("id", "header");
		header.innerHTML="<div class='categories'><a id='cat-help' target='new' href='http://opendomo.org/h.php'>Help</a></div>";
		log.appendChild(header);	

		var body = CE("div");
		body.setAttribute("id","body");
		var list = CE("div");
		list.setAttribute("id","list");
		body.appendChild(list);
		log.appendChild(body);

	}
}

function add_toolbar() {
	var log = ID("log");
	if (log) {
		var line = CE("div","toolbar");
//		line.setAttribute("class", "toolbar");
		line.innerHTML="<a class='button' onclick='window.close();'>Close</a><a  class='button'  onclick=\"document.location='http://'+document.location.hostname+'/cnf';\">Configure</a>";
		log.appendChild(line);
	}
}
*/

function popupwindow(url){
	window.open(url,"odctp","menubar=0,resizable=1,scrollbar=1,width=500,height=700");
}

function loadjscssfile(filename, filetype){
	if (filetype=="js"){ //if filename is a external JavaScript file
		var fileref=CE('script')
		fileref.setAttribute("type","text/javascript")
		fileref.setAttribute("src", filename)
	}
	else if (filetype=="css"){ //if filename is an external CSS file
		var fileref=CE("link")
		fileref.setAttribute("rel", "stylesheet")
		fileref.setAttribute("type", "text/css")
		fileref.setAttribute("href", filename)
	}
	if (typeof fileref!="undefined")
		document.getElementsByTagName("head")[0].appendChild(fileref)
}

function send_command(strURL)
{
	var xmlHttp;
	var URL = strURL.replace(/ /g,"+");
	if (window.XMLHttpRequest)
	{ // Mozilla, Safari, ...
		var xmlHttp = new XMLHttpRequest();
	}
	else if (window.ActiveXObject)
	{ // IE
		var xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
	}

	console.log("Sending command "+ strURL + " (" + URL +")");
	try {
		xmlHttp.open('GET', "./" + URL, false);
		xmlHttp.setRequestHeader("If-None-Match","some-random-string");
		xmlHttp.setRequestHeader("Cache-Control","no-cache,max-age=0");
		xmlHttp.setRequestHeader("Pragma","no-cache");
		//xmlHttp.setRequestHeader("Connection","close");
		xmlHttp.send(null);

		while(xmlHttp.readyState==0) {
		// Just wait
		}
		var command = strURL.replace(/\+/g," ");


		if (xmlHttp.readyState==4 && xmlHttp.responseText.indexOf("DONE")>=0 ) {
			console.log(xmlHttp.responseText);
			add_line("Command '"+command+ "' successful ", "notice");
		} else {
			//FIXME: lbl command sometimes fails when repeating
			if (strURL.indexOf("lbl") != -1) {
				add_line("Command '"+command+ "' successful ", "notice");
			}
			else
			{
				var resp = xmlHttp.responseText;
				add_error_line(command, resp, "error");
			}
		}

		return xmlHttp.responseText;
	} catch (err) {
		console.log(err.message);
		return -1;
	}
}


function loadMenu(){
	var d = ID("frm");
	var l = ID("list");
	d.innerHTML = "";
	document.title = "Advanced configuration";

	var m = CE("ul");
	
		var menu_template = CE("li","menuitem","mnutemplate");
//		menu_template.setAttribute("class","menuitem");
		var menu_template_caption = CT("Load template");
		menu_template.appendChild(menu_template_caption);	
		menu_template.addEventListener("click", function() { loadTemplatesMenu();});
		m.appendChild(menu_template);
	
		var menu_ports = CE("li","menuitem","mnuports");
//		menu_ports.setAttribute("class","menuitem");
		var menu_ports_caption = CT("Configure ports");
		menu_ports.appendChild(menu_ports_caption);
		menu_ports.addEventListener("click", function() { loadPortsMenu();});
		m.appendChild(menu_ports);
		d.appendChild(m);
	
		var menu_links = CE("li","menuitem","mnulinks");
//		menu_links.setAttribute("class","menuitem");
		var menu_links_caption = CT("Configure links");
		menu_links.appendChild(menu_links_caption);
		menu_links.addEventListener("click", function() { loadLinksMenu();});
		m.appendChild(menu_links);
		d.appendChild(m);

		var menu_default = CE("li","menuitem","mnudefaults");
//		menu_default.setAttribute("class","menuitem");
		var menu_default_caption = CT("Restore factory defaults");
		menu_default.appendChild(menu_default_caption);
		menu_default.addEventListener("click", function() { 
			if (confirm("Do you want to restore factory defaults? All changes will be lost")) {
				send_command('clr');
			}
		});
		m.appendChild(menu_default);
		d.appendChild(m);
/*	
	var menu_sec = CE("li","menuitem");
//	menu_sec.setAttribute("class","menuitem");
	var menu_sec_caption = CT("Security");
	menu_sec.appendChild(menu_sec_caption);
	menu_sec.addEventListener("click", function() { loadSecurityMenu();});
	m.appendChild(menu_sec);
	d.appendChild(m);	
*/


	var menu_sec = CE("li","menuitem");
//	menu_sec.setAttribute("class","menuitem");
	var menu_sec_caption = CT("System");
	menu_sec.appendChild(menu_sec_caption);
	menu_sec.addEventListener("click", function() { loadSystemMenu();});
	m.appendChild(menu_sec);
	d.appendChild(m);	


	var menu_sec = CE("li","menuitem");
//	menu_sec.setAttribute("class","menuitem");
	var menu_sec_caption = CT("Send command");
	menu_sec.appendChild(menu_sec_caption);
	var input_command = CE("input","command","sendcommand");
	menu_sec.appendChild(input_command);

	input_command.addEventListener("keypress", function(event) { 
		if ( event.which == 13 ) {
			var cmd = this.value;
			if (cmd=="test") {
				initializeTests();
			} else {
				if (cmd=="help") {
					initializeHelp();
				} else {
					var resp = send_command(cmd);
					var p = CE("pre","cmdresult");
					var pt = CT(resp);
					p.appendChild(pt)
					l.appendChild(p);
				}
			}
		}
	});
	m.appendChild(menu_sec);
	d.appendChild(m);	
	
}


function loadLinksMenu() {
	var d = ID("frm");
	d.innerHTML = "";
	var m = CE("ul");
	
	var menu = CE("li","backmenu");
//	menu.setAttribute("class","backmenu");
	var menu_caption = CT("Back");
	menu.addEventListener("click", function() { 
		loadMenu();
	});
	menu.appendChild(menu_caption);
	m.appendChild(menu);	
	
	for (i=0;i<mylinks.length;i++) {
		var menu = CE("li");
		menu.setAttribute("class","menuitem");
		menu.setAttribute("className","menuitem");
		menu.setAttribute("title",i);
		var lnkname = mylinks[i][2];
		for (var zz=0;zz<lnktypes.length;zz++){
			if (mylinks[i][2]==lnktypes[zz]){
				lnkname=lnktypes_desc[zz]; 
			}
		}
		var menu_caption = document.createTextNode(mylinks[i][0] + " - " + mylinks[i][1] + " (" + lnkname + ")");
		menu.appendChild(menu_caption);	
		
		var dellnk = CE("a","infobutton");
//		dellnk.setAttribute("class","infobutton");
		var dellnkimg = CE("img");		
		dellnkimg.setAttribute("src","http://cloud.opendomo.com/odctp/img/del.png");
		dellnk.appendChild(dellnkimg);
		dellnk.addEventListener("click",function(){
			var l = parseInt(this.parentNode.title);
			command = "unl+" + mylinks[l][0] + "+" + mylinks[l][1] + "+" + mylinks[l][2] ;
			ret = send_command(command);
			if (ret == "DONE") {
				loadLinksInfo();
				alert("Link deleted!");
				setTimeout(function(){loadLinksMenu()},500);
			} else {
				alert("Error deleting link: "+ ret);
			}
		});
		menu.appendChild(dellnk);
		
		m.appendChild(menu);
	}
	
	var addblock =CE("li","menuitem");
//	addblock.setAttribute("class","menuitem");
	addblock.setAttribute("title","Add new link");
	var addblock_caption = CT("Add  ");
	addblock.appendChild(addblock_caption);
	var addblocka = CE("a");		


	var alb_di = CE("select");
	alb_di.setAttribute("name","inport");
	alb_di.setAttribute("id","inport");
	for(var i = 0; i < ports.length; i++) {
		if (ports[i][1]!="XX"){
			var opt =ports[i][0];
			var el = CE("option");
			el.textContent = opt;
			el.value = opt;
			alb_di.appendChild(el);
		}
	}
	addblocka.appendChild(alb_di);
	
	var alb_do = CE("select");
	alb_do.setAttribute("name","outport");
	alb_do.setAttribute("id","outport");	
	for(var i = 0; i < ports.length; i++) {
		if ((ports[i][1]!="XX") && (ports[i][1]!="DI") && (ports[i][1]!="AI")){
			var opt =ports[i][0];
			var el = CE("option");
			el.textContent = opt;
			el.value = opt;
			alb_do.appendChild(el);
		}
	}
	addblocka.appendChild(alb_do);

	var alb_type = CE("select");
	alb_type.setAttribute("name","type");
	alb_type.setAttribute("id","type");
	for(var i = 0; i < lnktypes.length; i++) {
		var el = CE("option");
		el.textContent = lnktypes_desc[i];
		el.value = lnktypes[i];;
		alb_type.appendChild(el);
	}
	addblocka.appendChild(alb_type);
	
	var alb_btn = CE("img","infobutton");
	alb_btn.setAttribute("name","add");
//	alb_btn.setAttribute("class","infobutton");	
	alb_btn.setAttribute("src","http://cloud.opendomo.com/odctp/img/add.png");	
	alb_btn.addEventListener("click",function(){
		var dip = ID("inport");
		var dop = ID("outport");
		var lnkt = ID("type");
		for (l=0;l<mylinks.length;l++) {
			if ((mylinks[l][0]==dip.value) && (mylinks[l][1]==dop.value)){
				alert("Warning: ports " + dip.value + " and " + dop.value + " are already linked.\nThis is a valid configuration for interlink ports, \nbut for other types the new link will overwrite the old one.");	
			}
		} 
		command = "lnk+" + dip.value + "+" + dop.value + "+" + lnkt.value;
		retval = send_command(command);
		if (retval == "DONE") {
			alert("Link created");
			loadLinksInfo();
			setTimeout(function(){loadLinksMenu()},500);
		} else {
			alert("The link was not created: "+retval);
		}
	});	
	addblocka.appendChild(alb_btn);
	

	addblock.appendChild(addblocka);
	m.appendChild(addblock);
	
	d.appendChild(m);	
	document.title = "Configure links";
}


function loadPortsMenu() {
	var d = ID("frm");
	d.innerHTML = "";
	var m = CE("ul");
	
	var menu = CE("li");
	menu.setAttribute("class","backmenu");
	menu.setAttribute("className","backmenu");
	var menu_caption = CT("Back");
	menu.addEventListener("click", function() { loadMenu();});
	menu.appendChild(menu_caption);
	m.appendChild(menu);	
	
	for (i=0;i<ports.length;i++) {
		var menu = CE("li");
		if (ports[i]) {
			console.log("Reading "+i+"="+ports[i][0]); 
			menu.setAttribute("class","menuitem type"+ports[i][1]);
			menu.setAttribute("className","menuitem type"+ports[i][1]);
			menu.setAttribute("title",i);
			var menu_caption = CT(ports[i][0]);
			menu.addEventListener("click", function() { 
				var pid = this.title;
				loadPortData(pid);
				//alert("loading "+pid);
				//displayPortDetails(pid);
			});
			menu.appendChild(menu_caption);	
			m.appendChild(menu);
		}
	}
	d.appendChild(m);	
	document.title = "Configurar puertos";
}


var sel;
function displayPortDetails(id) {
	portid = id;
	var d = ID("frm");
	d.innerHTML = "";
	var m = CE("ul");
	
	var menu = CE("li");
	menu.setAttribute("class","backmenu");
	menu.setAttribute("className","backmenu");
	var menu_caption = CT("Back");
	menu.addEventListener("click", function() { loadPortsMenu();});
	menu.appendChild(menu_caption);
	m.appendChild(menu);	
	
	// Input box for labeling ports
	var menu = CE("li");
	menu.setAttribute("class","menuitem");
	menu.setAttribute("className","menuitem");
	menu.setAttribute("title",id);
	sel = id;
	
	var menu_caption = CT("Name");
	menu.appendChild(menu_caption);
	var menu_input = CE("input");
	menu_input.setAttribute("name","lbl");
	menu_input.setAttribute("id","lbl");
	menu_input.setAttribute("title","Name");
	menu_input.setAttribute("value",ports[id][0]);
	menu_input.setAttribute("type","text");
	menu.appendChild(menu_input);
	m.appendChild(menu);

	// Visible / not visible
	var menu = CE("li");
	if (ports[id][3].indexOf("visib:visible")>0 || ports[id][3].indexOf("visib:config")>0 ) {
		menu.setAttribute("class","menuitem OON");
		menu.setAttribute("className","menuitem OON");
		menu.setAttribute("title",i);
		var menu_caption = CT("Visible");
		menu.appendChild(menu_caption);
		var menu_vis = CE("a");	
		menu_vis.setAttribute("class","OOFF");
		var menu_vis_caption = CT("ON");
		port_visible = "s";
		menu_vis.addEventListener("click",function() {
			if (port_visible=="h") {
				this.parentNode.setAttribute("class", "menuitem OON");		
				this.setAttribute("class","OOFF");
				port_visible="s";			
			} else {
				this.parentNode.setAttribute("class", "menuitem OOFF");
				this.setAttribute("class","OON");
				port_visible="h";
			}
		});
	} else {
		menu.setAttribute("class","menuitem OOFF");
		menu.setAttribute("className","menuitem OOFF");
		menu.setAttribute("title",i);
		var menu_caption = CT("Visible");
		menu.appendChild(menu_caption);
		var menu_vis = CE("a");	
		menu_vis.setAttribute("class","OON");	
		var menu_vis_caption = CT("OFF");
		port_visible = "h";
		menu_vis.addEventListener("click",function() {
			if (port_visible=="h") {
				this.parentNode.setAttribute("class", "menuitem OON");		
				this.setAttribute("class","OOFF");
				port_visible="s";			
			} else {
				this.parentNode.setAttribute("class", "menuitem OOFF");
				this.setAttribute("class","OON");
				port_visible="h";
			}
		});		
	}
	menu_vis.appendChild(menu_vis_caption);
	menu.appendChild(menu_vis);
	//menu.addEventListener("click", function() { alert(this.title);});
	m.appendChild(menu);
	
	// Visible in Home / Config
	if (port_visible=="s") {
		var menu = CE("li");
		if (ports[id][3].indexOf("visib:config")>0) {
			menu.setAttribute("class","menuitem OON");
			menu.setAttribute("className","menuitem OON");
			menu.setAttribute("title",i);
			var menu_caption = CT("Show in config");
			menu.appendChild(menu_caption);
			var menu_visc = CE("a");	
			menu_visc.setAttribute("class","OOFF");
			var menu_visc_caption = CT("ON");
			port_visible_config = "S";
			menu_visc.addEventListener("click",function() {
				if (port_visible_config=="s") {
					this.parentNode.setAttribute("class", "menuitem OON");		
					this.setAttribute("class","OOFF");
					port_visible_config="S";			
				} else {
					this.parentNode.setAttribute("class", "menuitem OOFF");
					this.setAttribute("class","OON");
					port_visible_config="s";
				}
			});
		} else {
			menu.setAttribute("class","menuitem OOFF");
			menu.setAttribute("className","menuitem OOFF");
			menu.setAttribute("title",i);
			var menu_caption = CT("Show in config");
			menu.appendChild(menu_caption);
			var menu_visc = CE("a");	
			menu_visc.setAttribute("class","OON");	
			var menu_visc_caption = CT("OFF");
			port_visible_config = "s";			
			menu_visc.addEventListener("click",function() {
				if (port_visible_config=="s") {
					this.parentNode.setAttribute("class", "menuitem OON");		
					this.setAttribute("class","OOFF");
					port_visible_config="S";			
				} else {
					this.parentNode.setAttribute("class", "menuitem OOFF");
					this.setAttribute("class","OON");
					port_visible_config="s";
				}
			});		
		}
		menu_visc.appendChild(menu_vis_caption);
		menu.appendChild(menu_visc);
		//menu.addEventListener("click", function() { alert(this.title);});
		m.appendChild(menu);
	}
		

	// Enabled / disabled
	var menu = CE("li");
	if (ports[id][1]!="XX") {
		menu.setAttribute("class","menuitem OON");
		menu.setAttribute("className","menuitem OON");
		menu.setAttribute("title",i);
		var menu_caption = CT("Enabled");
		menu.appendChild(menu_caption);
		var menu_enable = CE("a");	
		menu_enable.setAttribute("class","OOFF");
		var menu_enable_caption = CT("ON");
		port_enabled = 1;
		menu_enable.addEventListener("click",function() {
			if (port_enabled==0) {
				this.parentNode.setAttribute("class", "menuitem OON");		
				this.setAttribute("class","OOFF");
				port_enabled=1;
				var minf = ID("min");
				var maxf = ID("max");
				minf.parentNode.style.display="block";
				maxf.parentNode.style.display="block";				
			} else {
				this.parentNode.setAttribute("class", "menuitem OOFF");
				this.setAttribute("class","OON");
				port_enabled=0;
				var minf = ID("min");
				var maxf = ID("max");
				minf.parentNode.style.display="none";
				maxf.parentNode.style.display="none";
			}
		});
	} else {
		menu.setAttribute("class","menuitem OOFF");
		menu.setAttribute("className","menuitem OOFF");
		menu.setAttribute("title",i);
		var menu_caption = CT("Enabled");
		menu.appendChild(menu_caption);
		var menu_enable = CE("a");	
		menu_enable.setAttribute("class","OON");	
		var menu_enable_caption = CT("OFF");
		port_enabled = 0;
		menu_enable.addEventListener("click",function() {
			if (port_enabled==0) {
				this.parentNode.setAttribute("class", "menuitem OON");		
				this.setAttribute("class","OOFF");
				port_enabled=1;
				var minf = ID("min");
				var maxf = ID("max");
				minf.parentNode.style.display="block";
				maxf.parentNode.style.display="block";								
			} else {
				this.parentNode.setAttribute("class", "menuitem OOFF");
				this.setAttribute("class","OON");
				port_enabled=0;
				var minf = ID("min");
				var maxf = ID("max");
				minf.parentNode.style.display="none";
				maxf.parentNode.style.display="none";
			}
		});		
	}
	menu_enable.appendChild(menu_enable_caption);
	menu.appendChild(menu_enable);
	//menu.addEventListener("click", function() { alert(this.title);});
	m.appendChild(menu);
	
	
	


	// TAG
	var menu = CE("li");
	menu.setAttribute("class","menuitem");
	menu.setAttribute("className","menuitem");
	menu.setAttribute("title",i);
	var menu_tag_caption = CT("Tag");
	menu.appendChild(menu_tag_caption);
	var menu_tag = CE("select");	
	menu_tag.setAttribute("class","select");
	menu_tag.setAttribute("id","tag");
	var	zel = CE("option")
	zel.textContent = "None";
	zel.value="0";
	menu_tag.appendChild(zel);
	for(var n = 0; n < tags.length; n++) {
		var opt =tags[n];
		var el = CE("option");
		if (ports[id][3].indexOf("tag:"+tags[n][0])>0) {
			el.setAttribute("selected","selected");
		}
		el.textContent = opt;
		el.value = opt;
		menu_tag.appendChild(el);
	}
	var link = CE("a");
	link.appendChild(menu_tag);
	menu.appendChild(link);
	//menu.addEventListener("click", function() { alert(this.title);});
	m.appendChild(menu);
	

	if (sel >= 16 && sel <= 23) // ANALOG PORTS
	{
		minvalue = 0;
		maxvalue = 100;
		var lst_des = ports[id][3].split(" ");
		for (k=0;k<lst_des.length;k++) {
			var pr = lst_des[k].split(":");
			if (pr[0]=="A") minvalue = pr[1];
			if (pr[0]=="B") maxvalue = pr[1];
		}
		var menumin = CE("li");
		menumin.setAttribute("class","menuitem");
		menumin.setAttribute("title",id);
		var menumin_caption = CT("Minimum");
		menumin.appendChild(menumin_caption);
		var menumin_input = CE("input");
		menumin_input.setAttribute("name","min");
		menumin_input.setAttribute("id","min");
		menumin_input.setAttribute("title","Min");
		menumin_input.setAttribute("type","number");
		menumin_input.setAttribute("value",minvalue);
		menumin.appendChild(menumin_input);
		m.appendChild(menumin);
	
		var menumax = CE("li");
		menumax.setAttribute("class","menuitem");
		menumax.setAttribute("title",id);
		var menumax_caption = CT("Maximum");
		menumax.appendChild(menumax_caption);
		var menumax_input = CE("input");
		menumax_input.setAttribute("name","max");
		menumax_input.setAttribute("id","max");
		menumax_input.setAttribute("title","Max");
		menumax_input.setAttribute("value",maxvalue);
		menumax_input.setAttribute("type","number");
		menumax.appendChild(menumax_input);
		m.appendChild(menumax);
		
		if (port_enabled==0) {
			menumin.style.display="none";		
			menumax.style.display="none";
		}
	} else if (sel > 23) {	// VIRTUAL PORTS
		var lst_des = ports[id][3].split(" ");
		var trigger = "";
		var group="";
		var label="Trigger";
		var pout="";
		var vout="";
		var remote="";
		var persist=0;
		
		// Virtual port working as analog?
		var menu = CE("li");
		if (ports[id][1]!="XX") {
			menu.setAttribute("class","menuitem OON");
			menu.setAttribute("title",i);
			var menu_caption = CT("Analog");
			menu.appendChild(menu_caption);
			var menu_enable = CE("a");	
			menu_enable.setAttribute("class","OOFF");
			var menu_enable_caption = CT("ON");
			port_analog = 1;
			menu_enable.addEventListener("click",function() {
				if (port_analog==0) {
					this.parentNode.setAttribute("class", "menuitem OON");		
					this.setAttribute("class","OOFF");
					port_analog=1;
				} else {
					this.parentNode.setAttribute("class", "menuitem OOFF");
					this.setAttribute("class","OON");
					port_analog=0;
				}
			});
		} else {
			menu.setAttribute("class","menuitem OOFF");
			menu.setAttribute("title",i);
			var menu_caption = CT("Analog");
			menu.appendChild(menu_caption);
			var menu_enable = CE("a");	
			menu_enable.setAttribute("class","OON");	
			var menu_enable_caption = CT("OFF");
			port_analog = 0;
			menu_enable.addEventListener("click",function() {
				if (port_analog==0) {
					this.parentNode.setAttribute("class", "menuitem OON");		
					this.setAttribute("class","OOFF");
					port_analog=1;
				} else {
					this.parentNode.setAttribute("class", "menuitem OOFF");
					this.setAttribute("class","OON");
					port_analog=0;
				}
			});		
		}
		menu_enable.appendChild(menu_enable_caption);
		menu.appendChild(menu_enable);
		//menu.addEventListener("click", function() { alert(this.title);});
		m.appendChild(menu);

		for (k=0;k<lst_des.length;k++) {
			var pr1 = lst_des[k].split("\n");
			var pr = pr1[0].split(":");
			if (pr[0]=="dtg") {
				label="Calendar";
				trigger = "dtg";
			}
			if (pr[0]=="ttg") {
				label="Clock";
				trigger = "ttg";
			}
			if (pr[0]=="trg") {
				label="Trigger";
				trigger = "trg";
			}		
			if (pr[0]=="ztg") {
				label="Countdown";
				trigger = "ztg";
			}									
			if (pr[0]=="group"){
				group = pr[1];
			}
			if (pr[0]=="pout") {
				pout = pr[1];
			}
			if (pr[0]=="vout") {
				vout = pr[1];
			}
			if (pr[0]=="remote") {
				remote = "Remote port";
			}
			if (pr[0]=="persist") {
				persist = 1;
			}
		}
		if (port_enabled==1) {
			if (trigger!="") {
				// Port as trigger
				var menumin = CE("li");
				menumin.setAttribute("class","menuitem");
				menumin.setAttribute("title",id);
				var menumin_caption = CT(label);
				menumin.appendChild(menumin_caption);
				var menumin_input = CE("input");
				menumin_input.setAttribute("type","readonly");
				menumin_input.setAttribute("readonly","readonly");
				menumin_input.setAttribute("value",trigger+" "+pout+"="+vout);
				menumin.appendChild(menumin_input);
				var dellnk = CE("img");
				dellnk.setAttribute("src","http://cloud.opendomo.com/odctp/img/del.png");
				dellnk.setAttribute("class","infobutton");
				dellnk.setAttribute("title", "Delete trigger");			
				dellnk.addEventListener("click",function(){
					var l = parseInt(portid);
					command = "clv+" + ports[l][0];
					send_command(command);
	//				alert("Port deleted!");
					loadPortData(l);
				});
				menumin.appendChild(dellnk);			
				m.appendChild(menumin);
			} else if (group!="") {
				// Port as group
				var menumin = CE("li");
				menumin.setAttribute("class","menuitem");
				menumin.setAttribute("title",id);
				var menumin_caption = CT("Group");
				menumin.appendChild(menumin_caption);
				var menumin_input = CE("input");
				menumin_input.setAttribute("type","readonly");
				menumin_input.setAttribute("readonly","readonly");
				menumin_input.setAttribute("value",group);
				menumin.appendChild(menumin_input);
				var dellnk = CE("img");
				dellnk.setAttribute("src","http://cloud.opendomo.com/odctp/img/del.png");
				dellnk.setAttribute("class","infobutton");
				dellnk.setAttribute("title", "Delete group");
				dellnk.addEventListener("click",function(){
					var l = parseInt(this.parentNode.title);
					command = "clv+" + ports[l][0];
					send_command(command);
	//				alert("Port deleted!");
					loadPortData(l);
				});
				menumin.appendChild(dellnk);			
				m.appendChild(menumin);
			} else if (remote!="") {
				// This is a remote port
				var menumin = CE("li");
				menumin.setAttribute("class","menuitem");
				menumin.setAttribute("title",id);
				var menumin_caption = CT("Remote");
				menumin.appendChild(menumin_caption);
				var menumin_input = CE("input");
				menumin_input.setAttribute("type","readonly");
				menumin_input.setAttribute("readonly","readonly");
				menumin_input.setAttribute("value",remote);
				menumin.appendChild(menumin_input);
				var dellnk = CE("img");
				dellnk.setAttribute("src","http://cloud.opendomo.com/odctp/img/del.png");
				dellnk.setAttribute("class","infobutton");
				dellnk.setAttribute("title", "Delete group");
				dellnk.addEventListener("click",function(){
					var l = parseInt(this.parentNode.title);
					command = "clv+" + ports[l][0];
					send_command(command);
	//				alert("Port deleted!");
					loadPortData(l);
				});
				menumin.appendChild(dellnk);			
				m.appendChild(menumin);
			} else {
				// Port as variable
				var menu = CE("li");
				if (persist!=1) 
					menu.setAttribute("class","optionsel");
				else
					menu.setAttribute("class","option");				
				
				menu.title = id;
				
				var menu_caption = CT("Use as variable");
				menu.addEventListener("click", function() { 
					var l = parseInt(this.title);
					command = "var+" + ports[l][0];
					send_command(command);
					loadPortData(l);
				});
				menu.appendChild(menu_caption);
				m.appendChild(menu);
			
			
				var menu = CE("li");
				if (persist==1) 
					menu.setAttribute("class","optionsel");
				else
					menu.setAttribute("class","option");				
				
				menu.title = id;
				
				var menu_caption = CT("Use as persistent");
				menu.addEventListener("click", function() { 
					var l = parseInt(this.title);
					command = "per+" + ports[l][0];
					send_command(command);
					loadPortData(l);
				});
				menu.appendChild(menu_caption);
				m.appendChild(menu);			
			
				var menu = CE("li");
				menu.setAttribute("class","option");
				menu.title = id;
				var menu_caption = CT("Use as group");
				menu.addEventListener("click", function() { createGroupInPort(this.title);});
				menu.appendChild(menu_caption);
				m.appendChild(menu);
			
				var menu = CE("li");
				menu.setAttribute("class","option");
				menu.title = id;
				var menu_caption = CT("Use as remote port");
				menu.addEventListener("click", function() { createRemoteLink(this.title);});
				menu.appendChild(menu_caption);
				m.appendChild(menu);	
			
				var menu = CE("li");
				menu.setAttribute("class","option");
				menu.title = id;
				var menu_caption = CT("Use as calendar timer");
				menu.addEventListener("click", function() { createCalTrigger(this.title);});
				menu.appendChild(menu_caption);
				m.appendChild(menu);	
				
				var menu = CE("li");
				menu.setAttribute("class","option");
				menu.title = id;
				var menu_caption = CT("Use as clock timer");
				menu.addEventListener("click", function() { createClockTrigger(this.title);});
				menu.appendChild(menu_caption);
				m.appendChild(menu);
				
				var menu = CE("li");
				menu.setAttribute("class","option");
				menu.title = id;
				var menu_caption = CT("Use as countdown");
				menu.addEventListener("click", function() { createZeroTrigger(this.title);});
				menu.appendChild(menu_caption);
				m.appendChild(menu);				
				
				var menu = CE("li");
				menu.setAttribute("class","option");
				menu.title = id;
				var menu_caption = CT("Use as conditional trigger");
				menu.addEventListener("click", function() { createConditionalTrigger(this.title);});
				menu.appendChild(menu_caption);
				m.appendChild(menu);				
			}	
		}
	}

	var tbr = CE("div");
	tbr.setAttribute("class","buttons");
	var menu_ok_caption = CT("Save changes");
	var menu_ok =CE("a");
//	menu_ok.setAttribute("id","update_lbl");
	menu_ok.setAttribute("class","button");
	menu_ok.addEventListener("click", function() {
		var lbl = ID("lbl");
		if (validate_field("lbl",rx_str5) && validate_field("min",rx_num) && validate_field("max",rx_num)) {
			send_command("lbl+" + ports[sel][0] + "+" + lbl.value);
		//	send_command("cfg+" + ports[sel][0] + "+" + port_visible);
			if (port_visible_config=="S") port_visible ="S";			
			if (port_enabled==1) {
				if (sel>=16 && sel<=23) {
					send_command("cfg+" + ports[sel][0] + "+ai"+port_visible);
					send_command("rng+" + ports[sel][0] + "+" + menumin_input.value + '+' + menumax_input.value);
					//send_command("fxa+" + ports[sel][0] + "+" + menumin_input.value);
					//send_command("fxb+" + ports[sel][0] + "+" + menumax_input.value);
				} else {
					if (port_analog==1) {
						send_command("cfg+" + ports[sel][0] + "+a"+port_visible);
					} else {
						send_command("cfg+" + ports[sel][0] + "+d"+port_visible);
					}
				}
			} else {
				send_command("cfg+" + ports[sel][0] + "+x"+port_visible);
			}
			send_command("tag+" + ports[sel][0] + "+" + tag.value);			
			//loadPortData(sel);
			ports[sel][0] = lbl.value;
			loadPortsInfo();
			//setTimeout(function(){loadPortsMenu()},500); 
			setTimeout(function(){loadPortData(sel)},1000); 
			alert("Changes applied");
		}else{
			lbl.focus();	
		}
	});
	menu_ok.appendChild(menu_ok_caption);
	tbr.appendChild(menu_ok);

	var menu_cancel_caption = CT("Cancel");
	var menu_cancel =CE("a");
//	menu_cancel.setAttribute("id","update_lbl");
	menu_cancel.setAttribute("class","button");
	menu_cancel.addEventListener("click", function() {
		loadPortsMenu();
	});
	menu_cancel.appendChild(menu_cancel_caption);
	tbr.appendChild(menu_cancel);	
	
	m.appendChild(tbr);

	d.appendChild(m);	
	document.title = "Configure port [" + ports[id][0] + "]";
}

function createGroupInPort(id){
	var d = ID("frm");
	d.innerHTML = "";
	var m = CE("ul");	
	var addblock =CE("li");
	addblock.setAttribute("class","menuitem");
	addblock.setAttribute("className","menuitem");
	addblock.setAttribute("title","Add new group");
	var add_caption = CT("Create  ");
	addblock.appendChild(add_caption);

	var alb_di = CE("select");
	alb_di.setAttribute("name","inport");
	alb_di.setAttribute("id","inport");
	for(var i = 0; i < ports.length; i++) {
//		if (ports[i][1]=="DI"){
			var opt =ports[i][0];
			var el = CE("option");
			el.textContent = opt;
			el.value = opt;
			alb_di.appendChild(el);
//		}
	}
	addblock.appendChild(alb_di);
	
	var alb_type = CE("select");
	alb_type.setAttribute("name","type");
	alb_type.setAttribute("id","type");
	for(var i = 0; i < grptypes.length; i++) {
		var el = CE("option");
		el.textContent = grptypes_desc[i];
		el.value = grptypes[i];
		alb_type.appendChild(el);
	}
	addblock.appendChild(alb_type);	
	
	var alb_do = CE("select");
	alb_do.setAttribute("name","outport");
	alb_do.setAttribute("id","outport");	
	for(var i = 0; i < ports.length; i++) {
//		if (ports[i][1]=="DO"){
			var opt =ports[i][0];
			var el = CE("option");
			el.textContent = opt;
			el.value = opt;
			alb_do.appendChild(el);
//		}
	}
	addblock.appendChild(alb_do);	
	m.appendChild(addblock);

	var tbr = CE("div");
	tbr.setAttribute("class","buttons");
	var menu_ok_caption = CT("Create");
	var menu_ok =CE("a");
	menu_ok.setAttribute("title",id);
//	menu_ok.setAttribute("id","update_lbl");
	menu_ok.setAttribute("class","button");
	menu_ok.addEventListener("click", function() {
		var pr = ports[this.title][0];
		var pa = ID("inport");
		var pb = ID("outport");
		var grpt = ID("type");
		command = "grp+" + pr + "+" + pa.value + "+" + pb.value + "+" + grpt.value;
		//alert(command);
		var resp = send_command(command);
		if (resp != "DONE") {
			alert("Error creating the group: "+ resp);
		} else {
			alert("Group created");
			loadPortData(this.title);
		}
	});
	menu_ok.appendChild(menu_ok_caption);
	tbr.appendChild(menu_ok);

	var menu_cancel_caption = CT("Cancel");
	var menu_cancel =CE("a");
//	menu_cancel.setAttribute("id","update_lbl");
	menu_cancel.setAttribute("class","button");
	menu_cancel.addEventListener("click", function() {
		displayPortDetails(portid);
	});
	menu_cancel.appendChild(menu_cancel_caption);
	tbr.appendChild(menu_cancel);	
	
	m.appendChild(tbr);
	
	d.appendChild(m);	
	document.title = "Create group";	
}




function createRemoteLink(id){
	portid = id;
	var d = ID("frm");
	d.innerHTML = "";
	var m = CE("ul");	
	var headblock =CE("li");
	headblock.setAttribute("class","menuitem");
	headblock.setAttribute("title","Remote link");
	var add_caption = CT("Link with port "+ports[id][0] + " in ");
	headblock.appendChild(add_caption);
	m.appendChild(headblock);
	
	var addblock =CE("li");
	addblock.setAttribute("class","menuitem");
	addblock.setAttribute("title","Remote link");
	var add_caption = CT("ODControl named  ");
	addblock.appendChild(add_caption);
	
	var alb_di = CE("input");
	alb_di.setAttribute("name","inport");
	alb_di.setAttribute("type","text");
	alb_di.setAttribute("id","inport");
	addblock.appendChild(alb_di);
	m.appendChild(addblock);

	var tbr = CE("div");
	tbr.setAttribute("class","buttons");
	var menu_ok_caption = CT("Create");
	var menu_ok =CE("a");
	menu_ok.setAttribute("title",id);
//	menu_ok.setAttribute("id","update_lbl");
	menu_ok.setAttribute("class","button");
	menu_ok.addEventListener("click", function() {
		var pr = ports[this.title][0];
		var pa = ID("inport");
		var grpt = ID("type");
		command = "rpt+" + pr + "+" + pa.value;
		//alert(command);
		var resp = send_command(command);
		if (resp != "DONE") {
			alert("Error creating the group: "+ resp);
		} else {
			loadPortData(portid);
		}
	});
	menu_ok.appendChild(menu_ok_caption);
	tbr.appendChild(menu_ok);

	var menu_cancel_caption = CT("Cancel");
	var menu_cancel =CE("a");
//	menu_cancel.setAttribute("id","update_lbl");
	menu_cancel.setAttribute("class","button");
	menu_cancel.addEventListener("click", function() {
		displayPortDetails(portid);
	});
	menu_cancel.appendChild(menu_cancel_caption);
	tbr.appendChild(menu_cancel);	
	
	m.appendChild(tbr);
	
	d.appendChild(m);	
	document.title = "Create group";	
}

function createCalTrigger(id){
	var d = ID("frm");
	d.innerHTML = "";
	var m = CE("ul");	
	
	var headblock =CE("li");
	headblock.setAttribute("class","menuitem");
	headblock.setAttribute("title","Remote link");
	var add_caption = CT("On specified day  ");
	headblock.appendChild(add_caption);
	m.appendChild(headblock);
	
	
	var addblock =CE("li");
	addblock.setAttribute("class","menuitem");
	addblock.setAttribute("title","Remote link");
	var add_caption = CT("set port  ");
	addblock.appendChild(add_caption);
	
	var alb_di = CE("select");
	alb_di.setAttribute("name","outport");
	alb_di.setAttribute("id","outport");
	for(var i = 0; i < ports.length; i++) {
//		if (ports[i][1]=="DI"){
			var opt =ports[i][0];
			var el = CE("option");
			el.textContent = opt;
			el.value = opt;
			alb_di.appendChild(el);
//		}
	}
	addblock.appendChild(alb_di);
	
	var alb_dv = CE("select");
	alb_dv.setAttribute("name","portval");
	alb_dv.setAttribute("id","portval");
//	for(var i = 0; i < ports.length; i++) {
//		if (ports[i][1]=="DI"){
//			var opt =ports[i][0];
			var el1 = CE("option");
			el1.textContent = "on";
			el1.value = "on";
			alb_dv.appendChild(el1);
			
			var el2 = CE("option");
			el2.textContent = "off";
			el2.value = "off";
			alb_dv.appendChild(el2);			
//		}
//	}
	addblock.appendChild(alb_dv);
	
	m.appendChild(addblock);

	var tbr = CE("div");
	tbr.setAttribute("class","buttons");
	var menu_ok_caption = CT("Create");
	var menu_ok =CE("a");
	menu_ok.setAttribute("title",id);
//	menu_ok.setAttribute("id","update_lbl");
	menu_ok.setAttribute("class","button");
	menu_ok.addEventListener("click", function() {
		var pr = ports[this.title][0];
		var pa = ID("outport");
		var pv = ID("portval");
		command = "dtg+" + pr + "+vie220000+" + pa.value + "+" + pv.value;
		//alert(command);
		var resp = send_command(command);
		if (resp != "DONE") {
			alert("Error creating the group: "+ resp);
		} else {
			alert("You can assign the proper date from the configuration panel");
			loadPortData(portid);
		}
	});
	menu_ok.appendChild(menu_ok_caption);
	tbr.appendChild(menu_ok);

	var menu_cancel_caption = CT("Cancel");
	var menu_cancel =CE("a");
	menu_cancel.setAttribute("title",id);
	menu_cancel.setAttribute("class","button");
	menu_cancel.addEventListener("click", function() {
		displayPortDetails(portid);
	});
	menu_cancel.appendChild(menu_cancel_caption);
	tbr.appendChild(menu_cancel);	
	
	m.appendChild(tbr);
	
	d.appendChild(m);	
	document.title = "Create group";	
}


function createClockTrigger(id){
	var d = ID("frm");
	d.innerHTML = "";
	var m = CE("ul");	
	
	
	var headblock =CE("li");
	headblock.setAttribute("class","menuitem");
	headblock.setAttribute("title","Remote link");
	var add_caption = CT("On specified time  ");
	headblock.appendChild(add_caption);
	m.appendChild(headblock);
	
	var addblock =CE("li");
	addblock.setAttribute("class","menuitem");
	addblock.setAttribute("title","Remote link");
	var add_caption = CT("set port  ");
	addblock.appendChild(add_caption);
	
	var alb_di = CE("select");
	alb_di.setAttribute("name","outport");
	alb_di.setAttribute("id","outport");
	for(var i = 0; i < ports.length; i++) {
//		if (ports[i][1]=="DI"){
			var opt =ports[i][0];
			var el = CE("option");
			el.textContent = opt;
			el.value = opt;
			alb_di.appendChild(el);
//		}
	}
	addblock.appendChild(alb_di);
	
	var alb_dv = CE("select");
	alb_dv.setAttribute("name","portval");
	alb_dv.setAttribute("id","portval");
//	for(var i = 0; i < ports.length; i++) {
//		if (ports[i][1]=="DI"){
//			var opt =ports[i][0];
			var el1 = CE("option");
			el1.textContent = "on";
			el1.value = "on";
			alb_dv.appendChild(el1);
			
			var el2 = CE("option");
			el2.textContent = "off";
			el2.value = "off";
			alb_dv.appendChild(el2);			
//		}
//	}
	addblock.appendChild(alb_dv);
	
	m.appendChild(addblock);

	var tbr = CE("div");
	tbr.setAttribute("class","buttons");
	var menu_ok_caption = CT("Create");
	var menu_ok =CE("a");
	menu_ok.setAttribute("title",id);
//	menu_ok.setAttribute("id","update_lbl");
	menu_ok.setAttribute("class","button");
	menu_ok.addEventListener("click", function() {
		var pr = ports[this.title][0];
		var pa = ID("outport");
		var pv = ID("portval");
		command = "ttg+" + pr + "+20130101000000+" + pa.value + "+" + pv.value;
		//alert(command);
		var resp = send_command(command);
		if (resp != "DONE") {
			alert("Error creating the group: "+ resp);
		} else {
			alert("You can assign the proper date from the configuration panel");
			loadPortData(portid);
		}
	});
	menu_ok.appendChild(menu_ok_caption);
	tbr.appendChild(menu_ok);

	var menu_cancel_caption = CT("Cancel");
	var menu_cancel =CE("a");
	menu_cancel.setAttribute("title",id);
	menu_cancel.setAttribute("class","button");
	menu_cancel.addEventListener("click", function() {
		displayPortDetails(portid);
	});
	menu_cancel.appendChild(menu_cancel_caption);
	tbr.appendChild(menu_cancel);	
	
	m.appendChild(tbr);
	
	d.appendChild(m);	
	document.title = "Create clock timer";	
}



function createZeroTrigger(id){
	var d = ID("frm");
	d.innerHTML = "";
	var m = CE("ul");	
	
	
	var headblock =CE("li");
	headblock.setAttribute("class","menuitem");
	headblock.setAttribute("title","Remote link");
	var add_caption = CT("On specified time  ");
	headblock.appendChild(add_caption);
	m.appendChild(headblock);
	
	var addblock =CE("li");
	addblock.setAttribute("class","menuitem");
	addblock.setAttribute("title","Remote link");
	var add_caption = CT("set port  ");
	addblock.appendChild(add_caption);
	
	var alb_di = CE("select");
	alb_di.setAttribute("name","outport");
	alb_di.setAttribute("id","outport");
	for(var i = 0; i < ports.length; i++) {
//		if (ports[i][1]=="DI"){
			var opt =ports[i][0];
			var el = CE("option");
			el.textContent = opt;
			el.value = opt;
			alb_di.appendChild(el);
//		}
	}
	addblock.appendChild(alb_di);
	
	var alb_dv = CE("select");
	alb_dv.setAttribute("name","portval");
	alb_dv.setAttribute("id","portval");
//	for(var i = 0; i < ports.length; i++) {
//		if (ports[i][1]=="DI"){
//			var opt =ports[i][0];
			var el1 = CE("option");
			el1.textContent = "on";
			el1.value = "on";
			alb_dv.appendChild(el1);
			
			var el2 = CE("option");
			el2.textContent = "off";
			el2.value = "off";
			alb_dv.appendChild(el2);			
//		}
//	}
	addblock.appendChild(alb_dv);
	
	m.appendChild(addblock);

	var tbr = CE("div");
	tbr.setAttribute("class","buttons");
	var menu_ok_caption = CT("Create");
	var menu_ok =CE("a");
	menu_ok.setAttribute("title",id);
//	menu_ok.setAttribute("id","update_lbl");
	menu_ok.setAttribute("class","button");
	menu_ok.addEventListener("click", function() {
		var pr = ports[this.title][0];
		var pa = ID("outport");
		var pv = ID("portval");
		command = "ztg+" + pr + "+sec+" + pa.value + "+" + pv.value;
		//alert(command);
		var resp = send_command(command);
		if (resp != "DONE") {
			alert("Error creating the group: "+ resp);
		} else {
			alert("You can assign the proper date from the configuration panel");
			loadPortData(portid);
		}
	});
	menu_ok.appendChild(menu_ok_caption);
	tbr.appendChild(menu_ok);

	var menu_cancel_caption = CT("Cancel");
	var menu_cancel =CE("a");
	menu_cancel.setAttribute("title",id);
	menu_cancel.setAttribute("class","button");
	menu_cancel.addEventListener("click", function() {
		displayPortDetails(portid);
	});
	menu_cancel.appendChild(menu_cancel_caption);
	tbr.appendChild(menu_cancel);	
	
	m.appendChild(tbr);
	
	d.appendChild(m);	
	document.title = "Create clock timer";	
}



function createConditionalTrigger(id){
	var d = ID("frm");
	d.innerHTML = "";
	var m = CE("ul");	
	var addblock =CE("li");
	addblock.setAttribute("class","menuitem");
	addblock.setAttribute("title","Remote link");
	var add_caption = CT("When " + ports[id][0] + "  ");
	addblock.appendChild(add_caption);

	var alb_dc = CE("select");
	alb_dc.setAttribute("name","condition");
	alb_dc.setAttribute("id","condition");
	for(var i = 0; i < trgtypes.length; i++) {
//		if (ports[i][1]=="DI"){
//			var opt =ports[i][0];
			var el1 = CE("option");
			el1.textContent = trgtypes_desc[i];
			el1.value = trgtypes[i];
			alb_dc.appendChild(el1);
//		}
	}
	addblock.appendChild(alb_dc);


	var alb_di = CE("select");
	alb_di.setAttribute("name","inport");
	alb_di.setAttribute("id","inport");
	for(var i = 0; i < ports.length; i++) {
//		if (ports[i][1]=="DI"){
			var opt =ports[i][0];
			var el = CE("option");
			el.textContent = opt;
			el.value = opt;
			alb_di.appendChild(el);
//		}
	}
	addblock.appendChild(alb_di);
	
	m.appendChild(addblock); // End first block
	

	var addblock =CE("li"); // Start second block
	addblock.setAttribute("class","menuitem");
	addblock.setAttribute("title","Remote link");
	var add_caption = CT("set port ");
	addblock.appendChild(add_caption);
	var alb_do = CE("select");
	alb_do.setAttribute("name","outport");
	alb_do.setAttribute("id","outport");
	for(var i = 0; i < ports.length; i++) {
		if ((ports[i][1]!="DI") && (ports[i][1]!="XX")){
			var opt =ports[i][0];
			var el = CE("option");
			el.textContent = opt;
			el.value = opt;
			alb_do.appendChild(el);
		}
	}
	addblock.appendChild(alb_do);
	
	var alb_dv = CE("select");
	alb_dv.setAttribute("name","portval");
	alb_dv.setAttribute("id","portval");
//	for(var i = 0; i < ports.length; i++) {
//		if (ports[i][1]=="DI"){
//			var opt =ports[i][0];
			var el1 = CE("option");
			el1.textContent = "on";
			el1.value = "on";
			alb_dv.appendChild(el1);
			
			var el2 = CE("option");
			el2.textContent = "off";
			el2.value = "off";
			alb_dv.appendChild(el2);			
//		}
//	}
	addblock.appendChild(alb_dv);
	
	m.appendChild(addblock);

	var tbr = CE("div");
	tbr.setAttribute("class","buttons");
	var menu_ok_caption = CT("Create");
	var menu_ok =CE("a");
	menu_ok.setAttribute("title",id);
//	menu_ok.setAttribute("id","update_lbl");
	menu_ok.setAttribute("class","button");
	menu_ok.addEventListener("click", function() {
		var pr = ports[this.title][0];
		var pc = ID("condition");
		var pi = ID("inport");
		var pa = ID("outport");
		var pv = ID("portval");
		command = "trg+" + pr + "+" + pc.value + "+" + pi.value+ "+" + pa.value + "+" + pv.value;
		//alert(command);
		var resp = send_command(command);
		if (resp != "DONE") {
			alert("Error creating the condition: "+ resp);
		} else {
			alert("Condition created");
			loadPortData(portid);
		}
	});
	menu_ok.appendChild(menu_ok_caption);
	tbr.appendChild(menu_ok);

	var menu_cancel_caption = CT("Cancel");
	var menu_cancel =CE("a");
	menu_cancel.setAttribute("title",id);
	menu_cancel.setAttribute("class","button");
	menu_cancel.addEventListener("click", function() {
		displayPortDetails(portid);
	});
	menu_cancel.appendChild(menu_cancel_caption);
	tbr.appendChild(menu_cancel);	
	
	m.appendChild(tbr);
	
	d.appendChild(m);	
	document.title = "Create conditional trigger";	
}





function loadTemplatesMenu() {
	var d = ID("frm");
	d.innerHTML = "";
	var m = CE("ul");
	
	var menu = CE("li","backmenu");
//	menu.setAttribute("class","backmenu");
	var menu_caption = CT("Back");
	menu.addEventListener("click", function() { loadMenu();});
	menu.appendChild(menu_caption);
	m.appendChild(menu);
		
	
	for (i=0;i<templates.length;i++) {
		var menu = CE("li","menuitem");
		var mnulabel = CE("label","mnu");
		mnulabel.title = i;
//		menu.setAttribute("ref","javascript:loadTemplate("+templates_id[i]+")");
//		menu.setAttribute("class","menuitem");
		var menu_caption = CT(templates[i]);
		mnulabel.addEventListener("click", function() { 
			if (confirm("Do you want to load the template [" + this.innerText + "]?")) {
				loadTemplate(this.title);
				//document.location = "/?origin=" + this.ref;
			}
			return false;
		});
		mnulabel.appendChild(menu_caption);	
		menu.appendChild(mnulabel);
		
/*		var img = CE("img");
		img.setAttribute("src","http://cloud.opendomo.com/odctp/img/exp.png");
		img.setAttribute("class","infobutton");
		img.addEventListener("click",function() {
			showHidePanel("infopanel_" +this.parentNode.title);
		});*/
		var a = CE("a","helpbutton");
		a.setAttribute("href",
			"http://cloud.opendomo.com/odctp/detail.php?id="+templates_id[i]);
		a.setAttribute("target","help");
		//a.appendChild(img);
		menu.appendChild(a);
		
		m.appendChild(menu);
		
		/*var desc = CE("li","infopanel");
		desc.setAttribute("id","infopanel_"+templates_id[i]);
		var txt = CT(templates_desc[i]);
		desc.appendChild(txt);
		m.appendChild(desc);*/
	}
	

	
	d.appendChild(m);	
	document.title = "Load templates";
}

var current_template_command = -1;
var current_template_timer;
var cmds = [];
function loadTemplate(id) {
	try {
		if (templates_cmd[id]) {
			$.mobile.loading( 'show', {
					text: 'Loading template',
					textVisible: true,
					theme: 'z',
					html: ""
				});

			cmds = templates_cmd[id].split(";");
			current_template_command = 0;
			loadTemplateNextCommand();
			/*for (var i=0;i<cmds.length;i++) {
				$.mobile.loading( 'show', {
					text: 'Loading template ('+i+'/'+(cmds.length-1) + ')',
					textVisible: true,
					theme: 'z',
					html: ""
				});

				if (cmds[i]!="" && cmds[i].indexOf("#")==-1) {
					console.log(cmds[i]);
					var resp = send_command(cmds[i]);
					console.log("Result: "+ resp);
				} 
			} */
 		}
	}catch(err){ 
		console.log("Error:" + err.message); 
	}
	$.mobile.loading('hide');
}

function loadTemplateNextCommand(){
	var i = current_template_command;
	if (i == -1 || i>= cmds.length) {
		$.mobile.loading('hide');
		clearTimeout(current_template_timer);
		return false;
	} else {
		$.mobile.loading( 'show', {
			text: 'Loading template ('+i+'/'+(cmds.length-1) + ')',
			textVisible: true,
			theme: 'z',
			html: ""
		});
		if (cmds[i].indexOf("#")==-1 && cmds[i]!="") {
			var resp = send_command(cmds[i]);
			//console.log("Result: "+ resp);
		} else {
			current_template_command++; // Jump to the next
			loadTemplateNextCommand();
		}
		current_template_command++;
		current_template_timer = setTimeout(loadTemplateNextCommand,100);
	} 
}

function loadSystemMenu() {
	var d = ID("frm");
	d.innerHTML = "";
	var m = CE("ul");
	
	var menu = CE("li");
	menu.setAttribute("class","backmenu");
	menu.setAttribute("className","backmenu");
	var menu_caption = CT("Back");
	menu.addEventListener("click", function() { loadMenu();});
	menu.appendChild(menu_caption);
	m.appendChild(menu);
		
	var menu = CE("li");
	var label = CT("Admin pass");
	menu.setAttribute("class","menuitem");
	menu.setAttribute("className","menuitem");
	menu.appendChild(label);
	var pass = CE("input");
	pass.setAttribute("type","password");
	pass.setAttribute("id","password");
	menu.appendChild(pass);
	m.appendChild(menu);

	var menu = CE("li");	
	menu.setAttribute("class","menuitem OOFF");
	menu.setAttribute("className","menuitem OOFF");
	menu.setAttribute("title",i);
	var menu_caption = CT("Change ODControl name");
	menu.appendChild(menu_caption);
	menu.addEventListener("click",function() {
		var name = prompt("Insert the new name");
		if (name && name.length == 5 && "DONE"==send_command("snm+"+name)) {
			loadMenu();
		} else {
			alert("Invalid name");
		}
	});		
	m.appendChild(menu);


	/* Lock/unlock menu
	var menu = CE("li");
	if (odcontrolversion=="LOCKED") {
		menu.setAttribute("class","menuitem OON");
		menu.setAttribute("className","menuitem OON");
		menu.setAttribute("title",i);
		var menu_caption = CT("Locked");
		menu.appendChild(menu_caption);
		var menu_vis = CE("a");	
		menu_vis.setAttribute("class","OOFF");
		var menu_vis_caption = CT("ON");
		menu_vis.addEventListener("click",function() {
			if (odcontrolversion!="LOCKED") {
				if ("DONE"==send_command("sec+lock")){
					this.parentNode.setAttribute("class", "menuitem OON");		
					this.setAttribute("class","OOFF");
					odcontrolversion="LOCKED";
					loadODControlData();
				} else {
					alert("Cannot lock");
				}
			} else {
				pass = prompt("Insert the unlock password");
				if ("DONE"==send_command("sec+ulock+"+pass)) {
					this.parentNode.setAttribute("class", "menuitem OOFF");
					this.setAttribute("class","OON");
					odcontrolversion="UNLOCKED";
					loadODControlData();					
				} else {
					alert("Cannot unlock");
				}
			}
		});
	} else {
		menu.setAttribute("class","menuitem OOFF");
		menu.setAttribute("className","menuitem OOFF");
		menu.setAttribute("title",i);
		var menu_caption = CT("Locked");
		menu.appendChild(menu_caption);
		var menu_vis = CE("a");	
		menu_vis.setAttribute("class","OON");	
		var menu_vis_caption = CT("OFF");
		menu_vis.addEventListener("click",function() {
			if (odcontrolversion!="LOCKED") {
				if ("DONE"==send_command("sec+lock")){
					this.parentNode.setAttribute("class", "menuitem OON");		
					this.setAttribute("class","OOFF");
					odcontrolversion="LOCKED";
					loadODControlData();
				} else {
					alert("Cannot lock");
				}
			} else {
				pass = prompt("Insert the unlock password");
				if ("DONE"==send_command("sec+ulock+"+pass)) {
					this.parentNode.setAttribute("class", "menuitem OOFF");
					this.setAttribute("class","OON");
					odcontrolversion="UNLOCKED";
					loadODControlData();
				} else {
					alert("Cannot unlock");
				}
			}
		});		
	}
	menu_vis.appendChild(menu_vis_caption);
	menu.appendChild(menu_vis);	
	m.appendChild(menu); */
	
	
	// Toolbar	
	var tbr = CE("div");
	tbr.setAttribute("class","buttons");
	var menu_ok_caption = CT("Save password");
	var menu_ok =CE("a");
	menu_ok.setAttribute("class","button");
	menu_ok.addEventListener("click", function() {
		var pa = ID("password");
		command = "sec+webcf+" + pa.value;
		//alert(command);
		var resp = send_command(command);
		if (resp != "DONE") {
			alert("Error assigning password "+ resp);
		} else {
			send_command("sec+passw+"+ pa.value);
			alert("Password changed");
			loadMenu();
		}
	});
	menu_ok.appendChild(menu_ok_caption);
	tbr.appendChild(menu_ok);

	var menu_cancel_caption = CT("Cancel");
	var menu_cancel =CE("a");
//	menu_cancel.setAttribute("id","update_lbl");
	menu_cancel.setAttribute("class","button");
	menu_cancel.addEventListener("click", function() {
		loadPortsMenu();
	});
	menu_cancel.appendChild(menu_cancel_caption);
	tbr.appendChild(menu_cancel);	
	
	m.appendChild(tbr);
			
		
	var desc = CE("li");
	desc.setAttribute("id","infopanel_"+templates_id[i]);
	var txt = CT(templates_desc[i]);
	desc.appendChild(txt);
	desc.setAttribute("class","infopanel");
	m.appendChild(desc);


	
	d.appendChild(m);	
	document.title = "Security";
}


function showHidePanel(id) {
	var p = ID(id);
	if (p) {
		if (p.style.display != "block") {
			p.style.display = "block";
		} else {
			p.style.display = "none";
		}
	}
}

var raw_ports = 	new Array();
var ports = 		new Array();
var raw_links = 	new Array();
var mylinks = 		new Array();

var odcontrolversion = "";


function loadODControlData() {
	var xmlhttpVER;
	/*
	var log = ID("log");

	var hlp = CE("div");
	hlp.setAttribute("id","helpfrm");
	var fr = CE("iframe");
	fr.setAttribute("src","http://cloud.opendomo.com/odctp/welcome.php");
	fr.setAttribute("name","help");
	hlp.appendChild(fr);
	log.appendChild(hlp);
	var eventlog = CE("div");
	eventlog.setAttribute("id","list");
	log.appendChild(eventlog); */

	if (window.XMLHttpRequest)
		xmlhttpVER=new XMLHttpRequest();// code for IE7+, Firefox, Chrome, Opera, Safari
	else 
		xmlhttpVER=new ActiveXObject("Microsoft.XMLHTTP"); // code for IE6, IE5 and ancient electromechanic devices...

	xmlhttpVER.onreadystatechange=function()
		{
			if (xmlhttpVER.readyState==4 && xmlhttpVER.status==200)
			{
				var f = ID("footer");
				response = xmlhttpVER.responseText;
				if (response == "DONE") {
					f.innerHTML = "ODControl is LOCKED <a class='button' href='javascript:loadSecurityMenu();'>Unlock</a>";
					odcontrolversion = "LOCKED";
				} else {
					var p = response.split(" ");
					f.innerHTML = "v." + p[2];
					odcontrolversion = p[2];
				}
			}
		}
	xmlhttpVER.open("GET","ver+",true);
	xmlhttpVER.send();	
	
	loadPortsInfo();

	loadLinksInfo();
}

function loadPortsInfo() {
	var xmlhttpLST;
	var xmlhttpLST2;
	if (window.XMLHttpRequest){
		xmlhttpLST=new XMLHttpRequest();// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttpLST2 = new XMLHttpRequest();
		xmlhttpLST3 = new XMLHttpRequest();
	}
	else 
	{ 
		xmlhttpLST=new ActiveXObject("Microsoft.XMLHTTP"); // code for IE6, IE5 and ancient electromechanic devices...
		xmlhttpLST2=new ActiveXObject("Microsoft.XMLHTTP");
		xmlhttpLST3=new ActiveXObject("Microsoft.XMLHTTP");
	}
		

	xmlhttpLST.onreadystatechange=function()
		{
			if (xmlhttpLST.readyState==4 && xmlhttpLST.status==200)
			{
				var response = xmlhttpLST.responseText;
				raw_ports = response.split("\n");
				for (i=0;i<raw_ports.length;i++) {
					if (raw_ports[i] != "DONE") {
						var s = raw_ports[i].split(":");
						try {
						ports[i+0]=new Array(
							s[0],
							s[1].substring(0,2),
							s[1].substring(3,4),
							s[1], 
							s[2],
							s[3],
							s[1]);
						} catch (e) {}
					}
				}
			}
		}
	xmlhttpLST.open("GET","lsc+00-23",true);
	xmlhttpLST.send();
	
	xmlhttpLST2.onreadystatechange=function()
		{
			if (xmlhttpLST2.readyState==4 && xmlhttpLST2.status==200)
			{
				var response = xmlhttpLST2.responseText;
				raw_ports = response.split("\n");
				for (i=0;i<raw_ports.length;i++) {
					if (raw_ports[i] != "DONE") {
						var s = raw_ports[i].split(":");
						try {
						ports[i+23]=new Array(
							s[0],
							s[1].substring(0,2),
							s[1].substring(3,4),
							s[1], 
							s[2],
							s[3],
							s[1]);
						} catch (e) {}
					}
				}
			}
		}
	xmlhttpLST2.open("GET","lsc+24-47",true);
	xmlhttpLST2.send();


	xmlhttpLST3.onreadystatechange=function()
		{
			if (this.readyState==4 && this.status==200)
			{
				var response = this.responseText;
				raw_ports = response.split("\n");
				for (i=0;i<raw_ports.length;i++) {
					if (raw_ports[i] != "DONE") {
						var s = raw_ports[i].split(":");
						try {
						ports[i+47]=new Array(
							s[0],
							s[1].substring(0,2),
							s[1].substring(3,4),
							s[1], 
							s[2],
							s[3],
							s[1]);
						} catch (e) {}
					}
				}
			}
		}
	xmlhttpLST3.open("GET","lsc+48-71",true);
	xmlhttpLST3.send();
}

function loadLinksInfo() {

	mylinks = new Array();
	raw_links = new Array();
	var xmlhttpLLN;
	if (window.XMLHttpRequest)
		xmlhttpLLN=new XMLHttpRequest();// code for IE7+, Firefox, Chrome, Opera, Safari
	else 
		xmlhttpLLN=new ActiveXObject("Microsoft.XMLHTTP"); // code for IE6, IE5 and ancient electromechanic devices...

	xmlhttpLLN.onreadystatechange=function()
		{
			if (xmlhttpLLN.readyState==4 && xmlhttpLLN.status==200)
			{
				var response = xmlhttpLLN.responseText;
				raw_links = response.split("\n");
				for (i=0;i<raw_links.length;i++) {
					if (raw_links[i] != "DONE" && raw_links[i]!="") {
						var s = raw_links[i].split(":");
						mylinks[i]=new Array(s[0],s[1],s[2], "");
					}
				}				
			}
		}
	xmlhttpLLN.open("GET","lln",true);
	xmlhttpLLN.send();
	
}

function loadPortData(port) {
	var xmlhttpVER;
	if (window.XMLHttpRequest)
		xmlhttpPort=new XMLHttpRequest();// code for IE7+, Firefox, Chrome, Opera, Safari
	else 
		xmlhttpPort=new ActiveXObject("Microsoft.XMLHTTP"); // code for IE6, IE5 and ancient electromechanic devices...

	xmlhttpPort.myportnumber = port;
	xmlhttpPort.myURL= "lst+"+ports[port][0];
	xmlhttpPort.onreadystatechange=function()
		{
			if (this.readyState==4 && this.status==200)
			{
				var response = this.responseText;
				var parts = response.split(" ");
				var val2 = parts[0].split(":");
				
				ports[this.myportnumber][3] = response;
				//for (i=0;i<ports.length;i++) {
				//	if (ports[i][0] == val2[1]) {
				//		ports[i][3] = response;				
				//	}
				//}
				displayPortDetails(this.myportnumber);
			} else {
				ports[this.myportnumber][3] = "ERROR";			
			}
		}
	xmlhttpPort.open("GET",xmlhttpPort.myURL,true);
	xmlhttpPort.send();	
}


function initializeTests(){
	var d = ID("list");
	var e = ID("qunit");
	if (!e){ 
		var e = CE("div");
		e.setAttribute("id","qunit");
		d.appendChild(e);

		var k = CE("div");
		k.setAttribute("id","qunit-fixture");
		d.appendChild(k);
	}


	var fileref=CE('script');
	fileref.setAttribute("type","text/javascript")
	fileref.setAttribute("src", "http://cloud.opendomo.com/js/jquery-1.10.1.min.js");
	d.appendChild(fileref);

	var fileref=CE("link");
	fileref.setAttribute("rel", "stylesheet");
	fileref.setAttribute("type", "text/css");
	fileref.setAttribute("href", "http://cloud.opendomo.com/css/qunit-1.12.0.css");
	d.appendChild(fileref);

	var fileref=CE('script');
	fileref.setAttribute("type","text/javascript")
	fileref.setAttribute("src", "http://cloud.opendomo.com/js/qunit-1.12.0.js");
	d.appendChild(fileref);

	setTimeout(launchTests,1000);
}

function launchTests(){
	QUnit.init();
	test( "Basic functions", function() {
		ok( true, "Function 'ok'" );
		equal( 1, 1, "Function 'equal'" );
	});
	QUnit.start();
}


function initializeHelp(){
	var d = ID("list");

	var fileref=CE('script');
	fileref.setAttribute("type","text/javascript")
	fileref.setAttribute("src", "http://cloud.opendomo.com/js/jquery-ui-1.10.3.js");
	document.getElementsByTagName("head")[0].appendChild(fileref);

	var fileref=CE('script');
	fileref.setAttribute("type","text/javascript")
	fileref.setAttribute("src", "http://cloud.opendomo.com/js/tourist.js");
	document.getElementsByTagName("head")[0].appendChild(fileref);

	var fileref=CE("link");
	fileref.setAttribute("rel", "stylesheet");
	fileref.setAttribute("type", "text/css");
	fileref.setAttribute("href", "http://cloud.opendomo.com/odctp/tourist.css");
	document.getElementsByTagName("head")[0].appendChild(fileref);

	var fileref=CE('script');
	fileref.setAttribute("type","text/javascript")
	fileref.setAttribute("src", "http://cloud.opendomo.com/odctp/lessons.js");
	document.getElementsByTagName("head")[0].appendChild(fileref);
	setTimeout(launchHelp,1000);
}

var steps;
function launchHelp(){
//*
//'top left': [0, 0],
//'left top': [0, 0],
//'top right': [width, 0],
//'right top': [width, 0],
//'bottom left': [0, height],
//'left bottom': [0, height],
//'bottom right': [width, height],
//'right bottom': [width, height],
//'top center': [width2, 0],
//'left center': [0, height2],
//'right center': [width, height2],
//'bottom center': [width2, height]


	if (!steps) {
			steps = [{
			content: '<p>Using this menu you can easily configure ODControl</p>',
			highlightTarget: true,
			nextButton: true,
			target: $('#cat-tools'),
			my: 'top center',
			at: 'bottom center'
		}, {
			content: '<p>All ports (digital, analog and virtual) can be configured from here.</p>',
			highlightTarget: true,
			nextButton: true,
			target: $('#mnuports'),
			my: 'top center',
			at: 'bottom center'
		}, {
			content: '<p>After saving the changes, you will see the results here.</p>',
			highlightTarget: true,
			nextButton: true,
			target: $('#list'),
			my: 'top center',
			at: 'top center'
		}]
	}

	var tour = new Tourist.Tour({
		steps: steps,
/*		tipClass: 'Bootstrap',
		tipOptions:{ showEffect: 'slidein' }  */
	});
	tour.start();
}



var fileref=CE("link");
fileref.setAttribute("rel", "stylesheet");
fileref.setAttribute("type", "text/css");
fileref.setAttribute("href", "http://cloud.opendomo.com/odctp/configurator2.css");
document.getElementsByTagName("head")[0].appendChild(fileref);

var fileref=CE("link");
fileref.setAttribute("rel", "stylesheet");
fileref.setAttribute("type", "text/css");
fileref.setAttribute("href", "http://cloud.opendomo.com/css/jquery.mobile-1.3.1.min.css");
document.getElementsByTagName("head")[0].appendChild(fileref);


var fileref=CE('script');
fileref.setAttribute("type","text/javascript")
fileref.setAttribute("src", "http://cloud.opendomo.com/js/jquery-1.10.1.min.js");
document.getElementsByTagName("head")[0].appendChild(fileref);

var fileref=CE('script');
fileref.setAttribute("type","text/javascript")
fileref.setAttribute("src", "http://cloud.opendomo.com/js/underscore-1.4.4.js");
document.getElementsByTagName("head")[0].appendChild(fileref);




addEventListener("load",function(){
//	var p = ID("log");
//	if (p) {

		var fileref=CE('script');
		fileref.setAttribute("type","text/javascript")
		fileref.setAttribute("src", "http://cloud.opendomo.com/odctp/list.php")
		document.getElementsByTagName("head")[0].appendChild(fileref);

		var fileref=CE('script');
		fileref.setAttribute("type","text/javascript")
		fileref.setAttribute("src", "http://cloud.opendomo.com/js/backbone-1.0.0.js");
		document.getElementsByTagName("head")[0].appendChild(fileref);

		var fileref=CE('script');
		fileref.setAttribute("type","text/javascript")
		fileref.setAttribute("src", "http://cloud.opendomo.com/js/highlight.js");
		document.getElementsByTagName("head")[0].appendChild(fileref);

		var fileref=CE('script');
		fileref.setAttribute("type","text/javascript")
		//fileref.setAttribute("src", "http://cloud.opendomo.com/js/jquery.mobile-1.3.1.min.js");
		fileref.setAttribute("src", "http://code.jquery.com/mobile/1.3.2/jquery.mobile-1.3.2.min.js");
		document.getElementsByTagName("head")[0].appendChild(fileref);

		var code = "";
		code = code + "<div data-role='page' id='con'>";
		//code = code + "<div id='header'>";
		code = code + " <div data-role='header' class='categories'>";
		code = code + "  <h1>ODControl2</h1>";
		code = code + "  <a id='cat-map' onclick=\"GO('hme');\">Home</a>";
		//code = code + "  <a id='cat-tools' onclick='document.location=cnf'>Config</a>";			
		code = code + "  <a id='cat-help' target='help' href='http://www.opendomo.com/wiki/index.php?title=ODControlConfigurator'>Help</a>";
		code = code + "</div>";
		//code = code + "</div>";
		code = code + "<div data-role='content'>";
		code = code + "  <div id='frm'>Loading...</div>";
		code = code + "  <div id='helpfrm'><iframe src='http://cloud.opendomo.com/odctp/welcome.php' name='help'></iframe></div>";
		code = code + "</div>";
		code = code + "<div data-role='footer' id='footer'></div>";
		code = code + "<div id='list'></div>";
		code = code + "</div>";
		code = code + "<div data-role='page' id='demo'></div>";
		document.body.innerHTML = code;

		var totalok=0;

		loadODControlData();
		setTimeout(function(){loadMenu()},500); 
	
		document.title = "Advanced configuration";
//	} else {
//		alert("Defective DOM");
//	}
});

function GO(url) {
	$.mobile.changePage( url, { transition: "flip"} );
}
