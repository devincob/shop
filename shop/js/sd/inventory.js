/**
 * @file
 * 库存预警模块
 *
 * @author daxu.wang
 */
sd.controller([
    'inventory.html',
    'js/sd/ui/win.js'
], function() {
    // 获取登录信息
    var userData = sd.session("userShop");
    if(userData && userData.accessToken && userData.currentShop) {
        sd.send.token = userData.accessToken;
        sd.send.shopId = userData.currentShop.id;
    } else {
        sd.controller(['js/sd/login.js']);
        return;
    }
    var imgHost = userData.uploadUrl;

    var userId = userData.user.id;
    $('#userbox').html('');
    // 加载admin模块html到页面
    $('#userbox').html(sd.getHtml('inventory.html'));
    // 清空search内容
    $('#search').html('');
    // search区域内容
    //$('#search').html();
    $('#userbox').append($('#invent-show').get(0));
    sd.request("inventory/getlist", {
        page: 0,
        length: 100,
        shopId: userData.currentShop.id

    }, false, function(json) {
        //sd.log(json.data);
        var name = new Vue({
            el: '#invent-show',
            data: {
                imgHost: imgHost,
                users: json.data,
                Number: json.data.length
            }
        })
    }, function(json) {

    }, "get");
});