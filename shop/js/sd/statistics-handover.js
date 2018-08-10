/*
 * 
 * @file 挂账管理
 * @author deshui.yu 
 * 
 */


sd.controller(['statistics-handover.html', 'js/sd/ui/win.js'], function() {
  
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
    $('#userbox').html(sd.getHtml('statistics-handover.html'));
    
  	var handOver = new Vue({
  		el: '#orHandOver',
  		data: {
  			handOverInfo: [], // 总数据
  			hoverDetail: null,
  			startTime: (new Date()).getZero(), //日期组件的开始时间
			endTime: (new Date()).getTime() + 1000 * ((59 -  new Date().getSeconds()) + 60 * (59 - new Date().getMinutes()) + 60 * 60 * (24 - new Date().getHours()-1)), //日期组件的结束时间
			page: 0, // 当前页
			num: 5, // 每页显示数量
			total: 1, // 总页数
			showDetails: false // 显示明细
  		},
  		methods: {
  			checkDate: function(){
				var day = new Date(Number(this.endTime));
  				var st = parseInt(this.startTime / 1000);
  				var et = new Date(day.getFullYear() + '-' + 　(day.getMonth() + 　1) + '-' + '01').getZero()/1000;
  				if (st < et) {
  					alert('只能选择本月时间');
  					this.startTime = new Date(day.getFullYear() + '-' + 　(day.getMonth() + 　1) + '-' + '01').getZero();
  					return ;
  				}
  				if (this.startTime > this.endTime) {
  					this.startTime = new Date(this.endTime).getZero();
  					alert('开始时间不能大于结束时间');
  				}
			},
  			
  			// 初始化方法
  			init: function(time){
  				var day = new Date();
  				sd.request('order/getChangeShiftsList',{
  					shopId: userData.currentShop.id,
  					startTime: time,
					endTime: parseInt(handOver.endTime / 1000),
					page: handOver.page+1,
					num: handOver.num
  				},false,function(data){
  					sd.log(data)
  					if (data.error) {
  						sd.log(data.error);
  						return ;
  					}
  					if (!data.data.list) {
  						return ;
  					}
  					var list = data.data.list;
  					sd.log(data)
  					for(var i = 0; i < list.length; i++) {
							list[i].getTime = (new Date(Number(list[i].getTime) * 1000)).format('yyyy.MM.dd/hh:mm');
							list[i].giveTime = (new Date(Number(list[i].giveTime) * 1000)).format('yyyy.MM.dd/hh:mm');
						}
  					handOver.handOverInfo = list;
  					handOver.total = data.data.total;
  				},function(){},'get')
  			},
  			
  			// 根据时间搜索
  			searInTime: function(){
  				this.checkDate();
  				this.startTime = new Date(this.startTime).getZero();
				var endT = this.endTime+1000 * 60 * 60 * 24 * 1;
  				this.endTime = new Date(endT).getZero() - 1000;
  				this.init(this.startTime/1000);
  			},
  			
  			// 展示明细
  			showHand: function(data){
  				this.hoverDetail = data;
  				this.showDetails = true;
  			},
  			
  			// 下一页
  			goPage: function(){
  				this.init(this.startTime);
  			}
  		}
  	})
  	
  	//new Date(day.getFullYear() + '-' + 　(day.getMonth() + 　1) + '-' + '01').getTime() / 1000
  	
  	handOver.init(parseInt(handOver.startTime / 1000));
})