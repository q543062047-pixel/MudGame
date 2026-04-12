import { useGameStore } from '@/stores/game'
import { usePlayerStore } from '@/stores/player'
import type { Skill, ScenarioNode, NodeEffect } from '@/types'
import chapter1 from '@/data/scenarios/chapter1.json'

const allNodes: Record<string, ScenarioNode> = (chapter1 as { nodes: Record<string, ScenarioNode> }).nodes

function applyNodeEffects(effects: NodeEffect[]) {
  const playerStore = usePlayerStore()
  const gameStore = useGameStore()
  for (const eff of effects) {
    if (eff.type === 'addItem' && eff.target) playerStore.addItem(eff.target, eff.value ?? 1)
    if (eff.type === 'removeItem' && eff.target) playerStore.removeItem(eff.target, eff.value ?? 1)
    if (eff.type === 'changeHp' && eff.value !== undefined) playerStore.changeHp(eff.value)
    if (eff.type === 'changeMp' && eff.value !== undefined) playerStore.changeMp(eff.value)
    if (eff.type === 'changeGold' && eff.value !== undefined) playerStore.changeGold(eff.value)
    if (eff.type === 'changeReputation' && eff.value !== undefined) playerStore.changeReputation(eff.value)
    if (eff.type === 'setFlag' && eff.flag) gameStore.setFlag(eff.flag)
  }
}

export function useBattle() {
  const gameStore = useGameStore()
  const playerStore = usePlayerStore()

  function calcDamage(atk: number, def: number, skillDmg: number = 0): number {
    const base = atk + skillDmg
    const reduced = Math.max(1, base - def)
    const variance = 0.8 + Math.random() * 0.4
    return Math.floor(reduced * variance)
  }

  function resolveAfterBattle(winOrLose: 'win' | 'lose') {
    const nodeData = allNodes[gameStore.currentNodeId]
    gameStore.endBattle()
    const nextId = winOrLose === 'win' ? nodeData?.battle?.winNext : nodeData?.battle?.loseNext
    if (!nextId) return
    const targetNode = allNodes[nextId]
    if (targetNode?.effects) applyNodeEffects(targetNode.effects)
    gameStore.setNode(nextId)
  }

  function playerAttack(skill: Skill) {
    const enemy = gameStore.currentEnemy
    if (!enemy) return
    const player = playerStore.character
    if (skill.mpCost > player.mp) return

    playerStore.changeMp(-skill.mpCost)
    gameStore.nextRound()

    const playerDmg = calcDamage(player.attack, enemy.defense, skill.damage)
    gameStore.damageEnemy(playerDmg)
    gameStore.addBattleLog({
      round: gameStore.battleRound,
      actor: player.name,
      action: skill.name,
      damage: playerDmg,
      effect: ''
    })

    if (gameStore.isEnemyDead()) {
      resolveAfterBattle('win')
      return
    }

    setTimeout(() => enemyTurn(), 700)
  }

  function enemyTurn() {
    const enemy = gameStore.currentEnemy
    if (!enemy) return

    let skillDmg = 0
    let skillName = '普通攻击'

    const usableSkills = enemy.skills.filter(s => s.mpCost <= enemy.mp)
    if (usableSkills.length > 0 && Math.random() > 0.5) {
      const skill = usableSkills[Math.floor(Math.random() * usableSkills.length)]
      enemy.mp = Math.max(0, enemy.mp - skill.mpCost)
      skillDmg = skill.damage
      skillName = skill.name
    }

    const player = playerStore.character
    const dmg = calcDamage(enemy.attack, player.defense, skillDmg)
    playerStore.changeHp(-dmg)

    gameStore.addBattleLog({
      round: gameStore.battleRound,
      actor: enemy.name,
      action: skillName,
      damage: dmg,
      effect: ''
    })

    if (playerStore.isDead()) {
      playerStore.changeHp(1)
      resolveAfterBattle('lose')
    }
  }

  function flee() {
    const nodeData = allNodes[gameStore.currentNodeId]
    if (nodeData?.battle?.canFlee) {
      playerStore.changeHp(-10)
      resolveAfterBattle('lose')
    }
  }

  return { playerAttack, flee }
}
