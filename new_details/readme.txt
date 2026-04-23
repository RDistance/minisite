/Users/t0230543/Documents/项目/2026/3月/minisite/new_details/style.css
/Users/t0230543/Documents/项目/2026/3月/minisite/new_details/script.js
/Users/t0230543/Documents/项目/2026/3月/minisite/new_details/new_details.html


.promp-tab span 切换时，蓝色色块要有移动效果


C:\tools2026\code\minisite\new_index\new_index.html
C:\tools2026\code\minisite\new_index\style.css
C:\tools2026\code\minisite\new_index\script.js


header-info PC端联系方式后面 增加二维码图片  参考门店的qr-code-wrapper 
 数据来源于https://dev-nsp.sonystyle.com.cn/dealero2o/app/master/dealer dfId  接口的customerServiceUrl 这是二维码图地址



 dealer前端页面，有几个url要更新下
① https://www.sonystyle.com.cn/retailer_activity/  开头的更新为 https://www.sonystyle.com.cn/ssoapps/retailer_activity/ 开头
② https://www.sonystyle.com.cn/smallapp/acafe/lectures/  开头的更新为  https://www.sonystyle.com.cn/smallapp/lecture/offline/lectures/ 开头


希望每个元素 标题 块之类 随着滚动条 感觉有从下往上出现的感觉  
除第一屏banner 和citylist 可以参考下面的CSS
transform: translate3d(0, 30px, 0);
opacity: 0;
transition: transform .8s, opacity 1.2s;

变化后的样式
transform: translate3d(0, 0, 0);
opacity: 1;