/**
 * @file
 * 客户配置-轮播图
 *
 * @author kongweiyan.kong
 */
sd.controller([
        'lunbo.html',
        'js/sd/ui/win.js',
        'js/sd/ctr/upload.js',
        'js/sd/ctr/lazyload.js'
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
        //插入图片
        var imgHost = userData.uploadUrl;
        var Lazyload = sd.getClass('ctr.lazyload');
        var ImagLoadCtr = new Lazyload('cname');
        
        $('#userbox').html('');
        // 加载admin模块html到页面
        $('#userbox').html(sd.getHtml('lunbo.html'));
        //清空search区域内容
        $('#search').html('');
        var domcache = $('<div></div>');
        var picUpWin = $('.picCon');
        domcache.append(picUpWin);
        // 获取图片上传预览功能类
        var Upload = sd.getClass('ctr.upload');
        // 获取窗口类
        var CWin = sd.getClass('ui.win');
        //页面显示添加vue
        var picList = new Vue({
            el: '#picList',
            data: {
                imgHost: imgHost, //+图片前缀
                bannerList: [] //轮播图片列表
            },
            methods: {
                inte:function(){
                    //请求，轮播图列表
                    sd.request('banner/getBannerList', {
                        shopId: userData.currentShop.id
                    }, false, function(json) {
                        if(json.error) {
                            alert(json.error.code + '错误', json.error.message);
                        } else {
                            picList.bannerList = json.data;
                            ImagLoadCtr.refresh();
                        }
                    }, function(json) {
                        alert('错误提示', '请求失败');
                    }, 'get');
                },
                //新建轮播图
                add: function() {
                    openWin(true);
                },
                //修改轮播图
                edit: function(i, id) {
                    openWin(false, i, id);
                },
                //修改图片
                imageUpload: function(imgJson) {
                    if(imgJson) {
                        this.good.imageName = imgJson.imageName;
                    }
                },
            },
            ready:function(){
                this.inte();
            }
        });

        // 添加和编辑轮播图窗口
        var openWin = function(isadd, i, id) {
            var title = isadd ? '新建轮播图' : '修改轮播图';
            var mywin = new CWin($('.picCon').width(),
                'auto',
                title,
                picUpWin.clone().get(0),
                function(win) {
                    if(isadd) {
                        //判断添加信息是否符合格式
                        if(winVue.bannerName == "" && winVue.fileName == "") {
                            alert("轮播图名称和图片为空，请正确添加");
                            return false;
                        } else if(winVue.bannerName == "") {
                            alert("轮播图名称不能为空，请正确输添加");
                            return false;
                        } else if(winVue.fileName == "") {
                            alert("轮播图图片不能为空，请添加图片");
                            return false;
                        };
                        //添加轮播图信息
                        sd.request("banner/addBanner", {
                            shopId: userData.currentShop.id,
                            fileName: winVue.fileName,
                            bannerName: winVue.bannerName,
                            uid: userData.user.id
                        }, false, function(json) {
                            //返回的data数据 添加到初始页面中去 实现数据更新        
                            if(json.error) {
                                alert(json.error.code + '错误', json.error.message);
                            } else {
                                if(json.data) {
                                    picList.bannerList.push(json.data);
                                    ImagLoadCtr.refresh();
                                } else {
                                    alert('错误提示', '数据返回为空');
                                }
                            }
                        }, function(json) {
                            alert('错误提示', '请求失败');
                        }, "post");
                    } else {
                        //修改轮播图
                        sd.request('banner/editBanner', {
                            shopId: userData.currentShop.id,
                            id: id,
                            fileName: winVue.fileName,
                            bannerName: winVue.bannerName,
                            uid: winVue.uid
                        }, false, function(json) {
                            if(json.error) {
                                alert(json.error.code + '错误', json.error.message);
                            } else {
                                if(json.data) {
                                    picList.bannerList.$set(i, json.data);
                                    ImagLoadCtr.refresh();
                                } else {
                                    alert('错误提示', '数据为空');
                                }
                            }
                        }, function(json) {
                            alert('错误提示', '请求失败');
                        }, 'post');
                    }
                    winVue.$destroy();
                    return true;
                },

                function(win) {
                    //删除轮播图片
                    if(title == '新建轮播图') {
                        return;
                    } else {
                        confirm('操作提示', '确认删除轮播图？', function() {
                            // 删除轮播图
                            sd.request('banner/delBanner', {
                                id: id,
                                uid: userData.user.id,
                                shopId: userData.currentShop.id
                            }, false, function(json) {
                                if(json.error) {
                                    alert(json.error.code + '错误', json.error.message);
                                } else {
                                    if(json.data) {
                                        var item = picList.bannerList;
                                        for(var i = 0; i < item.length; i++) {
                                            if(item[i].id + '' == json.data.id + '') {
                                                item.$remove(item[i]);
                                            }
                                        }
                                    }
                                    ImagLoadCtr.refresh();
                                }
                                win.close();
                            }, function() {

                            }, 'post');
                            winVue.$destroy();
                            return true;
                        })
                    }
                }, {
                    name: isadd ? '确定' : '保存'
                }, {
                    'class': isadd ? 'gray' : 'red',
                    name: isadd ? '取消' : '删除'
                }
            );
            mywin.open('right');
            //获取轮播图详情
            if(!isadd) {
                sd.request('banner/getBannerDetail', {
                    id: id,
                }, false, function(json) {
                    if(json.error) {
                        alert(json.error.code + '错误', json.error.message);
                    } else {

                        winVue.bannerName = json.data.bannerName;
                        winVue.fileName = json.data.fileName;

                    }
                }, function(json) {
                    alert('错误提示', '请求失败');
                }, 'get');
            }
            var winVue = new Vue({
                el: '#' + mywin.onlyID,
                data: {
                    imgHost: imgHost,
                    shopId: userData.currentShop.id,
                    id: userData.user.id,
                    uid: userData.user.id,
                    fileName: '',
                    bannerName: ''
                },
                methods: {
                    fileNameChange: function(imgJson) {
                        sd.log(imgJson);
                        if(imgJson) {
                            this.fileName = imgJson.data;
                        }
                    }
                }
            });

            // 绑定图片上传预览功能
            new Upload('imageUpForm', 'file_upload', {
                type: 3,
                shopId: userData.currentShop.id
            }, winVue.fileNameChange);
        }
    });