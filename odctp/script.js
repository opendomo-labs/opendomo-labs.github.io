function popupwindow(url){
	window.open(url,"odctp","menubar=0,resizable=1,scrollbar=1,width=500,height=700");
}

function loadtemplate(id,defip){
	var myip = prompt('Indique la IP de su ODControl',defip);
	
	if (myip) {
		popupwindow("http://" + myip + ":81/?origin=" + id );
	}
}
