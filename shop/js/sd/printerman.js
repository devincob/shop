/**
 * @file
 * 打印机管理
 *
 * @author guan.sun
 */
sd.controller([
        'printerman.html',
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
        $('#userbox').html(sd.getHtml('printerman.html'));

        // 获取表单 
        var cform = $('.print-form');
        // 获取可视区域宽度 
        var cformWidth = cform.outerWidth()
            // 获取可视区域高度
        var cformHeight = cform.outerHeight();
        var domcache = $('<div></div>');

        // 将表单添加至domcache中 
        domcache.append(cform);
        
        
        // 打印机 vue
        var printer = new Vue({
            el: '#printer',
            data: {
                printerList: []
            },
            methods: {
                openWin: function(pid, types, index) {
                    openAddEidteWin(pid, types, index);
                },
                printerSort : function(key){
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
        });

        var openAddEidteWin = function(pid, types, index) {
            var title = (types == 'addPrint') ? '新建打印机' : '修改打印机';
            var myWin = new Win(cformWidth, 'auto', title, cform.clone().get(0), function(win) {
                var ip = /^([1-9]|[1-9]\d|1\d{2}|2[0-1]\d|22[0-3])(\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])){3}$/;
                if(myWin.printerName == '') {
                    alert('错误提示', '请输入名称！');
                    return false;
                }
                if(myWin.ip != '') {
                    if(!ip.test(myWin.ip)) {
                        alert('错误提示', 'ip段格式错误！');
                        return false;
                    }
                } else {
                    alert('错误提示', 'ip段不能为空！');
                    return false;
                }
                if(myWin.maxLen != '') {
                    if(isNaN(myWin.maxLen)) {
                        alert('错误提示', '字款格式错误！');
                        return false;
                    }
                    if(myWin.maxLen == '0') {
                        alert('错误提示', '字款不能为0！');
                        return false;
                    }
                } else {
                    alert('错误提示', '字款不能为空！');
                    return false;
                }

                if(types == 'addPrint') {
                    // 添加打印机
                    sd.request('printer/addPrinter', {
                        shopId: userData.currentShop.id,
                        createUid: userData.user.id,
                        printerName: myWin.printerName,
                        ip: myWin.ip,
                        maxLen: myWin.maxLen,
                        type: myWin.type,
                        sort: myWin.num
                    }, false, function(json) {
                        if(json.error) {
                            alert(json.error.code + '错误', json.error.message);
                        } else {
                            printer.printerList.push(json.data);
                        }
                    }, function() {
                        if(json.error){
                            alert(json.error.code + '错误', json.error.message);
                        }else{
                            alert('提示信息','接口报错了！');   
                        }
                    }, 'post');
                } else {
                    // 修改打印机设置
                    sd.request('printer/editPrinter', {
                        printerId: pid,
                        shopId: userData.currentShop.id,
                        updateUid: userData.user.id,
                        printerName: myWin.printerName,
                        ip: myWin.ip,
                        maxLen: myWin.maxLen,
                        type: myWin.type,
                        sort: myWin.num
                    }, false, function(json) {
                        if(json.error) {
                            alert(json.error.code + '错误', json.error.message);
                        } else {
                            printer.printerList.$set(index, json.data);
                            printer.printerList.sort(printer.printerSort('sort'));
                        }
                    }, function(json) {
                        if(json.error){
                            alert(json.error.code + '错误', json.error.message);
                        }else{
                            alert('提示信息','接口报错了！');   
                        }
                    }, 'post');
                }
            }, function(win) {
                if(types == 'edit') {
                    confirm('操作提示', '确认删除打印机？', function() {
                        // 删除打印机
                        sd.request('printer/deletePrinter', {
                            shopId: userData.currentShop.id,
                            printerId: pid
                        }, false, function(json) {
                            if(json.error) {
                                alert(json.error.code + '错误', json.error.message);
                            } else {
                                var item = printer.printerList;
                                for(var i = 0; i < item.length; i++) {
                                    if(item[i].id == pid) {
                                        item.$remove(item[i]);
                                    }
                                }
                                alert('提示信息','删除成功！'); 
                            }
                            win.close();
                        });
                    }, function() {
                    });
                }
                return true;
            }, {
                class: 'yellow',
                name: types == 'addPrint' ? '确定' : '保存'
            }, {
                class: types === 'addPrint' ? 'gray' : 'red',
                name: types == 'addPrint' ? '取消' : '删除'
            });
            myWin.open("right");

            if(types == 'edit') {
                // 获取打印机信息
                sd.request('printer/getPrinterById', {
                    shopId: userData.currentShop.id,
                    printerId: pid
                }, false, function(json) {
                    if(json.error) {
                        alert(json.error.code + '错误', json.error.message);
                    } else {
                        myWin.printerName = json.data.printerName;
                        myWin.ip = json.data.ip;
                        myWin.maxLen = json.data.maxLen;
                        myWin.type = parseInt(json.data.type);
                        myWin.num = json.data.sort;
                    }
                }, function(json) {
                    if(json.error){
                        alert(json.error.code + '错误', json.error.message);
                    }else{
                        alert('提示信息','接口报错了！');   
                    }
                });
            }

            //创建修改 vue
            var myWin = new Vue({
                el: '#' + myWin.onlyID,
                data: {
                    list: [{
                        name: '网口打印机'
                    }],
                    type: 0,
                    num: 255,
                    printerName: '',
                    ip: '',
                    maxLen: ''
                }
            });
        };

        // 请求打印机列表
        sd.request('printer/getPrinterList', {
            shopId: userData.currentShop.id
        }, false, function(json) {
            if(json.error){
                alert(json.error.code + '错误', json.error.message);
            }else{
                printer.printerList = json.data; 
                printer.printerList.sort(printer.printerSort('sort'));
            }
        }, function(json) {
            if(json.error){
                alert(json.error.code + '错误', json.error.message);
            }else{
                alert('提示信息','接口报错了！');   
            }
        });
    });