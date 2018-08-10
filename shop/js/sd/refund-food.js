/**
 * @file
 * 客户配置-退菜原因
 *
 * @author qiaorui
 */
sd.controller([
        'js/sd/ui/win.js',
        'refund-food.html'
    ],
    function () {
        // 获取登录信息
        var userData = sd.session("userShop");
        if (userData && userData.accessToken && userData.currentShop) {
            sd.send.token = userData.accessToken;
            sd.send.shopId = userData.currentShop.id;
        } else {
            sd.controller(['js/sd/login.js']);
            return;
        }

        $('#userbox').html('');
        // 加载admin模块html到页面
        $('#userbox').html(sd.getHtml('refund-food.html'));
        //清空search区域内容
        $('#search').html('');
        //定义添加退菜原因弹框
        //var Win = sd.getClass("ui.win");
        //var reasonShow = $('#refundFoodReasonshow');
        //// 获取可视区域宽度// 获取可视区域高度
        //var domcache = $('<div></div>');
        //
        //domcache.append(reasonShow);
        //定义添加编辑退菜原因弹框
        var editWin = sd.getClass("ui.win");
        var editreasonShow = $('#editInfomation');
        // 获取可视区域宽度// 获取可视区域高度
        var editdomcache = $('<div></div>');

        editdomcache.append(editreasonShow);
        var refundReasonVue = new Vue({
            el: '#refundFood',
            data: {
                refundFood: [],//退菜理由列表
                modify: true,//点击修改按钮
                refundReasonId: "",
            },
            methods: {
                //初始化获得退菜列表
                inte: function(){
                    sd.request('Reason/getReasonList', {
                        shopId: userData.currentShop.id
                    }, false, function (json) {
                        if (json.error) {
                            alert(json.error.code + '错误', json.error.message);
                        } else {
                            refundReasonVue.refundFood = json.data;
                        }
                    }, function (json) {
                        alert('错误提示', '请求失败');
                    }, 'get');
                },
                //增加
                addReason: function () {
                    refundOpenWin(true);
                },
                //编辑
                editInfo: function (index, print) {
                    refundReasonVue.refundReasonId = print.id;
                    refundOpenWin(false, index, print);
                },
                //删除
                deleteRefundBtn: function(index,print){
                   confirm("提示信息","确认要删除吗？",function(){
                       sd.request('Reason/deleteReason', {
                               rid: print.id, //退菜原因id
                               shopId: userData.currentShop.id
                           },
                           false,
                           function (json) {
                               if (json.error) {
                                   alert(json.error.code + '错误', json.error.message);
                               } else {
                                   refundReasonVue.refundFood.splice(index,1);
                                   sortreFundFood();
                               }
                           }, function (json) {
                               alert('错误提示', '请求失败');
                           }, 'get');
                   });
                }
            },
            ready: function () {
                this.inte();
            }
        });
        //增加退菜原因弹框
        var refundOpenWin = function (isadd,index, print) {
            var title = isadd ? "新建退菜原因" : "修改退菜原因";
            var refundWin = new editWin(
                500,
                300,
                title,
                editreasonShow.clone().get(0),
                function () {
                    if(isadd){
                        //增加退菜原因
                        if (refundBombBox.refundName == '') {
                            alert("拒绝原因不能为空，请正确添加");
                            return false;
                        };
                        sd.request('Reason/addReason', {
                                shopId: userData.currentShop.id,
                                createUid: userData.user.id,
                                reasonName: refundBombBox.refundName,
                                sort: refundBombBox.num
                            },
                            false,
                            function (json) {
                                if (json.error) {
                                    alert(json.error.code + '错误', json.error.message);
                                } else {
                                    //sd.log(json.data);
                                    refundReasonVue.refundFood.push(json.data);
                                    sortreFundFood();
                                }
                            }, function (json) {
                                alert('错误提示', '请求失败');
                            }, 'post');
                        refundBombBox.$destroy();
                        return true;
                    } else{
                        if (refundBombBox.refundName == '') {
                            alert("拒绝原因不能为空，请正确添加");
                            return false;
                        };
                        sd.request('Reason/editReason', {
                                rid: refundReasonVue.refundReasonId, //退菜原因id
                                shopId: userData.currentShop.id,//店铺id
                                updateUid: userData.user.id,//修改者id
                                reasonName: refundBombBox.refundName,//退菜原因名称
                                sort: refundBombBox.num//排序
                            },
                            false,
                            function (json) {
                                if (json.error) {
                                    alert(json.error.code + '错误', json.error.message);
                                } else {
                                    refundReasonVue.refundFood.splice(index, 1, json.data);
                                    sortreFundFood();
                                }
                            }, function (json) {
                                alert('错误提示', '请求失败');
                            }, 'post');
                        refundBombBox.$destroy();
                        return true;
                        window.reload();
                    }
                },
                function () {

                }, {
                    name: '保存'
                }, {
                    name: '取消'
                }
            );
            refundWin.open('center');
            var refundBombBox = new Vue({
                el: '#' + refundWin.onlyID,
                data: {
                    num: 1,//排序
                    refundName: '',//退菜原因名称
                    isOperation: true // 是否可以对这条记录操作 true 1 是
                },
                methods: {
                    
                },
                ready: function () {
                    //sd.log(this.isBillList.length);
                }
            });
            //获取退菜原因详情
            if(!isadd) {
                sd.request('Reason/getReasonById', {
                    rid: print.id
                }, false, function(json) {
                    if(json.error) {
                        alert(json.error.code + '错误', json.error.message);
                    } else {
                        sd.log(json.data);
                        refundBombBox.refundName = json.data.reasonName;
                        refundBombBox.num = json.data.sort;

                    }
                }, function(json) {
                    alert('错误提示', '请求失败');
                }, 'get');
            }
        };
    //    排序
        var sortreFundFood = function() {
            var arr = sd.copy(refundReasonVue.refundFood);
            var sortFundFood = function(a, b) {
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
            }
            refundReasonVue.refundFood = arr.sort(sortFundFood);

        };

    });