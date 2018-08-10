/**
 * @file
 * 桌台管理模块
 *
 * @author daxu.wang
 */
sd.controller([
    'tablemanage.html',
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
    $('#userbox').html(sd.getHtml('tablemanage.html'));
    // 清空search内容
    $('#search').html('');
    // search区域内容
    $('#userbox').append($('#area-show').get(0));

    var Table = new Vue({
        el: '#table-show',
        data: {
            tableList: [],
        },
        methods: {
            openWindow: function(type, id, index) {
                openPackageWin(type, id, index);
            }
        }
    })
 var sortTable = function() {
            var arr = sd.copy(Table.tableList);
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
            Table.tableList = arr.sort(sortTab);
        }
    sd.request("Table/getTable", {
        shopId: userData.currentShop.id
    }, false, function(json) {

        Table.tableList = json.data;
        sortTable();
    }, function(json) {
        alert("请求失败")
    }, "get", false);
    //  一级弹窗  
    // 获取窗口类
    var newWindow = sd.getClass('ui.win');
    // 获取编辑窗口HTML1
    var pwin = $('#table-window');
    var pwinWidth = pwin.outerWidth();
    var pwinHeight = pwin.outerHeight();
    var pwinHtml = pwin.get(0).outerHTML;
    pwin.remove();

    // 开启编辑窗口 type = add | edit
    //id 是桌台id
    //index是索引值
    var openPackageWin = function(type, id, index) {
        var title = (type === 'add' ? '新建桌台' : '编辑桌台');
        // 编辑窗口
        var win = new newWindow(pwinWidth, pwinHeight, title, pwinHtml,
            function(win) {
                //一级弹窗点击确定执行函数
                if(type === 'add') {

                    return creatTable(type);

                } else {
                    return editTable(index)
                }

            },
            //一级弹窗点击取消执行函数
            function(win) {
                if(type === 'add') {

                } else {
                    confirm("温馨提示", "确定要删除吗？", function() {
                        deleteTable(id, index)

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
        var tableWindow = new Vue({
            el: '#' + win.onlyID,
            data: {
                sort: 255,
                minSeat: 1,
                maxSeat: 99,
                Area: [], //区域列表
                getOneTable: {}, //详细区域信息数据
                Index: -1, //顶部区域选择 index
                areaID: 0 //区域id
            },
            methods: {
                getIndex: function() {
                    if(this.areaID != 0 && 　this.Area) {
                        this.Index = findIndex(this.Area, this.areaID);
                    }
                },
                changeIndx: function() {
                    //              	this.Index
                }
            },
            watch: {
                'areaID': 'getIndex',
                'Area': 'getIndex',
                //              'Index':'changeIndex'
            }
        });
        //得到区域列表
        sd.request("Area/getArea", {
            shopId: userData.currentShop.id
        }, false, function(json) {
            if(json.error) {
                alert("请求区域列表错误", json.error.message)
            } else {
                if(type === "edit") {

                }
                tableWindow.Area = json.data;
            }

        }, function(json) {
            alert("请求区域列表失败", json.error.message)
        }, "get", false);

        //判断是修改还是添加 对区域信息数据进行赋值
        if(type === "edit") {
            sd.request("Table/getOneTable", {
                id: id,
                shopId: userData.currentShop.id
            }, false, function(json) {
                if(json.error) {
                    alert('删除错误', json.error.message);
                } else {

                    tableWindow.areaID = sd.copy(json.data.areaId);
                    tableWindow.getOneTable = json.data;
                    tableWindow.sort = sd.copy(json.data.sort);
                    tableWindow.minSeat = sd.copy(json.data.minSeat);
                    tableWindow.maxSeat = sd.copy(json.data.maxSeat);

                }
            }, function(json) {
                alert("获取一条属性失败", json.error.message)
            }, "get", false);
        } else {
            tableWindow.getOneTable = {
                tableName: "", //桌号名称
                normalSeat: 6, //标准席位
                description: "", //描述
            };
        }
        var sortTable = function() {
            var arr = sd.copy(Table.tableList);
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
            Table.tableList = arr.sort(sortTab);
        }
        var creatTable = function(type) {
            var info = sd.copy(tableWindow.getOneTable);
           
            var nameTable = info.tableName+'';
            var regex = /,|，/;

            var arrT = nameTable.split(regex);
        
            info.tableName = "";
            
            for(var i = 0; i < arrT.length; i++){
                if (arrT[i].length > 20) {
                	alert("提示信息","单个桌台名不能超过20个字");return false;
                }
                if (arrT[i] != null && arrT[i] != "") {
                	info.tableName += arrT[i];
                    info.tableName+=",";
                }
                
            }
      
            info.tableName = (info.tableName+"").substring(0,info.tableName.length - 1)
       
            if(tableWindow.Index == -1) {
                alert("操作提示", "请选择区域");
                return false;
            }
            if(info.tableName == "" || 　info.tableName == undefined || info.tableName == null) {
                alert("操作提示", "桌号名不能为空");
                return false;
            }
            var regNormalSeat = info.normalSeat - 0;
            var regNum = /^[0-9]+$/;
            if(regNormalSeat == "" || 　regNormalSeat == undefined || regNormalSeat == null) {
                alert("操作提示", "标准席位不能为空");
                return false;
            }
            if(!regNum.test(regNormalSeat)) {
                alert("操作提示", "标准席位只能是数字");
                return false;
            }
            var min = tableWindow.minSeat - 0;
            var max = tableWindow.maxSeat - 0;

         
            if(max < 0) {
                alert("操作提示", "容纳的最大人数不能小于0");
                return false;
                
            }
            if(!regNum.test(max)) {
                alert("操作提示", "容纳的最大人数只能为整数");
                return false;
            }
          
            if(min < 0) {
                alert("操作提示", "容纳的最小人数不能小于0");
                return false;
                
            }
            if(!regNum.test(min)) {
                alert("操作提示", "容纳的最小人数只能为整数");
                return false;
                
            }
            if(min > max) {
                alert("操作提示", "容纳最大人数不能小于最小人数");
                return false;
            }

            sd.request("Table/createTable", {
                areaId: tableWindow.Area[tableWindow.Index].id,
                shopId: userData.currentShop.id,
                tableName: info.tableName,
                normalSeat: info.normalSeat,
                description: info.description,
                minSeat: tableWindow.minSeat,
                maxSeat: tableWindow.maxSeat,
                sort: tableWindow.sort,
                createUid: userData.user.id
            }, false, function(json) {
                if(json.error) {
                    if(json.error.code + '' === '2012') {
                        alert("创建桌台失败", '桌台名字是唯一的');
                        return false;

                    } else {
                        alert("创建桌台失败", json.error.message);
                        return false;

                    }
                    return false;

                } else {
                    for(var i = 0; i < json.data.length; i++){
                    Table.tableList.push(json.data[i]);
                    sortTable();
                    }
                }
            }, function(json) {

                alert("创建桌台失败", json.error.message)

                return false;

            }, "post", false);
        }

        var editTable = function(index) {
            //          var info = sd.copy(tableWindow.getOneTable);
            var info = tableWindow.getOneTable;
            sd.log(info)
            if(tableWindow.Index == -1) {
                alert("操作提示", "请选择区域");
                return false;
            }
            if(info.tableName == "" || 　info.tableName == undefined || info.tableName == null) {
                alert("操作提示", "桌号名不能为空");
                return false;
            }
            var regNormalSeat = info.normalSeat - 0;

            var regNum = /^[0-9]+$/;
            if(!regNum.test(regNormalSeat)) {
                alert("操作提示", "请输入正确的标准席位(只能是数字)");
                return false;
            }

            var min = tableWindow.minSeat-0;
            var max = tableWindow.maxSeat-0;
            
            
            if(max < 0) {
                alert("操作提示", "容纳的最大人数不能小于0");
                return false;
                
            }
            
            if(!regNum.test(max)) {
              alert("操作提示", "容纳的最大人数只能为整数");
             return false;
                
            }
            if(min < 0) {
                alert("操作提示", "容纳的最小人数不能小于0");
                return false;
                
            }
            if(!regNum.test(min)) {
                alert("操作提示", "容纳的最小人数只能为整数");
                return false;
                
            }
            if(min > max) {
                alert("操作提示", "容纳最大人数不能小于最小人数");
                return false;
            }
            
            sd.request("Table/editTable", {
                areaId: tableWindow.Area[tableWindow.Index].id,
                id: id,
                tableName: info.tableName,
                normalSeat: info.normalSeat,
                description: info.description,
                minSeat: tableWindow.minSeat,
                maxSeat: tableWindow.maxSeat,
                sort: tableWindow.sort,
                updateUid: userData.user.id
            }, false, function(json) {
                if(json.error) {
                    alert("修改桌台失败", json.error.message)
                    return false;
                } else {

                    Table.tableList.$set(index,json.data);
                    sortTable();

                }
            }, function(json) {
                alert("修改失败", json.error.message);
                return false;
            }, "post", false);
        }
        var deleteTable = function(id, index) {
            sd.request("Table/delTable", {
                shopId: userData.currentShop.id,
                id: id
            }, false, function(json) {
                if(json.error) {
                    alert("提示信息", json.error.message);
                    return false;
                }
                Table.tableList.splice(index, 1);

            }, function(json) {
                alert("删除", json.error.message)
            }, "get", false);
        }
        var findIndex = function(obj, id) {
            for(var i = 0; i < obj.length; i++) {
                if(obj[i].id + "" == id + "") {
                    return i;
                }
            }
            return -1;
        }
    }
});