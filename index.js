/**
 * @module: nd-plugins
 * @author: crossjs <liwenfu@crossjs.com> - 2015-02-09 17:28:21
 */

'use strict';

var $ = require('jquery');
var Events = require('nd-events');

/**
 * @constructor
 * @param {string}    name      插件名称，宿主内唯一
 * @param {function}  starter   插件启动器
 */
var PluginBase = function(name, starter) {
  this.name = name;
  this.options = {};
  this.starter = starter;
};

/**
 * 绑定事件
 */
PluginBase.prototype._bind = function(events) {
  Object.keys(events).forEach(function(key) {
    this.on(key, events[key]);
  }, this);
};

/**
 * 异步调用
 * ```
 * this.async();
 * setTimeout(function() {
 *   that.start();
 * });
 * ```
 */
PluginBase.prototype.async = function() {
  this._async = true;
};

/**
 * 供 starter 调用，一般在插件就绪时调用
 */
PluginBase.prototype.ready = function() {
  // 仅执行一次
  if (!this._ready) {
    this._ready = true;
    this.trigger('ready');
  }
};

/**
 * 启动插件
 * @param  {object}   host        宿主
 * @param  {function} callbacks   插件就绪回调函数，上下文为 host，传递参数为 plugin
 */
PluginBase.prototype.start = function(callbacks) {
  if (this._async) {
    this.starter();
    return;
  }

  if (callbacks) {

    if (typeof callbacks === 'function') {
      callbacks = {
        ready: callbacks
      };
    }

    this._bind(callbacks);
  }

  if (this.trigger('start') !== false) {
    if (!this._async) {
      this.starter();
    }
  }
};

PluginBase.prototype.getOptions = function(ns) {
  return ns ? this.options[ns] : this.options;
};

PluginBase.prototype.setOptions = function(ns, data) {
  if (typeof data === 'undefined') {
    $.extend(this.options, ns);
  } else {
    if (ns in this.options) {
      $.extend(this.options[ns], data);
    } else {
      this.options[ns] = data;
    }
  }
};

Events.mixTo(PluginBase);

var _plugins = {};

module.exports = {

  /**
   * 添加插件并自动执行
   * @param {string}   name       插件名称
   * @param {function} starter    插件启动器
   * @param {function} callbacks  插件回调
   */
  addPlugin: function(name, starter, callbacks) {
    var plugin = new PluginBase(name, starter);

    var cached = _plugins[this.cid];

    if (!cached) {
      cached = _plugins[this.cid] = {};
    }

    cached[name] = plugin;

    plugin.host = this;
    plugin.start(callbacks);
  },

  /**
   * 根据插件名称获取插件实例
   * @param  {string}   name    插件名称
   * @return {object}           插件实例
   */
  getPlugin: function(name) {
    var cached = _plugins[this.cid];
    return name ? (cached && cached[name]) : (cached || {});
  },

  /**
   * 初始化插件
   */
  initPlugins: function() {
    var pluginCfg = this.get('pluginCfg');
    var plugins = [[], [], []];

    this.Plugins.concat(this.get('plugins')).forEach(function(plugin) {
      // pluginEntry
      if (plugin.pluginEntry) {
        plugin = plugin.pluginEntry;
      }

      if (plugin.name in pluginCfg) {
        // 避免直接修改
        plugin = $.extend(true, {}, plugin, pluginCfg[plugin.name]);
      }

      if (plugin.disabled) {
        return true;
      }

      if (typeof plugin.priority === 'undefined') {
        plugin.priority = 1;
      }

      plugins[plugin.priority].push(plugin);
    });

    plugins[2].concat(plugins[1]).concat(plugins[0]).forEach(function(plugin) {
      this.addPlugin(plugin.name, plugin.starter, plugin.listeners);
    }, this);
  }

};
