export async function downloadSvgAsJpg(svgElement: SVGSVGElement): Promise<void> {
    console.log(svgElement)
    if (!svgElement) {
        console.error('SVG element not found');
        return;
    }

    // Конвертируем SVG в строку
    const svgString = new XMLSerializer().serializeToString(svgElement);

    // Создаем объект Blob для изображения
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    // Загружаем изображение SVG с помощью Canvas
    const img = new Image();
    img.onload = function () {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Устанавливаем размеры canvas
        canvas.width = img.width;
        canvas.height = img.height;

        // Рисуем изображение на canvas
        ctx.drawImage(img, 0, 0);

        // Конвертируем canvas в JPEG
        const dataUrl = canvas.toDataURL('image/jpeg', 1.0);

        // Создаем ссылку для скачивания
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'image.jpg';
        link.click();
    };

    // Загружаем SVG как изображение
    img.src = url;
}