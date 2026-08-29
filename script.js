/* =========================================================
   Re'SURF
   script.js
   ========================================================= */


/* =========================================================
   CONFIG
========================================================= */

const CONFIG = {
  timezone: "Asia/Tokyo",

  marineApi:
    "https://marine-api.open-meteo.com/v1/marine",

  weatherApi:
    "https://api.open-meteo.com/v1/forecast",

  autoUpdateMinutes: 30,

  fetchTimeout: 15000
};


/* =========================================================
   SPOT DATA
========================================================= */

const spots = {

  "辻堂": {
    latitude: 35.318333,
    longitude: 139.453056,

    beachDirection: 202,

    offshoreFrom: 22.5,
    offshoreRange: 30
  },

  "鵠沼": {
    latitude: 35.314861,
    longitude: 139.470889,

    beachDirection: 195,

    offshoreFrom: 22.5,
    offshoreRange: 30
  },

  "由比ヶ浜": {
    latitude: 35.309444,
    longitude: 139.537778,

    beachDirection: 157,

    offshoreFrom: 22.5,
    offshoreRange: 30
  },

  "鴨川": {
    latitude: 35.120797,
    longitude: 140.132091,

    beachDirection: 157,

    offshoreFrom: 337.5,
    offshoreRange: 30
  },

  "平砂浦": {
    latitude: 34.943784,
    longitude: 139.810939,

    beachDirection: 202,

    offshoreFrom: 45,
    offshoreRange: 30
  }

};


/* =========================================================
   BOARD TYPES
========================================================= */

const boards = [

  {
    id: "long",
    name: "ロング"
  },

  {
    id: "mid",
    name: "ミッド"
  },

  {
    id: "fish",
    name: "フィッシュ"
  },

  {
    id: "allround",
    name: "オールラウンド"
  },

  {
    id: "performance",
    name: "パフォーマンス"
  }

];


/* =========================================================
   GLOBAL STATE
========================================================= */

window.currentWaveHeight = null;
window.currentWavePeriod = null;
window.currentWaveDirection = null;

window.currentWindSpeed = null;
window.currentWindDirection = null;
window.currentWindCondition = null;

window.currentSpot = "辻堂";

let loading = false;


/* =========================================================
   BASIC HELPERS
========================================================= */

function isFiniteNumber(value) {

  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );

}


function safeNumber(value) {

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;

}


function clamp(value, min, max) {

  return Math.min(
    Math.max(value, min),
    max
  );

}


/* =========================================================
   ELEMENT HELPER
========================================================= */

function getElement(id) {

  return document.getElementById(id);

}


/* =========================================================
   TIME FORMAT
========================================================= */

function formatTime(time) {

  if (!time) {
    return "--";
  }

  const date = new Date(time);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "--";
  }

  return date.toLocaleTimeString(
    "ja-JP",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: CONFIG.timezone
    }
  );

}


/* =========================================================
   DATE KEY
========================================================= */

function dateKey(time = new Date()) {

  const date =
    time instanceof Date
      ? time
      : new Date(time);

  return date.toLocaleDateString(
    "en-CA",
    {
      timeZone: CONFIG.timezone
    }
  );

}


function todayKey() {

  return dateKey(
    new Date()
  );

}


/* =========================================================
   WEATHER ICON
========================================================= */

function weatherIcon(code) {

  if (!Number.isFinite(code)) {
    return "🌤️";
  }

  if (code === 0) {
    return "☀️";
  }

  if (
    code === 1 ||
    code === 2
  ) {
    return "🌤️";
  }

  if (code === 3) {
    return "☁️";
  }

  if (
    code === 45 ||
    code === 48
  ) {
    return "🌫️";
  }

  if (
    code >= 51 &&
    code <= 57
  ) {
    return "🌦️";
  }

  if (
    code >= 61 &&
    code <= 67
  ) {
    return "🌧️";
  }

  if (
    code >= 71 &&
    code <= 77
  ) {
    return "❄️";
  }

  if (
    code >= 80 &&
    code <= 82
  ) {
    return "🌧️";
  }

  if (code >= 95) {
    return "⛈️";
  }

  return "🌤️";

}


/* =========================================================
   DIRECTION
========================================================= */

function getDirection(degrees) {

  if (!Number.isFinite(degrees)) {
    return "--";
  }

  const directions = [
    "北",
    "北北東",
    "北東",
    "東北東",
    "東",
    "東南東",
    "南東",
    "南南東",
    "南",
    "南南西",
    "南西",
    "西南西",
    "西",
    "西北西",
    "北西",
    "北北西"
  ];

  const index =
    Math.round(
      degrees / 22.5
    ) % 16;

  return directions[index];

}


/* =========================================================
   WIND ARROW
========================================================= */

function getWindArrow(degrees) {

  if (!Number.isFinite(degrees)) {
    return "•";
  }

  const arrows = [
    "↓",
    "↙",
    "←",
    "↖",
    "↑",
    "↗",
    "→",
    "↘"
  ];

  return arrows[
    Math.round(
      degrees / 45
    ) % 8
  ];

}


/* =========================================================
   ANGLE DIFFERENCE
========================================================= */

function angleDifference(a, b) {

  let diff =
    Math.abs(a - b) % 360;

  if (diff > 180) {
    diff = 360 - diff;
  }

  return diff;

}


/* =========================================================
   WIND CONDITION
========================================================= */

function getWindCondition(
  windDirection,
  spot
) {

  if (
    !Number.isFinite(windDirection) ||
    !spot
  ) {

    return {
      label: "--",
      className: ""
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


  if (diff <= 75) {

    return {
      label: "サイドオフ",
      className: "wind-sideoff"
    };

  }


  if (diff <= 120) {

    return {
      label: "サイドオン",
      className: "wind-sideon"
    };

  }


  return {
    label: "オンショア",
    className: "wind-onshore"
  };

}


/* =========================================================
   HUMAN WAVE
========================================================= */

function humanWave(height) {

  if (!Number.isFinite(height)) {

    return [
      "--",
      "波サイズを取得できません"
    ];

  }


  if (height < 0.25) {

    return [
      "スネ〜ヒザ",
      "かなり小さめの波"
    ];

  }


  if (height < 0.45) {

    return [
      "ヒザ〜モモ",
      "小波コンディション"
    ];

  }


  if (height < 0.70) {

    return [
      "モモ〜腰",
      "小〜中サイズ"
    ];

  }


  if (height < 1.00) {

    return [
      "腰〜腹",
      "十分なサイズ"
    ];

  }


  if (height < 1.30) {

    return [
      "腹〜胸",
      "しっかりしたサイズ"
    ];

  }


  if (height < 1.70) {

    return [
      "胸〜肩",
      "サイズのある波"
    ];

  }


  if (height < 2.20) {

    return [
      "頭前後",
      "かなりサイズあり"
    ];

  }


  return [
    "頭オーバー",
    "大きなコンディション"
  ];

}


/* =========================================================
   FETCH WITH TIMEOUT
========================================================= */

async function fetchJson(
  url,
  timeout = CONFIG.fetchTimeout
) {

  const controller =
    new AbortController();

  const timer =
    setTimeout(
      () => controller.abort(),
      timeout
    );


  try {

    const response =
      await fetch(
        url,
        {
          method: "GET",
          cache: "no-store",
          signal: controller.signal
        }
      );


    if (!response.ok) {

      throw new Error(
        `HTTP ${response.status}`
      );

    }


    return await response.json();

  }

  catch (error) {

    if (
      error &&
      error.name === "AbortError"
    ) {

      throw new Error(
        "API request timeout"
      );

    }

    throw error;

  }

  finally {

    clearTimeout(timer);

  }

}


/* =========================================================
   API URL
========================================================= */

function buildMarineUrl(location) {

  const params =
    new URLSearchParams({

      latitude:
        location.latitude,

      longitude:
        location.longitude,

      current:
        [
          "wave_height",
          "wave_direction",
          "wave_period",
          "sea_level_height_msl",
          "sea_surface_temperature"
        ].join(","),

      hourly:
        [
          "wave_height",
          "wave_direction",
          "wave_period",
          "sea_level_height_msl",
          "sea_surface_temperature"
        ].join(","),

      forecast_days:
        "2",

      timezone:
        CONFIG.timezone

    });


  return (
    CONFIG.marineApi +
    "?" +
    params.toString()
  );

}


function buildWeatherUrl(location) {

  const params =
    new URLSearchParams({

      latitude:
        location.latitude,

      longitude:
        location.longitude,

      current:
        [
          "wind_speed_10m",
          "wind_direction_10m",
          "temperature_2m",
          "weather_code"
        ].join(","),

      hourly:
        [
          "temperature_2m",
          "weather_code",
          "precipitation_probability",
          "wind_speed_10m",
          "wind_direction_10m"
        ].join(","),

      daily:
        [
          "sunrise",
          "sunset"
        ].join(","),

      forecast_days:
        "2",

      wind_speed_unit:
        "ms",

      timezone:
        CONFIG.timezone

    });


  return (
    CONFIG.weatherApi +
    "?" +
    params.toString()
  );

}


/* =========================================================
   HOURLY WEATHER
========================================================= */

function renderHourlyWeather(
  times,
  codes,
  temperatures,
  rainProbabilities
) {

  const container =
    getElement("weatherHourly");


  if (!container) {
    return;
  }


  container.innerHTML = "";


  if (!Array.isArray(times)) {
    return;
  }


  const now =
    Date.now();


  const today =
    todayKey();


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
      dateKey(date);


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


    const temperature =
      safeNumber(
        temperatures?.[i]
      );


    const rain =
      safeNumber(
        rainProbabilities?.[i]
      );


    const code =
      safeNumber(
        codes?.[i]
      );


    const isCurrent =
      Math.abs(
        date.getTime() - now
      ) < 60 * 60 * 1000;


    const card =
      document.createElement("div");


    card.className =
      "hour-card" +
      (
        isCurrent
          ? " current"
          : ""
      );


    card.innerHTML = `

      <div class="hour-time">
        ${formatTime(times[i])}
      </div>

      <div class="hour-icon">
        ${weatherIcon(code)}
      </div>

      <div class="hour-temp">
        ${
          Number.isFinite(temperature)
            ? Math.round(temperature) + "°"
            : "--"
        }
      </div>

      <div class="hour-rain">
        ☔ ${
          Number.isFinite(rain)
            ? Math.round(rain) + "%"
            : "--"
        }
      </div>

      ${
        isCurrent
          ? `<div class="hour-label">現在</div>`
          : ""
      }

    `;


    container.appendChild(card);

  }

}


/* =========================================================
   HOURLY WIND
========================================================= */

function renderHourlyWind(
  times,
  speeds,
  directions,
  spot
) {

  const container =
    getElement("windHourly");


  if (!container) {
    return;
  }


  container.innerHTML = "";


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
      safeNumber(
        speeds?.[i]
      );


    const direction =
      safeNumber(
        directions?.[i]
      );


    const result =
      getWindCondition(
        direction,
        spot
      );


    const isCurrent =
      Math.abs(
        date.getTime() - now
      ) < 60 * 60 * 1000;


    const card =
      document.createElement("div");


    card.className =
      "wind-hour-card" +
      (
        isCurrent
          ? " current"
          : ""
      );


    card.innerHTML = `

      <div class="wind-hour-time">
        ${formatTime(times[i])}
      </div>

      <div class="wind-hour-arrow">
        ${
          direction !== null
            ? getWindArrow(direction)
            : "•"
        }
      </div>

      <div class="wind-hour-dir">
        ${
          direction !== null
            ? getDirection(direction)
            : "--"
        }
      </div>

      <div class="wind-hour-speed">
        ${
          speed !== null
            ? speed.toFixed(1) + " m/s"
            : "--"
        }
      </div>

      <div class="wind-hour-condition ${result.className}">
        ${result.label}
      </div>

    `;


    container.appendChild(card);

  }

}


/* =========================================================
   BOARD DISPLAY
========================================================= */

function renderBoards() {

  const list =
    getElement("boardList");


  if (!list) {
    return;
  }


  list.innerHTML = "";


  boards.forEach(
    board => {

      const card =
        document.createElement("button");


      card.type = "button";

      card.className =
        "board-card";


      card.innerHTML = `

        <div class="board-name">
          ${board.name}
        </div>

      `;


      card.addEventListener(
        "click",
        () => {

          openBoardModal(
            board.id
          );

        }
      );


      list.appendChild(card);

    }
  );

}


/* =========================================================
   BOARD ADVICE
========================================================= */

function getBoardAdvice(
  boardId,
  height,
  period,
  windSpeed,
  windCondition
) {

  const waveText =
    Number.isFinite(height)
      ? `${height.toFixed(2)}m`
      : "--";


  const periodText =
    Number.isFinite(period)
      ? `${period.toFixed(1)}秒`
      : "--";


  const windText =
    windCondition
      ? `風は${windCondition}。`
      : "";


  const base =
    `現在の波は約${waveText}・周期${periodText}。`;


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


  return (
    advice[boardId] ||
    ""
  );

}


/* =========================================================
   BOARD MODAL
========================================================= */

function openBoardModal(boardId) {

  const board =
    boards.find(
      item =>
        item.id === boardId
    );


  if (!board) {
    return;
  }


  const height =
    window.currentWaveHeight;


  const period =
    window.currentWavePeriod;


  const windSpeed =
    window.currentWindSpeed;


  const windCondition =
    window.currentWindCondition;


  const nameElement =
    getElement("modalBoardName");


  const conditionElement =
    getElement("modalCondition");


  const adviceElement =
    getElement("modalAdvice");


  const modal =
    getElement("boardModal");


  if (!modal) {
    return;
  }


  if (nameElement) {

    nameElement.textContent =
      board.name;

  }


  if (conditionElement) {

    conditionElement.textContent =

      `現在の波 ${
        Number.isFinite(height)
          ? height.toFixed(2) + " m"
          : "--"
      }`
      +
      ` / 周期 ${
        Number.isFinite(period)
          ? period.toFixed(1) + " 秒"
          : "--"
      }`
      +
      ` / 風 ${
        Number.isFinite(windSpeed)
          ? windSpeed.toFixed(1) + " m/s"
          : "--"
      }`
      +
      ` / ${windCondition || "--"}`;

  }


  if (adviceElement) {

    adviceElement.textContent =
      getBoardAdvice(
        board.id,
        height,
        period,
        windSpeed,
        windCondition
      );

  }


  modal.classList.add("show");

}


function closeBoardModal(event) {

  const modal =
    getElement("boardModal");


  if (!modal) {
    return;
  }


  if (
    event &&
    event.target !== modal
  ) {
    return;
  }


  modal.classList.remove(
    "show"
  );

}


/* =========================================================
   BOARD RECOMMENDATION
========================================================= */

function getRecommendedBoard(
  height,
  period
) {

  if (!Number.isFinite(height)) {
    return "allround";
  }


  if (height < 0.35) {
    return "long";
  }


  if (height < 0.50) {
    return "mid";
  }


  if (height < 0.75) {
    return "fish";
  }


  if (height < 1.20) {

    if (
      Number.isFinite(period) &&
      period >= 9
    ) {
      return "allround";
    }

    return "fish";

  }


  if (height < 1.70) {
    return "allround";
  }


  return "performance";

}


/* =========================================================
   BEST TIME
========================================================= */

function getBestTime(
  height,
  period,
  windSpeed
) {

  if (
    Number.isFinite(windSpeed) &&
    windSpeed <= 5 &&
    Number.isFinite(height) &&
    height >= 0.6
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
    "07:00〜10:00",
    "現在はプロトタイプの時間帯判定です。"
  ];

}


/* =========================================================
   TIDE EXTREMES
========================================================= */

function findTideExtremes(
  times,
  levels
) {

  const result = [];


  if (
    !Array.isArray(times) ||
    !Array.isArray(levels) ||
    times.length < 3
  ) {
    return result;
  }


  const length =
    Math.min(
      times.length,
      levels.length
    );


  for (
    let i = 1;
    i < length - 1;
    i++
  ) {

    const previous =
      safeNumber(
        levels[i - 1]
      );


    const current =
      safeNumber(
        levels[i]
      );


    const next =
      safeNumber(
        levels[i + 1]
      );


    if (
      previous === null ||
      current === null ||
      next === null
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


/* =========================================================
   INTERPOLATE TIDE
========================================================= */

function interpolateTide(
  times,
  levels
) {

  if (
    !Array.isArray(times) ||
    !Array.isArray(levels) ||
    times.length < 2
  ) {
    return null;
  }


  const now =
    Date.now();


  for (
    let i = 0;
    i < times.length - 1;
    i++
  ) {

    const t1 =
      new Date(
        times[i]
      ).getTime();


    const t2 =
      new Date(
        times[i + 1]
      ).getTime();


    const l1 =
      safeNumber(
        levels[i]
      );


    const l2 =
      safeNumber(
        levels[i + 1]
      );


    if (
      !Number.isFinite(t1) ||
      !Number.isFinite(t2) ||
      l1 === null ||
      l2 === null
    ) {
      continue;
    }


    if (
      now >= t1 &&
      now <= t2
    ) {

      const duration =
        t2 - t1;


      if (duration <= 0) {
        return l1;
      }


      const ratio =
        (now - t1) /
        duration;


      return (
        l1 +
        (l2 - l1) *
        ratio
      );

    }

  }


  return null;

}


/* =========================================================
   DRAW TIDE GRAPH
========================================================= */

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


  const length =
    Math.min(
      allTimes.length,
      allLevels.length
    );


  for (
    let i = 0;
    i < length;
    i++
  ) {

    if (!allTimes[i]) {
      continue;
    }


    const level =
      safeNumber(
        allLevels[i]
      );


    if (level === null) {
      continue;
    }


    const date =
      new Date(
        allTimes[i]
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      continue;
    }


    if (
      dateKey(date) === today
    ) {

      validPairs.push({

        time:
          allTimes[i],

        level:
          level

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


  const levels =
    validPairs.map(
      item =>
        item.level
    );


  let min =
    Math.min(
      ...levels
    );


  let max =
    Math.max(
      ...levels
    );


  if (
    min === max
  ) {

    min -= 0.5;
    max += 0.5;

  }


  const margin =
    Math.max(
      (max - min) * 0.12,
      0.10
    );


  min -= margin;
  max += margin;


  const range =
    max - min || 1;


  const points = [];


  validPairs.forEach(
    (item, index) => {

      const ratio =
        index /
        Math.max(
          validPairs.length - 1,
          1
        );


      const x =
        padding +
        ratio *
        (
          width -
          padding * 2
        );


      const y =
        height -
        padding -
        (
          (
            item.level - min
          ) /
          range
        ) *
        (
          height -
          padding * 2
        );


      points.push(
        `${x.toFixed(1)},${y.toFixed(1)}`
      );

    }
  );


  const pointString =
    points.join(" ");


  const tideLine =
    getElement("tideLine");


  const tideArea =
    getElement("tideArea");


  if (tideLine) {

    tideLine.setAttribute(
      "points",
      pointString
    );

  }


  if (tideArea) {

    tideArea.setAttribute(
      "points",
      pointString +
      ` ${width},${height} 0,${height}`
    );

  }


  /* =====================================================
     TIME AXIS
  ===================================================== */

  const indexes = [

    0,

    Math.floor(
      (validPairs.length - 1) *
      0.25
    ),

    Math.floor(
      (validPairs.length - 1) *
      0.50
    ),

    Math.floor(
      (validPairs.length - 1) *
      0.75
    ),

    validPairs.length - 1

  ];


  indexes.forEach(
    (index, i) => {

      const element =
        getElement(
          "tideTime" + i
        );


      if (
        element &&
        validPairs[index]
      ) {

        element.textContent =
          formatTime(
            validPairs[index].time
          );

      }

    }
  );


  /* =====================================================
     SCALE
  ===================================================== */

  const scaleValues = [

    max,

    max -
      range * 0.25,

    max -
      range * 0.50,

    max -
      range * 0.75,

    min

  ];


  const scaleIds = [

    "scaleTop",

    "scale75",

    "scale50",

    "scale25",

    "scaleBottom"

  ];


  scaleIds.forEach(
    (id, index) => {

      const element =
        getElement(id);


      if (element) {

        element.textContent =
          Math.round(
            scaleValues[index] *
            100
          ) +
          " cm";

      }

    }
  );


  /* =====================================================
     CURRENT TIDE POSITION
  ===================================================== */

  const now =
    Date.now();


  let currentIndex = 0;

  let closestDiff =
    Infinity;


  validPairs.forEach(
    (item, index) => {

      const itemTime =
        new Date(
          item.time
        ).getTime();


      const diff =
        Math.abs(
          itemTime - now
        );


      if (
        diff < closestDiff
      ) {

        closestDiff =
          diff;

        currentIndex =
          index;

      }

    }
  );


  const currentTime =
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
      currentTime
    )
      ? currentTime
      : validPairs[currentIndex].level;


  let currentX =
    padding +
    (
      currentIndex /
      Math.max(
        validPairs.length - 1,
        1
      )
    ) *
    (
      width -
      padding * 2
    );


  /* =====================================================
     MORE ACCURATE CURRENT X
  ===================================================== */

  for (
    let i = 0;
    i < validPairs.length - 1;
    i++
  ) {

    const t1 =
      new Date(
        validPairs[i].time
      ).getTime();


    const t2 =
      new Date(
        validPairs[i + 1].time
      ).getTime();


    if (
      now >= t1 &&
      now <= t2
    ) {

      const ratio =
        (
          now - t1
        ) /
        Math.max(
          t2 - t1,
          1
        );


      currentX =
        padding +
        (
          (
            i + ratio
          ) /
          Math.max(
            validPairs.length - 1,
            1
          )
        ) *
        (
          width -
          padding * 2
        );


      break;

    }

  }


  const currentY =
    height -
    padding -
    (
      (
        currentLevel - min
      ) /
      range
    ) *
    (
      height -
      padding * 2
    );


  const nowLine =
    getElement("tideNow");


  if (nowLine) {

    nowLine.setAttribute(
      "x1",
      currentX
    );

    nowLine.setAttribute(
      "x2",
      currentX
    );

  }


  const nowDot =
    getElement("tideNowDot");


  if (nowDot) {

    nowDot.setAttribute(
      "cx",
      currentX
    );

    nowDot.setAttribute(
      "cy",
      clamp(
        currentY,
        0,
        height
      )
    );

  }


  const currentTide =
    getElement(
      "currentTide"
    );


  if (currentTide) {

    currentTide.textContent =
      Math.round(
        currentLevel * 100
      );

  }


  /* =====================================================
     HIGH / LOW POINTS
  ===================================================== */

  const extremes =
    findTideExtremes(
      validPairs.map(
        item => item.time
      ),
      validPairs.map(
        item => item.level
      )
    );


  const pointGroup =
    getElement(
      "tideExtremePoints"
    );


  if (pointGroup) {

    pointGroup.innerHTML = "";


    extremes.forEach(
      extreme => {

        const x =
          padding +
          (
            extreme.index /
            Math.max(
              validPairs.length - 1,
              1
            )
          ) *
          (
            width -
            padding * 2
          );


        const y =
          height -
          padding -
          (
            (
              extreme.level - min
            ) /
            range
          ) *
          (
            height -
            padding * 2
          );


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
          ) +
          "cm";


        pointGroup.appendChild(
          circle
        );


        pointGroup.appendChild(
          text
        );

      }
    );

  }


  return extremes;

}


/* =========================================================
   TIDE TYPE
========================================================= */

function getTideType(levels) {

  if (
    !Array.isArray(levels) ||
    !levels.length
  ) {

    return "潮回り判定不可";

  }


  const valid =
    levels
      .map(
        value =>
          safeNumber(value)
      )
      .filter(
        value =>
          value !== null
      );


  if (!valid.length) {
    return "潮回り判定不可";
  }


  const range =
    Math.max(
      ...valid
    ) -
    Math.min(
      ...valid
    );


  if (range >= 1.5) {
    return "大潮";
  }


  if (range >= 1.0) {
    return "中潮";
  }


  if (range >= 0.6) {
    return "小潮";
  }


  return "長潮・若潮";

}


/* =========================================================
   NEXT TIDE
========================================================= */

function setNextTide(
  allExtremes
) {

  const now =
    Date.now();


  const future =
    allExtremes.filter(
      item => {

        const time =
          new Date(
            item.time
          ).getTime();

        return (
          Number.isFinite(time) &&
          time > now
        );

      }
    );


  const nextHigh =
    future.find(
      item =>
        item.type === "high"
    );


  const nextLow =
    future.find(
      item =>
        item.type === "low"
    );


  const nextHighElement =
    getElement(
      "nextHigh"
    );


  const nextHighHeightElement =
    getElement(
      "nextHighHeight"
    );


  const nextLowElement =
    getElement(
      "nextLow"
    );


  const nextLowHeightElement =
    getElement(
      "nextLowHeight"
    );


  if (nextHigh) {

    if (nextHighElement) {

      nextHighElement.textContent =
        formatTime(
          nextHigh.time
        );

    }


    if (nextHighHeightElement) {

      nextHighHeightElement.textContent =
        Math.round(
          nextHigh.level * 100
        ) +
        " cm";

    }

  }
  else {

    if (nextHighElement) {
      nextHighElement.textContent =
        "--";
    }

    if (nextHighHeightElement) {
      nextHighHeightElement.textContent =
        "-- cm";
    }

  }


  if (nextLow) {

    if (nextLowElement) {

      nextLowElement.textContent =
        formatTime(
          nextLow.time
        );

    }


    if (nextLowHeightElement) {

      nextLowHeightElement.textContent =
        Math.round(
          nextLow.level * 100
        ) +
        " cm";

    }

  }
  else {

    if (nextLowElement) {
      nextLowElement.textContent =
        "--";
    }

    if (nextLowHeightElement) {
      nextLowHeightElement.textContent =
        "-- cm";
    }

  }

}


/* =========================================================
   SPOT MENU
========================================================= */

function toggleSpots() {

  const menu =
    getElement(
      "spotMenu"
    );


  if (!menu) {
    return;
  }


  const isOpen =
    menu.style.display === "block";


  menu.style.display =
    isOpen
      ? "none"
      : "block";

}


function selectSpot(
  spot
) {

  if (
    !spots[spot]
  ) {
    return;
  }


  const selectedSpot =
    getElement(
      "selectedSpot"
    );


  const menu =
    getElement(
      "spotMenu"
    );


  if (selectedSpot) {

    selectedSpot.textContent =
      spot;

  }


  if (menu) {

    menu.style.display =
      "none";

  }


  window.currentSpot =
    spot;


  loadData(
    spot
  );

}


/* =========================================================
   RESET UI
========================================================= */

function resetLoadingUI() {

  const condition =
    getElement(
      "condition"
    );


  if (condition) {

    condition.textContent =
      "読み込み中...";

  }


  const status =
    getElement(
      "status"
    );


  if (status) {

    status.textContent =
      "現在のコンディションを取得しています...";

  }


  const windCondition =
    getElement(
      "windCondition"
    );


  if (windCondition) {

    windCondition.textContent =
      "風向を分析中...";

    windCondition.className =
      "wind-condition";

  }

}


/* =========================================================
   APPLY ERROR UI
========================================================= */

function showLoadError(error) {

  console.error(
    "Re'SURF data load error:",
    error
  );


  const condition =
    getElement(
      "condition"
    );


  if (condition) {

    condition.textContent =
      "取得エラー";

  }


  const status =
    getElement(
      "status"
    );


  if (status) {

    status.textContent =
      "データ取得に失敗しました。通信環境を確認してください。";

  }

}


/* =========================================================
   CURRENT MARINE DATA FALLBACK
========================================================= */

function getCurrentMarineValue(
  marine,
  key
) {

  const currentValue =
    marine?.current?.[key];


  if (
    Number.isFinite(
      currentValue
    )
  ) {

    return currentValue;

  }


  const times =
    marine?.hourly?.time;


  const values =
    marine?.hourly?.[key];


  if (
    !Array.isArray(times) ||
    !Array.isArray(values)
  ) {

    return null;

  }


  const now =
    Date.now();


  let bestIndex = -1;

  let bestDiff =
    Infinity;


  for (
    let i = 0;
    i < times.length;
    i++
  ) {

    const time =
      new Date(
        times[i]
      ).getTime();


    const value =
      safeNumber(
        values[i]
      );


    if (
      !Number.isFinite(time) ||
      value === null
    ) {
      continue;
    }


    const diff =
      Math.abs(
        time - now
      );


    if (
      diff < bestDiff
    ) {

      bestDiff =
        diff;

      bestIndex =
        i;

    }

  }


  return bestIndex >= 0
    ? safeNumber(
        values[bestIndex]
      )
    : null;

}


/* =========================================================
   CURRENT WEATHER DATA FALLBACK
========================================================= */

function getCurrentWeatherValue(
  weather,
  key
) {

  const currentValue =
    weather?.current?.[key];


  if (
    Number.isFinite(
      currentValue
    )
  ) {

    return currentValue;

  }


  const times =
    weather?.hourly?.time;


  const values =
    weather?.hourly?.[key];


  if (
    !Array.isArray(times) ||
    !Array.isArray(values)
  ) {

    return null;

  }


  const now =
    Date.now();


  let bestIndex = -1;

  let bestDiff =
    Infinity;


  for (
    let i = 0;
    i < times.length;
    i++
  ) {

    const time =
      new Date(
        times[i]
      ).getTime();


    const value =
      safeNumber(
        values[i]
      );


    if (
      !Number.isFinite(time) ||
      value === null
    ) {
      continue;
    }


    const diff =
      Math.abs(
        time - now
      );


    if (
      diff < bestDiff
    ) {

      bestDiff =
        diff;

      bestIndex =
        i;

    }

  }


  return bestIndex >= 0
    ? safeNumber(
        values[bestIndex]
      )
    : null;

}


/* =========================================================
   MAIN DATA LOAD
========================================================= */

async function loadData(
  spot
) {

  if (
    loading
  ) {

    console.log(
      "Re'SURF: previous request is still running."
    );

    return;

  }


  const location =
    spots[spot];


  if (!location) {

    console.error(
      "Unknown spot:",
      spot
    );

    return;

  }


  loading = true;


  window.currentSpot =
    spot;


  resetLoadingUI();


  try {

    /* =====================================================
       API URL
    ===================================================== */

    const marineUrl =
      buildMarineUrl(
        location
      );


    const weatherUrl =
      buildWeatherUrl(
        location
      );


    console.log(
      "Re'SURF: loading",
      spot
    );


    /* =====================================================
       FETCH
    ===================================================== */

    const results =
      await Promise.allSettled([

        fetchJson(
          marineUrl
        ),

        fetchJson(
          weatherUrl
        )

      ]);


    const marineResult =
      results[0];


    const weatherResult =
      results[1];


    if (
      marineResult.status === "rejected"
    ) {

      throw new Error(
        "Marine API: " +
        marineResult.reason
      );

    }


    if (
      weatherResult.status === "rejected"
    ) {

      throw new Error(
        "Weather API: " +
        weatherResult.reason
      );

    }


    const marine =
      marineResult.value;


    const weather =
      weatherResult.value;


    /* =====================================================
       VALIDATE
    ===================================================== */

    if (!marine) {

      throw new Error(
        "Marine API returned empty data."
      );

    }


    if (!weather) {

      throw new Error(
        "Weather API returned empty data."
      );

    }


    /* =====================================================
       WAVE
    ===================================================== */

    const waveHeight =
      getCurrentMarineValue(
        marine,
        "wave_height"
      );


    const wavePeriod =
      getCurrentMarineValue(
        marine,
        "wave_period"
      );


    const waveDirection =
      getCurrentMarineValue(
        marine,
        "wave_direction"
      );


    window.currentWaveHeight =
      waveHeight;


    window.currentWavePeriod =
      wavePeriod;


    window.currentWaveDirection =
      waveDirection;


    const waveHeightElement =
      getElement(
        "waveHeight"
      );


    if (waveHeightElement) {

      waveHeightElement.textContent =
        Number.isFinite(waveHeight)
          ? waveHeight.toFixed(2) + " m"
          : "--";

    }


    const wavePeriodElement =
      getElement(
        "wavePeriod"
      );


    if (wavePeriodElement) {

      wavePeriodElement.textContent =
        Number.isFinite(wavePeriod)
          ? wavePeriod.toFixed(1) + " 秒"
          : "--";

    }


    const waveDirectionElement =
      getElement(
        "waveDirection"
      );


    if (waveDirectionElement) {

      waveDirectionElement.textContent =
        Number.isFinite(waveDirection)
          ? getDirection(
              waveDirection
            )
          : "--";

    }


    /* =====================================================
       HUMAN WAVE
    ===================================================== */

    const human =
      humanWave(
        waveHeight
      );


    const humanWaveElement =
      getElement(
        "humanWave"
      );


    if (humanWaveElement) {

      humanWaveElement.textContent =
        human[0];

    }


    const humanWaveReasonElement =
      getElement(
        "humanWaveReason"
      );


    if (
      humanWaveReasonElement
    ) {

      humanWaveReasonElement.textContent =
        human[1];

    }


    /* =====================================================
       WATER TEMP
    ===================================================== */

    const waterTemp =
      getCurrentMarineValue(
        marine,
        "sea_surface_temperature"
      );


    const waterTempElement =
      getElement(
        "waterTemp"
      );


    if (waterTempElement) {

      waterTempElement.textContent =
        Number.isFinite(waterTemp)
          ? waterTemp.toFixed(1) + " °C"
          : "--";

    }


    /* =====================================================
       WIND
    ===================================================== */

    const windSpeed =
      getCurrentWeatherValue(
        weather,
        "wind_speed_10m"
      );


    const windDirection =
      getCurrentWeatherValue(
        weather,
        "wind_direction_10m"
      );


    window.currentWindSpeed =
      windSpeed;


    window.currentWindDirection =
      windDirection;


    const windResult =
      getWindCondition(
        windDirection,
        location
      );


    window.currentWindCondition =
      windResult.label;


    const windSpeedElement =
      getElement(
        "windSpeed"
      );


    if (windSpeedElement) {

      windSpeedElement.textContent =
        Number.isFinite(windSpeed)
          ? windSpeed.toFixed(1) + " m/s"
          : "--";

    }


    const windDirectionElement =
      getElement(
        "windDirection"
      );


    if (
      windDirectionElement
    ) {

      windDirectionElement.textContent =
        Number.isFinite(
          windDirection
        )
          ? getDirection(
              windDirection
            )
          : "--";

    }


    const windConditionElement =
      getElement(
        "windCondition"
      );


    if (
      windConditionElement
    ) {

      windConditionElement.textContent =
        windResult.label;


      windConditionElement.className =
        "wind-condition " +
        windResult.className;

    }


    /* =====================================================
       SUN
    ===================================================== */

    const sunrise =
      weather?.daily?.sunrise?.[0];


    const sunset =
      weather?.daily?.sunset?.[0];


    const sunriseElement =
      getElement(
        "sunrise"
      );


    if (sunriseElement) {

      sunriseElement.textContent =
        formatTime(
          sunrise
        );

    }


    const sunsetElement =
      getElement(
        "sunset"
      );


    if (sunsetElement) {

      sunsetElement.textContent =
        formatTime(
          sunset
        );

    }


    /* =====================================================
       HOURLY WEATHER
    ===================================================== */

    renderHourlyWeather(

      weather?.hourly?.time,

      weather?.hourly?.weather_code,

      weather?.hourly?.temperature_2m,

      weather?.hourly?.precipitation_probability

    );


    /* =====================================================
       HOURLY WIND
    ===================================================== */

    renderHourlyWind(

      weather?.hourly?.time,

      weather?.hourly?.wind_speed_10m,

      weather?.hourly?.wind_direction_10m,

      location

    );


    /* =====================================================
       BOARD
    ===================================================== */

    renderBoards();


    /* =====================================================
       BEST TIME
    ===================================================== */

    const best =
      getBestTime(
        waveHeight,
        wavePeriod,
        windSpeed
      );


    const bestTimeElement =
      getElement(
        "bestTime"
      );


    if (bestTimeElement) {

      bestTimeElement.textContent =
        best[0];

    }


    const bestReasonElement =
      getElement(
        "bestReason"
      );


    if (
      bestReasonElement
    ) {

      bestReasonElement.textContent =
        best[1];

    }


    /* =====================================================
       TIDE
    ===================================================== */

    const tideTimes =
      marine?.hourly?.time;


    const tideLevels =
      marine?.hourly?.sea_level_height_msl;


    const todayExtremes =
      drawTideGraph(
        tideTimes,
        tideLevels
      );


    /* =====================================================
       ALL TIDE EXTREMES
    ===================================================== */

    const allExtremes =
      findTideExtremes(
        tideTimes,
        tideLevels
      );


    setNextTide(
      allExtremes
    );


    /* =====================================================
       TODAY TIDE TYPE
    ===================================================== */

    const todayLevels = [];


    if (
      Array.isArray(tideTimes) &&
      Array.isArray(tideLevels)
    ) {

      const length =
        Math.min(
          tideTimes.length,
          tideLevels.length
        );


      const today =
        todayKey();


      for (
        let i = 0;
        i < length;
        i++
      ) {

        const date =
          new Date(
            tideTimes[i]
          );


        if (
          Number.isNaN(
            date.getTime()
          )
        ) {
          continue;
        }


        if (
          dateKey(date) !== today
        ) {
          continue;
        }


        const level =
          safeNumber(
            tideLevels[i]
          );


        if (
          level !== null
        ) {

          todayLevels.push(
            level
          );

        }

      }

    }


    const tideTypeElement =
      getElement(
        "tideType"
      );


    if (
      tideTypeElement
    ) {

      tideTypeElement.textContent =
        getTideType(
          todayLevels
        );

    }


    /* =====================================================
       CONDITION
    ===================================================== */

    const conditionElement =
      getElement(
        "condition"
      );


    if (
      conditionElement
    ) {

      conditionElement.textContent =
        "現在のコンディション";

    }


    const statusElement =
      getElement(
        "status"
      );


    if (
      statusElement
    ) {

      statusElement.textContent =
        `${spot}の最新データを表示中`;

    }


    console.log(
      "Re'SURF: data loaded successfully",
      {
        spot,
        waveHeight,
        wavePeriod,
        waveDirection,
        windSpeed,
        windDirection,
        windCondition:
          windResult.label
      }
    );

  }

  catch (error) {

    showLoadError(
      error
    );

  }

  finally {

    loading = false;

  }

}


/* =========================================================
   CLOSE MENU WHEN CLICKING OUTSIDE
========================================================= */

document.addEventListener(
  "click",
  event => {

    const menu =
      getElement(
        "spotMenu"
      );


    const button =
      document.querySelector(
        ".spot-button"
      );


    if (
      !menu ||
      !button
    ) {
      return;
    }


    if (
      !menu.contains(
        event.target
      ) &&
      !button.contains(
        event.target
      )
    ) {

      menu.style.display =
        "none";

    }

  }
);


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape"
    ) {

      closeBoardModal();

    }

  }
);


/* =========================================================
   INITIALIZE
========================================================= */

function initializeApp() {

  console.log(
    "Re'SURF initializing..."
  );


  renderBoards();


  const selectedSpot =
    getElement(
      "selectedSpot"
    );


  const initialSpot =
    selectedSpot?.textContent &&
    spots[
      selectedSpot.textContent
    ]

      ? selectedSpot.textContent

      : "辻堂";


  window.currentSpot =
    initialSpot;


  loadData(
    initialSpot
  );

}


/* =========================================================
   AUTO UPDATE
========================================================= */

setInterval(
  () => {

    const selectedSpot =
      getElement(
        "selectedSpot"
      );


    const spot =
      selectedSpot?.textContent &&
      spots[
        selectedSpot.textContent
      ]

        ? selectedSpot.textContent

        : window.currentSpot;


    if (
      spot &&
      !loading
    ) {

      loadData(
        spot
      );

    }

  },
  CONFIG.autoUpdateMinutes *
  60 *
  1000
);


/* =========================================================
   START
========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeApp
  );

}
else {

  initializeApp();

}
