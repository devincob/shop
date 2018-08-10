/**
 * @file
 *客户配置- 商户编号
 *
 * @author weiyan.kong
 */
sd.controller([
        'shopnum.html'
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
        $('#userbox').html('');
        // 加载admin模块html到页面
        $('#userbox').html(sd.getHtml('shopnum.html'));
        //清空search区域内容
        $('#search').html('');
        
        //商品编号vue
        var shopnum = new Vue({
            el: '#shopnum',
            data: {
                copNum: ""
            },
            methods: {
                //初始化
                inte: function(){
                    //获取商户编号
                    sd.request('shop/getAccessToken', {
                        shopId: userData.currentShop.id
                    }, false, function(json) {
                        if(json.error) {
                            alert(json.error.code + '错误', json.error.message);
                        } else {
                            shopnum.copNum = json.data;
                        }
                    }, function(json) {
                        alert('错误提示', '请求失败');
                    }, 'get'); // sd.request请求方式后加true 则是请求测试数据
                },
                //复制
                copyCode: function(oForm) {
                    var t = $(".num")[0];
                    t.select();
                    document.execCommand("copy");
                },
                //随机
                randomNum: function() {
                    confirm('操作提醒', '重置商户编号会导致全部打印机不能正常工作，需要专业人员重新配置路由器数据。请谨慎操作！',
                        function(win) {
                            //重新选择
                            sd.request('shop/resetAccessToken', {
                                shopId: userData.currentShop.id
                            }, false, function(json) {
                                if(json.error) {
                                    alert(json.error.code + '错误', json.error.message);
                                } else {
                                    shopnum.copNum = json.data;
                                }
                            }, function(json) {
                                alert('错误提示', '请求失败');
                            }, 'get');
                            win.close();
                        }
                    )

                }
            },
            ready: function(){
                this.inte();
            }

        });

    });