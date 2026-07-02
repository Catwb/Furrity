---
title: 兽聚日历
---



<script>

// 使用fetch获取API数据
async function fetchEvents() {
    try {
        const response = await fetch('https://api.furrycons.cn/event/recent');
        const data = await response.json();

        // 获取活动列表
        const events = data.data;
    
        // 获取页面上的容器
        const eventContainer = document.getElementById('eventContainer');
    
        // 嵌入CSS样式
        const style = document.createElement('style');
        style.textContent = `
            .event-container {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 20px;
                padding: 20px;
            }
    
            .event-card {
                border: 1px solid #ddd;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                transition: transform 0.3s ease;
            }
    
            .event-card:hover {
                transform: translateY(-5px);
            }
    
            .event-image {
                width: 100%;
                height: 180px;
                object-fit: cover;
            }
    
            .event-content {
                padding: 15px;
            }
    
            .event-title {
                margin-top: 0;
                color: #333;
            }
    
            .event-date, .event-location, .event-organizer {
                color: #666;
                margin: 5px 0;
            }
    
            .event-link {
                display: inline-block;
                margin-top: 10px;
                color: #4285f4;
                text-decoration: none;
            }
    
            .event-link:hover {
                text-decoration: underline;
            }
        `;
        document.head.appendChild(style);
    
        // 遍历活动并创建卡片
        events.forEach(event => {
            // 格式化日期
            const startDate = new Date(event.startDate).toLocaleDateString();
            const endDate = new Date(event.endDate).toLocaleDateString();
            
            document.querySelectorAll('img').forEach(img => {
                img.removeAttribute('data-srcset');
                img.removeAttribute('srcset');
              });
    
            // 创建卡片HTML
            const cardHTML = `
                <div class="event-card">
                    <img src="${event.coverUrl}" alt="${event.name}" class="event-image">
                    <div class="event-content">
                        <h3 class="event-title">${event.name}</h3>
                        <p class="event-date">时间: ${startDate} - ${endDate}</p>
                        <p class="event-location">地点: ${event.city || '信息未提供'}</p>
                        <p class="event-organizer">组织者: ${event.organization.name || '信息未提供'}</p>
                        <a href="${event.cnUrl}" target="_blank" class="event-link">活动详情</a>
                    </div>
                </div>
            `;
    
            // 将卡片添加到容器中
            eventContainer.innerHTML += cardHTML;
        });
    } catch (error) {
        console.error('获取活动数据失败:', error);
    }
}

// 页面加载完成后执行fetch
window.addEventListener('load', fetchEvents);

</script>

<div id="eventContainer" class="event-container"></div>
