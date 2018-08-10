/**
 * @file
 * 商品模块\套餐管理页面
 *
 * @author chenggong.jiang
 */
sd.controller([
        'package.html',
        'js/sd/ui/win.js',
        'js/sd/ctr/upload.js',
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
        var Lazyload = sd.getClass('ctr.lazyload');
        var ImagLoadCtr = new Lazyload('cname');
        // 清空容器内容
        $('#userbox').html('');
        // 加载admin模块html到页面
        $('#userbox').html(sd.getHtml('package.html'));
        // 清空search内容
        $('#search').html('');
        // search区域内容
        $('#search').append($('#package-search').get(0));

        // 获取窗口类
        var CWin = sd.getClass('ui.win');
        // 获取图片上传预览功能类
        var Upload = sd.getClass('ctr.upload');

        // 获取编辑窗口，缓存HTML，并移除显示列表中的HTML
        var pwin = $('#package-win');
        var pwinWidth = pwin.outerWidth();
        var pwinHeight = pwin.outerHeight();
        var pwinHtml = pwin.get(0).outerHTML;
        pwin.remove();

        // 获取选择窗口，缓存HTML，并移除显示列表中的HTML
        var swin = $('#package-select-win');
        var swinWidth = swin.outerWidth();
        var swinHeight = 'auto'; //swin.outerHeight();
        var swinHtml = swin.get(0).outerHTML;
        swin.remove();

        // 限定只能输入中文英文和数字
        var zhendReg =/[\'\"\&]/g; // /[^\w\d\u4e00-\u9fa5]/g;
        // 限定只能输入英文和数字和下划线
        var endReg = /[^a-zA-Z\d_]/g;
        // 限定只能输入英文
        var enReg = /[^a-zA-Z]/g;
        // 限定数字和小数点 ，然后调用str.toFloatStr(2)转换
        var floatReg = /[^\d\.]/g;
        // 限定数字
        var intReg = /[^\d]/g;

        // 开启编辑OR添加窗口 type = add | edit
        var openPackageWin = function(type, id, index) {
            var title = (type ? '添加套餐' : '编辑套餐');
            // 套餐编辑窗口
            var win = new CWin(
                pwinWidth,
                pwinHeight,
                title,
                pwinHtml,
                function(win) {
                    //表单验证
                    var emptyReg = /^[\s]*$/;
                    var numReg = /^[\d\.]*$/;
                    var name = packageVue.good.package.packageName + '';
                    if(emptyReg.test(name)) {
                        alert('错误提示', '名称不能为空');
                        return false;
                    }

                    //var BC = packageVue.good.package.BC + '';
                    //if(emptyReg.test(BC)) {
                    //    alert('错误提示', '简码不能为空');
                    //    return false;
                    //}                  
                    var price = packageVue.good.package.price + '';
                    if(!numReg.test(price)) {
                        alert('错误提示', '售价填写错误');
                        return false;
                    }

                    if(parseInt('0' + price) > 100000) {
                        alert('错误提示', '售价不能超过10万');
                        return false;
                    }

                    if(packageVue.good.packageTag.length == 0) {
                        alert('错误提示', '套餐标识不能为空,请添加标识');
                        return false;
                    }

                    if(packageVue.good.packageGoods.length == 0) {
                        alert('错误提示', '套餐标识内没有选择商品，请编辑标识内容');
                        return false;
                    }
                    //                  sd.log(packageVue.$data)
                    var vipDiscount = parseInt('0' + packageVue.good.package.vipDiscount);
                    if(vipDiscount < 0 || vipDiscount > 100) {
                        alert('错误提示', '会员折扣范围0-100');
                        return false;
                    }
                    
                    var des = packageVue.good.description +''; 
                    packageVue.good.description = des.replace(/[\'\"\&]/g,'');

                    // 提交套餐表单
                    var updata = {
                        'shopId': userData.currentShop.id // 店铺id
                    };
                    // 获取套餐数据
                    var upPackage = sd.copy(packageVue.$data.good.package);
                    // 获取套餐标识数据
                    var upPackageTag = sd.copy(packageVue.$data.good.packageTag);
                    // 添加套餐
                    if(type) {
                        delete upPackage['id'];
                        $.extend(true, updata, upPackage);
                        // 创建者id
                        updata.createUid = userData.user.id;
                        // 获取每个标识的商品
                        for(var i = 0; i < upPackageTag.length; i++) {
                            var tagItem = upPackageTag[i];
                            tagItem.packageGoods = packageVue.getpackageGoodsByPackageID(tagItem.id, true);
                            // 剔除多余数据
                            delete tagItem['newTag'];
                            delete tagItem['id'];
                        }
                        updata['packageTag'] = JSON.stringify(upPackageTag);
                        //sd.log(updata);
                        // 提交数据，添加套餐
                        sd.request('package/addPackage', updata, false, function(json) {
                            if(json.error) {
                                alert(json.error.code + '错误', json.error.message);
                            } else {
                                listView.goods.push(json.data);
                                ImagLoadCtr.refresh();
                            }
                        }, function(json) {
                            alert('错误提示', '请求失败', function() {
                                win.close();
                            });
                        }, 'post');
                    } else {
                        // 修改套餐
                        $.extend(true, updata, upPackage);
                        // 套餐packageId
                        updata.packageId = upPackage.id;
                        delete updata.id;
                        // 修改者id
                        updata.updateUid = userData.user.id;
                        // 新增packageTag
                        var newPackageTag = [];
                        // 旧的packageTag
                        var oldPackageTag = [];
                        // 获取每个标识的商品
                        for(var i = 0; i < upPackageTag.length; i++) {
                            var tagItem = upPackageTag[i];
                            tagItem.packageGoods = packageVue.getpackageGoodsByPackageID(tagItem.id, true);
                            if(tagItem.newTag) {
                                // 剔除多余数据
                                delete tagItem['newTag'];
                                delete tagItem['id'];
                                newPackageTag.push(tagItem);
                            } else {
                                oldPackageTag.push(tagItem);
                            }
                        }
                        updata['packageTag'] = JSON.stringify(oldPackageTag);
                        updata['newPackageTag'] = JSON.stringify(newPackageTag);
                        //                      sd.log(updata);

                        // 提交数据，修改套餐

                        sd.request('package/editPackage', updata, false, function(json) {
                            if(json.error) {
                                alert(json.error.code + '错误', json.error.message);
                            } else {
                                listView.goods.$set(index, json.data);
                                ImagLoadCtr.refresh();
                            }
                        }, function(json) {
                            alert('错误提示', '请求失败', function() {
                                win.close();
                            });
                        }, 'post');

                    }
                    packageVue.$destroy(true);
                    return true;
                },
                function(win) {
                    if(type !== 'add') {
                        // 编辑套餐，删除提醒
                        confirm('操作提示', '确定删除套餐？', function() {
                            sd.request('package/deletePackage', {
                                updateUid: userData.user.id,
                                packageId: packageVue.$data.good.package.id
                            }, false, function(json) {
                                if(json.error) {
                                    alert(json.error.code + '错误', json.error.message);
                                } else {
                                    listView.goods.$remove(listView.goods[index]);
                                    ImagLoadCtr.refresh();
                                }
                                win.close();
                            }, function(json) {
                                alert('错误提示', '请求失败', function() {
                                    win.close();
                                });
                            });
                        });
                    }
                    packageVue.$destroy(true);
                    return true;
                }, {
                    class: 'yellow',
                    name: type === 'add' ? '添加' : '保存'
                }, {
                    class: type === 'add' ? 'gray' : 'red',
                    name: type === 'add' ? '取消' : '删除'
                });

            win.open('right');

            // 套餐编辑窗口Vue
            var packageVue = new Vue({
                el: '#package-win',
                data: {
                    imgHost: imgHost,
                    good: null, // 当前套餐数据，后面根据是新建还是编辑旧套餐来初始化
                    tagselect: 0, // 当前选中的标识在good.packageTag数组中的索引
                    packageTagId: 0, // 当前选中的标识id
                    packageTagGoods: [], // 当前选中的标识中的商品数据
                    seletedContainerHeight: 0 // 当前选中的标识中的商品展示的最小高度，通过计算获得
                },
                computed: {
                    packageName: {
                        get: function() {
                            return this.good.package.packageName;
                        },
                        set: function(newValue) {
                            this.good.package.packageName = newValue.replace(zhendReg, '');
                        }
                    },
                    BC: {
                        get: function() {
                            return this.good.package.BC;
                        },
                        set: function(newValue) {
                            this.good.package.BC = newValue.replace(enReg, '');
                        }
                    },
                    cost: {
                        get: function() {
                            return this.good.package.cost;
                        },
                        set: function(newValue) {
                            this.good.package.cost = newValue.replace(floatReg, '').toFloatStr(2);
                        }
                    },
                    price: {
                        get: function() {
                            return this.good.package.price;
                        },
                        set: function(newValue) {
                            this.good.package.price = newValue.replace(floatReg, '').toFloatStr(2);
                        }
                    },
                    vipPrice: {
                        get: function() {
                            return this.good.package.vipPrice;
                        },
                        set: function(newValue) {
                            if(parseFloat(newValue) > parseFloat(this.good.package.price)) {
                                this.good.package.vipPrice = this.good.package.price;
                            } else {
                                this.good.package.vipPrice = newValue.replace(floatReg, '').toFloatStr(2);
                            }
                        }
                    },
                    vipDiscount: {
                        get: function() {
                            return this.good.package.vipDiscount;
                        },
                        set: function(newValue) {
                            var newValue = parseInt('0' + newValue.replace(intReg, ''));
                            if(newValue > 100) {
                                this.good.package.vipDiscount = '100';
                            } else if(newValue < 0) {
                                this.good.package.vipDiscount = '0';
                            } else {
                                this.good.package.vipDiscount = '' + newValue;
                            }
                        }
                    }
                },
                methods: {
                    checkPrice: function() {
                        var str = this.good.package.price + '';
                        var floatstr = str.toFloatStr(2);
                        if(floatstr != str) {
                            this.good.package.price = floatstr;
                        }
                    },
                    imageUpload: function(imgJson) {
                        if(imgJson) {
                            this.good.package.imageName = imgJson.data;
                        }
                    },
                    // 修改套餐类型 0 固定套餐 1 可选套餐
                    changeType: function(v) {
                        if(this.good && this.good.package) {
                            this.good.package.type = v;
                        }
                    },
                    // 根据packageID获取该标识下选择的商品
                    getpackageGoodsByPackageID: function(packageTagId, cut) {
                        var tags = [];
                        var packageGoods = this.$data.good.packageGoods;
                        for(var i = 0; i < packageGoods.length; i++) {
                            if(packageGoods[i].packageTagId == packageTagId) {
                                var item = sd.copy(packageGoods[i]);
                                if(cut) {
                                    delete item['packageTagId'];
                                    delete item['goodsName'];
                                }
                                tags.push(item);
                            }
                        }
                        return tags;
                    },
                    // 初始化标识内菜品内容
                    initTag: function() {
                        this.seletedContainerHeight = this.good.packageTag.length * 46.5;
                        this.packageTagGoods = this.getpackageGoodsByPackageID(this.packageTagId);
                    },
                    // 切换标识按钮
                    changeTag: function(i, tagid) {
                        this.tagselect = i;
                        this.packageTagId = tagid;
                        this.initTag();
                    },
                    // 打开标识窗口，添加新标识
                    addTag: function(title, event) {
                        openSelectWin(title, this, true, type);
                    },
                    // 打开标识窗口，编辑标识
                    eidtTag: function(title, event) {
                        if(this.good.packageTag &&
                            this.good.packageTag.length > this.tagselect &&
                            this.good.packageTag[this.tagselect]) {
                            // 打开标识窗口，编辑标识
                            openSelectWin(title, this, false, type);
                        } else {
                            // 打开标识窗口，添加新标识
                            openSelectWin(title, this, true, type);
                        }
                    },
                    // 修改会员折扣%
                    changeDiscount: function() {
                        if(this.good.package.isDiscount == 0) {
                            this.good.package.isDiscount = 1;
                        } else {
                            this.good.package.isDiscount = 0;
                        }
                    },
                    // 修改是否收取服务费
                    changeServiceCharge: function() {
                        if(this.good.package.serviceCharge == 0) {
                            this.good.package.serviceCharge = 1;
                        } else {
                            this.good.package.serviceCharge = 0;
                        }
                    },
                    // 修改状态( 0.正常 1.估清(存在但不出售))
                    changeStatus: function() {
                        if(this.good.package.status == 0) {
                            this.good.package.status = 1;
                        } else {
                            this.good.package.status = 0;
                        }
                    },
                    // 修改是否为推荐套餐
                    changeRecommend: function() {
                        if(this.good.package.isRecommend == 0) {
                            this.good.package.isRecommend = 1;
                        } else {
                            this.good.package.isRecommend = 0;
                        }
                    },
                    // 修改是否为会员(0.否 1.是)
                    changeVip: function(level) {
                        if(level < 0) {
                            if(this.good.package.isVip != 0) {
                                this.good.package.isVip = 0;
                            } else {
                                this.good.package.isVip = 1;
                            }
                        } else {
                            this.good.package.isVip = level;
                        }
                    },
                    // 处理标识窗口回调，合并数据到套餐编辑窗口的Vue
                    updataTagGoodsData: function(packageTag, packageGoods) {
                        if(this.good.package.type + '' === '1') {
                            var num = 0;
                            for(var i = 0; i < packageGoods.length; i++) {
                                if(parseInt('0' + packageGoods[i].packageGoodsNum) > 0) {
                                    num++;
                                }
                            }
                            if(parseInt('0' + packageTag.totalNum) > num) {
                                packageTag.totalNum = num + '';
                            }
                        }
                        this.packageTagId = packageTag.id;
                        var thispageGoods = sd.copy(this.good.packageGoods);
                        var addGoods = [];
                        for(var i = 0; i < packageGoods.length; i++) {
                            var item = packageGoods[i];
                            var nogoods = true;
                            for(var j = 0; j < thispageGoods.length; j++) {
                                if(item.packageTagId == thispageGoods[j].packageTagId && item.gid == thispageGoods[j].gid) {
                                    nogoods = false;
                                    thispageGoods[j].packageGoodsNum = item.packageGoodsNum;
                                    if(parseInt('0' + thispageGoods[j].packageGoodsNum) == 0) {
                                        thispageGoods.splice(j, 1);
                                        packageGoods.splice(i, 1);
                                        i--;
                                    }
                                    break;
                                }
                            }
                            if(nogoods) addGoods.push(item);

                        }
                        this.good.packageGoods = thispageGoods.concat(addGoods);

                        var notag = true;
                        var delltag = false;
                        var tags = sd.copy(this.good.packageTag);
                        for(var i = 0; i < tags.length; i++) {
                            if(tags[i].id == packageTag.id) {
                                notag = false;
                                if(packageGoods.length == 0) {
                                    tags.splice(i, 1);
                                    delltag = true;
                                } else {
                                    tags[i] = packageTag;
                                }
                                break;
                            }
                        }
                        if(notag) {
                            tags.push(packageTag);
                            this.tagselect = tags.length - 1;
                        } else if(delltag) {
                            if(tags.length > 0) {
                                this.tagselect = 0;
                                this.packageTagId = tags[0].id;
                                //                              sd.log(tags);
                            }
                        }
                        this.good.packageTag = tags;
                        this.initTag();
                    },
                    // 处理标识窗口回调，删除标识
                    dellTag: function(id) {

                        for(var i = 0; i < this.good.packageTag.length; i++) {
                            if(this.good.packageTag[i].id == id) {
                                this.good.packageTag.$remove(this.good.packageTag[i]);
                                break;
                            }
                        }
                        var thispageGoods = this.good.packageGoods;
                        for(var i = 0; i < thispageGoods.length; i++) {
                            var item = thispageGoods[i];
                            if(item.packageTagId == id) {
                                this.good.packageGoods.$remove(item);
                                i--;
                            }
                        }

                        this.tagselect = 0;
                        this.packageTagId = '';
                        if(this.$data.good.packageTag.length > 0) {
                            this.packageTagId = this.$data.good.packageTag[this.tagselect].id;
                        }
                        this.initTag();
                    }
                }
            });

            // 如果id不为空，则是修改套餐
            if(id) {
                // 套餐修改，数据初始化
                sd.request('package/getPackageById', {
                    packageId: id
                }, false, function(json) {
                    if(json.error) {
                        alert(json.error.code + '错误', json.error.message);
                    } else {
                        // 初始化单位
                        for(var i=0;i<json.data.packageGoods.length;i++){
                            json.data.packageGoods[i].unit = listView.getUnit(json.data.packageGoods[i].gid);
                        }
                        packageVue.good = json.data;
//                      sd.log(packageVue.good);
                        
                        setTimeout(function() {
                            packageVue.tagselect = 0;
                            packageVue.packageTagId = packageVue.good.packageTag[0].id;
                            packageVue.initTag();
                            new Upload('uploadImageForm', 'fileInput', {
                                "type": 2,
                                shopId: userData.currentShop.id
                            }, packageVue.imageUpload);
                        }, 100);
                    }
                }, function(json) {
                    alert('错误提示', '请求失败');
                }, 'get', false);
            } else {
                // 套餐添加，数据初始化
                packageVue.good = {
                    package: {
                        id: "",
                        packageName: "",
                        BC: "",
                        type: 0,
                        cost: '0.0',
                        price: '0.0',
                        isDiscount: "0",
                        isVip: "0",
                        vipPrice: "0.0",
                        vipDiscount: "0",
                        imageName: "",
                        isRecommend: "0",
                        serviceCharge: "0",
                        sort: '255',
                        description: "",
                        status: "0" // 是否估清 0 yes，1 no
                    },
                    packageTag: [],
                    packageGoods: []
                };

                // 延迟调用，局部刷新
                setTimeout(function() {
                    // 套餐标识内容
                    packageVue.initTag();
                    // 绑定图片上传预览功能
                    new Upload('uploadImageForm', 'fileInput', {
                        "type": 2,
                        shopId: userData.currentShop.id
                    }, packageVue.imageUpload);
                }, 100);
            }
        };

        // 新建标识时，前端自动生成标识id（仅限前端使用，不会随表单提交）
        var onlyid = 0;
        var creatPackageTagId = function() {
            onlyid++
            return(new Date()).getTime() + '_' + onlyid;
        }

        // 开启二级标识窗口
        var openSelectWin = function(title, pVue, isAdd) {
            // 标识窗口
            var win = new CWin(
                swinWidth,
                swinHeight,
                title,
                swinHtml,
                function(win) {
                    // 确定
                    var zhcn = /^[^\'\"\&]+$/; // /^[\w \（\）\(\)\u4e00-\u9fa5]+$/;
                    var tagName = selectVue.packageTag.tagName+'';
                    tagName = tagName.trim();
                    if(tagName == '') {
                        alert('错误提示', '标识不能为空白');
                        return false;
                    }
                    if(!zhcn.test(tagName)) {
                        alert('错误提示', '标识不能包含英文的单引号和双引号1');
                        return false;
                    }
                    var tag = sd.copy(selectVue.$data.packageTag);
                    var tagGoods = selectVue.getSelectedGoods();
                    //                  sd.log(pVue.$data);
                    if(pVue.good.package.type + '' === '1') {
                        var goodsNum = 0;
                        for(var i = 0; i < tagGoods.length; i++) {
                            goodsNum += parseInt(tagGoods[i].packageGoodsNum);
                        }
                        if(goodsNum < parseInt(tag.totalNum)) {
                            alert('错误提示', '"可选数量"不能大于选中商品的总数量');
                            return false;
                        }
                    }
                    pVue.updataTagGoodsData(tag, tagGoods);
                    selectVue.$destroy(true);
                    return true;
                },
                function(win) {
                    // 删除标识
                    if(!isAdd) {
                        pVue.dellTag(selectVue.packageTag.id);
                    }
                    selectVue.$destroy(true);
                    return true;
                }, {
                    name: '确定'
                }, {
                    class: isAdd ? 'gray' : 'red',
                    name: isAdd ? '取消' : '删除'
                });
            win.open();

            // 标识窗口Vue
            var selectVue = new Vue({
                el: '#package-select-win',
                data: {
                    type: 0, // 0 固定套餐 1 可选套餐
                    packageTag: null, // 标识内容
                    packageGoods: [], // 套餐内容
                    category: [], // 商品列表一级分类
                    child: [], // 商品列表二级分类
                    goods: [], // 商品列表
                    L1ID: 0, // 一级分类
                    L2ID: 0, // 二级分类
                    otherGoods: null
                },
                watch: {
                    'goods': {
                        deep: true,
                        handler: function(val, oldVal) {
                            for(var i = 0; i < val.length; i++) {
                                var num = val[i].packageGoodsNum = parseInt('0' + val[i].packageGoodsNum);
                                if(val[i].keydown) {
                                    val[i].keydown = false;
                                    if(val[i].selected) {
                                        if(num == 0) {
                                            val[i].selected = false;
                                        }
                                    } else {
                                        if(num > 0) {
                                            val[i].selected = true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                methods: {
                    // 固定套餐套餐totalNum的计算方法
                    getGoodsNum: function() {
                        var num = 0;
                        for(var i = 0; i < this.goods.length; i++) {
                            if(this.goods[i].selected) {
                                num += parseInt('0' + this.goods[i].packageGoodsNum);
                            }
                        }
                        return num;
                    },
                    // 计算，并判断数量是否在合范围
                    coutGoodsNum: function() {
                        // 如果是固定套餐，totalNum字段是总分数，固定套餐的是可选数量
                        var num = this.getGoodsNum();
                        if(this.type == 0) {
                            if(this.packageTag) this.packageTag.totalNum = '' + num;
                        } else {
                            if(parseInt('0' + this.packageTag.totalNum) > num) {
                                this.packageTag.totalNum = '' + num;
                            }
                        }
                        return true;
                    },
                    // 一级分类按钮
                    changeL1ID: function(id, i) {
                        this.L1ID = id;
                        this.L2ID = 0;
                        this.child = this.category[i].child ? this.category[i].child : [];
                    },
                    // 二级分类按钮
                    changeL2ID: function(id) {
                        this.L2ID = id;
                    },
                    // 判断是否有商品显示 ，如果有则触发slidUpDown钩子
                    filterChilds: function() {
                        var c = 0;
                        for(var i = 0; i < this.goods.length; i++) {
                            if(this.incategory(this.goods[i].cids)) c++;
                        }
                        return c > 0;
                    },
                    // 判断是否属于一二级分类
                    incategory: function(cids) {
                        if(this.L1ID == 0) return true;
                        if(cids.indexOf(this.L1ID) >= 0 && this.L2ID == 0) {
                            return true;
                        } else if(cids.indexOf(this.L2ID) >= 0) {
                            return true;
                        }
                        return false;
                    },
                    select: function(item) {

                        item.selected = !item.selected;
                        if(parseInt('0' + item.packageGoodsNum) == 0 && item.selected) {
                            item.packageGoodsNum = 1;
                        }
                    },
                    keydown: function(item) {
                        item.keydown = true;
                    },
                    getSelectedGoods: function() {
                        var tagGoods = [];
                        for(var i = 0; i < this.goods.length; i++) {
                            if(this.goods[i].selected) {
                                tagGoods.push({
                                    packageTagId: this.packageTag.id,
                                    gid: this.goods[i].id,
                                    packageGoodsNum: this.goods[i].packageGoodsNum,
                                    goodsName: this.goods[i].goodsName,
                                });
                            }
                        }
                        for(var i = 0; i < this.packageGoods.length; i++) {
                            var find = false;
                            for(var j = 0; j < tagGoods.length; j++) {
                                if(tagGoods[j].gid === this.packageGoods[i].gid) {
                                    find = true;
                                    break;
                                }
                            }
                            if(!find) {
                                tagGoods.push({
                                    packageTagId: this.packageTag.id,
                                    gid: this.packageGoods[i].gid,
                                    packageGoodsNum: 0,
                                    goodsName: this.packageGoods[i].goodsName
                                });
                            }
                        }
                        return tagGoods;
                    }
                }
            });
            
           
            
            // 初始化套餐内容。 0 固定套餐，不显示可选数量
            selectVue.type = parseInt('0' + pVue.good.package.type);
            // 初始化标识窗口Vue数据
            if(isAdd) {
                // 新建标识
                selectVue.packageTag = {
                    newTag: true, // 新建标识标记
                    id: creatPackageTagId(),
                    tagName: "",
                    totalNum: 1
                }
            } else {
                // 编辑标识
                selectVue.packageTag = sd.copy(pVue.$data.good.packageTag[pVue.tagselect]);
                selectVue.packageGoods = sd.copy(pVue.$data.packageTagGoods);
            }

            // 请求分类列表
            sd.request('category/getCategoryList', {
                shopId: userData.currentShop.id,
            }, false, function(json) {
                if(json.error) {
                    alert(json.error.code + '错误', json.error.message);
                } else {
                    selectVue.category = json.data;
                    selectVue.category.unshift({
                        name: "全部",
                        id: 0
                    });
                }
            }, function() {});

            // 筛选当前标识下可选择的商品，已经已经选择的数量
            var goods = sd.copy(listView.type0goods);
//          sd.log(goods);
            for(var i = 0; i < goods.length; i++) {
                var findNum = 0;
                var inOtherTag = false;
                for(var j = 0; j < selectVue.packageGoods.length; j++) {
                    if( selectVue.packageGoods[j].gid === goods[i].id) {
                        if(selectVue.packageTag.id == selectVue.packageGoods[j].packageTagId){
                            findNum = parseInt('0' + selectVue.packageGoods[j].packageGoodsNum);
                            break;
                        }else{
                            inOtherTag = true;
                            break;
                        }
                    }
                }
                if(inOtherTag) {
                    goods.splice(i, 1);
                    i--;
                    continue;
                }
                goods[i].packageGoodsNum = findNum;
                goods[i].selected = findNum > 0 ? true : false;
            }
            selectVue.goods = goods
        };

        // 搜索  Vue
        var serch = new Vue({
            el: '#package-search',
            data: {
                filter: ''
            },
            methods: {
                search: function() {
                    listView.filter = this.filter;
                    ImagLoadCtr.refresh();
                }
            }
        });

        // 套餐显示列表 Vue
        var listView = new Vue({
            el: '#package-list',
            data: {
                imgHost: imgHost,
                filter: '',
                type0goods: [], // 用来制作套餐的商品
                show: -1, //-1 全部，0固定 1可选 
                goods: [], // 套餐数据列表
                page: 0, // 当前页码
                len: 999 // 总条数
            },
            methods: {
                change: function(n) {
                    this.show = n;
                    ImagLoadCtr.refresh();
                },
                addPackage: function() {
                    openPackageWin(true);
                },
                editPackage: function(id, i) {
                    openPackageWin(false, id, i);
                },
                getUnit:function(gid){
                    for(var i=0;i<this.type0goods.length;i++){
                        if(this.type0goods[i].id +'' === gid+''){
                            return this.type0goods[i].unit;
                        }
                    }
                    return '份';
                }
            },
            destroyed: function() {

            }
        });

        // 获取套餐显示列表数据
        sd.request('package/getpackagelist', {}, false, function(json) {
            //sd.log(json);
            if(json.error) {
                alert(json.error.code + '错误', json.error.message);
            } else {
                listView.goods = json.data;
                ImagLoadCtr.refresh();
            }
        }, function(json) {
            alert('错误提示', '请求失败');
        }, 'get');


        // 获取非斤两商品（套餐中只可以选择非斤两菜）
        sdShopServer.goods.getAllGoodsList(100,function(list){
            var type0goods = [];
            for(var i = 0; i < list.length; i++) {
                if(list[i].type + '' === '0') {
                    type0goods.push(list[i]);
                }
            }
            listView.type0goods = type0goods;
        });
    });