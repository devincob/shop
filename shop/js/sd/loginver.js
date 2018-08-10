/**
 * @file
 * 开店审核提交界面
 * loginver 
 *
 * @author chenggong.jiang
 */
sd.controller([
        'loginver.html',
        'js/sd/ctr/upload.js'
    ],
    function() {
        // 获取登录信息
        var userData = sd.session("userShop");
        if(userData && userData.accessToken) {
            sd.send.token = userData.accessToken;
        } else {
            sd.controller(['js/sd/login.js']);
            return;
        }
        // 加载loginver.html到页面
        $('body').html(sd.getHtml('loginver.html'));

        var imgHost = userData.uploadUrl;
        var loginver = new Vue({
            el: "#loginver",
            data: {
                Validation: true,
                shopName: '',
                contactMan: '',
                telephone: '',
                address: '',
                description: '',
                license: '',
                fileName: ''
            },
            methods: {
                fjudge: function() {
                    if(this.shopName !== '' && this.telephone !== '' && this.address !== '') {
                        this.Validation = false;
                    } else {
                        this.Validation = true;
                    }
                },
                subForm: function() {
                    var tempReg = /\s+/;
                    if((this.shopName + '').replace(tempReg, '') === '') {
                        alert('店铺名不能为空');
                        return;
                    }
                    if((this.contactMan + '').replace(tempReg, '') === '') {
                        alert('店铺负责人不能为空');
                        return;
                    }
                    var mobile = this.telephone + '';
                    if(mobile.replace(tempReg, '') === '') {
                        alert('联系方式不能为空');
                        return;
                    }
                    var mobileReg = /^1[\d]{10,10}$/;
                    if(!mobileReg.test(mobile)) {
                        alert('手机号码格式错误');
                        return
                    }
                    if((this.address + '').replace(tempReg, '') === '') {
                        alert('地址不能为空');
                        return;
                    }

                    sd.request('Chain/signUp', {
                        shopName: this.shopName,
                        contactMan: this.contactMan,
                        telephone: this.telephone,
                        address: this.address,
                        description: this.description,
                        license: this.license
                    }, false, function(json) {
                        if(json.error) {
                            alert(json.error.code + '错误', json.error.message);
                        } else {
//                          sd.log(json);
                            sd.toPage(sd.webHost + "#loginwait");
                        }
                    }, function() {}, 'post');
                },
                fileNameChange: function(imgData) {
                    this.license = imgData.data;
                    this.fileName = imgHost + imgData.data;
                }
            },
            watch: {
                'shopName': 'fjudge',
                'telephone': 'fjudge',
                'address': 'fjudge'
            },
            ready: function() {
                var Upload = sd.getClass('ctr.upload');
                new Upload('imageUpForm', 'file_upload', {
                    type: 4,
                    shopId: 1
                }, this.fileNameChange);
            }
        });
    });