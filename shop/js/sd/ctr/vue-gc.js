/**
 * @file
 * Vue GC
 *
 * @author chenggong.jiang
 */
sd.controller([],
function(){
    var vc_init = window.Vue.prototype._init;
    var optionsList = [];
    window.Vue.prototype._init = function(options) {
        vc_init.call(this, options);
        optionsList.push(this);
    }
    sd.addWatch('vue-gc', function() {
        for(var i = 0; i < optionsList.length; i++) {
            if(!optionsList[i].$parent && ! Vue.util.inDoc(optionsList[i].$options.el)) {
                //sd.log('Vue.' + optionsList[i].$options.el.id   + ' destroyed');
                optionsList[i].$destroy(true);
                optionsList.splice(i, 1);
                i--;
            }
        }
    }, null, 100);
});