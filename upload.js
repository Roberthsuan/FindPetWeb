document.addEventListener('DOMContentLoaded', function () {
    // 獲取表單元素
    const form = document.querySelector('form');
    const submitButton = document.getElementById('submitPetButton');
    const petImageInput = document.getElementById('petImageInput');
    const preview = document.getElementById('preview');

    // 從 localStorage 中獲取會員資料並自動填入
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
        document.getElementById("memberName").value = storedUser.name;
        document.getElementById("memberPhone").value = storedUser.phone;
    }


    // 處理圖片預覽
    if (petImageInput) {
        petImageInput.addEventListener('change', function (event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    preview.innerHTML = `<img src="${e.target.result}" alt="Pet Image Preview">`;
                    adjustImageSize(); // 在圖片渲染後調整尺寸
                }
                reader.readAsDataURL(file);
            }
        });
    }

    function adjustImageSize() {
        const img = preview.querySelector('img');
        if (img) {
            if (window.innerWidth < 768) {
                img.style.width = '400px';
                img.style.height = '400px';
            } else {
                img.style.width = '500px';
                img.style.height = '500px';
            }
        }
    }

    // 在頁面加載時和窗口大小改變時也要調整圖片尺寸
    window.addEventListener('resize', adjustImageSize);




    // 處理表單提交
    if (submitButton) {
        submitButton.addEventListener('click', function (event) {
            event.preventDefault();
            console.log('提交按鈕被點擊');
            submitPetInfo();
        });
    }

    // 處理其他品種輸入框的顯示/隱藏
    const breedRadios = document.querySelectorAll('input[name="breed"]');
    const otherBreedInput = document.getElementById('otherbreed');

    breedRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            if (this.id === 'pname3') {
                otherBreedInput.style.display = 'inline-block';
            } else {
                otherBreedInput.style.display = 'none';
            }
        });
    });
});

function submitPetInfo() {
    console.log('submitPetInfo 函數被調用');

    const petName = document.getElementById("petname").value.trim();
    const petBreed = document.querySelector('input[name="breed"]:checked');
    const otherBreed = document.getElementById("otherbreed").value.trim();
    const memberName = document.getElementById("memberName").value.trim();
    const memberPhone = document.getElementById("memberPhone").value.trim();
    const lostDate = document.getElementById("lostdate").value;
    const reward = document.getElementById("reward").value.trim();
    const petPhotoInput = document.getElementById("petImageInput");

    let errorMessages = [];

    if (!petName) errorMessages.push("請填寫寵物名字");
    if (!petBreed) errorMessages.push("請選擇寵物品種");
    if (!memberPhone) errorMessages.push("請填寫有效的電話號碼（至少8位數字）");
    if (petBreed && petBreed.id === 'pname3' && !otherBreed) errorMessages.push("請填寫其他品種");
    if (!memberName) errorMessages.push("請填寫會員姓名");
    if (!memberPhone) errorMessages.push("請填寫會員電話");
    if (!lostDate) errorMessages.push("請填寫走失日期");


    // 日期格式驗證
    const currentDate = new Date();
    const inputDate = new Date(lostDate);
    if (lostDate && (isNaN(inputDate.getTime()) || inputDate > currentDate)) {
        errorMessages.push("請填寫有效的走失日期（不能晚於今天）");
    }

    if (errorMessages.length > 0) {
        alert(errorMessages.join("\n"));
        return;
    }

    const petPhoto = petPhotoInput.files[0];
    const breedValue = petBreed.id === 'pname3' ? otherBreed : petBreed.value;

    if (petPhoto) {
        const reader = new FileReader();
        reader.onloadend = function () {
            savePetData(petName, breedValue, memberName, memberPhone, lostDate, reward, reader.result);
        };
        reader.onerror = function () {
            console.error('讀取圖片時發生錯誤');
            alert('讀取圖片時發生錯誤，請重新選擇圖片');
        };
        reader.readAsDataURL(petPhoto);
    } else {
        savePetData(petName, breedValue, memberName, memberPhone, lostDate, reward, null);
    }
}


function savePetData(name, breed, owner, phone, lostdate, reward, photo) {
    const petData = { name, breed, owner, phone, lostdate, reward, photo };
    console.log('準備保存的資料:', petData);

    try {
        // 檢查 localStorage 中是否已經有保存的陣列
        let petArray = JSON.parse(localStorage.getItem("petInfoArray")) || [];

        // 將新的資料加入陣列
        petArray.push(petData);

        // 將更新後的陣列保存回 localStorage
        localStorage.setItem("petInfoArray", JSON.stringify(petArray));

        console.log('資料已成功保存到 localStorage');
        alert('寵物資訊已成功提交！');
        window.location.href = "index.html"; // 同一目錄;

    } catch (error) {
        console.error('保存資料時發生錯誤:', error);
        alert('提交資料時發生錯誤，請稍後再試。');
    }
}

