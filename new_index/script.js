$(function () {

  let swiper = null; // 声明 swiper 变量

  const data = {
    alpha: [
      { title: "从0到1学摄影+专人答疑", time: "2026-03-25 17:00 - 17:30", img: "service.jpg" },
      { title: "摄影基础训练营", time: "2026-03-26 17:00 - 17:30", img: "service.jpg" },
      { title: "人像拍摄技巧", time: "2026-03-27 17:00 - 17:30", img: "service.jpg" }
    ],
    event: [
      { title: "新品体验会", time: "2026-04-01", img: "service.jpg" }
    ],
    promo: [
      { title: "限时优惠活动", time: "2026-04-10", img: "service.jpg" }
    ]
  };

   const serviceData = [
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
    const list = data[type];
    let html = "";


   list.forEach(item => {
    html += `
      <div class="swiper-slide">
        <div class="card">
          <img src="${item.img}" />
          <div class="card-content">
            <div class="card-title">${item.title}</div>
            <div class="card-time">${item.time}</div>
            <div class="card-link">我要报名 ></div>
          </div>
        </div>
      </div>
    `;
    });

    $(".card-list").html(html);

    initSwiper();

  }

  // 初始化
  render("alpha");

  // tab切换
  $(".tab").click(function () {
    $(".tab").removeClass("active");
    $(this).addClass("active");

    const type = $(this).data("type");
    render(type);
  });

  $(".service-tab").click(function () {
    const index = $(this).data("index");

    $(".service-tab").removeClass("active");
    $(this).addClass("active");

    const item = serviceData[index];

    $(".service-heading").text(item.title);
    $(".service-desc").text(item.desc);

    // 图片切换（带淡入）
    $(".service-img img").fadeOut(150, function () {
      $(this).attr("src", item.img).fadeIn(150);
    });
  });


});