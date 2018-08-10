
/**
 * @file
 * 
 * 统计管理--分类统计
 *
 * @author weiyan.kong
 */
sd.controller(['statistics-category.html', 'js/sd/ui/win.js'], function() {
 //读取user数据
    var userData = sd.session("userShop");
    if(userData && userData.accessToken && userData.currentShop) {
        sd.send.token = userData.accessToken;
        sd.send.shopId = userData.currentShop.id;
    } else {
        sd.controller(['js/sd/login.js']);
        return;
    }
    $('#userbox').html('');
    // 加载admin模块html到页面
    $('#userbox').html(sd.getHtml('statistics-category.html'));
    var statCategory = new Vue({
        el:'#statCategory',
        data:{
            startTime: new Date().getTime() - 1000 * 60 * 60 * 24, //日期组件的开始时间
            endTime: new Date().getTime(), //日期组件的结束时间
            showDay: false,//显示返回或打印
            allArea: '全部分类', // 区域
            areaList: ['全部分类'], // 区域列表
            showDetBtn: false, // 显示详情
            areaBtn: false, // 区域列表点击
//          len1: 0, //分类数量
            showDetails: true,//显示分类统计列表
            moreSettle: [], //分类选中
            classification: [],//全部分类统计列表
            allDetails: [], // 全部数据
            morDelSet: [], //分类中单个类全部选中
            itemClassification: [] //分类中的单个类的商品列表
        },
        methods:{
            //初始化，用于显示列表
            init: function() {
                var _this = this;
                sd.request('Statistics/cateStatisticsList', {
                    shopId: userData.currentShop.id,
                    startTime: parseInt(_this.startTime)/1000,
                    endTime: parseInt(_this.endTime)/1000,
                    page: 10,
                    num: 20
                }, false, function(json) {
                    if(json.error) {
                        return;
                    }else{
//                      sd.log(json.data.list)
                        var list = json.data.list;
                        //加入selected判断是否选中
                        var lista = {
                            "selected": false
                        };
                        if(!list) {
                            return;
                        }
                        for (var i=0; i<list.length; i++) {
                            for(var key in lista){
                                list[i][key] = lista[key];
                            }
                            statCategory.areaList.push(list[i].cateName);
                        };
                        $.unique(statCategory.areaList);
                        statCategory.allDetails = sd.copy(list);
                        statCategory.classification = list;
                    }
                }, function() {}, 'get')
            },
            //显示area分类列表
            showAreaList: function(e){
                e.stopPropagation();
                this.areaBtn = !this.areaBtn;
            },
            // 模拟select选择框,根据区域搜索
            selectUlArea: function(data) {
                this.allArea = data;
                var list = sd.copy(this.allDetails);
                if(this.allArea === '全部分类') {
                    this.classification = list;
                } else if(this.allArea != '全部分类') {
                    var copyList = [];
                    for (var i=0; i<list.length; i++) {
                        if ( list[i].cateName == this.allArea) {
                            copyList.push(list[i]);
                        }
                    }
                    this.classification = copyList;
                    sd.log(this.classification);
                }
//              sd.log(this.classification)
            },
            // 根据日期搜索
            searInDate: function() {
                var day = new Date(Number(this.endTime));
                var st = parseInt(this.startTime / 1000);
                var et = new Date(day.getFullYear() + '-' + 　(day.getMonth() + 　1) + '-' + '01').getTime() / 1000;
                if (st < et) {
                    alert('只能选择本月时间');
                    this.startTime = new Date(day.getFullYear() + '-' + 　(day.getMonth() + 　1) + '-' + '01').getTime();
                    return ;
                }
                this.init(); 
            },
            // 分类全部选中
            allSelectedOne: function() {
                if(this.moreSettle.length < this.classification.length) {
                    for(var i = 0; i < this.classification.length; i++) {
                        this.classification[i].selected = true;
                    }
                    this.moreSettle = sd.copy(this.classification);
                } else {
                    for(var i = 0; i < this.classification.length; i++) {
                        this.classification[i].selected = false;
                    }
                    this.moreSettle = [];
                }
                sd.log(this.moreSettle);
            },
            // 分类点击选中
            ocSelOne: function(data) {
                data.selected = !data.selected;
                var btn = true;
                for(var i = 0; i < this.moreSettle.length; i++) {
                    if(data.oid == this.moreSettle[i].oid) {
                        this.moreSettle.splice(i,1);
                        i--;
                        btn = false;
                        break;
                    }
                }
                if(btn) {
                    this.moreSettle.push(sd.copy(data));
                }
            },
             //分类中单个类全部选中
            allSelectedTwo: function() {
                this.len = this.itemClassification.length;
                if(this.morDelSet.length < this.itemClassification.length) {
                    for(var i = 0; i < this.itemClassification.length; i++) {
                        this.itemClassification[i].selected = true;
                    }
                    this.morDelSet = sd.copy(this.itemClassification);
                } else {
                    for(var i = 0; i < this.itemClassification.length; i++) {
                        this.itemClassification[i].selected = false;
                    }
                    this.morDelSet = [];
                }
                sd.log(this.itemClassification)
            },
             // 分类中单品点击选中
            ocSelTwo: function(data) {
                data.selected = !data.selected;
                var btn = true;
                for(var i = 0; i < this.moreSettle.length; i++) {
                    if(data.oid == this.moreSettle[i].oid) {
                        this.moreSettle.splice(i,1);
                        i--;
                        btn = false;
                        break;
                    }
                }
                if(btn) {
                    this.moreSettle.push(sd.copy(data));
                }
            },
            // 详情
            getDetails: function(item) {
                statCategory.showDetails = false;
                this.showDay = true;
                sd.request('Statistics/cateDetailStatistics', {
                    shopId: userData.currentShop.id,
                    cateId: item.cateId,//分类Id
                    startTime: statCategory.startTime,
                    endTime: parseInt(statCategory.endTime)/1000,
                    page: 10,
                    num: 20
                }, false, function(json) {
                    if(json.error) {
                        return;
                    }else{
                        var list = json.data.list;
                        //加入selected判断是否选中
                        var lista = {
                            "selected": false
                        };
                        if(!list) {
                            return;
                        }
                        for (var i=0; i<list.length; i++) {
                            for(var key in lista){
                                list[i][key] = lista[key];
                            }
                        };
                        sd.log(json.data)
                        statCategory.itemClassification = list;
                        sd.log(statCategory.itemClassification)
                    }
                }, function() {}, 'post');
            },
            //打印
            printData: function(){
                alert("打印");
            },
            //导出
            exportData: function(){
                alert("导出");
            },
            //返回上一步操作
            returnPage: function(){
                this.showDay = false;
                this.showDetails = true;
            },
            // 点击body隐藏选择分类
            clickBody: function() {
                this.areaBtn = false;
            },
        },
        ready: function() {
            this.init();
        }
    })
   
  
})