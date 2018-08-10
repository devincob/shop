/**
 * @file
 * 员工管理页面
 *
 * @author chenggong.jiang
 */
sd.controller([
        'employemanage.html',
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
        $('#userbox').html(sd.getHtml('employemanage.html'));
        // 清空search内容
        $('#search').html('');

        // search区域内容
        var dom = $('#employe-search').get(0);
        //$('#search').append(dom);
        dom.remove();
        // 获取窗口类
        var CWin = sd.getClass('ui.win');

        // 限定只能输入中文英文和数字
        var zhendReg = /[\'\"\&]/g; // /[^\w\d\u4e00-\u9fa5]/g;
        // 限定只能输入中文英文和中间的空格。调用trim去掉首位空格
        var zhenReg = /[\'\"\&]/g; // /[^\w\d\u4e00-\u9fa5 ]/g;
        // 限定只能输入英文和数字和下划线
        var endReg = /[^a-zA-Z\d_]/g;
        // 限定只能输入英文
        var enReg = /[^a-zA-Z]/g;
        // 限定数字和小数点 ，然后调用str.toFloatStr(2)转换
        var floatReg = /[^\d\.]/g;
        // 限定数字
        var intReg = /[^\d]/g;

        // 获取编辑窗口，缓存HTML，并移除显示列表中的HTML
        var pwin = $('#employWin');
        var pwinWidth = pwin.outerWidth();
        var pwinHeight = pwin.outerHeight();
        var pwinHtml = pwin.get(0).outerHTML;
        pwin.remove();

        // 开启员工信息窗口
        var openEmployWin = function(isAdd, editId, editIndex) {
            var title = (isAdd ? '新建员工信息' : '修改员工信息');
            // 标识窗口
            var win = new CWin(
                pwinWidth,
                'auto',
                title,
                pwinHtml,
                function(win) {
                    if(employVue.info) {
                        var info = employVue.info;
                        if(employVue.index == -1) {
                            alert('温馨提示', '请选择职位');
                            return false;
                        }

                        if(!employVue.eidt) {

                            var emptyReg = /^[\s]*$/;

                            var password = info.password + '';

                            if(!info.added) {
//                              var nameReg = /[^\w\d\u4e00-\u9fa5]/g;

                                var name = info.name + '';
                                if(emptyReg.test(name)) {
                                    alert('温馨提示', '真实姓名不能为空');
                                    return false;
                                }

//                              if(name.replace(nameReg, '').length !== name.length) {
//                                  alert('温馨提示', '姓名中只能包含中文，英文字母以及数字');
//                                  return false;
//                              }
                            }

                            var mobileReg = /^1[\d]{10,10}$/;
                            var mobile = info.mobile + '';
                            if(emptyReg.test(mobile)) {
                                alert('温馨提示', '手机号码不能为空');
                                return false;
                            }
                            if(!mobileReg.test(mobile)) {
                                alert('温馨提示', '手机号码格式错误');
                                return false;
                            }
                        }
                    } else {
                        return true;
                    }
                    // 确定
                    if(isAdd) {
                        sd.request('shop/addStaff', {
                                shopId: userData.currentShop.id,
                                roleId: info.roleId,
                                mobile: mobile,
                                name: name,
                                password: password
                            },
                            false,
                            function(json) {
                                if(json.error) {
                                    alert(json.error.code + '错误', json.error.message);
                                } else {
                                    if(json.data) {
                                        var jobs = employVue.jobs;
                                        for(var i = 0; i < jobs.length; i++) {
                                            if(jobs[i].id + '' === json.data.roleId + '') {
                                                json.data.roleName = jobs[i].name;
                                                json.data.permissions = jobs[i].permissions;
                                                break;
                                            }
                                        }
                                        listView.list.push(json.data);
                                    } else {
                                        alert('错误提示', '数据返回为空');
                                    }
                                }
                                win.close();
                            },
                            function(json) {
                                alert('错误提示', '请求失败', function() {
                                    win.close();
                                });
                            }, 'post', false);
                    } else {
                        var oldData = listView.list[editIndex];
                        sd.request('shop/updateStaff', {
                                shopId: userData.currentShop.id,
                                staffId: editId,
                                roleId: info.roleId
                            },
                            false,
                            function(json) {
                                if(json.error) {
                                    alert(json.error.code + '错误', json.error.message);
                                } else {
                                    if(json.data) {
                                        oldData.id = json.data.staffId;
                                        var jobs = employVue.jobs;
                                        for(var i = 0; i < jobs.length; i++) {
                                            if(jobs[i].id + '' === json.data.roleId + '') {
                                                oldData.roleName = jobs[i].name;
                                                oldData.permissions = jobs[i].permissions;
                                                break;
                                            }
                                        }
                                        oldData.roleId = json.data.roleId;
                                        listView.list.$set(editIndex, oldData);
                                    } else {
                                        alert('错误提示', '数据返回为空');
                                    }
                                }
                                win.close();
                            },
                            function(json) {
                                alert('错误提示', '请求失败', function() {
                                    win.close();
                                });
                            }, 'post', false);
                    }
                    return false;
                },
                function(win) {
                    if(!isAdd) {
                        // 删除提醒
                        confirm('操作提示', '删除' + employVue.info.name + '的员工信息，请确认！', function() {
                            sd.request('shop/removeStaff', {
                                shopId: userData.currentShop.id,
                                staffId: editId,
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
                            }, 'post', false);
                        });
                        return false;
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
            var employVue = new Vue({
                el: '#' + win.onlyID,
                data: {
                    info: null,
                    jobs: [],
                    index: -1,
                    eidt: false,
                    lastMobile: ''
                },
                computed: {
                    mobile: {
                        get: function() {
                            return this.info.mobile;
                        },
                        set: function(newValue) {
                            this.info.mobile = newValue.replace(intReg, '');
                        }
                    },
                    rname:{
                        get: function() {
                            return this.info.name;
                        },
                        set: function(newValue) {
                            newValue = newValue.trim();
                            this.info.name = newValue.replace(zhenReg, '');
                        }
                    }
                },
                methods: {
                    initJobIndex: function() {
                        this.index = -1;
                        if(this.info && this.jobs) {
                            for(var i = 0; i < this.jobs.length; i++) {
                                if(this.jobs[i].id + '' == this.info.roleId + '') {
                                    this.index = i;
                                }
                            }
                        }
                    },
                    changeRoleId: function() {
                        if(this.index != -1) {
                            if(this.info) {
                                this.info.roleId = this.jobs[this.index].id;
                            }
                        }
                    },
                    checkMobile: function() {
                        var mobileReg = /^1[\d]{10,10}$/;

                        if(this.info) {
                            var mobile = this.info.mobile + '';
                            if(mobile.replace(intReg,'').length != mobile.length){
                                return;
                            }
                            if(mobile.length == 11) {
                                if(!mobileReg.test(mobile)) {
                                    alert('温馨提示', '手机号码格式错误');
                                    this.info.mobile = '';
                                } else {
//                                  if(this.lastMobile != mobile) {
                                        this.info.added = true;
                                        this.lastMobile = mobile
                                        sd.request('staff/checkExist', {
                                                shopId: userData.currentShop.id,
                                                mobile: mobile
                                            },
                                            false,
                                            function(json) {
                                                if(json.error) {
                                                    alert(json.error.code + '错误', json.error.message);
                                                } else {
                                                    employVue.info.added = json.data;
                                                }
                                            },
                                            function(json) {
                                                alert('错误提示', '请求失败');
                                            }, 'post', false);
//                                  }
                                }
                            } else {
                                this.info.added = true;
                            }
                        }
                    }
                },
                watch: {
                    'info': 'initJobIndex',
                    'jobs': 'initJobIndex',
                    'index': 'changeRoleId'
                }
            });

            // 初始化窗口Vue数据
            if(isAdd) {
                // 新增
                employVue.info = {
                    roleId: 0, //职位id
                    roleName: "", //职位名称
                    username: "", //登录帐号
                    password: "",
                    name: "", //真实姓名
                    title: "", // 称谓
                    mobile: "", //手机号码
                    sort: 255,
                    added: true // 是否是新增
                };
            } else {
                employVue.eidt = true;
                // 编辑
                // 获取套餐显示列表数据
                sd.request('staff/get', {
                    staffId: editId,
                    shopId: userData.currentShop.id
                }, false, function(json) {
                    //sd.log(json);
                    if(json.error) {
                        alert(json.error.code + '错误', json.error.message);
                    } else {
                        employVue.info = json.data;
                    }
                }, function(json) {
                    alert('错误提示', '请求失败');
                });
            }

            //获取职位信息
            sd.request('job/getList', {}, false, function(json) {
                if(json.error) {
                    alert(json.error.code + '错误', json.error.message);
                } else {
                    employVue.jobs = json.data;

                }
            }, function(json) {
                alert('错误提示', '请求失败');
            }, 'post', false);
        };

        //      // 搜索  Vue
        //      var serch = new Vue({
        //          el: '#employe-search',
        //          data: {
        //              filter: ''
        //          },
        //          methods: {
        //              search: function() {
        //                  listView.filter = this.filter;
        //              }
        //          }
        //      });

        // 员工信息显示列表 Vue
        var listView = new Vue({
            el: '#employlist',
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
                    openEmployWin(true);
                },
                edit: function(id, i) {
                    openEmployWin(false, id, i);
                }
            }
        });

        // 获取员工信息列表
        sd.request('shop/getStaffList', {
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