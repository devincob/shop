/*
 * 
 * @file 挂账管理
 * @author deshui.yu 
 * 
 */

sd.controller(['order-credit.html', 'js/sd/ui/win.js'], function() {
	// 获取本地信息
	var userData = sd.session("userShop");
	if(userData) {
		sd.send.token = userData.accessToken;
	} else {
		sd.toPage('login.html');
	}

	//加载页面
	$('#userbox').html(sd.getHtml('order-credit.html'));

	var pwin = $('#orBatch');
	var pwinHtml = pwin.get(0).outerHTML;
	pwin.remove();

	var orderCre = new Vue({
		el: '#orMaRetreat',
		data: {
			orderCredit: [],
			startTime: (new Date()).getZero(), //日期组件的开始时间
			endTime: (new Date()).getTime() + 1000 * ((59 -  new Date().getSeconds()) + 60 * (59 - new Date().getMinutes()) + 60 * 60 * (24 - new Date().getHours()-1)), //日期组件的结束时间
			page: 0, // 当前页
			num: 5, // 每一页多少条数据
			len: 0,
			total: 1, // 总共有多少页
			moreSettle: [], // 保存选中的数据
			showDetails: true, // 显示详情
			comDetails: [], // 商品详情
			foodDetails: [], // 退菜详情
			orderDetails: null, // 详情页
			controBtn: true,
			searchInfo: '', // 订单号
			bu: '', // 挂账账号
			totalCount: { // 该订单的详情
				goodsTotal: 0,
				totalParice: 0,
				totalZhekou: 0,
				totalShiJi: 0
			},
			tableName: '', //桌台名
			areaName: '' //区域名
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
			getOneTable: function(id, callback) {
				sd.request("Table/getOneTable", {
						id: id
					}, false, function(json) {
						if(json.error) {
							alert("提示信息", json.error.message);
							return false;
						} else {
							callback(json.data);
							return;
						}
					},
					function(json) {
						if(json.error) {
							alert("提示信息", json.error.message)
							return false;
						} else {

						}
					}, "get");
			},
			getAreaInfo: function(id, callback) {
				sd.request("Area/getOneArea", {
						id: id
					}, false, function(json) {
						if(json.error) {
							alert("提示信息", json.error.message);
							return false;
						} else {
							callback(json.data.areaName);
							return;
						}
					},
					function(json) {
						if(json.error) {
							alert("提示信息", json.error.message)
							return false;
						} else {

						}
					}, "get");
			},

			// 结清
			orCSettle: function(data) {
				var obj = {
					oid: data.oid, // 单号
					payment: data.payment, // 应支付
					type: data.type, // 类型
					price: data.price,
					settleType: false, // 是否是批量结清
					num: 1 // 总单数
				};

				this.showWinOne(obj);
			},

			// 全部结清
			orCSettleAll: function() {
				var obj = {};
				var arr = [];
				var payment = 0;
				var price = 0;
				if(this.moreSettle.length > 0) {
					for(var i = 0; i < this.moreSettle.length; i++) {
						arr.push(this.moreSettle[i].oid);
						payment += parseInt(this.moreSettle[i].payment);
						price += parseInt(this.moreSettle[i].price)
					}
					var str = arr.join(',');
					obj.oid = str;
					obj.payment = payment;
					obj.price = price;
					obj.settleType = true;
					obj.type = this.moreSettle[0].type;
					obj.num = this.moreSettle.length;
					this.showWinOne(obj);
				}
			},

			// 详情
			goDetails: function(json) {
				sd.request('Order/billDelite', {
					oid: parseInt(json.oid)
				}, false, function(data) {
					if(data.error) {
						alert(data);
						return;
					}
					if(!data.data) {
						alert(data)
						return;
					}
					sd.log(data);
					orderCre.orderDetails = data.data.order;
					var thing = [];
					if(data.data.orderDetail.package && data.data.orderDetail.goods) {
						thing = data.data.orderDetail.goods.concat(data.data.orderDetail.package);
					} else if(data.data.orderDetail.goods) {
						thing = data.data.orderDetail.goods;
					} else if(data.data.orderDetail.package) {
						thing = data.data.orderDetail.package;
					}
					var totalParice = 0;
					var totalZhekou = 0;
					var totalShiJi = 0;
					
					for(var i = 0; i < thing.length; i++) {
						totalParice += thing[i].itemTotal ? Number(thing[i].itemTotal) : Number(thing[i].package.itemTotal);
						totalZhekou += Number(thing[i].itemDiscount) ? Number(thing[i].itemDiscount) : Number(thing[i].package.itemDiscount);
						totalShiJi += Number(thing[i].itemPrice) ? Number(thing[i].itemPrice) : Number(thing[i].package.itemPrice);
					}
					orderCre.orderDetails.updateTime = (new Date(Number(orderCre.orderDetails.updateTime) * 1000)).format('yyyy.MM.dd/hh:mm');
					orderCre.orderDetails.createTime = (new Date(Number(orderCre.orderDetails.createTime) * 1000)).format('yyyy.MM.dd/hh:mm');
					orderCre.orderDetails.status = '挂账';
					orderCre.comDetails = thing;
					orderCre.foodDEtails = data.data.orderDetail.returnGoods ? data.data.orderDetail.returnGoods : [];

					orderCre.getOneTable(orderCre.orderDetails.tableId, function(info1) {
						orderCre.tableName = info1.tableName;
						var areaId = info1.areaId;
						orderCre.getAreaInfo(areaId, function(info2) {
							orderCre.areaName = info2;
						});

					});

					orderCre.totalCount.goodsTotal = data.data.orderDetail.goodsTotal;
					orderCre.totalCount.totalParice = totalParice;
					orderCre.totalCount.totalZhekou = totalZhekou;
					orderCre.totalCount.totalShiJi = totalShiJi;

					orderCre.showDetails = false;
				}, function(data) {

				}, 'post');

			},

			// 点击选中
			ocSel: function(data) {
				data.selected = !data.selected;
				var btn = true;
				for(var i = 0; i < this.moreSettle.length; i++) {
					if(data.oid == this.moreSettle[i].oid) {
						this.moreSettle.splice(i, 1);
						i--;
						btn = false;
						break;
					}
				}
				if(btn) {
					this.moreSettle.push(sd.copy(data));
				}
			},

			// 全部选中
			allSelected: function() {
				if(this.moreSettle.length == this.len) {
					for(var i = 0; i < this.orderCredit.length; i++) {
						this.orderCredit[i].selected = false;
					}
					this.moreSettle = [];
				} else {
					for(var i = 0; i < this.orderCredit.length; i++) {
						this.orderCredit[i].selected = true;
					}
					this.moreSettle = sd.copy(this.orderCredit);
				}
			},

			// 根据日期筛选
			searchInDate: function() {
				this.checkDate();
				this.startTime = new Date(this.startTime).getZero();
				var endT = this.endTime+1000 * 60 * 60 * 24 * 1;
  				this.endTime = new Date(endT).getZero() - 1000;
				orderCre.page = 0;
				orderCre.total = 0;
				this.init();
			},

			// 删除
			orderDelete: function(data) {
				confirm("温馨提示", "确定要删除吗？", function() {
					sd.request('Order/delBillOrder', {
						shopId: userData.currentShop.id,
						oid: parseInt(data.oid)
					}, false, function(data) {
						if(data.error) {
							alert(data.error.message)
						}
						orderCre.init();
					}, function() {}, 'post');
				})

			},

			//
			conBtn: function() {
				this.controBtn = true;
			},
			foodBtn: function() {
				this.controBtn = false;
			},

			// 通过挂账账号和订单号查询
			searchBill: function() {
				this.checkDate();
				var day = new Date();
				orderCre.page = 0;
				orderCre.total = 0
				if(this.bu == '') {
					alert('请输入挂账账号');
					return;
				}
				if(this.searchInfo == '') {
					alert('请输入订单号');
					return;
				}
				var re = /\d+/g;
				if(!re.test(orderCre.searchInfo)) {
					orderCre.searchInfo = '';
					alert('订单号须输入数字');
				}

				sd.request('Order/searchBill', {
					shopId: userData.currentShop.id,
					oid: parseInt(orderCre.searchInfo),
					billUser: orderCre.bu,
					startTime: parseInt(orderCre.startTime / 1000),
					endTime: parseInt(orderCre.endTime / 1000),
					page: orderCre.page + 1,
					num: orderCre.num
				}, false, function(data) {
					if(data.error) {
						sd.log(data)
					} else {
						var list = data.data.list;
						sd.log(data);
						if(!data.data) {
							alert('未查找到该定单');
						}
						if(!list) {
							return;
						}
						for(var i = 0; i < list.length; i++) {
							list[i].selected = false;
							list[i].updateTime = (new Date(Number(list[i].updateTime) * 1000)).format('yyyy.MM.dd/hh:mm');
						}
						orderCre.orderCredit = list;
					}
				}, function(data) {
					sd.log(data)
				}, 'get')
			},

			// 跳页
			goPage: function(pageNum) {
				this.moreSettle = [];
				this.init();
			},
			init: function() {
				//(new Date()).getTime() + 1000 * ((59 -  new Date().getSeconds()) + 60 * (59 - new Date().getMinutes()) + 60 * 60 * (24 - new Date().getHours()-1))
				sd.request('Order/getOrderBillList', {
					shopId: userData.currentShop.id,
					startTime: parseInt(orderCre.startTime / 1000),
					endTime: parseInt(orderCre.endTime / 1000),
					page: orderCre.page + 1,
					num: orderCre.num
				}, false, function(data) {
					if(data.error) {
						sd.log(data);
					} else {
						var list = data.data.list;
						sd.log(data)
						if(!list) {

							return;
						}
						for(var i = 0; i < list.length; i++) {
							list[i].selected = false;
							list[i].createTime = (new Date(Number(list[i].updateTime) * 1000)).format('yyyy.MM.dd/hh:mm');
						}
						orderCre.orderCredit = list;
						orderCre.len = list.length;
						orderCre.total = data.data.total;
					}
				}, function(data) {
					sd.log(data)
				}, 'get');
			},

			// 显示弹窗
			showWinOne: function(obj) {
				var Danteng = sd.getClass('ui.win');
				var title = obj.settleType ? '批量结清' : '结清';
				var datailWin = new Danteng(560, 180, title, pwinHtml, function(datailWin) {
					if(!obj.settleType) {
						sd.request('Order/settle', {
							oid: obj.oid,
							payment: parseInt(obj.payment),
							type: 1
						}, false, function(data) {
							if(data.error) {
								sd.log(data);
								return;
							}

						}, function(error) {}, 'post');
					} else {
						sd.request('Order/settleAll', {
							oidString: obj.oid,
							payment: parseInt(obj.payment),
							type: 1
						}, false, function(data) {
							if(data.error) {
								sd.log(data.error.message);
								return;
							}
						}, function(data) {
							alert(data);
						}, 'post');
					}
					orderCre.init();
				}, function(datailWin) {})
				datailWin.open('center');

				var orderBatch = new Vue({
					el: '#orBatch',
					data: {
						num: obj.num, // 结清的账单数
						price: obj.price, // 应付
						payment: obj.payment, // 实付
						settleType: obj.settleType // 是否是批量结清
					}
				})

			},
			getTwenty: function() {
				var day = new Date();
				var seconds = day.getTime();
				if ((day - this.endTime) >= 1000*60*60*24) {
					this.endTime += (24-day.getHours()-1)*1000*60*60;
				}
			}
		}
	});

	// 初始化
	orderCre.init();
})