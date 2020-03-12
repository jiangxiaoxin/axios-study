"use strict";

var utils = require("./utils");
var bind = require("./helpers/bind");
var Axios = require("./core/Axios");
var mergeConfig = require("./core/mergeConfig");
var defaults = require("./defaults");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  // 返回的instance只是个方法
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
/**
 * createInstance返回的是个方法，当然在js里也是个对象，所以可以给它添加其他的属性和方法，比如axios.Axios,axios.create,axios.cancel。
 * 但它还是个方法，直接调用axios({url: 'xxxx'})，其实质是把这个请求，转接到它内部保存下来的context这个对象上，而这个对象就是个Axios的实例了。
 */
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
// 一般项目里都是 axios.create(config)方式创建实例。其实axios本身也是个实例，可以直接请求了。
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = require("./cancel/Cancel");
axios.CancelToken = require("./cancel/CancelToken");
axios.isCancel = require("./cancel/isCancel");

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = require("./helpers/spread");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;
