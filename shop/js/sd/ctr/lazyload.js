/**
 * @file
 * 
 *
 * @author guan.sun
 * @class sd  
 * @extends uibase
 */
sd.creatClass({
    name: "ctr.lazyload",
    imports: []
}, function() {
   /*
    * 图片懒加载
    * 
    * @param {string} className 图片class
    * @param {string} objId 容器id 不需要加#
    */
    return function(className,objId) {
        this.className = className;
        // 获取class
        function getClassNmae(cName){
            return document.getElementsByClassName(cName);
        };
        /*
         * 添加事件
         * obj : 绑定元素
         * type : 绑定事件类型
         * func : 回调函数
         */
        function addEvent(obj,type,func){
            if(obj.addEventListener){
                obj.addEventListener(type,func,false);        
            }else if(obj.attachEvent){
                obj.attachEvent('on'+type,func);
            }
        };
        //创建基础参数
        var objs={
            eleGroup:null,
            screenHeight:null,
            scrollHeight:null,
            scrolloverHeight:null,
            limitHeight:null
        };
        
        //对数据进行初始化
        function init(element){
            objs.eleGroup=getClassNmae(element);
            screenHeight=document.documentElement.clientHeight;
            scrolloverHeight=document.body.scrollTop;
            for(var i=0,j=objs.eleGroup.length;i<j;i++){
                    if(objs.eleGroup[i].parentNode.offsetTop<=screenHeight && objs.eleGroup[i].getAttribute('sd-src')){
                        objs.eleGroup[i].setAttribute('src',objs.eleGroup[i].getAttribute('sd-src'));
                        objs.eleGroup[i].removeAttribute('sd-src');
                    }        
            }
        };
        function lazyLoad(){
                if(document.body.scrollTop == 0){
                        limitHeight=document.documentElement.scrollTop+document.documentElement.clientHeight;
                }else{
                        limitHeight=document.body.scrollTop+document.documentElement.clientHeight;
                }
                for(var i=0,j=objs.eleGroup.length;i<j;i++){
                        if(objs.eleGroup[i].parentNode.offsetTop<=limitHeight && objs.eleGroup[i].getAttribute('sd-src')){
                            objs.eleGroup[i].src=objs.eleGroup[i].getAttribute('sd-src');
                            objs.eleGroup[i].removeAttribute('sd-src');
                        }        
                }
        };
        init(className);
        
        if(objId === undefined){
            $(window).on('scroll',lazyLoad);
        }else{
            $('#'+objId).on('scroll',lazyLoad);
        }
        
        setTimeout(function(){
            document.body.scrollTop = 1;
            document.body.scrollTop = - 1;
        },100);
       
        this.refresh = function(){
             var _this = this;
            setTimeout(function(){
                 init(_this.className);
            },200);
        };
    }
});