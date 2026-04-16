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
        const html = filteredData.map(item => {
            // 1 查看详情 2 立即报名 3 备注
            let btnText = "";
            let linkUrl = item.linkUrl;
            let qrImgPath = item.qrImgPath || "";
            
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
                    }
                }
            } else if (item.linkName == "3") {
                btnText = item.remark || "";
                linkUrl = "#"; // 备注不可跳转
            }
            
            return `
      <div class="card name-${item.linkName}" data-link="${linkUrl}">
        <img class="card-img" src="${item.img}" alt="${item.title}" data-link="${linkUrl}" data-qr="${qrImgPath}" />
        <div class="card-content">
          <div class="card-title">${item.title}</div>
          <div class="card-time">${item.time}</div>
          <div class="card-btn name-${item.linkName}" data-link="${linkUrl}" data-qr="${qrImgPath}">${btnText}</div>
        </div>
      </div>
    `;
        }).join("");

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

    // 卡片按钮hover显示二维码（PC端）
    $(document).on({
        mouseenter: function () {
            const qrImgPath = $(this).data("qr");
            if (qrImgPath && !isMobile) {
                showQRCodeTooltip($(this), qrImgPath);
            }
        },
        mouseleave: function () {
            if (!isMobile) {
                hideQRCodeTooltip();
            }
        }
    }, ".card-btn");

    // 卡片按钮点击跳转
    $(document).on("click", ".card-btn", function () {
        const linkUrl = $(this).data("link");
        // 正常跳转
        if (linkUrl && linkUrl !== "#") {
            window.open(linkUrl, "_blank");
        }
    });

    // 卡片图片点击跳转
    $(document).on("click", ".card", function () {
        const linkUrl = $(this).data("link");
        // 正常跳转
        if (linkUrl && linkUrl !== "#") {
            window.open(linkUrl, "_blank");
        }
    });

    // 显示二维码弹窗
    function showQRCodeModal(qrImgPath) {
        // 移除已存在的弹窗
        $("#qrModal").remove();
        
        // 创建弹窗HTML
        const modalHtml = `
            <div id="qrModal" class="show">
                <div class="modal-content">
                    <span class="close-btn">&times;</span>
                    <img src="${qrImgPath}" alt="二维码" />
                </div>
            </div>
        `;
        
        // 添加弹窗到页面
        $("body").append(modalHtml);
        
        // 点击关闭按钮或弹窗外部关闭
        $(".close-btn, #qrModal").on("click", function(e) {
            if (e.target === this) {
                $("#qrModal").fadeOut(300, function() {
                    $(this).remove();
                });
            }
        });
    }

    // 显示二维码tooltip（PC端hover）
    function showQRCodeTooltip($element, qrImgPath) {
        // 移除已存在的tooltip
        $("#qrTooltip").remove();
        
        // 获取按钮位置
        const offset = $element.offset();
        const width = $element.outerWidth();
        const height = $element.outerHeight();
        
        // 创建tooltip HTML
        const tooltipHtml = `
            <div id="qrTooltip" style="position: absolute; top: ${offset.top + height + 10}px; left: ${offset.left}px; z-index: 9999; background: white; padding: 10px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <img src="${qrImgPath}" alt="二维码" style="width: 150px; height: 150px;" />
            </div>
        `;
        
        // 添加tooltip到页面
        $("body").append(tooltipHtml);
    }

    // 隐藏二维码tooltip
    function hideQRCodeTooltip() {
        $("#qrTooltip").remove();
    }

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
                    filteredData = activities.map(item => {
                        // 将 activityStartDate 时间戳转换为日期格式
                        const startDate = new Date(item.activityStartDate);
                        const formattedDate = startDate.toISOString().split('T')[0];
                        
                        return {
                            title: item.title,
                            time: `${formattedDate} ${item.activityTime}`,
                            img: item.activityImgUrl,
                            linkUrl: item.linkUrl || "#",
                            mobileLink: item.mobileLink || "#",
                            linkType: item.linkType,
                            linkName: item.linkName,
                            remark: item.remark || "",
                            qrImgPath: item.qrImgPath || ""
                        };
                    });

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
                    const newItems = activities.map(item => {
                        // 将 activityStartDate 时间戳转换为日期格式
                        const startDate = new Date(item.activityStartDate);
                        const formattedDate = startDate.toISOString().split('T')[0];
                        
                        return {
                            title: item.title,
                            time: `${formattedDate} ${item.activityTime}`,
                            img: item.activityImgUrl,
                            linkUrl: item.linkUrl || "#",
                            mobileLink: item.mobileLink || "#",
                            linkType: item.linkType,
                            linkName: item.linkName,
                            remark: item.remark || "",
                            qrImgPath: item.qrImgPath || ""
                        };
                    });

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
                renderPagination();
            }
        })
        .fail(function(error) {
            console.error("获取商店数据失败:", error);
            renderPagination();
        });
});
