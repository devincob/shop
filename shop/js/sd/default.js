/**
 * @file
 * 空页面内容
 *
 * @author chenggong.jiang
 */
sd.controller([
    'default.html'
   ],
function(){
    // 加载admin模块html到页面
    $('#userbox').html(sd.getHtml('default.html'));
    //清空search区域内容
    $('#search').html('');
});