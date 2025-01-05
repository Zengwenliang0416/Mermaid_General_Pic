document.addEventListener('DOMContentLoaded', function() {
    const codeEditor = document.getElementById('mermaid-code');
    const outputArea = document.getElementById('mermaid-output');
    const uploadBtn = document.getElementById('upload-btn');
    const downloadBtn = document.getElementById('download-btn');

    // 初始化Mermaid
    mermaid.initialize({ startOnLoad: true });

    // 实时更新预览
    codeEditor.addEventListener('input', updatePreview);

    function updatePreview() {
        const code = codeEditor.value;
        outputArea.innerHTML = code;
        mermaid.init(undefined, outputArea);
    }

    // 文件上传
    uploadBtn.addEventListener('click', function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt,.mmd';
        input.onchange = function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    codeEditor.value = e.target.result;
                    updatePreview();
                };
                reader.readAsText(file);
            }
        };
        input.click();
    });

    // 下载图片（这里仅演示SVG下载，其他格式需要额外处理）
    downloadBtn.addEventListener('click', function() {
        const svgElement = outputArea.querySelector('svg');
        if (svgElement) {
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
            const svgUrl = URL.createObjectURL(svgBlob);
            const downloadLink = document.createElement('a');
            downloadLink.href = svgUrl;
            downloadLink.download = 'mermaid-diagram.svg';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        } else {
            alert('没有可下载的图表。请先生成图表。');
        }
    });

    // 添加示例代码
    codeEditor.value = `graph TD
    A[开始] --> B{判断}
    B -->|条件1| C[处理1]
    B -->|条件2| D[处理2]
    C --> E[结束]
    D --> E`;
    updatePreview();
});
