/**
 * @file
 * 客户配置-打印错误
 *
 * @author weiyan.kong
 */
sd.controller([
        'printerror.html'
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
        $('#userbox').html(sd.getHtml('printerror.html'));
        //清空search区域内容
        $('#search').html('');

        sd.request('printerror/getPrintErrorList', {
            shopId: userData.currentShop.id
        }, false, function(json) {
            if(json.error) {
                alert(json.error.code + '错误', json.error.message);
            } else {
                table.printError = json.data;
            }
        }, function(json) {
            alert('错误提示', '请求失败');
        }, 'get');

        var table = new Vue({
            el: '#table',
            data: {
                printError: []
            }

        })

    });