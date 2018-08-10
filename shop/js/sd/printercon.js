/**
 * @file
 * 打印机配置
 *
 * @author guan.sun
 */
sd.controller([
        'printercon.html',
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
        // 获取 弹出框样式
        var Win = sd.getClass("ui.win");

        // 将printerman.html 添加到#userbox
        $('#userbox').html(sd.getHtml('printercon.html'));

        // 获取打印机配置表单 
        var cform = $('.Pconfig');
        // 获取可视区域宽度 
        var cformWidth = cform.outerWidth()
            // 获取可视区域高度
        var cformHeight = cform.outerHeight();
        var domcache = $('<div></div>');

        // 获取关联商品套餐表单
        var rform = $('.relatedForm');
        var rformWidth = rform.outerWidth();
        var rformHeight = rform.outerHeight();
        var rdomcache = $('<div></div>');

        // 将表单添加至domcache中 
        domcache.append(cform);
        rdomcache.append(rform);

        // 打印机配置vue
        var pcon = new Vue({
            el: '#printercon',
            data: {
                conList: []
            },
            methods: {
                openWin: function(pid, types, index) {
                    openAddEidteWin(pid, types, index);
                }
            }
        });

        //新建修改方法
        var openAddEidteWin = function(pid, types, index) {
            var title = (types == 'addPcon') ? '新建打印机配置' : '修改打印机配置';
            var myWin = new Win(cformWidth, cformHeight, title, cform.clone().get(0), function(win) {
                //表单验证
                if(winVue.orderType == null) {
                    alert('错误提示', '单据数据不能为空！');
                    return false;
                }
                if(winVue.printerIndex.length == 0 || winVue.printerIndex == -1) {
                    alert('错误提示', '打印机不能不选！');
                    return false;
                }

                if(winVue.orderType == 0 || winVue.orderType == 1) {
                    if(winVue.footerContent.length <= 0){
                        alert('错误提示', '页脚不能为空！');
                        return false;
                    }
                    if(winVue.footerContent.length >= 30) {
                        alert('错误提示', '页脚长度不能超过30！');
                        return false;
                    }
                    if($.isEmptyObject(winVue.areaIndex)) {
                        alert('错误提示', '区域不能不选！');
                        return false;
                    }
                } else if(winVue.orderType == 6 || winVue.orderType == 7) {
                    if($.isEmptyObject(winVue.areaIndex)) {
                        alert('错误提示', '区域不能不选！');
                        return false;
                    }
                    if(winVue.goodsIds.length == 0 && winVue.goodsIds == '' && winVue.packages.length == 0 && winVue.packages == '') {
                        alert('错误提示', '商品或套餐必须二选一！');
                        return false;
                    }
                } else if(winVue.orderType == 9 || winVue.orderType == 2) {
                    if(winVue.goodsIds.length == 0 && winVue.goodsIds == '' && winVue.packages.length == 0 && winVue.packages == '') {
                        alert('错误提示', '商品或套餐必须二选一！');
                        return false;
                    }
                } else if(winVue.orderTyp == 3 || winVue.orderTyp == 11) {
                    if($.isEmptyObject(winVue.areaIndex)) {
                        alert('错误提示', '区域不能不选！'); 
                        return false;
                    }
                } else {

                }

                if(types == 'addPcon') {
                    // 添加打印机配置
                    sd.request('printset/addPrintset', {
                        shopId: userData.currentShop.id,
                        createUid: userData.user.id,
                        printerId: winVue.printerId,
                        orderType: winVue.orderType,
                        areaIds: winVue.areaIndex.toString(),
                        goodsIds: winVue.goodsIds.toString(),
                        packageIds: winVue.packages.toString(),
                        footerContent: winVue.footerContent,
                        printTimes: winVue.printTimes,
                        isAlam: Number(winVue.isAlam),
                        orderStatus:winVue.status
                    }, false, function(json) {
                        if(json.error) {
                            alert(json.error.code + '错误', json.error.message);
                        } else {
                            pcon.conList.push(json.data);
                        }
                    }, function() {}, 'post');
                } else {
                    // 修改打印机配置
                    sd.request('printset/editPrintset', {
                        printsetId: pid,
                        shopId: userData.currentShop.id,
                        updateUid: userData.user.id,
                        printerId: winVue.printerId,
                        orderType: winVue.orderType,
                        areaIds: winVue.areaIndex.toString(),
                        goodsIds: winVue.goodsIds.toString(),
                        packageIds: winVue.packages.toString(),
                        footerContent: winVue.footerContent,
                        printTimes: winVue.printTimes,
                        isAlam: Number(winVue.isAlam),
                        orderStatus:winVue.status
                    }, false, function(json) {
                        if(json.error) {
                            alert(json.error.code + '错误', json.error.message);
                        } else {
                            pcon.conList.$set(index, json.data);
                        }
                    }, function(json) {
                        alert(json.error.code + '错误', json.error.message);
                    }, 'post');
                }
            }, function(win) {
                if(title == '修改打印机配置') {
                    confirm('操作提示', '确认删除打印机？', function() {
                        //删除打印机配置
                        sd.request('printset/deletePrintset', {
                            shopId: userData.currentShop.id,
                            printsetId: pid
                        }, false, function(json) {
                            if(json.error) {
                                alert(json.error.code + '错误', json.error.message);
                            } else {
                                var itme = pcon.conList;
                                for(var i = 0; i < itme.length; i++) {
                                    if(itme[i].id == pid) {
                                        pcon.conList.$remove(itme[i]);
                                    }
                                }
                            }
                        }, function() {});
                    }, function() {});
                }
                return true;
            }, {
                class: 'yellow',
                name: types == 'addPcon' ? '确定' : '保存'
            }, {
                class: types === 'addPcon' ? 'gray' : 'red',
                name: types == 'addPcon' ? '取消' : '删除'
            });
            myWin.open("right");
            
            if(types != 'addPcon') {
                // 获取打印机配置信息
                sd.request('printset/getPrintsetById', {
                    printsetId: pid
                }, false, function(json) {
                    if(json.error) {
                        alert(json.error.code + '错误', json.error.message);
                    } else {
                        winVue.printerId = json.data.printerId;
                        winVue.orderTypeIndex = Number(json.data.orderType);
                        winVue.footerContent = json.data.footerContent;
                        winVue.printTimes = Number(json.data.printTimes);
                        winVue.isAlam = (json.data.isAlam == '0') ? false : true;
                        winVue.areaIndex = json.data.areaIds != '' && json.data.areaIds != null ? json.data.areaIds.split(',') : [];
                        winVue.goodsIds = json.data.goodsIds != '' && json.data.goodsIds != null ? json.data.goodsIds.split(',') : [];
                        winVue.packages = json.data.packageIds != '' && json.data.packageIds != null ? json.data.packageIds.split(',') : [];
                        initTogath();
                    }
                }, function() {
                    alert(json.error.code + '错误', json.error.message);
                });
            }
            
            //新建弹出vue 
            var winVue = new Vue({
                el: '#' + myWin.onlyID,
                data: {
                    docType: [],
                    orderType: null,
                    printerList: [],
                    printTimes: 1,
                    isAlam: false,
                    footerContent: '',
                    printerId: null,
                    areaIdsList: [],
                    areaIds: [],
                    status: '1',
                    orderTypeIndex: -1,
                    printerIdIndex: -1,
                    areaIndex: [],
                    printerIndex: -1,
                    goodsLength: null,
                    goodsIds: [],
                    packages: [],
                    packagesLength: null
                },
                methods: {
                    printerIndexChange: function() {
                        if(this.printerIndex > -1) {
                            this.printerId = this.printerList[this.printerIndex].id;
                        }
                    },
                    orderTypeIndexChange: function() {
                        // 筛选符合单据的配置
                        if(this.orderTypeIndex == 0 || this.orderTypeIndex == 1) {
                            this.status = '1';
                        } else if(this.orderTypeIndex == 9 || this.orderTypeIndex == 2) {
                            this.status = '4';
                        } else if(this.orderTypeIndex == 3 || this.orderTypeIndex == 11) {
                            this.status = '5';
                        } else if(this.orderTypeIndex == 6 || this.orderTypeIndex == 7) {
                            this.status = '3';
                        } else {
                            this.status = '2';
                            if(this.orderTypeIndex == -1){
                                this.status = '1';
                            }
                        }
                        // 插入单据数据数组中
                        if(this.orderTypeIndex > -1 && !$.isEmptyObject(this.docType)) {
                            this.orderType = this.docType[this.orderTypeIndex].type;
                        }
                    },
                    areaIndexChange: function() {
                        if(this.areaIndex != null) {
                            for(var i = 0; i < this.areaIndex.length; i++) {
                                this.areaIds.push(this.areaIndex[i]);
                            }
                        }
                        // this.areaIds数组去重复
                        this.areaIds = $.unique(this.areaIds);
                    },
                    openWinThree: function() {
                        var myWinThree = new Win(rformWidth, rformHeight, '添加关联菜品', rform.clone().get(0), function(win) {
                            winVue.goodsLength = threeVue.goodsIndex.length;
                            winVue.goodsIds = sd.copy(threeVue.goodsIndex);
                            winVue.packagesLength = threeVue.packageIndex.length;
                            winVue.packages = sd.copy(threeVue.packageIndex);
                        }, function(win) {
                            return true;
                        }, {
                            class: 'yellow',
                            name: '保存'
                        }, {
                            class: 'gray',
                            name: '取消'
                        });
                        myWinThree.open();

                        // 弹出三级vue 关联菜品
                        var threeVue = new Vue({
                            el: '#' + myWinThree.onlyID,
                            data: {
                                L1ID: 0,
                                L2ID: 0,
                                category: [],
                                child: [],
                                selectgoods: [],
                                goodsCom: [],
                                goodsIndex: sd.copy(winVue.goodsIds),
                                packageList: [],
                                selectPackages: [],
                                packageName: [{
                                    name: '全部',
                                    id: 0
                                }, {
                                    name: '可选套餐',
                                    id: 1
                                }, {
                                    name: '固定套餐',
                                    id: 2
                                }],
                                packageIndex: sd.copy(winVue.packages),
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
                                wholeOnPackage: function() {
                                    for(var i = 0; i < this.selectPackages.length; i++) {
                                        this.packageIndex.push(this.selectPackages[i].id);
                                    }
                                    this.packageIndex = $.unique(this.packageIndex);
                                },
                                wholeOffPackage: function() {
                                    if(this.selectPackages == null){
                                        return false;
                                    }
                                    for(var i = 0; i < this.selectPackages.length; i++) {
                                        var item = sd.copy(this.selectPackages[i]);
                                        if(this.show == item.type) {
                                            this.packageIndex.$remove(item.id);
                                        } else {
                                            this.packageIndex.$remove(item.id);
                                        }
                                    }
                                },
                                change: function(n) {
                                    this.show = n;
                                },
                                filterPackage: function() {
                                    var arr = [];
                                    if(this.packageList == null){
                                        return false;
                                    }
                                    for(var i = 0; i < this.packageList.length; i++) {
                                        if(this.show == this.packageList[i].type) {
                                            arr.push(this.packageList[i]);
                                        }
                                    }
                                    this.selectPackages = (this.show === -1) ? this.packageList : arr;
                                }
                            },
                            watch: {
                                'show': 'filterPackage'
                            }
                        });

                        // 请求分类列表
                        sd.request('category/getCategoryList', {
                            shopId: userData.currentShop.id
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

                        // 获取套餐显示列表数据
                        sd.request('package/getpackagelist', {
                            shopId: userData.currentShop.id,
                            num: 1000,
                            page: 1
                        }, false, function(json) {
                            if(json.error) {
                                alert(json.error.code + '错误', json.error.message);
                            } else {
                                threeVue.packageList = json.data;
                                threeVue.filterPackage();
                            }
                        }, function(json) {
                            alert('错误提示', '请求失败');
                        });

                    },
                    goodsNonull: function() {
                        this.goodsLength = (this.goodsIds.length == 0) ? null : this.goodsIds.length;
                    },
                    packagesNonull: function() {
                        this.packagesLength = (this.packages.length == 0) ? null : this.packages.length;
                    }
                },
                watch: {
                    'printerIndex': 'printerIndexChange',
                    'orderTypeIndex': 'orderTypeIndexChange',
                    'areaIndex': 'areaIndexChange',
                    'goodsIds': 'goodsNonull',
                    'packages': 'packagesNonull'
                }
            });
            
             // 初始化
            var initTogath = function() {
                //打印的初始化
                if(winVue.printerId && winVue.printerList && winVue.printerList.length > 0) {
                    for(var i = 0; i < winVue.printerList.length; i++) {
                        if(winVue.printerList[i].id == winVue.printerId) {
                            winVue.printerIndex = i;
                        }
                    }
                }
            }
            
            // 请求打印机列表
            sd.request('printer/getPrinterList', {
                shopId: userData.currentShop.id
            }, false, function(json) {
                if(json.error) {
                    alert(json.error.code + '错误', json.error.message);
                } else {
                    if($.isEmptyObject(json.data)){
                        confirm('操作提示', '打印机为空,请先添加打印机', function() {
                               myWin.close();
                               sd.toPage("index.html#main&f=1&s=6");
                        }, function() {
                               myWin.close();
                               alert('提示信息','打印机为空不能操作打印机配置！');
                        });
                        return false;
                    }else{
                        winVue.printerList = json.data;
                        initTogath();
                    }
                }
            }, function(json) {
                if(json.error){
                    alert(json.error.code + '错误', json.error.message);
                }else{
                    alert('提示信息','接口报错了！');
                }
            });

            // 请求区域列表
            sd.request('Area/getArea', {
                shopId: userData.currentShop.id
            }, false, function(json) {
                if(json.error){
                    alert(json.error.code + '错误', json.error.message);
                }else{
                    if($.isEmptyObject(json.data)){
                        confirm('操作提示', '区域为空,请先添加区域', function() {
                               myWin.close();
                               sd.toPage("index.html#main&f=1&s=2");
                        }, function() {
                               myWin.close();
                               alert('提示信息','区域为空不能操作打印机配置！');
                        });
                        return false;
                    }else{
                        winVue.areaIdsList = json.data;
                        initTogath();
                    }
                }
            }, function(json) {
                if(json.error){
                    alert(json.error.code + '错误', json.error.message);
                }else{
                    alert('提示信息','接口报错了！');
                }
            });

            // 请求单据类型列表
            sd.request('printset/getOrderNames', {
                shopId : userData.currentShop.id
            }, false, function(json) {
                if(json.error){
                    alert(json.error.code + '错误', json.error.message);
                }else{
                    winVue.docType = json.data;
                    winVue.orderTypeIndexChange();
                    initTogath();
                }
            }, function(json) {
                if(json.error){
                    alert(json.error.code + '错误', json.error.message);
                }else{
                    alert('提示信息','接口报错了！');
                }
            });
        };
            

        //请求打印机配置列表
        sd.request('printset/getPrintsetList', {
            shopId: userData.currentShop.id
        }, false, function(json) {
            if(json.error){
                alert(json.error.code + '错误', json.error.message);
            }else{
                 pcon.conList = json.data;
            }
        }, function(json) {
            if(json.error){
                alert(json.error.code + '错误', json.error.message);
            }else{
                alert('提示信息','接口报错了！');
            }
        });
    });