/**
 * @module: nd-plugins
 * @author: crossjs <liwenfu@crossjs.com> - 2015-02-09 17:28:21
 */

'use strict';

/**
 * @constructor
 * @param {string}    name    插件名称，宿主内唯一
 * @param {function}  starter 插件启动器，必须返回当前插件实例
 */
var PluginBase = function(name, starter) {
  this.name = name;
  this.starter = starter;
};

/**
 * 供 starter 调用，一般在插件就绪时调用
 */
PluginBase.prototype.ready = function() {
  if (this.callback) {
    this.callback.call(this.host, this);
  }
};

/**
 * 启动插件
 * @param  {object}   host     宿主
 * @param  {function} callback 插件就绪回调函数，接收两个参数：host、plugin
 * @return {object}            当前插件实例
 */
PluginBase.prototype.start = function(host, callback) {
  if (host) {
    this.host = host;
  }

  if (callback) {
    this.callback = callback;
  }

  return this.starter(host);
};

module.exports = {

  /**
   * 添加插件并自动执行
   * @param {string}   name     插件名称
   * @param {function} starter  插件启动器
   * @param {function} callback 插件回调
   */
  addPlugin: function(name, starter, callback) {
    if (!this._plugins) {
      this._plugins = {};
    }

    this._plugins[name] = new PluginBase(name, starter).start(this, callback);
  },

  /**
   * 根据插件名称获取插件实例
   * @param  {string} name 插件名称
   * @return {object}      插件实例
   */
  getPlugin: function(name) {
    return this._plugins[name];
  }

};
