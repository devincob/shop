/**
 * @file
 * 库存预警模块
 *
 * @author daxu.wang
 */
sd.controller([
    'areamanage.html',
    'js/sd/ui/win.js'
], function() {
    // 获取登录信息
    var userData = sd.session("userShop");
    if(userData && userData.accessToken && userData.currentShop) {
        sd.send.token = userData.accessToken;
        sd.send.shopId = userData.currentShop.id;
    } else {
        sd.controller(['js/sd/login.js']);
        return;
    }

    var userId = userData.user.id;

    $('#userbox').html('');
    // 加载admin模块html到页面
    $('#userbox').html(sd.getHtml('areamanage.html'));
    // 清空search内容
    $('#search').html('');
    // search区域内容
    $('#userbox').append($('#area-show').get(0));

    var Area = new Vue({
        el: '#area-show',
        data: {
            add: false,
            dataList: [],
            num: 1
        },
        methods: {
            openWindow: function(type, areaId, index) {
                openPackageWin(type, areaId, index);
            },
            areaSort : function(key){
                return function(a,b){
                    var value1 = parseInt(a[key]);
                    var value2 = parseInt(b[key]);
                    if(value1 > value2){
                        return 1;
                    }else if(value1 < value2){
                        return -1;
                    }else{
                        return 0;
                    }
                }
            }
        }
    })

    sd.request("Area/getArea", {
        shopId: userData.currentShop.id
    }, false, function(json) {

        Area.dataList = json.data;

    }, function(json) {
        alert("请求失败")
    }, "get", false);
    //  一级弹窗  
    // 获取窗口类
    var newWindow = sd.getClass('ui.win');
    // 获取编辑窗口HTML1
    var pwin = $('#area-window');
    var pwinWidth = pwin.outerWidth();
    var pwinHeight = pwin.outerHeight();
    var pwinHtml = pwin.get(0).outerHTML;
    pwin.remove();
    // 开启编辑窗口 type = add | edit
    var openPackageWin = function(type, areaId, index) {
        var title = (type === 'add' ? '新建区域' : '编辑区域');
        // 编辑窗口
        var win = new newWindow(pwinWidth, pwinHeight, title, pwinHtml,
            function(win) {
                //一级弹窗点击确定执行函数
                if(type === "add") {
                    creatArea();
                } else {
                    editArea(areaId, index)
                }
            },
            //一级弹窗点击取消执行函数
            function(win) {
                if(type === "edit") {
                    confirm("操作提示", "你确定要删除吗？", function() {
                        delectArea(areaId, index);
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
        var AreaWin = new Vue({
            el: '#' + win.onlyID,
            data: {
                getOneArea: []
            },
            methods: {

            },
            watch: {

            }
        });
        var getOneAreaInfo = function(type, areaId) {

            if(type === "edit") {
                sd.request("Area/getOneArea", {
                    shopId: userData.currentShop.id,
                    id: areaId
                }, false, function(json) {
                    if(json.error) {
                        alert("提示", json.error.message)
                    } else {
                        sd.log(json.data);
                        AreaWin.getOneArea = sd.copy(json.data)
                    }
                }, function(json) {
                    alert(json.error.message);
                }, "get", false);
            } else {
                var info = {
                    areaName: "", //区域名
                    description: "", //描述
                    sort: 1
                }
                AreaWin.getOneArea = sd.copy(info);
            }
        };
        getOneAreaInfo(type, areaId)
        var editArea = function(areaId, index) {
            var info = sd.copy(AreaWin.getOneArea);
            sd.request("Area/editArea", {
                shopId: userData.currentShop.id,
                id: areaId,
                areaName: info.areaName,
                description: info.description,
                sort: info.sort,
                updateUid: userData.user.id
            }, false, function(json) {
                if(json.error) {
                    alert(json.error.code + "错误", json.error.message)
                } else {
                    var info = sd.copy(json.data);
                    Area.dataList[index].areaName = info.areaName;
                    Area.dataList[index].description = info.description;
                    Area.dataList[index].sort = info.sort;
                    //Area.dataList.$set(index,json.data);
                    sd.log(Area.dataList)
                    Area.dataList.sort(Area.areaSort('sort'));
                }

            }, function(json) {
                alert(json.error.code + "错误",json.error.message);
            }, "post", false);

        }
        var creatArea = function() {
            var info = sd.copy(AreaWin.getOneArea);
            sd.request("Area/createArea", {
                shopId: userData.currentShop.id,
                areaName: info.areaName,
                description: info.description,
                sort: info.sort,
                createUid: "1"
            }, false, function(json) {
                
                if(json.error) {
                    alert(json.error.code + "错误", json.error.message)
                } else {
                   Area.dataList.push(json.data);
                   Area.dataList.sort(Area.areaSort('sort'));
                }
                
            }, function(json) {
                alert(json.error.code + "错误",json.error.message);
            }, "post", false);
        }
        var delectArea = function(areaId, index) {
            sd.request("Area/delArea", {
                shopId: userData.currentShop.id,
                id: areaId
            }, false, function(json) {
 if(json.error) {
                    alert(json.error.code + "错误", json.error.message)
                } else {
                    Area.dataList.splice(index, 1);
                }
              

            }, function(json) {
                alert(json.error.code + "错误",json.error.message);
            }, "get", false);

        }
    }
});