/**
 * @file
 * 职位管理
 *
 * @author chenggong.jiang
 */
sd.controller([
        'base.html',
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
        $('#userbox').html(sd.getHtml('base.html'));

        // 获取窗口类
        var CWin = sd.getClass('ui.win');

        var shour = 9;
        var sminute = 30;
        var ehour = 21;
        var eminute = 30;
        var resetTime = function() {
            bstimeVue.shour = shour;
            bstimeVue.sminute = sminute;
            bstimeVue.ehour = ehour;
            bstimeVue.eminute = eminute;
        };

        //营业时间 Vue
        var bstimeVue = new Vue({
            el: '#bstime',
            data: {
                shopName: userData.currentShop.shopName,
                contactMan: userData.currentShop.contactMan,
                telephone: userData.currentShop.telephone,
                address: userData.currentShop.address,
                description: userData.currentShop.description,
                shour: 9,
                sminute: 0,
                ehour: 24,
                eminute: 0,
            },
            watch: {
                'shour': 'checkShour',
                'sminute': 'checkMinute',
                'ehour': 'checkEhour',
                'eminute': 'checkMinute'
            },
            methods: {
                checkShour: function() {
                    var sh = parseInt(this.shour);
                    if(sh < 0 || sh > 24) {
                        setTimeout(function() {
                            resetTime();
                        }, 100);
                        alert('营业开始时间错误(0-24)');
                    }
                },
                checkEhour: function() {
                    var eh = parseInt(this.ehour);
                    if(eh < 0 || eh > 48) {
                        setTimeout(function() {
                            resetTime();
                        }, 100);
                        alert('营业结束时间错误(0-48)');
                    }
                },
                checkHour: function() {
                    var sh = parseInt(this.shour);
                    var eh = parseInt(this.ehour);
                    var sm = parseInt(this.sminute);
                    var em = parseInt(this.eminute);
                    if(sh * 60 + sm > eh * 60 + em) {
                        setTimeout(function() {
                            resetTime();
                        }, 100);
                        alert("营业开始时间不能大于营业结束时间");
                        return true;
                    } else if((eh * 60 + em) - (sh * 60 + sm) > 1440) {
                        setTimeout(function() {
                            resetTime();
                        }, 100);
                        alert("营业时间超过一天！");
                        return true;
                    }
                    return false;
                },
                checkMinute: function() {
                    var sm = parseInt(this.sminute);
                    if(sm < 0 || sm > 59) {
                        setTimeout(function() {
                            bstimeVue.sminute = 0;
                        }, 100);
                        alert('分钟错误(0-59)');
                    }
                    var em = parseInt(this.eminute);
                    if(em < 0 || em > 59) {
                        setTimeout(function() {
                            bstimeVue.eminute = 0;
                        }, 100);
                        alert('分钟错误(0-59)');
                    }
                },
                send: function() {
                    if(this.checkHour()) {
                        return;
                    }
                    // 修改营业时间 
                    sd.request('shop/update', {
                        openTime: parseInt(bstimeVue.shour) * 60 + parseInt(bstimeVue.sminute),
                        closeTime: parseInt(bstimeVue.ehour) * 60 + parseInt(bstimeVue.eminute),
                        shopName: bstimeVue.shopName,
                        contactMan: bstimeVue.contactMan,
                        telephone: bstimeVue.telephone,
                        address: bstimeVue.address,
                        description: bstimeVue.description
                    }, false, function(json) {
                        if(json.error) {
                            alert(json.error.code + '错误', json.error.message);
                        } else {
                            sd.dispatchEvent('shopNameChanged',bstimeVue.shopName)
                            alert('店铺信息修改成功');
                        }
                    }, function(json) {
                        alert('错误提示', '请求失败');
                    }, 'post');
                }
            }
        });

        // 营业时间 
        sd.request('shop/get', {}, false, function(json) {
            if(json.error) {
                alert(json.error.code + '错误', json.error.message);
            } else {
                bstimeVue.shopName = json.data.shopName;
                bstimeVue.contactMan = json.data.contactMan;
                bstimeVue.telephone = json.data.telephone;
                bstimeVue.address = json.data.address;
                bstimeVue.description = json.data.description;
                var openTime = json.data.openTime.split(',');
                if(openTime.length < 2)openTime=[0,0];
                var ot = parseInt(openTime[0]);
                var et = parseInt(openTime[1]);
                shour = bstimeVue.shour = (ot - ot % 60) / 60;
                sminute = bstimeVue.sminute = ot % 60;
                ehour = bstimeVue.ehour = (et - et % 60) / 60;
                eminute = bstimeVue.eminute = et % 60;
            }
        }, function(json) {
            alert('错误提示', '请求失败');
        }, 'get', false);

    });