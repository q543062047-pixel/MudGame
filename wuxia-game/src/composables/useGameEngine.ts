import { useGameStore } from '@/stores/game'
import { usePlayerStore } from '@/stores/player'
import { useWorldStore } from '@/stores/world'
import type { ScenarioNode, Choice, NodeEffect } from '@/types'
import chapter1 from '@/data/scenarios/chapter1.json'
import enemiesData from '@/data/enemies.json'
import type { Enemy } from '@/types'

const allNodes: Record<string, ScenarioNode> = (chapter1 as { nodes: Record<string, ScenarioNode> }).nodes

export function useGameEngine() {
  const gameStore = useGameStore()
  const playerStore = usePlayerStore()

  function getNode(id: string): ScenarioNode | null {
    return allNodes[id] || null
  }

  function getCurrentNode(): ScenarioNode | null {
    return getNode(gameStore.currentNodeId)
  }

  function applyEffects(effects: NodeEffect[]) {
    for (const effect of effects) {
      switch (effect.type) {
        case 'addItem':
          if (effect.target) playerStore.addItem(effect.target, effect.value ?? 1)
          break
        case 'removeItem':
          if (effect.target) playerStore.removeItem(effect.target, effect.value ?? 1)
          break
        case 'changeHp':
          if (effect.value !== undefined) playerStore.changeHp(effect.value)
          break
        case 'changeMp':
          if (effect.value !== undefined) playerStore.changeMp(effect.value)
          break
        case 'changeGold':
          if (effect.value !== undefined) playerStore.changeGold(effect.value)
          break
        case 'changeReputation':
          if (effect.value !== undefined) playerStore.changeReputation(effect.value)
          break
        case 'learnSkill':
          if (effect.target) playerStore.learnSkill(effect.target)
          break
        case 'setFlag':
          if (effect.flag) gameStore.setFlag(effect.flag)
          break
      }
    }
  }

  function checkCondition(choice: Choice): boolean {
    if (!choice.condition) return true
    const { type, target, value, operator } = choice.condition
    const player = playerStore.character

    let actual = 0
    switch (type) {
      case 'gold':
        actual = player.gold
        break
      case 'reputation':
        actual = player.reputation
        break
      case 'stat':
        if (target === 'gold') actual = player.gold
        if (target === 'reputation') actual = player.reputation
        if (target === 'hp') actual = player.hp
        if (target === 'mp') actual = player.mp
        break
      case 'item':
        return target ? player.inventory.some(i => i.id === target) : true
      case 'skill':
        return target ? player.skills.some(s => s.id === target) : true
    }

    if (value === undefined) return true
    switch (operator) {
      case '>=': return actual >= value
      case '<=': return actual <= value
      case '==': return actual === value
      case '>': return actual > value
      default: return actual >= value
    }
  }

  function selectChoice(choice: Choice) {
    if (choice.effects) applyEffects(choice.effects)
    goToNode(choice.next)
  }

  function goToNode(nodeId: string) {
    const node = getNode(nodeId)
    if (!node) return

    // Apply node-level effects
    if (node.effects) applyEffects(node.effects)

    gameStore.setNode(nodeId)

    // Check if this triggers a battle
    if (node.battle) {
      const enemy = (enemiesData as Record<string, Enemy>)[node.battle.enemyId]
      if (enemy) {
        // 直接进入战斗，不显示过场
        gameStore.startBattle({ ...enemy })
        return
      }
    }

    // If auto-advance
    if (node.autoNext && !node.choices) {
      setTimeout(() => goToNode(node.autoNext!), 200)
    }
  }

  function startGame() {
    playerStore.reset()
    gameStore.reset()
    useWorldStore().reset()
    gameStore.setPhase('story')
    // 只设置节点，不触发剧情
    gameStore.setNode('start')
  }

  return {
    getCurrentNode,
    getNode,
    selectChoice,
    goToNode,
    checkCondition,
    applyEffects,
    startGame
  }
}
