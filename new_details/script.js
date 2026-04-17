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

    // 检测是否是移动端
    const isMobile = $(window).width() <= 768;

    // 渲染卡片 HTML（Alpha俱乐部和体验活动）
    function createCardHtml(item) {
        return `
            <div class="swiper-slide">
                <div class="card">
                    <div class="swiper-lazy-preloader"></div>
                    <img data-src="${item.img}" alt="${item.title}" class="swiper-lazy">
                    <div class="card-body">
                        <h3>${item.title}</h3>
                        <p class="time">${item.time}</p>
                        <div class="btn-link" data-url="${item.url}">查看详情 ></div>
                    </div>
                </div>
            </div>`;
    }

    // 渲染促销活动卡片 HTML（新品体验和促销活动）
    function createPromoCardHtml(item) {
        // 1 查看详情 2 立即报名 3 备注
        let btnText = "";
        let linkUrl = item.linkUrl || item.url || "#";
        let qrImgPath = item.qrImgPath || "";
        let linkClass = "";
        let linkData = "";
        
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
                    linkData = ` data-qr="${qrImgPath}"`;
                }
            }
        } else if (item.linkName == "3") {
            btnText = item.remark || "";
            linkUrl = "#"; // 备注不可跳转
            linkClass = " no-link";
        } else {
            // 默认情况
            btnText = "查看详情 >";
        }
        
        return `
            <div class="swiper-slide">
                <div class="card">
                    <div class="swiper-lazy-preloader"></div>
                    <img data-src="${item.img}" alt="${item.title}" class="swiper-lazy">
                    <div class="card-body">
                        <h3>${item.title}</h3>
                        <p class="time">${item.time}</p>
                        <div class="card-btn-wrapper">
                            <div class="card-qr-code" style="display: none;">
                                <img src="${qrImgPath}" alt="二维码" />
                            </div>
                            <div class="btn-link${linkClass}" data-url="${linkUrl}"${linkData}>${btnText}</div>
                        </div>
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

    // 获取用户当前位置
    function getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                console.warn('浏览器不支持地理定位，使用默认坐标');
                resolve({ longitude: 0, latitude: 0 });
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        longitude: position.coords.longitude,
                        latitude: position.coords.latitude
                    });
                },
                (error) => {
                    console.warn('获取位置失败，使用默认坐标:', error.message);
                    resolve({ longitude: 0, latitude: 0 });
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        });
    }

    // 获取所有门店列表
    function fetchAllStores(longitude, latitude) {
        return $.ajax({
            url: 'https://dev-nsp.sonystyle.com.cn/dealero2o/app/master/dealer/findDirectDealer',
            type: 'GET',
            data: {
                longitude: longitude,
                latitude: latitude
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
                    title: item.activityName || '',
                    img: item.activityPics && item.activityPics.length > 0 
                        ? item.activityPics[0].picUrl 
                        : '',
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
                    title: item.productName || item.title || '',
                    img: item.activityImgUrl || '',
                    time: item.activityDate || '',
                    linkUrl: item.linkUrl || '#',
                    mobileLink: item.mobileLink || '#',
                    linkType: item.linkType,
                    linkName: item.linkName,
                    remark: item.remark || '',
                    qrImgPath: item.qrImgPath || ''
                };
                promoData.new.push(productData);
            });
        }

        // 处理促销活动 (activityList)
        if (storeData.activityList && storeData.activityList.length > 0) {
            storeData.activityList.forEach(item => {
                const activityData = {
                    title: item.title || '',
                    img: item.activityImgUrl || '',
                    time: item.activityDate || '',
                    linkUrl: item.linkUrl || '#',
                    mobileLink: item.mobileLink || '#',
                    linkType: item.linkType,
                    linkName: item.linkName,
                    remark: item.remark || '',
                    qrImgPath: item.qrImgPath || ''
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
                    name: item.name || item.shopName || '',
                    address: item.address || '',
                    phone: item.phone || item.mobile || '',
                    time: item.businessHour || '',
                    img: item.imgURL || '',
                    qrCode: item.customerServiceUrl || '',
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
            return;
        }

        // 1. 获取门店详情并渲染
        fetchStoreDetail(storeId).then(storeDetail => {
            // 渲染门店信息
            const info = {
                address: storeDetail.address || '',
                time: storeDetail.businessHour || '',
                phone: storeDetail.phone || storeDetail.mobile || ''
            };
            renderStoreInfo(info);

            // 处理并渲染促销活动和新品体验
            const promoData = processStoreData(storeDetail);
            allData = allData || {};
            allData.promoData = promoData;
            allData.promoTabs = [
                { key: 'new', name: '新品体验' },
                { key: 'sale', name: '促销活动' }
            ];
            
            // 渲染促销活动 Tab
            $('#promoTabs').html(allData.promoTabs.map((t, i) => 
                `<div class="promp-tab ${i === 0 ? 'active' : ''}" data-key="${t.key}"><span>${t.name}</span></div>`
            ).join(''));
            updatePromo('new');
        }).catch(error => {
            console.error('门店详情获取失败:', error);
        });

        // 2. 获取门店活动并渲染
        fetchShopActivities(storeId).then(shopActivities => {
            const { alpha, experience } = processActivities(shopActivities);
            
            // 渲染 Alpha 俱乐部
            $('#alphaList').html(alpha.map(createCardHtml).join(''));
            initSwiper('.activity-swiper');

            // 渲染体验活动
            $('#experienceList').html(experience.map(createCardHtml).join(''));
            initSwiper('.experience-swiper');
        }).catch(error => {
            console.error('门店活动获取失败:', error);
        });

        // 3. 获取用户位置后获取所有门店并渲染
        getCurrentLocation().then(location => {
            return fetchAllStores(location.longitude, location.latitude);
        }).then(allStores => {
            const stores = processStores(allStores);
            
            // 渲染更多门店
            $('#storeList').html(stores.map(createStoreHtml).join(''));
            initSwiper('.store-swiper', {
                slidesPerView: 1.45,
                centeredSlides: false,
                scrollbar: { el: '.swiper-scrollbar', draggable: true },
                navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
                breakpoints: { 768: { slidesPerView: 3, spaceBetween: 20 } },
                lazy: {
                    loadPrevNext: true,
                    loadPrevNextAmount: 2,
                    loadOnTransitionStart: true
                },
                preloadImages: false,
                watchSlidesProgress: true
            });
        }).catch(error => {
            console.error('门店列表获取失败:', error);
        });
    }

    // 渲染门店信息
    function renderStoreInfo(info) {
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
    }

    // 初始化页面逻辑
    fetchData();

    // 促销活动切换
    $(document).on('click', '.promp-tab', function () {
        const key = $(this).data('key');
        $(this).addClass('active').siblings().removeClass('active');
        updatePromo(key);
    });

    function updatePromo(key) {
        const list = allData.promoData[key];
        $('#promoList').html(list.map(createPromoCardHtml).join(''));
        initSwiper('.promo-swiper');
    }

    // 卡片按钮hover显示二维码（PC端）
    $(document).on({
        mouseenter: function () {
            const qrImgPath = $(this).data("qr");
            const $wrapper = $(this).closest(".card-btn-wrapper");
            const $qrCode = $wrapper.find(".card-qr-code");

            if (qrImgPath && !isMobile) {
                $qrCode.fadeIn(200);
            }
        },
        mouseleave: function () {
            const $wrapper = $(this).closest(".card-btn-wrapper");
            const $qrCode = $wrapper.find(".card-qr-code");
            $qrCode.fadeOut(200);
        }
    }, ".btn-link.has-qr");

    // 卡片按钮点击跳转
    $(document).on("click", ".btn-link", function () {
        const linkUrl = $(this).data("url");
        // 如果有no-link类，不跳转
        if ($(this).hasClass("no-link")) {
            return;
        }
        // 正常跳转
        if (linkUrl && linkUrl !== "#") {
            window.open(linkUrl, "_blank");
        }
    });
});