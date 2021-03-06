var rx_ip='^(([01]?[0-9]?[0-9]|2([0-4][0-9]|5[0-5]))\.){3}([01]?[0-9]?[0-9]|2([0-4][0-9]|5[0-5]))$';
var rx_ttg='^[*0-1][*0-9]/[*0-3][*0-9] [*0-2][*0-9]:[*0-5][*0-9]:[*0-5][*0-9]$';
var rx_dtg='^[a-z][a-z][a-z] [0-2][0-9]:[0-6][0-9]:[0-6][0-9]$';
var rx_time='^20[0-9][0-9]/[0-1][0-9]/[0-3][0-9] [0-2][0-9]:[0-5][0-9]:[0-5][0-9]$';
var rx_str='^[a-zA-Z0-9]+$';
var rx_str5='^[a-zA-Z0-9]{5}$';
var rx_num='^[0-9]{5}$';

var port_visible = "h";
var port_enabled = 1;

function send_cmd(id,patt) {
	var i=document.getElementById(id);
	var re=new RegExp(patt);
	if(i.value.match(re)) {
		document.location='/'+id+'+'+i.value.replace(' ', '+').replace(/\//g, '+');
	} else {
		i.style.color='red';
	}
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
}


function add_header() {
	var log = document.getElementById("log");
	if (log) {
		var header = document.createElement("div");
		header.setAttribute("id", "header");
		header.innerHTML="<div class='categories'><a id='cat-help' target='new' href='http://opendomo.org/h.php'>Help</a></div>";
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
   var xmlHttp;
   if (window.XMLHttpRequest)
   { // Mozilla, Safari, ...
      var xmlHttp = new XMLHttpRequest();
   }
   else if (window.ActiveXObject)
   { // IE
      var xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
   }

   xmlHttp.open('GET', strURL, false);
   xmlHttp.setRequestHeader("If-None-Match","some-random-string");
   xmlHttp.setRequestHeader("Cache-Control","no-cache,max-age=0");
   xmlHttp.setRequestHeader("Pragma","no-cache");
   xmlHttp.setRequestHeader("Connection","close");
   xmlHttp.send(null);

   while(xmlHttp.readyState==0) {
	// Just wait
   }
   var command = strURL.replace(/\+/g," ");
   
   
   if (xmlHttp.readyState==4 && xmlHttp.responseText=="DONE") {
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
}

function loadMenu(){
	loadODControlData();
	var d = document.getElementById("frm");
	d.innerHTML = "";
	document.title = "Advanced configuration";

	var m = document.createElement("ul");
	/*
	var menu_template = document.createElement("li");
	menu_template.setAttribute("class","menuitem");
	menu_template.setAttribute("className","menuitem");
	var menu_template_caption = document.createTextNode("Load template");
	menu_template.appendChild(menu_template_caption);	
	menu_template.addEventListener("click", function() { loadTemplatesMenu();});
	m.appendChild(menu_template);
	*/
	
	var menu_ports = document.createElement("li");
	menu_ports.setAttribute("class","menuitem");
	menu_ports.setAttribute("className","menuitem");	
	var menu_ports_caption = document.createTextNode("Configure ports");
	menu_ports.appendChild(menu_ports_caption);
	menu_ports.addEventListener("click", function() { loadPortsMenu();});
	m.appendChild(menu_ports);
	d.appendChild(m);

	
	var menu_links = document.createElement("li");
	menu_links.setAttribute("class","menuitem");
	menu_links.setAttribute("className","menuitem");	
	var menu_links_caption = document.createTextNode("Configure links");
	menu_links.appendChild(menu_links_caption);
	menu_links.addEventListener("click", function() { loadLinksMenu();});
	m.appendChild(menu_links);
	d.appendChild(m);
	


	var menu_default = document.createElement("li");
	menu_default.setAttribute("class","menuitem");
	menu_default.setAttribute("className","menuitem");	
	var menu_default_caption = document.createTextNode("Restore factory defaults");
	menu_default.appendChild(menu_default_caption);
	menu_default.addEventListener("click", function() { 
		if (confirm("Do you want to restore factory defaults? All changes will be lost")) document.location='def';
		});
	m.appendChild(menu_default);
	d.appendChild(m);
	
	if (odcontrolversion == "1.3.1") return false;
}

function loadLinksMenu() {
	var d = document.getElementById("frm");
	d.innerHTML = "";
	var m = document.createElement("ul");
	
	var menu = document.createElement("li");
	menu.setAttribute("class","backmenu");
	menu.setAttribute("className","backmenu");
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
		var menu_caption = document.createTextNode(mylinks[i][0] + " - " + mylinks[i][1] + " (" + mylinks[i][2] + ")");
		menu.appendChild(menu_caption);	
		
		var dellnk = document.createElement("img");
		dellnk.setAttribute("src","http://cloud.opendomo.com/odctp/img/del.png");
		dellnk.setAttribute("class","infobutton");
		dellnk.addEventListener("click",function(){
			var l = parseInt(this.parentNode.title);
			command = "unl+" + mylinks[l][0] + "+" + mylinks[l][1];
			send_command(command);
			loadLinksInfo();
			alert("Link deleted!");
			loadLinksMenu();
		});
		menu.appendChild(dellnk);
		
		m.appendChild(menu);
	}
	
	var addblock =document.createElement("li");
	addblock.setAttribute("class","menuitem");
	addblock.setAttribute("className","menuitem");
	addblock.setAttribute("title","Add new link");
	var addblock_caption = document.createTextNode("Add");
	addblock.appendChild(addblock_caption);
	
	var alb_di = document.createElement("select");
	alb_di.setAttribute("name","inport");
	alb_di.setAttribute("id","inport");
	for(var i = 0; i < ports.length; i++) {
		if (ports[i][1]=="DI"){
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
		if (ports[i][1]=="DO"){
			var opt =ports[i][0];
			var el = document.createElement("option");
			el.textContent = opt;
			el.value = opt;
			alb_do.appendChild(el);
		}
	}
	addblock.appendChild(alb_do);

	var lnktypes = ["d","i","p","t"];
	var lnktypes_desc = ["direct", "invers","pulse", "test"];

	var alb_type = document.createElement("select");
	alb_type.setAttribute("name","type");
	alb_type.setAttribute("id","type");
	for(var i = 0; i < lnktypes.length; i++) {
		var el = document.createElement("option");
		el.textContent = lnktypes_desc[i];
		el.value = lnktypes[i];;
		alb_type.appendChild(el);
	}
	addblock.appendChild(alb_type);
	
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
				alert("Ports " + dip.value + " and " + dop.value + " are already linked");
				return false;
			}
		}
		command = "lnk+" + dip.value + "+" + dop.value + "+" + lnkt.value;
		send_command(command);
		loadLinksInfo();
		loadMenu();
	});	
	addblock.appendChild(alb_btn);
	
	m.appendChild(addblock);
	
	d.appendChild(m);	
	document.title = "Configurar enlaces";
}


function loadPortsMenu() {
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
	
	for (i=0;i<ports.length;i++) {
		var menu = document.createElement("li");
		menu.setAttribute("class","menuitem");
		menu.setAttribute("className","menuitem");
		menu.setAttribute("title",i);
		var menu_caption = document.createTextNode(ports[i][0]);
		menu.addEventListener("click", function() { loadPortDetails(this.title);});
		menu.appendChild(menu_caption);	
		m.appendChild(menu);
	}
	d.appendChild(m);	
	document.title = "Configurar puertos";
}


var sel;
function loadPortDetails(id) {
	var d = document.getElementById("frm");
	d.innerHTML = "";
	var m = document.createElement("ul");
	
	var menu = document.createElement("li");
	menu.setAttribute("class","backmenu");
	menu.setAttribute("className","backmenu");
	var menu_caption = document.createTextNode("Back");
	menu.addEventListener("click", function() { loadPortsMenu();});
	menu.appendChild(menu_caption);
	m.appendChild(menu);	
	
	// Input box for labeling ports
	var menu = document.createElement("li");
	menu.setAttribute("class","menuitem");
	menu.setAttribute("className","menuitem");
	menu.setAttribute("title",id);
	sel = id;
	
	var menu_caption = document.createTextNode("Nombre");
	menu.appendChild(menu_caption);
	var menu_input = document.createElement("input");
	menu_input.setAttribute("name","lbl");
	menu_input.setAttribute("id","lbl");
	menu_input.setAttribute("title","Nombre");
	menu_input.setAttribute("value",ports[id][0]);
	menu_input.setAttribute("type","text");
	menu.appendChild(menu_input);
	m.appendChild(menu);

	// Visible / not visible
	var menu = document.createElement("li");
	if (ports[id][3].indexOf("visib:visible")>0) {
		menu.setAttribute("class","menuitem OON");
		menu.setAttribute("className","menuitem OON");
		menu.setAttribute("title",i);
		var menu_caption = document.createTextNode("Visible");
		menu.appendChild(menu_caption);
		var menu_vis = document.createElement("a");	
		menu_vis.setAttribute("class","OOFF");
		var menu_vis_caption = document.createTextNode("ON");
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
		var menu_caption = document.createTextNode("Visible");
		menu.appendChild(menu_caption);
		var menu_vis = document.createElement("a");	
		menu_vis.setAttribute("class","OON");	
		var menu_vis_caption = document.createTextNode("OFF");
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

	// Enabled / disabled
	var menu = document.createElement("li");
	if (ports[id][1]!="XX") {
		menu.setAttribute("class","menuitem OON");
		menu.setAttribute("className","menuitem OON");
		menu.setAttribute("title",i);
		var menu_caption = document.createTextNode("Enabled");
		menu.appendChild(menu_caption);
		var menu_enable = document.createElement("a");	
		menu_enable.setAttribute("class","OOFF");
		var menu_enable_caption = document.createTextNode("ON");
		port_enabled = 1;
		menu_enable.addEventListener("click",function() {
			if (port_enabled==0) {
				this.parentNode.setAttribute("class", "menuitem OON");		
				this.setAttribute("class","OOFF");
				port_enabled=1;
				var minf = document.getElementById("min");
				var maxf = document.getElementById("max");
				minf.parentNode.style.display="block";
				maxf.parentNode.style.display="block";				
			} else {
				this.parentNode.setAttribute("class", "menuitem OOFF");
				this.setAttribute("class","OON");
				port_enabled=0;
				var minf = document.getElementById("min");
				var maxf = document.getElementById("max");
				minf.parentNode.style.display="none";
				maxf.parentNode.style.display="none";
			}
		});
	} else {
		menu.setAttribute("class","menuitem OOFF");
		menu.setAttribute("className","menuitem OOFF");
		menu.setAttribute("title",i);
		var menu_caption = document.createTextNode("Enabled");
		menu.appendChild(menu_caption);
		var menu_enable = document.createElement("a");	
		menu_enable.setAttribute("class","OON");	
		var menu_enable_caption = document.createTextNode("OFF");
		port_enabled = 0;
		menu_enable.addEventListener("click",function() {
			if (port_enabled==0) {
				this.parentNode.setAttribute("class", "menuitem OON");		
				this.setAttribute("class","OOFF");
				port_enabled=1;
				var minf = document.getElementById("min");
				var maxf = document.getElementById("max");
				minf.parentNode.style.display="block";
				maxf.parentNode.style.display="block";								
			} else {
				this.parentNode.setAttribute("class", "menuitem OOFF");
				this.setAttribute("class","OON");
				port_enabled=0;
				var minf = document.getElementById("min");
				var maxf = document.getElementById("max");
				minf.parentNode.style.display="none";
				maxf.parentNode.style.display="none";
			}
		});		
	}
	menu_enable.appendChild(menu_enable_caption);
	menu.appendChild(menu_enable);
	//menu.addEventListener("click", function() { alert(this.title);});
	m.appendChild(menu);

	if (sel >= 16 && sel <= 23) // ANALOG PORTS
	{
		var lst_des = ports[id][3].split(" ");
		for (k=0;k<lst_des.length;k++) {
			var pr = lst_des[k].split(":");
			if (pr[0]=="A") minvalue = pr[1];
			if (pr[0]=="B") maxvalue = pr[1];
		}
		var menumin = document.createElement("li");
		menumin.setAttribute("class","menuitem");
		menumin.setAttribute("className","menuitem");
		menumin.setAttribute("title",id);
		var menumin_caption = document.createTextNode("A");
		menumin.appendChild(menumin_caption);
		var menumin_input = document.createElement("input");
		menumin_input.setAttribute("name","min");
		menumin_input.setAttribute("id","min");
		menumin_input.setAttribute("title","Min");
		menumin_input.setAttribute("type","text");
		menumin_input.setAttribute("value",minvalue);
		menumin.appendChild(menumin_input);
		m.appendChild(menumin);
	
		var menumax = document.createElement("li");
		menumax.setAttribute("class","menuitem");
		menumax.setAttribute("className","menuitem");
		menumax.setAttribute("title",id);
		var menumax_caption = document.createTextNode("B");
		menumax.appendChild(menumax_caption);
		var menumax_input = document.createElement("input");
		menumax_input.setAttribute("name","max");
		menumax_input.setAttribute("id","max");
		menumax_input.setAttribute("title","Max");
		menumax_input.setAttribute("value",maxvalue);
		menumax_input.setAttribute("type","text");
		menumax.appendChild(menumax_input);
		m.appendChild(menumax);
		
		if (port_enabled==0) {
			menumin.style.display="none";		
			menumax.style.display="none";
		}
	}

	var tbr = document.createElement("div");
	tbr.setAttribute("class","buttons");
	var menu_ok_caption = document.createTextNode("Save changes");
	var menu_ok =document.createElement("a");
//	menu_ok.setAttribute("id","update_lbl");
	menu_ok.setAttribute("class","button");
	menu_ok.addEventListener("click", function() {
		var lbl = document.getElementById("lbl");
		if (validate_field("lbl",rx_str5) && validate_field("min",rx_num) && validate_field("max",rx_num)) {
			send_command("lbl+" + ports[sel][0] + "+" + lbl.value);
			send_command("cfg+" + ports[sel][0] + "+" + port_visible);
			if (port_enabled==1) {
				if (sel>=16 && sel<=23) {
					send_command("cfg+" + ports[sel][0] + "+ai");
					send_command("fxa+" + ports[sel][0] + "+" + menumin_input.value);
					send_command("fxb+" + ports[sel][0] + "+" + menumax_input.value);
				} else {
					send_command("cfg+" + ports[sel][0] + "+d");
				}
			} else {
				send_command("cfg+" + ports[sel][0] + "+x");
			}
			loadPortData(sel);
			ports[sel][0] = lbl.value;
			loadPortsMenu();
		}else{
			lbl.focus();	
		}
	});
	menu_ok.appendChild(menu_ok_caption);
	tbr.appendChild(menu_ok);

	var menu_cancel_caption = document.createTextNode("Cancel");
	var menu_cancel =document.createElement("a");
//	menu_cancel.setAttribute("id","update_lbl");
	menu_cancel.setAttribute("class","button");
	menu_cancel.addEventListener("click", function() {
		loadPortsMenu();
	});
	menu_cancel.appendChild(menu_cancel_caption);
	tbr.appendChild(menu_cancel);	
	
	m.appendChild(tbr);

	d.appendChild(m);	
	document.title = "Configurar puerto [" + ports[id][0] + "]";
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
		
	
	for (i=0;i<templates.length;i++) {
		var menu = document.createElement("li");
		var a = document.createElement("a");
		menu.title = templates_id[i];
		a.setAttribute("ref","/?origin="+templates_id[i]);
		menu.setAttribute("class","menuitem");
		menu.setAttribute("className","menuitem");
		var menu_caption = document.createTextNode(templates[i]);
		a.addEventListener("click", function() { 
			if (confirm("Do you want to load the template [" + this.innerHTML + "]?")) {
				document.location = "/?origin=" + this.parentNode.title;
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
	document.title = "Aplicar plantillas";
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

function loadingState() {
	totalok=0;
	totalerr=0;
	for (i=0; i < ports.length; i++) {
		if ((ports[i][3]) && (ports[i][3]!="") && (ports[i][3].length>5)) 
			totalok++; 
		if (ports[i][3]=="ERROR") 
			totalerr++;
	
	}
	if ( (totalok > 0) && (totalok == ports.length)) {
		if (totalerr>0) {
			if (confirm("Some data was lost. Retry?")) {
				reloadODControlData();
			}
		} else {
			loadMenu();
			clearInterval(myinterval);
		}
	}
}

function reloadODControlData() {
	for (i=0;i<ports.length;i++) {
		if (ports[i][3] =="ERROR") loadPortData(i);
	}	
}


function loadODControlData() {
	var xmlhttpVER;
	if (window.XMLHttpRequest)
		xmlhttpVER=new XMLHttpRequest();// code for IE7+, Firefox, Chrome, Opera, Safari
	else 
		xmlhttpVER=new ActiveXObject("Microsoft.XMLHTTP"); // code for IE6, IE5 and ancient electromechanic devices...

	xmlhttpVER.onreadystatechange=function()
		{
			if (xmlhttpVER.readyState==4 && xmlhttpVER.status==200)
			{
				var f = document.getElementById("footer");
				response = xmlhttpVER.responseText;
				var p = response.split(" ");
				f.innerHTML = "v." + p[2];
				odcontrolversion = p[2];
			}
		}
	xmlhttpVER.open("GET","ver+",true);
	xmlhttpVER.send();	


	var xmlhttpLST;
	if (window.XMLHttpRequest)
		xmlhttpLST=new XMLHttpRequest();// code for IE7+, Firefox, Chrome, Opera, Safari
	else 
		xmlhttpLST=new ActiveXObject("Microsoft.XMLHTTP"); // code for IE6, IE5 and ancient electromechanic devices...

	xmlhttpLST.onreadystatechange=function()
		{
			if (xmlhttpLST.readyState==4 && xmlhttpLST.status==200)
			{
				var response = xmlhttpLST.responseText;
				raw_ports = response.split("\n");
				for (i=0;i<raw_ports.length;i++) {
					if (raw_ports[i] != "DONE") {
						var s = raw_ports[i].split(":");
						ports[i]=new Array(s[1],s[0]),"", "";
					}
				}
				for (i=0;i<ports.length;i++) {
					loadPortData(i);
				}				
			}
		}
	xmlhttpLST.open("GET","lst",true);
	xmlhttpLST.send();
	
	
	
	loadLinksInfo();
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
					if (raw_links[i] != "DONE") {
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
				
			} else {
				ports[this.myportnumber][3] = "ERROR";			
			}
		}
	xmlhttpPort.open("GET",xmlhttpPort.myURL,true);
	xmlhttpPort.send();	
}



window.addEventListener("load",function(){
	var p = document.getElementById("header");
	if (p) {
		var code = "<div class='categories'>";
		code = code + "<a id='cat-map' href='/lst'>Home</a>";
		code = code + "<a id='cat-tools' href='javascript:loadMenu();' >Config</a>";			
		code = code + "<a id='cat-help' href='http://www.opendomo.com/wiki/index.php?title=Domino'>Help</a>";
		code = code + "</div>";
		p.innerHTML = code;
	}
});
