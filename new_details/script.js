$(function () {
    let allData = null; // 存储数据流
    const swipers = {}; // 存储所有 swiper 实例

    // 通用 Swiper 初始化配置
    function initSwiper(selector, options = {}) {
        // 如果已存在实例，先销毁
        if (swipers[selector]) swipers[selector].destroy(true, true);

        const isMobile = window.innerWidth <= 768;
        
        const defaultConfig = isMobile ? {
            slidesPerView: 'auto',
            spaceBetween: 30,
            centeredSlides: true,
            initialSlide: 1,
            // 懒加载配置
            lazy: {
                loadPrevNext: true,
                loadPrevNextAmount: 2,
                loadOnTransitionStart: true
            },
            preloadImages: false,
            watchSlidesProgress: true
        } : {
            slidesPerView: 3,
            spaceBetween: 50,
            centeredSlides: true,
            initialSlide: 1,
            // 懒加载配置
            lazy: {
                loadPrevNext: true,
                loadPrevNextAmount: 2,
                loadOnTransitionStart: true
            },
            preloadImages: false,
            watchSlidesProgress: true
        };

        swipers[selector] = new Swiper(selector, { ...defaultConfig, ...options });
    }

    // 渲染卡片 HTML
    function createCardHtml(item) {
        return `
            <div class="swiper-slide">
                <div class="card">
                    <div class="swiper-lazy-preloader"></div>
                    <img data-src="${item.img}" alt="${item.title}" class="swiper-lazy">
                    <div class="card-body">
                        <h3>${item.title}</h3>
                        <p class="time">${item.time}</p>
                        <a href="#" class="btn-link">我要报名 ></a>
                    </div>
                </div>
            </div>`;
    }

    // 渲染门店卡片 HTML
    function createStoreHtml(item) {
        return `
            <div class="swiper-slide">
                <div class="store-card">
                    <div class="swiper-lazy-preloader"></div>
                    <img data-src="${item.img}" class="swiper-lazy">
                    <div class="store-info-box">
                        <h3>Sony Store · ${item.name}</h3>
                        <p>📍 ${item.address}</p>
                        <p>📞 ${item.phone}</p>
                        <p>🕒 ${item.time}</p>
                        <div class="store-info-contact">
                           <div class="qr-code-wrapper">
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SONY" class="qr-code">
                                <span class="qr-code-name">门店专属客服</span>
                           </div>
                            <a href="#" class="btn-detail">门店详情</a>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    // 模拟获取数据
    function fetchData() {
        // 这里替换为你真实的后端接口
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    storeInfo: {
                        address: '广州市天河区天河路 228号正佳广场3楼 3B035-40/059号商铺',
                        time: '10:00-22:00',
                        phone: '020-38682903'
                    },
                    alpha: [
                        { title: 'What不用后期就能发圈', img: 'https://picsum.photos/600/400?random=1', time: '2026-03-25 17:00 - 17:30' },
                        { title: 'What不用后期就能发圈', img: 'https://picsum.photos/600/400?random=2', time: '2026-03-25 17:00 - 17:30' },
                        { title: 'What不用后期就能发圈', img: 'https://picsum.photos/600/400?random=3', time: '2026-03-25 17:00 - 17:30' },
                        { title: 'Alpha 额外活动', img: 'https://picsum.photos/600/400?random=4', time: '2026-03-25 17:00 - 17:30' }
                    ],
                    experience: [
                        { title: '福气满满的理想家', img: 'https://picsum.photos/600/400?random=5', time: '2026-02-10 - 02-24' },
                        { title: '福气满满的理想家', img: 'https://picsum.photos/600/400?random=6', time: '2026-02-10 - 02-24' },
                        { title: '福气满满的理想家', img: 'https://picsum.photos/600/400?random=7', time: '2026-02-10 - 02-24' }
                    ],
                    promoTabs: [
                        { key: 'new', name: '新品体验' },
                        { key: 'sale', name: '促销活动' },
                        { key: 'all', name: '全部活动' }
                    ],
                    promoData: {
                        new: [{ title: '新品首发体验', img: 'https://picsum.photos/600/400?random=8', time: '3-25' },
                            { title: '新品首发体验1', img: 'https://picsum.photos/600/400?random=8', time: '3-25' },
                            { title: '新品首发体验2', img: 'https://picsum.photos/600/400?random=8', time: '3-25' },
                            { title: '新品首发体验4', img: 'https://picsum.photos/600/400?random=8', time: '3-25' }
                        ],
                        sale: [{ title: '限时促销优惠', img: 'https://picsum.photos/600/400?random=9', time: '3-25' }],
                        all: [{ title: '新品首发体验', img: 'https://picsum.photos/600/400?random=8', time: '3-25' },
                            { title: '新品首发体验1', img: 'https://picsum.photos/600/400?random=8', time: '3-25' },
                            { title: '新品首发体验2', img: 'https://picsum.photos/600/400?random=8', time: '3-25' },
                            { title: '新品首发体验4', img: 'https://picsum.photos/600/400?random=8', time: '3-25' },
                            { title: '所有精彩活动', img: 'https://picsum.photos/600/400?random=10', time: '3-25' }]
                    },
                    stores: [
                        { name: '上海淮海中路店', address: '淮海中路901-909号1-3楼', phone: '021-64721212', time: '10:00-21:00', img: 'https://picsum.photos/600/400?random=11' },
                        { name: '苏州万象天地店', address: '苏州市姑苏区广济南路', phone: '0512-68833008', time: '10:00-22:00', img: 'https://picsum.photos/600/400?random=12' },
                        { name: '重庆万象城店', address: '重庆市九龙坡区谢家湾正街', phone: '023-68689181', time: '10:00-22:00', img: 'https://picsum.photos/600/400?random=13' },
                         { name: '重庆万象城店1', address: '重庆市九龙坡区谢家湾正街1', phone: '023-68689181', time: '10:00-22:00', img: 'https://picsum.photos/600/400?random=13' }
                    ]
                });
            }, 500);
        });
    }

    // 初始化页面逻辑
    fetchData().then(data => {
        allData = data;

        // 1. 渲染头部
        const info = data.storeInfo;
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            $('#storeInfo').html(`
                <div class="info-item"><h4>门店地址</h4><p>${info.address}</p></div>
                <div class="info-right-group">
                    <div class="info-item"><h4>营业时间</h4><p>${info.time}</p></div>
                    <div class="info-item"><h4>联系方式</h4><p>${info.phone}</p></div>
                </div>
            `);
        } else {
            $('#storeInfo').html(`
                <div class="info-item"><h4>门店地址</h4><p>${info.address}</p></div>
                <div class="info-item"><h4>营业时间</h4><p>${info.time}</p></div>
                <div class="info-item"><h4>联系方式</h4><p>${info.phone}</p></div>
            `);
        }

        // 2. 渲染 Alpha 和 体验
        $('#alphaList').html(data.alpha.map(createCardHtml).join(''));
        initSwiper('.activity-swiper');

        $('#experienceList').html(data.experience.map(createCardHtml).join(''));
        initSwiper('.experience-swiper');

        // 3. 促销活动 Tab 逻辑
        $('#promoTabs').html(data.promoTabs.map((t, i) => 
            `<div class="promp-tab ${i === 0 ? 'active' : ''}" data-key="${t.key}"><span>${t.name}</span></div>`
        ).join(''));
        updatePromo('new');

        // 4. 更多门店
        $('#storeList').html(data.stores.map(createStoreHtml).join(''));
        initSwiper('.store-swiper', {
            slidesPerView: 1.45,
            centeredSlides: false,
            scrollbar: { el: '.swiper-scrollbar', draggable: true },
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
            breakpoints: { 768: { slidesPerView: 3, spaceBetween: 20 } },
            // 懒加载配置
            lazy: {
                loadPrevNext: true,
                loadPrevNextAmount: 2,
                loadOnTransitionStart: true
            },
            preloadImages: false,
            watchSlidesProgress: true
        });
    });

    // 促销活动切换
    $(document).on('click', '.promp-tab', function () {
        const key = $(this).data('key');
        $(this).addClass('active').siblings().removeClass('active');
        updatePromo(key);
    });

    function updatePromo(key) {
        const list = allData.promoData[key];
        $('#promoList').html(list.map(createCardHtml).join(''));
        initSwiper('.promo-swiper');
    }
});