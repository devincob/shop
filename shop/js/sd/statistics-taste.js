sd.controller([
        'statistics-taste.html',
        'js/sd/ui/win.js',
        'js/sd/ctr/upload.js'
    ],
    function() {
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
        $('#userbox').html(sd.getHtml('statistics-taste.html'));
        var Win = sd.getClass('ui.win');
        var tasteWinHtml = $('#tastedetail').get(0).outerHTML;
        $('#tastedetail').remove();
        var Statistics = new Vue({
            el: '#tasteStatistics',
            data: {
                startTime: new Date().getTime() - 2000 * 60 * 60 * 24, //日期组件的开始时间
                endTime: new Date().getTime(), //日期组件的结束时间
                alltaste: '全部口味',
                tasteBtn: false ,// 区域列表
                tasteList:[],//进入页面所有的口味列表
                attrId:"",//口味的id
                selectList:[]//下拉菜单显示的口味列表
            },
            //过滤器
            computed:{
            filterTasteList:function(){
                    return this.tasteList.filter(function(item){
                        if(Statistics.attrId === '')return true;
                        return item.attrId === Statistics.attrId;
                    });
                }
            },
            methods: {
                //进入页面获取的口味列表
                getTasteList:function(){
                        sd.request('Statistics/attrStatisticsList', {
                        shopId: userData.currentShop.id,
                        startTime: parseInt(this.startTime)/1000,
                        endTime: parseInt(this.endTime)/1000
                    }, false, function (json) {
                        if (json.error) {
                            alert(json.error.code + "错误", json.error.message);
                        } else {
                            var arr = sd.copy(json.data);
                            Statistics.tasteList = arr ? arr : [];
                            //sd.log(json.data);
                        }
                    }, function (json) {
                        alert('错误');
                    }, 'get')
                },
                //下拉口味列表筛选
                selectTaste:function(index,list){
                    Statistics.alltaste=list.name;
                    Statistics.attrId = list.id;
                },
                // 根据日期搜索筛选
                searInDate: function(){
                    alert("点击搜索了");
                    this.getTasteList();
                },
                // 弹出详情页
                showDetails:function(index,list){
                    Statistics.Id=list.attrId;
                    openTasteWindow();
                },
                // 关闭详情页
                closeDetails: function(){
                    this.showDetBtn = false;
                },
                // 下拉口味列表筛选
                showTasteList: function(e){
                    e.stopPropagation();
                    this.tasteBtn = !this.tasteBtn;
                    sd.request('Attr/getAttr', {
                        //参数
                        shopId: userData.currentShop.id
                    }, false, function (json) {
                        if (json.error) {
                            alert(json.error.code + "错误", json.error.message);
                        } else {
                            var arr = json.data;
                            Statistics.selectList = arr ? [{id:"",name:"全部口味"}].concat(arr) : [];
                        sd.log(json.data);
                        }
                    }, function (json) {
                        alert('错误');
                    }, 'get');
                    //sd.log(this.tasteBtn);
                },
                // 点击body
                clickBody: function(){
                    this.tasteBtn = false;
                }
            },
            ready: function () {
                //进入页面即执行此函数
                this.getTasteList();///showList
            }

        });
    var openTasteWindow = function(){
    var detailsWin = new Win(580, 600, "口味统计详情",tasteWinHtml,
         function (detailsWin) {
            sd.log("确定")
        },  {
            class: 'gray fl',
            name: '确定'
        });
    detailsWin.open("right");//打开弹框
    var selectDetail = new Vue({
        el: '#tastedetail',
        data: {
            detailList:[],//所有的口味列表点击后进入弹出框的详情列表list
        },
        methods: {}
    });
    sd.request('Statistics/attrDetailStatistics', {
        //参数
        shopId: userData.currentShop.id,
        startTime: parseInt(Statistics.startTime)/1000,
        endTime: parseInt(Statistics.endTime)/1000,
        attrId:Statistics.Id
    }, false, function (json) {
        if (json.error) {
            alert(json.error.code + "错误", json.error.message);
        } else {
            var arr = sd.copy(json.data.list);
            selectDetail.detailList = arr ? arr : [];
            sd.log(json);
        }
    }, function (json) {
        alert('错误');
    }, 'post');
    //
}


 })