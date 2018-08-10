/**
 * @file
 * 窗口，带确定和取消按钮
 *
 * @author guan.sun
 * @class sd  
 * @extends uibase
 */
sd.creatClass({
    name: "ctr.upload",
    imports: []
}, function() {

    /**
     * @constructs
     * 窗口构造函数
     *
     * @param {string} formid form表单id
     * @param {string} fileInputId file input id
     * @param {Object} params 图片所属模块 1商品；2套餐；3轮播图 {"type":type,shopId:1}
     * @param {Function} callback 图片上传后的回调 {data:'/goods/fod.jpg'}
     */
    return function(formid, fileInputId, params , callback) {
        sd.call("ctr.upload", "base", this);
        var docObj = document.getElementById(fileInputId);
        docObj.onchange = function() {
            // 上传图片
             // (url, formIdOrJson, cache, callback, failback, type, debug, urlparams)
            sd.ajax.send('image/uploadImg', formid, false, function(json) {
                if(json.error) {
                    alert(json.error.code + '错误', json.error.message);
                } else {
                    sd.log(json);
                    if(callback)callback(json);
                }
            }, function(json) {
                alert('错误提示', '图片上传失败');
            }, 'post',false, params);
            return true;
        }
    }
});