/**
 * @file
 * 积分管理
 *
 * @author weiyan.kong
 */
sd.controller([
        'jifen.html'
    ],
    function() {
        // 获取登录信息
        var userData = sd.session("userShop");
        if(userData && userData.accessToken && userData.currentShop) {
            sd.send.token = userData.accessToken;
            sd.send.shopId = userData.currentShop.id;
        } else {
            sd.controller(['js/sd/login.js']);
            return ;
        }
        // 加载admin模块html到页面
        $('#userbox').html(sd.getHtml('jifen.html'));
        //清空search区域内容
        $('#search').html('');

        //积分vue
        var jifen = new Vue({
            el: "#jifen",
            data: {
                shopId: userData.currentShop.id, //商店ID
                on: false, //开关按钮
                cash: '', //现金
                integral: '', //积分
                disabled: true
            },
            methods: {
                keepOn: function() {
                    if(!this.on) return;
                    if(this.cash == '' || this.integral == '') {
                        alert("不能为空");
                    } else if(isNaN(this.cash) || Number(this.integral) < 0) {
                        alert("只能为数字，请正确输入");
                    } else if(this.on === true) {
                        this.on === false ? true : false;
                    }
                },
                ons: function() {
                    this.on === false ? true : false;
                    if(this.on == false) {
                        this.disabled = true;
                    } else {
                        this.disabled = false;
                    }
                }
            },
            watch: {
                'on': 'ons'
            }
        })

    });