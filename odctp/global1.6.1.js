var rx_ip='^(([01]?[0-9]?[0-9]|2([0-4][0-9]|5[0-5]))\.){3}([01]?[0-9]?[0-9]|2([0-4][0-9]|5[0-5]))$';
var rx_ttg='^[*0-1][*0-9]/[*0-3][*0-9] [*0-2][*0-9]:[*0-5][*0-9]:[*0-5][*0-9]$';
var rx_dtg='^[a-z][a-z][a-z] [0-2][0-9]:[0-6][0-9]:[0-6][0-9]$';
var rx_time='^20[0-9][0-9]/[0-1][0-9]/[0-3][0-9] [0-2][0-9]:[0-5][0-9]:[0-5][0-9]$';
var rx_str='^[a-zA-Z0-9]+$';
var rx_str5='^[a-zA-Z0-9]{5}$';
var rx_num='^[0-9]{5}$';

var port_visible = "h";
var port_visible_config = "";
var port_enabled = 1;
var port_analog = 0;
var portid = 0;

var errorlog = [];

// http://www.opendomo.com/wiki/index.php?title=Comandos_de_ODControl#Enlazar_puertos_.28lnk.29
var lnktypes = 	["d",      "i",     "p",      "c",      "r",      "t",        "s",    "2",     "3",    "l",   "b",    "k", "n", "N","o","f"];
var lnktypes_desc =	["direct", "invers","pulse", 	"change", "return", "t-return", "self", "double", "triple", "long", "boot", "interlink","Up-counter", "Down-counter", "Set ON", "Set OFF"];

var grptypes 		= ["and","nand","or","nor","xor","not","add","sub","mul","div","max","min"];
var grptypes_desc 	= ["and","nand","or","nor","xor","not"," + "," - "," x "," / ","max","min"];

var trgtypes = ["cmpeq","cmpne","cmpgt","cmplt","cmpge","cmple"];
var trgtypes_desc = ["==","!=",">","<",">=","<="];

var tags 		= ["untag","l","c","s","e"];
var tags_desc 	= ["none", "light","climate","security","energy"];

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

function pad(s,m) {
	return s.length<m?pad("0"+s,m):s;
}

function validate_field(id,patt) {
	var i=document.getElementById(id);
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
	var log = document.getElementById("list");
	//log = document.body;
	if (log) {
		var list = document.createElement("p");
		list.setAttribute("class", level);
		log.appendChild(list);
		var line = document.createTextNode(text);
		list.appendChild(line);
	}
}

function add_error_line(command, text, level) {
    /*
	var log = document.getElementById("list");
	//log = document.body;
	if (log) {
		var link = document.createElement("a");
		link.setAttribute("href","http://www.opendomo.com/wiki/index.php?title=C%C3%B3digos_de_error_de_ODControl#" + text);
		link.setAttribute("target", "help");
		var list = document.createElement("p");
		var line = document.createTextNode("Error in command '"+command+"'");
		list.setAttribute("class", level);
		link.appendChild(line);
		list.appendChild(link);
		log.appendChild(list);
	}
    */
}


function add_header() {
	var log = document.getElementById("log");
	if (log) {
		var header = document.createElement("div");
		header.setAttribute("id", "header");
		header.innerHTML="<div class='categories'><a id='cat-help' target='new' href='http://www.opendomo.com/wiki/'>Help</a></div>";
		log.appendChild(header);

		var body = document.createElement("div");
		body.setAttribute("id","body");
			var list = document.createElement("div");
			list.setAttribute("id","list");
			body.appendChild(list);
		log.appendChild(body);
	}
}

function add_toolbar() {
	var log = document.getElementById("log");
	if (log) {
		var line = document.createElement("div");
		line.setAttribute("class", "toolbar");
		line.innerHTML="<a class='button' onclick='window.close();'>Close</a><a  class='button'  onclick=\"document.location='http://'+document.location.hostname+'/cnf';\">Configure</a>";
		log.appendChild(line);
	}
}

function popupwindow(url){
	window.open(url,"odctp","menubar=0,resizable=1,scrollbar=1,width=500,height=700");
}

function loadjscssfile(filename, filetype){
	if (filetype=="js"){ //if filename is a external JavaScript file
		var fileref=document.createElement('script')
		fileref.setAttribute("type","text/javascript")
		fileref.setAttribute("src", filename)
	}
	else if (filetype=="css"){ //if filename is an external CSS file
		var fileref=document.createElement("link")
		fileref.setAttribute("rel", "stylesheet")
		fileref.setAttribute("type", "text/css")
		fileref.setAttribute("href", filename)
	}
	if (typeof fileref!="undefined")
		document.getElementsByTagName("head")[0].appendChild(fileref)
}

function send_command(strURL)
{
	var URL = strURL.replace(/ /g,"+");
	var ur = URL.split(";");
	var xmlHttp = new XMLHttpRequest();
	var respo="";

	for (var i=0;i < ur.length;i++) {

		xmlHttp.open('GET', "./" + ur[i], false);
		xmlHttp.setRequestHeader("If-None-Match","some-random-string");
		xmlHttp.setRequestHeader("Cache-Control","no-cache,max-age=0");
		xmlHttp.setRequestHeader("Pragma","no-cache");
		//xmlHttp.setRequestHeader("Connection","close");
		xmlHttp.send(null);

		while(xmlHttp.readyState==0) {/* Just wait */ }
		var command = ur[i].replace(/\+/g," ");
		var resp = xmlHttp.responseText;

		if (xmlHttp.readyState==4 && (resp.indexOf("DONE")>-1)) {
			add_line("Command '"+command+ "' successful ", "notice");
		} else {
			//FIXME: lbl command sometimes fails when repeating
			if (ur[i].indexOf("lbl") != -1) {
				add_line("Command '"+command+ "' successful ", "notice");
			}
			else
			{
				add_error_line(command, resp, "error");
				return resp;
			}
		}
		respo = respo +  xmlHttp.responseText + "\n";
	}
   return respo;
}

function loadMenu(){
	var d = document.getElementById("frm");
	d.innerHTML = "";
	document.title = "Advanced configuration";

	var m = document.createElement("ul");

	var menu_template = document.createElement("li");
	menu_template.setAttribute("class","menuitem");
	menu_template.setAttribute("className","menuitem");
	var menu_template_caption = document.createTextNode("Load configuration from template");
	menu_template.appendChild(menu_template_caption);
	menu_template.addEventListener("click", function() { loadTemplatesMenu();});
	m.appendChild(menu_template);


	var menu_sec = document.createElement("li");
	menu_sec.setAttribute("class","menuitem");
	var menu_sec_caption = document.createTextNode("Save configuration to template");
	menu_sec.appendChild(menu_sec_caption);
	menu_sec.addEventListener("click", function() {
		if (cloudSessionStarted == false) {
			alert("You need to log into the Cloud service first.");
		} else {
			submitTemplate(outputTemplate());
		}
	});
	m.appendChild(menu_sec);
	d.appendChild(m);

	var menu_ports = document.createElement("li");
	menu_ports.setAttribute("class","menuitem");
	var menu_ports_caption = document.createTextNode("Configure ports");
	menu_ports.appendChild(menu_ports_caption);
	menu_ports.addEventListener("click", function() { loadPortsMenu();});
	m.appendChild(menu_ports);
	d.appendChild(m);

	var menu_links = document.createElement("li");
	menu_links.setAttribute("class","menuitem");
	var menu_links_caption = document.createTextNode("Configure links");
	menu_links.appendChild(menu_links_caption);
	menu_links.addEventListener("click", function() { loadLinksMenu();});
	m.appendChild(menu_links);
	d.appendChild(m);

	var menu_sec = document.createElement("li");
	menu_sec.setAttribute("class","menuitem");
	var menu_sec_caption = document.createTextNode("Send command");
	menu_sec.appendChild(menu_sec_caption);
	menu_sec.addEventListener("click", function() {showExecuteCommandMenu(); });
	m.appendChild(menu_sec);
	d.appendChild(m);

	var menu_sec = document.createElement("li");
	menu_sec.setAttribute("class","menuitem");
	menu_sec.setAttribute("className","menuitem");
	var menu_sec_caption = document.createTextNode("Security options");
	menu_sec.appendChild(menu_sec_caption);
	menu_sec.addEventListener("click", function() { loadSecurityMenu();});
	m.appendChild(menu_sec);
	d.appendChild(m);

	var menu_net = document.createElement("li");
	menu_net.setAttribute("class","menuitem");
	menu_net.setAttribute("className","menuitem");
	var menu_net_caption = document.createTextNode("Network configuration");
	menu_net.appendChild(menu_net_caption);
	menu_net.addEventListener("click", function() { loadNetworkConfig();});
	m.appendChild(menu_net);
	d.appendChild(m);

	var menu_snm = document.createElement("li");
	menu_snm.setAttribute("class","menuitem");
	var menu_snm_caption = document.createTextNode("Change ODControl name");
	menu_snm.appendChild(menu_snm_caption);
	menu_snm.addEventListener("click", function() { changeODControlName();});
	m.appendChild(menu_snm);
	d.appendChild(m);



	var menu_default = document.createElement("li");
	menu_default.setAttribute("class","menuitem");
	var menu_default_caption = document.createTextNode("Clear configuration");
	menu_default.appendChild(menu_default_caption);
	menu_default.addEventListener("click", function() {
		if (confirm("Do you want to clear the configuration? All changes will be lost"))
			send_command('clr');
			setTimeout(function(){document.location.reload();},2000);

		});
	m.appendChild(menu_default);
	d.appendChild(m);



}

function ptoREST(data) {
	var t = data.replace("DONE","");
	var obj = {};
	var r = t.split(" ");
	for (i=0;i<r.length;i++) {
		var p = r[i].split(":");
		if (p[0]) obj[p[0]] = p[1];
	}
	return obj;
}

function loadNetworkConfig(){
	try {
		var data = ptoREST(send_command("net+show"));
		if (!data) data = {
			webuiport:80,
			webcfport:81,
			protoport:1729,
			};

		var d = document.getElementById("frm");
		d.innerHTML = "";
		var m = document.createElement("ul");

		var menu = document.createElement("li");
		menu.setAttribute("class","backmenu");
		var menu_caption = document.createTextNode("Back");
		menu.addEventListener("click", function() {
			loadMenu();
		});
		menu.appendChild(menu_caption);
		m.appendChild(menu);

		var menu = document.createElement("li");
		var label = document.createTextNode("Web control port");
		menu.setAttribute("class","menuitem");
		menu.setAttribute("className","menuitem");
		menu.appendChild(label);
		var webui = document.createElement("input");
		webui.setAttribute("type","number");
		webui.setAttribute("id","webui");
		webui.setAttribute("value",data.webuiport);
		menu.appendChild(webui);
		m.appendChild(menu);

		var menu = document.createElement("li");
		var label = document.createTextNode("Web config port");
		menu.setAttribute("class","menuitem");
		menu.setAttribute("className","menuitem");
		menu.appendChild(label);
		var webcf = document.createElement("input");
		webcf.setAttribute("type","number");
		webcf.setAttribute("id","webcf");
		webcf.setAttribute("value",data.webcfport);
		menu.appendChild(webcf);
		m.appendChild(menu);

		var menu = document.createElement("li");
		var label = document.createTextNode("Encrypted port");
		menu.setAttribute("class","menuitem");
		menu.setAttribute("className","menuitem");
		menu.appendChild(label);
		var proto = document.createElement("input");
		proto.setAttribute("type","number");
		proto.setAttribute("id","proto");
		proto.setAttribute("value",data.protoport);
		menu.appendChild(proto);
		m.appendChild(menu);

		var tbr = document.createElement("div");
		tbr.setAttribute("class","buttons");
		var menu_ok_caption = document.createTextNode("Save changes");
		var menu_ok =document.createElement("a");
		menu_ok.setAttribute("class","button");
		menu_ok.addEventListener("click", function() {
			var webui_value = document.getElementById("webui").value;
			send_command("net+port+webui+" + webui_value);
			var webcf_value = document.getElementById("webcf").value;
			send_command("net+port+webcf+" + webcf_value);
			var proto_value = document.getElementById("proto").value;
			send_command("net+port+proto+" + proto_value);
		});
		menu_ok.appendChild(menu_ok_caption);
		tbr.appendChild(menu_ok);
		m.appendChild(tbr);

		d.appendChild(m);
	} catch (e) {
		errorHandler(e);
	}
}

function loadLinksMenu() {
	var d = document.getElementById("frm");
	d.innerHTML = "";
	var m = document.createElement("ul");

	var menu = document.createElement("li");
	menu.setAttribute("class","backmenu");
	var menu_caption = document.createTextNode("Back");
	menu.addEventListener("click", function() {
		loadMenu();
	});
	menu.appendChild(menu_caption);
	m.appendChild(menu);

	for (i=0;i<mylinks.length;i++) {
		var menu = document.createElement("li");
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

		var dellnk = document.createElement("img");
		dellnk.setAttribute("src","http://cloud.opendomo.com/odctp/img/del.png");
		dellnk.setAttribute("class","infobutton");
		dellnk.addEventListener("click",function(){
			var l = parseInt(this.parentNode.title);
			command = "unl+" + mylinks[l][0] + "+" + mylinks[l][1] + "+" + mylinks[l][2] ;
			ret = send_command(command);
			if (ret.indexOf("DONE")!=-1) {
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

	var addblock1 =document.createElement("li");
	addblock1.setAttribute("class","menuitem");
	addblock1.setAttribute("className","menuitem");
	addblock1.setAttribute("title","Add new link");
	var addblock1_caption = document.createTextNode("Add new link:");
	addblock1.appendChild(addblock1_caption);
	m.appendChild(addblock1);

	var addblock =document.createElement("li");
	addblock.setAttribute("class","menuitem");
	addblock.setAttribute("className","menuitem");
	//addblock.setAttribute("title","Add new link");



	var alb_di = document.createElement("select");
	alb_di.setAttribute("name","inport");
	alb_di.setAttribute("id","inport");
	for(var i = 0; i < ports.length; i++) {
		if (ports[i] && ports[i][1]!="XX"){
			var opt =ports[i][0];
			var el = document.createElement("option");
			el.textContent = opt;
			el.value = opt;
			alb_di.appendChild(el);
		}
	}
	addblock.appendChild(alb_di);

	var alb_do = document.createElement("select");
	alb_do.setAttribute("name","outport");
	alb_do.setAttribute("id","outport");
	for(var i = 0; i < ports.length; i++) {
		if (ports[i] && (ports[i][1]!="XX") && (ports[i][1]!="DI") && (ports[i][1]!="AI")){
			var opt =ports[i][0];
			var el = document.createElement("option");
			el.textContent = opt;
			el.value = opt;
			alb_do.appendChild(el);
		}
	}
	addblock.appendChild(alb_do);
	m.appendChild(addblock);

	var addblock2 =document.createElement("li");
	addblock2.setAttribute("class","menuitem");
	addblock2.setAttribute("className","menuitem");
	addblock2.appendChild(document.createTextNode("Link type:"));

	var alb_type = document.createElement("select");
	alb_type.setAttribute("name","type");
	alb_type.setAttribute("id","type");
	for(var i = 0; i < lnktypes.length; i++) {
		var el = document.createElement("option");
		el.textContent = lnktypes_desc[i] + " ("+lnktypes[i]+")";
		el.value = lnktypes[i];
		alb_type.appendChild(el);
	}
	addblock2.appendChild(alb_type);

	var alb_btn = document.createElement("img");
	alb_btn.setAttribute("name","add");
	alb_btn.setAttribute("class","infobutton");
	alb_btn.setAttribute("src","http://cloud.opendomo.com/odctp/img/add.png");
	alb_btn.addEventListener("click",function(){
		var dip = document.getElementById("inport");
		var dop = document.getElementById("outport");
		var lnkt = document.getElementById("type");
		for (l=0;l<mylinks.length;l++) {
			if ((mylinks[l][0]==dip.value) && (mylinks[l][1]==dop.value)){
				alert("Warning: ports " + dip.value + " and " + dop.value + " are already linked.\nThis is a valid configuration for interlink ports, \nbut for other types the new link will overwrite the old one.");
			}
		}
		command = "lnk+" + dip.value + "+" + dop.value + "+" + lnkt.value;
		retval = send_command(command);
		if (retval.indexOf("DONE")!=-1) {
			alert("Link created");
			loadLinksInfo();
			setTimeout(function(){loadLinksMenu()},500);
		} else {
			alert("The link was not created: "+retval);
		}
	});
	addblock2.appendChild(alb_btn);

	m.appendChild(addblock2);

	d.appendChild(m);
	document.title = "Configure links";
}


function loadPortsMenu() {
	var d = document.getElementById("frm");
	d.innerHTML = "";
	var m = document.createElement("ul");

	var menu = document.createElement("li");
	menu.setAttribute("class","backmenu");
	var menu_caption = document.createTextNode("Back");
	menu.addEventListener("click", function() { loadMenu();});
	menu.appendChild(menu_caption);
	m.appendChild(menu);

	for (i=0;i<ports.length;i++) {
		try {
			var menu = document.createElement("li");
			menu.setAttribute("class","menuitem type"+ports[i][1]);
			menu.setAttribute("className","menuitem type"+ports[i][1]);
			menu.setAttribute("title",i);
			var menu_caption = document.createTextNode(ports[i][0]);

			menu.addEventListener("click", function() {
				displayPortDetails(this.title);
				//alert("loading "+pid);
				//displayPortDetails(pid);
			});
			menu.appendChild(menu_caption);
			m.appendChild(menu);
			} catch (e) { console.log("Error in element "+ i); }
	}
	d.appendChild(m);
	document.title = "Configurar puertos";
}

function isvisible(id) {
	return ((ports[id][3].indexOf("M")>0)||(ports[id][3].indexOf("C")>0));
}
function isinconfig(id) {
	return (ports[id][3].indexOf("C")>0);
}
function isenabled(id) {
	return ((ports[id][3].indexOf("X")==-1));
}
function isdigital(id) {
	return (id<16);
}
function isanalog(id) {
	return (id >= 16 && id <= 23);
}
function isvirtual(id) {
	return (id >23);
}

var sel;
function displayPortDetails(id) {
	if (ports[id][0].indexOf("$")==0) {alert("System port");return false;}
	sel = id;
	portid = id;
	try {
	document.title = "Configure port [" + ports[id][0] + "]";
	clearMenu();
	addMenuItem("op","backmenu","Back",null,loadPortsMenu);
	addMenuItem("fldportname","menuitem","Port name",
		createInputField("portname","text",ports[id][0],"[a-z0-9]{5}"),null);
	addMenuItem("fldenable","menuitem","Enabled",
		createCheckboxField("enabled",isenabled(id)),null);
	//if (isenabled(id)) {
		addMenuItem("fldvisible","menuitem","Visible",
			createCheckboxField("visible",isvisible(id)),null);
	//	if (isvisible(id)) {
			addMenuItem("fldinconfig","menuitem","Show in config",
				createCheckboxField("inconfig",isinconfig(id)),null);
	//	}

		addMenuItem("fldtag","menuitem","Tag",
			createSelectField("tag",ports[id][2],tags,tags_desc),null);

		if (isanalog(id)) {
			var pr = ports[id][5].split("|");
			minval = parseFloat(pr[0]?pr[0]:0);
			maxval = parseFloat(pr[1]?pr[1]:100);
			tolval = parseFloat(ports[id][7]?ports[id][7]:1);

			addMenuItem("fldminval","menuitem","Minimum",
				createInputField("minvalue","number",minval,null),null);
			addMenuItem("fldmaxval","menuitem","Maximum",
				createInputField("maxvalue","number",maxval,null),null);

			addMenuItem("fldtolerance","menuitem","Tolerance",
				createInputField("tolerance","number",tolval,null),null);
		}

		if (isvirtual(id)) {
			sel = id;
			addMenuItem("fldasanalog","menuitem","Act as analog",
				createCheckboxField("asanalog",(ports[id][1]=="AV")),null);
			var t = ports[id][5]; // Type of the port?
			var extdata = " (" + ports[id][6] + ")";
			addMenuItem("selVAR",t=="VAR"?"optionsel":"option",
				"Variable",
				null,
				createVariablePort);
			addMenuItem("selPER",t=="PER"?"optionsel":"option",
				t=="PER"?"Persistent "+ports[id][4]:"Persistent",
				null,
			createPersistentPort);
			addMenuItem("selGRP",
				t=="GRP"?"optionsel":"option",
				t=="GRP"?"Group" +extdata:"Group",
				null,
				createGroupInPort);
			addMenuItem("selTTG",
				t=="TTG"?"optionsel":"option",
				t=="TTG"?"Time trigger" +extdata:"Time trigger",
				null,
				createClockTrigger);
			addMenuItem("selDTG",
				t=="DTG"?"optionsel":"option",
				t=="DTG"?"Date trigger" +extdata:"Date trigger",
				null,
				createCalTrigger);
			addMenuItem("selZTG",
				t=="ZTG"?"optionsel":"option",
				t=="ZTG"?"Countdown" +extdata:"Countdown",
				null,
				createZeroTrigger);
			addMenuItem("selTRG",
				t=="TRG"?"optionsel":"option",
				t=="TRG"?"Condition" +extdata:"Conditional",
				null,
				createConditionalTrigger);
			addMenuItem("selRPT",
				t=="RPT"?"optionsel":"option",
				t=="RPT"?"Remote port" +extdata:"Remote port",
				null,
				createRemoteLink);
		}
	//}

	addToolbarSaveCancel(function(){
		var commands = "";
		var port_flags = "";
		// Fields are valid?
		if (validate_field("portname",rx_str5)) {
			if (ports[sel][0] != portname.value) { // Port name has changed
				send_command("lbl+" + ports[sel][0] + "+" + portname.value);
				ports[sel][0] = portname.value;
			}
		} else {
			return false;
		}

		if (isdigital(sel)) {
			port_flags += "d";
		}
		if (isanalog(sel)) { // Ranges and tolerance applies for analogs
			send_command("rng+"+ports[sel][0]+"+"+minvalue.value + "+" + maxvalue.value);
			send_command("tol+"+ports[sel][0]+"+"+tolerance.value);
			port_flags += "a";
		}
		if (isvirtual(sel)) {
			if (asanalog.value != "false") port_flags += "a";
			else port_flags += "d";
		}
		if (enabled.value==false||enabled.value=="false") {
			port_flags = "x"; // This overrides all other configurations
		} else {
			if (visible.value!="false") {
				if (inconfig.value!="false") port_flags += "S";
				else port_flags += "s";
			} else {
				port_flags += "h";
			}
		}
		send_command("cfg+" + ports[sel][0] + "+"+port_flags);
		send_command("tag+" + ports[sel][0] + "+" + tag.value);
		alert("Changes successfully saved");
		loadPortsInfo(ports[portid][0]);
		displayPortDetails(portid);
		//alert(portname.value + " " + enabled.value + " " + visible.value + " " + inconfig.value)
	},function(){loadPortsMenu()});
	}catch(e){
		alert(e);
	}
}

function createGroupInPort(){
	var d = document.getElementById("frm");
	d.innerHTML = "";
	var m = document.createElement("ul");
	var addblock =document.createElement("li");
	addblock.setAttribute("class","menuitem");
	addblock.setAttribute("className","menuitem");
	addblock.setAttribute("title","Add new group");
	var add_caption = document.createTextNode("Create  ");
	addblock.appendChild(add_caption);

	var alb_di = document.createElement("select");
	alb_di.setAttribute("name","inport");
	alb_di.setAttribute("id","inport");
	for(var i = 0; i < ports.length; i++) {
//		if (ports[i][1]=="DI"){
			var opt =ports[i][0];
			var el = document.createElement("option");
			el.textContent = opt;
			el.value = opt;
			alb_di.appendChild(el);
//		}
	}
	addblock.appendChild(alb_di);

	var alb_type = document.createElement("select");
	alb_type.setAttribute("name","type");
	alb_type.setAttribute("id","type");
	for(var i = 0; i < grptypes.length; i++) {
		var el = document.createElement("option");
		el.textContent = grptypes_desc[i];
		el.value = grptypes[i];
		alb_type.appendChild(el);
	}
	addblock.appendChild(alb_type);

	var alb_do = document.createElement("select");
	alb_do.setAttribute("name","outport");
	alb_do.setAttribute("id","outport");
	for(var i = 0; i < ports.length; i++) {
//		if (ports[i][1]=="DO"){
			var opt =ports[i][0];
			var el = document.createElement("option");
			el.textContent = opt;
			el.value = opt;
			alb_do.appendChild(el);
//		}
	}
	addblock.appendChild(alb_do);
	m.appendChild(addblock);

	var tbr = document.createElement("div");
	tbr.setAttribute("class","buttons");
	var menu_ok_caption = document.createTextNode("Create");
	var menu_ok =document.createElement("a");
	menu_ok.setAttribute("title",portid);
//	menu_ok.setAttribute("id","update_lbl");
	menu_ok.setAttribute("class","button");
	menu_ok.addEventListener("click", function() {
		var pr = ports[portid][0];
		var pa = document.getElementById("inport");
		var pb = document.getElementById("outport");
		var grpt = document.getElementById("type");
		command = "grp+" + pr + "+" + pa.value + "+" + pb.value + "+" + grpt.value;
		//alert(command);
		var resp = send_command(command);
		if (resp.indexOf("DONE")==-1) {
			alert("Error creating the group: "+ resp);
		} else {
			//alert("Group created");
			loadPortsInfo(ports[portid][0]);
			displayPortDetails(portid);
		}
	});
	menu_ok.appendChild(menu_ok_caption);
	tbr.appendChild(menu_ok);

	var menu_cancel_caption = document.createTextNode("Cancel");
	var menu_cancel =document.createElement("a");
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

function createVariablePort(){
	send_command("var+"+ ports[portid][0]);
	loadPortsInfo(ports[portid][0]);
	displayPortDetails(portid);
}

function createRemoteLink(){
	var d = document.getElementById("frm");
	d.innerHTML = "";
	var m = document.createElement("ul");

	var menu = document.createElement("li");
	menu.setAttribute("class","backmenu");
	var menu_caption = document.createTextNode("Back");
	menu.addEventListener("click", function() { loadPortsMenu();});
	menu.appendChild(menu_caption);
	m.appendChild(menu);

	var headblock =document.createElement("li");
	headblock.setAttribute("class","menuitem");
	headblock.setAttribute("title","Remote link");
	var add_caption = document.createTextNode("Link " +ports[portid][0] + " with remote port");
	headblock.appendChild(add_caption);
	m.appendChild(headblock);

	var addblock =document.createElement("li");
	addblock.setAttribute("class","menuitem");
	addblock.setAttribute("title","Remote link");
	var add_caption = document.createTextNode("ODControl name");
	addblock.appendChild(add_caption);
	var alb_di = document.createElement("input");
	alb_di.setAttribute("name","odcontrol");
	alb_di.setAttribute("id","odcontrol");
	alb_di.setAttribute("type","text");
	addblock.appendChild(alb_di);
	m.appendChild(addblock);

	var addblock2 =document.createElement("li");
	addblock2.setAttribute("class","menuitem");
	addblock2.setAttribute("title","Remote port name");
	var add_caption = document.createTextNode("Remote port name");
	addblock2.appendChild(add_caption);
	var alb_di = document.createElement("input");
	alb_di.setAttribute("name","inport");
	alb_di.setAttribute("type","text");
	alb_di.setAttribute("id","inport");
	addblock2.appendChild(alb_di);
	m.appendChild(addblock2);

	var tbr = document.createElement("div");
	tbr.setAttribute("class","buttons");
	var menu_ok_caption = document.createTextNode("Create");
	var menu_ok =document.createElement("a");
	menu_ok.setAttribute("title",portid);
	//	menu_ok.setAttribute("id","update_lbl");
	menu_ok.setAttribute("class","button");
	menu_ok.addEventListener("click", function() {
		var pr = ports[portid][0];
		var od = document.getElementById("odcontrol");
		var pa = document.getElementById("inport");
		var grpt = document.getElementById("type");
		command = "rpt+" + pr + "+" + od.value + "+"+ pa.value;
		//alert(command);
		var resp = send_command(command);
		if (resp.indexOf("DONE")==-1) {
			alert("Error creating the link: "+ resp + ". Maybe there is no port named " + od.value + " or values entered are not valid.");
		} else {
			loadPortsInfo(ports[portid][0]);
			displayPortDetails(portid);
		}
	});
	menu_ok.appendChild(menu_ok_caption);
	tbr.appendChild(menu_ok);

	var menu_cancel_caption = document.createTextNode("Cancel");
	var menu_cancel =document.createElement("a");
	//	menu_cancel.setAttribute("id","update_lbl");
	menu_cancel.setAttribute("class","button");
	menu_cancel.addEventListener("click", function() {
	loadPortsInfo(ports[portid][0]);
	displayPortDetails(portid);
	});
	menu_cancel.appendChild(menu_cancel_caption);
	tbr.appendChild(menu_cancel);

	m.appendChild(tbr);

	d.appendChild(m);
	document.title = "Create remote link";
}

function createCalTrigger(){
	var d = document.getElementById("frm");
	d.innerHTML = "";
	var m = document.createElement("ul");

	var headblock =document.createElement("li");
	headblock.setAttribute("class","menuitem");
	headblock.setAttribute("title","Remote link");
	var add_caption = document.createTextNode("On specified day  ");
	headblock.appendChild(add_caption);
	m.appendChild(headblock);


	var addblock =document.createElement("li");
	addblock.setAttribute("class","menuitem");
	addblock.setAttribute("title","Remote link");
	var add_caption = document.createTextNode("set port  ");
	addblock.appendChild(add_caption);

	var alb_di = document.createElement("select");
	alb_di.setAttribute("name","outport");
	alb_di.setAttribute("id","outport");
	for(var i = 0; i < ports.length; i++) {
//		if (ports[i][1]=="DI"){
			var opt =ports[i][0];
			var el = document.createElement("option");
			el.textContent = opt;
			el.value = opt;
			alb_di.appendChild(el);
//		}
	}
	addblock.appendChild(alb_di);

	var alb_dv = document.createElement("select");
	alb_dv.setAttribute("name","portval");
	alb_dv.setAttribute("id","portval");
//	for(var i = 0; i < ports.length; i++) {
//		if (ports[i][1]=="DI"){
//			var opt =ports[i][0];
			var el1 = document.createElement("option");
			el1.textContent = "on";
			el1.value = "on";
			alb_dv.appendChild(el1);

			var el2 = document.createElement("option");
			el2.textContent = "off";
			el2.value = "off";
			alb_dv.appendChild(el2);
//		}
//	}
	addblock.appendChild(alb_dv);

	m.appendChild(addblock);

	var tbr = document.createElement("div");
	tbr.setAttribute("class","buttons");
	var menu_ok_caption = document.createTextNode("Create");
	var menu_ok =document.createElement("a");
	menu_ok.setAttribute("title",portid);
//	menu_ok.setAttribute("id","update_lbl");
	menu_ok.setAttribute("class","button");
	menu_ok.addEventListener("click", function() {
		var pr = ports[portid][0];
		var pa = document.getElementById("outport");
		var pv = document.getElementById("portval");
		command = "dtg+" + pr + "+vie220000+" + pa.value + "+" + pv.value;
		//alert(command);
		var resp = send_command(command);
		if (resp.indexOf("DONE")==-1) {
			alert("Error creating the group: "+ resp);
		} else {
			alert("You can assign the proper date from the configuration panel");
			loadPortsInfo(ports[portid][0]);
			displayPortDetails(portid);
		}
	});
	menu_ok.appendChild(menu_ok_caption);
	tbr.appendChild(menu_ok);

	var menu_cancel_caption = document.createTextNode("Cancel");
	var menu_cancel =document.createElement("a");
	menu_cancel.setAttribute("title",portid);
	menu_cancel.setAttribute("class","button");
	menu_cancel.addEventListener("click", function() {
		loadPortsInfo(ports[portid][0]);
		displayPortDetails(portid);
	});
	menu_cancel.appendChild(menu_cancel_caption);
	tbr.appendChild(menu_cancel);

	m.appendChild(tbr);

	d.appendChild(m);
	document.title = "Create group";
}


function createClockTrigger(){
	var d = document.getElementById("frm");
	d.innerHTML = "";
	var m = document.createElement("ul");

	var headblock =document.createElement("li");
	headblock.setAttribute("class","menuitem");
	headblock.setAttribute("title","Remote link");
	var add_caption = document.createTextNode("On specified time  ");
	headblock.appendChild(add_caption);
	m.appendChild(headblock);

	var addblock =document.createElement("li");
	addblock.setAttribute("class","menuitem");
	addblock.setAttribute("title","Remote link");
	var add_caption = document.createTextNode("set port  ");
	addblock.appendChild(add_caption);

	var alb_di = document.createElement("select");
	alb_di.setAttribute("name","outport");
	alb_di.setAttribute("id","outport");
	for(var i = 0; i < ports.length; i++) {
//		if (ports[i][1]=="DI"){
			var opt =ports[i][0];
			var el = document.createElement("option");
			el.textContent = opt;
			el.value = opt;
			alb_di.appendChild(el);
//		}
	}
	addblock.appendChild(alb_di);

	var alb_dv = document.createElement("select");
	alb_dv.setAttribute("name","portval");
	alb_dv.setAttribute("id","portval");
//	for(var i = 0; i < ports.length; i++) {
//		if (ports[i][1]=="DI"){
//			var opt =ports[i][0];
			var el1 = document.createElement("option");
			el1.textContent = "on";
			el1.value = "on";
			alb_dv.appendChild(el1);

			var el2 = document.createElement("option");
			el2.textContent = "off";
			el2.value = "off";
			alb_dv.appendChild(el2);
//		}
//	}
	addblock.appendChild(alb_dv);

	m.appendChild(addblock);

	var tbr = document.createElement("div");
	tbr.setAttribute("class","buttons");
	var menu_ok_caption = document.createTextNode("Create");
	var menu_ok =document.createElement("a");
	menu_ok.setAttribute("title",portid);
//	menu_ok.setAttribute("id","update_lbl");
	menu_ok.setAttribute("class","button");
	menu_ok.addEventListener("click", function() {
		var pr = ports[portid][0];
		var pa = document.getElementById("outport");
		var pv = document.getElementById("portval");
		command = "ttg+" + pr + "+20130101000000+" + pa.value + "+" + pv.value;
		//alert(command);
		var resp = send_command(command);
		if (resp.indexOf("DONE")==-1) {
			alert("Error creating the group: "+ resp);
		} else {
			alert("You can assign the proper date from the configuration panel");
			loadPortsInfo(ports[portid][0]);
			displayPortDetails(portid);
		}
	});
	menu_ok.appendChild(menu_ok_caption);
	tbr.appendChild(menu_ok);

	var menu_cancel_caption = document.createTextNode("Cancel");
	var menu_cancel =document.createElement("a");
	menu_cancel.setAttribute("title",portid);
	menu_cancel.setAttribute("class","button");
	menu_cancel.addEventListener("click", function() {
		loadPortsInfo(ports[portid][0]);
		displayPortDetails(portid);
	});
	menu_cancel.appendChild(menu_cancel_caption);
	tbr.appendChild(menu_cancel);

	m.appendChild(tbr);

	d.appendChild(m);
	document.title = "Create clock timer";
}


function createZeroTrigger(){
	var pn = [];
	var pv = ["on","off"];
	var sport = "", sval="", sdur="10";

	if (ports[portid][6]) {
		var arr = ports[portid][6].split(" ");
		sdur = arr[1];
		sport = arr[2];
		sval = arr[3];
	}
	clearMenu();
	addMenuItem("op","backmenu","Back",null,loadPortsMenu);
	addMenuItem("label","menuitem","Seconds",createInputField("duration","number",sdur,"[0-9]"),null);
	for (var i=0;i<ports.length;i++) pn[i] = ports[i][0];
	addMenuItem("label","menuitem","Action to execute:");
	addMenuItem("label","menuitem","Update port",createSelectField("port",sport,pn,pn),null);
	addMenuItem("label","menuitem","with value",createSelectField("portvalue",sval,pv,pv),null);
	addToolbarSaveCancel(function(){
			send_command("ztg+"+ports[portid][0]+"+sec+"+pad(duration.value,5)+"+"+port.value+"+"+portvalue.value);
			loadPortsInfo(ports[portid][0]);
			displayPortDetails(portid);
		},function(){
			loadPortsMenu();
		});
}




function createConditionalTrigger(){
	id = sel;
	var d = document.getElementById("frm");
	d.innerHTML = "";
	var m = document.createElement("ul");
	var addblock =document.createElement("li");
	addblock.setAttribute("class","menuitem");
	addblock.setAttribute("title","Remote link");
	var add_caption = document.createTextNode("When " + ports[id][0] + "  ");
	addblock.appendChild(add_caption);

	var alb_dc = document.createElement("select");
	alb_dc.setAttribute("name","condition");
	alb_dc.setAttribute("id","condition");
	for(var i = 0; i < trgtypes.length; i++) {
//		if (ports[i][1]=="DI"){
//			var opt =ports[i][0];
			var el1 = document.createElement("option");
			el1.textContent = trgtypes_desc[i];
			el1.value = trgtypes[i];
			alb_dc.appendChild(el1);
//		}
	}
	addblock.appendChild(alb_dc);


	var alb_di = document.createElement("select");
	alb_di.setAttribute("name","inport");
	alb_di.setAttribute("id","inport");
	for(var i = 0; i < ports.length; i++) {
//		if (ports[i][1]=="DI"){
			var opt =ports[i][0];
			var el = document.createElement("option");
			el.textContent = opt;
			el.value = opt;
			alb_di.appendChild(el);
//		}
	}
	addblock.appendChild(alb_di);

	m.appendChild(addblock); // End first block


	var addblock =document.createElement("li"); // Start second block
	addblock.setAttribute("class","menuitem");
	addblock.setAttribute("title","Remote link");
	var add_caption = document.createTextNode("set port ");
	addblock.appendChild(add_caption);
	var alb_do = document.createElement("select");
	alb_do.setAttribute("name","outport");
	alb_do.setAttribute("id","outport");
	for(var i = 0; i < ports.length; i++) {
		if ((ports[i][1]!="DI") && (ports[i][1]!="XX")){
			var opt =ports[i][0];
			var el = document.createElement("option");
			el.textContent = opt;
			el.value = opt;
			alb_do.appendChild(el);
		}
	}
	addblock.appendChild(alb_do);

	var alb_dv = document.createElement("select");
	alb_dv.setAttribute("name","portval");
	alb_dv.setAttribute("id","portval");
//	for(var i = 0; i < ports.length; i++) {
//		if (ports[i][1]=="DI"){
//			var opt =ports[i][0];
			var el1 = document.createElement("option");
			el1.textContent = "on";
			el1.value = "on";
			alb_dv.appendChild(el1);

			var el2 = document.createElement("option");
			el2.textContent = "off";
			el2.value = "off";
			alb_dv.appendChild(el2);
//		}
//	}
	addblock.appendChild(alb_dv);

	m.appendChild(addblock);

	var tbr = document.createElement("div");
	tbr.setAttribute("class","buttons");
	var menu_ok_caption = document.createTextNode("Create");
	var menu_ok =document.createElement("a");
	menu_ok.setAttribute("title",portid);
//	menu_ok.setAttribute("id","update_lbl");
	menu_ok.setAttribute("class","button");
	menu_ok.addEventListener("click", function() {
		var pr = ports[portid][0];
		var pc = document.getElementById("condition");
		var pi = document.getElementById("inport");
		var pa = document.getElementById("outport");
		var pv = document.getElementById("portval");
		command = "trg+" + pr + "+" + pc.value + "+" + pi.value+ "+" + pa.value + "+" + pv.value;
		//alert(command);
		var resp = send_command(command);
		if (resp.indexOf("DONE")==-1) {
			alert("Error creating the condition: "+ resp);
		} else {
			alert("Condition created");
			loadPortsInfo(ports[portid][0]);
			displayPortDetails(portid);
		}
	});
	menu_ok.appendChild(menu_ok_caption);
	tbr.appendChild(menu_ok);

	var menu_cancel_caption = document.createTextNode("Cancel");
	var menu_cancel =document.createElement("a");
	menu_cancel.setAttribute("title",portid);
	menu_cancel.setAttribute("class","button");
	menu_cancel.addEventListener("click", function() {
		loadPortsInfo(ports[portid][0]);
		displayPortDetails(portid);
	});
	menu_cancel.appendChild(menu_cancel_caption);
	tbr.appendChild(menu_cancel);

	m.appendChild(tbr);

	d.appendChild(m);
	document.title = "Create conditional trigger";
}





function loadTemplatesMenu() {
	var d = document.getElementById("frm");
	d.innerHTML = "";
	var m = document.createElement("ul");

	var menu = document.createElement("li");
	menu.setAttribute("class","backmenu");
	menu.setAttribute("className","backmenu");
	var menu_caption = document.createTextNode("Back");
	menu.addEventListener("click", function() { loadMenu();});
	menu.appendChild(menu_caption);
	m.appendChild(menu);

	if(cloudSessionStarted == false){
		var menu = document.createElement("li");
		menu.setAttribute("class","menuitem");
		var menu_caption = document.createTextNode("Cloud session not started");
		//menu.addEventListener("click", function() { loadMenu();});
		menu.appendChild(menu_caption);
		m.appendChild(menu);
	}


	for (i=0;i<templates.length;i++) {
		var menu = document.createElement("li");
		var a = document.createElement("span");
		menu.title = templates_id[i];
		a.setAttribute("title",i);
		menu.setAttribute("class","menuitem");
		var menu_caption = document.createTextNode(templates[i]);
		a.addEventListener("click", function() {
			if (confirm("Do you want to load the template [" + this.title + "]?")) {
				//document.location = "/?origin=" + this.parentNode.title;
				loadTemplate(this.title);
			}
			return false;
		});
		a.appendChild(menu_caption);
		menu.appendChild(a);

		var img = document.createElement("img");
		img.setAttribute("src","http://cloud.opendomo.com/odctp/img/exp.png");
		img.setAttribute("class","infobutton");
		img.addEventListener("click",function() {
			showHidePanel("infopanel_" +this.parentNode.title);
		});
		menu.appendChild(img);

		m.appendChild(menu);

		var desc = document.createElement("li");
		desc.setAttribute("id","infopanel_"+templates_id[i]);
		var txt = document.createTextNode(templates_desc[i]);
		desc.appendChild(txt);
		desc.setAttribute("class","infopanel");
		m.appendChild(desc);
	}



	d.appendChild(m);
	document.title = "Load templates";
}


function loadSecurityMenu() {
	var d = document.getElementById("frm");
	d.innerHTML = "";
	var m = document.createElement("ul");

	var menu = document.createElement("li");
	menu.setAttribute("class","backmenu");
	menu.setAttribute("className","backmenu");
	var menu_caption = document.createTextNode("Back");
	menu.addEventListener("click", function() { loadMenu();});
	menu.appendChild(menu_caption);
	m.appendChild(menu);



	var menu = document.createElement("li");
	var label = document.createTextNode("Admin password");
	menu.setAttribute("class","menuitem");
	menu.appendChild(label);
	var pass = document.createElement("input");
	pass.setAttribute("type","password");
	pass.setAttribute("id","admin");
	menu.appendChild(pass);
	m.appendChild(menu);

	var menu = document.createElement("li");
	var label = document.createTextNode("Retype");
	menu.setAttribute("class","menuitem");
	menu.appendChild(label);
	var repeat = document.createElement("input");
	repeat.setAttribute("type","password");
	repeat.setAttribute("id","repeatadmin");
	menu.appendChild(repeat);
	m.appendChild(menu);


	// Toolbar
	var tbr = document.createElement("div");
	tbr.setAttribute("class","buttons");
	var menu_ok_caption = document.createTextNode("Save password");
	var menu_ok =document.createElement("a");
	menu_ok.setAttribute("class","button");
	menu_ok.addEventListener("click", function() {
		var pass = document.getElementById("admin");
		var repeat = document.getElementById("repeatadmin");
		if (pass.value != repeat.value) {alert("Passwords don't match"); return;}
		command = "sec+webcf+" + pass.value;
		var resp = send_command(command);
		if (resp.indexOf("DONE")==-1) {
			alert("Error assigning password "+ resp);
		} else {
			alert("Password changed");
			loadMenu();
		}
	});
	menu_ok.appendChild(menu_ok_caption);
	tbr.appendChild(menu_ok);
	m.appendChild(tbr);


	var menu = document.createElement("li");
	var label = document.createTextNode("User password");
	menu.setAttribute("class","menuitem");
	menu.appendChild(label);
	var user = document.createElement("input");
	user.setAttribute("type","password");
	user.setAttribute("id","user");
	menu.appendChild(user);
	m.appendChild(menu);

	var menu = document.createElement("li");
	var label = document.createTextNode("Retype");
	menu.setAttribute("class","menuitem");
	menu.appendChild(label);
	var repeat = document.createElement("input");
	repeat.setAttribute("type","password");
	repeat.setAttribute("id","repeatuser");
	menu.appendChild(repeat);
	m.appendChild(menu);


	// Toolbar
	var tbr = document.createElement("div");
	tbr.setAttribute("class","buttons");
	var menu_ok_caption = document.createTextNode("Save password");
	var menu_ok =document.createElement("a");
	menu_ok.setAttribute("class","button");
	menu_ok.addEventListener("click", function() {
		var pass = document.getElementById("user");
		var repeat = document.getElementById("repeatuser");
		if (pass.value != repeat.value) {alert("Passwords don't match"); return;}
		command = "sec+webui+" + pass.value;
		var resp = send_command(command);
		if (resp.indexOf("DONE")==-1) {
			alert("Error assigning password "+ resp);
		} else {
			alert("Password changed");
			loadMenu();
		}
	});
	menu_ok.appendChild(menu_ok_caption);
	tbr.appendChild(menu_ok);
	m.appendChild(tbr);


	var menu = document.createElement("li");
	var label = document.createTextNode("Proto password");
	menu.setAttribute("class","menuitem");
	menu.appendChild(label);
	var proto = document.createElement("input");
	proto.setAttribute("type","password");
	proto.setAttribute("id","proto");
	menu.appendChild(proto);
	m.appendChild(menu);

	var menu = document.createElement("li");
	var label = document.createTextNode("Retype");
	menu.setAttribute("class","menuitem");
	menu.appendChild(label);
	var repeat = document.createElement("input");
	repeat.setAttribute("type","password");
	repeat.setAttribute("id","repeatproto");
	menu.appendChild(repeat);
	m.appendChild(menu);


	// Toolbar
	var tbr = document.createElement("div");
	tbr.setAttribute("class","buttons");
	var menu_ok_caption = document.createTextNode("Save password");
	var menu_ok =document.createElement("a");
	menu_ok.setAttribute("class","button");
	menu_ok.addEventListener("click", function() {
		var pass = document.getElementById("proto");
		var repeat = document.getElementById("repeatproto");
		if (pass.value != repeat.value) {alert("Passwords don't match"); return;}
		command = "sec+passw+" + pass.value;
		var resp = send_command(command);
		if (resp.indexOf("DONE")==-1) {
			alert("Error assigning password "+ resp);
		} else {
			alert("Password changed");
			loadMenu();
		}
	});
	menu_ok.appendChild(menu_ok_caption);
	tbr.appendChild(menu_ok);
	m.appendChild(tbr);

	d.appendChild(m);
	document.title = "Security";
}


function showHidePanel(id) {
	var p = document.getElementById(id);
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
var odcontrolname = "";

function loadODControlData() {
	var xmlhttpVER = send_command("ver+");
	var p = xmlhttpVER.split(" ");
	if (p.length>2) {
		odcontrolname = p[0];
		odcontrolversion = p[2];

		var fileref=document.createElement('script')
		fileref.setAttribute("type","text/javascript")
		fileref.setAttribute("src", "http://cloud.opendomo.com/odctp/list.php?ver="+odcontrolversion);
		document.getElementsByTagName("head")[0].appendChild(fileref);

	} else {
		return false;
	}
	loadPortsInfo();
	loadLinksInfo();
	return true;
}



function errorHandler(e) {
	alert("Runtime error. Reloading menu.");
	loadMenu();
}

function refreshFooter(){
	var f = document.getElementById("footer");
	f.innerHTML = odcontrolname + " v" + odcontrolversion;
}

function getPortId(pname) {
	for (var i=0;i<ports.length;i++) {
		if (ports[i][0]==pname) return i;
	}
	return -1;
}

function loadPortsInfo(portname) {
	if (portname) {
		id = getPortId(portname);
		if (id>=0){
			var raw_response = send_command("lsc+"+portname);
			if (raw_response!="DONE"){
				var response = raw_response.replace(/\nDONE/g,"");
				var raw_ports = response.split("\n");
				if (raw_ports[0].indexOf(":")>0) {
					var s = raw_ports[0].split(":");
					var pname = s[0];
					var pformat = s[1]?s[1]:"";
					var ptype =  pformat.substring(0,2);
					var ptag = pformat.substring(3,4);
					var pval = s[2];
					var ptol = s[5];
					ports[id]=new Array(
						pname,
						pformat.substring(0,2),
						pformat.substring(3,4),
						pformat,
						pval,
						s[3],
						s[4],
						ptol);
				}
			}
		}
		return true;
	}

	var raw_response = send_command("lsc+00-23;lsc+24-47;lsc+48-71;lsc+72-96");
	if (raw_response.length<10) { alert("Error loading ports"); }
	var response = raw_response.replace(/\nDONE/g,"");
	var raw_ports = response.split("\n");
	var total = 0;
	for (i=0;i<raw_ports.length;i++) {
		if (raw_ports[i].indexOf(":")>0) {
			var s = raw_ports[i].split(":");
			var pname = s[0];
			var pformat = s[1]?s[1]:"";
			var ptype =  pformat.substring(0,2);
			var ptag = pformat.substring(3,4);
			var pval = s[2];
			ports[i]=new Array(
				pname,
				pformat.substring(0,2),
				pformat.substring(3,4),
				pformat,
				pval,
				s[3],
				s[4]);
			total++;
		}
	}

	//TODO Change to "lsc+analog" whenever it's implemented
	raw_response = send_command("lsc+tol");
	var raw_ports = raw_response.split("\n");
	for (i=0;i<raw_ports.length;i++) {
		if (raw_ports[i].indexOf(":")>0) {
			var s = raw_ports[i].split(":");
			var pname = s[0];
			var ptol = s[1];
			for (p=0;p<ports.length;p++) {
				if (ports[p][0]==pname) {
					ports[p][7] = ptol;
				}
			}
		}
	}
	return total;
}

function loadLinksInfo() {
	var xmlhttpLLN = send_command("lln");
	var total = 0;

	mylinks = new Array();
	var raw_links = new Array();

	var response = xmlhttpLLN.replace(/\nDONE/,"");
	raw_links = response.split("\n");
	for (i=0;i<raw_links.length;i++) {
		if (raw_links[i].indexOf(":")>0) {
			var s = raw_links[i].split(":");
			mylinks[i]=new Array(s[0],s[1],s[2], "");
			total++;
		}
	}
	return total;
}

function initmsg (){
	var a = document.getElementById("alertbox");
	var b = document.getElementById("alertbgnd");

	if (!b) {
		var b = document.createElement("div");
		b.setAttribute("id","alertbgnd");
		b.addEventListener("click", hidealert);
		document.body.appendChild(b);
	}
	if (!a) {
		var a = document.createElement("div");
		a.setAttribute("id","alertbox");
		a.addEventListener("click", hidealert);
		document.body.appendChild(a);
	}
	return a;
}

function my_confirm(text,callback_txt) {
	var a = initmsg()
	var b = document.getElementById("alertbgnd");
	a.innerHTML = "<div class='alertit'></div><p>" + text + "</p><input type='button' onclick=\"" + callback_txt + "\" value='Confirm' />";
	a.style.display = "block";
	b.style.display = "block";
}

function my_alert(text){
	var a = initmsg()
	var b = document.getElementById("alertbgnd");
	a.innerHTML = "<div class='alertit'></div><p>" + text + "</p>";
	a.style.display = "block";
	b.style.display = "block";
	//setTimeout(hidealert,2000);
}
function hidealert() {
	var a = document.getElementById("alertbox");
	var b = document.getElementById("alertbgnd");
	a.style.display = "none";
	b.style.display = "none";
}

function createPersistentPort(){
	clearMenu();
	addMenuItem("cpptext","menuitem", "Value of the port (use 'on', 'off' or the numerical value)");
	addMenuItem("cperport","menuitem", "Change name", createInputField("perportval","text"));
	addToolbarSaveCancel(createPersistentPortWithValue,loadMenu);
}

function createPersistentPortWithValue(){
	var va = ID("perportval");
	var value = va.value;
	send_command("per+"+ ports[portid][0]);
	send_command("set+"+ ports[portid][0]+ " " + value);
	loadPortsInfo(ports[portid][0]);
	displayPortDetails(portid);
}


function changeODControlName(){
	clearMenu();
	addMenuItem("setodcname","menuitem", "Change name", createInputField("odcnewname","text",odcontrolname));
	addToolbarSaveCancel(setODControlName,loadMenu);
}
function setODControlName(){
	var a = ID("odcnewname");
	var name = a.value;
	if (name && (name.length==5)) {
		var resp = send_command("snm+" + name);
		if (resp.indexOf("DONE")==-1) {
			my_alert("Invalid name or unsupported function");
		} else {
			odcontrolname = name;
			loadMenu();
			refreshFooter();
		}
	}else{
		my_alert("Invalid name");
	}
}


function showExecuteCommandMenu() {
	clearMenu();
	addMenuItem("execcommand","menuitem", "Execute command", createInputField("command","text"));
	addToolbarSaveCancel(applyCMD,loadMenu);
}
function applyCMD(){
	var a = ID("command");
	var resp = send_command(a.value);
	my_alert(resp);
	a.value = "";
}



/* Obtain template from configuration.
 * @params None
 * @return The template.
 */
outputTemplate = function (){
    var res="";
    var p="";
    for(i=0;i<8;i++)  {p="do00"+i;
        if (p != ports[i][0]) res = res + "lbl "+p+" "+ports[i][0] + "\n" ;
        if ("DX" != ports[i][1]){
            res = res + "cfg " + ports[i][0]+ " " + ports[i][1].toLowerCase();
            switch (ports[i][3].substring(2,3)) {
                case "M": res = res + "s\n"; break;
                case "C": res = res + "S\n"; break;
                default: res = res + "h\n"; }
        }
    }

    for(i=8;i<16;i++) {p="di00"+(i-8);
        if (p != ports[i][0]) res = res + "lbl "+p+" "+ports[i][0] + "\n" ;
        if ("DX" != ports[i][1]){
            res = res + "cfg " + ports[i][0]+ " " + ports[i][1].toLowerCase();
            switch (ports[i][3].substring(2,3)) {
                case "M": res = res + "s\n"; break;
                case "C": res = res + "S\n"; break;
                default: res = res + "h\n"; }
        }
    }

	for(i=16;i<24;i++){p="ai00"+(i-16);
		if (p != ports[i][0]) res = res + "lbl "+p+" "+ports[i][0] + "\n" ;
		if ("AX" != ports[i][1]) {
			res = res + "cfg " + ports[i][0]+ " " + ports[i][1].toLowerCase();
     		switch (ports[i][3].substring(2,3)) {
               	case "M": res = res + "s\n"; break;
               	case "C": res = res + "S\n"; break;
               	default: res = res + "h\n";
			}

			var rangevals = ports[i][5].split("|");
			res = res + "rng " + ports[i][0]+ " " + rangevals[0] + " " + rangevals[1] + "\n";
		}
	}

    for(i=24;i<34;i++){p="vt00"+(i-24);
        if (p != ports[i][0]) res = res + "lbl "+p+" "+ports[i][0] + "\n" ;
        if ("VX" != ports[i][1]) {
		res = res + vportExtractConfig(ports[i]);
		} else {
			res = res + "cfg " + ports[i][0] + " x\n";
		}
    }

    for(i=34;i<72;i++){p="vt0"+(i-24);
        if (p != ports[i][0]) res = res + "lbl "+p+" "+ports[i][0] + "\n" ;
        if ("VX" != ports[i][1]) res = res + vportExtractConfig(ports[i]);
    }

    for (i=0;i<ports.length;i++) {
        var tag = ports[i][2];
        if (tag!="_") res = res + "tag "+ ports[i][0] + " " +tag + "\n";
    }

    for(i=0;i<mylinks.length;i++){
        var p1 = mylinks[i][0];
        var p2 = mylinks[i][1];
        if (p1 && p2) {
            res = res + "lnk " + p1 + " " + p2 + " " + mylinks[i][2] + "\n";
        }
    }
    return res;
}

/* Extract configuration from a port
 * @params Element in the ports array
 * @return The configuration
 */
vportExtractConfig = function(vport){
    var res="";
    res = res + "cfg " + vport[0]+ " " + vport[1].substring(0,1).toLowerCase();

    switch (vport[3].substring(2,3)) {
        case "M": res = res + "s\n"; break;
        case "C": res = res + "S\n"; break;
        default: res = res + "h\n"; }

    if(vport[5]) {
        var cfg = "";
        if (vport[6]) var cfg = vport[6].toLowerCase().replace(/[=|\|_]/g," ");
        switch(vport[5]){
                case "VAR":
                    res = res + "var "+ vport[0]+" " + cfg + "\n";
                    break;
                case "PER":
                    res = res + "per "+ vport[0]+" " + cfg + "\n";
                    res = res + "set "+ vport[0]+" on\n";
                    break;
                case "GRP":
                    res = res + "grp "+ vport[0]+" " + cfg + "\n";
                    break;
                case "TTG":
                    res = res + "ttg "+ vport[0]+" " + cfg + "\n";
                    break;
                case "DTG":
                    res = res + "dtg "+ vport[0]+" " + cfg + "\n";
                    break;
                case "ZTG":
                    res = res + "ztg "+ vport[0]+" " + cfg + "\n";
                    break;
                case "TRG":
                    res = res + "trg "+ vport[0]+" " + cfg + "\n";
                    break;
                case "RPT":
                    res = res + "rpt "+ vport[0]+" " + cfg + "\n";
                    break;
            }
    }
    return res;
}


submitTemplate = function(template) {
    var cmd = template.replace(/ /g,"+").replace(/\n/g,";");
    var url = "http://cloud.opendomo.com/odctp/add.php";
    window.open(url+"?ver="+odcontrolversion+"&cmd="+cmd);
}


var current_template_command = -1;
var current_template_timer;
var failedcommands=0;
var cmds = [];
function loadTemplate(id) {
	try {
		if (templates_cmd[id]) {
			var total = templates_cmd[id].split(";").length;
			clearMenu();
			addMenuItem("op","backmenu","Back",null,loadTemplatesMenu);
			addMenuItem("progressmenu","menuitem","Loading template",null);
			addMenuItem("progressbarm","menuitem","",createProgressField("progress",0,total));

			addMenuItem("progresstotalm","menuitem","Total commands",
				createInputField("progresstotal","text",total));
			addMenuItem("progresscurrentm","menuitem","Executed",
				createInputField("progresscurrent","text","0"));
			addMenuItem("progresserrm","menuitem","Errors",
				createInputField("progresserr","text","0"));

			send_command("clr");
			cmds = templates_cmd[id].split(";");
			current_template_command = 0;
			failedcommands=0;
			setTimeout(loadTemplateNextCommand,2000);
 		}
	}catch(err){
		console.log("Error:" + err.message);
	}
}

function loadTemplateNextCommand(){
	var i = current_template_command;
	if (i == -1 || i>= cmds.length) {
		clearTimeout(current_template_timer);
		if (failedcommands!=0) {
			my_alert("Warning: "+failedcommands+" errors were found when loading the template.");
		} else {
			loadMenu();
		}
		return false;
	} else {
		progress.value = i;
		if (cmds[i].indexOf("#")==-1 && cmds[i]!="") {
			var resp = send_command(cmds[i]);
			if (resp.indexOf("DONE")==-1) {
				failedcommands++;
				ID("progresserr").value = failedcommands;
				console.log("Command: [" + cmds[i] + "] Result: ["+ resp.replace("\n","") + "]");
				errorlog.push("Command: [" + cmds[i] + "] Result: ["+ resp.replace("\n","") + "]");
			}
			if (resp=="") { // No response received
				console.log("Empty response received for  [" + cmds[i] + "]. Retrying");
				current_template_command--; // Back to retry
				send_command("ver+"); // inserting bogus command to avoid repetition
			}
			ID("progresscurrent").value = i+1;
		} else {
			current_template_command++; // Jump to the next
			loadTemplateNextCommand();
		}
		current_template_command++;
		current_template_timer = setTimeout(loadTemplateNextCommand,100);
	}
}



function clearMenu() {
	var d = document.getElementById("frm");
	d.innerHTML = "";
	var m = document.createElement("ul");
	m.setAttribute("id","menu");
	d.appendChild(m);
}


function addMenuItem(id,classname,label,rawcontents,callback){
	var menuitem = document.createElement("li");
	menuitem.setAttribute("class",classname);
	menuitem.setAttribute("id",id);
	menuitem.appendChild(document.createTextNode(label));
	if (callback) menuitem.onclick=callback;
	if (rawcontents) menuitem.appendChild(rawcontents);
	document.getElementById("menu").appendChild(menuitem);
}

function createInputField(id,type,value,validation,callback) {
	var input = document.createElement("input");
	input.setAttribute("id",id);
	input.setAttribute("type",type?type:"text");
	if (value||value==0) input.setAttribute("value",value);
	if (validation) input.setAttribute("pattern",validation);
	if (callback) input.onkeyup = callback;
	return input;
}

function createProgressField(id,value,maximum) {
	var input = document.createElement("progress");
	input.setAttribute("id",id);
	input.setAttribute("value",value);
	input.setAttribute("max",maximum);
	input.setAttribute("min",0);
	return input;
}

function createSelectField(id,value,array_val,array_desc) {
	var input = document.createElement("select");
	input.setAttribute("id",id);
	for (var i=0;i<array_val.length;i++) {
		var o = document.createElement("option");
		o.setAttribute("value",array_val[i]);
		if (value == array_val[i]) o.setAttribute("selected","selected");
		o.appendChild(document.createTextNode(array_desc[i]));
		input.appendChild(o);
	}
	var cont = document.createElement("a");
	cont.appendChild(input);
	return cont;
}

function createCheckboxField(id,value) {
	var complexfield = document.createElement("span");

	var input = document.createElement("input");
	input.setAttribute("id",id);
	input.setAttribute("type","hidden");
	input.setAttribute("value",value);
	complexfield.appendChild(input);

	var check = document.createElement("img");
	check.setAttribute("title",id);
	if (value!="false" && value != false) {
		check.setAttribute("src","http://opendomo.com/od/on.png");
	} else {
		check.setAttribute("src","http://opendomo.com/od/off.png");
	}

	check.onclick = function(){
		var d = document.getElementById(this.title);
		if (d.value!="false") {
			d.value=false;
			this.setAttribute("src","http://opendomo.com/od/off.png");
		}else{
			d.value=true;
			this.setAttribute("src","http://opendomo.com/od/on.png");
		}
	}
	var a = document.createElement("a");
	a.appendChild(check);
	complexfield.appendChild(a);

	return complexfield;
}

function addToolbarSaveCancel(callbacksave,callbackcancel) {
	var tbr = document.createElement("div");
	tbr.setAttribute("class","buttons");

	var menu_ok_caption = document.createTextNode("Save changes");
	var menu_ok =document.createElement("a");
	menu_ok.setAttribute("class","button");
	menu_ok.addEventListener("click", callbacksave);
	menu_ok.appendChild(menu_ok_caption);
	tbr.appendChild(menu_ok);

	var menu_cancel_caption = document.createTextNode("Cancel");
	var menu_cancel =document.createElement("a");
	menu_cancel.setAttribute("class","button");
	menu_cancel.addEventListener("click", callbackcancel);
	menu_cancel.appendChild(menu_cancel_caption);
	tbr.appendChild(menu_cancel);

	document.getElementById("menu").appendChild(tbr);
}



addEventListener("load",function(){
	var p = document.getElementById("log");
	if (p) {
		var fileref=document.createElement("link");
		fileref.setAttribute("rel", "stylesheet");
		fileref.setAttribute("type", "text/css");
		fileref.setAttribute("href", "http://cloud.opendomo.com/odctp/odc.css");
		document.getElementsByTagName("head")[0].appendChild(fileref);

		//loadjscssfile("http://cloud.opendomo.com/odctp/index.php?id="+document.title, "js");

		var code = "<div id='header'><div class='categories'>";
        code = code + "<a id='cat-map' href='http://" + document.location.hostname + ":" + (document.location.port-1) + "/hme'>Home</a>";
        code = code + "<a id='cat-tools' href='http://" + document.location.hostname + ":" + (document.location.port-1) + "/cnf'>Config</a>";           
        code = code + "</div>";
        code = code + "<div id='frm'><br/><center>Loading...</center></div>";
        code = code + "</div>";
        code = code + "<div id='footer'></div>";
        document.body.innerHTML = code;
        var totalok=0;
        loadODControlData();
        setTimeout(function(){loadMenu()},500); 


		document.title = "Log window";
		//loadMenu();
	}
});
