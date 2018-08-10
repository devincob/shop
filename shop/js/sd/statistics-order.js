/**
 * @file
 * 统计管理 -->订单统计
 *
 * @author daxu.wang
 */

sd.controller(['statistics-order.html', 'js/sd/ui/win.js'], function() {

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
    $('#userbox').html(sd.getHtml('statistics-order.html'));
    var orderVue = new Vue({
        el: '#statistics-order',
        data: {
            startTime: new Date().getTime(), //日期组件的开始时间
            endTime: new Date().getTime(), //日期组件的结束时间
            dayTime: {}, //日期
            orderNum: null, //订单号
            orderPageDay: 0, //订单的当前页 当前页的数据(一天)
            orderPageTotalDay: 10, //订单数据的总页数(一天)
            orderPageNumDay: 5, //(一天)
            orderNumber: null, //订单号
            showDay: false, //展示一天订单 与否
            showDayAllDetail: false, //展示一条订单的详细
            orderListInDays: [], //时间段内每天的订单列表
            hasOrderListInDays: false, //判断列表里面是否有数据 渲染页面使用 防止页面闪烁
            oneDayOrderList: [], //一天的订单列表
            orderBillDelite: {}, //订单挂账详情展示      
            orderBOrder: {}, //  ***   
            orderBDetail: {}, //  ***   
            orderBpayMethod: {}, // ***   
            totalOrderInfo: [], //总计数据
            printAll: true, //是否打印全部
            printOid: '', //打印的订单id
            returnGoodsShow: false, //详情页面显示退菜？ 
            totalDiscount: 0, //总计折扣
            tableName: '', //桌台名
            areaName: '', //区域名
            payList: [], //支付方式
            allPayList: [], //所有的支付方式
            isZeroPays: [], //支付方式和为0的列表
            payTotalNum: {}, //支付方式的和
            showWidth: 1550, //长度
            payLsZero:false,//所有的支付方式是否显示
            showWidthT: 2000 //长度
        },
        watch: {
            //'orderListInDays': 'getOrderListTotalInfo',
//          'orderPageDay': 'getOrderListInDayPage'
        },
        methods: {
            //获得所有的支付方式，用不到
            getAllPayList: function() {
                //从后台获取数据
                sd.request("Payment/getPaymentList", {}, false, function(json) {
                    // 编辑窗口Vue   
                    if(json.data && json.data) {
                        orderVue.allPayList = json.data;
                        //orderVue.showWidth = orderVue.allPayList.length * 150 + 1550;
                    } else {

                    }
                }, function(json) {

                }, "get");
            },
            //打印订单
            printOrder: function() { 
                //打印一个月以内的订单
                if(!this.showDay && !this.showDayAllDetail) {
                     if (orderVue.orderListInDays.length == 0) {
                    alert('操作提示', '没有订单可以打印', null, null, null, 888);
                    return false;
                }
                    var startT = this.startTime - 0;
                    var endT = this.endTime - 0;
                    if(endT - startT > 1000 * 60 * 60 * 24 * 30) {
                        endT = startT + 1000 * 60 * 60 * 24 * 30;
                    }
                    startT = new Date(startT).getZero();
                    endT = new Date(endT).getZero();
                    if(startT == endT) {
                        endT = startT + 1000 * 60 * 60 * 24 * 1;
                    }
                    startT = Number.parseInt(startT / 1000);
                    endT = Number.parseInt(endT / 1000);
                    sd.request("Statistics/printOrderSummary", {
                            startTime: startT,
                            endTime: endT
                        }, false, function(json) {
                            if(json.error) {
                                alert("提示信息", json.error.message);
                                return false;
                            } else {
                                alert('操作提示', '打印数据已发送！', null, null, null, 888);

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
                //打印一天内所有的订单
                else if(this.showDay && !this.showDayAllDetail) {
                     if (orderVue.oneDayOrderList.length == 0) {
                        alert('操作提示', '没有订单可以打印', null, null, null, 888);
                        return false;
                    }
                    startT = orderVue.dayTime.startT;
                    endT = startT + 60 * 60 * 24 * 1;
                    //                    startT = new Date(startT).getZero();
                    //                  endT = new Date(endT).getZero();
                    sd.request("Statistics/printOrderSummary", {
                            startTime: startT,
                            endTime: endT
                        }, false, function(json) {
                            if(json.error) {
                                alert("提示信息", json.error.message);
                                return false;
                            } else {
                                alert('操作提示', '打印数据已发送！', null, null, null, 888);

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
                //打印一天内的某条订单
                else if(this.showDay && this.showDayAllDetail) {
                    if (orderVue.oneDayOrderList.length == 0) {
                        alert('操作提示', '没有订单可以打印', null, null, null, 888);
                        return false;
                    }
                    startT = orderVue.dayTime.startT;
                    endT = startT + 60 * 60 * 24 * 1;
                    //                    startT = new Date(startT).getZero();
                    //                  endT = new Date(endT).getZero();

                    sd.request("Statistics/printOrderDetail", {
                            oid: orderVue.orderNum
                        }, false, function(json) {

                            if(json.error) {
                                alert("提示信息", json.error.message);
                                return false;
                            } else {
                                alert('操作提示', '打印数据已发送！', null, null, null, 888);

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

            },
             //导出订单
            exportOrder: function(event) {
                //导出一个月的所有订单
                if(!this.showDay && !this.showDayAllDetail) {
                    if (orderVue.orderListInDays.length == 0) {
                    alert('操作提示', '没有订单可以导出', null, null, null, 888);
                    return false;
                }
                    var startT = this.startTime - 0;
                    var endT = this.endTime - 0;
                    if(endT - startT > 1000 * 60 * 60 * 24 * 30) {
                        endT = startT + 1000 * 60 * 60 * 24 * 30;
                    }
                    startT = new Date(startT).getZero();
                    endT = new Date(endT).getZero();
                    if(startT == endT) {
                        endT = startT + 1000 * 60 * 60 * 24 * 1;
                    }
                    startT = Number.parseInt(startT / 1000);
                    endT = Number.parseInt(endT / 1000);
                    var aurl = sd.host + '/Statistics/exportMoreDayOrder?format=json&token=' + sd.send.token + '&shopId=' + sd.send.shopId + '&startTime=' + startT + '&endTime=' + endT;
                    window.open(aurl,'download','',false);
                } else if(this.showDay && !this.showDayAllDetail) {
                    //导出一个月的某个订单
                      if (orderVue.oneDayOrderList.length == 0) {
                    alert('操作提示', '没有订单可以导出', null, null, null, 888);
                    return false;
                }
                   var Time = orderVue.dayTime.startT;
                   Time*=1000;
                   Time = new Date(Time).getZero();
                   Time = Number.parseInt(Time / 1000);
                    var aurl = sd.host + '/Statistics/exportOneDayOrder?format=json&token=' + sd.send.token + '&shopId=' + sd.send.shopId + '&datetime=' + Time;
                    window.open(aurl,'download','',false); 
                    
                } else if(this.showDay && this.showDayAllDetail) {
                  
                }
                alert('操作提示', '导出数据已发送！', null, null, null, 888);
                
            },
            //获取时间段内 订单列表
            getOrderListInDays: function() { 
                var startT = this.startTime - 0;
                var endT = this.endTime - 0 + 3600 * 24*1000;
                if(endT - startT > 1000 * 60 * 60 * 24 * 30) {
                    endT = startT + 1000 * 60 * 60 * 24 * 30;
                }
                startT = new Date(startT).getZero();
                endT = new Date(endT).getZero();
                if(startT == endT) {
                    endT = startT + 1000 * 60 * 60 * 24 * 1;
                }
                startT = Number.parseInt(startT / 1000);
                endT = Number.parseInt(endT / 1000);
                var payNum = 0; //显示支付方式的数量
                //从后台获取数据
                sd.request("Statistics/orderMoreDayStatistics", {
                    startTime: startT,
                    endTime: endT
                }, false, function(json) {
                    if (json.error) {
                    	alert(json.code + '错误', json.error.message, null, null, null, 888);
                    }else{
                        // 编辑窗口Vue
                        var ArrZero = [];
                        var ArrAllPayList = [];
                        var ArrNoZero = [];
                        if(json && json.data && json.data.total && json.data.total.payment) {
                            var arr = json.data.total.payment;
//                          sd.log("-----");
//                          sd.log(arr);
//                          sd.log("-----");
                            //判断支付的金额是否为0
                            for(var i = 0; i < arr.length; i++) {
                                if(arr[i].num == 0) {
                                    ArrZero.push(arr[i].id);
                                    ArrAllPayList.push(arr[i]);
                                }else if(arr[i].num != 0){
                                    payNum ++;
                                    ArrNoZero.push(arr[i])
                                    orderVue.payLsZero = true;
                                }
                            };
                           
                            orderVue.isZeroPays = ArrZero;
                            orderVue.allPayList = ArrNoZero;
                            orderVue.showWidth = ArrNoZero.length * 150 + 1550;
                        }
    //                  setTimeout(function () {
    //                      if (orderVue.allPayList.length == 0) {
    ////                      	orderVue.showWidth = orderVue.isZeroPays.length * 150 + 2300;
    ////                       orderVue.showWidthT = orderVue.isZeroPays.length * 150 + 2599;
    //                      }else{
    //                          orderVue.showWidth = orderVue.isZeroPays.length * 150 + 1500;
    ////                          orderVue.showWidthT = orderVue.isZeroPays.length * 150 + 1599;
    //                      }
    //                  	 
    //                  },100)
                       
                        if(json.data && json.data.total) {
                            orderVue.payTotalNum = json.data.total;
                        } else {
                            //orderVue.payTotalNum = [];
                        }
                        if(json.data && json.data.list) {
                            var arr = sd.copy(json.data.list);
                            orderVue.orderListInDays = arr ? arr : [];
                            orderVue.hasOrderListInDays = true;
                        }
                        
                    }

                }, function(json) {}, "get");
                
            },
            //对支付金额为0的支付方式做处理
            isZero: function(id) {
                var arr = orderVue.isZeroPays;
                var obj = {};
                for(var i = 0; i < arr.length; i++) {
                    if(!obj[arr[i]]) {
                        obj[arr[i]] = "110";
                    }
                }
                if(obj[id]) {
                    return true;
                } else {
                    return false;
                }
       
            },
            changeAllPayList:function(){
                var pArr = orderVue.allPayList;
                var zArr = orderVue.isZeroPays;
                for(var i  = 0; i < zArr.length; i++){
                    for(var j = 0; j < pArr.length;j++){
                        if (pArr[j].paymentName == zArr.paymentName) {
                        	orderVue.allPayList.splice(j,1);
                        	
                        }
                    }
                }
            },
            //点击查看某天的数据
            getOrderListInDay: function(time) {
                this.orderPageDay = 0;
                var startT = time - 0;
                var endT = time - 0 + 60 * 60 * 24;
                //从后台获取数据
                this.dayTime.startT = startT;
                this.dayTime.endT = endT;
               
                sd.request("Statistics/orderOneDayStatistics", {
                    startTime: startT,
                    endTime: endT,
                    page: this.orderPageDay + 1,
                    num: 10 //一页显示多少
                }, false, function(json) {
//                  sd.log(json.data);
                    // 编辑窗口Vue   
                    orderVue.orderPageTotalDay = json.data.total;
                    if(json.data && json.data.list) {
                        var arr = sd.copy(json.data.list);
                        orderVue.oneDayOrderList = arr ? arr : [];
//                      sd.log(orderVue.oneDayOrderList);
                        orderVue.showDay = true;
                    } else {
                        alert("提示信息", "订单列表请求失败");
                    }
                }, function(json) {
                    alert("提示信息", "订单列表请求失败");
                }, "get");
            },
            //翻页效果,展示当前页
             getOrderListInDayPage: function() {
                var startT = this.dayTime.startT;
                var endT = this.dayTime.endT;
                sd.request("Statistics/orderOneDayStatistics", {
                    startTime: startT,
                    endTime: endT,
                    page: this.orderPageDay + 1,
                    num: 10 //一页显示多少
                }, false, function(json) {
                    // 编辑窗口Vue   
                    orderVue.orderPageTotalDay = json.data.total;
                    if(json.data && json.data.list) {
                        var arr = sd.copy(json.data.list);
                        orderVue.oneDayOrderList = arr ? arr : [];
                        orderVue.showDay = true;
                    } else {
                        alert("提示信息", "订单列表请求失败");
                    }
                }, function(json) {
                    alert("提示信息", "订单列表请求失败");
                }, "get");
            },
            //点击查看某天某一个的数据详情
            getOrderDetailInfo: function(oid) {
                orderVue.orderNum = oid;
                orderVue.showDayAllDetail = true;
                //从后台获取数据
                sd.request("Order/billDelite", {
                    oid: oid
                }, false, function(json) {
                    // 编辑窗口Vue   
                    if(json.data) {
                        orderVue.orderBOrder = json.data.order;
                        orderVue.orderBDetail = json.data.orderDetail;
                        orderVue.orderBpayMethod = json.data.payMethod;
                        var orderInfo = json.data.order;
                        var numTT = (orderInfo.price - orderInfo.discount / 100 * orderInfo.price) + "";
                        numTT = numTT.toFloatStr(2);
                        orderVue.totalDiscount = numTT;
                        var id = orderVue.orderBOrder.tableId;
                        orderVue.getOneTable(id, function(info) {
                            orderVue.tableName = info.tableName;
                            var areaId = info.areaId;
                            orderVue.getAreaInfo(areaId, function(info) {
                                orderVue.areaName = info;
                            });
                        });
                    } else {
                        alert(json.data.code + "错误", json.data.message);
                    }
                }, function(json) {
                    alert(json.data.code + "错误", json.data.message);
                }, "post");
            },
            //选择时间查询订单
            sreachOrderInDays: function() { 
                var startT = this.startTime;
                var endT = this.endTime - 0 + 3600 * 24;
                var aam = new Date(startT).getMonth(new Date(startT));
                var bbm = new Date(endT).getMonth(new Date(endT));
                if(aam != bbm) {
                    alert("只能查询一月内的订单");
                    return false;
                }
                startT = Number.parseInt(startT / 1000);
                endT = Number.parseInt(endT / 1000);
                if(startT - endT > 0) {
                    alert("结束的时间不能小于开始时间");
                    return false;
                }
                this.getOrderListInDays();
                this.isZero();
            },
            //点击返回按钮
            returnPage: function() {
                if(orderVue.showDay && !orderVue.showDayAllDetail) {
                    orderVue.showDay = false;
                    return;
                }
                if(orderVue.showDayAllDetail) {
                    orderVue.showDayAllDetail = false;
                    orderVue.showDay = true;
                    return;
                }
            },
            //通过订单查询
            getInfoByOrder: function() {
                var onum = sd.copy(orderVue.orderNumber);
                var regNum = /[0-9]+/;
                if(onum == null || onum == undefined || onum == "") {
                    alert("操作提示", "请输入订单号码");
                    return;
                }
                if(!regNum.test(onum)) {
                    alert("操作提示", "请输入正确的订单号");
                    return;
                }
                sd.request("Order/searchOrder", {
                        oid: onum
                    }, false, function(json) {

                        if(!json.data) {
                            alert("提示信息", "该订单不存在");
                            orderVue.orderNumber = null;
                            return false;
                        } else {
                            orderVue.showDay = true;
                            orderVue.orderNumber = null;
                            orderVue.oneDayOrderList = [];
                            orderVue.oneDayOrderList.push(json.data);
                        }
                    },
                    function(json) {
                        if(json.error) {
                            alert("提示信息", json.error.message)
                            return false;
                        } else {

                        }
                    }, "get");
            },
            //商品详情和退菜详情切换
            changeReturnShow: function(bool) {
                this.returnGoodsShow = bool;
            },
            //单据状态
            getStatusByNum: function(num) {
                num += '';
                if(num == '4') {
                    return "已结账";
                } else if(num == '5') {
                    return "废单";

                } else {
                    return "挂账";
                }
            },
            printOneOrder: function(oid) {
                sd.request("Order/orderPrint", {
                        oid: oid
                    }, false, function(json) {
                        if(json.data.res) {
                            alert('操作提示', '打印数据已发送！', null, null, null, 888);
                        }
                        if(json.error) {
                            alert("提示信息", json.error.message);
                            return false;
                        } else {

                        }
                    },
                    function(json) {
                        if(json.error) {
                            alert("提示信息", json.error.message)
                            return false;
                        } else {

                        }
                    }, "get");
            },
            //
            printOrderDay: function() {
                sd.log(this.printAll);
                if(this.printAll) {
                    //this.startTime,
                    // this.endTime
                } else {
                    //this.printOid
                    this.printOneOrder(this.printOid);
                }
            },
            //把时间戳转化成***年**月**日
            newTransformTime: function(time){
                return new Date(Number(time) * 1000).format('yyyy-MM-dd');
            },
             //把时间戳转化成***年**月**日**时**分**秒
            transformTime: function(time) {
                return new Date(Number(time) * 1000).format('yyyy-MM-dd hh:mm:ss');
            },
            //获取桌台信息
            getOneTable: function(id, callback) {
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
            },
            //获取区域信息
            getAreaInfo: function(id, callback) {
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
        },
        ready: function() {
            this.getOrderListInDays(); //获取当前时间段内的所有数据
            this.getAllPayList(); //获取所有的支付方式
        }
    })
})