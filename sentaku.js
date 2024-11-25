// BGM再生関数
function playBGM(bgmId) {
    const bgm = document.getElementById(bgmId);
    if (bgm) {
        bgm.currentTime = 0;
        bgm.play();
    }
}

// 勇者の能力値
const heroAbilities = {
    計算: 50,
    方程式: 50,
    関数: 55,
    図形: 60,
    論理: 50,
    統計: 50
};

// レーダーチャートの作成
function createRadarChart() {
    const ctx = document.getElementById('radarChart').getContext('2d');
    const data = {
        labels: ['計算', '方程式', '関数', '図形', '論理', '統計'],
        datasets: [{
            label: '勇者の能力値',
            data: [
                heroAbilities.計算,
                heroAbilities.方程式,
                heroAbilities.関数,
                heroAbilities.図形,
                heroAbilities.論理,
                heroAbilities.統計
            ],
            backgroundColor: 'rgba(0, 123, 255, 0.5)',
            borderColor: 'rgba(0, 123, 255, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(0, 123, 255, 1)'
        }]
    };

    const options = {
        scales: {
            r: {
                min: 40,
                max: 100,
                ticks: {
                    stepSize: 10,
                    color: '#333',
                    font: { size: 12 }
                },
                grid: { color: 'rgba(0, 0, 0, 0.2)' },
                angleLines: { color: 'rgba(0, 0, 0, 0.3)' },
                pointLabels: { font: { size: 14 }, color: '#000' }
            }
        }
    };

    new Chart(ctx, {
        type: 'radar',
        data: data,
        options: options
    });
}

// ページ読み込み後の処理
window.onload = function() {
    // ローカルストレージからデータを取得
    let totalExperiencePoints = parseInt(localStorage.getItem("totalExperiencePoints")) || 0;
    let heroLevel = parseInt(localStorage.getItem("heroLevel")) || 1;
    let heroHP = parseInt(localStorage.getItem("heroHP")) || 100;

    // レベルアップのロジック
    let accumulatedExperience = totalExperiencePoints; // 累積経験値
    let experienceNeededForNextLevel = 90 + 10 * heroLevel; // 次のレベルに必要な経験値

    // レベルアップ処理
    while (accumulatedExperience >= experienceNeededForNextLevel) {
        accumulatedExperience -= experienceNeededForNextLevel;
        heroLevel++;
        heroHP += 5; // レベルごとにライフ+5
        experienceNeededForNextLevel = 90 + 10 * heroLevel; // 次のレベルに必要な経験値を更新
    }

    // 次のレベルに必要な残り経験値を計算
    const experienceRemaining = experienceNeededForNextLevel - accumulatedExperience;

    // ローカルストレージに最新のデータを保存
    localStorage.setItem("totalExperiencePoints", accumulatedExperience);
    localStorage.setItem("heroLevel", heroLevel);
    localStorage.setItem("heroHP", heroHP);

    // HTMLの表示を更新
    document.getElementById("heroLevel").textContent = heroLevel;
    document.getElementById("heroHP").textContent = heroHP;
    document.getElementById("experienceRemaining").textContent = experienceRemaining;

    // BGM再生（ユーザー操作が必要な場合があります）
    document.body.addEventListener('click', function playOnInteraction() {
        playBGM("indexBGM");
        document.body.removeEventListener('click', playOnInteraction);
    });

    // レーダーチャートの作成
    createRadarChart();
};

// ボタンイベントリスナー
document.getElementById('beginner').addEventListener('click', function() {
    localStorage.setItem('selectedLevel', 'beginner');
    window.location.href = 'doragon.html'; // doragon.htmlに遷移
});

document.getElementById('intermediate').addEventListener('click', function() {
    localStorage.setItem('selectedLevel', 'intermediate');
    window.location.href = 'doragon2.html'; // doragon2.htmlに遷移
});

document.getElementById('advanced').addEventListener('click', function() {
    localStorage.setItem('selectedLevel', 'advanced');
    window.location.href = 'doragon3.html'; // doragon3.htmlに遷移
});
