var App5 = {};
App5.PREFIXES = new Array(
	"","-webkit-","-moz-","-o-","-ms-"
);

App5.VERSION = "v0.1";

var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

App5.Initialize = function(){
	if( !document.registerElement){
		var fallback = document.createElement('script');
		if( navigator.appName.indexOf("Microsoft") != -1 ){
			fallback.src = "external-rc/document-register-element-ie8.js";
		}else{
			fallback.src = "external-rc/document-register-element.js";
		}
		document.head.appendChild(fallback);
		fallback.onload = App5.Initialize;
		return;
	}

	App5.css = function(element, prop, val, prefopt){
		if( val == undefined ){
			return getComputedStyle(element,null)[prop];
		}else{
			if( prefopt == 0 || prefopt == undefined){
				element.style[prop] = val;
				return;
			}
			for( var prefnum in App5.PREFIXES ){
				var prefix = App5.PREFIXES[prefnum];
				if( prefopt == -1 ){
					element.style[prefix+prop] = val;
				}else if( prefopt == 1 ){
					element.style[prop] = prefix+val;
				}else;
			}
		}
	};
	
	App5.consume = function(e){
		if(e.preventDefault){
			e.preventDefault();
		}else if(e.stopPropagation){
			e.stopPropagation();
		}else{
			e.cancelBubble = true;
		}
	};
	
	App5.getEventTarget = function(e){
		if(e.target){
			return e.target;
		}else if(e.srcElement){
			return e.srcElement;
		}else return null;
	};
	
	App5.Error = function(type,msg){
		this.toString = function(){
			return type+": "+msg;
		};	
	};
	
	//Dynamic Content Widget
	var DynamicProto = Object.create( HTMLElement.prototype );
	DynamicProto.refresher = function(){
		return "Dynamic Content: "+Math.random();
	};
	DynamicProto.createdCallback = function(){
		this.rate = 500;
		var that = this;
		setTimeout(function looper(){
			that.innerHTML = that.refresher();
			setTimeout(looper,that.rate);
		}, this.rate);
	};
	
	App5.Dynamic = document.registerElement("app5-dynamic", { prototype : DynamicProto } );
	
	//Panels
	var PanelProto = Object.create( HTMLElement.prototype );
	PanelProto.createdCallback = function(){
		App5.css(this,"display","block");
	};
	PanelProto.attachedCallback = function(){
		if( typeof this.parentNode == App5.TabPane ){
			App5.css(this, "visibility", "hidden");
		}
	};
	App5.Panel = document.registerElement( "app5-panel", { prototype : PanelProto } );
	
	//Notification Widget
	var NotifProto = Object.create( HTMLElement.prototype );
	NotifProto.createdCallback = function(){
		App5.css(this, "visibility", "hidden");
	
		var that = this;
		this.show = function(duration){
			if(that.parentNode.style.visibility = "visible"){
				App5.css(that,"visibility","visible");
				App5.css(that,"opacity",".9");
				if(duration == undefined){
					duration = 3;
				}
				setTimeout(that.hide,duration*1000);
			}
		};
		this.hide = function(){
			App5.css(that,"opacity","0");
			setTimeout( function(){
				App5.css(that,"visibility","hidden");
			}, 300);
		};
	};
	App5.Notification = document.registerElement("app5-notification", { prototype : NotifProto } );
	
	//Tab Stuff
	var TabPaneProto = Object.create( HTMLElement.prototype );
	App5.TabPane = document.registerElement( "app5-tabpane", { prototype: TabPaneProto } );
	
	var TabStripProto = Object.create( HTMLElement.prototype );
	App5.TabStrip = document.registerElement( "app5-tab-strip", { prototype : TabStripProto } );
	
	var TabMetaProto = Object.create( PanelProto );
	document.registerElement("app5-tab-meta", { prototype : TabMetaProto } );
	
	var TabProto = Object.create( HTMLElement.prototype );
	TabProto.createdCallback = function(){
		this.panel = "";
		this.setAttribute('data-focused','false');
	};
	TabProto.attachedCallback = function(){
		this.panel = this.getAttribute('panel');
		if( ! (this.parentNode.tagName == "APP5-TAB-STRIP") ){
			throw new App5.Error("HierarchyError", "Parent of app5-tab must be app5-tab-strip, not " + this.parentNode.tagName);
		}else{
			var panel = this.panel;
			var that = this;
			this.onclick = function(){
				that.select();
			};
			this.select = function(){
				var tabs = that.parentNode.getElementsByTagName("app5-tab");
				for(var i = 0; i < tabs.length; i++){
					if( tabs[i] != that ){
						tabs[i].setAttribute('data-focused','false');
					}else{
						tabs[i].setAttribute('data-focused','true');
					}
				}
				var els = that.parentNode.parentNode.getElementsByTagName("app5-panel");
				for(var num = 0; num < els.length; num++){
					var el = els[num];
					if( el.id == panel ){
						App5.css(el, "visibility","visible");
						var setsize = function(){
							if(that.getAttribute('data-focused') == 'true'){
								App5.css(elem.parentNode,'height',elem.offsetHeight);
							}
						};
						var elem = document.getElementById(panel);
						var observer = new MutationObserver(
							function(mutations,observer){
								setsize();
							}
						);
						observer.observe(elem,
							{
								childList:true,
								subtree:true
							}
						);
						setsize();
					}else{
						App5.css(el, "visibility","hidden");
					}
				}
			}
		}
	};
	App5.Tab = document.registerElement( "app5-tab", { prototype : TabProto } );
	
	//Menu Time!
	App5.CURRENT_MENU = null; //Currently open menu
	
	var MenuBarProto = Object.create( HTMLElement.prototype );
	App5.MenuBar = document.registerElement("app5-menubar", { prototype : MenuBarProto } );
	
	var MenuProto = Object.create( HTMLElement.prototype );
	
	MenuProto.show = function(x,y,ref){
		App5.CURRENT_MENU = this;
		ref.setAttribute("data-focused","true");
		
		App5.css( App5.CURRENT_MENU, 'visibility', 'visible' );
		App5.css( App5.CURRENT_MENU, 'left', x+"px" );
		App5.css( App5.CURRENT_MENU, 'top', y+"px" );
	};
	MenuProto.hide = function(ref){
		if( App5.CURRENT_MENU == this ){
			App5.css( App5.CURRENT_MENU, "visibility", "hidden" );
			App5.CURRENT_MENU = null;
			if(ref == undefined){
				ref = document.querySelector('[data-focused="true"]');
			}
			ref.setAttribute("data-focused","false");
		}
	};
	
	App5.Menu = document.registerElement( "app5-menu", { prototype : MenuProto } );
	
	var MenuRefProto = Object.create( HTMLElement.prototype );
	MenuRefProto.attachedCallback = function(){
		this.menu = document.getElementById(this.getAttribute('menu'));
		
		var that = this;
		this.onclick = function(){
			if( App5.CURRENT_MENU == that.menu ){
				App5.CURRENT_MENU.hide(that);
				return;
			}
			var nums = this.getBoundingClientRect();
			var left = nums.left;
			var bottom = nums.bottom;
			
			that.menu.show(left,bottom,that);
		};
		this.onmouseover = function(e){
			if( App5.CURRENT_MENU != null ){
				var targ = document.elementFromPoint(e.clientX, e.clientY).tagName;
				if(targ == "APP5-MENUREF"){
					App5.CURRENT_MENU.hide();
				}
				App5.CURRENT_MENU = that.menu;
				
				var nums = that.getBoundingClientRect();
				var left = nums.left;
				var bottom = nums.bottom;
				
				App5.CURRENT_MENU.show(left,bottom,that);
			}
		};
	};
	App5.MenuRef = document.registerElement( "app5-menuref", { prototype : MenuRefProto } );
	
	var MenuMetaProto = Object.create( HTMLElement.prototype );
	App5.MenuMeta = document.registerElement( "app5-menu-meta", { prototype : MenuMetaProto } );
	
	var MenuItemProto = Object.create( HTMLElement.prototype );
	App5.MenuItem = document.registerElement( "app5-menu-item", { prototype : MenuItemProto } );
	
	document.onclick = function(e){
		var targ = App5.getEventTarget(e);
		if( targ.tagName != "APP5-MENUREF" ){
			if(App5.CURRENT_MENU != null){
				App5.CURRENT_MENU.hide();
			}
		}
	};
	
	//Load App5 stylesheet (IMPORTANT!)
	var style = document.createElement('link');
	style.rel = "stylesheet";
	style.href = "App5.css";
	style.onload = function(){
		//Auto-select first tab
		var tab_panes = document.getElementsByTagName("app5-tabpane");
		for(var i = 0; i < tab_panes.length; i++){
			var pane = tab_panes[i];
			var strip = pane.getElementsByTagName("app5-tab-strip")[0];
			strip.querySelector('app5-tab:first-of-type').select();
		}
	};
	document.head.appendChild(style);
	
	var viewport = document.createElement('meta');
	viewport.name = "viewport";
	viewport.content = "width=device-width";
	document.head.appendChild(viewport);
	
	console.log("Initialized App5 "+App5.VERSION);
};

addEventListener('load',App5.Initialize);