/* =========================
Re’SURF SCRIPT
========================= */

/* =========================
GLOBAL STATE
========================= */

window.currentWaveHeight = null;
window.currentWavePeriod = null;
window.currentWindSpeed = null;
window.currentWindCondition = null;

/* =========================
BOARD DISPLAY
========================= */

function renderBoards() {

const list =
document.getElementById(“boardList”);

if (!list) return;

list.innerHTML = “”;

boards.forEach(board => {

const card =
  document.createElement("button");
card.className = "board-card";
card.innerHTML = `
  <div class="board-name">
    ${board.name}
  </div>
`;
card.onclick = () => {
  openBoardModal(board.id);
};
list.appendChild(card);

});

}

/* =========================
BOARD ADVICE
========================= */

function getBoardAdvice(
boardId,
height,
period,
windSpeed,
windCondition
) {

const waveText =
Number.isFinite(height)
? ${height.toFixed(2)}m
: “–”;

const periodText =
Number.isFinite(period)
? ${period.toFixed(1)}秒
: “–”;

const base =
現在の波は約${waveText}・周期${periodText}。;

const windText =
windCondition
? 風は${windCondition}。
: “”;

const advice = {

long:
  `${base}${windText} テイクオフの早さと安定感を活かして、まずは波のいいピークを選ぶ。小波なら無理にアクションを狙わず、早めに立ってスピードを維持するのがポイント。`,
mid:
  `${base}${windText} 波をよく見て少し前からテイクオフし、板のスピードを落とさずラインを長く使う。厚いセクションでは焦ってターンを入れず、板を走らせることを優先。`,
fish:
  `${base}${windText} フィッシュのスピードを活かして、テイクオフ後は早めに横へ。厚い波ではレールを入れすぎず、板を走らせながら波のポケットへ戻るイメージ。`,
allround:
  `${base}${windText} 波のフェイスに合わせてテイクオフ位置を調整。まずはスピードを作ってから、波の力があるセクションでターンを入れる。`,
performance:
  `${base}${windText} 波にパワーがあるなら、テイクオフ後すぐにラインを決めてポケットへ。小さめなら無理に縦へ行かず、スピードを失わないライン取りを優先。`

};

return advice[boardId] || “”;
}

/* =========================
BOARD MODAL
========================= */

function openBoardModal(boardId) {

const board =
boards.find(
item => item.id === boardId
);

if (!board) return;

const height =
window.currentWaveHeight;

const period =
window.currentWavePeriod;

const windSpeed =
window.currentWindSpeed;

const windCondition =
window.currentWindCondition;

document.getElementById(
“modalBoardName”
).textContent =
board.name;

document.getElementById(
“modalCondition”
).textContent =
現在の波 ${Number.isFinite(height) ? height.toFixed(2) + " m" : "--"}
+
 / 周期 ${Number.isFinite(period) ? period.toFixed(1) + " 秒" : "--"}
+
 / 風 ${Number.isFinite(windSpeed) ? windSpeed.toFixed(1) + " m/s" : "--"}
+
 / ${windCondition || "--"};

document.getElementById(
“modalAdvice”
).textContent =
getBoardAdvice(
board.id,
height,
period,
windSpeed,
windCondition
);

document.getElementById(
“boardModal”
).classList.add(“show”);

}

function closeBoardModal(event) {

if (
event &&
event.target !==
document.getElementById(“boardModal”)
) {
return;
}

document.getElementById(
“boardModal”
).classList.remove(“show”);

}

/* =========================
BOARD RECOMMENDATION
========================= */

function getRecommendedBoard(
height,
period
) {

if (height < 0.35) return “long”;

if (height < 0.50) return “mid”;

if (height < 0.75) return “fish”;

if (height < 1.20) {

if (period >= 9) {
  return "allround";
}
return "fish";

}

if (height < 1.70) return “allround”;

return “performance”;

}

/* =========================
DIRECTION
========================= */

function getDirection(degrees) {

if (!Number.isFinite(degrees)) {
return “–”;
}

const directions = [
“北”,
“北北東”,
“北東”,
“東北東”,
“東”,
“東南東”,
“南東”,
“南南東”,
“南”,
“南南西”,
“南西”,
“西南西”,
“西”,
“西北西”,
“北西”,
“北北西”
];

return directions[
Math.round(degrees / 22.5) % 16
];

}

/* =========================
WIND CONDITION
========================= */

function angleDifference(a, b) {

let diff =
Math.abs(a - b) % 360;

if (diff > 180) {
diff = 360 - diff;
}

return diff;

}

function getWindCondition(
windDirection,
spot
) {

if (!Number.isFinite(windDirection)) {
return {
label: “–”,
className: “”
};
}

const diff =
angleDifference(
windDirection,
spot.offshoreFrom
);

const offshoreRange =
spot.offshoreRange || 30;

if (
diff <= offshoreRange
) {

return {
  label: "オフショア",
  className: "wind-offshore"
};

}

if (
diff <= 75
) {

return {
  label: "サイドオフ",
  className: "wind-sideoff"
};

}

if (
diff <= 120
) {

return {
  label: "サイドオン",
  className: "wind-sideon"
};

}

return {
label: “オンショア”,
className: “wind-onshore”
};

}

/* =========================
HUMAN WAVE
========================= */

function humanWave(height) {

if (height < .25) {
return [
“スネ〜ヒザ”,
“かなり小さめの波”
];
}

if (height < .45) {
return [
“ヒザ〜モモ”,
“小波コンディション”
];
}

if (height < .70) {
return [
“モモ〜腰”,
“小〜中サイズ”
];
}

if (height < 1.00) {
return [
“腰〜腹”,
“十分なサイズ”
];
}

if (height < 1.30) {
return [
“腹〜胸”,
“しっかりしたサイズ”
];
}

if (height < 1.70) {
return [
“胸〜肩”,
“サイズのある波”
];
}

if (height < 2.20) {
return [
“頭前後”,
“かなりサイズあり”
];
}

return [
“頭オーバー”,
“大きなコンディション”
];

}

/* =========================
WEATHER ICON
========================= */

function weatherIcon(code) {

if (!Number.isFinite(code)) {
return “🌤️”;
}

if (code === 0) return “☀️”;

if (
code === 1 ||
code === 2
) {
return “🌤️”;
}

if (code === 3) {
return “☁️”;
}

if (
code === 45 ||
code === 48
) {
return “🌫️”;
}

if (
code >= 51 &&
code <= 57
) {
return “🌦️”;
}

if (
code >= 61 &&
code <= 67
) {
return “🌧️”;
}

if (
code >= 71 &&
code <= 77
) {
return “❄️”;
}

if (
code >= 80 &&
code <= 82
) {
return “🌧️”;
}

if (code >= 95) {
return “⛈️”;
}

return “🌤️”;

}

/* =========================
TIME FORMAT
========================= */

function formatTime(time) {

if (!time) return “–”;

const date =
new Date(time);

if (
Number.isNaN(
date.getTime()
)
) {
return “–”;
}

return date.toLocaleTimeString(
“ja-JP”,
{
hour: “2-digit”,
minute: “2-digit”,
hour12: false,
timeZone: “Asia/Tokyo”
}
);

}

/* =========================
DATE KEY
========================= */

function todayKey() {

return new Date()
.toLocaleDateString(
“en-CA”,
{
timeZone: “Asia/Tokyo”
}
);

}

/* =========================
HOURLY WEATHER DISPLAY
========================= */

function renderHourlyWeather(
times,
codes,
temperatures,
rainProbabilities
) {

const container =
document.getElementById(
“weatherHourly”
);

container.innerHTML = “”;

if (!Array.isArray(times)) {
return;
}

const today =
todayKey();

const now =
Date.now();

for (
let i = 0;
i < times.length;
i++
) {

const date =
  new Date(times[i]);
if (
  Number.isNaN(
    date.getTime()
  )
) {
  continue;
}
const localDate =
  date.toLocaleDateString(
    "en-CA",
    {
      timeZone: "Asia/Tokyo"
    }
  );
if (
  localDate !== today
) {
  continue;
}
if (
  date.getTime() <
  now - 60 * 60 * 1000
) {
  continue;
}
const card =
  document.createElement("div");
card.className =
  "hour-card" +
  (
    Math.abs(
      date.getTime() - now
    ) < 60 * 60 * 1000
      ? " current"
      : ""
  );
const temp =
  temperatures &&
  Number.isFinite(
    temperatures[i]
  )
    ? Math.round(
        temperatures[i]
      ) + "°"
    : "--";
const rain =
  rainProbabilities &&
  Number.isFinite(
    rainProbabilities[i]
  )
    ? rainProbabilities[i] + "%"
    : "--";
card.innerHTML = `
  <div class="hour-time">
    ${formatTime(times[i])}
  </div>
  <div class="hour-icon">
    ${weatherIcon(codes[i])}
  </div>
  <div class="hour-temp">
    ${temp}
  </div>
  <div class="hour-rain">
    ☔ ${rain}
  </div>
  ${
    Math.abs(
      date.getTime() - now
    ) < 60 * 60 * 1000
      ? `<div class="hour-label">現在</div>`
      : ""
  }
`;
container.appendChild(card);

}

}

/* =========================
HOURLY WIND DISPLAY
========================= */

function renderHourlyWind(
times,
speeds,
directions,
spot
) {

const container =
document.getElementById(
“windHourly”
);

container.innerHTML = “”;

if (!Array.isArray(times)) {
return;
}

const now =
Date.now();

for (
let i = 0;
i < times.length;
i++
) {

const date =
  new Date(times[i]);
if (
  Number.isNaN(
    date.getTime()
  )
) {
  continue;
}
if (
  date.getTime() <
  now - 15 * 60 * 1000
) {
  continue;
}
const speed =
  Number.isFinite(
    speeds[i]
  )
    ? speeds[i]
    : null;
const direction =
  Number.isFinite(
    directions[i]
  )
    ? directions[i]
    : null;
const result =
  getWindCondition(
    direction,
    spot
  );
const card =
  document.createElement("div");
card.className =
  "wind-hour-card" +
  (
    Math.abs(
      date.getTime() - now
    ) < 60 * 60 * 1000
      ? " current"
      : ""
  );
const arrow =
  direction !== null
    ? getWindArrow(direction)
    : "•";
card.innerHTML = `
  <div class="wind-hour-time">
    ${formatTime(times[i])}
  </div>
  <div class="wind-hour-arrow">
    ${arrow}
  </div>
  <div class="wind-hour-dir">
    ${direction !== null
      ? getDirection(direction)
      : "--"}
  </div>
  <div class="wind-hour-speed">
    ${speed !== null
      ? speed.toFixed(1) + " m/s"
      : "--"}
  </div>
  <div
    class="wind-hour-condition ${result.className}"
  >
    ${result.label}
  </div>
`;
container.appendChild(card);

}

}

/* =========================
WIND ARROW
========================= */

function getWindArrow(
degrees
) {

if (!Number.isFinite(degrees)) {
return “•”;
}

const arrows = [
“↓”,
“↙”,
“←”,
“↖”,
“↑”,
“↗”,
“→”,
“↘”
];

return arrows[
Math.round(
degrees / 45
) % 8
];

}

/* =========================
BEST TIME
========================= */

function getBestTime(
height,
period,
windSpeed
) {

if (
Number.isFinite(windSpeed) &&
windSpeed <= 5 &&
Number.isFinite(height) &&
height >= .6
) {

return [
  "07:00〜10:00",
  "波と風のバランスが良い時間帯として判定。"
];

}

if (
Number.isFinite(height) &&
height >= 1.0
) {

return [
  "06:00〜09:00",
  "サイズがあるため、風が弱い時間帯を優先。"
];

}

return [
“07:00〜10:00”,
“現在はプロトタイプの時間帯判定です。”
];

}

/* =========================
TIDE EXTREMES
========================= */

function findTideExtremes(
times,
levels
) {

const result = [];

if (
!times ||
!levels ||
times.length < 3
) {
return result;
}

for (
let i = 1;
i < levels.length - 1;
i++
) {

const current =
  levels[i];
const previous =
  levels[i - 1];
const next =
  levels[i + 1];
if (
  !Number.isFinite(current) ||
  !Number.isFinite(previous) ||
  !Number.isFinite(next)
) {
  continue;
}
if (
  current > previous &&
  current >= next
) {
  result.push({
    type: "high",
    index: i,
    time: times[i],
    level: current
  });
}
if (
  current < previous &&
  current <= next
) {
  result.push({
    type: "low",
    index: i,
    time: times[i],
    level: current
  });
}

}

return result;

}

/* =========================
INTERPOLATED CURRENT TIDE
========================= */

function interpolateTide(
times,
levels
) {

const now =
Date.now();

for (
let i = 0;
i < times.length - 1;
i++
) {

const t1 =
  new Date(times[i]).getTime();
const t2 =
  new Date(times[i + 1]).getTime();
if (
  now >= t1 &&
  now <= t2
) {
  const l1 =
    levels[i];
  const l2 =
    levels[i + 1];
  if (
    Number.isFinite(l1) &&
    Number.isFinite(l2)
  ) {
    const ratio =
      (now - t1) /
      (t2 - t1);
    return (
      l1 +
      (l2 - l1) *
      ratio
    );
  }
}

}

return null;

}

/* =========================
TIDE GRAPH
========================= */

function drawTideGraph(
allTimes,
allLevels
) {

if (
!Array.isArray(allTimes) ||
!Array.isArray(allLevels)
) {
return null;
}

const today =
todayKey();

const validPairs = [];

for (
let i = 0;
i <
Math.min(
allTimes.length,
allLevels.length
);
i++
) {

if (
  !allTimes[i] ||
  !Number.isFinite(
    allLevels[i]
  )
) {
  continue;
}
const date =
  new Date(allTimes[i]);
const localDate =
  date.toLocaleDateString(
    "en-CA",
    {
      timeZone: "Asia/Tokyo"
    }
  );
if (
  localDate === today
) {
  validPairs.push({
    time: allTimes[i],
    level: allLevels[i]
  });
}

}

if (
validPairs.length < 2
) {
return null;
}

const width = 400;
const height = 205;
const padding = 8;

const validLevels =
validPairs.map(
item => item.level
);

let min =
Math.min(
…validLevels
);

let max =
Math.max(
…validLevels
);

const margin =
Math.max(
(max - min) * .12,
.10
);

min -= margin;
max += margin;

const range =
max - min || 1;

const points = [];

validPairs.forEach(
(item, index) => {

  const x =
    padding +
    index /
    Math.max(
      validPairs.length - 1,
      1
    ) *
    (width - padding * 2);
  const y =
    height -
    padding -
    (
      (item.level - min) /
      range
    ) *
    (height - padding * 2);
  points.push(
    x.toFixed(1) +
    "," +
    y.toFixed(1)
  );
}

);

const pointString =
points.join(” “);

document
.getElementById(“tideLine”)
.setAttribute(
“points”,
pointString
);

document
.getElementById(“tideArea”)
.setAttribute(
“points”,
pointString +
 ${width},${height} 0,${height}
);

/* TIME AXIS */

const indexes = [
0,
Math.floor(
(validPairs.length - 1) * .25
),
Math.floor(
(validPairs.length - 1) * .5
),
Math.floor(
(validPairs.length - 1) * .75
),
validPairs.length - 1
];

indexes.forEach(
(index, i) => {

  const element =
    document.getElementById(
      "tideTime" + i
    );
  if (element) {
    element.textContent =
      formatTime(
        validPairs[index].time
      );
  }
}

);

/* SCALE */

const scaleValues = [
max,
max - range * .25,
max - range * .50,
max - range * .75,
min
];

[
“scaleTop”,
“scale75”,
“scale50”,
“scale25”,
“scaleBottom”
].forEach(
(id, index) => {

  document.getElementById(id)
    .textContent =
    Math.round(
      scaleValues[index] * 100
    ) + " cm";
}

);

/* CURRENT POSITION */

const now =
Date.now();

let currentIndex = 0;

let closestDiff =
Infinity;

validPairs.forEach(
(item, index) => {

  const diff =
    Math.abs(
      new Date(item.time).getTime()
      -
      now
    );
  if (
    diff < closestDiff
  ) {
    closestDiff = diff;
    currentIndex = index;
  }
}

);

const currentX =
padding +
currentIndex /
Math.max(
validPairs.length - 1,
1
) *
(width - padding * 2);

const interpolated =
interpolateTide(
validPairs.map(
item => item.time
),
validPairs.map(
item => item.level
)
);

const currentLevel =
Number.isFinite(
interpolated
)
? interpolated
: validPairs[currentIndex].level;

const currentY =
height -
padding -
(
(currentLevel - min) /
range
) *
(height - padding * 2);

const nowLine =
document.getElementById(
“tideNow”
);

nowLine.setAttribute(
“x1”,
currentX
);

nowLine.setAttribute(
“x2”,
currentX
);

const nowDot =
document.getElementById(
“tideNowDot”
);

nowDot.setAttribute(
“cx”,
currentX
);

nowDot.setAttribute(
“cy”,
currentY
);

document.getElementById(
“currentTide”
).textContent =
Math.round(
currentLevel * 100
);

/* HIGH / LOW POINTS */

const extremes =
findTideExtremes(
validPairs.map(
x => x.time
),
validPairs.map(
x => x.level
)
);

const pointGroup =
document.getElementById(
“tideExtremePoints”
);

pointGroup.innerHTML = “”;

extremes.forEach(
extreme => {

  const x =
    padding +
    extreme.index /
    Math.max(
      validPairs.length - 1,
      1
    ) *
    (width - padding * 2);
  const y =
    height -
    padding -
    (
      (extreme.level - min) /
      range
    ) *
    (height - padding * 2);
  const circle =
    document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
  circle.setAttribute(
    "cx",
    x
  );
  circle.setAttribute(
    "cy",
    y
  );
  circle.setAttribute(
    "r",
    4
  );
  circle.setAttribute(
    "class",
    extreme.type === "high"
      ? "tide-point-high"
      : "tide-point-low"
  );
  const text =
    document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
  text.setAttribute(
    "x",
    x
  );
  text.setAttribute(
    "y",
    extreme.type === "high"
      ? y - 8
      : y + 16
  );
  text.setAttribute(
    "text-anchor",
    "middle"
  );
  text.setAttribute(
    "class",
    "tide-point-label"
  );
  text.textContent =
    Math.round(
      extreme.level * 100
    ) + "cm";
  pointGroup.appendChild(
    circle
  );
  pointGroup.appendChild(
    text
  );
}

);

return extremes;

}

/* =========================
TIDE TYPE
========================= */

function getTideType(
levels
) {

if (
!levels ||
!levels.length
) {
return “潮回り判定不可”;
}

const valid =
levels.filter(
v =>
Number.isFinite(v)
);

if (!valid.length) {
return “潮回り判定不可”;
}

const range =
Math.max(…valid)
-
Math.min(…valid);

if (range >= 1.5) {
return “大潮”;
}

if (range >= 1.0) {
return “中潮”;
}

if (range >= .6) {
return “小潮”;
}

return “長潮・若潮”;

}

/* =========================
NEXT HIGH / LOW
========================= */

function setNextTide(
allExtremes
) {

const now =
Date.now();

const future =
allExtremes.filter(
item =>
new Date(item.time)
.getTime() > now
);

const nextHigh =
future.find(
item =>
item.type === “high”
);

const nextLow =
future.find(
item =>
item.type === “low”
);

if (nextHigh) {

document.getElementById(
  "nextHigh"
).textContent =
  formatTime(
    nextHigh.time
  );
document.getElementById(
  "nextHighHeight"
).textContent =
  Math.round(
    nextHigh.level * 100
  ) + " cm";

}

if (nextLow) {

document.getElementById(
  "nextLow"
).textContent =
  formatTime(
    nextLow.time
  );
document.getElementById(
  "nextLowHeight"
).textContent =
  Math.round(
    nextLow.level * 100
  ) + " cm";

}

}

/* =========================
MENU
========================= */

function toggleSpots() {

const menu =
document.getElementById(
“spotMenu”
);

menu.style.display =
menu.style.display === “block”
? “none”
: “block”;

}

function selectSpot(
spot
) {

document.getElementById(
“selectedSpot”
).textContent =
spot;

document.getElementById(
“spotMenu”
).style.display =
“none”;

loadData(spot);

}

/* =========================
MAIN DATA
========================= */

async function loadData(
spot
) {

const location =
spots[spot];

if (!location) {
return;
}

document.getElementById(
“condition”
).textContent =
“読み込み中…”;

try {

const marineUrl =
  "https://marine-api.open-meteo.com/v1/marine" +
  "?latitude=" +
  location.latitude +
  "&longitude=" +
  location.longitude +
  "&current=" +
  "wave_height," +
  "wave_direction," +
  "wave_period," +
  "sea_level_height_msl," +
  "sea_surface_temperature" +
  "&hourly=" +
  "wave_height," +
  "wave_direction," +
  "wave_period," +
  "sea_level_height_msl," +
  "sea_surface_temperature" +
  "&forecast_days=2" +
  "&timezone=Asia%2FTokyo";
const weatherUrl =
  "https://api.open-meteo.com/v1/forecast" +
  "?latitude=" +
  location.latitude +
  "&longitude=" +
  location.longitude +
  "&current=" +
  "wind_speed_10m," +
  "wind_direction_10m," +
  "temperature_2m," +
  "weather_code" +
  "&hourly=" +
  "temperature_2m," +
  "weather_code," +
  "precipitation_probability," +
  "wind_speed_10m," +
  "wind_direction_10m" +
  "&daily=" +
  "sunrise,sunset" +
  "&forecast_days=2" +
  "&wind_speed_unit=ms" +
  "&timezone=Asia%2FTokyo";
const [
  marineResponse,
  weatherResponse
] =
  await Promise.all([
    fetch(marineUrl),
    fetch(weatherUrl)
  ]);
if (
  !marineResponse.ok ||
  !weatherResponse.ok
) {
  throw new Error(
    "API request failed"
  );
}
const marine =
  await marineResponse.json();
const weather =
  await weatherResponse.json();
/* =========================
   WAVE
========================= */
const waveHeight =
  marine.current.wave_height;
const wavePeriod =
  marine.current.wave_period;
const waveDirection =
  marine.current.wave_direction;
window.currentWaveHeight =
  waveHeight;
window.currentWavePeriod =
  wavePeriod;
document.getElementById(
  "waveHeight"
).textContent =
  Number.isFinite(waveHeight)
    ? waveHeight.toFixed(2) + " m"
    : "--";
document.getElementById(
  "wavePeriod"
).textContent =
  Number.isFinite(wavePeriod)
    ? wavePeriod.toFixed(1) + " 秒"
    : "--";
document.getElementById(
  "waveDirection"
).textContent =
  Number.isFinite(waveDirection)
    ? getDirection(waveDirection)
    : "--";
/* =========================
   HUMAN WAVE
========================= */
if (
  Number.isFinite(waveHeight)
) {
  const human =
    humanWave(
      waveHeight
    );
  document.getElementById(
    "humanWave"
  ).textContent =
    human[0];
  document.getElementById(
    "humanWaveReason"
  ).textContent =
    human[1];
}
/* =========================
   WATER TEMP
========================= */
const waterTemp =
  marine.current
    .sea_surface_temperature;
document.getElementById(
  "waterTemp"
).textContent =
  Number.isFinite(waterTemp)
    ? waterTemp.toFixed(1) + " °C"
    : "--";
/* =========================
   WIND CURRENT
========================= */
const windSpeed =
  weather.current
    .wind_speed_10m;
const windDirection =
  weather.current
    .wind_direction_10m;
window.currentWindSpeed =
  windSpeed;
const windResult =
  getWindCondition(
    windDirection,
    location
  );
window.currentWindCondition =
  windResult.label;
document.getElementById(
  "windSpeed"
).textContent =
  Number.isFinite(windSpeed)
    ? windSpeed.toFixed(1) + " m/s"
    : "--";
document.getElementById(
  "windDirection"
).textContent =
  Number.isFinite(windDirection)
    ? getDirection(
        windDirection
      )
    : "--";
const conditionElement =
  document.getElementById(
    "windCondition"
  );
conditionElement.textContent =
  windResult.label;
conditionElement.className =
  "wind-condition " +
  windResult.className;
/* =========================
   SUN
========================= */
document.getElementById(
  "sunrise"
).textContent =
  formatTime(
    weather.daily.sunrise[0]
  );
document.getElementById(
  "sunset"
).textContent =
  formatTime(
    weather.daily.sunset[0]
  );
/* =========================
   HOURLY WEATHER
========================= */
renderHourlyWeather(
  weather.hourly.time,
  weather.hourly.weather_code,
  weather.hourly.temperature_2m,
  weather.hourly.precipitation_probability
);
/* =========================
   HOURLY WIND
========================= */
renderHourlyWind(
  weather.hourly.time,
  weather.hourly.wind_speed_10m,
  weather.hourly.wind_direction_10m,
  location
);
/* =========================
   BOARD
========================= */
renderBoards();
/* =========================
   BEST TIME
========================= */
const best =
  getBestTime(
    waveHeight,
    wavePeriod,
    windSpeed
  );
document.getElementById(
  "bestTime"
).textContent =
  best[0];
document.getElementById(
  "bestReason"
).textContent =
  best[1];
/* =========================
   TIDE
========================= */
const tideTimes =
  marine.hourly.time;
const tideLevels =
  marine.hourly
    .sea_level_height_msl;
drawTideGraph(
  tideTimes,
  tideLevels
);
/*
  2日分のデータから
  次の満潮・干潮を探す
*/
const allExtremes =
  findTideExtremes(
    tideTimes,
    tideLevels
  );
if (allExtremes.length) {
  setNextTide(
    allExtremes
  );
}
/*
  今日の潮位レンジから
  潮回りを簡易判定
*/
const todayLevels = [];
for (
  let i = 0;
  i <
  Math.min(
    tideTimes.length,
    tideLevels.length
  );
  i++
) {
  const localDate =
    new Date(
      tideTimes[i]
    ).toLocaleDateString(
      "en-CA",
      {
        timeZone: "Asia/Tokyo"
      }
    );
  if (
    localDate === todayKey() &&
    Number.isFinite(
      tideLevels[i]
    )
  ) {
    todayLevels.push(
      tideLevels[i]
    );
  }
}
document.getElementById(
  "tideType"
).textContent =
  getTideType(
    todayLevels
  );
/* =========================
   CONDITION
========================= */
document.getElementById(
  "condition"
).textContent =
  "現在のコンディション";
document.getElementById(
  "status"
).textContent =
  `${spot}の最新データを表示中`;

}

catch(error) {

console.error(error);
document.getElementById(
  "condition"
).textContent =
  "取得エラー";
document.getElementById(
  "status"
).textContent =
  "データ取得に失敗しました";

}

}

/* =========================
INITIAL
========================= */

renderBoards();

loadData(
“辻堂”
);

/* =========================
AUTO UPDATE
========================= */

setInterval(

() => {

const spot =
  document.getElementById(
    "selectedSpot"
  ).textContent;
loadData(
  spot
);

},

30 * 60 * 1000

);
