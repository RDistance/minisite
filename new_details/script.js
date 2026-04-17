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

    // 从URL获取storeId
    function getStoreIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('storeId');
    }

    // 获取门店详情数据
    function fetchStoreDetail(dfId) {
        return $.ajax({
            url: 'https://dev-nsp.sonystyle.com.cn/dealero2o/app/master/dealer',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ dfId: dfId })
        });
    }

    // 获取门店活动数据
    function fetchShopActivities(shopId) {
        return $.ajax({
            url: 'https://dev-nsp.sonystyle.com.cn/ssoapps/retailer_activity/dealer/shopActivitys',
            type: 'GET',
            data: {
                conceal: 0,
                shopId: shopId,
                _: new Date().getTime()
            }
        });
    }

    // 获取所有门店列表
    function fetchAllStores() {
        return $.ajax({
            url: 'https://dev-nsp.sonystyle.com.cn/dealero2o/app/master/dealer/findAllDealer',
            type: 'GET',
            data: {
                longitude: 0,
                latitude: 0
            }
        });
    }

    // 处理活动数据，区分Alpha俱乐部和体验活动
    function processActivities(activities) {
        const alpha = [];
        const experience = [];

        if (activities && activities.result) {
            activities.result.forEach(item => {
                const activityData = {
                    title: item.activityName || '活动',
                    img: item.activityPics && item.activityPics.length > 0 
                        ? item.activityPics[0].picUrl 
                        : 'https://via.placeholder.com/600x400',
                    time: `${item.startTime || ''} - ${item.endTime || ''}`,
                    url: item.activityUrl || '#'
                };

                // activityType为DI的是Alpha俱乐部，非DI的是体验活动
                if (item.activityType === 'DI') {
                    alpha.push(activityData);
                } else {
                    experience.push(activityData);
                }
            });
        }

        return { alpha, experience };
    }

    // 处理门店详情数据中的促销活动和新品体验
    function processStoreData(storeData) {
        const promoData = {
            new: [], // 新品体验
            sale: [] // 促销活动
        };

        // 处理新品体验 (productList)
        if (storeData.productList && storeData.productList.length > 0) {
            storeData.productList.forEach(item => {
                const productData = {
                    title: item.productName || item.title || '新品体验',
                    img: item.activityImgUrl || 'https://via.placeholder.com/600x400',
                    time: item.activityDate || '',
                    url: item.linkUrl || item.mobileLink || '#'
                };
                promoData.new.push(productData);
            });
        }

        // 处理促销活动 (activityList)
        if (storeData.activityList && storeData.activityList.length > 0) {
            storeData.activityList.forEach(item => {
                const activityData = {
                    title: item.title || '促销活动',
                    img: item.activityImgUrl || 'https://via.placeholder.com/600x400',
                    time: item.activityDate || '',
                    url: item.linkUrl || item.mobileLink || '#'
                };
                promoData.sale.push(activityData);
            });
        }

        return promoData;
    }

    // 处理门店列表数据
    function processStores(storesData) {
        const stores = [];
        
        if (storesData && storesData.resultData) {
            storesData.resultData.forEach(item => {
                stores.push({
                    name: item.name || '门店',
                    address: item.address || '地址待更新',
                    phone: item.phone || '电话待更新',
                    time: item.businessHour || '营业时间待更新',
                    img: item.imgURL || 'https://via.placeholder.com/600x400',
                    id: item.id
                });
            });
        }

        return stores;
    }

    // 获取所有数据
    function fetchData() {
        const storeId = getStoreIdFromUrl();
        
        if (!storeId) {
            console.error('未找到storeId参数');
            return Promise.reject('未找到storeId参数');
        }

        // 并行请求所有接口
        return Promise.all([
            fetchStoreDetail(storeId),
            fetchShopActivities(storeId),
            fetchAllStores()
        ]).then(([storeDetail, shopActivities, allStores]) => {
            // 处理活动数据
            const { alpha, experience } = processActivities(shopActivities);
            
            // 处理促销活动和新品体验
            const promoData = processStoreData(storeDetail);
            
            // 处理门店列表
            const stores = processStores(allStores);

            return {
                storeInfo: {
                    address: storeDetail.address || '地址待更新',
                    time: storeDetail.businessHour || '营业时间待更新',
                    phone: storeDetail.phone || storeDetail.mobile || '电话待更新'
                },
                alpha: alpha.length > 0 ? alpha : [
                    { title: '暂无Alpha俱乐部活动', img: 'https://via.placeholder.com/600x400', time: '' }
                ],
                experience: experience.length > 0 ? experience : [
                    { title: '暂无体验活动', img: 'https://via.placeholder.com/600x400', time: '' }
                ],
                promoTabs: [
                    { key: 'new', name: '新品体验' },
                    { key: 'sale', name: '促销活动' }
                ],
                promoData: {
                    new: promoData.new.length > 0 ? promoData.new : [
                        { title: '暂无新品体验', img: 'https://via.placeholder.com/600x400', time: '' }
                    ],
                    sale: promoData.sale.length > 0 ? promoData.sale : [
                        { title: '暂无促销活动', img: 'https://via.placeholder.com/600x400', time: '' }
                    ]
                },
                stores: stores.length > 0 ? stores : [
                    { name: '暂无更多门店', address: '', phone: '', time: '', img: 'https://via.placeholder.com/600x400' }
                ]
            };
        }).catch(error => {
            console.error('数据获取失败:', error);
            // 返回默认数据
            return {
                storeInfo: {
                    address: '数据加载失败',
                    time: '数据加载失败',
                    phone: '数据加载失败'
                },
                alpha: [{ title: '数据加载失败', img: 'https://via.placeholder.com/600x400', time: '' }],
                experience: [{ title: '数据加载失败', img: 'https://via.placeholder.com/600x400', time: '' }],
                promoTabs: [
                    { key: 'new', name: '新品体验' },
                    { key: 'sale', name: '促销活动' }
                ],
                promoData: {
                    new: [{ title: '数据加载失败', img: 'https://via.placeholder.com/600x400', time: '' }],
                    sale: [{ title: '数据加载失败', img: 'https://via.placeholder.com/600x400', time: '' }]
                },
                stores: [{ name: '数据加载失败', address: '', phone: '', time: '', img: 'https://via.placeholder.com/600x400' }]
            };
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