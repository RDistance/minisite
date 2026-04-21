$(function () {
    let allData = null; // 存储数据流
    const swipers = {}; // 存储所有 swiper 实例
    let map = null; // 百度地图实例
    let currentStoreData = null; // 当前门店数据

    // 其他门店数据（用于下拉选择）
    const otherStores = [
        { id: "884e852190394db8b3c584dfddb17285", name: "Sony Store重庆万象城店" },
        { id: "92449722c1b7423db185b99819de8b53", name: "Sony Store武汉梦时代店" },
        { id: "615f36d66a694724ab62070db516571b", name: "Sony Store北京东方广场店" },
        { id: "11dd790be96140b392dfd4d2e7026075", name: "Sony Store上海淮海中路店" },
        { id: "c921749301a34e17af42ce331485311a", name: "Sony Store广州正佳广场店" },
        { id: "ed667737875c45b888886c192bd324af", name: "Sony Store成都来福士店" },
        { id: "50403606a52e486dbb7ce6ce6373e944", name: "Sony Store深圳深业上城店" },
        { id: "9921f17ab60e458c91b1439167393116", name: "Sony Store南京水游城店" },
        { id: "ac76e7798c3540748d2119f48bbc3ea3", name: "Sony Store杭州湖滨88店" },
        { id: "7cf912ff839a4c0a9cddedfe2aff7b41", name: "Sony Store苏州万象天地店" }
    ];

    // 通用 Swiper 初始化配置
    function initSwiper(selector, options = {}) {
        // 如果已存在实例，先销毁
        if (swipers[selector]) swipers[selector].destroy(true, true);

        const isMobile =  $(window).width() <= 768;
        
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

    // 渲染暂无活动提示
    function createNoActivityHtml() {
        return `<div class="no-activity"><div class="no-activity-text">暂无活动</div></div>`;
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
                        <p><img src="/content/dam/sonystyle/smallapp/dealerweb/images/directstore/icon/location.png" alt="" class="info-icon">${item.address}</p>
                        <p><img src="/content/dam/sonystyle/smallapp/dealerweb/images/directstore/icon/phone.png" alt="" class="info-icon">${item.phone}</p>
                        <p><img src="/content/dam/sonystyle/smallapp/dealerweb/images/directstore/icon/time.png" alt="" class="info-icon">${item.time}</p>
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

    // 初始化地图
    function initMap(latitude, longitude, name, address, phone, img) {
        if (!map) {
            map = new BMap.Map("map");
        } else {
            // 清除地图上的所有覆盖物
            map.clearOverlays();
        }
        
        const poi = new BMap.Point(longitude, latitude);
        map.centerAndZoom(poi, 20);
        map.enableScrollWheelZoom();

        const content = '<div style="margin:0;line-height:20px;padding:2px;">' +
            '<img src="' + img + '" alt="" style="float:right;zoom:1;overflow:hidden;width:100px;margin-left:3px;"/>' +
            '地址：' + address + '<br/>电话：' + phone + '<br/>' +
            '</div>';

        // 创建检索信息窗口对象
        const searchInfoWindow = new BMapLib.SearchInfoWindow(map, content, {
            title: name,
            width: 290,
            height: 120,
            panel: "panel",
            enableAutoPan: true,
            searchTypes: [
                BMAPLIB_TAB_TO_HERE,
                BMAPLIB_TAB_FROM_HERE,
                BMAPLIB_TAB_SEARCH
            ]
        });

        const marker = new BMap.Marker(poi);
        marker.enableDragging();
        marker.addEventListener("click", function(e) {
            searchInfoWindow.open(marker);
        });
        map.addOverlay(marker);
    }

    // 渲染地图区域信息
    function renderMapSection(storeData) {
        currentStoreData = storeData;

        // 更新门店名称（更新面包屑和导航栏）
        const storeName = storeData.name.replace(/Sony Store/gi, "");
        $('#breadcrumbStoreName').text(storeName);

        // 添加或更新导航栏中的门店名称
        let mapNavLeft = $('.map-nav-left');
        if (mapNavLeft.length === 0) {
            $('.map-nav').prepend('<div class="map-nav-left"><span class="store-name"></span></div>');
            mapNavLeft = $('.map-nav-left');
        }
        mapNavLeft.find('.store-name').text(storeName);

        // 更新门店图片 - 从接口的 imgURL 字段获取
        if (storeData.imgURL && storeData.imgURL !== '/dealero2o/upload/images/default.jpg') {
            $('#storeImg').attr('src', storeData.imgURL);
        } else {
            // 如果没有图片或是默认图片，使用占位图
            $('#storeImg').attr('src', 'https://via.placeholder.com/862x500?text=Store+Image');
        }

        // 填充下拉选择框
        const currentStoreId = getStoreIdFromUrl();
        let optionsHtml = '<option value="0">选择其他直营店</option>';
        otherStores.forEach(store => {
            if (store.id !== currentStoreId) {
                optionsHtml += '<option value="' + store.id + '">' + store.name + '</option>';
            }
        });
        $('#storeSelect').html(optionsHtml);

        // 初始化地图 - 使用门店图片作为地图标注的缩略图
        const phone = storeData.phone && storeData.mobile
            ? storeData.phone + '，' + storeData.mobile
            : (storeData.phone || storeData.mobile || '');
        const mapThumbnail = storeData.imgURL && storeData.imgURL !== '/dealero2o/upload/images/default.jpg'
            ? storeData.imgURL
            : 'https://via.placeholder.com/100x100?text=Store';
        initMap(storeData.latitude, storeData.longitude, storeData.name, storeData.address, phone, mapThumbnail);
    }

    // 地图/实景切换
    $(document).on('click', '.map-control a', function() {
        const target = $(this).data('target');
        $('.map-control a').removeClass('active');
        $(this).addClass('active');
        $('.map-display').removeClass('active');
        $('#' + target).addClass('active');
        
        // 如果切换到地图，需要触发地图重新渲染
        if (target === 'mapContainer' && map) {
            setTimeout(function() {
                // 重新设置中心点以确保标注点显示
                if (currentStoreData) {
                    const poi = new BMap.Point(currentStoreData.longitude, currentStoreData.latitude);
                    map.setCenter(poi);
                }
            }, 100);
        }
    });

    // 下拉选择切换门店
    $('#storeSelect').on('change', function() {
        const storeId = $(this).val();
        if (storeId !== '0') {
            window.location.href = 'detail_s.html?storeId=' + storeId;
        }
    });

    // 获取门店详情数据
    function fetchStoreDetail(dfId) {
        return $.ajax({
            url: 'https://dev-nsp.sonystyle.com.cn/dealero2o/app/master/dealer',
            // contentType: 'application/json',
            // data: JSON.stringify({ dfId: dfId }),
            type: 'GET',
            data: {
                dfId: dfId,
                _: new Date().getTime()
            }
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
                    time: formatActivityTime(item.startTime, item.endTime),
                    url: item.activityUrl || '#',
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
                const startDate = new Date(item.activityStartDate);
                const formattedDate = startDate.toISOString().split('T')[0];
                const productData = {
                    title: item.productName || item.title || '',
                    img: item.activityImgUrl || '',
                    time: `${formattedDate} ${item.activityTime}` || '',
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
                const startDate = new Date(item.activityStartDate);
                const formattedDate = startDate.toISOString().split('T')[0];
                const activityData = {
                    title: item.title || '',
                    img: item.activityImgUrl || '',
                    time: `${formattedDate} ${item.activityTime}` || '',
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
            // 渲染地图区域
            renderMapSection(storeDetail);
            
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
            if (alpha.length === 0) {
                $('.activity-swiper').replaceWith(createNoActivityHtml());
            } else {
                $('#alphaList').html(alpha.map(createCardHtml).join(''));
                initSwiper('.activity-swiper');
            }

            // 渲染体验活动
            if (experience.length === 0) {
                $('.experience-swiper').replaceWith(createNoActivityHtml());
            } else {
                $('#experienceList').html(experience.map(createCardHtml).join(''));
                initSwiper('.experience-swiper');
            }
        }).catch(error => {
            console.error('门店活动获取失败:', error);
            // 失败时也显示暂无活动
            $('.activity-swiper').replaceWith(createNoActivityHtml());
            $('.experience-swiper').replaceWith(createNoActivityHtml());
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
        const isMobile =  $(window).width() <= 768;
        
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
        
        if (list.length === 0) {
            $('.promo-swiper').replaceWith(createNoActivityHtml());
        } else {
            // 如果之前是暂无活动状态，需要恢复swiper结构
            if ($('.tab-panels .no-activity').length > 0) {
                $('.tab-panels').html('<div class="swiper promo-swiper"><div class="swiper-wrapper" id="promoList"></div></div>');
            }
            $('#promoList').html(list.map(createPromoCardHtml).join(''));
            initSwiper('.promo-swiper');
        }
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