$(function () {
    // 检测是否是移动端
    const isMobile = $(window).width() <= 768;
    const pageSize = isMobile ? 10 : 9;
    let currentPage = 1;
    let filteredData = [];
    let currentStoreId = "";
    let currentSort = 0; // 0是新品，1是促销
    let dealerData = []; // 存储API返回的商店数据
    let totalCount = 0; // 活动总数
    let isLoading = false; // 是否正在加载

    // 渲染卡片（移动端：追加，PC端：替换）
    function renderList(append = false) {
        const html = filteredData.map(item => `
      <div class="card">
        <img src="${item.img}" alt="${item.title}" />
        <div class="card-content">
          <div class="card-title">${item.title}</div>
          <div class="card-time">${item.time}</div>
          <div class="card-btn" data-link="${item.linkUrl}" data-link-type="${item.linkType}">我要报名 ></div>
        </div>
      </div>
    `).join("");

        if (append) {
            $("#cardList").append(html);
        } else {
            $("#cardList").html(html);
        }
    }

    // 分页
    function renderPagination() {
        const totalPages = Math.ceil(totalCount / pageSize);

        $(".current").text(currentPage);
        $(".total").text(`共 ${totalPages} 页`);

        if (currentPage === 1) {
            $(".prev").addClass("disabled");
        } else {
            $(".prev").removeClass("disabled");
        }

        if (currentPage === totalPages) {
            $(".next").addClass("disabled");
        } else {
            $(".next").removeClass("disabled");
        }

        // 更新加载更多按钮状态
        if (isMobile) {
            if (filteredData.length >= totalCount) {
                $("#loadMore").addClass("disabled");
                $(".load-more-text").text("没有更多了");
            } else {
                $("#loadMore").removeClass("disabled");
                $(".load-more-text").text("加载更多");
            }
        }
    }

    // 上一页
    $(document).on("click", ".prev", function () {
        if ($(this).hasClass("disabled")) return;

        currentPage--;
        loadActivityList();
    });

    // 下一页
    $(document).on("click", ".next", function () {

        if ($(this).hasClass("disabled")) return;

        currentPage++;
        loadActivityList();
    });

    // 加载更多（移动端）
    $(document).on("click", "#loadMore", function () {
        if ($(this).hasClass("disabled") || isLoading) return;

        currentPage++;
        loadMoreActivityList();
    });

    // 自定义下拉框
    $(".custom-select").on("click", ".select-trigger", function(e) {
        e.stopPropagation();
        const $options = $(this).siblings(".select-options");
        const $trigger = $(this);

        $(".select-options").not($options).removeClass("open");
        $(".select-trigger").not($trigger).removeClass("active");

        $options.toggleClass("open");
        $trigger.toggleClass("active");
    });

    // 选择选项
    $(".custom-select").on("click", ".select-options > div", function() {
        const value = $(this).data("value");
        const $select = $(this).closest(".custom-select");

        // 移除之前的selected状态
        $select.find(".select-options > div").removeClass("selected");
        // 给当前选项添加selected状态
        $(this).addClass("selected");

        // 更新触发器文字
        $select.find(".select-trigger").text(value);

        // 关闭下拉并移除active状态
        $select.find(".select-options").removeClass("open");
        $select.find(".select-trigger").removeClass("active");

        // 根据不同下拉框处理
        if ($select.attr("id") === "typeSelect") {
            currentSort = $(this).data("sort");
            currentPage = 1;
            // 切换活动类型时重新加载活动列表
            loadActivityList();
        } else if ($select.attr("id") === "storeSelect") {
            currentStoreId = $(this).data("id");
            currentPage = 1;
            // 切换门店时重新加载活动列表
            loadActivityList();
        }
    });

    // 点击外部关闭下拉
    $(document).on("click", function() {
        $(".select-options").removeClass("open");
        $(".select-trigger").removeClass("active");
    });

    // 获取商店数据API
    function fetchDealerData() {
        return $.ajax({
            url: "https://dev-nsp.sonystyle.com.cn/dealero2o/app/master/dealer/findAllDealer",
            method: "GET",
            dataType: "json"
        });
    }

    // 获取活动列表API
    function fetchActivityList(pageNumber, pageSize, sort, dealerId) {
        const baseUrl = "https://dev-nsp.sonystyle.com.cn/dealero2o/app/master/getActivityList";
        let url = `${baseUrl}?pageNumber=${pageNumber}&pageSize=${pageSize}&sort=${sort}`;
        if (dealerId) {
            url += `&dealerId=${dealerId}`;
        }
        return $.ajax({
            url: url,
            method: "GET",
            dataType: "json"
        });
    }

    // 初始化商店下拉框
    function initStoreSelect(dealerData) {
        console.log(dealerData)
        const $storeSelect = $("#storeSelect");
        const $optionsContainer = $storeSelect.find(".select-options");

        // 清空现有选项
        $optionsContainer.empty();

        // 添加API返回的商店选项
        dealerData.forEach(dealer => {
            $optionsContainer.append(`<div data-value="${dealer.name}" data-id="${dealer.id}">${dealer.name}</div>`);
        });

        // 设置默认选中第一个商店
        if (dealerData.length > 0) {
            const firstDealer = dealerData[0];
            $storeSelect.find(".select-trigger").text(firstDealer.name);
            currentStoreId = firstDealer.id;

            // 加载第一个门店的活动列表
            loadActivityList();
        }
    }

    // 加载活动列表（PC端：替换，移动端：初次加载替换）
    function loadActivityList() {
        if (!currentStoreId) return;

        fetchActivityList(currentPage, pageSize, currentSort, currentStoreId)
            .done(function(response) {
                if (response.result && response.returnData) {
                    const returnData = response.returnData;
                    const activities = returnData.listData;

                    totalCount = returnData.totalCount || 0; // 更新总数

                    // 转换数据格式以匹配现有的渲染逻辑
                    filteredData = activities.map(item => ({
                        title: item.title || "活动标题",
                        time: `${item.activityDate} ${item.activityTime}`,
                        img: item.activityImgUrl || "activity.jpg",
                        type: currentSort === 0 ? "新品体验" : "促销活动",
                        linkUrl: item.linkUrl || item.mobileLink || "#",
                        linkType: item.linkType,
                        content: item.content || ""
                    }));

                    // PC端：替换；移动端：初次加载替换
                    renderList(false);
                    renderPagination();
                } else {
                    console.error("活动列表API返回数据格式错误:", response);
                }
            })
            .fail(function(error) {
                console.error("获取活动列表失败:", error);
            });
    }

    // 加载更多活动列表（移动端：追加）
    function loadMoreActivityList() {
        if (!currentStoreId || isLoading) return;

        isLoading = true;
        $("#loadMore").addClass("loading");

        fetchActivityList(currentPage, pageSize, currentSort, currentStoreId)
            .done(function(response) {
                if (response.result && response.returnData) {
                    const returnData = response.returnData;
                    const activities = returnData.listData;

                    // 转换数据格式以匹配现有的渲染逻辑
                    const newItems = activities.map(item => ({
                        title: item.title || "活动标题",
                        time: `${item.activityDate} ${item.activityTime}`,
                        img: item.activityImgUrl || "activity.jpg",
                        type: currentSort === 0 ? "新品体验" : "促销活动",
                        linkUrl: item.linkUrl || item.mobileLink || "#",
                        linkType: item.linkType,
                        content: item.content || ""
                    }));

                    // 追加到现有数据
                    filteredData = filteredData.concat(newItems);

                    // 追加渲染
                    renderList(true);
                    renderPagination();
                } else {
                    console.error("活动列表API返回数据格式错误:", response);
                }
            })
            .fail(function(error) {
                console.error("获取活动列表失败:", error);
            })
            .always(function() {
                isLoading = false;
                $("#loadMore").removeClass("loading");
            });
    }

    // 初始化
    fetchDealerData()
        .done(function(response) {
            // 从响应对象中提取resultData字段
            if (response.result && response.resultData) {
                dealerData = response.resultData; // 存储resultData数据
                initStoreSelect(dealerData);
            } else {
                console.error("API返回数据格式错误:", response);
                // 如果API失败，使用默认数据
                renderList();
                renderPagination();
            }
        })
        .fail(function(error) {
            console.error("获取商店数据失败:", error);
            // 如果API失败，使用默认数据
            renderList();
            renderPagination();
        });
});
