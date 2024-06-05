const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const colorInfo = document.getElementById('color-info');

const canvasWidthInput = document.getElementById('canvas-width');
const canvasHeightInput = document.getElementById('canvas-height');
const updateCanvasSizeButton = document.getElementById('update-canvas-size');

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        video.play();
    })
    .catch(err => {
        console.error("Error accessing the camera: ", err);
    });

video.addEventListener('play', () => {
    updateCanvasSize();

    setInterval(() => {
        const width = canvas.width;
        const height = canvas.height;
        context.drawImage(video, 0, 0, width, height);

        // 특정 구역 설정 (예: 중앙 부분 50x50 픽셀 영역)
        const regionSize = 50;
        const x = width / 2 - regionSize / 2;
        const y = height / 2 - regionSize / 2;
        const imageData = context.getImageData(x, y, regionSize, regionSize);
        const data = imageData.data;

        let r = 0, g = 0, b = 0;

        // 각 픽셀의 색상 값을 합산
        for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
        }

        // 평균 색상 계산
        const pixelCount = data.length / 4;
        r = Math.floor(r / pixelCount);
        g = Math.floor(g / pixelCount);
        b = Math.floor(b / pixelCount);

        // 기준 색상과 비교 (예: 빨간색)
        const targetColor = { r: 255, g: 0, b: 0 };
        const tolerance = 50;

        if (Math.abs(r - targetColor.r) < tolerance &&
            Math.abs(g - targetColor.g) < tolerance &&
            Math.abs(b - targetColor.b) < tolerance) {
            colorInfo.textContent = `Color Matched! R: ${r}, G: ${g}, B: ${b}`;
        } else {
            colorInfo.textContent = `Color Not Matched. R: ${r}, G: ${g}, B: ${b}`;
            notifyUser(`Color Not Matched. R: ${r}, G: ${g}, B: ${b}`);
        }
    }, 100);
});

updateCanvasSizeButton.addEventListener('click', updateCanvasSize);

function updateCanvasSize() {
    const width = parseInt(canvasWidthInput.value, 10);
    const height = parseInt(canvasHeightInput.value, 10);
    canvas.width = width;
    canvas.height = height;
}

// 사용자에게 알림 권한 요청
if ('Notification' in window && navigator.serviceWorker) {
    navigator.serviceWorker.register('service-worker.js');
    Notification.requestPermission(status => {
        console.log('Notification permission status:', status);
    });
}

// 사용자에게 알림 보내기
function notifyUser(message) {
    if (Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification('Color Detection Alert', {
                body: message,
                icon: 'icon.png'
            });
        });
    }
}