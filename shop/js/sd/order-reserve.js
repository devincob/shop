/**
 * @file
 * 订单管理 -->预定管理
 *
 * @author daxu.wang
 */
sd.controller(['order-reserve.html', 'js/sd/ui/win.js'], function() {
    //读取user数据
    var userData = sd.session("userShop");
    if(userData && userData.accessToken && userData.currentShop) {
        sd.send.token = userData.accessToken;
        sd.send.shopId = userData.currentShop.id;
    } else {
        sd.controller(['js/sd/login.js']);
        return;
    }
    $('#userbox').html('');
    // 加载admin模块html到页面
    $('#userbox').html(sd.getHtml('order-reserve.html'));
    var newWindow = sd.getClass('ui.win');

    var reserveWinHtml = $('#order-edit').get(0).outerHTML;
    $('#order-edit').remove();
    var reserveTwoWinHtml = $('#order-select-table').get(0).outerHTML;
    $('#order-select-table').remove();
    var getOneTable = function(id, callback) { //得到桌台的详细信息
        sd.request("Table/getOneTable", {
                id: id
            }, false, function(json) {
                if(json.error) {
                    alert("提示信息", json.error.message);
                    return false;
                } else {
                    callback(json.data);
                    return;
                }
            },
            function(json) {
                if(json.error) {
                    alert("提示信息", json.error.message)
                    return false;
                } else {

                }
            }, "get");
    };
    var getAreaInfo = function(id, callback) { //获取区域信息
        sd.request("Area/getOneArea", {
                id: id
            }, false, function(json) {
                if(json.error) {
                    alert("提示信息", json.error.message);
                    return false;
                } else {
                    callback(json.data.areaName);
                    return;
                }
            },
            function(json) {
                if(json.error) {
                    alert("提示信息", json.error.message)
                    return false;
                } else {

                }
            }, "get");
    }

    var reserveVue = new Vue({ //预约页面Vue
        el: "#order-reserve",
        data: {
            startTime: new Date().getTime(), //日期组件的开始时间
            endTime: new Date().getTime() + 1000 * 60 * 60 * 24 * 1 - 1000, //日期组件的结束时间
            orderPage: 0, //订单的当前页 当前页的数据
            orderPageTTotal: 10, //订单数据的总页数
            orderPageNum: 5, //一版页码处理多少数据
            openReserve: false, //控制页面的显示
            reserveList: [],
            reserveListInited: false,
            searchOrderMobile: "", //手机号

        },
        methods: {
            getTableName: function(id) {
 
            },
            getReserveList: function() { //获取预定列表
                var startT = this.startTime - 0;
                var endT = this.endTime - 0;
                sd.log(startT)
                sd.log(endT)
               
                startT = new Date(startT).getZero();
                endT = new Date(endT).getZero();
                if(startT - endT > 0) {
                    alert("提示信息", "结束的时间不能小于开始时间");
                    return false;
                }
                if (startT == endT) {
                    endT = startT+1000 * 60 * 60 * 24 * 1;
                }
                startT = Number.parseInt(startT / 1000);
                endT = Number.parseInt(endT / 1000) - 1;
                //从后台获取数据
                sd.request("Reservation/getlist", {
                    startTime: startT,
                    endTime: endT,
                    page: this.orderPage + 1,
                    num: 5 //一页显示多少
                }, false, function(json) {
                    // 编辑窗口Vue   
//                  sd.log(json)
                    var arr = sd.copy(json.data.list);
                    reserveVue.orderPageTTotal = json.data.total;
                    reserveVue.reserveList = [];
                    reserveVue.reserveList = arr ? arr : [];
                    reserveVue.reserveListInited = true;
                }, function(json) {
                }, "get");
            },
            getByMobile: function() { //通过手机号码 查询预约
                var mobile = sd.copy(reserveVue.searchOrderMobile);
                var regMobile = /^1[\d]{10,10}$/;
                if(mobile == null || mobile == undefined || mobile == "") {
                    alert("操作提示", "请输入手机号码")
                    return;
                }
                if(!regMobile.test(mobile)) {
                    alert("操作提示", "请输入正确的手机号码 ");
                    return;
                }
                sd.request("Reservation/getByMobile", {
                    mobile: mobile,
                }, false, function(json) {
                    // 编辑窗口Vue   
                    var arr = sd.copy(json.data.list);
                    reserveVue.reserveList = arr ? arr : [];
                }, function(json) {

                }, "get");
            },
            tranformTime: function(time) { //转化时间戳格式
                return new Date(Number(time) * 1000).format('yyyy.MM.dd/hh:mm');

            },
            reserveStatu: function(sta) { //订单的状态
                //             1拒绝预约,2客户已到,3预约成功,4预约中
                if(sta + '' === '1') {
                    return '拒绝预约';
                } else if(sta + '' === '2') {
                    return '客户已到';
                } else if(sta + '' === '3') {
                    return '预约成功';
                } else {
                    return '预约中';

                }
            },
            delectReserve: function(id, index) { //删除预约
                confirm("操作提示", '确定要删除吗？', function() {
                    sd.request("Reservation/del", {
                        id: id
                    }, false, function(json) {
                        // 编辑窗口Vue   
                        if(json.error) {
                            alert("提示信息", json.error.message)
                        }
                        reserveVue.reserveList.splice(index, 1);
                    }, function(json) {
                        alert("提示信息", json.error.message);
                    }, "post");
                });

            },

            editReserve: function(item, index) { //修改预约
                item = sd.copy(item);

                if(parseInt('0' + item.tableId) > 0) {
                    getOneTable(item.tableId, function(json) {
                        var tab = json.tableName;
                        getAreaInfo(json.areaId, function(name) {
                            openDetailReserve(item, index, name + "_" + tab);
                        })
                    })
                } else {
                    openDetailReserve(item, index, '');
                }

            },

        },
        ready: function() {
            this.getReserveList();
        }
    });

    var openDetailReserve = function(item, index, name) {

        var detailWind = new newWindow(550, 'auto', "修改预定", reserveWinHtml, function(win) {
            var info = sd.copy(reserveEditVue.oneReserveInfo);

            //验证
            //                  手机号
            var regMobile = /^1[\d]{10,10}$/;
            if(info.mobile == '' || info.mobile == undefined || info.mobile == null) {
                alert("提示信息", "手机号码不能为空");
                return false;
            }
            if(!regMobile.test(info.mobile)) {
                alert("提示信息", "您输入正确的手机号码");
                return false;
            }
            //姓名

            var regName = /[\'\"\&]/ ;// /[A-Za-z0-9_\-\u4e00-\u9fa5]+/;
            if(info.name == '' || info.name == undefined || info.name == null) {
                alert("提示信息", "名字不能为空");
                return false;
            }
            if(!regName.test(info.name)) {
//              alert("提示信息", "您需要输入正确的名字");
                alert('提示信息', '名字中不能包含英文的单引号和双引号');
                return false;
            }

            //席位
            var regNum = /[0-9]+/;
            if(info.num == "" || info.num == undefined || info.num == null) {
                alert("提示信息", "席位数不能为空");
                return false;
            }
            if(!regNum.test(info.num)) {
                alert("提示信息", "席位数只能是数字");
                return false;
            }
            //桌台

            reserveEditVue.saveReserveEdit();

            return true;
        }, function(win) {
            return true;
        }, {
            class: 'yellow',
            name: '修改'
        }, {
            class: 'gray',
            name: '取消'
        });
        detailWind.open('right');

        var reserveEditVue = new Vue({
            el: "#order-edit",
            data: {
                oneReserveInfo: {},
                startTime: new Date().getTime(), //日期组件的开始时间
                tableAndAreaName: '', //区域名

            },
            methods: {
                changeTime: function() {

                },
                saveReserveEdit: function() {
                    var info = sd.copy(reserveEditVue.oneReserveInfo);
                    sd.request("Reservation/edit", {
                        id: info.id,
                        name: info.name,
                        mobile: info.mobile,
                        num: info.num,
                        time: Number.parseInt(this.startTime / 1000),
                        tableId: info.tableId,
                        remark: info.remark
                    }, false, function(json) {
                        // 编辑窗口Vue 

                        if(json.error) {
                            alert("提示信息", json.error.message)
                        } else {
                            reserveEditVue.oneReserveInfo = json.data;
                            reserveVue.reserveList.splice(index, 1, json.data);

                        }
                    }, function(json) {
                        alert("提示信息", json.error.message);
                    }, "post");
                },
                openChangeTable: function() {
                    openTableWindow(item.tableId);
                },
            },
            ready: function() {
                this.oneReserveInfo = item;
                this.tableAndAreaName = name;
                var infoV = sd.copy(this.oneReserveInfo);
                this.startTime = item.time * 1000;
            }
        });
        var openTableWindow = function(tableId) {
            var tableWind = new newWindow(700, 'auto', "选择桌台", reserveTwoWinHtml, function(win) {
                if(reserveTwoWin.selectedTableId < 0) {
                    reserveEditVue.tableAndAreaName = '';
                    reserveEditVue.oneReserveInfo.tableId = '';
                    return;
                }
                getOneTable(reserveTwoWin.selectedTableId, function(json) {
                    var tab = json.tableName;

                    getAreaInfo(json.areaId, function(name) {

                        reserveEditVue.tableAndAreaName = (name + "_" + tab);
                        reserveEditVue.oneReserveInfo.tableId = reserveTwoWin.selectedTableId;

                    });
                })
                return true;
            }, function(win) {
                return true;
            }, {
                class: 'yellow',
                name: '修改'
            }, {
                class: 'gray',
                name: '取消'
            });
            tableWind.open('center');
            var reserveTwoWin = new Vue({
                el: "#order-select-table",
                data: {
                    areaList: [],
                    tableList: [],
                    List1ID: '',
                    selectedTableId: -1,
                    indexA: 0,
                    indexT: 0,
                },
                methods: {
                    changeL1ID: function(id, i) {
                        this.List1ID = id;
                        this.indexA = i;

                    },
                    getAreaList: function() {
                        sd.request("Area/getArea", {}, false, function(json) {

                            reserveTwoWin.areaList = json.data;
                            reserveTwoWin.areaList.unshift({
                                areaName: "全部",
                                id: ''
                            });
                        }, function(json) {
                            alert("请求失败")
                        }, "get", false);
                    },
                    getAllTable: function() {
                        sd.request("Table/getTable", {}, false, function(json) {
                            reserveTwoWin.tableList = json.data;

                        }, function(json) {
                            alert("请求失败")
                        }, "get", false);
                    },
                    selectedTable: function(id, i) {
                        if(this.selectedTableId == id) {
                            this.selectedTableId = -1;
                        } else {
                            this.selectedTableId = id;
                            this.indexT = i;

                        }

                    }

                },
                ready: function() {
                    this.getAreaList();
                    this.getAllTable();
                    this.selectedTableId = tableId;

                }

            })

        }
    }
})