/**
 * @file
 * 客户配置-打印错误
 *
 * @author weiyan.kong
 */
sd.controller([
        'print-queue.html',
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

        $('#userbox').html('');
        // 加载admin模块html到页面
        $('#userbox').html(sd.getHtml('print-queue.html'));
        //清空search区域内容
        $('#search').html('');
        //增加编辑的弹框
        var editWin = sd.getClass("ui.win");
        var editreasonShow = $('#print-queue-tan');
        // 获取可视区域宽度// 获取可视区域高度
        var editdomcache = $('<div></div>');
        editdomcache.append(editreasonShow);
        var table = new Vue({
            el: '#print-queue',
            data: {
                printRueue: []
            },
            methods: {
                //初始状态
                init: function(){
                    sd.request('printcolumn/getPrintcolumnList', {
                        shopId: userData.currentShop.id
                    }, false, function(json) {
                        if(json.error) {
                            alert(json.error.code + '错误', json.error.message);
                        } else {
                            sd.log(json.data)
                            table.printRueue = json.data;
                        }
                    }, function(json) {
                        alert('错误提示', '请求失败');
                    }, 'get')
                },
                //打开详情
                openDetails: function(item){
                    sd.log(item);
                    var str=item;
                    var arr = str.split(',');
                    for(var i = 0 ;i<arr.length;i++){
                        if(arr[i] == "" || typeof(arr[i]) == "undefined"||arr[i] == "-"){
                           arr.splice(i,1);
                           i= i-1;
                        } 
                    }
                    var list = arr; 
                    sd.log(list);
                    opentan(list);
                },
                clearbtn: function(){
                    sd.request('printcolumn/clearPrintcolumn', {
                        shopId: userData.currentShop.id
                    }, false, function(json) {
                        if(json.error) {
                            alert(json.error.code + '错误', json.error.message);
                        } else {
                            sd.log(json)
                        }
                    }, function(json) {
                        alert('错误提示', '请求失败');
                    }, 'get');
                    this.init();
                }
            },
            ready: function(){
                this.init();
            }
        })
            //弹框
            var opentan = function (item) {
                var newWin = new editWin(500, 300, "详情",
                    editreasonShow.clone().get(0),
                    function () {
                        rebBox.$destroy();
//                      return true;
                    }, {
                        name: '确定'
                    }
                );
                newWin.open('center');
                var rebBox = new Vue({
                    el: '#' + newWin.onlyID,
                    data: {
                        alist:[]
                    },
                    ready:function(){
                       this.alist = item;
                    }
                });
            };
})