// ADD MENU (type, name, value)
//if (L["b.js"]=="") L['b.js']=
function AM(t,n,v) {
	var l=ID(n), r;
	if (l){SA(l,"class",v);SA(l,"value",v);return CT("");} 
	switch (t) { 
	case "AO": 
	case "AV": 
		r = CE("input", "rng", n); 
		SA(r, "type", "range"); 
		SA(r, "step", 10);
		SA(r, "min", 0);
		SA(r, "max", 100);
		r.onchange=function(e) {SV(this.id,this.value);};
		l = M("li", "m", n, r);
		break;
	case "DO":
	case "DV":
		r = CE("a", v, n);
		AC(r, CT(""));
		r.onclick=function(e){SV(this.id,(this.className == "on")?"off":"on");};
		l = M("li", "O" + v, n, r);
		break;
	case "AI":
		r = CE("a", "val", n);
		AC(r, CT(v));
		l = M("li", "AI", n, r);
		break;
	case "DI":
		r = CE("a", v);
		AC(r, CT(""));
		l = M("li", "I" + v, n, r);
		break;
	default:
		return CT("");
	}
	return l;
}
//}'; 
//eval(L["b.js"]);
AC(ID('f'),CT(uid+' '+ver));
if (L["load"]) eval(L["load"]); else JS("http://cloud.opendomo.com/odctp/c.js");
