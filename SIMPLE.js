(function()
{
	var _s = {
		ajaxListeners: [],
		ajaxRunning: 0,
		callAjaxListener: (running) => 
		{
			var wasRunning = _s.ajaxRunning !== 0;
			_s.ajaxRunning += running;
			var isRunning = _s.ajaxRunning !== 0;
			if(wasRunning !== isRunning)_s.ajaxListeners.forEach(f => f(isRunning));
		}
	}, 
	S = {
		els: (a) => Array.isArray(a) ? Array.prototype.concat.apply([], a.map((aa) => S.els(aa))) : a instanceof HTMLElement ? [a] : Array.from(document.querySelectorAll.call(document, a) || []),
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
		click: function(){ S.clickfn.apply(S, arguments).call(); },
		clickfn: (a, b) => {
			return () => {
				if(typeof b === "undefined") Array.from(S.els(a) || []).forEach((aa) => aa.click());
				else document.addEventListener('click', (evt)=>{ if(evt.target.matches(a))b.call(evt, evt); });
			};
		},
		value: (a, b) => 
		{
			a = Array.from(S.els(a) || []);
			if(a.length === 0)return;
			if(typeof b !== "undefined")a.forEach(aa => aa.value = b);
			return a[0].value;
		},
		debouncedValueChanged: (a, b) =>
		{
			S.onEvent(a, 'keyup change', S.debouncefn(500, b));
		},
		onEvent: (a, b, c) =>
		{
			b.split(" ").forEach((bb) => {
				S.els(a).forEach((aa) => aa.addEventListener(bb, c));
			});
		},
		fireEvent: (a, b) =>
		{
			var evt = document.createEvent("HTMLEvents");
		    evt.initEvent(b, false, true);
		    S.els(a).forEach((aa) => aa.dispatchEvent(evt));
		},
		attr: (a,b,c) => 
		{
			a = Array.from(S.els(a) || []);
			if(a.length === 0)return;
			if(typeof c !== "undefined")
			{
				a.forEach(aa => {
					if(b==='disabled')aa.disabled = c;
					else aa.setAttribute(b, c);
				});
			}
			return b==='disabled' ? a[0].disabled : a[0].getAttribute(b);
		},
		css: (a,b,c) => 
		{
			a = Array.from(S.els(a) || []);
			if(a.length === 0)return;
			if(typeof c !== "undefined")a.forEach(aa => aa.style[b] = c);
			return a[0].style[b];
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
				_s.callAjaxListener(1);
				if(t)return;
				t = true;
				var oReq = new XMLHttpRequest();
				oReq.addEventListener("load", () => 
				{
					t = false;
					var json = false;
					try{json = JSON.parse(oReq.responseText);}catch(er){console.error("failed to decode json, "+er)};
					_s.callAjaxListener(-1);
					callback.call(null, json);
				});
				oReq.open(settings.type, settings.url);
				if(typeof settings.data !== "undefined")oReq.send(settings.data);
				else oReq.send();
			}
		},
		ajaxRunning: (fn) =>
		{
			_s.ajaxListeners.push(fn);
		},
		debouncefn: function(time, callback)
		{
			var timeout = false;
			return function()
			{
				var args = Array.from(arguments);
				if(timeout)
				{
					clearTimeout(timeout);
					timeout = false;
				}
				timeout = setTimeout(() => {
					timeout = false;
					callback.apply(null, args);
				}, time);
			};
		}
	};
	window.S = S;
}());