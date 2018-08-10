/**
 * @file
 * 库存管理模块
 *
 * @author guan.sun
 */
sd.controller([
        'invcontrol.html',
        'js/sd/ui/win.js',
        'js/sd/ctr/lazyload.js'
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
        var imgHost = userData.uploadUrl;
        // 获取 弹出框样式
        var Win = sd.getClass("ui.win");
        
        //获取懒加载
        var Lazyload = sd.getClass('ctr.lazyload');
        var ImagLoadCtr =  new Lazyload('cname');

        // 将commanage.html 添加到#userbox
        $('#userbox').html(sd.getHtml('invcontrol.html'));

        // 获取表单 
        var cform = $('.lContForm');
        // 获取可视区域宽度 
        var cformWidth = cform.outerWidth()
            // 获取可视区域高度
        var cformHeight = cform.outerHeight();
        var domcache = $('<div></div>');

        // 将表单添加至domcache中 
        domcache.append(cform);

        // search区域内容
        $('#search').html('');
        //      $('#search').html($('.search-fun').get(0));

        // 创建vue lcont
        var lcont = new Vue({
            el: '#lcont',
            data: {
                imgHost: imgHost,
                category: [], // 商品列表一级分类
                child: [], // 商品列表二级分类
                goods: [], // 商品列表
                L1ID: 0, // 一级分类
                L2ID: 0, // 二级分类
                goodsName: '',
                goodList: []
            },
            methods: {
                stockSet: function(index, gid) {
                    var _this = this;
                    var myWin = new Win(cformWidth, cformHeight, '库存设置', cform.clone().get(0),
                        function(win) {
                            if(Number(winCont.goodsNum) <= 0) {
                                alert('错误提示', '库存必须为大于0！');
                                return false;
                            }
                            if(Number(winCont.goodsNum) < Number(winCont.goodsThreshold)) {
                                alert('错误提示', '库存必须大于库存预警值！');
                                return false;
                            }
                            // 设置库存
                            sd.request('Inventory/set', {
                                gid: gid,
                                shopId: userData.currentShop.id,
                                goodsNum: winCont.goodsNum,
                                goodsThreshold: winCont.goodsThreshold,
                                isWarn: 0,
                                isLock: winCont.isLock
                            }, false, function(json) {
                                if(json.error) {
                                    alert(json.error.code + '错误', json.error.message);
                                } else {
                                    if(json.data) {
                                        // 获取库存数量
                                        sd.request('goods/getGoodsList', {
                                            shopId: userData.currentShop.id,
                                            page: 1,
                                            num: 9999
                                        }, false, function(json) {
                                            lcont.goods = json.data.list;
                                        }, function() {});
                                        _this.goods.$set(index, json.data);
                                        ImagLoadCtr.refresh();
                                    }
                                }
                            }, function() {}, "post");
                        },
                        function(win) {
                            return true;
                        });
                    myWin.open();

                    // 获取库存状态
                    sd.request('Inventory/get', {
                        gid: gid,
                    }, false, function(json) {
                        winCont.isLock = json.data.isLock;
                        winCont.goodsNum = json.data.goodsNum;
                        winCont.goodsThreshold = json.data.goodsThreshold;
                        winCont.initialise = true;
                    }, function() {});

                    // 弹窗vue
                    var winCont = new Vue({
                        el: '#' + myWin.onlyID,
                        data: {
                            isLock: 0, //开启估清
                            goodsNum: 0, //库存量
                            goodsThreshold: 0, //预警值
                            numDis: null,
                            ThresholdDis: null,
                            initialise: false
                        },
                        computed: {
                            goodsNums: {
                                get: function() {
                                    return this.goodsNum;
                                },
                                set: function(newValue) {
                                    this.goodsNum = newValue.replace(/[^\d\.]/g, '');
                                    this.goodsNum = this.goodsNum.toFloatStr(2);
                                }
                            },
                            goodsThresholds: {
                                get: function() {
                                    return this.goodsThreshold;
                                },
                                set: function(newValue) {
                                    this.goodsThreshold = newValue.replace(/[^\d\.]/g, '');
                                    this.goodsThreshold = this.goodsThreshold.toFloatStr(2);
                                }
                            }
                        },
                        methods: {
                            ToisWarn: function() {
                                this.isLock = (this.isLock === 0) ? 1 : 0;
                            }
                        }
                    });
                },
                changeL1ID: function(id, i) {
                    this.L1ID = id;
                    this.L2ID = 0;
                    this.child = this.category[i].child ? this.category[i].child : [];
                },
                changeL2ID: function(id) {
                    this.L2ID = id;
                },
                incategory: function(cids) {
                    if(this.L1ID == 0) return true;
                    if(cids && cids.indexOf(this.L1ID) >= 0 && this.L2ID == 0) {
                        return true;
                    } else if(cids && cids.indexOf(this.L2ID) >= 0) {
                        return true;
                    }
                    return false;
                }
            },
            ready: function() {

            }
        });

        // 查询商品
        //      var searchs = new Vue({
        //          el: "#search",
        //          data: {
        //              goodsName: ''
        //          },
        //          methods: {
        //              search: function(e) {
        //                  lcont.goodsName = this.goodsName;
        //              }
        //          }
        //      });

        // 请求分类列表
        sd.request('category/getCategoryList', {
            shopId: userData.currentShop.id,
        }, false, function(json) {
            lcont.category = json.data;
            lcont.category.unshift({
                name: "全部",
                id: 0
            });
        }, function() {});

        var a = null;
        // 获取库存数量
        sd.request('goods/getGoodsList', {
            shopId: userData.currentShop.id,
            page: 1,
            num: 9999
        }, false, function(json) {
            //lcont.goods = json.data.list;
            var all = json.data.list;
            var arr1 = [];
            var arr2 = [];
            for(var i = 0; i < all.length; i++) {
                if(all[i].isStock == 1) {
                    if(parseInt(all[i].goodsNum) <= parseInt(all[i].goodsThreshold)) {
                        arr1.push(all[i]);
                    } else {
                        arr2.push(all[i]);
                    }
                }
            }
            var sortFn = function(a, b) {
                var na = parseInt(a.sort);
                var nb = parseInt(b.sort);
                if(na > nb) {
                    return 1;
                } else if(na < nb) {
                    return -1;
                }
                return 0;
            }
            arr1 = arr1.sort(sortFn);
            arr2 = arr2.sort(sortFn);
            lcont.goods = arr1.concat(arr2);
            ImagLoadCtr.refresh();
            //sd.log(lcont.goods);

        }, function() {});

    });