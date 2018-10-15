// This file stays ON-LINE
L["load_tmp"]="for(var c=0;c<10;c++){if(L['ini'+c]!='')eval(L['ini'+c]);};" ;
L["ini1"]='';
L["ini2"]='';
L["ini3"]='';
L["ini4"]='';
L["ini5"]='';
L["ini6"]='';
L["ini7"]='';
L["ini8"]='ID("b").innerHTML="";';
L["ini9"]="setTimeout(upd,parseInt(L['frequency']));";
eval(L["load_tmp"]);
L["frequency"]="1000";
// Here we can upgrade this function
L['---b.js']='function AM(t,n,v) {\
	var l=ID(n), r;\
	if (l){SA(l,"class",v);SA(l,"value",v);return CT("");} \
	switch (t) { \
	case "AO": \
	case "AV": \
		r = CE("input", "rng", n); \
		SA(r, "type", "range"); \
		SA(r, "step", 10);\
		SA(r, "min", 0);\
		SA(r, "max", 100);\
		r.onchange=function(e) {SV(this.id,this.value);};\
		l = M("li", "m", n, r);\
		break;\
	case "DO":\
	case "DV":\
		r = CE("a", v, n);\
		AC(r, CT(""));\
		r.onclick=function(e){SV(this.id,(this.className == "on")?"off":"on");};\
		l = M("li", "O" + v, n, r);\
		break;\
	case "AI":\
		r = CE("a", "val", n);\
		AC(r, CT(v));\
		l = M("li", "AI", n, r);\
		break;\
	case "DI":\
		r = CE("a", v);\
		AC(r, CT(""));\
		l = M("li", "I" + v, n, r);\
		break;\
	default:\
		return CT("");\
	}\
	return l;\
}'; 
//eval(L["b.js"]);

L["ver"]="1";
// When version is stable, replace load_tmp for load
