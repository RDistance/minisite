// JavaScript Document
(function (common) {
  var space = {};
  space.renderdust = function (id, outid, data) {
    var x = $("#" + id).html();
    var compiled = dust.compile(x, id);
    dust.loadSource(compiled);
    dust.render(id, data, function (err, out) {
      $("#" + outid).html(out);
    });
  };
  space.ajaxfunc = function (url, param, type, callback) {
    $.ajax({
      url: url,
      type: type,
      data: param,
      //contentType: "application/json; charset=utf-8",
      //contentType: "text/html; charset=utf-8",
      //contentType:"application/x-www-form-urlencoded",
      dataType: "json",
      beforeSend: function () {},
      cache: false,
      success: function (data) {
        callback(data);
      },
    });
  };
  common.space = space;
})(this);
window.adobeDataLayer = window.adobeDataLayer || [];
var map = new BMap.Map("map");

var menApi = "https://www.sonystyle.com.cn/dealero2o/app/master/dealer";
var likeApi = "https://www.sonystyle.com.cn/dealero2o/app/master/like";
var effectApi = "https://www.sonystyle.com.cn/dealero2o/app/master/dealer/effective"
function QueryString(item) {
  var sValue = window.location.hash.match(
    new RegExp("[#&]" + item + "=([^&]*)(&?)", "i")
  );
  if (sValue != null) {
    var tss = sValue[1].split("#")[0];
    return tss ? tss : sValue;
  }
}
(function ($) {
  $.getUrlParam = function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
  };
})(jQuery);

var storeId = $.getUrlParam("storeId");
var other_m = [
  {
    id: "884e852190394db8b3c584dfddb17285",
    name: "Sony Store重庆万象城店",
  },
  {
    id: "92449722c1b7423db185b99819de8b53",
    name: "Sony Store武汉梦时代店",
  },
  {
    id: "615f36d66a694724ab62070db516571b",
    name: "Sony Store北京东方广场店",
  },
  {
    id: "11dd790be96140b392dfd4d2e7026075",
    name: "Sony Store上海淮海中路店",
  },
  {
    id: "c921749301a34e17af42ce331485311a",
    name: "Sony Store广州正佳广场店",
  },
  {
    id: "ed667737875c45b888886c192bd324af",
    name: "Sony Store成都来福士店",
  },
  {
    id: "50403606a52e486dbb7ce6ce6373e944",
    name: "Sony Store深圳深业上城店",
  },
  {
    id: "9921f17ab60e458c91b1439167393116",
    name: "Sony Store南京水游城店",
  },
  {
    id: "ac76e7798c3540748d2119f48bbc3ea3",
    name: "Sony Store杭州湖滨88店",
  },
  {
    id: "7cf912ff839a4c0a9cddedfe2aff7b41",
    name: "Sony Store苏州万象天地店",
  },
];

function getOtherm(id) {
  for (var i = 0; i < other_m.length; i++) {
    if (id == other_m[i].id) {
      other_m.splice(i, 1);
    }
  }
  return other_m;
}

function getNx(data) {
  var xhtml = "";
  for (var i in data) {
    data[i]["content"] = data[i]["content"];
    //xhtml += "<ul class=\"clearfix\"><li class=\"micheng\">"+data[i]["productName"]+" </li><li class=\"ssneirong\">"+data[i]["content"]+"<img src='images/inner_s/qr.png'></li></ul>";
    xhtml +=
      '<ul class="clearfix"><li class="micheng">' +
      data[i]["productName"] +
      ' </li><li class="ssneirong">' +
      data[i]["content"] +
      "</li></ul>";
  }

  $("#xinpinz").html(xhtml);
}

function getNj(data) {
  //console.debug(data);
  var xhtml = "";
  for (var i in data) {
    var reg = /\d+\/\d+\-\d+\/\d+/g;
    var str = data[i]["activityDate"];
    var riqi = str.match(reg)[0];
    var xqlink = "";
    var joinname = "";
    if (data[i]["joinName"] == null) {
      joinName = "";
    } else {
      joinName =
        "<img class=\"icon\" src=\"images/phone_icon.png\"><a class='qrbtn' href='javascript:void(0)' rel='" +
        data[i]["qrImgPath"] +
        "' >" +
        data[i]["joinName"] +
        "</a>";
    }

    if (data[i]["pcLink"] == null) {
      xqlink = "";
    } else {
      xqlink =
        '<img class="icon" src="images/link_icon.png"><a href="' +
        data[i]["pcLink"] +
        '" target="_blank">查看详情</a>';
    }
    xhtml +=
      '<ul class="clearfix"><li class="riqi">' +
      riqi +
      ' </li><li class="shijian">' +
      data[i]["activityTime"] +
      '</li><li class="zhuti">' +
      data[i]["title"] +
      '</li><li class="neirong">' +
      data[i]["content"] +
      xqlink +
      joinName +
      "</li></ul>";
  }

  $("#lectrue").html(xhtml);
  $(".qrbtn").hover(
    function () {
      var llf = $(this).offset().left + $(this).width();
      var ttp = $(this).offset().top - $(window).scrollTop();
      var rel = $(this).attr("rel");

      $(".qyh").css({
        left: llf,
        top: ttp - 160,
      });
      $(".qyh").html("<img src='" + rel + "'>");
      setTimeout(function () {
        $(".qyh").show();
      }, 1);
    },
    function () {
      $(".qyh").hide();
      $(".qyh").empty();
    }
  );

  /*setTimeout(function(){
	
	
	jquery('.actis').slimscroll({

		height: '144px',
		alwaysVisible: true,
		railVisible: true,
		railColor:'#c2c2c2'
		
	  
	  });	
	
	
	
		
		},500)*/
}

$('.icon2').hide()
$(function () {
  var other_mdatas = getOtherm(storeId);
  var other_rs = $.ltmpl("other_tmp", other_mdatas);
  $("#other_m").html(other_rs);
  $("#other_m").change(function () {
    var id = $(this).val();
    if (id == 0) {
    } else {
      window.location.href = "detail_s.html?storeId=" + id;
    }
  });

  $(".map_control a").click(function () {
    if (!$(this).hasClass("m_active")) {
      $(this).siblings().removeClass("m_active");
      $(this).addClass("m_active");
      var index = $(this).index();
      $(".mpas").hide();
      $(".mpas").eq(index).show();
    }
    if($(this).children().attr('class')=='map_2'){
      $('.shop_slide_left').addClass('shop_map')
      $('.icon1').hide()
      $('.icon2').show()
    }else{
      $('.shop_slide_left').removeClass('shop_map')
      $('.icon2').hide()
      $('.icon1').show()
    }
  });

  $(".heart").click(function () {
    var $th = $(this);
    var mark = getAesString(returnCitySN["cip"],"qydjwjqp4me3rnitdptf7eyznva357fp","")
    
    var url =
      likeApi + "?dealerId=" + storeId + "&mark=" + mark + "&channel=3";
    space.ajaxfunc(url, {}, "POST", function (data) {
      if (data.result && data.resultCode == "00") {
        $th.find("span").html(data.likeCount);
      }
      if (data.result && data.resultCode == "1") {
        alert("今天已点赞过，请明天再来");
      }
      if (!data.result) {
        alert("服务器繁忙稍后再试");
      }
    });
  });

  var swiperCategory = new Swiper('.category_banner', {
    direction : 'horizontal',
    slidesPerView: 1,
    spaceBetween: 10,
    speed:1500,
    navigation: {
        nextEl: '.swiper-button-next-banner',
        prevEl: '.swiper-button-prev-banner',
      },
});

  //space.ajaxfunc("js/mendian.json",{},"POST",function(data){
  space.ajaxfunc(menApi, { dfId: storeId }, "POST", function (data) {
	  adobeDataLayer.push({
		  event:'dealerView',	//固定值
		  eventInfo:{
			dealerName: data["name"],
			dealerCategory: data.mstCategory.name
		  }
		})
	console.log('adobeDataLayer', adobeDataLayer)
    $('.swiper-title1').html(data.mstCategory.name)
    // 涵盖品类
    if(data.list){
      let categoryHtml = ''
      let categoryHtmlNew = ''
      let numInd = 0
      for (let i = 0; i < data.list.length; i++) {
        const item = data.list[i];
        categoryHtmlNew += `<div class="category_info">
                    <img class="category_img" src="${item.lightImgURL}">
                    <div class="category_name">${item.name}</div>
                  </div>`
        numInd+=1
        if(numInd == 8){
          categoryHtml = `<div class="swiper-slide category_all">
          ${categoryHtmlNew}
          </div>`
          swiperCategory.appendSlide(categoryHtml); //加到Swiper的最后
          numInd = 0
          categoryHtmlNew = ''
        }else if(i + 1 == data.list.length){
          categoryHtml = `<div class="swiper-slide category_all">
          ${categoryHtmlNew}
          </div>`
          swiperCategory.appendSlide(categoryHtml); //加到Swiper的最后
        }
       
      }
    }
    // 活动讲座
    let activityHtml = ''
    if(data.activityList && data.activityList.length){
      $('#active_loading').hide()
      for (let i = 0; i < data.activityList.length; i++) {
        const activityInfo = data.activityList[i];
        let scanHtml = ''
        if(activityInfo.qrImgPath){
          scanHtml = `<div class="scan" id="scanId">
                  <span>扫一扫</span>
                  <img class="active_r" src="/content/dam/sonystyle/smallapp/dealerweb/images/index_new/active_r.png" >
                  <div class="scan_img">
                    <img src="${activityInfo.qrImgPath}" alt="">
                  </div>
                </div>`
        }
        let pcLinkHtml = ''
        if(activityInfo.pcLink){
          pcLinkHtml = ` <a class="active_a" style="margin-right: 10px;" href="${activityInfo.pcLink}" target="_blank" class="fl" title="查看详情">
                  <span>查看详情</span>
                  <img class="active_r" src="/content/dam/sonystyle/smallapp/dealerweb/images/index_new/active_r.png" >
                </a>`
        }
        let infoHtml = ''
        if(activityInfo.pcLink || activityInfo.qrImgPath){
          infoHtml = `<div class="goto_info">${pcLinkHtml}${scanHtml}</div>`
        }
        activityHtml = `<div>
        <div class="active_info">
          <div class="active_title">${activityInfo.title}</div>
          <div class="active_remark">${activityInfo.content}</div>
          
        </div>
        <div class="active_time">
          <img class="active_time_icon" src="/content/dam/sonystyle/smallapp/dealerweb/images/index_new/active_time_icon.png" >
          <span>${activityInfo.activityDate} ${activityInfo.activityTime}</span>
          ${infoHtml}
        </div>
      </div>`
        $('#active_event_lecture').append(activityHtml)
      }
    }else{
      $('#active_list_all').hide()
    }
    // 新品体验 
    let newProductHtml = ''
    if(data.productList && data.productList.length){
      for (let i = 0; i < data.productList.length; i++) {
        const productInfo = data.productList[i];
        let scanHtml = ''
        if(productInfo.qrImgPath){
          scanHtml = `<div class="scan" id="scanId">
                  <span>扫一扫</span>
                  <img class="active_r" src="/content/dam/sonystyle/smallapp/dealerweb/images/index_new/active_r.png" >
                  <div class="scan_img">
                    <img src="${productInfo.qrImgPath}" alt="">
                  </div>
                </div>`
        }
        let pcLinkHtml = ''
        if(productInfo.pcLink){
          pcLinkHtml = ` <a class="active_a" style="margin-right: 10px;" href="${productInfo.pcLink}" target="_blank" class="fl" title="查看详情">
                  <span>查看详情</span>
                  <img class="active_r" src="/content/dam/sonystyle/smallapp/dealerweb/images/index_new/active_r.png" >
                </a>`
        }
        let infoHtml = ''
        if(productInfo.pcLink || productInfo.qrImgPath){
          infoHtml = `<div class="goto_info">${pcLinkHtml}${scanHtml}</div>`
        }
        newProductHtml = `<div>
        <div class="active_info">
          <div class="active_title">${productInfo.productName}</div>
          <div class="active_remark">${productInfo.content}</div>
          
        </div>
        <div class="active_time">
          ${infoHtml}
        </div>
      </div>`
        $('#new_product_info').append(newProductHtml)
      }
    }else{
      $('#new_product').hide()
    }
	setTimeout(() => {
  $(".scan").each(function () {
    $(this).mouseenter(function(){
      $(this).find('.scan_img').css('display','block')
    })
    $(this).mouseleave(function(){
      $(this).find('.scan_img').css('display','none')
    })
  });
}, 1000);
    // 店铺详情字段
    let nameText = data["name"].replace(/Sony Store/gi, "")
    $('.shop_name').html(nameText)
    $('#shopName').html(nameText)
    let QRImage = ''
    if(data.customerServiceUrl && data.customerServiceUrl !='/dealero2o/upload/images/default.jpg'){
      QRImage = `<div>
		<img class="shop_QR" src="${data.customerServiceUrl}">
		<span style="font-size: 14px; margin-top: 2px; padding-right: 10px;text-align: center;display: block;">门店专属客服</span>
	  </div>`
     }
     if(data.activityUrl && data.activityUrl !='/dealero2o/upload/images/default.jpg'){
	  QRImage += `<div>
		<img class="shop_QR" src="${data.activityUrl}">
		<span style="font-size: 14px; margin-top: 2px; padding-right: 10px;text-align: center;display: block;">活动二维码</span>
	  </div>`
     }
     if(data.productRegisterUrl && data.productRegisterUrl !='/dealero2o/upload/images/default.jpg'){
	  QRImage += `<div>
		<img class="shop_QR" src="${data.productRegisterUrl}">
		<span style="font-size: 14px; margin-top: 2px; padding-right: 10px;text-align: center;display: block;">产品注册码</span>
	  </div>`
     }
	 if(QRImage){
	  $('#QRList').html(QRImage)
	 }else{
	  $('#QRListAll').hide()
	  }

    //$(".mct11").html(data["mstCategory"]["name"]+"-"+data["name"]);
    $(".mct11").html(data["name"].replace(/Sony Store/gi, ""));
    //$(".mc").html(data["name"]);
    //$(".dpm").html(data["name"]);
    $(".addr").html(data["address"]);
    $("#shopAddress").html(data["address"]);
    let phone = ''
    if(data["phone"] && data["mobile"]){
      phone = data["phone"] + '，' + data["mobile"]
    }else{
      phone = data["phone"] || data["mobile"]
    }
    $(".tel").html(phone);
    $("#shopPhone").html(phone);
    $(".time").html(data["businessHour"]);
    $("#businessHour").html(data["businessHour"]);
    $(".heart span").html(data["likeCount"]);
    if (data["fullScope"]) {
      $("#scopelist").html(
        '<li style="color:#18acff;border-color:#18acff">全品类</li>'
      );
    } else {
      var thml = "";
      var list = data["list"];
      for (var i = 0; i < list.length; i++) {
        thml +=
          ' <li style="color:' +
          list[i].mpColor +
          ";border-color:" +
          list[i].mpColor +
          '">' +
          list[i].name +
          "</li>";
      }

      $("#scopelist").html(thml);
    }

    if (data["remark"] != null) {
      $(".notice_infos").show();
      $(".notice_info").html(data["remark"]);

      // $(".lecture_ms").css(
      //   "backgroundImage",
      //   "url(images/inner_s/lecture_bg.jpg)"
      // );
    }
    $(".cc").hide();
    // if (data.productList.length > 0 || data.activityList.length > 0) {
    //   $(".cc").show();
    // } else {
    //   $(".cc").hide();
    // }

    if (data.productList.length > 0) {
      getNx(data.productList);
    } else {
      $(".act_m").eq(1).html("<p  class='nodata'>暂无数据</p>");
    }
    if (data.activityList.length > 0) {
      getNj(data.activityList);
    } else {
      $(".cc_title p").removeClass("actived");
      $(".cc_title p").eq(1).addClass("actived");
      $(".act_m").eq(0).hide();
      $(".act_m").eq(1).show();
      $(".act_m").eq(0).html("<p class='nodata'>暂无数据</p>");
    }

    var choice = data["list"];
    var xhtml = "";
    for (var i = 0; i < choice.length; i++) {
      xhtml +=
        '<li><img src="' +
        choice[i]["lightImgURL"] +
        '"><p>' +
        choice[i]["name"] +
        "</p></li>";
    }

    $("#co_cat ul").html(xhtml);

    if (data["additionalList"] != null) {
      var choice1 = data["additionalList"];
      var xhtml1 = "";
      for (var i = 0; i < choice1.length; i++) {
        xhtml1 +=
          '<li><img src="' +
          choice1[i]["imgURL"] +
          '"><p>' +
          choice1[i]["name"] +
          "</p></li>";
      }

      //$("#co_cat1 ul").html(xhtml1);
    } else {
      $(".zengzhim").hide();
    }

    var img = "";
    if (data["imgURL"]) {
      img = data["imgURL"];
      $(".store_img").html("<img class='shop_image' src='" + data["imgURL"] + "'>");
    } else {
      img = data["mstCategory"].imgURL;
      $(".store_img").html("<img class='shop_image' src='" + img + "'>");
    }
    setMap(
      data["longitude"],
      data["latitude"],
      data["name"],
      data["address"],
      data["phone"],
      img
    );
  });
});



function goEffective(num) {

  var mark = getAesString(returnCitySN["cip"],"qydjwjqp4me3rnitdptf7eyznva357fp","")

  space.ajaxfunc(
    effectApi,
    { effective: num, mark: mark, dealerId: storeId },
    "POST",
    function (data) {
      if (data.result) {
        alert("提交成功");
      } else {
        alert("您已提交过了");
      }
    }
  );
}


function getAesString(data,key,iv) {
  //加密
  var key = CryptoJS.enc.Utf8.parse(key);
  var iv = CryptoJS.enc.Utf8.parse(iv);
  var encrypted = CryptoJS.AES.encrypt(data, key, {
    iv: iv,
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString(); //返回的是base64格式的密文
}

function setMap(latitude, longitude, name, address, phone, img) {
  var poi = new BMap.Point(latitude, longitude);
  map.centerAndZoom(poi, 20);
  map.enableScrollWheelZoom();

  var content =
    '<div style="margin:0;line-height:20px;padding:2px;">' +
    '<img src="' +
    img +
    '" alt="" style="float:right;zoom:1;overflow:hidden;width:100px;margin-left:3px;"/>' +
    "地址：" +
    address +
    "<br/>电话：" +
    phone +
    "<br/>" +
    "</div>";

  //创建检索信息窗口对象
  var searchInfoWindow = null;
  searchInfoWindow = new BMapLib.SearchInfoWindow(map, content, {
    title: name, //标题
    width: 290, //宽度
    height: 120, //高度
    panel: "panel", //检索结果面板
    enableAutoPan: true, //自动平移
    searchTypes: [
      BMAPLIB_TAB_TO_HERE, //到这里去
      BMAPLIB_TAB_FROM_HERE, //从这里出发
      BMAPLIB_TAB_SEARCH, //周边检索
    ],
  });
  var marker = new BMap.Marker(poi); //创建marker对象
  marker.enableDragging(); //marker可拖拽
  marker.addEventListener("click", function (e) {
    searchInfoWindow.open(marker);
  });
  map.addOverlay(marker); //在地图中添加marker

  $(".mpas").eq(1).hide().css("visibility", "visible");
}

$(".cc_title p").each(function (index, element) {
  $(this).click(function () {
    $(this).addClass("actived");
    $(this).siblings().removeClass("actived");
    $(".act_m").hide();
    $(".act_m").eq(index).show();
  });
});
