const URL = "https://teachablemachine.withgoogle.com/models/NC5tgQd0Q/";
const SIZE = 300; // 設定圖片大小

let model, webcam, labelContainer, maxPredictions, requestID;
let recognizedName = "0";

// 定義 img_url 和 animals_list 全域變數
const img_url = {
    "旺財": "dog.jpg",
    "天網灰灰": "graycat.png",
    "白冰冰": "whitedog.png",
    "凱旋門":"bird.png",
    "卡皮巴拉":"Capybara.jpg",
    "黃珠格格": "orangecat.png",
    "金秀賢": "goldfish.png",
    "五阿哥": "fivebird.jpg",
    "小花": "flowercat.png",
    "跳跳虎": "rabbit.png",
};

let animals = [
    "Dog 旺財 2024-07-06 reward:9000 旺情水 0910-000111",
    "Cat 天網灰灰 2024-05-06 reward:9000 天天想你 0910-111222",
    "capybara 卡皮巴拉 2024-02-06 reward:99999 庫拉皮卡 0910-118222",
    "bird 凱旋門 2024-08-25 reward:8500 聖女貞德 0910-557866",
    "Dog 白冰冰 2024-08-05 reward:8000 白雲 0910-222333",
    "Cat 黃珠格格 2024-03-12 reward:5000 黃阿瑪 0910-333444",
    "Fish 金秀賢 2024-04-22 reward:3000 金正恩 0910-444555",
    "bird 五阿哥 2024-08-20 reward:8500 皇額娘 0910-555666",
    "Cat 小花 2024-02-14 reward:7500 花媽 0910-666777",
    "Rabbit 跳跳虎 2024-01-30 reward:6000 小熊維尼 0910-777888",
];

// 解析 animals 陣列並生成 animals_list
let animals_list = animals.map(item => {
    let [type, name, date, reward, owner, phone] = item.split(' ');
    let rewardAmount = parseInt(reward.split(':')[1]);
    return {
        type: type.toLowerCase(), // 確保 type 是小寫字母
        name,
        date,
        reward: rewardAmount,
        img: img_url[name],
        owner,
        phone,
    };
});

document.addEventListener('DOMContentLoaded', () => {
    // 讀取並顯示已儲存的動物資料
    const storedAnimalsList = JSON.parse(localStorage.getItem('petList')) || [];
    storedAnimalsList.forEach(storedAnimal => {
        if (!animals_list.some(animal => animal.name === storedAnimal.name)) {
            animals_list.push(storedAnimal);
        }
    });

    // 綁定清除按鈕事件
    const clearRecognitionButton = document.getElementById('clearRecognition');
    if (clearRecognitionButton) {
        clearRecognitionButton.addEventListener('click', clearRecognitionData);
    }

    // 如果有 medals 元素，顯示動物資料
    const medalsElement = document.getElementById('medals');
    if (medalsElement) {
        show(animals_list);
    }
});



// 加載模型
async function loadModel() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = '';  // 清空先前的結果

    for (let i = 0; i < maxPredictions; i++) {
        const labelDiv = document.createElement("div");
        labelDiv.className = "label";
        const span = document.createElement("span");
        const progressBar = document.createElement("div");
        progressBar.className = "progress-bar";
        const progress = document.createElement("div");
        progress.className = "progress";
        progressBar.appendChild(progress);
        labelDiv.appendChild(span);
        labelDiv.appendChild(progressBar);
        labelContainer.appendChild(labelDiv);
    }
}

// 初始化攝像頭
async function initWebcam() {
    await loadModel();

    const flip = true;
    webcam = new tmImage.Webcam(SIZE, SIZE, flip);
    await webcam.setup();
    await webcam.play();
    requestID = window.requestAnimationFrame(loop);

    document.getElementById("webcam-container").innerHTML = '';
    document.getElementById("webcam-container").appendChild(webcam.canvas);
}

// 初始化圖片
async function initImage(input) {
    await loadModel();

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = async function(event) {
        const img = new Image();
        img.src = event.target.result;
        img.onload = async function() {
            // 創建Canvas並裁剪圖片為正方形
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = SIZE;
            canvas.height = SIZE;

            // 計算圖片縮放比例並置中裁剪
            const scale = Math.min(SIZE / img.width, SIZE / img.height);
            const x = (SIZE / 2) - (img.width / 2) * scale;
            const y = (SIZE / 2) - (img.height / 2) * scale;
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

            // 將裁剪後的圖片顯示在網頁上
            document.getElementById("webcam-container").innerHTML = '';
            document.getElementById("webcam-container").appendChild(canvas);
            await predictImage(canvas);
        }
    }
    reader.readAsDataURL(file);
}

// 循環進行影像辨識
async function loop() {
    webcam.update();
    await predictWebcam();
    requestID = window.requestAnimationFrame(loop);
}

// 辨識攝像頭影像
async function predictWebcam() {
    const prediction = await model.predict(webcam.canvas);
    updateLabels(prediction);
}

// 辨識靜態圖片
async function predictImage(image) {
    const prediction = await model.predict(image);
    updateLabels(prediction);
}

// 更新標籤和進度條
function updateLabels(prediction) {
    let recognizedName = null;
    let highestProbability = 0;

    for (let i = 0; i < maxPredictions; i++) {
        const label = prediction[i].className;
        const probability = Math.round(prediction[i].probability * 100);

        const labelDiv = labelContainer.childNodes[i];
        labelDiv.querySelector("span").textContent = label;
        const progress = labelDiv.querySelector(".progress");
        progress.style.width = probability + "%";
        progress.textContent = probability + "%";

        if (probability >=80) {
            progress.style.backgroundColor = "#64c070";
        } else if (probability > 50) {
            progress.style.backgroundColor = "#f6b26b";
        } else {
            progress.style.backgroundColor = "#e51559";
        }

        // 記錄最高機率的結果
        if (probability > highestProbability) {
            highestProbability = probability;
            recognizedName = label;
        }
    }
    if (highestProbability < 80) {
        recognizedName = "notFind";
    }


    // 更新辨識結果
    if (recognizedName) {
        compareRecognitionResult(recognizedName);
    }
}

// 比較辨識結果並顯示匹配的寵物資料
function compareRecognitionResult(recognizedName) {
    let matchedPet = animals_list.find(pet => pet.name === recognizedName);

    if (matchedPet) {
        // 渲染匹配的寵物資訊
        document.getElementById('recognitionResult').innerHTML = `
            <div class="result-container">
            <img src="img/${matchedPet.img}" alt="${matchedPet.name}" style="width:100%; height:auto;">
            </div>
            <h5>辨識結果：</h5>
            <p style="font-weight: bold">Name：${matchedPet.name}</p>
            <p>Type：${matchedPet.type}</p>
            <p>LostDate：${matchedPet.date}</p>
            <p>Reward：${matchedPet.reward}</p>
            <p style="font-weight: bold ;color: #504fd2">Owner：${matchedPet.owner}</p>
            <p style="font-weight: bold;color: #504fd2">Contact：${matchedPet.phone}</p>
        `;
    } else {
        document.getElementById('recognitionResult').innerHTML = `<div class="result-container">尚未找到匹配的寵物🐶😿</div>`;
    }
}

// 停止影像辨識
function stop() {
    if (requestID) {
        window.cancelAnimationFrame(requestID);
    }
    if (webcam) {
        webcam.stop();
    }
}

// 表單提交事件處理器
document.getElementById('petForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const petData = {
        name: document.getElementById('memberName').value,
        phone: document.getElementById('memberPhone').value,
        type: document.querySelector('input[name="breed"]:checked').value,
        date: document.querySelector('input[type="date"]').value,
        reward: parseInt(document.querySelector('input[type="text"]').value),
        img: img_url[document.getElementById('memberName').value] || "default.png"
    };

    animals_list.push(petData);
    saveToLocalStorage(petData);
    show(animals_list);

    alert('寵物資料已成功送出！');
    window.location.href = 'index.html';
});

// 保存資料到 localStorage
function saveToLocalStorage(petData) {
    let petList = JSON.parse(localStorage.getItem('petList')) || [];
    petList.push(petData);
    localStorage.setItem('petList', JSON.stringify(petList));
}

// 渲染寵物資料的函數
function show(filteredAnimals) {
    let content = filteredAnimals.map(animal => `
        <div class="col-sm-6 col-md-4 col-lg-3 card">
            <div class="card-body d-flex flex-column text-center">
                <h5 class="card-title">${animal.name}</h5>
                <img class="card-img" src="/img/${animal.img}" alt="Card image">
                <div class="card-text">Type: ${animal.type}</div>
                <div class="card-text">Date: ${animal.date}</div>
                <div class="card-text">Reward: ${animal.reward}</div>
                <div class="card-text">Owner: ${animal.owner}</div>
                <div class="card-text">Contact: ${animal.phone}</div>
            </div>
        </div>`).join('');

    document.getElementById("medals").innerHTML = `<div class="row">${content}</div>`;
}

// 排序功能
function typeSort(value) {
    let filteredAnimals = animals_list;

    if (value !== "name") {
        filteredAnimals = animals_list.filter(animal => {
            if (value === "other") {
                return animal.type !== "dog" && animal.type !== "cat";
            }
            return animal.type === value;
        });
    }

    show(filteredAnimals);
}

function rewardSort(order) {
    let sortedAnimals = [...animals_list].sort((a, b) =>
        order === 'total' ? b.reward - a.reward : a.reward - b.reward
    );

    show(sortedAnimals);
}

function dateSort(order) {
    let sortedAnimals = [...animals_list].sort((a, b) =>
        order === 'gold' ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date)
    );

    show(sortedAnimals);
}
document.getElementById('clearRecognition').addEventListener('click', clearRecognitionData);

function clearRecognitionData() {
    // 清空標籤容器內的標籤及其進度條
    labelContainer.childNodes.forEach(labelDiv => {
        labelDiv.querySelector("span").textContent = '';
        const progress = labelDiv.querySelector(".progress");
        progress.style.width = "0%";
        progress.textContent = "0%";
        progress.style.backgroundColor = "#76c7c0"; // 恢復預設顏色
    });

    // 清空辨識結果顯示區域
    document.getElementById('recognitionResult').innerHTML = '';
}


// 清除localstorage, 沒事不要開
function allgone() {
    localStorage.clear();
    location.reload(); // 刷新页面
}



// Scroll to top function
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}