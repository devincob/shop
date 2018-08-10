/**
 * @file
 * 客户配置-支付方式
 *
 * @author qiaorui.kongweiyan
 */
sd.controller([
        'payment-way.html',
        'js/sd/ui/win.js'
    ],
    function() {
        // 获取登录信息
        var userData = sd.session("userShop");
        if(userData && userData.accessToken && userData.currentShop) {
            sd.send.token = userData.accessToken;
            sd.send.shopId = userData.currentShop.id;
        } else {
            sd.controller(['js/sd/login.js']);
            return;
        }
        $('#userbox').html(sd.getHtml('payment-way.html'));
        //清空search区域内容
        $('#search').html('');
        //增加编辑的弹框
        var editWin = sd.getClass("ui.win");
        var editreasonShow = $('#editInfomation');
        // 获取可视区域宽度// 获取可视区域高度
        var editdomcache = $('<div></div>');
        editdomcache.append(editreasonShow);
        var paymentWay = new Vue({
            el: '#paymentWay',
            data: {
                payNameList: [],//列表
                num: 1,//排序
                payNameId:"",//支付方式id
                payName:'',//支付名称
                isBill: 1,//传isBill值，默认为1 入账
                isOperation : true // 是否可以对这条记录操作 true 1 是
            },
            methods: {
                //初始化获取支付列表
                inte:function(){
                    sd.request('Payment/getPaymentList', {
                            shopId: userData.currentShop.id
                        }, false,
                        function(json) {
                            if(json.error) {
                                alert(json.error.code + '错误', json.error.message);
                            } else {
                                paymentWay.payNameList = json.data;
                            }
                        }, function(json) {
                            alert('错误提示', '请求失败');
                    }, 'get');
                },
                //增加支付方式
                addpay: function(){
                    if(paymentWay.payNameList.length>0){
                        openWin(true);
                    }else{
                        alert("网络异常");
                    }
                },
                //修改编辑支付方式
                modifyBtn: function(index, bill){
                    openWin(false,index,bill);
                },
                //删除支付方式
                deleteBtn: function(index,bill){
                    confirm("提示信息","确认要删除吗？",function(){
                    sd.request('Payment/deletePayment', {
                        paymentId:bill.id,
                        shopId: userData.currentShop.id
                    }, false, function(json) {
                    if(json.error) {
                        alert(json.error.code + '错误', json.error.message);
                    } else {
                        paymentWay.payNameList.splice(index,1);
                        sortPayNameList();
                    }
                    }, function(json) {
                        alert('错误提示', '请求失败');
                    }, 'get');
                    });
                }
            },
            ready:function(){
                this.inte();
            }

        });
        //增加支付方式弹框
        var openWin = function(isadd,index,bill){
            var title = isadd ? "新建支付方式" : "修改支付方式";
            var myWin = new editWin(
                500,300,
                "新建支付方式",
                editreasonShow.clone().get(0),
                function(win){
                    if(isadd){
                        if(panTan.payName == ''||panTan.payName == undefined){
                            alert("支付方式不能为空，请正确添加");
                            return false;
                        } else{
                            sd.request('Payment/addPayment', {
                                    shopId: userData.currentShop.id,
                                    createUid:userData.user.id,
                                    paymentName:panTan.payName,
                                    isBill: panTan.isBill ? '1':'0',
                                    sort: panTan.num
                                }, false, 
                                function(json) {
                                    if(json.error) {
                                        alert(json.error.code + '错误', json.error.message);
                                    } else {
                                        paymentWay.payNameList.push(json.data);
                                        sortPayNameList();
                                         panTan.$destroy();
                                         win.close();
                                    }
                                }, function(json) {
                                    alert('错误提示', '请求失败');
                                }, 'post');
                        }
                        panTan.$destroy();
                        return true;
                    } else{
                        if (panTan.payName == '') {
                            alert("拒绝原因不能为空，请正确添加");
                            return false;
                        }
                        sd.request('Payment/editPayment', {
                                paymentId:bill.id,
                                shopId: userData.currentShop.id,
                                createUid:userData.user.id,
                                paymentName:panTan.payName,
                                isBill: panTan.isBill ? '1':'0',
                                sort: panTan.num
                            },false,function (json) {
                            if (json.error) {
                                alert(json.error.code + '错误', json.error.message);
                            } else {
                                paymentWay.payNameList.splice(index,1, json.data);
                                sortPayNameList();
                            }
                            }, function (json) {
                                alert('错误提示', '请求失败');
                            }, 'post');
                        panTan.$destroy();
                        return true;
                    }
                },
                function(){
        
                },{
                    name:'保存'
                },{
                    name:'取消'
                }
            );
            myWin.open('center');
            var panTan = new Vue({
                el: '#' + myWin.onlyID,
                data:{
                    num: 1,//排序
                    payName:'',//支付名称
                    isBill: true,//传isBill值，默认为1 入账
                    isOperation : true // 是否可以对这条记录操作 true 1 是
                }
            });
            //查询支付详情
            if(!isadd){
                sd.request('Payment/getPaymentById', {
                    paymentId: bill.id
                }, false, function(json) {
                    if(json.error) {
                        alert(json.error.code + '错误', json.error.message);
                    } else {
                        sd.log(json.data);
                        panTan.payName = json.data.paymentName;
                        panTan.num = json.data.sort;
                        panTan.isBill = json.data.isBill =='1' ? true : false;
                    }
                }, function(json) {
                    alert('错误提示', '请求失败');
                }, 'get');
            }
        };
    //编辑支付方式弹框
//      var editInfoWin = function (index,bill) {
//          var editrefundWin = new editWin(500, 300, "支付方式名称",
//              editreasonShow.clone().get(0), function () {
//          if (refundBombBox.payName == '') {
//              alert("拒绝原因不能为空，请正确添加");
//              return false;
//          }
//          sd.request('Payment/editPayment', {
//                  paymentId:bill.id,
//                  shopId: userData.currentShop.id,
//                  createUid:userData.user.id,
//                  paymentName:refundBombBox.payName,
//                  isBill: refundBombBox.isBill ? '1':'0',
//                  sort: refundBombBox.num
//              },false,function (json) {
//              if (json.error) {
//                  alert(json.error.code + '错误', json.error.message);
//              } else {
//                  paymentWay.payNameList.splice(index,1, json.data);
//                  sortPayNameList();
//              }
//              }, function (json) {
//                  alert('错误提示', '请求失败');
//              }, 'post');
//          refundBombBox.$destroy();
//          return true;
//          //window.reload();
//              },
//              function () {
//
//              }, {
//                  name: '修改'
//              }, {
//                  class: 'gray fl',
//                  name: '取消'
//              }
//          );
//          editrefundWin.open('center');
//          var refundBombBox = new Vue({
//              el: '#' + editrefundWin.onlyID,
//              data: {
//                  num: bill.sort,//排序
//                  payName: bill.paymentName,//支付名称
//                  isBill: bill.isBill+''== '1',//传isBill值，默认为1 入账1是不入账
//                  isOperation: true // 是否可以对这条记录操作 true 1 是
//              }
//          });
//      };
        //数据列表重新排序
    var sortPayNameList = function() {
        var arr = sd.copy(paymentWay.payNameList);
        var sortPayName = function(a, b) {
        var value1 = parseInt(a['sort']);
        var value2 = parseInt(b['sort']);
        if(value1 < value2) {
                    return -1;
        } else if(value1 > value2) {
                    return 1;
        } else {
        var id1 = parseInt(a['id']);
        var id2 = parseInt(b['id']);
            if(id1 < id2) {
                return -1;
            } else if(id1 > id2) {
                return 1;
            }
        }
            return 0;
        };
        paymentWay.payNameList = arr.sort(sortPayName);
        };

    });