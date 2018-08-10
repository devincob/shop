/**
 * @file
 * 职位管理
 *
 * @author chenggong.jiang
 */
sd.controller([
        'jobmanage.html',
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
        // 清空容器内容
        $('#userbox').html('');
        // 加载admin模块html到页面
        $('#userbox').html(sd.getHtml('jobmanage.html'));

        //      // 清空search内容
        //      $('#search').html('');
        //      // search区域内容
        //      $('#search').append($('#job-search').get(0));

        // 获取窗口类
        var CWin = sd.getClass('ui.win');

        // 获取编辑窗口，缓存HTML，并移除显示列表中的HTML
        var pwin = $('#jobWin');
        var pwinWidth = pwin.outerWidth();
        var pwinHeight = pwin.outerHeight();
        var pwinHtml = pwin.get(0).outerHTML;
        pwin.remove();

        // 获取编辑窗口，缓存HTML，并移除显示列表中的HTML
        var cwin = $('#permissionsWin');
        var cwinWidth = cwin.outerWidth();
        var cwinHeight = cwin.outerHeight();
        var cwinHtml = cwin.get(0).outerHTML;
        cwin.remove();
        
        var oldName = "";
        // 开启职位新增或者修改窗口
        var openJobWin = function(isAdd, editId, editIndex) {
            var title = (isAdd ? '新建职位' : '修改职位');
            var win = new CWin(
                pwinWidth,
                'auto',
                title,
                pwinHtml,
                function(win) {
                    var info = sd.copy(jobVue.info);
                    if(info) {
                        var emptyReg = /^[\s]*$/;
                        var nameReg = /[\'\"\&]/g; // /[^\w\d\u4e00-\u9fa5]/g;

                        var name = info.name + '';
                        if(emptyReg.test(name)) {
                            alert('温馨提示', '职位名称不能为空');
                            return false;
                        }
                        
                        if(name.replace(nameReg, '').length !== name.length) {
//                          alert('温馨提示', '姓职位名称中只能包含中文，英文字母以及数字');
                            alert('温馨提示', '姓职位名称中不能包含英文的单引号和双引号');
                            return false;
                        }

                        for(var i = 0; i < listView.list.length; i++) {
                            if((listView.list[i].name === name && isAdd) ||
                                (!isAdd && oldName !== name && listView.list[i].name === name)) {
                                alert('温馨提示', '该职位已经存在');
                                return false;
                            }
                        }

                        if(info.permissions.length == 0) {
                            alert('温馨提示', '必须分配至少一项职位权限');
                            return false;
                        }
                    } else {
                        return true;
                    }

                    info.shopId = userData.currentShop.id;
                    info.sort = parseInt(info.sort);
                    //info.permissions = info.permissions;// JSON.stringify(info.permissions);// .toString();
                    // 确定
                    if(isAdd) {
                        // 添加职位
                        sd.request('job/add', info, false, function(json) {
                            if(json.error) {
                                alert(json.error.code + '错误', json.error.message);
                            } else {
                                if(json.data) {
                                    listView.list.unshift(json.data);
                                } else {
                                    alert('错误提示', '返回数据错误');
                                }
                            }
                            win.close();
                        }, function(json) {
                            alert('错误提示', '请求失败');
                            win.close();
                        }, 'post', false);
                    } else {
                        // 修改职位
                        sd.request('job/edit', info, false, function(json) {
                            if(json.error) {
                                alert(json.error.code + '错误', json.error.message);
                            } else {
                                if(json.data) {
                                    listView.list.$set(editIndex, json.data);
                                } else {
                                    alert('错误提示', '返回数据错误');
                                }
                            }
                            win.close();
                        }, function(json) {
                            alert('错误提示', '请求失败');
                            win.close();
                        }, 'post', false);
                    }
                    return true;
                },
                function(win) {
                    if(!isAdd) {
                        // 删除提醒
                        confirm('操作提示', '确定删除该职位信息?', function() {
                            sd.request('job/del', {
                                id: editId,
                                shopId: userData.currentShop.id
                            }, false, function(json) {
                                if(json.error) {
                                    alert(json.error.code + '错误', json.error.message);
                                } else {
                                    listView.list.$remove(listView.list[editIndex]);
                                }
                                win.close();
                            }, function(json) {
                                alert('错误提示', '请求失败');
                                win.close();
                            }, 'get', false);
                        });
                    } else {
                        return true;
                    }
                }, {
                    name: isAdd ? '确定' : '保存'
                }, {
                    class: isAdd ? 'gray' : 'red',
                    name: isAdd ? '取消' : '删除'
                });
            win.open('right');

            // 窗口Vue
            var jobVue = new Vue({
                el: '#' + win.onlyID,
                data: {
                    info: null,
                    pnum: 0
                },
                methods: {
                    edit: function() {
                        openPermissionsWin(this);
                    }
                }
            });

            // 初始化窗口Vue数据
            if(isAdd) {
                // 新增职位
                jobVue.info = {
                    name: "",
                    shopId: userData.currentShop.id,
                    sort: "255",
                    permissions: []
                }
            } else {
                // 编辑
                // 获取当前职位信息
                sd.request('job/get', {
                    id: editId
                }, false, function(json) {
                    if(json.error) {
                        alert(json.error.code + '错误', json.error.message);
                    } else {
                        if(json.data) {
                            oldName = json.data.name;
                            jobVue.info = json.data;
                        } else {
                            alert('错误提示', '返回数据错误');
                        }
                    }
                }, function(json) {
                    alert('错误提示', '请求失败');
                }, 'get', false);
            }
        };

        // 开启职位权限选择窗口
        var openPermissionsWin = function(jobVue) {
            var win = new CWin(
                cwinWidth,
                'auto',
                '职位权限配置',
                cwinHtml,
                function(win) {
                    jobVue.info.permissions = sd.copy(permissionsVue.selects);
                    return true;
                },
                function() {
                    return true;
                });
            win.open();
            var permissions = sd.copy(jobVue.info.permissions);
            for(var i = 0; i < permissions.length; i++) {
                permissions[i] = parseInt(permissions[i]);
            }
            var permissionsVue = new Vue({
                el: '#' + win.onlyID,
                data: {
                    tab1Index: 0,
                    tab2Index: 0,
                    tabList1: [],
                    tabList2: [],
                    selects: permissions,
                    list: []
                },
                methods: {
                    tab1Changed: function() {

                        if(this.tab1Index > 0) {
                            this.tab2Index = 0;
                            var childall = sd.copy(this.tabList1[this.tab1Index]);
                            var tv2 = this.tabList1[this.tab1Index].child ? sd.copy(this.tabList1[this.tab1Index].child) : [];
                            tv2 = [{
                                "id": '0',
                                "title": "全部",
                                'child': childall
                            }].concat(tv2);
                            this.tabList2 = tv2;
                        } else {
                            var narr = [];
                            var arr = sd.copy(this.tabList1);
                            for(var i = 0; i < arr.length; i++) {
                                for(var j = 0; j < arr[i].child.length; j++) {
                                    narr = narr.concat(arr[i].child[j].child);
                                }
                            }
                            this.list = narr;
                            this.tabList2 = [];
                        }
                    },
                    tab2Changed: function() {
                        if(this.tab2Index != 0) {
                            if(this.tabList2.length > this.tab2Index) {
                                this.list = this.tabList2[this.tab2Index].child ? sd.copy(this.tabList2[this.tab2Index].child) : [];
                            }
                        } else {
                            var narr = [];
                            var arr = sd.copy(this.tabList1[this.tab1Index].child);
                            for(var i = 0; i < arr.length; i++) {
                                narr = narr.concat(arr[i].child);
                            }
                            this.list = narr;
                        }
                    },
                    selectAll: function() {
                        var selects = sd.copy(this.selects);
                        for(var i = 0; i < this.list.length; i++) {
                            var find = false;
                            for(var j = 0; j < selects.length; j++) {
                                if(selects[j] == this.list[i].id){
                                    find = true;
                                    break;
                                }
                            }
                            if(!find)selects.push(this.list[i].id);
                        }
                        this.selects = selects;
                    },
                    dellAll: function() {
                        var selects = sd.copy(this.selects);
                        //                      sd.log(selects);
                        //                      sd.log("___________________________________");
                        //                      sd.log(this.list);
                        for(var i = 0; i < this.list.length; i++) {
                            for(var j = 0; j < selects.length; j++) {
                                if(this.list[i].id == selects[j]) {
                                    selects.splice(j, 1);
                                    break;
                                }
                            }
                        }
                        this.selects = selects;
                    },
                    back: function() {
                        this.selects = sd.copy(jobVue.info.permissions);
                    }
                },
                watch: {
                    'tab1Index': 'tab1Changed',
                    'tab2Index': 'tab2Changed'
                }
            });

            // 获取可选权限列表
            sd.request('job/permissions', {}, false, function(json) {
                //sd.log(json);
                if(json.error) {
                    alert(json.error.code + '错误', json.error.message);
                } else {
                    if(json.data) {
                        json.data = [{
                            "id": '0',
                            "title": "全部",
                            'child': []
                        }].concat(json.data);
                        permissionsVue.tabList1 = json.data;

                        permissionsVue.tab1Changed();
                    } else {
                        alert('错误提示', '返回数据错误');
                    }

                }
            }, function(json) {
                alert('错误提示', '请求失败');
            }, 'get', false);
        }

        // 员工信息显示列表 Vue
        var listView = new Vue({
            el: '#joblist',
            data: {
                filter: '',
                list: [], // 员工信息列表
                page: 0, // 当前页码索引
                num: 999, // 每页条数
                total: 1, // 页码总数
                count: 10 // 记录总数
            },
            methods: {
                add: function() {
                    openJobWin(true);
                },
                edit: function(id, i) {
                    openJobWin(false, id, i);
                }
            }
        });

        // 获取职位信息列表
        sd.request('job/getList', {
            shopId: userData.currentShop.id,
            num: 1000,
            page: 1
        }, false, function(json) {
            //sd.log(json);
            if(json.error) {
                alert(json.error.code + '错误', json.error.message);
            } else {
                listView.list = json.data;
            }
        }, function(json) {
            alert('错误提示', '请求失败');
        }, 'get', false);

    });