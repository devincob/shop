sd.controller([
        'login.html'
    ],
    function() {
        sd.removeAllRouter();
        sd.addRouter('login', function() {
            sd.controller([sd.froot + 'js/sd/main.js']);
            sd.removeRouter('login');
        });
        sd.addRouter('loginwait', function() {
            sd.controller([sd.froot + 'js/sd/loginwait.js']);
            sd.removeRouter('loginwait');
        });
        sd.addRouter('loginver', function() {
            sd.controller([sd.froot + 'js/sd/loginver.js']);
            sd.removeRouter('loginver');
        });
        // 加载login.html到页面
        $('body').html(sd.getHtml('login.html'));

        var loginVue = new Vue({
            el: ".forms",
            data: {
                phone: '',
                password: '',
                pwtype: false,
                phtype:false
            },
            computed: {
                spassword: {
                    get: function() {
                        var ret = "";
                        for(var i = 0; i < this.password.length; i++) {
                            ret += '•';
                        }
                        return ret;
                    }
                }
            },
            methods: {
                changePhType:function(b){
                    this.phtype = b;
                    if(b) {
                        setTimeout(function() {
                            $("#ph input").get(0).focus();
                        }, 300);
                    }
                },
                changeType: function(b) {
                    this.pwtype = b;
                    if(b) {
                        setTimeout(function() {
                            $("#pw input").get(0).focus();
                        }, 300);
                    }
                },
                enter: function() {
                    if(event.keyCode == 13) {
                        loginBtn();
                    }
                }
            }
        });

        function loginBtn() {

            var nameReg = /^1[\d]{10,10}$/;
            var passwordReg = /^[^\s]{6,20}$/;
            var name = loginVue.phone + '';
            var password = loginVue.password + '';
            loginVue.changeType(false);
            if(!nameReg.test(name)) {
                $(".tip").show().html("手机号格式错误。");
                return false;
            }

            if(!passwordReg.test(password)) {
                $(".tip").show().html("密码格式错误。");
                return false;
            }

            $(".tip").hide();
            sd.request('login/login', {
                    mobile: name,
                    password: password
                },
                false,
                function(json) {
                    if(json.error) {
                        alert(json.error.code + '错误', json.error.message);
                    } else {
                        if(json.data) {
                            json.data.uploadUrl = json.data.uploadUrl + "/";
                            //json.data.shopList =[];
                            if(json.data.shopList.length > 0) {
                                // 选择店铺
                                // 默认选第一家
                                var shop = json.data.shopList[0];
                                json.data.currentShop = shop;
                                // shop.status = '1';
                                if(shop.status + '' !== '0') {
                                    // 跳转到等待或者未审核通过界面
                                    sd.toPage(sd.webHost + "#loginwait", json.data, 'userShop');
                                } else {
                                    // 回到主界面
                                    sd.toPage(sd.webHost + "#login", json.data, 'userShop');
                                }
                            } else {
                                // 去注册，提交开店信息
                                // sd.toPage(sd.webHost + "loginver.html");
                                sd.toPage(sd.webHost + "#loginver", json.data, 'userShop');
                            }
                        } else {
                            alert('数据错误', '登录失败');
                        }
                    }
                },
                function() {
                    alert('错误提示', '登录失败，数据异常！');
                },
                'post');
        }

        $(".btn").on("click", function() {
            loginBtn();
        });
    });