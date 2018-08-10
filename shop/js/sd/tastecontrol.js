/**
 * @file
 * 口味管理模块
 *
 * @author daxu.wang
 */
sd.controller([
        'tastecontrol.html',
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
        $('#userbox').html(''); // 加载admin模块html到页面
        $('#userbox').html(sd.getHtml('tastecontrol.html')); // 清空search内容
        $('#search').html(''); // search区域内容
        $('#userbox').append($('#taste-show').get(0));

        // 获取窗口类
        var newWindow = sd.getClass('ui.win');
        // 获取编辑窗口HTML1
        var pwin = $('#tas-addtas1');
        var pwinWidth = pwin.outerWidth();
        var pwinHeight = pwin.outerHeight();
        var pwinHtml = pwin.get(0).outerHTML;
        pwin.remove();
        // 获取编辑窗口HTML2
        var pwin2 = $('#tas-addtas2');
        var pwinWidth2 = pwin2.outerWidth();
        var pwinHtml2 = pwin2.get(0).outerHTML;
        pwin2.remove();
       
        var tasteClassVue = new Vue({
            el: '#taste-show',
            data: {
                taste: []
            },
            methods: {
                addOpenPageWin: function() {
                    openPackageWin('add');
                },
                editOpenPageWin: function(id) {
                    var index = 0;
                    for(var i = 0; i < this.taste.length; i++) {
                        if(this.taste[i].id == id) {
                            index = i;
                            break;
                        }
                    }
                    openPackageWin('edit', id, index);

                },
                addTaste: function(create, callback, failback) {
                    sd.request("Attr/createAttr", {
                        shopId: create.shopId, //店铺id
                        name: create.tasteName, //属性名称
                        options: create.options, //选项内容（口味）
                        sort: create.sort, //排序
                        attr: create.Attr, //属性 多选还是单选
                        create_uid: create.creatId, //创建id
                        goods: create.goodsID, //关联商品的id
                    }, false, function(json) {
                        //返回的data数据 添加到初始页面中去 实现数据更新        
                        if(json.error) {
                            if($.isFunction(callback)) callback(json.error.message);
                            alert(json.error.code + '错误', json.error.message);
                            return false;
                        } else {

                            if($.isFunction(callback)) callback(json.data);
                            tasteClassVue.taste.push(json.data);
                            sortTaste();
                        }
                    }, function(json) {
                        alert(json.error.code + '错误', json.error.message);
                        return false;
                    }, "post", false)
                },
                editTaste: function() {

                }

            }
        });
        //从后台获取数据得到所有的口味名
        //从后台获取数据
        sd.request("Attr/getAttr", {
            shopId: userData.currentShop.id
        }, false, function(json) {
            // 编辑窗口Vue

            tasteClassVue.taste = json.data;

        }, function(json) {

        }, "get");

        // 开启编辑窗口 type = add | edit
        var openPackageWin = function(type, cid, index) {
            var title = (type === 'add' ? '添加口味' : '编辑口味');

            // 编辑窗口
            var win = new newWindow(pwinWidth, pwinHeight, title, pwinHtml,
                function(win) {
                    //一级弹窗点击确定执行函数
                    var numString =  /^[^\'\’\“\"\&]*$/;
                    var num = /^\d+(\.\d+)?$/;
                    var isIdentical = function(arr) {
                        if(arr != undefined || arr != null) {
                            arr = sd.copy(arr);
                            var obj = {};
                            for(var i = 0; i < arr.length; i++) {
                                if(!obj[arr[i][0]]) {
                                    obj[arr[i][0]] = "yes";
                                } else {
                                    return false;
                                }
                            }
                            return true;
                        }
                    }
                    if(type === 'add') {
                        var tasteInfo = sd.copy(tasteVue1.$data);

                        var create = tasteAdd(tasteInfo);

                        //表单验证
                        var opArr = [];
                        if(create.options == null || create.options == "") {
                            alert("提示信息", "一定要有一条口味名称")
                            return false;
                        }
                        opArr = create.options.split("|");

                        var tastes = false; //口味
                        var tasArr = false; //口味分组
                        var price = false; //口味价格
                        var tasteArr = [];
                        for(var i = 0; i < opArr.length; i++) {
                            opArr[i] = opArr[i].split(":");
                            if(opArr[i][0] == '' || opArr[i][0] == null || opArr[i][0] == undefined) {
                                alert("提示信息", "口味名称不能为空");
                                return false;
                            }
                            if(!numString.test(opArr[i][0])) {
                                tasteArr.push(opArr[i][0])
                                tasArr = true;
                            } else if(!num.test(opArr[i][1] - 0)) {

                                price = true;
                            }
                        }

                        if(!numString.test(create.tasteName)) {
                            tastes = true;
                        }
                        if(create.tasteName == "" || create.tasteName == null) {
                            alert("提示信息", "口味分组名称不能为空");
                            return false;
                        }
                        //                      判断口味不能为重复的 也就是newObj
                        else if(!isIdentical(tasteArr)) {
                            alert("提示信息", "口味名称不能重复");
                            return false;
                        } else if(tasArr) {
                            alert("提示信息", "口味名称不能含有&和引号");
                            return false;

                        } else if(tastes) {
                            alert("提示信息", "口味分组名称不能含有&和引号");
                            return false;
                        } else if(price) {
                            alert("提示信息", "口味的价格只能是数字哦");
                            return false;
                        } else {

                            tasteClassVue.addTaste(create, function(info) {
                                sd.log(info)
                                if(info == false) {
                                    return false;
                                }

                            })

                        }
                    } else {
                        //修改数据
                        var tasteInfoEdit = sd.copy(tasteVue1.$data);

                        var update = tasteEdit(tasteInfoEdit);
                        if(!update) return false;

                        var opArr = [];

                        if(update.options == null || update.options == "") {
                            alert("提示信息", "要有一条口味名称")
                            return false;
                        }
                        opArr = update.options.split("|");
                        //                  update=update.trim();

                        var tastes = false; //口味
                        var tasArr = false; //口味分组
                        var price = false; //口味价格
                        var tasArrNull = false;
                        //                  var numString = /^[0-9a-zA-Z \（\）\(\)\u4e00-\u9fa5]+$/;
                        //                  var num = /^\d+(\.\d+)?$/;
                        for(var i = 0; i < opArr.length; i++) {
                            opArr[i] = opArr[i].split(":");

                            if(opArr[i][0] == null || opArr[i][0] == "") {
                                tasArrNull = true;
                            }
                            if(!numString.test(opArr[i][0])) {
                                tasArr = true;
                            } else if(!num.test(opArr[i][1] - 0)) {
                                price = true;
                            }
                        }
                        sd.log('----------------')
                        sd.log(update.options);
                        if(!numString.test(update.tasteName)) {
                            tastes = true;
                        }
                        if(update.tasteName == "" || update.tasteName == null) {
                            alert("提示信息", "口味分组名称不能为空");
                            return false;

                        } else if(!isIdentical(opArr)) {
                            alert("提示信息", "口味名称不能重复");
                            return false;
                        } else if(tasArrNull) {
                            alert("提示信息", "口味名称不能为空");
                            return false;
                        } else if(tasArr) {
                            alert("提示信息", "口味名称不能含有&和引号");
                            return false;
                        } else if(tastes) {
                            alert("提示信息", "口味分组名称不能含有&和引号");
                            return false;
                        } else if(price) {
                            alert("提示信息", "口味的价格只能是数字哦");
                            return false;
                        } else {

                            sd.request("Attr/editAttr", {
                                id: update.tasteId, //口味id

                                name: update.tasteName, //属性名称
                                options: update.options, //选项内容（口味）
                                sort: update.sort, //排序
                                attr: update.Attr, //属性 多选还是单选
                                update_uid: update.creatId, //创建id
                                goods: update.goodsID, //关联商品的id
                            }, false, function(json) {
                                //返回的data数据 添加到初始页面中去 实现数据更新
                                if(json.error) {
                                    alert(json.error.code + '错误', json.error.message);
                                } else {
                                    tasteClassVue.taste.$set(index, json.data);
                                    sortTaste();

                                }
                            }, function(json) {
                                sd.log(json);
                                return false;
                            }, "post", false)
                        }
                    }
                    return true;
                },
                //一级弹窗点击取消执行函数
                function(win) {
                    if(type === 'add') {

                    } else {
                        //删除
                        confirm("操作提示", "确定删除口味？", function() {
                            sd.request("Attr/delAttr", {
                                id: tasteVue1.tasteId,
                                shopId: userData.currentShop.id

                            }, false, function() {

                                for(var i = 0; i < tasteClassVue.taste.length; i++) {
                                    if(tasteClassVue.taste[i].id == tasteVue1.tasteId) {
                                        tasteClassVue.taste.$remove(tasteClassVue.taste[i]);
                                        sortTaste();
                                        break;
                                    }
                                }
                            }, function() {
                                alert(json.error.code + '错误', '删除失败');
                                return false;
                            }, "get", false)
                        })
                    }
                    return true;
                }, {
                    class: 'yellow',
                    name: type === 'add' ? '添加' : '保存'
                }, {
                    class: type === 'add' ? 'gray' : 'red',
                    name: type === 'add' ? '取消' : '删除'
                });
            win.open('right');

            // 编辑一级弹窗Vue数据
            var tasteVue1 = new Vue({
                el: '#tas-addtas1',
                data: {
                    tasteId: 1,
                    tasteClass: [],
                    selectedArr: [], //二级弹窗选中的商品  (xiugai)     
                    selectedGoodsID: [], //二级弹窗商品被选中(tianjia)
                    types: 0,
                    Attr: 0, //单选还是多选
                    type: type,
                    objs: [], //编辑的口味
                    newObj: [
                        ["", ""]
                    ], //添加的口味
                    newTaste: "", //添加新的口味名称
                    sort: 1,
                    isAdd: false,
                    aboutFood: [] //关联菜品的id
                },
                methods: {
                    openSecond: function() {
                        openSecondWindow(this);
                    },
                    deleteTaste: function(type, i) {

                        if(type === "add") {

                            confirm("操作提示", "确定删除口味？", function() {
                                tasteVue1.newObj.splice(i, 1);

                            })
                        } else {
                            confirm("操作提示", "确定删除口味？", function() {

                                tasteVue1.objs.splice(i, 1);
                            })
                        }
                    },
                    append: function() { //点击添加空的数据    
                        var newArr = ["", ""];
                        if(type != "add") {
                            for(var i = 0; i < this.objs.length; i++) {
                                if(this.objs[i][1] === '' || this.objs[i][1] == null) {
                                    this.objs[i][1] = 0;

                                }
                            }
                            this.objs.push(newArr);
                        } else {
                            for(var i = 0; i < this.newObj.length; i++) {
                                if(this.newObj[i][1] === '' || this.newObj[i][1] == null) {
                                    this.newObj[i][1] = 0;
                                }
                            }
                            this.newObj.push(newArr);
                        }

                    },

                    changeType: function() {
                        if(this.Attr == 0) {
                            this.Attr = 1;
                        } else {

                            this.Attr = 0;

                        }

                    }
                }
            });

            //通过index 来请求对应口味的数据    
            sd.request("Attr/getOneAttr", {
                id: cid,
                shopId: userData.currentShop.id

            }, false, function(json) {

                //处理json里面的options
                if(type != "add") {
                    var optionsJson = json.data.options.split("|");
                    obj = [];
                    for(var i = 0; i < optionsJson.length; i++) {
                        obj.push(optionsJson[i].split(":"));
                    }
                    tasteVue1.objs = obj;
                    tasteVue1.sort = json.data.sort;
                    tasteVue1.Attr = json.data.attr;
                    tasteVue1.tasteId = json.data.id;
                    tasteVue1.aboutFood = json.data.goods;

                } else {
                    tasteVue1.aboutFood = [];

                }
                tasteVue1.tasteClass = json.data;
                if(tasteVue1.aboutFood && tasteVue1.aboutFood.length > 0) {

                    for(var i = 0; i < tasteVue1.aboutFood.length; i++) {
                        tasteVue1.selectedGoodsID.push(tasteVue1.aboutFood[i].gid);
                        tasteVue1.selectedArr.push(tasteVue1.aboutFood[i].goodsName);
                        tasteVue1.selectedArr = $.unique(tasteVue1.selectedArr);
                    }
                }
            }, function(json) {

            }, "get");

        }

        //开启二级弹窗
        var openSecondWindow = function(pvue) {
            //清除已经保存选中数据

            // 编辑窗口
            var win = new newWindow(pwinWidth2, "auto", "添加关联菜品", pwinHtml2,
                //点击确定回调函数
                function(win) {
                    pvue.selectedArr = sd.copy(tasteVue2.selectedArr) //把二级弹窗选择的菜品名字整合一起

                    pvue.selectedGoodsID = tasteVue2.selectedGoodsID;
                    return true;
                },
                //点击取消回调函数
                function(win) {

                    return true;
                }, {
                    class: 'yellow',
                    name: '添加'
                }, {
                    name: '取消'
                });
            win.open();
            // 编辑窗口Vue
            var tasteVue2 = new Vue({
                el: '#tas-addtas2',
                data: {
                    category: [], // 商品列表一级分类
                    child: [], // 商品列表二级分类
                    goods: [], // 商品列表
                    List1ID: 0, // 一级分类
                    List2ID: 0, // 二级分类
                    selectedGoodsID: sd.copy(pvue.$data.selectedGoodsID), //已经被选中的菜品（点击对应口味里面已经存在的）
                    selectedArr: sd.copy(pvue.$data.selectedArr)
                },
                methods: {
                    changeL1ID: function(id, i) {
                        this.List1ID = id;
                        this.List2ID = 0;
                        this.child = this.category[i].child ? this.category[i].child : [];
                    },
                    changeL2ID: function(id) {
                        this.List2ID = id;
                    },
                    addGoodsID: function(id, goodsName) { //点击添加
                        console.log("-----------------id----------------")
                        sd.log(id)
                        sd.log(goodsName);
                        console.log("-----------------id----------------")

                        if(this.isSave(id, this.selectedGoodsID) && this.isSave(goodsName, this.selectedArr)) {
                            this.selectedGoodsID.push(id);
                            this.selectedArr.push(goodsName);
                        }

                        //                      var Garr = sd.copy(this.selectedGoodsID);
                        //                      this.selectedGoodsID = $.unique(Garr);
                        //                      var Narr = sd.copy(this.selectedArr);
                        //                      this.selectedArr =  $.unique(Narr);
                    },
                    isSave: function(id, arr) {
                        //                      arr = sd.copy(arr);
                        var obj = {};
                        for(var i = 0; i < arr.length; i++) {
                            if(!obj[arr[i]]) {
                                obj[arr[i]] = 666;
                            }
                        }
                        if(obj[id]) {
                            return false;
                        }
                        return true;
                    },
                    deleteGoodsId: function(id, goodsName) {
                        this.selectedGoodsID.$remove(id);
                        this.selectedArr.$remove(goodsName);
                    },
                    selectAllGoods: function() {
                        for(var i = 0; i < this.goods.length; i++) {
                            if(this.List1ID == 0) {
                                this.addGoodsID(this.goods[i].id, this.goods[i].goodsName);
                            } else if(this.goods[i].cids.indexOf(this.List1ID) >= 0 && this.List2ID == 0) {
                                this.addGoodsID(this.goods[i].id, this.goods[i].goodsName);
                            } else if(this.goods[i].cids.indexOf(this.List2ID) >= 0) {
                                this.addGoodsID(this.goods[i].id, this.goods[i].goodsName);
                            }
                        }
                    },
                    unSelectAllGoods: function() {
//                      this.selectedGoodsID = [];
//                      this.selectedArr = [];
                         for(var i = 0; i < this.goods.length; i++) {
                            if(this.List1ID == 0) {
                                this.deleteGoodsId(this.goods[i].id, this.goods[i].goodsName);
                            } else if(this.goods[i].cids.indexOf(this.List1ID) >= 0 && this.List2ID == 0) {
                                this.deleteGoodsId(this.goods[i].id, this.goods[i].goodsName);
                            } else if(this.goods[i].cids.indexOf(this.List2ID) >= 0) {
                                this.deleteGoodsId(this.goods[i].id, this.goods[i].goodsName);
                            }
                        }
                    },
                    incategory: function(cids) {
                        if(this.List1ID == 0) return true;
                        if(cids.indexOf(this.List1ID) >= 0 && this.List2ID == 0) {
                            return true;
                        } else if(cids.indexOf(this.List2ID) >= 0) {
                            return true;
                        }
                        return false;
                    },
                    filterChilds: function() {
                        var c = 0;
                        for(var i = 0; i < this.goods.length; i++) {
                            if(this.incategory(this.goods[i].cids)) c++;
                        }
                        return c > 0;
                    },
                    isselected: function(id) { //判断一级弹窗上的关联菜品 是否在二级弹窗显示
                        if(this.selectedGoodsID.indexOf(id) == -1) {
                            return false;
                        } else {
                            return true;
                        }
                    }

                }
            });

            // 请求分类列表
            sd.request('category/getCategoryList', {
                shopId: userData.currentShop.id,
            }, false, function(json) {
                if(json.error) {
                    alert(json.error.code + '错误', json.error.message);
                } else {
                    tasteVue2.category = json.data;
                    tasteVue2.category.unshift({
                        name: "全部",
                        id: 0
                    });
                }

            }, function(json) {
                alert(json.error.code + '错误', '请求失败');
            });

            // 请求商品列表
            sd.request('goods/getGoodsList', {
                shopId: userData.currentShop.id,
                page: 1,
                num: 9999
            }, false, function(json) {
                if(json.error) {
                    alert(json.error.code + '错误', json.error.message);
                } else {
                    tasteVue2.goods = json.data.list;
                }

            }, function(json) {
                alert(json.error.code + '错误', '请求失败');
            }, "get", false);

        };

        var tasteAdd = function(tasteVue1) { //添加 新口味需要的参数
            var tasteInfoCreat = {
                shopId: userData.currentShop.id, //店铺ID
                tasteName: "", //口味名称
                options: "", //选项内容(口味及口味价格)
                sort: 250, //sort排序
                Attr: tasteVue1.Attr, //属性（单选多选）
                creatId: userData.user.id, //创建者ID     
                goodsID: 0 //商品的id
            };
            var str = "";
            //  var vuel1 = sd.copy(tasteVue1.$data);
            var vuel1 = tasteVue1;
            //判断新添加的口味不能为重复的

            for(var i = 0; i < vuel1.newObj.length; i++) {
                vuel1.newObj[i][0] = vuel1.newObj[i][0].replace(" ", '');
                if(vuel1.newObj[i][1]) {
                    if(parseInt(vuel1.newObj[i][1]) == 0) {
                        vuel1.newObj[i][1] = 0;
                    }
                    vuel1.newObj[i][1] = vuel1.newObj[i][1] + "";
                    vuel1.newObj[i][1] = vuel1.newObj[i][1].toFloatStr(2);
                    if(vuel1.newObj[i][1].indexOf('.') >= 0) {
                        var numZ = (vuel1.newObj[i][1].split(".")[1]) + '';
                        numZ = ("0." + numZ) - 0;
                        vuel1.newObj[i][1] = (vuel1.newObj[i][1].split(".")[0] - 0) + numZ;
                    }
                    str += vuel1.newObj[i][0] + ":" + vuel1.newObj[i][1] + "|";
                } else {
                    str += vuel1.newObj[i][0] + ":" + "0" + "|";

                }
            }
            tasteInfoCreat.options = str.substring(0, str.length - 1); //新添加的口味
            tasteInfoCreat.tasteName = vuel1.newTaste; //获取到新添加的属性名
            tasteInfoCreat.sort = vuel1.sort; //获取到新添加的sort
            tasteInfoCreat.Attr = vuel1.Attr; //获取到新添加的Attr
            var haha = "";
            for(var i = 0; i < vuel1.selectedGoodsID.length; i++) {
                haha += vuel1.selectedGoodsID[i] + ",";

            }
            tasteInfoCreat.goodsID = haha.substring(0, haha.length - 1); //获取到新添加的 商品信息
            return tasteInfoCreat;
        }

        var tasteEdit = function(tasteVue1) { //修改 口味需要的参数
            var tasteInfoUpdate = {
                tasteId: tasteVue1.tasteId, //属性id
                sort: 250, //sort排序
                tasteName: "", //口味名称
                options: "", //口味及口味价格
                Attr: tasteVue1.Attr, //单选多选
                updataId: userData.user.id, //记录修改者的ID 
                goodsID: 0 //商品的id
            };
            var str = "";
            var vuel1 = tasteVue1;

            for(var i = 0; i < vuel1.objs.length; i++) {
                if(vuel1.objs[i][0] == null || vuel1.objs[i][0] == '' || vuel1.objs[i][0] == undefined) {
                    alert("提示信息", "口味名称的不能为空");
                    return false;
                } else {
                    vuel1.objs[i][1] = vuel1.objs[i][1].trim();
                    vuel1.objs[i][0] = vuel1.objs[i][0].replace(" ", '');

                    if(vuel1.objs[i][1]) {
                        if(parseInt(vuel1.objs[i][1]) == 0) {
                            vuel1.objs[i][1] = '0';
                        }
                        vuel1.objs[i][1] = vuel1.objs[i][1] + "";
                        vuel1.objs[i][1] = vuel1.objs[i][1].toFloatStr(2);

                        if(vuel1.objs[i][1].indexOf('.') >= 0) {
                            var numZ = (vuel1.objs[i][1].split(".")[1]) + '';
                            numZ = ("0." + numZ) - 0;
                            vuel1.objs[i][1] = (vuel1.objs[i][1].split(".")[0] - 0) + numZ;
                        }
                        str += vuel1.objs[i][0] + ":" + vuel1.objs[i][1] + "|";
                    } else {
                        str += vuel1.objs[i][0] + ":" + "0" + "|";
                    }
                }
            }
            tasteInfoUpdate.options = str.substring(0, str.length - 1); //bianji的口味
            tasteInfoUpdate.tasteName = vuel1.tasteClass.name; //获取到更改的属性名
            tasteInfoUpdate.sort = vuel1.sort; //获取到更改的sort
            tasteInfoUpdate.Attr = vuel1.Attr; //获取到更改的Attr
            tasteInfoUpdate.creatId = userData.user.id; //获取到更改的 creatId
            var haha = "";
            for(var i = 0; i < vuel1.selectedGoodsID.length; i++) {
                haha += vuel1.selectedGoodsID[i] + ",";
            }
            tasteInfoUpdate.goodsID = haha.substring(0, haha.length - 1); //获取到新添加的 creatId

            return tasteInfoUpdate;
        };
        var sortTaste = function() {
            var arr = sd.copy(tasteClassVue.taste);
            var sortTab = function(a, b) {
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
            tasteClassVue.taste = arr.sort(sortTab);
        }
    });