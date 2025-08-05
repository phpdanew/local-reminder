// 获取DOM元素
let reminderInput, addButton;

// 确保DOM元素存在
function initializeElements() {
    reminderInput = document.getElementById('reminderInput');
    addButton = document.getElementById('addButton');
    
    console.log('初始化元素检查:');
    console.log('输入框元素:', reminderInput);
    console.log('按钮元素:', addButton);
    
    if (!reminderInput) {
        console.error('输入框元素未找到！');
    }
    if (!addButton) {
        console.error('按钮元素未找到！');
    }
    
    // 重新绑定事件监听器
    if (addButton) {
        addButton.addEventListener('click', (e) => {
            console.log('按钮被点击了！');
            e.preventDefault();
            addReminder();
        });
    }
    
    if (reminderInput) {
        reminderInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                console.log('回车键被按下！');
                addReminder();
            }
        });
        
        
    }
}

// 添加提醒功能
function addReminder() {
    const text = reminderInput.value.trim();
    
    if (text === '') {
        // 添加输入框抖动效果
        reminderInput.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            reminderInput.style.animation = '';
        }, 500);
        return;
    }
    
    // 准备请求数据
    const requestData = {
        text: text,
        timestamp: new Date().toISOString(),
        delay_minutes: 30  // 默认30分钟延时
    };
    
    // 发送HTTP请求
    fetch('http://localhost:3333/api/reminders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('提醒已设置:', data);
        showSuccessMessage(`提醒已设置，${data.delay_minutes}分钟后通知！`);
        
        // 清空输入框
        reminderInput.value = '';
        
        // 添加成功动画
        addButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            addButton.style.transform = '';
        }, 150);
    })
    .catch(error => {
        console.error('发送提醒时出错:', error);
        showErrorMessage('发送失败，请重试');
    });
}

// 显示成功消息
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'message success-message';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    
    // 2秒后自动移除
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.parentNode.removeChild(successDiv);
        }
    }, 2000);
}

// 显示错误消息
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'message error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    // 3秒后自动移除
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 3000);
}



// 添加抖动动画的CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('页面加载完成');
    initializeElements();
    
    // 聚焦到输入框
    if (reminderInput) {
        reminderInput.focus();
    }
});

// 延迟检查，确保元素存在
setTimeout(() => {
    console.log('延迟检查元素...');
    if (!reminderInput || !addButton) {
        console.log('元素未找到，重新初始化...');
        initializeElements();
    }
}, 1000);

// // 添加一些交互效果
// reminderInput.addEventListener('focus', () => {
//     reminderInput.style.transform = 'scale(1.02)';
// });

// reminderInput.addEventListener('blur', () => {
//     reminderInput.style.transform = 'scale(1)';
// }); 