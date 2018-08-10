/**
 * @file
 * 
 *分类管理
 * @author daxu.wang
 */
sd.controller([
    'categories.html',
    'js/sd/ui/win.js'
], function() {
    // 获取登录信息
    var userData = sd.session("userShop");
    if(userData && userData.accessToken && userData.currentShop) {
        sd.send.token = userData.accessToken;
        sd.send.shopId = userData.currentShop.id;
    } else {
        sd.controller(['js/sd/login.js']);
        return;
    }

    var userId = userData.user.id;

    $('#userbox').html('');
    // 加载admin模块html到页面
    $('#userbox').html(sd.getHtml('categories.html'));
    // 清空search内容
    $('#search').html('');
    // search区域内容
    //$('#search').html();
    $('#userbox').append($('#invent-show').get(0));
    var numString = /^[^\'\’\“\"\&]*$/;
    //显示列表Vue
    var cateGoriesInfo = new Vue({
        el: '#cate-gories',
        data: {
            classifyInfo: [],
            Create: false,
            Sort: true,
            copyclassifyInfo: [],
            focus: false,
            showWidth: 0,
            contentChange: false,

        },
        watch: {
            'classifyInfo': 'classifyInfoChanged',
            'Sort': 'classifyInfoChanged2'
        },
        methods: {
            classifyInfoChanged: function() {
                if(this.Sort) {

                } else {

                }
                this.showWidth = this.classifyInfo.length * 260 + 260;
            },
            classifyInfoChanged2: function() {
                this.showWidth = this.classifyInfo.length * 260 + 410;
            },
            mainCate: function(obj, index) {

                var t = $(obj.target);
                var i = 0;
                while(t && i < 20) {
                    if(t.hasClass('cate-showclass')) { //点击总的大框
                        if(!this.Sort) {
                            this.mainMove(t, index);
                        }
                        return;
                    } else if(t.hasClass('oneClassfiyEdit')) { //点击一级分类的修改
                        if(this.focus) return;
                        var editInput = t.parent().find("input");
                        var _this = this;
                        var content = editInput.val();
                        editInput.removeAttr("readonly");
                        setTimeout(function() {
                            _this.focus = true;
                            $(editInput.get(0)).focus();
                            editInput.bind("blur", function() {
                                _this.focus = false;
                                editInput.unbind();
                                editInput.css({
                                    border: "none"
                                });

                                editInput.prop("readonly", "readonly");
                                var con = editInput.val();

                                if(con === content) {
                                    return;
                                }
                                //正则验证

                                confirm("操作提示", "确定修改分类吗？", function() {
                                    var cid = t.attr("indexof");
                                    if(!numString.test(con)) {
                                        alert("提示信息", "一级分类名不能含有&和引号", function() {
                                            setTimeout(function() {

                                                editInput.removeAttr("readonly");
                                                editInput.focus();
                                                _this.mainCate(obj, index);
                                                editInput.css({
                                                    border: "1px solid red"
                                                });
                                            }, 20)
                                        })

                                        return false;
                                    };
                                    sd.request("Category/editCategory", {
                                        name: con,
                                        uid: userData.user.id,
                                        cid: cid,
                                        shopId: userData.currentShop.id

                                    }, false, function(json) {
                                        // 编辑窗口Vue
                                        if(json.error) {
                                            alert(json.error.code + '错误', json.error.message);
                                        } else {
                                            if(!index) {
                                                index = 0;
                                        }
                                            editInput.val(json.data.name);
                                        }

                                    }, function(json) {

                                    }, "post", false);

                                }, function() {
                                    //                                  t.parent().find("input").val(content);
                                    //                                  editInput.val(content);
                                    cateGoriesInfo.classifyInfo[index].name = content;
                                });

                            })

                        }, 50)
                        editInput.css({
                            border: "1px solid #29A7E1",
                            height: "38px"
                        });
                        return;
                    } else if(t.hasClass('oneClassfiyDelete')) { //点击一级分类的删除

                        confirm("操作提示", "确定要删除吗？", function() {
                            var indexOne = t.attr("indexof");
                            cateGoriesInfo.deleteClassify(indexOne, index);
                        })
                        return;
                    } else if(t.hasClass('second-class')) { //点击二级分类
                        if(!this.Sort) {
                            this.twoClassifyMove(t, index);

                        }
                        return;
                    } else if(t.hasClass('cateTwoEdit')) { //点击二级分类修改

                        if(this.focus) return;
                        var editInput = t.parent().find("input");
                        var _this = this;
                        var content = editInput.val();
                        editInput.removeAttr("readonly");
                        setTimeout(function() {
                            _this.focus = true;
                            $(editInput.get(0)).focus();
                            editInput.bind("blur", function() {
                                var con = editInput.val();
                                _this.focus = false;
                                editInput.unbind();
                                //正则验证
                                //                            
                                editInput.css({
                                    border: "none"
                                });
                                editInput.prop("readonly", "readonly");

                                if(con === content) {
                                    return;
                                }

                                confirm("操作提示", "确定修改分类吗？", function() {

                                    var con = editInput.val();
                                    if(!numString.test(con)) {
                                        alert("提示信息", "一级分类名不能含有&和引号", function() {
                                            setTimeout(function() {

                                                editInput.removeAttr("readonly");
                                                editInput.focus();
                                                _this.mainCate(obj, index);
                                                editInput.css({
                                                    border: "1px solid red"
                                                });
                                            }, 20)
                                        })

                                        return false;
                                    };
                                    var cid = editInput.prev().attr("indexof");

                                    sd.request("Category/editCategory", {
                                        name: con,
                                        uid: userData.user.id,
                                        cid: cid,
                                        shopId: userData.currentShop.id

                                    }, false, function(json) {
                                        // 编辑窗口Vue
                                        
                                        if(json.error) {
                                            alert(json.error.code + '错误', json.error.message);
                                        } else {
                                        
                                        if(!index) {
                                            index = 0;
                                        }

                                        cateGoriesInfo.classifyInfo[index].child[t.index()].name = con;

                                        editInput.val(json.data.name)
                                        }
                                    }, function(json) {
                                        alert("温馨提示", json.error.message);
                                        return false;
                                    }, "post", false);

                                }, function() {
                                    editInput.val(content)
                                });

                            })
                        }, 50)
                        editInput.css({
                            border: "1px solid #29A7E1",
                            height: "38px"
                        });

                        return;
                    } else if(t.hasClass('cateTwoDelete')) { //点击二级分类删除
                        confirm("操作提示", "确定要删除吗？", function() {
                            var indexTwo = t.attr("indexof");
                            // 二级分类的下标
                            var indexC = t.parent().index();
                            if(!index) {
                                index = 0;
                            }
                            cateGoriesInfo.deleteClassifyT(indexTwo, index, indexC);
                        })
                        return;
                    } else if(t.hasClass('secondClass-key')) { //创建二级分类
                        $(".secondClass-content").eq(index).show();
                        return;
                    } else if(t.hasClass('cate-addclassed-esc')) { //创建二级分类取消
                        $(".secondClass-content").eq(index).hide();
                        $(".secondClass-key-input").eq(index).val("");

                        return;
                    } else if(t.hasClass('cate-addclassed-ent')) { //创建二级分类确认
                        var pid = t.attr("pid");
                        //正则验证
                        var nameT = $(".secondClass-key-input").eq(index).val()
                        if(!numString.test(nameT)) {
                            alert("提示信息", "二级分类名不能含有&和引号")
                            return false;
                        };
                        sd.request("Category/addCategory", {
                            shopId: userData.currentShop.id,
                            pid: pid,
                            name: nameT,
                            uid: userData.user.id
                        }, false, function(json) {
                            if(json.error) {
                                alert(json.error.code + '错误', json.error.message);
                            }
                            if(!index) {
                                index = 0;
                            }

                            cateGoriesInfo.classifyInfo[index].child.push(json.data);

                        }, function(json) {
                            alert("温馨提示", json.error);
                            return false;
                        }, "post", false);
                        //对应的数据添加

                        $(".secondClass-content").eq(index).hide();
                        $(".secondClass-key-input").eq(index).val("");

                        return;
                    } else if(t.hasClass('secondClass-key-input')) { //点击输入框

                        return;
                    }

                    if(t.parent()) t = t.parent();
                    else break;
                }
            },
            mainMove: function(obj, i) {
                var positionInfo = {}; //记录拖拽偏移量的信息
                var placeholderParent = $("#placeholderParent");
                //元素鼠标按下时执行的操作             
                $(".mouseImg").eq(i).show();
                //获取高
                var height = obj.innerHeight();
                //获取到的高给placeholderParent来占位
                if(obj.index() == cateGoriesInfo.classifyInfo.length) {
                    $(placeholderParent).insertAfter(obj);
                } else {
                    $(placeholderParent).insertBefore(obj.next());
                }
                $(placeholderParent).height(height);
                $(placeholderParent).show();
                if(!ev) var ev = event;

                var disX = ev.clientX;
                var disY = ev.clientY;
                var left = obj.offset().left;
                var top = obj.offset().top;
                var oldScollX = document.documentElement.scrollLeft || document.body.scrollLeft; //滚动的距离
                var oldScollY = document.documentElement.scrollTop || document.body.scrollTop; //滚动的距离
                obj.addClass("pa");

                obj.css({
                    left: left,
                    top: top
                })
                var Xlength = 0; //点击的距离
                var ofsetObj = {
                    num: 0,
                    finalNum: 0
                };
                sd.addWatch('scroll', function() {
                    if(ofsetObj.num > 0) {
                        $(window).scrollLeft($(window).scrollLeft() + 10);
                        if($(window).scrollLeft() >= ofsetObj.finalNum) {}
                    } else {
                        $(window).scrollLeft($(window).scrollLeft() - 10);
                        if($(window).scrollLeft() <= 0) {}
                    }
                });

                //获取到自身的宽度
                document.onmousemove = function(event) {
                    var eve = event || window.event;
                    var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft; //滚动的距离
                    var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
                    var endLeft = left + eve.clientX - disX + (scrollX - oldScollX) + "px";
                    var endTop = top + eve.clientY - disY + (scrollY - oldScollY) + "px";
                    obj.css({
                        left: endLeft,
                        top: endTop
                    })

                    Xlength = Math.abs(eve.clientX - disX)

                    positionInfo.x = eve.clientX - disX + (scrollX - oldScollX);
                    positionInfo.y = eve.clientY - disY + (scrollY - oldScollY);

                    ofsetObj.num = eve.clientX - disX;
                    ofsetObj.finalNum = positionInfo.x - left;

                }

                document.onmouseup = function() {
                    document.onmousemove = null;
                    document.onmouseup = null;
                    sd.removeWatch('scroll');
                    if(Xlength <= 40) {
                        positionInfo.index = 0;
                    } else {
                        positionInfo.index = Math.floor(positionInfo.x / 260);
                    }
                    if(positionInfo.index < 0) {
                        positionInfo.index += 1;
                    }

                    //改变列表在数组里面的对应位置
                    var copy = cateGoriesInfo.classifyInfo[i];
                    var sumT = positionInfo.index + i;

                    //直接对i和posiabsoluteInfo求和 如果小于0 就 等于0
                    if(sumT < 0) {
                        sumT = 0;
                    }
                    cateGoriesInfo.classifyInfo.$remove(cateGoriesInfo.classifyInfo[i]);
                    cateGoriesInfo.classifyInfo.splice(sumT, 0, copy);
                    $(".mouseImg").eq(i).hide();
                    $(placeholderParent).hide();
                    placeholderParent.hide();

                    obj.removeAttr("style");
                    obj.removeAttr("left");
                    obj.removeAttr("top");
                    obj.removeClass("pa");

                };

            },
            twoClassifyMove: function(obj, i) {

                var j = obj.index(); //获取二级分类对应的下标
                //i是一级分类的下标
                var positionInfo = {}; //记录拖拽偏移量的信息
                var placeholderChild = $("#placeholderChild");

                //获取高
                var height = obj.innerHeight();
                //获取到的高给placeholderChild来占位
                $(placeholderChild).height(height);
                if(obj.index() == cateGoriesInfo.classifyInfo[i].child.length) {
                    $(placeholderChild).insertAfter(obj);
                } else {
                    $(placeholderChild).insertBefore(obj.next());
                }

                $(placeholderChild).show();
                if(!ev) var ev = window.event;
                var disX = ev.clientX;
                var disY = ev.clientY;
                var left = obj.offset().left;
                var top = obj.offset().top;
                var oldScollX = document.documentElement.scrollLeft || document.body.scrollLeft; //滚动的距离
                var oldScollY = document.documentElement.scrollTop || document.body.scrollTop; //滚动的距离

                obj.css({
                    left: left,
                    top: top,
                })

                var ofsetObj = {
                    num: 0,
                    finalNum: 0
                };
                sd.addWatch('scroll', function() {
                    if(ofsetObj.num > 0) {
                        $(window).scrollLeft($(window).scrollLeft() + 1);
                        if($(window).scrollLeft() >= ofsetObj.finalNum) {}
                    } else {
                        $(window).scrollLeft($(window).scrollLeft() - 1);
                        if($(window).scrollLeft() <= 0) {}
                    }
                });

                var Xlength = 0; //点击的距离
                var Ylength = 0; //点击的距离
                obj.addClass("pa");
                //获取到自身的宽度
                document.onmousemove = function(event) {
                    var eve = event || window.event;
                    var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft; //滚动的距离
                    var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
                    var endLeft = left + eve.clientX - disX + (scrollX - oldScollX) + "px";
                    var endTop = top + eve.clientY - disY + (scrollY - oldScollY) + "px";
                    obj.css({
                        left: endLeft,
                        top: endTop,
                    })
                    obj.find("input").css("cursor", "move")

                    Xlength = Math.abs(eve.clientX - disX);
                    Ylength = Math.abs(eve.clientY - disY);
                    positionInfo.x = eve.clientX - disX + (scrollX - oldScollX);
                    positionInfo.y = eve.clientY - disY + (scrollY - oldScollY);
                    ofsetObj.num = eve.clientX - disX;
                    ofsetObj.finalNum = positionInfo.x - left;
                }

                document.onmouseup = function() {
                    document.onmousemove = null;
                    document.onmouseup = null;
                    sd.removeWatch('scroll');

                    if(Xlength < 40) {
                        positionInfo.indexX = 0;
                    } else {
                        positionInfo.indexX = Math.floor(positionInfo.x / 260);
                    }
                    if(Ylength < 10) {
                        positionInfo.indexY = 0;
                    } else {
                        positionInfo.indexY = Math.floor(positionInfo.y / 45);

                    }
                    //获取拖拽到一级分类的下标
                    //一级分类拖拽的处理获取到父元素的index
                    var Pindex = positionInfo.indexX + i;
                    //获取二级分类对应的拖拽后下标
                    var TwoClassIndex = positionInfo.indexY + j;

                    var copyChild = cateGoriesInfo.classifyInfo[i].child[j]; //获取到对应的二级分类
                    if(TwoClassIndex < 0) {
                        TwoClassIndex += 1;
                    }
                    if(Pindex < 0) {
                        Pindex += 1;
                    }
                    //二级分类拖拽的处理
                    //判断拖拽的二级分类是否在一级分类的Y轴范围内（判断拖拽父元素的二级分类数）
                    if(Pindex || Pindex == 0) {

                        var length = cateGoriesInfo.classifyInfo[Pindex].child;
                        if(!length.length) {
                            cateGoriesInfo.classifyInfo[i].child.$remove(cateGoriesInfo.classifyInfo[i].child[j]);
                            cateGoriesInfo.classifyInfo[Pindex].child.splice(0, 0, copyChild);
                        } else {
                            if(TwoClassIndex || TwoClassIndex == 0) {
                                cateGoriesInfo.classifyInfo[i].child.$remove(cateGoriesInfo.classifyInfo[i].child[j]);
                                cateGoriesInfo.classifyInfo[Pindex].child.splice(TwoClassIndex, 0, copyChild);
                            }

                        }
                    } else {

                    }

                    $(placeholderChild).hide();
                    obj.removeAttr("style");
                    obj.removeAttr("left");
                    obj.removeAttr("top");
                    obj.removeClass("pa");
                };

            },
            createOneClassify: function() { //创建一级分类
                $(".cate-addclassed").show();
                this.showWidth = this.classifyInfo.length * 260 + 460;

            },
            createOneEsc: function() { //创建一级分类取消
                $(".cate-addclassed").hide();
                $("#cate-addclassed-input").val("");
                this.showWidth = this.classifyInfo.length * 260 + 260;

            },
            createOneEnt: function() { //创建一级分类确定

                var nameT = $("#cate-addclassed-input").val();
                if(nameT == '' || nameT == null || nameT == undefined) {
                    alert("提示信息", "一级分类名不能为空")
                    return false;

                }
                if(!numString.test(nameT)) {
                    alert("提示信息", "一级分类名不能含有&和引号")
                    return false;
                };
                sd.request("Category/addCategory", {
                    shopId: userData.currentShop.id,
                    pid: 0,
                    name: nameT,
                    uid: userData.user.id
                }, false, function(json) {
                    // 编辑窗口Vue
                    if(json.error) {
                    alert(json.error.code + '错误', json.error.message);
                    } else {
                        json.data.child = [];
                        cateGoriesInfo.classifyInfo.push(json.data);
                        $("#cate-addclassed-input").val("");
                    }

                }, function(json) {

                }, "post", false);

                $(".cate-addclassed").hide();
            },
            deleteClassify: function(indexOne, index) {

                sd.request("Category/delCategory", {

                    shopId: userData.currentShop.id,
                    cid: indexOne
                }, false, function(json) {

                    if(json.error) {
                        alert(json.error.code + '错误', json.error.message);
                    } else {

                        cateGoriesInfo.classifyInfo.splice(index, 1)

                        //                      cateGoriesInfo.classifyInfo[index].child.splice(indexC, 1)  

                        //删除成功 
                    }
                }, function(json) {

                }, "get", false);
            },
            deleteClassifyT: function(indexTwo, index, indexC) {

                sd.request("Category/delCategory", {
                    shopId: userData.currentShop.id,
                    cid: indexTwo
                }, false, function(json) {

                    if(json.error) {
                         alert(json.error.code + '错误', json.error.message);
                    } else {

                        cateGoriesInfo.classifyInfo[index].child.splice(indexC, 1)

                        //删除成功 
                    }
                }, function(json) {

                }, "get", false);
            },
            entUpdata: function(obj) {
                //传输格式 [{p:1,c:[1,2,3]},{},{}]
                var classfiyInfo = cateGoriesInfo.classifyInfo;

                //              处理数据
                var data = [

                ];
                for(var j = 0; j < classfiyInfo.length; j++) {
                    var obj = {};
                    obj.p = classfiyInfo[j].id;
                    obj.c = [];
                    for(var i = 0; i < classfiyInfo[j].child.length; i++) {
                        if(classfiyInfo[j].child.length == 0 && !classfiyInfo[j].child[i].id) {
                            obj.c.push("")
                        } else {
                            if(classfiyInfo[j].child[i].id) {
                                obj.c.push(classfiyInfo[j].child[i].id)

                            }

                        }
                    }
                    data.push(obj);
                }

                //              for(var item in classfiyInfo) {
                //                  var obj = {};
                //                  obj.p = classfiyInfo[item].id;
                //                  obj.c = [];
                //                  for(var i = 0; i < classfiyInfo[item].child.length; i++) {
                //                      if(classfiyInfo[item].child&&!classfiyInfo[item].child[i].id) {
                //                          obj.c.push("")
                //                      } else {
                //                          obj.c.push(classfiyInfo[item].child[i].id)
                //
                //                      }
                //                  }
                //                  data.push(obj);
                //              }

                //              data = sd.copy(data)
                data = JSON.stringify(data)

                this.Sort = obj;
                sd.request("Category/moveCategory", {

                    data: data
                }, false, function(json) {
                    if(!json) {
                        alert("保存失败")
                    }
                }, function(json) {

                    alert("失败")

                }, "post", false, {
                    shopId: userData.currentShop.id

                });
            },
            returnClassfiy: function() {

                this.Sort = true;
                //从后台获取分类列表
                sd.request("Category/getCategoryList", {
                    shopId: userData.currentShop.id

                }, false, function(json) {
                    // 编辑窗口Vue

                    cateGoriesInfo.classifyInfo = sd.copy(json.data);

                }, function(json) {

                }, "get", false);
                cateGoriesInfo.classifyInfo = sd.copy(cateGoriesInfo.copyclassifyInfo)

            },
            changeSort: function(obj) {
                this.Sort = obj;
            },
            randomNumber: function() {
                return cateGoriesInfo.rendomNum -= 1;

            }
        }
    });

    //从后台获取分类列表
    sd.request("Category/getCategoryList", {
        shopId: userData.currentShop.id

    }, false, function(json) {
        // 编辑窗口Vue
        cateGoriesInfo.copyclassifyInfo = json.data;
        cateGoriesInfo.classifyInfo = sd.copy(json.data);

    }, function(json) {

    }, "get", false);

});