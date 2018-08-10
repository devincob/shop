/*
 * 
 * @file 挂账管理
 * @author deshui.yu 
 * 
 */

sd.controller(['statistics-table.html', 'js/sd/ui/win.js'], function() {

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
	$('#userbox').html(sd.getHtml('statistics-table.html'));

	var newWindow = sd.getClass('ui.win');
	var pwin = $('#statTable');
	var pwinHtml = pwin.get(0).outerHTML;
	pwin.remove();

	var st = new Vue({
		el: '#statisticsTable',
		data: {
			startTime: new Date().getTime() - 1000 * 60 * 60 * new Date().getHours(), //日期组件的开始时间
			endTime: new Date().getTime(), //日期组件的结束时间
			allDetails: [], // 全部数据
			copyAllDetails: [], // 复制一份全部的数据
			allArea: '全部区域', // 区域
			areaList: ['全部区域'], // 区域列表
			allTable: '全部桌台', // 桌台
			tableList: ['全部桌台'], // 桌台列表
			soFarDetails: null, // 当前桌台详情
			areaBtn: false, // 区域列表
			tableBtn: false // 桌台列表
		},
		methods: {

			// 初始化
			init: function() {
				sd.log(this.startTime);
				var _this = this;
				sd.request('Statistics/tableStatisticsList', {
					shopId: userData.currentShop.id,
					startTime: parseInt(_this.startTime)/1000,
					endTime: parseInt(_this.endTime)/1000
				}, false, function(data) {
					if(data.error) {
						return;
					}
					sd.log(data)
					var list = data.data.list;
					if(!list) {
						return;
					}
					for (var i=0; i<list.length; i++) {
						st.areaList.push(list[i].areaName);
						st.tableList.push(list[i].tableName);
					}
					$.unique(st.areaList);
					$.unique(st.tableList);
					st.copyAllDetails = sd.copy(list);
					st.allDetails = list;
				}, function() {}, 'get')
			},

			// 根据日期搜索
			searInDate: function() {
				var day = new Date(Number(this.endTime));
  				var st = parseInt(this.startTime / 1000);
  				var et = new Date(day.getFullYear() + '-' + 　(day.getMonth() + 　1) + '-' + '01').getTime() / 1000;
  				if (st < et) {
  					alert('只能选择本月时间');
  					this.startTime = new Date(day.getFullYear() + '-' + 　(day.getMonth() + 　1) + '-' + '01').getTime();
  					return ;
  				}
				this.init();
			},

			// 根据区域和桌台号搜索
			searInBill: function() {
				var list = sd.copy(this.copyAllDetails);
				if (this.allArea == '全部区域' && this.allTable != '全部桌台') {
					var copyList = [];
					for (var i=0; i<list.length; i++) {
						if (list[i].tableName == this.allTable) {
							copyList.push(list[i]);
						}
					}
					this.allDetails = copyList;
				} else if (this.allArea != '全部区域' && this.allTable != '全部桌台') {
					var copyList = [];
					for (var i=0; i<list.length; i++) {
						if (list[i].tableName == this.allTable && list[i].areaName == this.allArea) {
							copyList.push(list[i]);
						}
					}
					this.allDetails = copyList;
				} else if (this.allArea != '全部区域' && this.allTable == '全部桌台') {
					var copyList = [];
					for (var i=0; i<list.length; i++) {
						sd.log(this.allArea);
						sd.log(list[i].areaName);
						sd.log(list[i].areaName == this.allArea);
						if (list[i].areaName == this.allArea) {
							copyList.push(list[i]);
						}
					}
					sd.log(copyList)
					this.allDetails = copyList;
				} else if (this.allArea == '全部区域' && this.allTable == '全部桌台') {
					this.allDetails = list;
				}
				sd.log(this.allDetails)
			},

			// 弹出详情页
			showDetails: function(data) {
				this.maskWindow(data);
			},

			// 模拟select选择框
			selectUlArea: function(data) {
				this.allArea = data;
			},
			selectUlTable: function(data) {
				this.allTable = data;
			},

			// 显示area列表
			showAreaList: function(e) {
				e.stopPropagation();
				this.areaBtn = !this.areaBtn;
				this.tableBtn = false;
			},

			// 显示table列表
			showTableList: function(e) {
				e.stopPropagation();
				this.areaBtn = false;
				this.tableBtn = !this.tableBtn;
			},

			// 点击body
			clickBody: function() {
				this.areaBtn = false;
				this.tableBtn = false;
			},

			// 显示弹窗
			maskWindow: function(obj) {
				var title = obj.areaName + '-' + obj.tableName;
				var height = $(window).height();
				var win = new newWindow(700, 760, title, pwinHtml);
				$('.win-body').css('max-height', height);
				win.open('right');

				var statTable = new Vue({
					el: '#statTable',
					data: {
						tableDetails: {
							time: '',
							goods: []
						}, // 当前选中桌台的全部信息
						tableTotalDetails: obj,
						billTime: 0
					},
					methods: {
						init: function() {
							sd.request('Statistics/tableDetailStatistics', {
								shopId: userData.currentShop.id,
								startTime: st.startTime / 1000,
								endTime: st.endTime / 1000,
								tableId: obj.tableId
							}, false, function(data) {
								if(data.error) {
									return;
								}
								if (!data.data.package) {
									data.data.package = [];
								}
								if (!data.data.goods) {
									data.data.goods = [];
								}
								var goods = data.data.goods.concat(data.data.package);
								data.time = (new Date(Number(data.time) * 1000)).format('yyyy.MM.dd/hh:mm');
								statTable.tableDetails.time = data.time;
								statTable.tableDetails.goods = goods;
								sd.log(statTable.tableDetails)
								
							}, function() {}, 'get')
						}
					}
				})
				statTable.init()
			}
		},
		ready: function() {
			this.init();
		}
	})

})