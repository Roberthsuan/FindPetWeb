let img_url = {
    "旺財": "DoDo.jpg",
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

// 從 localStorage 中取出資料
const petInfoArray = JSON.parse(localStorage.getItem("petInfoArray")) || [];

// 將 localStorage 中的資料加入 animals_list
petInfoArray.forEach(petInfo => {
    animals_list.push({
        type: petInfo.breed.toLowerCase(), // 使用 breed 作為 type
        name: petInfo.name,
        date: petInfo.lostdate,
        reward: parseInt(petInfo.reward), // 確保 reward 是數字
        img: petInfo.photo, // 使用 photo 作為圖片
        owner: petInfo.owner,
        phone: petInfo.phone,
    });
});

console.log("Initial animals_list:");
console.log(animals_list); // 測試輸出合併後的 animals_list



// (2) 依據寵物種類的名稱來排序
let sortedByType = [...animals_list].sort((a, b) => a.type.localeCompare(b.type));
console.log("Sorted by type:");
console.log(sortedByType);


// (3) 依據reward的金額來排序
let sortedByReward = [...animals_list].sort((a, b) => b.reward - a.reward);
console.log("Sorted by reward:");
console.log(sortedByReward);

// (4) 依據時間的大小來排序
let sortedByDate = [...animals_list].sort((a, b) => new Date(a.date) - new Date(b.date));
console.log("Sorted by date:");
console.log(sortedByDate);


// 打開網頁時, 即顯示所有資料
document.addEventListener('DOMContentLoaded', () => {
    // 初始化顯示所有資料
    show(animals_list);
});


//由JS渲染畫面到html
function show(filteredAnimals) {
    let row = "<div class=\"row\">";
    let str = "";

    for (let i = 0; i < filteredAnimals.length && i < 12; i++) {
        const animal = filteredAnimals[i].name;
        const img = filteredAnimals[i].img;
        const type = filteredAnimals[i].type;
        const date = filteredAnimals[i].date;
        const reward = filteredAnimals[i].reward;
        const owner = filteredAnimals[i].owner;
        const phone = filteredAnimals[i].phone;

        const card = `<div class="col-sm-6 col-md-4 col-lg-3 card">`;
        const cardBodyDiv = `<div class="card-body d-flex flex-column text-center">`;
        const cardTitle = `<h5 class="card-title" style="font-weight: bold;">${animal}</h5>`;

        // 判斷是否為 Base64 編碼圖片
        let imgTag;
        if (img.startsWith('data:image/')) {
            imgTag = `<img class="card-img" src="${img}" alt="Card image">`;  // Base64 編碼圖片
        } else {
            imgTag = `<img class="card-img" src="./img/${img}" alt="Card image">`;  // 本地端圖片
        }

        const typeDiv = `<div class="card-text">Type: ${type}</div>`;
        const dateDiv = `<div class="card-text">LostDate: ${date}</div>`;
        const rewardDiv = `<div class="card-text">Reward: ${reward}</div>`;
        const ownerDiv = `<div class="card-text">Owner: ${owner}</div>`;
        const phoneDiv = `<div class="card-text">Contact: ${phone}</div>`;

        str += card + cardBodyDiv + cardTitle + imgTag + typeDiv + dateDiv + rewardDiv + ownerDiv + phoneDiv + '</div>' + '</div>';
    }

    document.getElementById("medals").innerHTML = row + str + '</div>';
}



let selectedType = "name"; // 初始選擇為顯示所有品種

function typeSort(value) {
    selectedType = value; // 更新全局變數

    let filteredAnimals = animals_list;

    if (value !== "name") { // "name" 代表顯示所有品種
        filteredAnimals = animals_list.filter(animal => {
            if (value === "other") {
                // 顯示類型為非 "dog" 和 "cat" 的動物
                return animal.type !== "dog" && animal.type !== "cat";
            }
            return animal.type === value;
        });
    }

    // 顯示過濾後的資料
    show(filteredAnimals);
}



function rewardSort(order) {
    let filteredAnimals = animals_list.filter(animal => {
        return selectedType === "name" ||
            (selectedType === "other" && (animal.type !== "dog" && animal.type !== "cat")) ||
            animal.type === selectedType;
    });

    // 依照獎勳金額對過濾後的動物列表進行排序
    filteredAnimals.sort((a, b) => {
        return order === 'total' ? b.reward - a.reward : a.reward - b.reward;
    });

    // 更新要顯示的資料
    show(filteredAnimals);
}


function dateSort(order) {
    let filteredAnimals = animals_list.filter(animal => {
        return selectedType === "name" ||
            (selectedType === "other" && (animal.type !== "dog" && animal.type !== "cat")) ||
            animal.type === selectedType;
    });

    // 依照日期對過濾後的動物列表進行排序
    filteredAnimals.sort((a, b) => {
        let dateA = new Date(a.date);
        let dateB = new Date(b.date);
        return order === 'gold' ? dateB - dateA : dateA - dateB;
    });

    // 更新要顯示的資料
    show(filteredAnimals);
}


window.onscroll = function () {
    const backToTopButton = document.getElementById("backToTop");
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        backToTopButton.style.display = "block";
    } else {
        backToTopButton.style.display = "none";
    }
};

// Scroll to top function
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}