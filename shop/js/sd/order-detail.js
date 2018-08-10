/**
 * @file
 * 订单管理 -->订单概况
 *
 * @author daxu.wang
 */
sd.controller(['order-details.html', 'js/sd/ui/win.js'], function() {
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
    $('#userbox').html(sd.getHtml('order-details.html'));

    var detailVue = new Vue({
        el: "#order-detail",
        data: {
            startTime: new Date().getTime() - 1000 * 60 * 60 * 24, //日期组件的开始时间
            endTime: new Date().getTime(), //日期组件的结束时间
            orderPage: 0, //订单的当前页 当前页的数据
            orderPageTTotal: 10, //订单数据的总页数
            orderPageNum: 5, //一版页码处理多少数据
            openDetail: false, //控制页面的显示
            orderList: [], //訂單列表
            orderName: [], //订单上名字
            orderDetailList: [], //订单详情列表
            selectOrder: 0, //查看订单详情的订单id
            orderDetail: [], //记录获取信息
            orderNumber:"",//搜索框中的订单号
        },
        watch:{
            'orderPage':'getOrderList'
        },
        methods: {
            getOrderList: function() {
                var startT = this.startTime - 0;
                var endT = this.endTime - 0;
                startT = Number.parseInt(startT / 1000);
                endT = Number.parseInt(endT / 1000);
                //从后台获取数据
                sd.request("Order/getOrderList", {
                    startTime: startT,
                    endTime: endT,
                    page: this.orderPage + 1,
                    num: 5 //一页显示多少
                }, false, function(json) {
                    // 编辑窗口Vue   
                    if (json.data && json.data.list) {
                      var arr = sd.copy(json.data.list);
                      detailVue.orderPageTTotal = json.data.total;
                      detailVue.orderList = arr ? arr : [];
                    }else{
                        alert("提示信息","订单列表请求失败")
                    }
                    
                }, function(json) {

                }, "get");
            },
            getOrderDetail: function(oid, callback) {
                //详情页的数组在这里赋值
                sd.request("Order/getHistoryOrderDetail", {
                        oid: oid
                    }, false, function(json) {
                        if(json.error) {
                            alert("提示信息", json.error.message);
                            return false;
                        } else {
                            callback(json.data.orderDetail.goods);
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
            //打开详情页面
            openOrderDetail: function(oid) {
                this.selectOrder = oid;
                this.getOrderDetail(oid,function(info) {
                    detailVue.openDetail = true;
                    detailVue.orderDetailList = info ? info : [];
                });
                
            },
            tranformTime: function(time) {
                return new Date(Number(time) * 1000).format('yyyy.MM.dd/hh:mm');

            },
            sreachOrder: function() {
                this.getOrderList();
            },
            getInfoByOrder: function() {
                var onum = sd.copy(detailVue.orderNumber);
                var regNum = /[0-9]+/;
                if (onum == null || onum == undefined || onum == "") {
                	alert("操作提示","订单号为空就想查询？")
                    
                	return;
                }
                if (!regNum.test(onum)) {
                	alert("操作提示","请输入正确的订单号")
                	return;
                }
                  sd.request("Order/searchOrder", {
                        oid: onum
                    }, false, function(json) {
                        if(!json.data) {
                            alert("提示信息", '该订单不存在');
                            detailVue.orderNumber = null;
                            return false;
                        } else {
                            detailVue.orderList = [];
                            detailVue.orderList.push(json.data);
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
            getOrderNum: function(i) {
                i += 1;
                if(i < 10) {
                    return "0" + i;
                } else {
                    return i;
                }
            },
            printOrderDetailInfo: function(oid) {
                var finalOid ;
                if(oid) finalOid = oid;
                else finalOid = this.selectOrder;
                sd.log(finalOid)
                sd.request("Order/orderPrint", {
                        oid: finalOid
                    }, false, function(json) {
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
            }
        },
        ready: function() {
            this.getOrderList();
        }
    });

})