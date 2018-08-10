/*
 * 
 * @file 挂账明细
 * @author deshui.yu 
 * 
 */

sd.controller(['order-bill.html'],function(){
	$('#userbox').html(sd.getHtml('order-bill.html'));
	$('#hhhh span').click(function() {
		$(this).addClass('active').siblings('span').removeClass('active')
	})
	
	var orderBill = new Vue({
		el: '#orBill',
		data: {
			comDetails: [], // 商品详情
			foodDEtails: [], // 退菜详情
			orderDetails: null
		},
		methods: {
			// 获取商品详情
			comDetailsFn: function(){
				
			},
			
			// 获取退菜详情
			foodDEtailsFn: function(){
				
			}
		}
	})
	
	// 初始化
		sd.addEvent('goDetails','onlyId',function(params){
			sd.log(params);
		})
		sd.request('Order/billDelite',{
			oid: 0
		},false,function(data){
			if(data.error){
				sd.log(data);
			} else {
				var list = data.data.list;
				if (!list) {
					return ;
				}
				for(var i = 0; i < list.length; i++) {
					list[i].selected = false;
					list[i].updateTime = (new Date(Number(list[i].updateTime) * 1000)).format('yyyy.MM.dd/hh:mm');
				}
				orderCre.orderCredit = list;
				orderCre.total = data.data.total;
			}
		},function(data){
			
		},'get' );
})