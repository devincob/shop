/**
 * @file
 * 窗口，带确定和取消按钮
 *
 * @author chenggong.jiang
 * @class ui.win  
 * @extends base
 */
sd.creatClass({
    name: "ui.win",
    imports: [
        "win.html",
        "css/win.css"
    ]
}, function() {

    /**
     * @constructs
     * 窗口构造函数
     *
     * @param {Number} width 窗口内容部分宽
     * @param {Number} height 窗口内容部分高
     * @param {string|Dom} title 标题内容,可以是字符串或者html Dom
     * @param {stirng|Dom} strOrdom 内容,可以是字符串或者html Dom
     * @param {Function} okCallback 确定按钮回调方法，如果不设置或者设置为null则不显示确定按钮
     * @param {Function} cancelCallBack 取消按钮回调方法，如果不设置或者设置为null则不显示取消按钮
     * @param {Object} ok 按钮自定义 {class:'',name:''} class css样式
     * @param {Object} cancel 按钮自定义 {class:'',name:''}
     * @param {Function} closeHandle 窗口关闭时的回调函数
     * @param {Number} autoHideTime自动隐藏时间
     */
    return function(width, height, title, strOrdom, okCallback, cancelCallBack, ok, cancel, closeHandle, autoHideTime) {
        sd.call("ui.win", "base", this);

        if(width === null) width = 500;
        if(height === null) height = 300;

        this.dom = $(sd.getHtml('win.html'));
        if(!$.isObject(strOrdom)) strOrdom = strOrdom + '';
        if($.isString(strOrdom) && strOrdom.indexOf("<") !== 0) {
            strOrdom = '<div class="win-body-str">' + strOrdom + '</div>';
        }
        this.autoHideTime = autoHideTime === undefined ? 0 : parseInt(autoHideTime);
        $(this.dom).hide();
        $("body").append(this.dom);
        $(this.dom).prop("id", this.onlyID);
        if(title) $(this.dom).find('.win-head-title').html(title);
        if(strOrdom) $(this.dom).find('.win-body').html(strOrdom);

        var noOk = !$.isFunction(okCallback);
        var noCancel = !$.isFunction(cancelCallBack);
        if(noOk) {
            $(this.dom).find(".win-ok").hide();
        } else {
            if($.isObject(ok)) {
                var okbtn = $(this.dom).find('.win-ok');
                if(ok.class) {
                    okbtn.removeClass('blue');
                    okbtn.addClass(ok.class);
                }
                if(ok.name) {
                    okbtn.html(ok.name);
                }
            }
        }

        if(noCancel) {
            $(this.dom).find(".win-cancel").hide();
        } else {
            if($.isObject(cancel)) {
                var cancelbtn = $(this.dom).find('.win-cancel');
                if(cancel.class) {
                    cancelbtn.removeClass('gray');
                    cancelbtn.addClass(cancel.class);
                }
                if(cancel.name) {
                    cancelbtn.html(cancel.name);
                }
            }
        }

        $(this.dom).find(".win-body").css({
            "height": 'auto',
            "height": $.isNumeric(height) ? height : 'auto'
        });
        $(this.dom).css({
            "width": width,
            "height": 'auto'
        });
        if(noOk && noCancel) {
            $(this.dom).find(".win-bottom").hide();
        }

        if((noOk && !noCancel) || (!noOk && noCancel)) {
            $(this.dom).find('.win-cancel').css({
                "width": "100%"
            });
            $(this.dom).find('.win-ok').css({
                "width": "100%"
            });
        }

        $(this.dom).remove();
        var _mask = $('<div id="mask' + this.onlyID + '" class="win-mask"></div>');
        var _this = this;

        $(this.dom).find(".win-head-close").click(function() {
            _this.close();
        });

        _mask.click(function() {
            _this.close();
        });

        $(this.dom).find(".win-cancel").click(function() {

            if(cancelCallBack) {
                var cancelback = cancelCallBack(_this)
                if($.isBoolean(cancelback)) {
                    if(cancelback) _this.close();
                } else {
                    _this.close();
                }
            } else {
                _this.close();
            }
        });

        $(this.dom).find(".win-ok").click(function() {
            if(okCallback) {
                var okback = okCallback(_this);
                if($.isBoolean(okback)) {
                    if(okback) _this.close();
                } else {
                    _this.close();
                }
            } else {
                _this.close();
            }
        });

        var resetSize = function() {
                var headHeight = $(_this.dom).find(".win-bottom").height();
                var bottomheight = $(_this.dom).find(".win-bottom").height();
                var maxHeight = $(window).height();
                var maxWidth = $(window).width();
                $(_this.dom).find('.win-body').css({
                    "max-height": (maxHeight - headHeight - bottomheight) + "px"
                });
                $(_this.dom).css({
                    "max-height": maxHeight + "px"
                });
                $(_this.dom).find('.win-body').css({
                    "max-width": maxWidth + "px"
                });
                $(_this.dom).css({
                    "max-width": maxWidth + "px"
                });
            }
            /**
             * @function
             * 打开窗口
             */
        this.open = function(tag) {
            if(!$.hasDomBy('#SDWinLayer', $('body'))) {
                var SDWinLayer = $('<div id="SDWinLayer"></div>');
                $('body').append(SDWinLayer);
            }
            if(tag && tag !== 'center') {
                $(_this.dom).removeClass('center');
                $(_this.dom).addClass(tag);
            }
            var bd = $('#SDWinLayer');
            $('.win-mask').hide();
            bd.append(_mask);
            bd.append(_this.dom);
            $(_this.dom).fadeIn(250);
            if(!bd.hasClass('win-mask-show')) {
                bd.addClass('win-mask-show');
            }
            $(window).bind('resize', resetSize);
            resetSize();
//            sd.log("_this.autoHideTime = "+ _this.autoHideTime );
            if(_this.autoHideTime > 0) {
                setTimeout(function() {
                    _this.close();
                }, _this.autoHideTime);
            }
        };

        /**
         * @function
         * 关闭窗口
         */
        this.close = function() {
            $("#" + _this.onlyID).fadeOut(250, function() {
                $("#mask" + _this.onlyID).remove();
                $("#" + _this.onlyID).remove();
                $('.win-mask:last').show();
                if($('.win-mask').get().length == 0) {
                    var bd = $("#SDWinLayer");
                    if(bd.hasClass('win-mask-show')) {
                        bd.removeClass('win-mask-show');
                    }
                }
            });
            $(window).unbind('resize', resetSize);
            if(closeHandle) closeHandle(this);
        };

    }
});