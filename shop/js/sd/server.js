/**
 * @file
 * 后台请求对象
 * 
 * 需要重复使用的后端请求接口放在这里
 *
 * @author chenggong.jiang
 */
sd.controller([],
    function() {
        var userData = sd.session("userShop");
       
        var sdShopServer = sdShopServer ? sdShopServer : {};
        window.sdShopServer = sdShopServer;
        sdShopServer.goods = sdShopServer.goods ? sdShopServer.goods : {};

        /**
         * 获取分页商品列表
         * 
         * @param {Number} page
         * @param {Number} num
         * @param {Function} callback
         */
        sdShopServer.goods.getGoodsList = function(page, num, callback) {
            sd.request('goods/getGoodsList', {
                shopId: userData.currentShop.id,
                page: page,
                num: num
            }, false, function(json) {
                if(json.error) {
                    alert(json.error.code + '错误', json.error.message);
                } else {
                    if(json.data) {
                        callback(json.data);
                    } else {
                        callback(null);
                    }
                }
            }, function() {
                alert('错误提示', '请求失败');
                callback(null);
            }, "get", false);
        };

        /**
         * 获取所有商品
         * 
         * @param {Number} num
         * @param {Function} callback
         */
        sdShopServer.goods.getAllGoodsList = function(num, callback) {
            if(!$.isFunction(callback)) {
                throw new Error("callback 参数类型错误");
                return;
            }
            //          var count = 0; // 记录总条数
            var total = 0; // 总页数
            var num = num; // 一次获取100条记录
            var page = 1; // 当前第几页
            var alllist = [];
            var goodsCallBack = function(data) {
                page++;
                if(data) {
                    total = data.total ? data.total : 0;
                    //                  count = data.count ? data.count:0;
                    var list = $.isArray(data.list) ? data.list : [];
                    for(var i = 0; i < list.length; i++) {
                        alllist.push(list[i]);
                    }
                } else {
                    page = int.maxValue;
                }

                if(page <= total) {
                    sdShopServer.goods.getGoodsList(page, num, goodsCallBack);
                } else {
                    callback(alllist);
                }
            };
            sdShopServer.goods.getGoodsList(page, num, goodsCallBack);
        };

        sdShopServer.category = sdShopServer.category ? sdShopServer.category : {};

        /**
         * 获取分类信息
         * 
         * @param {Function} callback
         */
        sdShopServer.category.getCategoryList = function(callback) {
             if(!$.isFunction(callback)) {
                throw new Error("callback 参数类型错误");
                return;
            }
            sd.request('category/getCategoryList', {
                shopId: userData.currentShop.id,
            }, false, function(json) {
                if(json.error) {
                    alert(json.error.code + '错误', json.error.message);
                } else {
                    callback(json.data);
                };
            }, function(json) {
                if(json.error) {
                    alert(json.error.code + '错误', json.error.message);
                } else {
                    alert('提示信息', '接口报错了！');
                }
            });
        };

    });