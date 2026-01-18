/**
 * 注意：速度过快可能导致微博提示“操作频繁”，如出现请刷新页面稍后再试。
 */

async function turboClean() {
    console.log("准备清理微博...");

    // 1. 自动点击页面上所有能看到的确认按钮（后台持续运行）
    // 只要有“确认删除”的弹窗跳出来，0.1秒内就会被点掉
    const autoConfirm = setInterval(() => {
        const confirmBtn = document.querySelector('button.woo-button-primary.woo-dialog-btn');
        if (confirmBtn) confirmBtn.click();
    }, 100);

    // 2. 主执行循环
    while (true) {
        const moreButtons = document.querySelectorAll('i[class*="woo-font--angleDown"]');
        
        // 如果页面上没按钮了，疯狂向下滚动加载
        if (moreButtons.length < 2) {
            window.scrollBy(0, 2000);
            await new Promise(r => setTimeout(r, 1000)); // 给 1 秒加载新内容
            continue;
        }

        // 批量处理当前可见的所有“更多”按钮（跳过第 1 条）
        for (let i = 1; i < moreButtons.length; i++) {
            const btn = moreButtons[i];
            
            // 检查该按钮是否在可视区域或稍微靠下的位置，防止滚动失效
            const rect = btn.getBoundingClientRect();
            if (rect.top < 0 || rect.top > window.innerHeight + 500) continue;

            try {
                btn.click(); // 展开菜单
                // 极短等待，只要菜单一出来立刻点击删除
                await new Promise(r => setTimeout(r, 150)); 
                
                const menuItems = document.querySelectorAll('div[class*="woo-pop-item-main"]');
                for (const item of menuItems) {
                    const text = item.innerText.trim();
                    if (text === "删除" || text === "取消快转") {
                        item.click();
                        break; 
                    }
                }
                // 每点完一条，稍微停顿一下下，防止浏览器卡死
                await new Promise(r => setTimeout(r, 200));
            } catch (e) {
                // 忽略单个错误
            }
        }

        // 如果想彻底停止，可以在控制台输入 clearInterval(autoConfirm)
    }
}

turboClean();