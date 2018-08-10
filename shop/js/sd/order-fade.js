/*
 * 
 * @file 退单/菜管理
 * @author deshui.yu 
 * 
 */

sd.controller(['order-fade.html'], function() {
	// 获取本地信息
	var userData = sd.session("userShop");
	if(userData) {
		sd.send.token = userData.accessToken;
	} else {
		sd.toPage('login.html');
	}

	//加载页面
	$('#userbox').html(sd.getHtml('order-fade.html'));

	$('nav a').click(function() {
		$(this).addClass('active').siblings('a').removeClass('active')
	})

	//main
	var orderFade = new Vue({
		el: '#orderFade',
		data: {
			count: 0, // 多少条数据
			orderPage: 0, // 分页页码
			foodPage: 0,
			num: 5,
			count: 0,
			startTime: new Date().getZero(), //日期组件的开始时间
			endTime: (new Date()).getTime() + 1000 * ((59 -  new Date().getSeconds()) + 60 * (59 - new Date().getMinutes()) + 60 * 60 * (24 - new Date().getHours()-1)), //日期组件的结束时间 // 初始化结束时间
			total: 0, // 分页页码数
			withoutOrder: [], // 退单
			withoutFood: [], // 退菜
			infoSearch: '', // 定单号或菜名
			withoutOrderBtn: true // 开关，控制退单或退菜
		},
		methods: {
			// 请求退菜详情
			foodInt: function(){
				sd.request('order/getReturnGoods', {
					shopId: userData.currentShop.id,
					startTime: parseInt(this.startTime/1000),
					endTime: parseInt(this.endTime/1000),
					page: orderFade.foodPage + 1,
					num: orderFade.num,
					name: this.infoSearch
				}, false, function(data) {
					if(data.error) {
						sd.log(data);
					} else {
						orderFade.withoutFood = [];
						var list = data.data.list;
						sd.log(data.data);
						if(!list) return;
						orderFade.total = parseInt(data.data.total);
						orderFade.count = parseInt(data.data.count);
						for(var i = 0; i < list.length; i++) {
							list[i].oiupdateTimed = (new Date(Number(list[i].updateTime) * 1000)).format('yyyy.MM.dd/hh:mm');}
						
						orderFade.withoutFood = sd.copy(list);
					}
				}, function(data) {
					sd.log(data)
				}, 'get');
			},
			noFood: function(goodsName) {
				orderFade.foodPage = 0;
				this.startTime = new Date().getZero();
				this.endTime = (new Date()).getTime() + 1000 * ((59 -  new Date().getSeconds()) + 60 * (59 - new Date().getMinutes()) + 60 * 60 * (24 - new Date().getHours()-1));
				this.foodInt();
				this.withoutOrderBtn = false;
				this.infoSearch = '';
			},

			// 请求退单详情
			noOrder: function() {
				orderFade.orderPage = 0;
				this.startTime = new Date().getZero();
				this.endTime = (new Date()).getTime() + 1000 * ((59 -  new Date().getSeconds()) + 60 * (59 - new Date().getMinutes()) + 60 * 60 * (24 - new Date().getHours()-1));
				this.init();
				this.withoutOrderBtn = true;
				this.infoSearch = '';
			},
			checkDate: function(){
				var day = new Date(this.endTime);
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

			// 根据日期筛选退单
			searcg: function() {
				this.checkDate();
				this.startTime = new Date(this.startTime).getZero();
				var endT = this.endTime+1000 * 60 * 60 * 24 * 1;
  				this.endTime = new Date(endT).getZero() - 1000;
				this.init();
			},

			// 根据订单号筛选退单
			searchOrNum: function(str) {
				var re = /\d+/g;
				if (str == '') {
					this.init();
					return ;
				} else if(str != '' && !re.test(str)) {
					alert('请输入数字');
					return ;
				}
				sd.request('order/getHistoryOrderDetail', {
					shopId: userData.currentShop.id,
					oid: str
				}, false, function(data) {
					if(data.error) {
						sd.log(data.error)
					} else {
						orderFade.withoutOrder = [];
						var list = data.data.order;
						if(!list) return;
						orderFade.page = 0;
						orderFade.total = 1;
						orderFade.count = 1;
						list.updateTime = (new Date(Number(list.updateTime) * 1000)).format('yyyy.MM.dd/hh:mm');
						
						orderFade.withoutOrder.push(sd.copy(list));
					}
				}, function() {}, 'get');
			},

			// 根据菜名筛选
			searcgInFood: function() {
				this.page = 0;
				this.foodInt();
			},
			
			// 根据日期选退菜
			searcgFood: function() {
				this.infoSearch = '';
				this.checkDate();
				this.startTime = new Date(this.startTime).getZero();
  				var endT = this.endTime+1000 * 60 * 60 * 24 * 1;
  				this.endTime = new Date(endT).getZero() - 1000;
				this.foodInt();
			},

			// 下一页
			goOrderPage: function(page) {
				this.infoSearch = '';
				this.init();
			},
			goCaiPage: function(page){
				this.infoSearch = '';
				this.foodInt();
			},
			
			// 初始化方法
			init: function() {
				sd.request('Order/getDelOrder', {
					shopId: userData.currentShop.id,
					startTime: parseInt(orderFade.startTime/1000),
					endTime: parseInt(orderFade.endTime/1000),
					page: orderFade.orderPage + 1,
					num: orderFade.num
				}, false, function(data) {
					if(data.error) {
						sd.log(data);
					} else {
						var list = data.data.list;
						if(!list) return;
						orderFade.total = data.data.total;
						orderFade.count = parseInt(data.data.count);
						sd.log(data)
						for(var i = 0; i < list.length; i++) {
							list[i].updateTime = (new Date(Number(list[i].updateTime) * 1000)).format('yyyy.MM.dd/hh:mm');
						}
						
						orderFade.withoutOrder = list;
					}
				}, function() {}, 'get');
			}
		}
	})

	// 页面初始化
	orderFade.init();
})