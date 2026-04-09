{
    console.log("🚀 启动极速防回刷版...");

    const CONFIG = {
        actionText: "转换为自己可见",
        confirmText: "确定",
        scrollStep: 1000,
        interval: 1200 // 缩短整体循环间隔
    };

    // 用来记录已经点击过的按钮，防止重复处理
    const processedButtons = new Set();

    const sleep = (ms) => new Promise(res => setTimeout(res, ms));

    async function run() {
        while (true) {
            // 1. 获取所有更多按钮
            let allBtns = Array.from(document.querySelectorAll('i.woo-font--angle-down, button[title="更多"], [class*="more"] i'));
            
            // 过滤掉：1.不在可视区域的  2.已经处理过的
            let visibleBtns = allBtns.filter(btn => {
                let rect = btn.getBoundingClientRect();
                return rect.top > 0 && rect.top < window.innerHeight && !processedButtons.has(btn);
            });

            if (visibleBtns.length === 0) {
                console.log("当前屏处理完毕，快速向下滚动...");
                window.scrollBy(0, CONFIG.scrollStep);
                await sleep(1000); // 滚动后给页面一点点加载时间
                continue;
            }

            for (let btn of visibleBtns) {
                try {
                    processedButtons.add(btn); // 立即标记，防止重复
                    
                    // 2. 直接点击，不再使用 slow scroll 动画
                    btn.click(); 
                    await sleep(400); // 缩短等待菜单弹出的时间

                    // 3. 寻找菜单项
                    let items = Array.from(document.querySelectorAll('.woo-pop-item-main, .woo-pop-wrap span, li'));
                    let target = items.find(el => el.innerText.includes(CONFIG.actionText));

                    if (target) {
                        target.click();
                        console.log(`✅ 匹配动作: ${CONFIG.actionText}`);
                        
                        // 4. 等待并点击确定
                        let foundOk = false;
                        for(let i=0; i<5; i++) { // 快速轮询确定按钮
                            await sleep(200);
                            let okBtn = Array.from(document.querySelectorAll('button, .woo-button-main'))
                                             .find(el => el.innerText.includes(CONFIG.confirmText));
                            if (okBtn) {
                                okBtn.click();
                                console.log("🎊 执行成功");
                                foundOk = true;
                                break;
                            }
                        }
                    } else {
                        // 没找到菜单（可能已是私密），点空白处关掉
                        document.body.click();
                    }
                } catch (err) {
                    console.log("跳过出错条目");
                }
                await sleep(500); // 条目间的短暂停顿
            }
            
            // 每处理完一屏，清理一下内存，防止 Set 过大
            if (processedButtons.size > 200) processedButtons.clear();
        }
    }

    run();
}