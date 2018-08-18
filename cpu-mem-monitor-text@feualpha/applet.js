const Applet = imports.ui.applet;
const Cinnamon = imports.gi.Cinnamon;
const GTop = imports.gi.GTop;
const Lang = imports.lang;
const Mainloop = imports.mainloop;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;
const GLib = imports.gi.GLib;

function MyApplet(orientation) {
	this._init(orientation);
}

MyApplet.prototype = {
	__proto__: Applet.TextApplet.prototype,

    _init: function(orientation) {
        Applet.TextApplet.prototype._init.call(this, orientation);

		try {
			this.itemOpenSysMon = new PopupMenu.PopupMenuItem("Open System Monitor");
			this.itemOpenSysMon.connect('activate', Lang.bind(this, this._runSysMonActivate));
			this._applet_context_menu.addMenuItem(this.itemOpenSysMon);

			this.mem_gtop = new GTop.glibtop_mem();

			this.mem_label = "mem"

			this._applet_label.set_style('min-width: 2.5em; text-align: left');

			this.mem_usage = 0;
			this.mem_max = 0;
			this.mem_buffer = 0;
			this.mem_cached = 0;

			this._update();
		}
		catch (e) {
			global.logError(e);
		}
	},

	on_applet_clicked: function(event) {
		this._runSysMon();
	},

	_runSysMonActivate: function() {
		this._runSysMon();
	},

	_update: function() {
		try {
			GTop.glibtop_get_mem(this.mem_gtop);
			this.mem_usage = this.mem_gtop.used;
			this.mem_buffer = this.mem_gtop.buffer;
			this.mem_cached = this.mem_gtop.cached;
			this.mem_max = this.mem_gtop.total;
		
			let realuse = this.mem_usage - this.mem_buffer - this.mem_cached;
			let percent = Math.round((realuse * 100) / this.mem_max);
			this.set_applet_label(this.mem_label + " : " + percent.toString().slice(-3) + "%");
			this.set_applet_tooltip("Click to open Gnome system monitor");
		}
		catch (e) {
			global.logError(e);
		}

		Mainloop.timeout_add(2000, Lang.bind(this, this._update));
	},

	_runSysMon: function() {
		let _appSys = Cinnamon.AppSystem.get_default();
		let _gsmApp = _appSys.lookup_app('gnome-system-monitor.desktop');
		_gsmApp.activate();
	},
};

function main(metadata, orientation) {
	let myApplet = new MyApplet(orientation);
	return myApplet;
}
