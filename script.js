document.getElementById("themeToggle").onclick = () => {
    document.body.classList.toggle("dark");

    // Меняем иконку
    const btn = document.getElementById("themeToggle");
    btn.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
};

// Основная логика загрузки
document.getElementById("downloadBtn").onclick = async () => {
    const url = document.getElementById("pageUrl").value.trim();
    const minW = parseInt(document.getElementById("minW").value) || 100;
    const minH = parseInt(document.getElementById("minH").value) || 100;
    const noPng = document.getElementById("filterPng").checked;

    if (!url) {
        alert("Введите URL!");
        return;
    }

    document.getElementById("status").textContent = "Загрузка...";

    try {
        const html = await (await fetch(url)).text();

        const temp = document.createElement("div");
        temp.innerHTML = html;

        const imgs = [...temp.querySelectorAll("img")].map(img => img.src);

        let downloaded = 0;

        for (const imgUrl of imgs) {
            const finalUrl = imgUrl.startsWith("http")
                ? imgUrl
                : new URL(imgUrl, url).href;

            const blob = await (await fetch(finalUrl)).blob();

            // Проверка PNG прозрачности
            if (noPng && blob.type === "image/png") {
                const bmp = await createImageBitmap(blob);
                const canvas = document.createElement("canvas");
                canvas.width = bmp.width;
                canvas.height = bmp.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(bmp, 0, 0);

                const pixels = ctx.getImageData(0, 0, bmp.width, bmp.height).data;
                let transparent = false;
                for (let i = 3; i < pixels.length; i += 4) {
                    if (pixels[i] < 255) {
                        transparent = true;
                        break;
                    }
                }
                if (transparent) continue;
            }

            // Проверка размера
            const imgBitmap = await createImageBitmap(blob);
            if (imgBitmap.width < minW || imgBitmap.height < minH) continue;

            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = finalUrl.split("/").pop();
            a.click();
            downloaded++;
        }

        document.getElementById("status").textContent =
            `Готово! Скачано: ${downloaded}`;
    } catch (e) {
        document.getElementById("status").textContent = "Ошибка: " + e;
    }
};
