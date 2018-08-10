/**
 * @file
 * 商品管理模块
 *
 * @author guan.sun
 */
sd.controller([
        'commanage.html',
        'js/sd/ui/win.js',
        'js/sd/ctr/upload.js',
        'js/sd/ctr/lazyload.js'
    ],
    function() {
        //读取user数据
        // 获取登录信息
        var userData = sd.session("userShop");
        if(userData && userData.accessToken && userData.currentShop) {
            sd.send.token = userData.accessToken;
            sd.send.shopId = userData.currentShop.id;
        } else {
            sd.controller(['js/sd/login.js']);
            return;
        }
        var shopId = userData.currentShop.id;

        // 获取图片url
        var imgHost = userData.uploadUrl;

        // 获取 弹出框样式
        var Win = sd.getClass("ui.win");

        // 将commanage.html 添加到#userbox
        $('#userbox').html(sd.getHtml('commanage.html'));

        // 获取表单 
        var cform = $('.commodity-form');
        // 获取可视区域宽度 
        var cformWidth = cform.outerWidth()
            // 获取可视区域高度
        var cformHeight = cform.outerHeight();
        var domcache = $('<div></div>');

        var Upload = sd.getClass('ctr.upload');
        var Lazyload = sd.getClass('ctr.lazyload');
        var ImagLoadCtr = new Lazyload('cname');
        // 将表单添加至domcache中 
        domcache.append(cform);

        // search区域内容
        $('#search').html('');
        $('#search').html($('.search-fun').get(0));

        // 获取口味选项
        var flavor = $(".flavor");
        domcache.append(flavor);

        // 获取分类选项
        var classify = $(".classify");
        domcache.append(classify);

        // 商品排序
        var sortfn = function(a, b) {
            var value1 = parseInt(a['sort']);
            var value2 = parseInt(b['sort']);
            if(value1 < value2) {
                return -1;
            } else if(value1 > value2) {
                return 1;
            } else {
                var id1 = parseInt(a['id']);
                var id2 = parseInt(b['id']);
                if(id1 > id2) {
                    return -1;
                } else if(id1 < id2) {
                    return 1;
                }
            }
            return 0;
        };

        // 验证字符
        function getByteLen(val) {
            var len = 0;
            for(var i = 0; i < val.length; i++) {
                var length = val.charCodeAt(i);
                if(length >= 0 && length <= 128) {
                    len += 1;
                } else {
                    len += 2;
                }
            }
            return len;
        }
        
        // 添加商品记忆
        var intelligent = {};
        
        // 添加、编辑窗口
        var openAddEidteWin = function(gid, types, index) {
            var title = (types == 'addcomm') ? '添加商品' : '修改商品';
            var mywin = new Win(cformWidth, 'auto', title, cform.clone().get(0), function(win) {
                var image = win.dom.find("#file_upload").val(); //图片
                var arr = image.split('\\'); //注split可以用字符或字符串分割 
                var my = arr[arr.length - 1]; //这就是要取得的图片名称 
                if(!$.isEmptyObject(winvue.classOn)) {
                    for(var i = 0; i < winvue.classOn.length; i++) {
                        winvue.cids.push(winvue.classOn[i].id);
                    }
                    winvue.cids = $.unique(winvue.cids);
                }
                if(!$.isEmptyObject(winvue.Attron)) {
                    for(var i = 0; i < winvue.Attron.length; i++) {
                        winvue.attrs.push(winvue.Attron[i].id);
                    }
                    winvue.attrs = $.unique(winvue.attrs);
                }
                var pattern = /^[^\'\"\&]+$/; //判断是否包含特殊字符 
                var prices = new RegExp("^(([1-9]+)|([0-9]+\.[0-9]{1,2}))$"); //判断数字
                if(winvue.goodsName != '') {
                    if(!pattern.test(winvue.goodsName)) {
                        alert('错误提示', "名称不能包含英文的单引号和双引号");
                        return false;
                    }
                } else {
                    alert('错误提示', '名称不能为空！');
                    return false;
                }
                if(getByteLen(winvue.goodsName) > 60) {
                    alert('错误提示', "名称长度最大为60！");
                    return false;
                }
                if(getByteLen(winvue.goodsName) > 60) {
                    alert('错误提示', "商品名称长度最大为60！");
                    return false;
                }
                if(winvue.price != '') {
                    if(winvue.price >= 100000) {
                        alert('错误提示', "售价最大为100000！");
                        return false;
                    }
                } else {
                    alert('错误提示', '售价不能为空！');
                    return false;
                }
                if(winvue.price < 0) {
                    alert('错误提示', '售价不能少于0！');
                    return false;
                }
                //              if(winvue.type == '0') {
                //                  if(parseFloat(winvue.price) < parseFloat(winvue.cost)) {
                //                      alert('错误提示', '售价不能小于成本价！');
                //                      return false;
                //                  }
                //              }
                if(winvue.type == '0') {
                    if($.trim(winvue.unitType) == '') {
                        alert('错误提示', '请输入单位！');
                        return false;
                    }
                } else {
                    if(winvue.unit == '') {
                        alert('错误提示', '单位不能不选！');
                        return false;
                    }
                }
                if(getByteLen(winvue.unit) > 20) {
                    alert('错误提示', '单位长度不能超过20个字符！');
                    return false;
                }
                if(winvue.cost != '') {
                    if(isNaN(winvue.cost)) {
                        alert('错误提示', "成本价必须为数字！");
                        return false;
                    }
                    if(winvue.cost > 100000) {
                        alert('错误提示', '成本价不能大于100000！');
                    }
                }
                if(winvue.isVip == '1') {
                    if(winvue.vipPrice == '') {
                        alert('错误提示', "会员价不能为空！");
                        return false;
                    }
                    if(isNaN(winvue.vipPrice)) {
                        alert('错误提示', "会员价格必须为数字！");
                        return false;
                    }
                    if(winvue.vipPrice <= 0 || winvue.vipPrice > 100000) {
                        alert('错误提示', "会员价格不能小于0大于100000！");
                        return false;
                    }
                    if(Number(winvue.vipPrice) > Number(winvue.price)) {
                        alert('错误提示', '会员价格不能大于售价！');
                        return false;
                    }
                }
                //              if(winvue.isVip == '2') {
                //                  if(winvue.vipDiscount == '') {
                //                      alert('错误提示', "会员折扣不能为空！");
                //                      return false;
                //                  }
                //                  if(isNaN(winvue.vipDiscount)) {
                //                      alert('错误提示', '会员折扣必须为数字!');
                //                      return false;
                //                  }
                //                  if(winvue.vipDiscount > 100 || winvue.vipDiscount < 1) {
                //                      alert('错误提示', '会员折扣不能小于1大于100!');
                //                      return false;
                //                  }
                //              }

                var des = winvue.description + '';
                winvue.description = des.replace(/[\'\"\&]/g, '');
                if(getByteLen(winvue.description) > 255) {
                    alert("描述过长,请删减!");
                    return false;
                }

                if(winvue.type == '0') {
                    winvue.unit = winvue.unitType;
                }

                if(types == 'addcomm') {
                    // 保存上次商品添加的记忆；
                    intelligent =  {
                        shopId: shopId,
                        type: winvue.type,
                        goodsName: winvue.goodsName,
                        BC: winvue.BC,
                        price: winvue.price,
                        isVip: winvue.isVip,
                        isStock: winvue.isStock,
                        vipPrice: winvue.vipPrice,
                        vipDiscount: winvue.vipDiscount,
                        isDiscount: winvue.isDiscount,
                        serviceCharge: winvue.serviceCharge,
                        isRecommend: winvue.isRecommend,
                        unit: winvue.unit,
                        cost: winvue.cost,
                        description: winvue.description,
                        sort: winvue.sort,
                        cids: winvue.cids.toString(),
                        attrs: winvue.attrs.toString(),
                        imageName: winvue.fileName,
                        createUid: userData.user.id
                    };
                    // 提交商品创建表单
                    sd.request('goods/createGoods', intelligent , false, function(json) {
                        if(json.error) {
                            alert(json.error.code + '错误', json.error.message);
                        } else {
                            com.goodList.push(json.data);
                            com.comChang();
                        };
                    }, function(json) {
                        if(json.error) {
                            alert(json.error.code + '错误', json.error.message);
                        } else {
                            alert('提示信息', '接口报错了！');
                        }
                    }, 'post');

                } else {
                    // 提交修改商品表单
                    sd.request('goods/edit', {
                        shopId: shopId,
                        goodsId: gid,
                        type: winvue.type,
                        goodsName: winvue.goodsName,
                        BC: winvue.BC,
                        price: winvue.price,
                        isVip: winvue.isVip,
                        isStock: winvue.isStock,
                        vipPrice: winvue.vipPrice,
                        vipDiscount: winvue.vipDiscount,
                        isDiscount: winvue.isDiscount,
                        serviceCharge: winvue.serviceCharge,
                        isRecommend: winvue.isRecommend,
                        unit: winvue.unit,
                        cost: winvue.cost,
                        description: winvue.description,
                        sort: winvue.sort,
                        cids: winvue.cids.toString(),
                        attrs: winvue.attrs.toString(),
                        imageName: winvue.fileName,
                        createUid: userData.user.id
                    }, false, function(json) {
                        if(json.error) {
                            alert(json.error.code + '错误', json.error.message);
                        } else {
                            var goods = json.data;
                            sd.log(goods);
                            goods.goodsNum = winvue.goodsNum; //库存数量使用旧的
                            var item = com.goodList;
                            for(var i = 0; i < item.length; i++) {
                                if(item[i].id == goods.id) {
                                    item.$set(i, goods);
                                }
                            }
                            com.comChang();
                            alert('操作提示', '保存商品成功！');
                        }
                    }, function(json) {
                        if(json.error) {
                            alert(json.error.code + '错误', json.error.message);
                        } else {
                            alert('提示信息', '接口报错了！');
                        }
                    }, 'post');
                }
            }, function(win) {
                if(types == 'edit') {
                    confirm('操作提示', '确认删除商品？', function() {
                        // 删除商品
                        sd.request('goods/del', {
                            goodsId: gid,
                            shopId: shopId,
                            uid: userData.user.id
                        }, true, function(json) {
                            if(json.error) {
                                alert(json.error.code + '错误', json.error.message);
                            } else {
                                if(json.data == true) {
                                    var item = com.goodList;
                                    for(var i = 0; i < item.length; i++) {
                                        if(item[i].id == gid) {
                                            item.$remove(item[i]);
                                        }
                                    }
                                    com.comChang();
                                    alert('操作提示', '删除商品成功！');
                                }
                            }
                            win.close();
                        });
                    }, function() {});
                }
                return true;
            }, {
                class: 'yellow',
                name: types == 'addcomm' ? '确定' : '保存'
            }, {
                class: types === 'addcomm' ? 'gray' : 'red',
                name: types == 'addcomm' ? '取消' : '删除'
            });
            mywin.open("right");

            

            var zhendReg = /[\'\"\&]/g; //验证中文字母数字

            // 修改创建vue
            var winvue = new Vue({
                el: '#' + mywin.onlyID,
                data: {
                    sort: 1,
                    vip: [{
                        "name": "会员价格",
                        current: false
                    }, {
                        "name": "会员折扣",
                        current: false
                    }],
                    editList: [],
                    Attron: [],
                    classOn: [],
                    type: '0',
                    isRecommend: '0',
                    serviceCharge: '0',
                    isDiscount: '0',
                    isVip: '0',
                    isStock: '0',
                    description: '',
                    goodsName: '',
                    BC: '',
                    price: '',
                    vipPrice: '',
                    vipDiscount: '',
                    vipList: '1',
                    unit: '',
                    unitType: '',
                    cost: '',
                    cids: [],
                    attrs: [],
                    fileName: '',
                    imgHost: imgHost,
                    isA: false,
                    ivip: false,
                    goodsNum: null
                },
                computed: {
                    goodsNames: {
                        get: function() {
                            return this.goodsName;
                        },
                        set: function(newValue) {
                            this.goodsName = newValue.replace(zhendReg, '');
                        }
                    },
                    BCs: {
                        get: function() {
                            return this.BC;
                        },
                        set: function(newValue) {
                            this.BC = newValue.replace(/[^a-zA-Z\d]/g, '');
                        }
                    },
                    unitTypes: {
                        get: function() {
                            return this.unitType;
                        },
                        set: function(newValue) {
                            this.unitType = newValue.replace(zhendReg, '');
                        }
                    }
                },
                methods: {
                    addflavor: function(e) {
                        openAttrWin(this);
                    },
                    addclassify: function(e) {
                        openClassWin(this);
                    },
                    tabTypes: function() {
                        this.type = (this.type === '0') ? '1' : '0';
                    },
                    units: function(unit) {
                        this.unit = unit;
                    },
                    isDiscounts: function() {
                        this.isDiscount = (this.isDiscount == '0') ? '1' : '0';
                    },
                    serviceCharges: function() {
                        this.serviceCharge = (this.serviceCharge === '0') ? '1' : '0';
                    },
                    isRecommends: function() {
                        this.isRecommend = (this.isRecommend === '0') ? '1' : '0';
                    },
                    isStocks: function() {
                        this.isStock = (this.isStock === '0') ? '1' : '0';
                    },
                    isvips: function() {
                        this.ivip = !this.ivip;
                        if(this.ivip == true) {
                            this.isVip = 1;
                        }
                    },
                    vipLists: function(i) {
                        this.isVip = (i === 1) ? 1 : 2;
                    },
                    fileNameChange: function(imgJson) {
                        if(imgJson) {
                            this.fileName = imgJson.data;
                        }
                    },
                    vipChange: function() {
                        if(this.ivip == false) {
                            this.isVip = 0;
                            this.vipPrice = null;
                            this.vipDiscount = null;
                        }
                    },
                    delClass: function(id) {
                        for(var i = 0; i < this.classOn.length; i++) {
                            if(this.classOn[i].id == id) {
                                this.classOn.$remove(this.classOn[i]);
                                break;
                            }
                        }
                    },
                    delAttr: function(id) {
                        for(var i = 0; i < this.Attron.length; i++) {
                            if(this.Attron[i].id == id) {
                                this.Attron.$remove(this.Attron[i]);
                                break;
                            }
                        }
                    },
                    PriceChaneg: function() {
                        if(winvue.price != '' && !isNaN(winvue.price)) {
                            var price = Number(winvue.price);
                            winvue.price = price.toFixed(2);
                        }
//                      this.price = this.price.toFloatStr(2);
                    },
                    costChaneg: function() {
                        if(this.type == '0') {
                            //                          if(parseFloat(winvue.cost) > parseFloat(winvue.price)) {
                            //                              alert('错误提示', '成本价不能大于售价！');
                            //                              return false;
                            //                          }
                            if(winvue.cost != '' && !isNaN(winvue.cost)) {
                                var cost = Number(winvue.cost);
                                winvue.cost = cost.toFixed(2);
                            }
//                          this.cost = this.cost.toFloatStr(2);
                        }
                    },
                    vipPriceChaneg: function() {
                        if(winvue.vipPrice != '' && !isNaN(winvue.vipPrice)) {
                            var vipPrice = Number(winvue.vipPrice);
                            winvue.vipPrice = vipPrice.toFixed(2);
                        }
//                      this.vipPrice = this.vipPrice.toFloatStr(2);
                    }
                },
                watch: {
                    'ivip': 'vipChange',
                    'price': 'PriceChaneg',
                    'cost': 'costChaneg',
                    'vipPrice': 'vipPriceChaneg',
                    'type': 'costChaneg'
                }
            });
            
            if(types == 'edit') {
                // 获取商品数据
                sd.request('goods/getGoodsDetail', {
                    goodsId: gid
                }, false, function(json) {
                    if(json.error) {
                        alert(json.error.code + '错误', json.error.message);
                    } else {
                        winvue.editList = json.data;
                        winvue.type = json.data.type; //类型
                        winvue.goodsName = json.data.goodsName; //商品名
                        winvue.BC = json.data.BC; //简码
                        winvue.price = json.data.price; //价格
                        winvue.vipPrice = json.data.vipPrice; //vip价格
                        winvue.vipDiscount = json.data.vipDiscount; //vip折扣
                        winvue.sort = json.data.sort; //排序
                        winvue.isDiscount = json.data.isDiscount; //打折
                        winvue.serviceCharge = json.data.serviceCharge; //服务费
                        winvue.isRecommend = json.data.isRecommend; //推荐菜
                        winvue.isVip = json.data.isVip; //是否为vip
                        winvue.isStock = json.data.isStock; //是否开启库存
                        if(json.data.isVip == 1 || json.data.isVip == 2) {
                            winvue.ivip = true;
                        }
                        winvue.description = json.data.description; //描述
                        winvue.cost = json.data.cost; //成本价
                        if(json.data.type == '0') {
                            winvue.unitType = json.data.unit;
                        } else {
                            winvue.unit = json.data.unit; //单位
                        }
                        winvue.goodsNum = json.data.goodsNum; //库存量
                        //分类
                        if(!$.isEmptyObject(json.data.cate)) {
                            winvue.classOn = json.data.cate;
                            var arr1 = [];
                            for(var i = 0; i < winvue.classOn.length; i++) {
                                winvue.classOn[i] = JSON.stringify(winvue.classOn[i]); //对象转成字符串的方法
                                arr1.push(winvue.classOn[i]); //重新填装成一个《字符串》组成的数组
                            }
                            winvue.classOn = []; //清空原来的数据
                            arr1 = $.unique(arr1); // 去掉重复的字符串
                            for(var j = 0; j < arr1.length; j++) {
                                arr1[j] = JSON.parse(arr1[j]); // 重新给字符串转换成对象
                                winvue.classOn.push(arr1[j]); //重新填装成一个《对象》组成的数组
                            }
                        }
                        //口味
                        if(!$.isEmptyObject(json.data.attr)) {
                            winvue.Attron = json.data.attr;
                            var arr1 = [];
                            for(var i = 0; i < winvue.Attron.length; i++) {
                                winvue.Attron[i] = JSON.stringify(winvue.Attron[i]); //对象转成字符串的方法
                                arr1.push(winvue.Attron[i]); //重新填装成一个《字符串》组成的数组
                            }
                            winvue.Attron = []; //清空原来的数据
                            arr1 = $.unique(arr1); // 去掉重复的字符串
                            for(var j = 0; j < arr1.length; j++) {
                                arr1[j] = JSON.parse(arr1[j]); // 重新给字符串转换成对象
                                winvue.Attron.push(arr1[j]); //重新填装成一个《对象》组成的数组
                            }
                        }
                        winvue.fileName = json.data.imageName; //图片
                    };
                }, function(json) {
                    if(json.error) {
                        alert(json.error.code + '错误', json.error.message);
                    } else {
                        alert('提示信息', '接口报错了！');
                    }
                }, 'get');
            }else{
                
                if(intelligent.type !== undefined){
                    winvue.type = intelligent.type;
                }
                if(intelligent.isVip !== undefined){
                    winvue.isVip = intelligent.isVip;
                }
                if(intelligent.isStock !== undefined){
                    winvue.isStock = intelligent.isStock;
                }
                if(intelligent.vipPrice !== undefined){
                    winvue.vipPrice = intelligent.vipPrice;
                }
                if(intelligent.vipDiscount !== undefined){
                    winvue.vipDiscount = intelligent.vipDiscount;
                }
                if(intelligent.isDiscount !== undefined){
                    winvue.isDiscount = intelligent.isDiscount;
                }
                if(intelligent.serviceCharge !== undefined){
                    winvue.serviceCharge = intelligent.serviceCharge;
                }
                if(intelligent.isRecommend !== undefined){
                    winvue.isRecommend = intelligent.isRecommend;
                }
                if(intelligent.unit !== undefined){
                    winvue.unit = intelligent.unit;
                }
                if(intelligent.cost !== undefined){
                    winvue.cost = intelligent.cost;
                }
                if(intelligent.sort !== undefined){
                    winvue.sort = intelligent.sort;
                }
                if(intelligent.cids !== undefined){
                    winvue.cids = intelligent.cids.split(',');
                }
                if(intelligent.attrs !== undefined){
                    winvue.attrs = intelligent.attrs.split(',');
                }
            }
            
            new Upload("comForm", "file_upload", {
                type: 1,
                shopId: shopId
            }, winvue.fileNameChange); //上传图片
        };

        // 添加分类窗口
        var openClassWin = function(thats) {
            var classifys = new Win(565, 'auto', '选择分类', classify.clone().get(0), function(win) {
                thats.classOn = sd.copy(category.classOn);
            }, function(win) {
                return true;
            }, {
                class: 'yellow',
                name: '保存'
            }, {
                class: 'gray',
                name: '取消'
            });
            classifys.open();

            var category = new Vue({
                el: '#' + classifys.onlyID,
                data: {
                    classAll: [],
                    classOn: sd.copy(thats.classOn),
                    isA: false
                },
                methods: {
                    pushClass: function(id, name) {
                        for(var i = 0; i < this.classOn.length; i++) {
                            if(this.classOn[i].id == id) {
                                this.classOn.$remove(this.classOn[i]);
                                return;
                            }
                        }
                        this.classOn.push({
                            id: id,
                            name: name
                        });
                    },
                    checkSelected: function(id) {
                        if(this.classOn.length == 0) {
                            return false;
                        } else {
                            for(var i = 0; i < this.classOn.length; i++) {
                                if(this.classOn[i].id == id) {
                                    return true;
                                }
                            }
                        }
                    },
                    childShow: function(e) {
                        if($(e.target).parent().next(".classify-cont").is(":hidden")) {
                            $(e.target).addClass("classOn");
                            $(e.target).parent().next(".classify-cont").show("slow");
                        } else {
                            $(e.target).removeClass("classOn");
                            $(e.target).parent().next(".classify-cont").hide("slow");
                        }
                    }
                }
            });

            // 请求分类列表
            sd.request('category/getCategoryList', {
                shopId: shopId,
            }, false, function(json) {
                if(json.error) {
                    alert(json.error.code + '错误', json.error.message);
                } else {
                    category.classAll = json.data;
                }
            }, function(json) {
                if(json.error) {
                    alert(json.error.code + '错误', json.error.message);
                } else {
                    alert('提示信息', '接口报错了！');
                }
            });
        };

        // 添加口味窗口
        var openAttrWin = function(thats) {
            var flavors = new Win(565, 'auto', '选择口味', flavor.clone().get(0), function(win) {
                thats.Attron = sd.copy(Attrs.Attron);
            }, function(win) {
                return true;
            }, {
                class: 'yellow',
                name: '保存'
            }, {
                class: 'gray',
                name: '取消'
            });
            flavors.open();

            var Attrs = new Vue({
                el: '#' + flavors.onlyID,
                data: {
                    Attrall: [],
                    Attron: sd.copy(thats.Attron),
                    isA: false
                },
                methods: {
                    handle: function(id, name) {
                        for(var i = 0; i < this.Attron.length; i++) {
                            if(this.Attron[i].id == id) {
                                this.Attron.$remove(this.Attron[i]);
                                return;
                            }
                        }
                        this.Attron.push({
                            id: id,
                            name: name
                        })
                    },
                    checkSelected: function(id) {
                        if(this.Attron.length == 0) {
                            return false;
                        } else {
                            for(var i = 0; i < this.Attron.length; i++) {
                                if(this.Attron[i].id == id) {
                                    return true;
                                }
                            }
                        }
                    }
                }
            });

            // 请求口味列表
            sd.request('Attr/getAttr', {
                shopId: shopId,
            }, false, function(json) {
                if(json.error) {
                    alert(json.error.code + '错误', json.error.message);
                } else {
                    Attrs.Attrall = json.data;
                }
            }, function(json) {
                if(json.error) {
                    alert(json.error.code + '错误', json.error.message);
                } else {
                    alert('提示信息', '接口报错了！');
                }
            });
        };

        // 声明vue com
        var com = new Vue({
            el: '#com',
            data: {
                total: 0, // 总页数
                count: 0, // 总记录条数
                num: 14, // 当前每页展示数量
                pageNum: 0, //当前页实际展示数量
                currentPage: 0, //当前展示的页数
                goodsCom: [], // 当前展示的商品 
                goodList: [], // 所有商品 
                search: '', // 搜索栏过滤器
                stockID: 1, // top id ，默认显示开启和未开启库存的所有商品
                L1ID: 0, // 1级分类 id
                L2ID: 0, // 2级分类id
                category: [], // 1级分类导航
                child: [], // 2级分类导航
                imgHost: imgHost,
                stockList: [{ // top分类导航
                    "id": 1,
                    "name": "全部"
                }, {
                    "id": 2,
                    "name": "已开启库存商品"
                }, {
                    "id": 3,
                    "name": "未开启库存商品"
                }]

            },
            computed: {
                page: {
                    get: function() {
                        return this.currentPage;
                    },
                    set: function(newValue) {
//                      newValue = newValue >= total ? total-1:newValue;
//                      newValue = newValue >=0 ? newValue:0;
                        
                        this.currentPage = newValue;
                        var num = (this.currentPage + 1) * this.num;
                        if(num > this.count) {
                            this.pageNum = this.count - this.currentPage * this.num;
                        } else {
                            this.pageNum = this.num;
                        }
                    }
                }
            },
            methods: {
                addcomm: function(gid, types, index) {
                    openAddEidteWin(gid, types, index);
                },
                changeL1ID: function(id, i) {
                    this.L1ID = id;
                    this.L2ID = 0;
                    this.child = this.category[i].child ? this.category[i].child : [];
                    this.comChang();
                },
                changeL2ID: function(id) {
                    this.L2ID = id;
                    this.comChang();
                },
                stockFun: function(id) {
                    this.L1ID = 0;
                    this.L2ID = 0;
                    this.stockID = id;
                    this.comChang();
                },
                pageChanged: function() {
                    ImagLoadCtr.refresh();
                },
                comChang: function() {
                    var findList = [];
                    for(var i = 0; i < this.goodList.length; i++) {
                        //先过滤 stockID
                        var item = this.goodList[i];
                        if(this.stockID == 2) {
                            if(item.isStock !== '1') {
                                continue;
                            }
                        } else if(this.stockID === 3) {
                            if(item.isStock != '0') {
                                continue;
                            }
                        }
                        // 再过滤 L1ID 和 L2ID
                        var L1ID = this.L1ID + '';
                        var L2ID = this.L2ID + '';
                        if(L1ID !== '0' && L2ID === '0') {
                            var findL1ID = false;
                            if(item.cids && $.isArray(item.cids)) {
                                for(var j = 0; j < item.cids.length; j++) {
                                    if(item.cids[j] === L1ID) {
                                        findL1ID = true;
                                        break;
                                    }
                                }
                            }
                            if(!findL1ID) continue;
                        } else if(L2ID !== '0') {
                            var findL2ID = false;
                            if(item.cids && $.isArray(item.cids)) {
                                for(var j = 0; j < item.cids.length; j++) {
                                    if(item.cids[j] === L2ID) {
                                        findL2ID = true;
                                        break;
                                    }
                                }
                            }
                            if(!findL2ID) continue;
                        }
                        // 再过滤 search
                        if(this.search != '') {
                            var goodsName = item.goodsName + '';
                            var BC = item.BC + '';
                            if(goodsName.indexOf(this.search) == -1 && BC.indexOf(this.search) == -1) {
                                continue;
                            }
                        }
                        findList.push(item);
                    }
                    this.goodsCom = findList.sort(sortfn);
                    this.total = Math.ceil(this.goodsCom.length / this.num);
                    this.count = this.goodsCom.length;
                    if(this.page >= this.total) {
                        this.page = this.total - 1 >= 0 ? this.total - 1 : 0;
                    } else {
                        this.page = this.page;
                    }
                    ImagLoadCtr.refresh();
                }
            },
            ready: function() {
                // 请求商品列表
                sdShopServer.goods.getAllGoodsList(100, function(list) {
                    com.goodList = list;
                    com.page = 0;
                    com.comChang();
                });
            }
        });

        // 查询商品
        var searchs = new Vue({
            el: "#search",
            data: {
                search: '',
                exportUrl: 'javascript:void(0);'
            },
            methods: {
                keyUp: function(e) {
                    com.search = this.search.toUpperCase();
                    com.comChang();
                },
                imports: function() {
                    // 导入商品列表
                    sd.request('goods/import', {
                        shopId: shopId,
                        uid: userData.user.id
                    }, false, function(json) {
                        if(json.error) {
                            alert(json.error.code + '错误', json.error.message);
                        } else {
                            alert('操作提示', '导入成功！');
                        }
                    }, function(json) {
                        if(json.error) {
                            alert(json.error.code + '错误', json.error.message);
                        } else {
                            alert('提示信息', '接口报错了！');
                        }
                    }, 'post');
                }
            },
            ready: function() {
                // 导出商品列表
                this.exportUrl = sd.getUrl('goods/export', {
                    shopId: shopId
                }, 'csv');
            }
        });

        // 请求分类列表
        sdShopServer.category.getCategoryList(function(data) {
            com.category = data;
            com.category.unshift({
                name: "全部",
                id: 0
            });
        });
    });