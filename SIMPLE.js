(function(){
	var S = {
		els: (a) => a instanceof HTMLElement ? [a] : Array.from(document.querySelectorAll.call(document, a) || []),
		el: (a) => a instanceof HTMLElement ? a : document.querySelector.call(document, a),
		empty: (a) => {
			var a = S.el(a);
			if(!a)return;
			while (a.firstChild) a.removeChild(a.firstChild);
		},
		append: (a,b) => {
			a = S.el(a);
			if(!a)return;
			var e = document.createElement('div');
			e.innerHTML = b;
			while(e.firstChild)a.appendChild(e.firstChild);
		},
		click: (a,b) => {
			if(typeof b === "undefined") Array.from(S.els(a) || []).forEach((aa) => aa.click());
			else document.addEventListener('click', (evt)=>{ if(evt.target.matches(a))b.call(evt, evt); });
		},
		value: (a, b) => 
		{
			a = Array.from(S.els(a) || []);
			if(a.length === 0)return;
			if(typeof b !== "undefined")a.forEach(aa => aa.value = b);
			return a[0].value;
		},
		attr: (a,b,c) => 
		{
			a = Array.from(S.els(a) || []);
			if(a.length === 0)return;
			if(typeof c !== "undefined")a.forEach(aa => aa.setAttribute(b, c));
			return a[0].getAttribute(b);
		},
		ajax: function(){ S.ajaxfn.apply(S, arguments).call(); },
		ajaxfn: (settings, callback) =>
		{
			var t=false;
			settings = typeof settings === "string" ? { "url": settings } : settings;
			settings.type = settings.type || "get";
			if(typeof settings.data === "object")settings.data = JSON.stringify(settings.data, null, 4);
			return () => 
			{
				if(t)return;
				t = true;
				var oReq = new XMLHttpRequest();
				oReq.addEventListener("load", () => 
				{
					t = false;
					var json = false;
					try{json = JSON.parse(oReq.responseText);}catch(er){console.error("failed to decode json, "+er)};
					callback.call(null, json);
				});
				oReq.open(settings.type, settings.url);
				if(typeof settings.data !== "undefined")oReq.send(settings.data);
				else oReq.send();
			}
		}
	};
	window.S = S;
}());