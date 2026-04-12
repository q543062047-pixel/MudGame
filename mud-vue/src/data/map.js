export const mapData = {
  hall: {
    name: "大厅",
    x: 0,
    y: 0,
    exits: { up: "study", down: "yard" },
    npcs: [
      { name: "馆主", type: "talk" }
    ]
  },

  study: {
    name: "书房",
    x: 0,
    y: -1,
    exits: { down: "hall" },
    npcs: []
  },

  yard: {
    name: "武馆大院",
    x: 0,
    y: 1,
    exits: { up: "hall" },
    npcs: [
      { name: "武馆弟子", type: "enemy" }
    ]
  }
};