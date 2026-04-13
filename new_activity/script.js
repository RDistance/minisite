$(function () {
    // 模拟数据
    const data = Array.from({ length: 30 }, (_, i) => ({
        title: "从0到1学摄影·专人答疑",
        time: "2026-03-25 17:00 - 17:30",
        img: "activity.jpg",
        type: i % 2 === 0 ? "新品体验" : "促销活动"
    }));

    const pageSize = 6;
    let currentPage = 1;
    let filteredData = [...data];
    let currentStore = "北京东方广场店";
    let currentType = "新品体验";

    // 渲染卡片
    function renderList() {
        const start = (currentPage - 1) * pageSize;
        const list = filteredData.slice(start, start + pageSize);

        const html = list.map(item => `
      <div class="card">
        <img src="${item.img}" />
        <div class="card-content">
          <div class="card-title">${item.title}</div>
          <div class="card-time">${item.time}</div>
          <div class="card-btn">我要报名 ></div>
        </div>
      </div>
    `).join("");

        $("#cardList").html(html);
    }

    // 分页
    function renderPagination() {
        const totalPages = Math.ceil(filteredData.length / pageSize);

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
    }

    // 上一页
    $(document).on("click", ".prev", function () {
        if ($(this).hasClass("disabled")) return;

        currentPage--;
        renderList();
        renderPagination();
    });

    // 下一页
    $(document).on("click", ".next", function () {
        const totalPages = Math.ceil(filteredData.length / pageSize);

        if ($(this).hasClass("disabled")) return;

        currentPage++;
        renderList();
        renderPagination();
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
            currentType = value;
            if (value === "全部") {
                filteredData = [...data];
            } else {
                filteredData = data.filter(item => item.type === value);
            }
            currentPage = 1;
            renderList();
            renderPagination();
        } else if ($select.attr("id") === "storeSelect") {
            currentStore = value;
        }
    });

    // 点击外部关闭下拉
    $(document).on("click", function() {
        $(".select-options").removeClass("open");
        $(".select-trigger").removeClass("active");
    });

    // 初始化选中状态
    function initSelectedState() {
        // 为默认选中的选项添加selected类
        const typeTriggerText = $("#typeSelect .select-trigger").text();
        $("#typeSelect .select-options > div").each(function() {
            if ($(this).data("value") === typeTriggerText) {
                $(this).addClass("selected");
            }
        });

        const storeTriggerText = $("#storeSelect .select-trigger").text();
        $("#storeSelect .select-options > div").each(function() {
            if ($(this).data("value") === storeTriggerText) {
                $(this).addClass("selected");
            }
        });
    }

    // 初始化
    initSelectedState();
    renderList();
    renderPagination();
});