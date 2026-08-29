/* =========================
   Re'SURF DATA
========================= */


/* =========================
   SPOT DATA
========================= */

const spots = {

  "辻堂": {
    latitude: 35.318333,
    longitude: 139.453056,

    beachDirection: 202,

    // 北〜北東をオフショア基準
    offshoreFrom: 22.5,
    offshoreRange: 30
  },

  "鵠沼": {
    latitude: 35.314861,
    longitude: 139.470889,

    beachDirection: 195,

    // 北〜北東をオフショア基準
    offshoreFrom: 22.5,
    offshoreRange: 30
  },

  "由比ヶ浜": {
    latitude: 35.309444,
    longitude: 139.537778,

    beachDirection: 157,

    // 北〜北東をオフショア基準
    offshoreFrom: 22.5,
    offshoreRange: 30
  },

  "鴨川": {
    // 鴨川＝マルキ
    latitude: 35.120797,
    longitude: 140.132091,

    beachDirection: 157,

    // 北西〜北寄りをオフショア基準
    offshoreFrom: 337.5,
    offshoreRange: 30
  },

  "平砂浦": {
    // 平砂浦ファミリーパーク下付近
    latitude: 34.943784,
    longitude: 139.810939,

    beachDirection: 202,

    // 北東をオフショア基準
    offshoreFrom: 45,
    offshoreRange: 30
  }

};


/* =========================
   BOARD TYPES
========================= */

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
