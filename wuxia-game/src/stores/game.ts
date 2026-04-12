import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { BattleLog, Enemy, ScenarioNode } from '@/types'

export type GamePhase = 'menu' | 'story' | 'battle' | 'inventory' | 'gameover'

export const useGameStore = defineStore('game', () => {
  const phase = ref<GamePhase>('menu')
  const currentNodeId = ref<string>('start')
  const flags = ref<Record<string, boolean>>({})
  const gameLog = ref<string[]>([])   // 全局事件日志
  const gameDay = ref<number>(1)

  // 战斗状态
  const inBattle = ref(false)
  const currentEnemy = ref<Enemy | null>(null)
  const battleLogs = ref<BattleLog[]>([])
  const battleRound = ref(0)

  function setPhase(p: GamePhase) {
    phase.value = p
  }

  function setNode(id: string) {
    currentNodeId.value = id
  }

  function setFlag(flag: string) {
    flags.value[flag] = true
  }

  function hasFlag(flag: string) {
    return !!flags.value[flag]
  }

  function addLog(msg: string) {
    gameLog.value.push(msg)
  }

  function startBattle(enemy: Enemy) {
    inBattle.value = true
    currentEnemy.value = { ...enemy }
    battleLogs.value = []
    battleRound.value = 0
    phase.value = 'battle'
  }

  function addBattleLog(log: BattleLog) {
    battleLogs.value.push(log)
  }

  function endBattle() {
    inBattle.value = false
    currentEnemy.value = null
    phase.value = 'story'
  }

  function nextRound() {
    battleRound.value++
  }

  function damageEnemy(dmg: number) {
    if (currentEnemy.value) {
      currentEnemy.value.hp = Math.max(0, currentEnemy.value.hp - dmg)
    }
  }

  function restoreEnemy() {
    if (currentEnemy.value) {
      currentEnemy.value.hp = currentEnemy.value.maxHp
    }
  }

  function isEnemyDead() {
    return currentEnemy.value ? currentEnemy.value.hp <= 0 : false
  }

  function reset() {
    phase.value = 'menu'
    currentNodeId.value = 'start'
    flags.value = {}
    gameLog.value = []
    gameDay.value = 1
    inBattle.value = false
    currentEnemy.value = null
    battleLogs.value = []
    battleRound.value = 0
  }

  return {
    phase,
    currentNodeId,
    flags,
    gameLog,
    gameDay,
    inBattle,
    currentEnemy,
    battleLogs,
    battleRound,
    setPhase,
    setNode,
    setFlag,
    hasFlag,
    addLog,
    startBattle,
    addBattleLog,
    endBattle,
    nextRound,
    damageEnemy,
    restoreEnemy,
    isEnemyDead,
    reset
  }
})
