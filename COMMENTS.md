# 创建实例

真正的构造函数是 core/Axios.js 里的 function Axios。而直接从入口文件导出的`var axios = createInstance(defaults);`得到的 axios，并不是一个实例对象，其实只是个代理函数，因为下面的 bind 方法。(当然它也可以看作一个对象，因为 js 里都是对象，只不过它不是实例对象，它身上的属性都是从别的地方拷贝过来的或者直接就代理出去了)

```javascript
module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};
```

实质在调用`axios({url: 'xxxx'})`和`axios.get('xxxx')`时是把这些方法转接到一开始 new Axios 得到的实例上了，因为这个实例被 多次调用的 bind 方法保存下来了。

```javascript
// axios.js
var instance = bind(Axios.prototype.request, context);
// bind.js
fn.apply(thisArg, args);
```

在 createInstance 时，将 Axios.prototype.request 这个方法绑定了运行时的 this 指向，指向 context，new Axios 得到的实例对象

> fn.apply(thisArg, args) 就是给方法 fn 绑定 this 指向的。跟 call 一个作用

前面初始化得到的 instance 是个函数，也同时是个对象（在 js 里都是对象），所以后面的`utils.extend(instance, Axios.prototype, context);`将 prototype 上定义的方法又都复制了一下，所以导出的这个 axios 上会有 axios.get, axios.post 这样的方法。直接用 axios.get,axios.post 的时候，其实最后的 this 对象就是一开始 new Axios 创建的那个实例对象。

`utils.extend(instance, context);`是把实例对象上的属性拷贝到 instance 上。所以直接`axios.interceptors`是有值的，这个值就是默认实例对象上的属性值。`Object.keys(axios)`可以查看它身上有多少 key。

在项目里使用时，一般都是`let instance = axios.create({ config })`,在这个 create 方法就会调用 createInstance 这个方法，这个方法就返回个 instance，并且添加了属性和方法。在使用时`instance({ url: 'xxxx'})`，这时候会  发起 request 请求，这个 request 方法就是 Axios.prototype.request,执行这个方法的 this 对象就是这次 create 时又新创建的 new Axios 实例，所以跟默认导出的 axios 绑定的实例对象不是同一个，所以可以有自己特定配置的 Axios 实例。
