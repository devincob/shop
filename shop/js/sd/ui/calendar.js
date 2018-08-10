/**
 * @file
 * 日期时间选择器
 *
 * @author chenggong.jiang
 * @class ui.calendar  
 * @extends uibase
 */
sd.creatClass({
    name: "ui.calendar",
    imports: ['calendar.html', 'css/calendar.css']
}, function() {
    /**
     * @constructs
     * 日期时间选择器构造函数
     *
     * @param {Dom} target 显示触发对象
     * @param {Function} callBack 日期时间选择确定后的回调，带参数: callBack(Date , target)
     * @param {Boolean} showClockTime 是否显示小时：分钟：秒
     * @param {Date} initDate 初始时间
     * @param {Date} start 开始时间
     * @param {Date} end 结束时间
     */
    return function(target, callBack, showClockTime, initDate, start, end) {
        sd.call("ui.calendar", "base", this);
        var selfdom = $('#' + this.onlyID);
        if(!$.hasDomBy('#SDWinLayer', $('body'))) {
            var SDWinLayer = $('<div id="SDWinLayer"></div>');
            $('body').append(SDWinLayer);
        }
        if($.isEmptyObject(selfdom.get(0))) {
            selfdom = $(sd.getHtml('calendar.html'));
            selfdom.attr('id', this.onlyID);
            $('#SDWinLayer').append(selfdom);
        }
        this.dom = selfdom;
        if(!showClockTime) {
            this.dom.find('.calendar-time').hide();
            this.dom.find('.calendar-bar').hide();
        }

        this.time = $.isA(initDate, Date) ? initDate : new Date();
        this.year = 0;
        this.month = 0;
        this.week = 0;
        this.day = 0;
        this.hour = 0;
        this.minutes = 0;
        this.seconds = 0;

        this.start = start === undefined ? new Date('1970-01-01') : start;
        var maxDate = new Date('9999-01-01');
        this.end = end === undefined ? maxDate : (end.getTime() > start.getTime() ? end : maxDate);

        var YM = this.dom.find('.calendar-title .calendar-center');
        var Days = this.dom.find('.calendar-day span');
        var Hour = this.dom.find('.calendar-time .calendar-hour');
        var Minute = this.dom.find('.calendar-time .calendar-minute');
        var Second = this.dom.find('.calendar-time .calendar-second');
        var BarSize = this.dom.find('.calendar-bar .calendar-size');
        var BarHandle = this.dom.find('.calendar-bar .calendar-handle');
        var ButtonGreen = this.dom.find('.calendar-buttons .green');
        var ButtonYellow = this.dom.find('.calendar-buttons .yellow');

        this.initDate = function() {
            var ndata = new Date();
            this.year = this.time.getFullYear();
            this.month = this.time.getMonth() + 1;
            this.week = this.time.getDay();
            if(this.week == 0) this.week = 7;
            this.day = this.time.getDate();
            this.hour = this.time.getHours();
            this.minutes = this.time.getMinutes();
            this.seconds = this.time.getSeconds();

            YM.text(this.year + '-' + this.month);
            var offsetDay = Math.abs(this.week - this.day % 7);
            var max = (new Date(this.year, this.month, 0)).getDate();
            var previousMax = this.month === 1 ? (new Date(this.year - 1, 12, 0)).getDate() : (new Date(this.year, this.month - 1, 0)).getDate();

            var daySpans = Days.get();
            for(var i = 0; i < daySpans.length; i++) {
                var spanitem = daySpans[i];
                $(spanitem).removeClass('calendar-seleted').removeClass('calendar-next').removeClass('calendar-pre').removeClass('calendar-on');
                if(i < offsetDay) {
                    spanitem.innerText = previousMax - offsetDay + i + 1;
                    $(spanitem).addClass('calendar-pre');
                } else if(i - offsetDay < max) {
                    var md = (i + 1) - offsetDay;
                    spanitem.innerText = md;
                    if(md === this.day) {
                        $(spanitem).addClass('calendar-seleted');
                    } else {
                        $(spanitem).addClass('calendar-on');
                    }
                } else {
                    spanitem.innerText = (i + 1) - max - offsetDay;
                    $(spanitem).addClass('calendar-next');
                }
            }
            Hour.text(this.hour > 9 ? this.hour : '0' + this.hour);
            Minute.text(this.minutes > 9 ? this.minutes : '0' + this.minutes);
            Second.text(this.seconds > 9 ? this.seconds : '0' + this.seconds);

        };

        var _this = this;
        //滚动条范围
        var min = 0;
        var max = 24;
        var current = 0;
        var currentSelect = Hour;
        var barCallBack = null;
        var removeHMSclass = function() {
            if(Hour.hasClass('calendar-seleted')) {
                Hour.removeClass('calendar-seleted');
            }
            if(Minute.hasClass('calendar-seleted')) {
                Minute.removeClass('calendar-seleted');
            }
            if(Second.hasClass('calendar-seleted')) {
                Second.removeClass('calendar-seleted');
            }
        };
        var initBar = function() {
            var p = parseInt(current / max * 100);
            BarSize.css('width', p + '%');
            BarHandle.css('left', p + '%');
        };
        Hour.click(function() {
            removeHMSclass();
            Hour.addClass('calendar-seleted');
            min = 0;
            max = 23;
            current = parseInt($(this).text());
            currentSelect = Hour;
            barCallBack = function(d) {
                _this.time.setHours(d);
            };
            initBar();

        });
        Minute.click(function() {
            removeHMSclass();
            Minute.addClass('calendar-seleted');
            min = 0;
            max = 59;
            current = parseInt($(this).text());
            currentSelect = Minute;
            barCallBack = function(d) {
                _this.time.setMinutes(d);
            };
            initBar();

        });
        Second.click(function() {
            removeHMSclass();
            Second.addClass('calendar-seleted');
            min = 0;
            max = 59;
            current = parseInt($(this).text());
            currentSelect = Second;
            barCallBack = function(d) {
                _this.time.setSeconds(d);
            };
            initBar();
        });

        // 添加滚动条事件
        var handleDown = false;
        var offset = 0;
        var maxSize = 0;

        var documentMouseUp = function() {
            handleDown = false;
            $(document).unbind({
                'mouseup': documentMouseUp,
                'mousemove': documentMouseMove
            });
        };
        var documentMouseMove = function(e) {
            if(handleDown) {
                var x = e.pageX - offset.left;
                if(x > 0 && x < maxSize) {
                    var p0 = x / maxSize;
                    var p = p0 * 100;
                    BarSize.css('width', p + '%');
                    BarHandle.css('left', p + '%');
                    var t = Math.round(max * p0);
                    if(t > 9) {
                        currentSelect.text(t);
                    } else {
                        currentSelect.text('0' + t);
                    }
                    if(barCallBack) barCallBack(t);
                }
            }
        };

        BarHandle.bind('mousedown', function() {
            handleDown = true;
            maxSize = BarHandle.parent().width();
            offset = BarSize.offset();
            $(document).bind({
                'mouseup': documentMouseUp,
                'mousemove': documentMouseMove
            });
        });

        // 添加当前时间事件
        ButtonGreen.click(function() {
            _this.time = new Date();
            _this.initDate();
        });
        var preMonth = function() {
            var m = _this.time.getMonth();
            if(m == 0) {
                _this.time.setMonth(11, 1);
                var y = _this.time.getFullYear();
                _this.time.setFullYear(y - 1);
            } else {
                _this.time.setMonth(m - 1, 1);
            }
        };
        // 添加上一月事件
        this.dom.find('.calendar-title .calendar-left').click(function() {
            preMonth();
            _this.initDate();
        });

        var nextMonth = function() {
            var m = _this.time.getMonth();
            if(m == 11) {
                _this.time.setMonth(0, 1);
                var y = _this.time.getFullYear();
                _this.time.setFullYear(y + 1);
            } else {
                _this.time.setMonth(m + 1, 1);
            }
        };
        // 添加下一月事件
        this.dom.find('.calendar-title .calendar-right').click(function() {
            nextMonth();
            _this.initDate();
        });
        // 添加日期选择事件
        Days.click(function() {
            var jdom = $(this);
            if(jdom.hasClass('calendar-on')) {
                _this.dom.find('.calendar-day .calendar-seleted').removeClass('calendar-seleted').addClass('calendar-on');
                jdom.addClass('calendar-seleted');
                _this.time.setDate(parseInt(jdom.text()));
            } else if(jdom.hasClass('calendar-next')) {
                nextMonth();
                _this.time.setDate(parseInt(jdom.text()));
                _this.initDate();
            } else if(jdom.hasClass('calendar-pre')) {
                preMonth();
                _this.time.setDate(parseInt(jdom.text()));
                _this.initDate();
            }
        });
        // 添加确定事件
        ButtonYellow.click(function() {
            if(callBack) callBack(_this.time, target);
            _this.dom.css('display', 'none');
        });
        // 全局事件
        var documentHandle = function(e) {
            var t = $(e.target);
            var i = 0;

            while(t && i < 100) {
                i++;
                if(t.hasClass('calendar') || t.attr('id') == target.attr('id') || t.hasClass('calendar-ctr')) {
                    return;
                }
                if(t.parent()) t = t.parent();
            }

            if(_this.dom.css('display') == 'block') {
                _this.dom.css('display', 'none');
            }
            $(document).unbind('mouseup', documentHandle);
        };
        var targetHandle = function(e) {
            e.preventDefault();
            $(document).unbind('mouseup', documentHandle);
            if(_this.dom.css('display') == 'none') {
                var toffset = target.offset();
                var theight = target.outerHeight();
                _this.dom.css({
                    'display': 'block',
                    'left': toffset.left + 'px',
                    'top': (toffset.top + theight) + 'px'
                });
                $(document).bind('mouseup', documentHandle);
                Hour.click();
                initBar();
            } else {
                $(document).unbind('mouseup', documentHandle);
                _this.dom.css('display', 'none');
            }
        };
        // 注册对象
        if(target) {
            target.bind('mouseup', targetHandle);
        }

        this.destroy = function() {
            target.unbind('mouseup', targetHandle);
            $(document).unbind('mouseup', documentHandle);
            this.dom.remove();
            this.dom = null;
            _this = null;
        }
        _this.initDate();
    }
});