/**
 * @file
 * 客户配置- 服务费管理
 *
 * @author weiyan.kong
 */
sd.controller([
        'servicefee.html',
        'js/sd/ui/win.js',
        'js/sd/ctr/upload.js'
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
        // 加载admin模块html到页面
        $('#userbox').html(sd.getHtml('servicefee.html'));
        //清空search区域内容
        $('#search').html('');

        var domcache = $('<div></div>');
        //获取菜品单
        var relatedForm = $('.relatedForm');
        // 获取可视区域宽度 
        var relatedFormWidth = 980;
        // 获取可视区域高度
        var relatedFormHeight = relatedForm.outerHeight() < 400 ? 400 : auto;
        //
        domcache.append(relatedForm);

        //获取套餐单
        var domcacheTwo = $('<div></div>');
        var relatedFormTwo = $('.relatedFormTwo');
        domcacheTwo.append(relatedFormTwo);
        // 获取图片上传预览功能类
        var Upload = sd.getClass('ctr.upload');
        // 获取窗口类
        var CWin = sd.getClass('ui.win');

        //服务费vue
        var service = new Vue({
            el: "#service",
            data: {
                shopId: userData.currentShop.id, //商店ID
                on: false, //开关按钮
                percent: '', //服务费费率
                disabled: true, //禁用
                uid: userData.user.id, // 用户Id
                list: [{ //判断打折前后
                    id: 0,
                    name: '打折前'
                }, {
                    id: 1,
                    name: '打折后'
                }],
                index: 0, //初始设置为打折前
                goodsLength: 0, //关联菜品
                goodsIds: [],
                packages: [],
                packagesLength: null //关联套餐
            },
            methods: {
                //保存按钮点击操作
                keepOn: function() {
                    var goodsIds = this.goodsIds ? this.goodsIds.toString() : '';
                    var packageIds = this.packages ? this.packages.toString() : '';
                    if(!this.disabled){
                        if(service.percent == '') {
                            alert("服务费费率不能为空");
                            return ;
                        } else if(isNaN(service.percent)) {
                            alert("服务费率只能为数字，请正确输入");
                            service.percent = 0;
                            return ;
                        }else if(service.percent>100||service.percent<1){
                            alert("服务费率在1-100之间，请正确输入");
                            return ;
                        }
                    }
                    //设置服务费接口
                    sd.request('shop/setServiceCharge', {
                        shopId: userData.currentShop.id, //店铺ID
                        status: Number(this.on), //开启服务费 0：不开；1：开
                        rule: Number(this.index), //规则 0：打折前；1：打折后
                        percent: parseInt(this.percent), //服务费率 (0至100)
                        uid: userData.user.id, //用户id
                        goodsIds: goodsIds, //商品ID，逗号分隔，例：1,2,3
                        packageIds: packageIds //套餐ID，逗号分隔，例：1,2,3
                    }, false, function(json) {
                        if(json.error) {
                            alert(json.error.code + '错误', json.error.message);
                        } else {
                            service.list.id = json.data.charge.chargeRule;
                            service.status = json.data.charge.chargeStatus;
                            service.percent = json.data.charge.chargePercent;
                            
                            service.uid = json.data.charge_uid;
                            service.goodsIds = json.data.goodsIds;
                            service.packages = json.data.packageIds;
                            alert("保存成功")
                        }
                    }, function(json) {
                        alert('错误提示', '请求失败');
                    }, 'post');
                },
                ons: function() {
                    if(!this.on) {
                        this.disabled = true;
                    } else {
                        this.disabled = false;
                    }
                },
                //新建关联菜单窗口
                addlist: function(type) {
                    if(!this.on) return;
                    openWin(true);
                },
                //新建关联套餐窗口
                addpackage: function() {
                    if(!this.on) return;
                    openWinTwo(true);
                },
            },
            watch: {
                'on': 'ons'
            },
            ready:function(){
                //获取服务费接口
                sd.request('shop/getServiceCharge', {
                    shopId: userData.currentShop.id
                }, false, function(json) {
                    if(json.error) {
                        alert(json.error.code + '错误', json.error.message);
                    } else {
                        service.packages = json.data.packageIds;
                        service.goodsIds = json.data.goodsIds;
                        service.packageIds = json.data.packageIds;
                        service.goodsLength = json.data.goodsIds.length;
                        service.packagesLength = json.data.packageIds.length;
                        var chargeLength = json.data.charge.length;
        
                        service.on = Number(json.data.charge.chargeStatus);
                        service.on = Boolean(service.on);
                        service.index = Number(json.data.charge.chargeRule);
                        service.percent = json.data.charge.chargePercent;
                    }
                }, function(json) {
                    alert('错误提示', '请求失败');
                }, 'get');
            }
        });

        // 添加关联菜单窗口
        var openWin = function(i, id) {
            var title = '添加关联菜品';
            var myWin = new CWin(relatedFormWidth,
                relatedFormHeight,
                title,
                relatedForm.clone().get(0),
                function(win) {
                    service.goodsLength = threeVue.goodsIndex.length;
                    service.goodsIds = sd.copy(threeVue.goodsIndex);
                },
                function(win) {

                }, {
                    name: '确定'
                }, {
                    name: '取消'
                }
            );
            myWin.open('center');
            
            // 弹出vue 关联菜品
            var threeVue = new Vue({
                el: '#' + myWin.onlyID,
                data: {
                    L1ID: 0,
                    L2ID: 0,
                    category: [], //分类列表
                    child: [], //一级分类的子元素
                    selectgoods: [],
                    goodsCom: [], //商品列表
                    goodsIndex: sd.copy(service.goodsIds),
                    show: -1
                },
                methods: {
                    changeL1ID: function(id, i) {
                        this.L1ID = id;
                        this.L2ID = 0;
                        this.child = this.category[i].child ? this.category[i].child : [];
                        this.goodReady(id);
                    },
                    changeL2ID: function(id) {
                        this.L2ID = id;
                        this.goodReady(id);
                    },
                    incategory: function(cids) {
                        if(this.L1ID == 0) return true;
                        if(cids.indexOf(this.L1ID) >= 0 && this.L2ID == 0) {
                            return true;
                        } else if(cids.indexOf(this.L2ID) >= 0) {
                            return true;
                        }
                        return false;
                    },
                    goodReady : function(id){
                        var arr = [];
                        for(var i = 0; i < this.goodsCom.length; i++) {
                            if(id === undefined || id === 0){
                                var item = sd.copy(this.goodsCom[i]);
                                if(!$.isArray(item.cids)) {
                                    sd.log(item.id + ' cids不是数组');
                                } else {
                                    if(this.incategory(item.cids)) {
                                        arr.push(item);
                                    }
                                }
                            }else{
                                for(var j=0;j<this.goodsCom[i].cids.length;j++){
                                    if(this.goodsCom[i].cids[j] == id){
                                        arr.push(this.goodsCom[i]);
                                    }
                                }
                            }
                        }
                        this.selectgoods = arr;
                    },
                    wholeOnCom: function() {
                        for(var i = 0; i < this.selectgoods.length; i++) {
                            this.goodsIndex.push(this.selectgoods[i].id);
                        };
                        this.goodsIndex = $.unique(this.goodsIndex);
                    },
                    wholeOffCom: function() {
                        for(var i = 0; i < this.goodsCom.length; i++) {
                            var item = sd.copy(this.goodsCom[i]);
                            if(this.incategory(item.cids)) {
                                this.goodsIndex.$remove(item.id);
                            }
                        }
                    },
                    change: function(n) {
                        this.show = n;
                    },
                    goodsNonull: function() {
                        this.goodsLength = this.goodsIds.length;
                    },
                },
                ready: function(){
                    // 请求分类列表
                    sd.request('category/getCategoryList', {
                        shopId: userData.currentShop.id,
                    }, false, function(json) {
                        threeVue.category = json.data;
                        threeVue.category.unshift({
                            name: "全部",
                            id: 0
                        });
                    }, function() {});
                    // 请求商品列表
                    sd.request('goods/getGoodsList', {
                        shopId: userData.currentShop.id,
                        page: 1,
                        num: 9999
                    }, false, function(json) {
                        threeVue.goodsCom = json.data.list;
                        threeVue.goodReady();
                    }, function() {});
                },
                watch: {
                    'goodsIds': 'goodsNonull'
                }
            });
        };

        // 添加关联套餐窗口
        var openWinTwo = function() {
            var title = '添加关联套餐';
            var myWinTwo = new CWin(relatedFormWidth,
                relatedFormHeight,
                title,
                relatedFormTwo.clone().get(0),
                function(win) {
                    service.packagesLength = packageVue.packageIndex.length;
                    service.packages = sd.copy(packageVue.packageIndex);
                },

                function(win) {

                }, {
                    name: '确定'
                }, {
                    name: '取消'
                }
            );
            myWinTwo.open('center');
            
            // 弹出vue 关联套餐
            var packageVue = new Vue({
                el: '#' + myWinTwo.onlyID,
                data: {
                    tab1: 0,
                    tab2: 0,
                    category: [],
                    child: [],
                    selectgoods: [],
                    goodsCom: [],
                    goodsIndex: sd.copy(service.goodsIds),
                    packageList: [], //套餐列表
                    packagesLength: 0, //关联套餐长度
                    packageName: [{ //套餐分类
                        name: '全部分类',
                        id: 0
                    }, {
                        name: '可选套餐',
                        id: 1
                    }, {
                        name: '固定套餐',
                        id: 2
                    }],
                    packageIndex: sd.copy(service.packages),
                    selectPackages: [],
                    show: -1
                },
                methods: {
                    wholeOnPackage: function() {
                        for(var i = 0; i < this.selectPackages.length; i++) {
                            this.packageIndex.push(this.selectPackages[i].id);
                        }
                        this.packageIndex = $.unique(this.packageIndex);
                    },
                    wholeOffPackage: function() {
                        for(var i = 0; i < this.selectPackages.length; i++) {
                            var item = sd.copy(this.selectPackages[i]);
                            if(this.show == item.type) {
                                this.packageIndex.$remove(item.id);
                            } else {
                                this.packageIndex = [];
                            }
                        }
                    },
                    change: function(n) {
                        this.show = n;
                    },
                    filterPackage: function() {
                        if(this.packageList == null){
                            return false;
                        }
                        var arr = [];
                        for(var i = 0; i < this.packageList.length; i++) {
                            if(this.show == this.packageList[i].type) {
                                arr.push(this.packageList[i]);
                            }
                        }
                        this.selectPackages = (this.show === -1) ? this.packageList : arr;
                    },
                    packagesNonull: function() {
                        this.packagesLength = (this.packages.length == 0) ? null : this.packages.length;
                    }
                },
                ready: function(){
                    // 获取套餐显示列表数据
                    sd.request('package/getpackagelist', {
                        shopId: userData.currentShop.id,
                        num: 1000,
                        page: 1
                    }, false, function(json) {
                        if(json.error) {
                            alert(json.error.code + '错误', json.error.message);
                        } else {
                            packageVue.packageList = json.data;
                            packageVue.filterPackage();
                        }
                    }, function(json) {
                        alert('错误提示', '请求失败');
                    });
                },
                watch: {
                    'show': 'filterPackage',
                    'packages': 'packagesNonull'
                }
            });
        };
    });