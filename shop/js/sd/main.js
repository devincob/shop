/**
 * @file
 * 主模块
 * index页面
 *
 * @author chenggong.jiang
 */
sd.controller([
        'main.html',
        'js/sd/ctr/vue-gc.js',
        'js/sd/components.js',
        'js/sd/server.js'
    ],
    function() {
        // 清除所有事件
        sd.removeAllEvent();
        // 清除所有检查
        sd.removeAllWatch();
        // 清除所有路由
        sd.removeAllRouter();
        // 登录验证
        var userData = sd.session("userShop");
        if(userData && userData.accessToken && userData.currentShop) {
            sd.send.token = userData.accessToken;
            sd.send.shopId = userData.currentShop.id;
        } else {
            sd.controller(['js/sd/login.js']);
            return;
        }
        var params = sd.getRouterParams();
        if(params === null || (params.page != 'main' && params.page != 'login')) {
            sd.session(null);
            sd.controller(['js/sd/login.js']);
            return;
        } else {
            if(params.f === undefined) {
                params.f = 0;
            }
            if(params.s === undefined) {
                params.s = 0;
            }
        }
        // 加载login.html到页面
        $('body').html(sd.getHtml('main.html'));

        if(!$.isArray(userData.accessList)) userData.accessList = [];

        // 这一版本不展示“订单概况”
        for(var i = 0; i < userData.accessList.length; i++) {
            var item = userData.accessList[i];
            if(item.title + '' === '订单管理') {
                var childs = item.child;
                for(var j = 0; j < childs.length; j++) {
                    if(childs[j].title === '订单概况') {
                        childs.splice(j, 1);
                        break;
                    }
                }
                break;
            }
        }

        //      sd.log(userData.accessList);
        var homepage = [{
            "id": 0,
            "name": "首页",
            "child": []
        }];
        //      userData.accessList = homepage.concat(userData.accessList);

        // 创建界面菜单处理模块
        var app = new Vue({
            el: '#app',
            data: {
                first: 0,
                second: 0,
                breadcrumb: [],
                firstMenu: userData.accessList,
                secondMenu: userData.accessList.length > 0 ? userData.accessList[0].child : [],
                shopName: userData.currentShop.shopName
            },
            methods: {
                getFirstClass: function(title) {
                    switch(title) {
                        case '首页': // 首页
                            return 'admin';
                        case '商品配置': //商品配置
                            return 'goods';
                        case '店铺配置': //店铺配置
                            return 'store';
                        case '订单管理': //订单管理
                            return 'order';
                        case '统计管理': //统计管理
                            return 'statistical';
                    }
                    return 'admin';
                },
                breadcrumbClick: function() {
                    sd.refreshPage();
                }
            },
        });

        sd.addEvent('shopNameChanged', 'index', function(shopName) {
            app.shopName = shopName;
        })

        // 添加页面路由
        sd.addRouter('main', function(data) {
            // 清空容器内容
            $('#userbox').html('');
            // 清空search内容
            $('#search').html('');
            app.first = parseInt(data.f);
            app.second = parseInt(data.s);
            var firstList = app.firstMenu;
            var secendList = firstList.length > app.first ? firstList[app.first].child : [];

            app.secondMenu = secendList;

            // 添加一级面包屑
            if(firstList.length > app.first)
                app.breadcrumb = [{
                    title: firstList[app.first].title,
                    url: '#main&f=' + app.first + '&s=0',
                    class: 'first'
                }];

            // 添加二级面包屑
            if(secendList.length > app.second) {
                app.breadcrumb.push({
                    title: secendList[app.second].title,
                    url: '#main&f=' + app.first + '&s=' + app.second,
                    class: 'second'
                });
            }

            switch(firstList[app.first].title) {
                case '首页': // 首页
                    sd.controller(['js/sd/homepage.js']);
                    break;
                case '商品配置': // 商品配置
                    if(secendList.length > 0)
                        switch(secendList[app.second].title) {
                            case '商品管理': // 商品管理
                                sd.controller(['js/sd/com.js']);
                                break;
                            case '套餐管理': // 套餐管理
                                sd.controller(['js/sd/package.js']);
                                break;
                            case '分类管理': // 分类管理
                                sd.controller(['js/sd/categories.js']);
                                break;
                            case '口味管理': // 口味管理
                                sd.controller(['js/sd/tastecontrol.js']);
                                break;
                            case '库存管理': // 库存管理
                                sd.controller(['js/sd/invcontrol.js']);
                                break;
                                // 库存预警
                                //case '库存预警': 
                                //      sd.controller(['js/sd/inventory.js']);
                                //      break;
                            default:
                                sd.controller(['js/sd/default.js']);
                                break;
                        }
                    break;
                case '店铺配置': // 店铺配置
                    if(secendList.length > 0)
                        switch(secendList[app.second].title) {
                            case '员工管理': // 员工管理
                                sd.controller(['js/sd/employemanage.js']);
                                break;
                            case '职位管理': // 职位管理
                                sd.controller(['js/sd/jobmanage.js']);
                                break;
                            case '区域管理': // 区域管理
                                sd.controller(['js/sd/areamanage.js']);
                                break;
                            case '桌台管理': // 桌台管理
                                sd.controller(['js/sd/tablemanage.js']);
                                break;
                            case '服务费管理': // 服务费管理
                                sd.controller(['js/sd/servicefee.js']);
                                break;
                            case '积分管理': // 积分管理
                                sd.controller(['js/sd/jifen.js']);
                                break;
                            case '打印机管理': // 打印机管理
                                sd.controller(['js/sd/printerman.js']);
                                break;
                            case '打印机配置': // 打印机配置
                                sd.controller(['js/sd/printercon.js']);
                                break;
                            case '打印机错误': // 打印机错误
                                sd.controller(['js/sd/printerror.js']);
                                break;
                            case '打印队列': // 打印队列
                                sd.controller(['js/sd/print-queue.js']);
                                break;
                            case '商家编号': // 商家编号
                                sd.controller(['js/sd/shopnum.js']);
                                break;
                            case '轮播图': // 轮播图
                                sd.controller(['js/sd/lunbo.js']);
                                break;
                            case '基本信息': // 基本信息
                                sd.controller(['js/sd/base.js']);
                                break;
                            case '退菜原因': // 退菜原因
                                sd.controller(['js/sd/refund-food.js']);
                                break;
                            case '支付方式': // 支付方式
                                sd.controller(['js/sd/payment-way.js']);
                                break;
                            default:
                                sd.controller(['js/sd/default.js']);
                                break;
                        }
                    break;
                case '订单管理': // 订单管理
                    if(secendList.length > 0)
                        switch(secendList[app.second].title) {
                            case '订单概况': // 订单概况
                                //sd.controller(['js/sd/order-detail.js']);
                                break;
                            case '退菜/单管理': // 退菜/单管理
                                sd.controller(['js/sd/order-fade.js']);
                                break;
                            case '挂账统计': // 挂账统计
                                sd.controller(['js/sd/order-credit.js']);
                                break;
                            case '预定管理': // 预定管理
                                sd.controller(['js/sd/order-reserve.js']);
                                break;
                            default:
                                sd.controller(['js/sd/default.js']);
                                break;
                        }
                    break;
                case '统计管理': // 统计管理
                    if(secendList.length > 0)
                        switch(secendList[app.second].title) {
                            case '订单统计': // 订单统计
                                sd.controller(['js/sd/statistics-order.js']);
                                break;
                            case '桌台统计': // 桌台统计
                                sd.controller(['js/sd/statistics-table.js']);
                                break;
                            case '分类统计': // 分类统计
                                sd.controller(['js/sd/statistics-category.js']);
                                break;
                            case '口味统计': // 口味统计
                                sd.controller(['js/sd/statistics-taste.js']);
                                break;
                            case '交接班': // 交接班
                                sd.controller(['js/sd/statistics-handover.js']);
                                break;
                            default:
                                sd.controller(['js/sd/default.js']);
                                break;
                        }
                    break;
                default:
                    sd.controller(['js/sd/default.js']);
                    break;
            }

        });

        var loginoutHandle = function(args) {
            sd.session(null);
            sd.removeAllRouter();
            sd.removeAllEvent();
            sd.removeAllWatch();
            sd.controller(['js/sd/login.js']);
        };
        // 退出登录
        sd.addRouter("loginout", loginoutHandle);
        // 当请求中发现token超时，或者账号在其他地方登录了
        sd.addEvent('loginout', 'main', function() {
            setTimeout(loginoutHandle, 1000);
        });

        if(params.page === 'login') {
            location.href = sd.webHost + "#main&f=0&s=0";
        }
        sd.refreshPage();
    });