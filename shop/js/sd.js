/**
* @file
<h2>javascript面向对象编程</h2>
该微框架下的代码需要遵循ECMAScript5编码规范，
虽然ECMAScript6看起来很酷，已经引入了Class和模块化的重要概念,
但他那令人担忧的兼容性迫使我们做项目的不得不暂时保持观望。
<a href="http://kangax.github.io/compat-table/es6/">es6兼容性</a> 与 
<a href="http://kangax.github.io/compat-table/es5/">es5兼容性</a> 
所以载项目中请保持你的编码规范不要超越ECMAScript5。<br>
<h3>shandian javascript 简称sd</h3>
sd是一个javascript ECM5规范的面向对象编程的微框架,
sd封装了创建类，类继承，类异步加载等功能。<br>
同时封装了异步请求，本地存储，本地页面跳转等一些基础功能。<br>
sd框架的思路优势是可以面向对象编程。一个文件对应一个或多个类。<br>
独立的模块控制器功能，每一个控制器都是独立的域，功能控制器可以异步加载。<br>
<h3>需要遵从一些规范</h3>
<h4>文件目录规范</h4>
<ul>
<li>js/下方根目录下放jquery等外部库文件
<li>js/sd/放控模块制器
<li>js/ui/放sd框架下的UI类文件
</ul>
<h4>文件命名规范</h4>
<ul>
<li>自定义js文件名统一小写
<li>多单词组成的用-连接
</ul>
*
* @author chenggong.jiang
* @namespace sd  
*/
(function(win) {
    'use strict';
    var sd = {};
    // 版本号
    sd.version = '1.0.0';
    // json数据http通信地址
    sd.host = '';
    sd.debugHost = "";
    sd.webHost = '';
    sd.type = 'json';
    // 版本控制
    sd.fconfig = {};
    // web根路径
    sd.froot = location.href.substring(0, location.href.lastIndexOf('/') + 1).replace('\\', '/');
    sd.webHost = sd.froot;
    // request公用send数据
    sd.send = {};
    // 是否开启资源cnd配置路径替换
    var resetCDNPath = false;
    // 是否禁用鼠标右键
    var noRightMouse = false;
    /** 
     * 获取浏览器版本信息
     */
    sd.browserInfo = {
        'browser': 'unkown',
        'version': '1.0'
    };
    try {
        var ua = navigator.userAgent.toLowerCase();
        var re = /(rv\:|msie|firefox|chrome|opera|version).*?([\d.]+)/;
        var m = ua.match(re);
        sd.browserInfo.browser = m[1].replace(/version/, "'safari");
        sd.browserInfo.version = sd.browserInfo.ver = m[2];
    } catch(e) {

    }

    // 开启跨域模式
    jQuery.support.cors = true;

    /**
     * 判断对象是否含有属性,jQuery扩展
     *
     * @function
     * @param {Object} obj 对象实例
     * @param {string} name 属性名称
     * @return {boolean}
     */
    jQuery.hasPrototype = function(obj, name) {
        // !obj.hasOwnProperty(name) &&
        return(name in obj);
    };

    /**
     * 获取数据类型，jQuery扩展
     *
     * @function
     * @param {Object} obj 对象实例
     * @return {string} 返回对象类型（如果是自定义类则返回自定义类全路径名）
     */
    jQuery.typeOf = function(obj) {
        if($.hasPrototype(obj, '_class_')) {
            return obj._class_.name;
        }

        var sn = Object.prototype.toString.call(obj);
        sn = sn.substring(sn.lastIndexOf(' '), sn.lastIndexOf(']'));
        return sn;
    };

    /**
     * 获取数据类型，jQuery扩展
     *
     * @function
     * @param {Object} obj 对象实例
     * @param {Object|string} type "自定义类包全路径"或者对象类型。如 "ui.hwindow"或者 Array
     * @return {boolean} 如果是同一类型则返回true
     */
    jQuery.isA = function(obj, type) {
        if($.isString(type)) {
            if($.typeOf(obj) === type) {
                return true;
            }

            var getClassParent = function(obj) {
                if($.hasPrototype(obj, '_class_') && obj._class_.parent) {
                    return obj._class_.parent;
                }

                return false;
            };
            obj = getClassParent(obj);
            while(obj) {
                if(obj.name === type) {
                    return true;
                }

                obj = obj.parent ? obj.parent : false;
            }

            return false;
        }

        return obj instanceof(type);
    };

    /**
     * 检查对象是否是布尔值 ，jQuery扩展
     *
     * @function
     * @param {Object} obj 对象实例
     * @return {boolean}
     */
    jQuery.isBoolean = function(obj) {
        return Object.prototype.toString.call(obj) === '[object Boolean]';
    };

    /**
     * 检查对象是否是字符串，jQuery扩展
     *
     * @function
     * @param {Object} obj 对象实例
     * @return {boolean}
     */
    jQuery.isString = function(obj) {
        return Object.prototype.toString.call(obj) === '[object String]';
    };

    /**
     * 检查对象是否是Object，jQuery扩展
     *
     * @function
     * @param {Object} obj 对象实例
     * @return {boolean}
     */
    jQuery.isObject = function(obj) {
        return obj instanceof Object;
    };

    /**
     * 检查Dom对象是否存在
     *
     * @function
     * @param {String} idOrClass HTML id或者class属性.如"#app",".table"
     * @return {HTMLDocument} dom html容器对象，如果为空则为当前的整个dom
     */
    jQuery.hasDomBy = function(idOrClass, dom) {
        if(dom === undefined) dom = $('body');
        var find = dom.find(idOrClass).get();
        if(find && find.length > 0) return true;
        return false;
    };

    /**
     * 获取HTMLDocument 内容高度
     * 
     * @param {HTMLDocument} dom
     */
    (function($) {
        $.fn.scrollHeight = function() {
            var childs = this.children();
            var height = 0;
            for(var i = 0; i < childs.length; i++) {
                height += $(childs[i]).outerHeight();
            }
            return height;
        }
    })(jQuery);

    /**
     * 对象继承，框架方法。
     *
     * @param {Object} child      子类。
     * @param {Object} parent      父类。
     * @param {Object} childPackage            自定义类全路径名。
     */
    var sdExtend = function(child, parent, childPackage) {
        var pt = Object(parent.prototype);
        pt.constructor = child;
        child.prototype = pt;
        child._class_ = {
            parent: parent._class_,
            name: childPackage
        };
    };

    /**
     * 对象继承方法，框架方法。
     *
     * @param {Object} child 子类
     * @param {Object} parent 父类
     * @param {Object} thisRef 子类构造函数中的this
     * @param {Array} args 子类向父类构造函数传参
     */
    sd.call = function(child, parent, thisRef, args) {
        var temp = thisRef._class_;
        if(temp == null) {
            thisRef._class_ = temp = sd.getClass(child)._class_;
        }
        if(args) {
            sd.getClass(parent).apply(thisRef, args);
        } else {
            sd.getClass(parent).apply(thisRef);
        }

        thisRef._class_ = temp;
    };

    // ur转key
    var urlToKey = function(url, formatable) {
        if(formatable) url = formatUrl(url, true);
        if(url.indexOf('?') > 0) url = (url.split('?'))[0];
        if(url.indexOf('#') > 0) url = (url.split('#'))[0];
        return url.replace(/[\W]+/g, '_');
    }

    // 格式化url
    var formatUrl = function(url, cutFRoot, froot) {
        url = url.replace(/\\/g, '\/');
        if(cutFRoot) {
            froot = froot ? froot : sd.froot;
            if(url.indexOf(froot) === 0) {
                url = url.replace(froot, '');
            } else {
                //throw new Error(url + '  和  ' + froot + ' 不在同一个域！'); 
            }
        }
        return url;
    };

    // 文件版本对比,检测是否需要更新
    var fvCheck = function(furl, version) {
        var fp = formatUrl(furl, true);
        if(fp !== '') {
            var vfind = sd.localData(urlToKey(fp));
            if($.isNumeric(vfind)) {
                if(version !== vfind) {
                    return true;
                }
                return false;
            }
        }

        return false;
    };

    // 刷洗文件版本号
    var flashFV = function(furl, version) {
        if($.isNumeric(version)) {
            var fp = formatUrl(furl, true);
            if(fp !== '') {
                sd.localData(urlToKey(fp), version);
            }
        }
    };

    var getOwnProperty = function(targt, cn) {
        if(sd.browserInfo.browser === "msie") {
            if(parseInt(sd.browserInfo.version) <= 8) {
                return targt[cn];
            }
        }

        return Object.getOwnPropertyDescriptor(targt, cn).value;
    }

    var defineProperty = function(targt, cn, newclass) {
        if(sd.browserInfo.browser === "msie") {
            if(parseInt(sd.browserInfo.version) <= 8) {
                targt[cn] = newclass;
                return;
            }
        }
        if(Object.defineProperty) {
            Object.defineProperty(targt, cn, {
                value: newclass
            });
        } else {
            targt.property[cn] = newclass;
        }

        //      Object.defineProperty(targt, cn, {
        //          value: newclass
        //      });
    }

    var extendProperty = function(extendClass, targt, cn, newclass, cpackage) {
        sdExtend(newclass, extendClass, cpackage);
        defineProperty(targt, cn, newclass);
    };

    /**
     * 检查对象是否是合格的包名
     *
     * @function
     * @param {string} cpackage 自定义类全路径名
     */
    var checkPackageName = function(cpackage) {
        var ix = cpackage.indexOf('.');
        var iem = cpackage.replace(/^([a-zA-Z_]+[\w-]*\.)*[a-zA-Z_]+[\w-]*$/, '');
        if(iem !== '' || ix === 0 || ix === cpackage.length - 1) {
            throw new Error(cpackage + '包名不规范');
        }

    };

    /**
     * 获取文件加载版本
     * 
     * @param {String} url
     */
    sd.getFileVersion = function(url) {
        var noroot = url.replace(sd.froot, '');
        var sid = urlToKey(noroot);
        return sd.fconfig[sid];
    };

    var setFileVersionParam = function(url) {
        var oldVreg = /v=\d+/g;
        url = url.replace(oldVreg, '');
        var fv = sd.getFileVersion(url);
        if(url.indexOf('?') > 0) {
            var arr = url.split('?');
            url = arr[0] + '?v=' + fv + '&' + arr[1];
        } else if(url.indexOf('#') > 0) {
            var arr = url.split('#');
            url = arr[0] + '?v=' + fv + '#' + arr[1];
        } else {
            url = url + '?v=' + fv;
        }
        return url;
    };

    var loadTextFile = function(url, callback, failback, options) {
        url = setFileVersionParam(url);
        options = options ? options : {};
        var op = jQuery.extend({}, {
            dataType: 'text',
            cache: true,
            async: true,
            url: url
        }, options);
        jQuery.ajax(op).done(function(data) {
            if(callback) {
                callback(data);
            }
        }).fail(function() {
            if(failback) {
                failback();
            }
        });
    };

    var getFileType = function(url) {
        return url.substring(url.lastIndexOf('.') + 1);
    };

    var addCss = function(sid, csstext) {
        if($.isEmptyObject($('#' + sid).get(0))) {
            var styledom = $('<style></style>')
            styledom.attr({
                type: 'text/css',
                id: sid
            }).appendTo('head');
            styledom.text(csstext);
        }
    };

    /**
     * 获取加载过的html
     *
     * @function
     * @param {string} url 文件地址
     */
    sd.getHtml = function(url) {
        var sid = urlToKey(url, true);
        var filestr = runTimeCache[sid];
        if(filestr === undefined) filestr = sd.localData(sid);
        if(filestr === null) filestr = sd.fileCache[sid];
        return filestr;
    };

    var resetCssFile = function(data) {
        // 替换相对地址到静态路径
        data = data.replace(/\.\.\/|\.\.\\/g, sd.froot + '');
        // 替换样式地址
        data = data.replace(/url\(res/g, 'url(' + sd.froot + 'res');
        // 替换样式地址
        data = data.replace(/url\(css/g, 'url(' + sd.froot + 'css');
        return data;
    };

    var resetHtmlFile = function(data) {
        // 替换相对地址到静态路径
        data = data.replace(/\.\.\/|\.\.\\/g, sd.froot + '');
        // 替换图片地址
        data = data.replace(/src=\"res/g, 'src="' + sd.froot + 'res');
        // 替换样式地址
        data = data.replace(/url\(res/g, 'url(' + sd.froot + 'res');
        // 替换样式地址
        data = data.replace(/url\(css/g, 'url(' + sd.froot + 'css');
        return data;
    };

    // 文件存储
    sd.fileCache = {};
    /**
     * 加载文本文件内容
     *
     * @function
     * @param {string} url 文本文件地址
     * @param {boolean} cacheable 是否缓存数据，如为true则开启本地数据缓存，下次请求如果版本没更新的话，直接取本地数据,默认false
     * @param {string} fileType 文件类型  'css' , 'html' , 'json' 或者其他
     * @param {Function} [callback] 数据成功返回后回调 callback(textstr);
     * @param {Function} [failback] 数据失败返回后回调 failback(url);
     * @param {json} [params] 请求参数
     * @param {get|post} [type] 请求类型设置 "post"或者"get" ,默认是"get"
     */
    var importFile = function(url, cacheable, callback, failback, params, type) {
        var sid = urlToKey(url, true);
        var fileType = getFileType(url);

        if(fileType !== 'js') {
            var filestr = sd.fileCache[sid];

            if(filestr === undefined) {
                if(cacheable) {
                    filestr = sd.localData(sid);
                } else {
                    filestr = runTimeCache[sid];
                }
            } else {
                if(fileType === 'css') {
                    filestr = resetCssFile(filestr);
                } else if(fileType === 'html') {
                    filestr = resetHtmlFile(filestr);
                }
            }
            if(filestr) {
                if(fileType === 'css') {
                    addCss(sid, filestr);
                }
                if(callback) callback(filestr);
                return;
            }
        } else {
            if(sd.fileCache[sid]) {
                var fun = sd.fileCache[sid];
                if($.isFunction(fun)) {
                    fun();
                } else {
                    throw new Error(sid + " js file error");
                }

                callback();
                return;
            } else {
                //              sd.log(sid + ' not in fileCache');
            }
        }
        //加载
        var options = {
            'data': params,
            'type': type
        };
        if(fileType === 'js') options.dataType = 'script';
        var rurl = ((url.indexOf('http') === 0) ? url : sd.froot + url);
        loadTextFile(rurl, function(data) {
            if(fileType === 'css') {
                data = resetCssFile(data);
                if(cacheable) sd.localData(sid, data);
                else runTimeCache[sid] = data;
                addCss(sid, data);
                if(callback) callback(data);
            } else if(fileType === 'html') {
                data = resetHtmlFile(data);
                if(cacheable) sd.localData(sid, data);
                else runTimeCache[sid] = data;
                if(callback) callback(data);
            } else if(fileType === 'js') {
                if(callback) callback();
            } else {
                if(cacheable) sd.localData(sid, data);
                else runTimeCache[sid] = data;
                if(callback) callback(data);
            }
        }, function() {
            if(failback) {
                failback(rurl);
                if(callback) callback();
            }

        }, options);
    };

    // 控制器actions
    var ctrActions = [];
    // 文件加载与class创建
    var actions = [];
    // 是否正在加载中
    var fileloading = false;

    // 处理文件列表
    var fileLoad = function() {
        if(fileloading) return;
        fileloading = true;
        if(actions.length > 0) {
            actionsHandle();
        } else if(ctrActions.length > 0) {
            ctrActionsHandle();
        } else {
            fileloading = false;
        }
    };

    var actionsHandle = function() {
        if(actions.length > 0) {
            var action = actions.shift();
            if($.isString(action)) {
                importFile(action, false, actionsHandle, actionsHandle);
            } else if($.isFunction(action)) {
                action();
                actionsHandle();
            } else {
                throw new Error('自己加载路径格式错误');
            }
        } else {
            ctrActionsHandle();
        }
    }

    var ctrActionsHandle = function(args) {
        if(actions.length > 0) {
            actionsHandle();
            return;
        }
        if(ctrActions.length > 0) {
            var ctrAction = ctrActions.shift();
            if($.isFunction(ctrAction.action)) {
                if(ctrAction.params) {
                    ctrAction.action(ctrAction.params);
                } else {
                    ctrAction.action();
                }
                ctrActionsHandle();
            } else {
                throw new Error('控制器格式错误');
            }
        } else {
            fileloading = false;
            fileLoad();
        }
    };

    var classPackage = {};

    // 创建类，框架私有方法
    var creatClass = function(cpackage, extend, newclass) {
        if(!$.isObject(newclass)) {
            throw new Error(cpackage + '创建类失败');
        }

        if(sd.getClass(cpackage)) { // 该类已经创建过一次了
            return;
        }

        var ix = cpackage.indexOf('.');
        var ar = ix > 0 ? cpackage.split('.') : [
            cpackage
        ];
        var tag = '@Class';
        ar[ar.length - 1] = ar[ar.length - 1] + tag;
        var targt = classPackage;
        for(var i = 0; i < ar.length; i++) {
            var cn = ar[i];
            var h = targt.hasOwnProperty(cn);
            if(cn.indexOf(tag) > 0) {
                if(h) {
                    return;
                }

                if(extend || !$.isEmptyObject(extend)) {
                    if($.isString(extend)) {
                        var gclass = sd.getClass(extend);
                        if(gclass) {
                            extendProperty(gclass, targt, cn, newclass, cpackage);
                        } else {
                            throw new Error(extend + ' 类没有加载');
                        }
                    } else if($.isObject(extend)) {
                        extendProperty(extend, targt, cn, newclass, cpackage);
                    } else {
                        defineProperty(targt, cn, newclass);
                    }
                } else {
                    defineProperty(targt, cn, newclass);
                }
            } else {
                if(!h) {
                    defineProperty(targt, cn, {});
                }

                targt = getOwnProperty(targt, cn);
            }
        }
    };

    /**
     * 创建对象，可继承，框架方法 (ECMAScript5)
     *
     * @function
     * @param {Object} params  需要加载的项目，格式：
     *   {
     *     name:'ui.win', // 自定义类名（完整包路径）, 请对应文件路径class/ui/win.js
     *     extend: 'base', // 继承对象, 没有此字段的话默认继承base
     *     imports: [
     *                 'win.html',      // 需加载的html模块
     *                 'css/win.css',
     *                 'js/ui/ulit.js',  // 需要加载的js对象文件
     *             ]
     *   }
     * @param {Object} newclass 自己定义的对象
     */
    sd.creatClass = function(params, classFactry) {
        if(params === null || !$.isObject(params) || !$.isString(params.name)) {
            throw new Error('params参数错误，params={name:"className",extend:"base"');
        } else {
            checkPackageName(params.name);
        }

        if($.isObject(params.extend)) {
            // actions.push(params.extend);
        } else if(!$.isString(params.extend)) {
            params.extend = 'base';
        }

        if($.isArray(params.imports) && params.imports.length > 0) {
            actions = actions.concat(params.imports);
        }

        actions.push(function() {
            creatClass(params.name, params.extend, classFactry());
        });

        fileLoad();
    };

    /**
     * 获取自定义类，框架方法
     *
     * @function
     * @param {string} cpackage 自定义类包全路径名
     * @return {Object|false} 返回对象，如果对象不存在则会返回false
     */
    sd.getClass = function(cpackage) {
        checkPackageName(cpackage);
        var ix = cpackage.indexOf('.');
        var ar = ix > 0 ? cpackage.split('.') : [
            cpackage
        ];
        var tag = '@Class';
        ar[ar.length - 1] = ar[ar.length - 1] + tag;
        var targt = classPackage;
        for(var i = 0; i < ar.length; i++) {
            var cn = ar[i];
            var h = targt.hasOwnProperty(cn);
            if(h) {
                if(cn.indexOf(tag) > 0) {
                    return getOwnProperty(targt, cn);
                }

                targt = getOwnProperty(targt, cn);
            } else {
                return false;
            }
        }
        return false;
    };

    /**
     * 控制器 ，框架方法
     *
     * @function
     * @param {Array} imports 需要加载的文件(css,html,js)
     * @param {Function} action 控制器的方法
     */
    sd.controller = function(imports, action) {
        if($.isArray(imports) && imports.length > 0) {
            actions = imports.concat(actions);
        }

        if($.isFunction(action)) {
            ctrActions.unshift({
                action: action
            });
        }
        fileLoad();
    }

    /**
     * 数据打印
     *
     * @function
     * @param {*} obj 打印数据对象
     */
    sd.log = function(obj) {
        if($.isObject(obj)) {
            console.log(JSON.stringify(obj));
        } else {
            console.log(obj);
        }
    }

    /**
     * 获取url请求地址
     * 
     * @param {String} url
     * @param {String} format 'json' or 'script' or ....
     * @param {Object} urlParams 包含到url中的JSON数据 (&key=value)
     */
    var getUrl = function(url, format, urlParams) {
        var sendParams = '';
        for(var key in sd.send) {
            sendParams += '&' + key + '=' + sd.send[key];
        }

        if(urlParams) {
            for(var key in urlParams) {
                sendParams += '&' + key + '=' + urlParams[key];
            }
        }

        var rurl = (url.indexOf('http') === 0) ? url : sd.host + url;

        if(rurl.indexOf('?') > 0) {
            rurl = rurl.substring(0, rurl.indexOf('?') + 1) + 'format=' + format + sendParams + '&' + rurl.substring(rurl.indexOf('?') + 1);
        } else {
            if(rurl.indexOf('#') > 0) {
                rurl = rurl.substring(0, rurl.indexOf('#')) + '?format=' + format + sendParams + rurl.substring(rurl.indexOf('#'));
            } else {
                rurl = rurl + '?format=' + format + sendParams;
            }
        }

        return rurl;
    };

    /**
     * 获取url地址
     * 
     * @param {Object} url
     * @param {Object} urlparams
     * @param {Object} debug
     */
    sd.getUrl = function(url, urlparams, format, debug) {
        // 模拟数据地址
        if(debug) {
            url = sd.debugHost + url;
        }

        return getUrl(url, format, urlparams);
    }

    var getKey = function(url, params, type, urlparams) {
        var obj = {
            url: url,
            params: params,
            urlparams: urlparams
        };
    }

    /**
     * 自定义跨域请求方式
     * 
     */
    sd.ajax = new(function() {
        var timeout = 10000; // 超时时间
        var step = 50; // 轮询时间
        var requestCache = {};
        var requestlist = [];
        var onlyid = 1;
        var _this = this;
        var postHandle = function(data) {
            data.interval = window.setInterval(function() {
                var hf = top.location.href + '';
                data.time += step;
                if(data.time < timeout) {
                    var obj = sd.getRouterParams();

                    if(obj && obj.oid && parseInt(obj.oid) == data.id) {
                        if(data.interval) {
                            clearInterval(data.interval);
                            delete data.interval;
                        }
                        var backStr = decodeURIComponent(obj.encode);
                        if(backStr.indexOf('http') != 0) {
                            try {
                                var jsondata = JSON.parse(backStr);
                                if(data.callback) {
                                    data.callback(jsondata);
                                }

                            } catch(e) {
                                if(data.failback) {
                                    data.failback({
                                        error: {
                                            code: 1000,
                                            message: "encode数据格式错误"
                                        }
                                    });
                                }
                            }
                            delete requestCache[data.id];
                        } else {
                            //返回的是一个连接地址，则重新get数据
                            //_this.send('get', backStr, {}, data.callback, data.failback);
                            data.scriptUrl = backStr;
                            getHandle(data);
                        }
                        history.back(-1);
                        if(data.iframe) data.iframe.remove();
                    }
                } else {
                    if(data.failback) {
                        data.failback({
                            error: {
                                code: 400,
                                message: "请求数据超时或数据错误"
                            }
                        });
                    }
                    clearInterval(data.interval);
                    if(data.iframe) data.iframe.remove();
                    delete requestCache[data.id];
                }
            }, step);
        };

        var getHandle = function(data) {
            var scriptdom = $('\<script id="' + data.formid + '" type="text/javascript" src="' + data.scriptUrl + '"\>\<\/script\>');
            $('body').append(scriptdom);
            data.timeout = setTimeout(function() {
                $('#' + data.formid).remove();
                delete requestCache[data.id];
                clearTimeout(data.timeout);
                if(data.failback) {
                    data.failback({
                        error: {
                            code: 400,
                            message: "请求数据超时或数据错误"
                        }
                    });
                }
            }, timeout);
        };

        this.callback = function(oid, json) {
            var data = requestCache[oid];
            if(data) {
                if(data.timeout) {
                    clearTimeout(data.timeout);
                }
                $('#' + data.formid).remove();
                delete requestCache[data.id];
                if(data.callback) {
                    try {
                        data.callback(json);
                    } catch(e) {
                        if(data.failback) {
                            data.failback({
                                error: {
                                    code: 200,
                                    message: "数据格式错误"
                                }
                            });
                        }
                    }
                }
            }
        }

        var load = function() {
            if(requestlist.length === 0) return;
            var did = requestlist.shift();
            var data = requestCache[did];
            if(data.type == 'post') {
                var ifname = data.formid + did;
                data.iframe = $('<iframe id="' + ifname + '" name="' + ifname + '" style="display:none;"></iframe>');
                $('body').append(data.iframe);

                if(data.isForm) {
                    var mform = $('#' + data.formid);
                    mform.attr("action", data.url);
                    mform.attr('target', ifname);
                    mform.attr('method', 'post');
                    mform.submit();
                } else {
                    // post Json数据
                }
                postHandle(data);
            } else {
                // get 数据
                data.scriptUrl = sd.getUrl(data.url, {
                    oid: data.id,
                }, 'script');
                getHandle(data);
            }
        };

        this.send = function(url, formIdOrJson, cache, callback, failback, type, debug, urlparams) {
            // 模拟数据地址
            if(debug) {
                url = sd.debugHost + url;

            }
            var formid;
            var send = null;
            var isForm = false;
            if(type != 'post') type = 'get';
            onlyid++;

            if($.isString(formIdOrJson)) {
                formid = formIdOrJson;
                if($('#' + formid).get(0).tagName != 'FORM') {
                    throw new Error('id等于' + formIdOrJson + "的form表单不存在");
                }
                isForm = true;
            } else if($.isObject(formIdOrJson)) {
                send = formIdOrJson;
                isForm = false;
                formid = 'AjaxForm' + onlyid;
            } else {
                throw new Error('formIdOrJson 参数错误');
            }

            urlparams = $.isObject(urlparams) ? urlparams : {};
            var topurl = top.location.href;
            if(topurl.indexOf("#") == -1) topurl = topurl + "#temp";
            if(type == 'post') {
                urlparams = $.extend(true, urlparams, {
                    oid: onlyid,
                    url: encodeURIComponent(topurl)
                });
            } else {
                urlparams = $.extend(true, urlparams, {
                    oid: onlyid
                });
            }
            var re = {
                id: onlyid,
                time: 0,
                isForm: isForm,
                formid: formid,
                send: send,
                url: getUrl(url, 'script', urlparams),
                type: type,
                curl: top.location.href,
                callback: callback,
                failback: failback,
                iframe: null,
                loaded: false
            };
            requestCache[re.id] = re;
            requestlist.push(re.id);
            load();
        };

    })();

    /**
     * json数据拷贝
     * 
     * @param {Object} json
     */
    sd.copy = function(json) {
        var isObject = true;
        if(!$.isObject(json)) {
            json = {
                data: json
            };
            isObject = false;
        }
        if(isObject) {

            return JSON.parse(JSON.stringify(json));
        } else {
            return(JSON.parse(JSON.stringify(json))).data;
        }
    };

    /**
     * JSON数据请求接口
     *
     * @function
     * @param {string} url api接口
     * @param {json} params 发送数据
     * @param {Number|String|boolean} cache 数据缓存方式，false，标示做任何缓存，如果是true则做持久缓存，如果是 String 则以string为key做运行时数据缓存,如果是Number则标示识超时时间time，则数据在time时间内有效
     * @param {Function} callback 数据成功返回后回调。在有缓存机制的时候，callback必须返回一个boolean值，当数据是可用切判断没有超时时返回true则不会去重新加载数据，返回false则会重新加载数据。
     * @param {Function} failback 数据失败返回后回调
     * @param {get|post} type 请求类型设置 "post"或者"get" ,默认是"get"
     * @param {boolean} debug 是否是测试接口
     * @param {json} urlparams 附加在请求地址上的额外参数,如果type是"get"方式，则可将数据直接放在params里面
     */
    sd.request = function(url, params, cache, callback, failback, type, debug, urlparams) {
        // 模拟数据地址
        if(debug) {
            url = sd.debugHost + url;
        }

        var ckey = url.replace(/[\W]+/g, "_");
        // 判断是否开启缓存
        if($.isBoolean(cache)) {
            if(cache) { // 开启了持久化缓存，数据可以通过 var ckey = url.replace(/[\W]+/g, "_"); sd.localData(ckey); 获取
                var ldata = sd.localData(ckey);
                if(ldata !== null && callback(ldata)) {
                    return;
                }
            }
        } else if($.isString(cache)) { // 开启了运行时缓存 ,数据可以通过 sd.memoryData(cache);获取
            var rdata = runTimeCache[cache];
            if(rdata !== null && callback(rdata)) {
                return;
            }
        } else if($.isNumeric(cache)) { // 开启了带超时时间的持久化缓存，数据可以通过 var ckey = url.replace(/[\W]+/g, "_"); sd.localData(ckey).data; 获取
            if(cache > 0) {
                var currentTime = (new Date()).getTime();
                var ckey = url.replace(/[\W]+/g, "_")
                var tdata = sd.localData(ckey);
                if(tdata !== null && currentTime - tdata.time < tdata.timeout && callback(tdata.data)) {
                    return;
                }
            }
        }

        if(!$.isString(type)) {
            type = 'get';
        }

        $.ajax({
            type: type,
            url: getUrl(url, sd.type, urlparams),
            async: true,
            data: params,
            dataType: sd.type
        }).done(function(data, textStatus, jqXHR) {
            if(data && data.error && data.error.code + '' === '1002') {
                // sesson 过期
                sd.dispatchEvent('loginout');
            }
            if(callback(data)) { // callback 如何返回true，则表示数据返回成功并开启数据缓存
                if($.isBoolean(cache)) {
                    if(cache) {
                        sd.localData(ckey, data);
                    }
                } else if($.isString(cache)) {
                    runTimeCache[cache] = data;
                } else if($.isNumeric(cache)) {
                    var currentTime = (new Date()).getTime();
                    var cdata = {
                        key: ckey,
                        time: currentTime,
                        timeout: cache,
                        data: data
                    }
                    sd.localData(ckey, cdata);
                }
            }
        }).fail(function(jqXHR, textStatus, errorThrown) {
            var backdata = {
                data: null,
                textStatus: textStatus,
                status: jqXHR.status
            };
            if(jqXHR.responseText) {
                backdata.data = jqXHR.responseText;
            }
            if($.isFunction(failback)) failback(backdata);
        });
    };

    // 运行时数据缓存
    var runTimeCache = {};

    // 运行时数据缓存
    sd.memoryData = function(key, value) {
        if(!$.isEmptyObject(key)) {
            if(!$.isString(key)) {
                key = key.toString();
            }
            if(value !== undefined) {
                runTimeCache[key] = value;
            } else {
                return runTimeCache[key];
            }
        } else {
            runTimeCache = {};
        }
    }

    // web stroage
    var webStorageHandle = function(storage, key, value) {
        if(key !== null) {
            if(key === undefined) return null;
            if(!$.isString(key)) {
                key = key.toString();
            }
            if(value !== undefined && value !== null) {
                if($.isBoolean(value)) {
                    value = '1:' + (value ? '1' : '0');
                } else if($.isNumeric(value)) {
                    value = '2:' + value;
                } else if($.isString(value)) {
                    value = '3:' + value;
                } else if($.isArray(value)) {
                    value = '4:' + JSON.stringify({
                        data: value
                    });
                } else if($.isObject(value)) {
                    value = '5:' + JSON.stringify(value);
                } else if($.isXMLDoc(value)) {
                    var serializer = new XMLSerializer();
                    value = '6:' + serializer.serializeToString(value);
                } else {
                    throw new Error(key + '存储格式不支持' + value);
                }
                storage.setItem(key, value);
            } else {
                if(value === null) {
                    storage.removeItem(key);
                } else {
                    var fstr = storage.getItem(key);
                    if(fstr == null) {
                        return null;
                    }
                    var reg = /^[\d]+\:/;
                    if(reg.test(fstr)) {
                        var ix = fstr.indexOf(':');
                        var vstr = fstr.substring(ix + 1);
                        var vtype = fstr.substring(0, ix);
                        switch(vtype) {
                            case '1':
                                return vstr === '1';
                            case '2':
                                return Number(vstr);
                            case '3':
                                return vstr;
                            case '4':
                                return(JSON.parse(vstr)).data;
                            case '5':
                                return JSON.parse(vstr);
                            case '6':
                                return $.parseXML(vstr);
                        }
                    }
                    return fstr;
                }
            }
        } else {
            storage.clear();
        }
        return null;
    };
    /**
     * 轻量级本地数据存储（持久化，域名范围访问限制，大小限制5M）
     * 请不要直接使用window.localStorage因为他可能不可用，另外他value只能是String
     *
     * @function
     * @param {string} key key
     * @param {boolean|number|string|Array|Json|XML} value value
     * @return {*}
     */
    sd.localData = function(key, value) {
        if(window.localStorage) {
            return webStorageHandle(window.localStorage, key, value);
        }
    };

    /**
     * 回话数据存储（访问时间段内持久，域名范围访问限制，大小限制5M）
     * 请不要直接使用window.sessionStorage因为他可能不可用，另外他value只能是String
     *
     * @function
     * @param {string} key key
     * @param {boolean|number|string|Array|Json|XML} value value
     * @return {*}
     */
    sd.session = function(key, value) {
        if(window.sessionStorage) {
            return webStorageHandle(window.sessionStorage, key, value);
        }
    };

    /**
     * 静态页面跳转
     *
     * @function
     * @param {string} url 下一个页面
     * @param {boolean|number|string|Json|XML} data 传递个下一个页面的数据，注意：这个不是传送给后台的数据
     * @param {string} tag 下一个页面标记
     */
    sd.toPage = function(url, data, tag) {
        if(tag === undefined) {
            tag = url.replace(/\W/g, '_');
        }

        if(data) {
            sd.session(tag, data);
        }

        setTimeout(function() {
            location.href = url;
            refreshPage = true;
        }, 100);
    };

    /*
     * 单页面路由系统
     * 
     */
    var router = {};
    router.pages = {};
    router.main = null;

    /**
     * 获取页面路由参数对象
     */
    sd.getRouterParams = function() {
        var href = window.location.toString();

        if(href.indexOf('#') > 0) {
            var args = href.split('#')[1];
            var params = args.split('&');
            var obj = {
                'page': params[0]
            };
            for(var i = 1; i < params.length; i++) {
                var item = params[i].split('=');
                obj[item[0]] = item[1];
            }
            return obj;
        }
        return null;
    }

    var oldlocation = '';
    var refreshPage = false;

    var pageHandle = function() {
        var obj = sd.getRouterParams();
        if(obj && obj.oid === undefined) {
            if(oldlocation != window.location.href || refreshPage) {
                oldlocation = window.location.href;
                refreshPage = false;
                if($.hasDomBy("#SDWinLayer")) {
                    $("#SDWinLayer").html("");
                }
                for(var key in router.pages) {
                    if(key === obj['page']) router.pages[key](obj);
                }
            }
        } else if(obj === null) {
            if(oldlocation != window.location.href || refreshPage) {
                oldlocation = window.location.href;
                if($.hasDomBy("#SDWinLayer")) {
                    $("#SDWinLayer").html("");
                }
                refreshPage = false;
                if($.isFunction(router.main)) router.main();
            }
        }
    };

    sd.mainRouter = function(action) {
        router.main = action;
    };

    /*
     * 添加页面内导航侦听
     *
     * @function
     * @param {string} page a标签连接地址#后面的第一个参数.如 <a href='#page&param1=abc&num=1'>添加页面内导航</a>
     * @param {string} action 回调方法 action(obj); 如点击上面的a标签会执行action({param1:"abc",num:"1"});
     */
    sd.addRouter = function(page, action) {
        router.pages[page] = action;
    }

    /*
     * 移除页面内导航侦听
     *
     * @function
     * @param {string} page a标签连接地址#后面的第一个参数.如 <a href='#page&param1=abc&num=1'>添加页面内导航</a>;
     */
    sd.removeRouter = function(page) {
        router.pages[page] = null;
        delete router.pages[page];
    }

    /**
     * 清除所有导航侦听
     */
    sd.removeAllRouter = function() {
        router.pages = {};
        router.main = null;
    }

    /**
     * 刷新页面
     */
    sd.refreshPage = function() {
        refreshPage = true;
    };

    /*
     * 时间轴系统
     * 
     * 每秒30帧的轮询
     */

    var watchCatch = {};
    /**
     * 移除所有轮询
     */
    sd.removeAllWatch = function() {
            watchCatch = {};
            sd.addWatch('WINDOW_HREF_CHECK', pageHandle, null, 200);
        }
        /**
         * 添加监视（ 30帧每秒）
         * 
         * @param {String} key 
         * @param {Function} action 方法
         * @param {Object} params 方法回调参数
         * @param {Number} time 轮询时间间隔
         */
    sd.addWatch = function(key, action, params, time) {
        if(params === undefined) params = null;
        if(time === undefined) time = 0;
        watchCatch[key] = {
            key: key,
            action: action,
            params: params,
            time: time,
            start: 0
        };
    }

    /**
     * 删除监视 
     * 
     * @param {String} key
     */
    sd.removeWatch = function(key) {
        watchCatch[key] = null;
        delete watchCatch[key];
    }

    var pf = 40;
    var startWatchTime = (new Date()).getTime();
    var runtime = 0;
    setInterval(function() {
        runtime = (new Date()).getTime() - startWatchTime;
        for(var key in watchCatch) {
            var item = watchCatch[key];
            if(item ) {
                var run = true;
                if(item.time && item.time > 0) {
                    if(runtime - item.start < item.time) run = false;
                    else item.start = runtime;
                }
                if(run && item.action) {
                    if(item.params !== null) {
                        item.action(item.params);
                    } else {
                        item.action();
                    }
                }
            }
        }
    }, pf);

    /*
     * 事件系统，方便controller直接的通信
     */

    var eventList = {};

    /**
     * 移除所有事件
     */
    sd.removeAllEvent = function() {
        eventList = {}
    };
    /**
     * 添加事件
     * 
     * @param {String} key 事件名称
     * @param {String} onlytag 唯一标记
     * @param {Function} action 方法，接收一个参数
     */
    sd.addEvent = function(key, onlytag, action) {
        var obj = eventList[key];
        if(obj) {
            obj[onlytag] = action;
        } else {
            obj = eventList[key] = {};
            obj[onlytag] = action;
        }
    }

    /**
     * 检查是否存在事件侦听
     * 
     * @param {String} key 事件名称
     * @param {String} onlytag 唯一标记
     */
    sd.hasEvent = function(key, onlytag) {
        var obj = eventList[key];
        if(obj && $.isFunction(obj[onlytag])) {
            return true;
        }
        return false;
    }

    /**
     * 移除事件
     * 
     * @param {String} key 事件名称
     * @param {String} onlytag 唯一标记
     */
    sd.removeEvent = function(key, onlytag) {
        if(key === undefined) return;
        if(onlytag === undefined) {
            eventList[key] = null;
            delete eventList[key];
        } else {
            if(eventList[key] === undefined) eventList[key] = {};
            eventList[key][onlytag] = null;
            delete eventList[key][onlytag];
        }

    }

    /**
     * 发布事件
     * 
     * @param {String} key 事件名称
     * @param {Object} params 附带的数据。可选
     */
    sd.dispatchEvent = function(key, params) {
        if(key === undefined) return;
        var obj = eventList[key];
        if(obj) {
            for(key in obj) {
                var action = obj[key];
                if(action) {
                    if(params !== undefined) action(params);
                    else action();
                }
            }
        }
    }

    // 本地indexedDB
    //sd.indexedDB = window.indexedDB || window.msIndexedDB || window.mozIndexedDB || window.webkitIndexedDB;

    /**
     *  获取唯一id
     */
    sd.getOnlyID = function() {
        return '_' + (new Date()).getTime() + '' + Math.round(Math.random() * 100000000);
    }

    /**
     * base 所有自建类的基类
     *
     * @class base
     */
    sd.creatClass({
        name: 'base',
        extend: Object
    }, function() {
        return function() {
            this._class_ = {
                parent: null,
                name: 'base'
            };
            this.onlyID = sd.getOnlyID();
            this.isA = function(type) {
                return $.isA(this, type);
            };
        };
    });

    if(win) {
        win.SD = win.sd = sd;
    }

    sd.addWatch('WINDOW_HREF_CHECK', pageHandle, 200);

    if(!window.localStorage) {
        //alert('This browser does NOT support localStorage');
    }

    //if(!sd.indexedDB) {
    // alert('This browser does NOT support IndexedDB');
    //}

    var documents = $(document);

    documents.ondragstart = function() {
        return false;
    };

    documents.keydown(function(e) {
        if(e.which === 27) {
            window.close();
        } else if(e.which === 116 || e.which === 123) {
            return false;
        } else if(event.keyCode == 8) {
            //         if(event.srcElement.tagName.toUpperCase() != "INPUT" && event.srcElement.type != "text") event.returnValue = false;
        }
    });

    // 禁用右键
    if(noRightMouse) {
        documents.ready(function() {
            $('body').attr('oncontextmenu', "self.event.returnValue=false");
        });
    }
    // 添加弹出层
    $(document).ready(function() {
        $('body').append($('<div id="SDWinLayer"></div>'));
    });
    /**
     * 覆盖系统的alert弹出框
     * 
     * @param {String} tilte 标题
     * @param {String} content 内容 
     * @param {Function} callback 确认按钮回调方法
     * @param {Number} width 宽
     * @param {Number} height 高
     * @param {Number} autoHideTime自动隐藏时间
     */
    sd.alertList = [];
    win.alert = function(tilte, content, callback, width, height, autoHideTime) {
        sd.controller(['js/sd/ui/win.js', 'win.html', 'css/win.css'], function() {
            var Win = sd.getClass("ui.win");
            width = width ? width : 300;
            height = height ? height : 100;
            if(content) {

            } else {
                content = tilte + '';
                tilte = '提示信息';
            }
            //if(Win)
            var alertWin = new Win(width, height, tilte, content, function(win) {
                if(callback) callback(win);
                return true;
            }, null, null, null, function(t) {
                for(var i = 0; i < sd.alertList.length; i++) {
                    if(sd.alertList[i].onlyID == t.onlyID) {
                        sd.alertList.splice(i, 1);
                        break;
                    }
                }
            }, autoHideTime);
            alertWin.open();
            sd.alertList.push(alertWin);
            if(sd.alertList.length > 3) {
                sd.alertList[0].close();
            }
        });
    };

    /**
     * 覆盖系统的confirm弹出框
     * 
     * @param {String} tilte 标题
     * @param {String} content 内容 
     * @param {Function} okCallback 确认按钮回调方法
     * @param {Function} cancelCallback 取消按钮回调方法
     * @param {Number} width 宽
     * @param {Number} height 高
     * @param {Number} autoHideTime自动隐藏时间
     */
    sd.confirmList = [];
    win.confirm = function(tilte, content, okCallback, cancelCallback, width, height, autoHideTime) {
        sd.controller(['js/sd/ui/win.js', 'win.html', 'css/win.css'], function() {
            var Win = sd.getClass("ui.win");
            width = width ? width : 300;
            height = height ? height : 100;
            if(content) {

            } else {
                content = tilte + '';
                tilte = '提示信息';
            }
            //if(Win)
            var confirmWin = new Win(width, height, tilte, content, function(win) {
                if(okCallback) okCallback(win);
                return true;
            }, function() {
                if(cancelCallback) cancelCallback(win);
                return true;
            }, null, null, function(t) {
                if(cancelCallback) cancelCallback(win);
                for(var i = 0; i < sd.confirmList.length; i++) {
                    if(sd.confirmList[i].onlyID == t.onlyID) {
                        sd.confirmList.splice(i, 1);
                        break;
                    }
                }
            }, autoHideTime);
            confirmWin.open();
            sd.confirmList.push(confirmWin);
            if(sd.confirmList.length > 3) {
                sd.confirmList[0].close();
            }
        });
    }

    /**
     * 日期对象方法扩展
     * 
     * @param {String} fmt yy qq MM dd:hhmmss SS
     */
    Date.prototype.format = function(fmt) { //author: meizz 
        var o = {
            "M+": this.getMonth() + 1, //月份 
            "d+": this.getDate(), //日 
            "h+": this.getHours(), //小时 
            "m+": this.getMinutes(), //分 
            "s+": this.getSeconds(), //秒 
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
            "S": this.getMilliseconds() //毫秒 
        };
        if(/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for(var k in o)
            if(new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }

    /**
     * 获取0点时间戳
     */
    Date.prototype.getZero = function() {
        this.setHours(0);
        this.setMinutes(0);
        this.setSeconds(0);
        this.setMilliseconds(0);
        return this.getTime();
    }

    /**
     * 对String函数的扩展
     * 
     * @param {Number}} n 保留多少位小数 [0,20]
     */
    String.prototype.toFloatStr = function(n) {
        if(n > 20) {
            n = 20;
        } else if(n < 0) {
            n = 0;
        }
        if(this.length > 20) return this;
        var num = parseFloat('0' + this.replace(/[^\d\.]/, '')) + "";
        if(num.indexOf(".") > 0) {
            var arr = num.split(".");
            n = n - arr[1].length;
        } else {
            num += '.';
        }
        if(n > 0) {
            while(n > 0) {
                num += "0";
                n--;
            }
        } else if(n < 0) {
            num = num.substring(0, num.length + n);
        }
        return num;
    }
    return sd;
})(typeof window !== "undefined" ? window : this);