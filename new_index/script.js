$(function () {

  // 检测是否是移动端
  var isMobile = $(window).width() <= 768;

  var swiper = null; // 声明 swiper 变量
  
  // 城市列表配置（保持原始顺序）
  var cityList = [
    { name: "北京", icon: "icon/北京.svg" },
    { name: "上海", icon: "icon/上海.svg" },
    { name: "广州", icon: "icon/广州.svg" },
    { name: "成都", icon: "icon/成都.svg" },
    { name: "深圳", icon: "icon/深圳.svg" },
    { name: "南京", icon: "icon/南京.svg" },
    { name: "杭州", icon: "icon/杭州.svg" },
    { name: "武汉", icon: "icon/武汉.svg" },
    { name: "重庆", icon: "icon/重庆.svg" },
    { name: "苏州", icon: "icon/苏州.svg" }
  ];

  // 使用百度地图获取当前城市
  function getCurrentCity(callback) {
    if (typeof BMap === 'undefined') {
      console.error("百度地图API未加载");
      callback(null);
      return;
    }

    var geolocation = new BMap.Geolocation();
    geolocation.getCurrentPosition(function(r) {
      if (this.getStatus() == BMAP_STATUS_SUCCESS) {
        var myGeo = new BMap.Geocoder();
        myGeo.getLocation(r.point, function(result) {
          if (result) {
            var cityName = result.addressComponents.city;
            // 去掉"市"字
            cityName = cityName.replace('市', '');
            console.log('当前城市:', cityName);
            callback(cityName);
          } else {
            console.warn('获取城市信息失败');
            callback(null);
          }
        });
      } else {
        console.warn('定位失败');
        callback(null);
      }
    }, { enableHighAccuracy: true });
  }

  // 渲染城市列表
  function renderCityList(currentCity) {
    var sortedCityList = cityList.slice(); // 复制数组

    // 如果找到当前城市，将其移到第一位
    if (currentCity) {
      var currentIndex = -1;
      for (var i = 0; i < sortedCityList.length; i++) {
        if (sortedCityList[i].name === currentCity || sortedCityList[i].name.indexOf(currentCity) !== -1) {
          currentIndex = i;
          break;
        }
      }

      if (currentIndex > 0) {
        var currentCityItem = sortedCityList.splice(currentIndex, 1)[0];
        sortedCityList.unshift(currentCityItem);
        console.log('城市列表已重排，当前城市:', currentCityItem.name);
      }
    }

    // 渲染城市列表
    var html = '';
    for (var i = 0; i < sortedCityList.length; i++) {
      var city = sortedCityList[i];
      html += '<div class="city-item">' +
              '<div class="city-icon"><img src="' + city.icon + '" alt="' + city.name + '"></div>' +
              '<div class="city-name">' + city.name + '</div>' +
              '</div>';
    }
    $('.city-list-container').empty().html(html);
  }

  // 初始化城市列表
  function initCityList() {
    getCurrentCity(function(cityName) {
      renderCityList(cityName);
    });
  }

  // 初始化城市列表
  initCityList();

  // 获取首页促销活动数据
  function fetchPromoActivities() {
    return $.ajax({
      url: "https://dev-nsp.sonystyle.com.cn/dealero2o/app/master/homeData",
      method: "GET",
      dataType: "json"
    });
  }

  // 显示二维码tooltip（PC端hover）
  function showQRCodeTooltip($element, qrImgPath) {
    // 如果已存在tooltip，不重复创建
    if ($("#qrTooltip").length > 0) {
      return;
    }
    
    // 获取按钮位置
    var offset = $element.offset();
    var width = $element.outerWidth();
    
    // 计算tooltip位置（显示在按钮右边）
    var tooltipLeft = offset.left + width + 10;
    var tooltipTop = offset.top;
    
    // 创建tooltip HTML
    var tooltipHtml = '<div id="qrTooltip" style="position: absolute; top: ' + tooltipTop + 'px; left: ' + tooltipLeft + 'px; z-index: 9999; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">' +
      '<span class="qr-close-btn" style="position: absolute; top: 5px; right: 5px; cursor: pointer; font-size: 20px; color: #999; line-height: 1; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">&times;</span>' +
      '<img src="' + qrImgPath + '" alt="二维码" style="width: 150px; height: 150px; display: block;" />' +
      '</div>';
    
    // 添加tooltip到页面
    $("body").append(tooltipHtml);
    
    // 点击关闭按钮关闭tooltip
    $(".qr-close-btn").on("click", function(e) {
      e.stopPropagation();
      $("#qrTooltip").remove();
    });
  }

  // 获取Alpha俱乐部数据
  function fetchAlphaActivities() {
    return $.ajax({
      url: "https://dev-nsp.sonystyle.com.cn/ssoapps/retailer_activity/dealer/shopActivitysByCategory?category=DI",
      method: "GET",
      dataType: "json"
    });
  }

  // 获取体验活动数据
  function fetchEventActivities() {
    var categories = encodeURIComponent("全品类,PA,PS,TV/HAV,其它");
    return $.ajax({
      url: "https://dev-nsp.sonystyle.com.cn/ssoapps/retailer_activity/dealer/shopActivitysByCategory?category=" + categories,
      method: "GET",
      dataType: "json"
    });
  }

  // 从activityPics数组中获取封面图
  function getCoverImage(activityPics) {
    if (!activityPics || activityPics.length === 0) {
      return "activity-default.jpg";
    }
    for (var i = 0; i < activityPics.length; i++) {
      if (activityPics[i].picType === "封面图") {
        return activityPics[i].picUrl;
      }
    }
    return activityPics[0].picUrl || "activity-default.jpg";
  }

  // 格式化时间：从startTime和endTime提取时间部分
  function formatActivityTime(startTime, endTime) {
    if (!startTime) return "";
    
    // startTime格式: "2026-04-15 05:00"
    var startParts = startTime.split(" ");
    var startDate = startParts[0]; // "2026-04-15"
    var startHour = startParts[1]; // "05:00"
    
    var endHour = "";
    if (endTime) {
      var endParts = endTime.split(" ");
      endHour = endParts[1]; // "05:00"
    }
    
    return startDate + " " + startHour + (endHour ? " - " + endHour : "");
  }

  // 数据缓存
  var activityData = {
    alpha: [],
    event: [],
    promo: []
  };

  // 加载所有活动数据
  function loadAllActivities() {
    // 加载促销活动
    fetchPromoActivities()
      .done(function(response) {
        if (response.result && response.returnData && response.returnData.activityList) {
          activityData.promo = response.returnData.activityList.map(function(item) {
            return {
              title: item.title,
              time: item.activityDate,
              img: item.activityImgUrl || "activity-default.jpg",
              linkUrl: item.linkUrl || "#",
              mobileLink: item.mobileLink || "#",
              linkType: item.linkType,
              linkName: item.linkName,
              remark: item.remark || "",
              qrImgPath: item.qrImgPath || ""
            };
          });
          console.log('促销活动加载成功:', activityData.promo.length + '条');
        }
      })
      .fail(function(error) {
        console.error("获取促销活动失败:", error);
      });

    // 加载Alpha俱乐部
    fetchAlphaActivities()
      .done(function(response) {
        if (response.code === 200 && response.result) {
          activityData.alpha = response.result.map(function(item) {
            return {
              title: item.activityName,
              time: formatActivityTime(item.startTime, item.endTime),
              img: getCoverImage(item.activityPics),
              linkUrl: item.activityUrl || "#"
            };
          });
          console.log('Alpha俱乐部加载成功:', activityData.alpha.length + '条');
          // Alpha是默认显示的，加载完成后渲染
          render("alpha");
        }
      })
      .fail(function(error) {
        console.error("获取Alpha俱乐部失败:", error);
      });

    // 加载体验活动
    fetchEventActivities()
      .done(function(response) {
        if (response.code === 200 && response.result) {
          activityData.event = response.result.map(function(item) {
            return {
              title: item.activityName,
              time: formatActivityTime(item.startTime, item.endTime),
              img: getCoverImage(item.activityPics),
              linkUrl: item.activityUrl || "#"
            };
          });
          console.log('体验活动加载成功:', activityData.event.length + '条');
        }
      })
      .fail(function(error) {
        console.error("获取体验活动失败:", error);
      });
  }

  // 加载所有活动数据
  loadAllActivities();

  var serviceData = [
    {
      title: "探索与体验",
      desc: "我们的专业团队将引导您亲手操作产品，解答您的每一个疑问，确保您获得最深度的使用体验。还有机会优先体验新品。",
      img: "service.jpg"
    },
    {
      title: "您的专属顾问",
      desc: "一对一顾问服务，为您提供个性化推荐与解决方案。",
      img: "service.jpg"
    },
    {
      title: "多元化活动",
      desc: "摄影课程、体验课、线下活动丰富多样。",
      img: "service.jpg"
    },
    {
      title: "会员俱乐部",
      desc: "加入会员俱乐部，享受更多权益与专属活动。",
      img: "service.jpg"
    },
    {
      title: "专业售后",
      desc: "专业售后支持，保障您的设备使用无忧。",
      img: "service.jpg"
    },
    {
      title: "Aniplex",
      desc: "动漫娱乐相关体验专区。",
      img: "service.jpg"
    }
  ];

  function initSwiper() {
    if (swiper) swiper.destroy(true, true);

    if (window.innerWidth > 768) {
      // PC端显示3个卡片
      swiper = new Swiper(".card-swiper", {
        slidesPerView: 3,
        spaceBetween: 50,
        initialSlide: 1,
        centeredSlides: true
      });
    } else {
      // 移动端自适应
      swiper = new Swiper(".card-swiper", {
        initialSlide: 1,
        slidesPerView: "auto",
        spaceBetween: 30,
        centeredSlides: true
      });
    }
  }

  function render(type) {
    var list = activityData[type] || [];
    var html = "";

    if (list.length === 0) {
      html = '<div class="swiper-slide"><div class="card"><div class="card-content"><div class="card-title">暂无活动</div></div></div></div>';
    } else {
      list.forEach(function(item) {
        // 处理促销活动的链接逻辑
        var btnText = "查看详情 >";
        var linkUrl = item.linkUrl;
        var qrImgPath = item.qrImgPath || "";
        var linkClass = "";
        var linkData = "";
        
        if (type === "promo") {
          // 促销活动特殊处理
          if (item.linkName == "1" || item.linkName == "2") {
            // 查看详情和立即报名逻辑相同
            btnText = item.linkName == "1" ? "查看详情 >" : "立即报名 >";
            
            if (item.linkType == "1") {
              // linkType为1时PC端直接跳转
              linkUrl = isMobile ? (item.mobileLink || item.linkUrl) : item.linkUrl;
            } else if (item.linkType == "2") {
              // linkType为2时PC端显示二维码，移动端跳转
              if (isMobile) {
                linkUrl = item.mobileLink || item.linkUrl;
              } else {
                linkUrl = "#"; // PC端不跳转，显示二维码
                linkClass = " has-qr";
                linkData = ' data-qr="' + qrImgPath + '"';
              }
            }
          } else if (item.linkName == "3") {
            btnText = item.remark || "";
            linkUrl = "#"; // 备注不可跳转
            linkClass = " no-link";
          }
        }
        
        html += '<div class="swiper-slide">' +
                '<div class="card">' +
                '<img src="' + item.img + '" />' +
                '<div class="card-content">' +
                '<div class="card-title">' + item.title + '</div>' +
                '<div class="card-time">' + item.time + '</div>' +
                '<div class="card-link' + linkClass + '" data-url="' + linkUrl + '"' + linkData + '>' + btnText + '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
      });
    }

    $(".card-list").html(html);

    initSwiper();

  }

  // 初始化（先渲染空状态，等数据加载完成后会自动更新）
  render("alpha");

  // 卡片链接hover显示二维码（PC端）
  $(document).on({
    mouseenter: function () {
      var qrImgPath = $(this).data("qr");
      if (qrImgPath && !isMobile) {
        showQRCodeTooltip($(this), qrImgPath);
      }
    }
  }, ".card-link.has-qr");

  // 卡片链接点击事件
  $(document).on("click", ".card-link", function() {
    var url = $(this).data("url");
    // 如果有no-link类，不跳转
    if ($(this).hasClass("no-link")) {
      return;
    }
    // 正常跳转
    if (url && url !== "#") {
      window.open(url, "_blank");
    }
  });

  // tab切换
  $(".tab").click(function () {
    $(".tab").removeClass("active");
    $(this).addClass("active");

    var type = $(this).data("type");
    render(type);
  });

  $(".service-tab").click(function () {
    var index = $(this).data("index");

    $(".service-tab").removeClass("active");
    $(this).addClass("active");

    var item = serviceData[index];

    $(".service-heading").text(item.title);
    $(".service-desc").text(item.desc);

    // 图片切换（带淡入）
    $(".service-img img").fadeOut(150, function () {
      $(this).attr("src", item.img).fadeIn(150);
    });
  });


});