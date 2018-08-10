/**
 * @file
 * vue 钩子和组件
 *
 * @author chenggong.jiang
 */
sd.controller([], function() {

    // Vue下拉特效钩子slidUpDown
    Vue.transition('slidUpDown', {
        css: false,
        enter: function(i, done) {
            $(i).hide();
            $(i).slideDown('fast', done);
        },
        enterCancelled: function(el) {
            $(el).stop()
        },
        leave: function(i, done) {
            $(i).slideUp('fast', done);
        },
        leaveCancelled: function(el) {
            $(el).stop()
        }
    });

    // 开关组件
    Vue.component('sd-onoff', {
        template: '<span class="check-span" v-bind:class="{\'on\':onoff,\'off\':(!onoff)}" v-on:click="clickHandle"></span>',
        props: {
            'onoff': Boolean
        },
        methods: {
            clickHandle: function() {
                this.onoff = !this.onoff;
            }
        }
    });

    // 减 [1]加  组件
    Vue.component('sd-subadd', {
        template: '<span class="sd-subadd"><a class="on-span subtract" v-on:mousedown="mouseDown(\'sub\')" v-on:mouseup="mouseUp()" v-on:mouseout="mouseOut()"></a>' +
            '<input class="input-content"  readonly="{{sign}}"   v-on:keyup="changeCheck" v-model="num">' +
            '<a class="on-span add" v-on:mousedown="mouseDown(\'add\')" v-on:mouseup="mouseUp()" v-on:mouseout="mouseOut()"></a></span>',
        props: [
            'num',
            'maxnum',
            'minnum',
            'sign'
        ],
        data: function() {
            return {
                min: 1,
                max: 255,
                addDown: 0,
                subDown: 0
            };
        },
        ready: function() {
            if($.isNumeric(this.maxnum)) this.max = this.maxnum;
            if($.isNumeric(this.minnum)) this.min = this.minnum;
        },
        methods: {
            mouseDown: function(tag) {
                var _this = this;
                if(tag == 'add') {
                    this.addDown = (new Date()).getTime();
                    setTimeout(function() {
                        var loopadd = function() {
                            if(_this.addDown == 0) return;
                            _this.add();
                            setTimeout(loopadd, 100);
                        };
                        loopadd();
                    }, 200);
                } else {
                    this.subDown = (new Date()).getTime();
                    setTimeout(function() {
                        var loopsub = function() {
                            if(_this.subDown == 0) return;
                            _this.sub();
                            setTimeout(loopsub, 100);
                        };
                        loopsub();
                    }, 200);

                }
            },
            mouseUp: function() {
                if((new Date()).getTime() - this.addDown < 200) {
                    this.add();
                }
                this.addDown = 0;
                if((new Date()).getTime() - this.subDown < 200) {
                    this.sub();
                }
                this.subDown = 0;
            },
            mouseOut: function() {
                this.addDown = 0;
                this.subDown = 0;
            },
            add: function() {
                if($.isFunction(this.addCheck) && this.addCheck(this.num + 1)) return;
                if(!this.sign) {
                    var num = this.num;
                    num++;
                    if(num > this.max) {
                        num = this.max;
                    }
                    this.num = num;
                } else {
                    this.num = this.max;
                }
            },
            sub: function() {
                if($.isFunction(this.subCheck) && this.subCheck(this.num - 1)) return;
                if(!this.sign) {
                    var num = this.num;
                    num--;
                    if(num < this.min) {
                        num = this.min;
                    }
                    this.num = num;
                } else {
                    this.num = this.min;
                }
            },
            changeCheck: function() {
                var num = parseFloat(this.num);
                if($.isFunction(this.inputCheck) && this.inputCheck(num)) return;
                if(isNaN(num) || num < this.min) {
                    num = this.min;
                }
                if(num > this.max) {
                    num = this.max;
                }
                this.num = num;
            }
        }

    });

    // 翻页组件
    Vue.component('sd-page', {
        // '<div class="boot-nav list" style="position: relative;right:0;">' +
        template: '<ul class="tab-list">' +
            '<li v-if="total > showpages">' +
            '<a href="javascript:void(0)" @click="firstPage">' +
            '<span>&laquo;</span>' +
            '</a>' +
            '</li>' +
            '<li v-if="total > showpages">' +
            '<a href="javascript:void(0)" @click="prePage(false)">' +
            '<span>‹</span>' +
            '</a>' +
            '</li>' +
            '<li v-for="i in showpages" v-if="i+offset < total" :class="page == i+offset ? \'active\' : \'\'">' +
            '<a  href="javascript:void(0)" v-text="i+offset+1" @click="handlePage(i,offset)"></a>' +
            '</li>' +
            '<li v-if="total > showpages">' +
            '<a href="javascript:void(0)"  @click="nextPage(false)">' +
            '<span>›</span>' +
            '</a>' +
            '</li>' +
            '<li v-if="total > showpages">' +
            '<a href="javascript:void(0)" @click="endPage" style="border-right:none">' +
            '<span>&raquo;</span>' +
            '</a>' +
            '</li>' +
            '</ul>',
        // '</div>',
        props: {
            'page': Number, // 当前第几页
            'count': Number, // 记录的总数量 
            'total': Number, // 总页数
            'num': Number, // 每页数量 
            'len': Number // 展示几条
        },
        data: function() {
            return {
                showpages: 10, // 默认显示10页
                offset: 0 // 当前页面偏移量
            };
        },
        methods: {
            firstPage: function() {
                this.offset = 0;
                this.page = 0;
            },
            endPage: function() {
                this.offset = this.total - this.showpages;
                if(this.offset < 0) {
                    this.offset = 0;
                }
                this.page = this.total - 1;
            },
            prePage: function(b) {
                var offset = this.offset;
                var newoffset = this.offset;
                newoffset -= Math.ceil(this.showpages / 2);
                if(newoffset < 0) {
                    newoffset = 0;
                }
                this.offset = newoffset;
                if(!b) this.page += newoffset - offset;
            },
            nextPage: function(b) {
                var offset = this.offset;
                var newoffset = this.offset;
                newoffset += Math.ceil(this.showpages / 2);
                if(newoffset > this.total - this.showpages) {
                    newoffset = this.total - this.showpages;
                    if(newoffset < 0) newoffset = 0;
                }
                this.offset = newoffset;
                if(!b) this.page += newoffset - offset;
            },
            handlePage: function(i, offset) {
                var cpage = i + offset;
                var offset = cpage - this.page;
                if(cpage <= this.offset) {
                    this.prePage(true);
                } else if(cpage >= this.offset + this.showpages - 1) {
                    this.nextPage(true);
                }
                this.page = cpage;
            }
        },
        ready: function() {
            if(this.len) {
                this.showpages = this.len;
            }
        }
    });

    // tab按钮组组件
    Vue.component('sd-tab', {
        template: '<div>' +
            '<span  v-for="(i,item) in list" v-bind:class="{\'on\':index == i}" v-on:click="clickHandle(i)" >{{getValue(item)}}</span>' +
            '<div style="clear: both;font-size:0; line-height: 0;"></div>' +
            '</div>',
        props: {
            'list': Array,
            'index': Number,
            'name': String
        },
        data: function() {
            return {

            };
        },
        methods: {
            getValue: function(item) {
                if(this.name) {
                    return item[this.name];
                } else {
                    return item;
                }
            },
            clickHandle: function(i) {
                this.index = i;
            }
        }
    });

    /**
     * 多选按钮组组件
     * list {Array} 需要展示的按钮列表数据
     * selects {Array} 被选中的列表
     * name {String} 如果list数据是Object集合，则name则是Object的键名，该键值就是按钮的名称；如果list就是按钮名称集合，则name不要设置。
     * key {String} 如果list数据是Object集合，则key则是Object的键名，该键值就是需要记录的选中列表selects中的元素值；如果list就是按钮名称集合，则key不要设置，selects中的元素会是选中的索引值。
     */
    Vue.component('sd-multiselect', {
        template: '<div class="selectbtns">' +
            '<span v-for="(i,item) in list"  v-bind:class="{\'sign\':isSelected(i,item) }" v-on:click="clickHandle(i,item)">{{getValue(item)}}</span>' +
            '</div>',
        props: {
            'list': Array,
            'selects': Array,
            'name': String,
            'key': String
        },
        data: function() {
            return {
                //selects:[]
            };
        },
        methods: {
            getValue: function(item) {
                if(this.name) {
                    return item[this.name];
                } else {
                    return item;
                }
            },
            clickHandle: function(i, item) {
                if(this.selects) {
                    var id = i;
                    if(this.key) {
                        id = item[this.key];

                    }
                    var find = false;
                    for(var i = 0; i < this.selects.length; i++) {
                        if(this.selects[i] + '' == id + '') {
                            find = true;
                            break;
                        }
                    }
                    if(find) {
                        this.selects.$remove(id);
                    } else {
                        this.selects.push(id);
                    }
                }
            },
            isSelected: function(i, item) {
                if(this.selects) {
                    var id = i;
                    if(this.key) {
                        id = item[this.key];
                    }
                    for(var i = 0; i < this.selects.length; i++) {
                        if(this.selects[i] + '' == id + '') {
                            return true;
                        }
                    }
                }
                return false;
            }
        }
    });

    /**
     * 单选按钮组组件
     * list {Array} 需要展示的按钮列表数据
     * selects {Array} 被选中的索引
     * name {String} 如果list数据是Object集合，则name则是Object的键名，该键值就是按钮的名称；如果list就是按钮名称集合，则name不要设置。
     */
    Vue.component('sd-radio', {
        template: '<div class="selectbtns">' +
            '<span v-for="(i,item) in list"  v-bind:class="{\'sign\':isSelected(i) }" v-on:click="clickHandle(i)">{{getValue(item)}}</span>' +
            '</div>',
        props: {
            'list': Array,
            'index': Number,
            'name': String
        },
        methods: {
            getValue: function(item) {
                if(this.name) {
                    return item[this.name];
                } else {
                    return item;
                }
            },
            clickHandle: function(i) {
                this.index = i;
            },
            isSelected: function(i) {
                if(i == this.index) return true;
                return false;
            }
        }
    });

    //日历组件
    Vue.component('sd-calendar', {
        template: '<input type="text" id="{{id}}" class="input"  placeholder="选择日期时间" v-model="timestr" >',
        props: {
            'time': Number,
            'start':Number,
            'end':Number,
            'only': Boolean,
            'format': String,
            'uid': String
        },
        watch: {
            'time': 'timeChanged'
        },
        data: function() {
            return {
                timestr: '',
                calendar: null,
                id: '',
                inited:false
            };
        },
        methods: {
            dataHandle: function(date, target) {
                this.time = date.getTime();
                if(!this.only) {
                    this.timestr = date.format(this.format);
                } else {
                    this.timestr = date.format(this.format);
                }
            },
            timeChanged: function() {
                var initDate;
                if(this.time) {
                    initDate = new Date(this.time);
                } else {
                    initDate = new Date();
                    this.time = initDate.getTime();
                }
                this.dataHandle(initDate, $("#" + this.id));
            }
        },
        ready: function() {
            if(this.format === null || this.format === undefined) {
                if(!this.only) {
                    this.format = 'yyyy-MM-dd hh:mm:ss';
                } else {
                    this.format = 'yyyy-MM-dd';
                }
            }
            var initDate;
            if(this.time) {
                initDate = new Date(this.time);
            } else {
                initDate = new Date();
                this.time = initDate.getTime();
            }
            if(this.uid) {
                this.id = this.uid;
            } else {
                this.id = '_' + initDate.getTime() + parseInt(Math.random() * 100000000);
            }

            this.inited = true;
            this.timeChanged();
            var _this = this;
            sd.controller(['js/sd/ui/calendar.js'], function() {
                var Calendar = sd.getClass('ui.calendar');
                _this.calendar = new Calendar($("#" + _this.id), _this.dataHandle, !_this.only);
            });

        },
        destroyed: function() {
            if(this.calendar) this.calendar.destroy();
        }
    });
});