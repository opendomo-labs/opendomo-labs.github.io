function AJ(){return (window.XMLHttpRequest)?new XMLHttpRequest():new ActiveXObject("Microsoft.XMLHTTP");}	
function upd(){
	SC("lsc+hme", ci);
} function n(){}
function M(i,c,t,r){var l=ID(t)?ID(t):CE("li",c,i);AC(l,CT(t));AC(l,r);return l;}
function ID(id){return D.getElementById(id);}
function SC(c,f){
console.log(c);var x=AJ();
x.open('GET',c.replace(/ /g,"+"), false);
x.setRequestHeader("Cache-Control","no-cache,max-age=0");
x.setRequestHeader("Pragma","no-cache");
x.send(null);
x.onreadystatechange = f(x.responseText);
}
function SV(p,v){SC('set+'+p+'+'+v,n);}
function ci(tx) {
	var d=ID("b");var a=tx.split("\n");
	for ( var i=0; i<a.length; i++) {
		if (a[i] !="DONE")
			AC(d,AM(a[i].substr(6,2),a[i].substr(0,5),a[i].substr(11)));
	}
}
JS("../b.js");
// Add this dynamically:
window.title="odc01";
var uid ="1p23";
var ver ="2.0.0";

