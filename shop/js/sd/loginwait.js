/**
 * @file
 * 开店审核等待验证界面
 * 
 * loginver 
 *
 * @author chenggong.jiang
 */
sd.controller([
        'loginwait.html'
    ],
    function() {
        // 获取登录信息
//      var userData = sd.session("userShop");
//      if(userData && userData.accessToken && userData.currentShop) {
//          sd.send.token = userData.accessToken;
//          sd.send.shopId = userData.currentShop.id;
//      } else {
//          sd.controller(['js/sd/login.js']);
//          return;
//      }
        sd.removeAllRouter();
        
        var waitVue = new Vue({
           el:'',
           data:{
               type:1,
               mes:''
           },
           methods:{
               
           }
        });
        // 加载loginver.html到页面
        $('body').html(sd.getHtml('loginwait.html'));

        // 您的信息审核未通过，请及时更改
        $('.loginverBox').click(function() {
                
        });

        // 信息审核中
        $('.wait').click(function() {
            sd.controller(['js/sd/login.js']);
        });

    });