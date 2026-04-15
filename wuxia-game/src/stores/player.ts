import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Character, Item, Skill } from '@/types'
import itemsData from '@/data/items.json'
import skillsData from '@/data/skills.json'

export const usePlayerStore = defineStore('player', () => {
  const character = ref<Character>({
    name: '叶云舟',
    title: '无名小卒',
    sect: 'none',  // 初始无门派
    hp: 100,
    maxHp: 100,
    mp: 80,
    maxMp: 80,
    attack: 18,
    defense: 10,
    speed: 15,
    reputation: 0,  // 门派声望
    gold: 50,
    level: 1,
    exp: 0,
    skills: [
      (skillsData as Record<string, Skill>)['basic_strike']
    ],
    inventory: [],
    equipment: {
      weapon: null,
      armor: null,
      accessory: null
    }
  })

  const hpPercent = computed(() => (character.value.hp / character.value.maxHp) * 100)
  const mpPercent = computed(() => (character.value.mp / character.value.maxMp) * 100)

  function addItem(itemId: string, quantity: number = 1) {
    const itemDef = (itemsData as Record<string, Item>)[itemId]
    if (!itemDef) return
    const existing = character.value.inventory.find(i => i.id === itemId)
    if (existing) {
      existing.quantity += quantity
    } else {
      character.value.inventory.push({ ...itemDef, quantity })
    }
  }

  function removeItem(itemId: string, quantity: number = 1) {
    const idx = character.value.inventory.findIndex(i => i.id === itemId)
    if (idx === -1) return
    character.value.inventory[idx].quantity -= quantity
    if (character.value.inventory[idx].quantity <= 0) {
      character.value.inventory.splice(idx, 1)
    }
  }

  function useItem(itemId: string) {
    const item = character.value.inventory.find(i => i.id === itemId)
    if (!item || item.type !== 'medicine' || !item.effect) return false
    if (item.effect.hp) {
      character.value.hp = Math.min(character.value.maxHp, character.value.hp + item.effect.hp)
    }
    if (item.effect.mp) {
      character.value.mp = Math.min(character.value.maxMp, character.value.mp + item.effect.mp)
    }
    removeItem(itemId)
    return true
  }

  function changeHp(delta: number) {
    character.value.hp = Math.max(0, Math.min(character.value.maxHp, character.value.hp + delta))
  }

  function changeMp(delta: number) {
    character.value.mp = Math.max(0, Math.min(character.value.maxMp, character.value.mp + delta))
  }

  function changeGold(delta: number) {
    character.value.gold = Math.max(0, character.value.gold + delta)
  }

  function changeReputation(delta: number) {
    character.value.reputation += delta
  }

  function learnSkill(skillId: string) {
    const skill = (skillsData as Record<string, Skill>)[skillId]
    if (!skill) return
    if (!character.value.skills.find(s => s.id === skillId)) {
      character.value.skills.push(skill)
    }
  }

  function isDead() {
    return character.value.hp <= 0
  }

  function reset() {
    character.value = {
      name: '叶云舟',
      title: '青云门弟子',
      sect: '青云门',
      hp: 100,
      maxHp: 100,
      mp: 80,
      maxMp: 80,
      attack: 18,
      defense: 10,
      speed: 15,
      reputation: 0,
      gold: 50,
      level: 1,
      exp: 0,
      skills: [
        (skillsData as Record<string, Skill>)['basic_strike'],
        (skillsData as Record<string, Skill>)['cloud_slash']
      ],
      inventory: [],
      equipment: {
        weapon: null,
        armor: null,
        accessory: null
      }
    }
  }

  // 装备物品
  function equipItem(item: Item): boolean {
    if (item.type !== 'weapon' && item.type !== 'armor') return false
    
    const slot = item.type === 'weapon' ? 'weapon' : 'armor'
    const oldItem = character.value.equipment[slot]
    
    // 卸下旧装备
    if (oldItem) {
      addItem(oldItem.id, 1)
      if (oldItem.effect) {
        if (oldItem.effect.attack) character.value.attack -= oldItem.effect.attack
        if (oldItem.effect.defense) character.value.defense -= oldItem.effect.defense
      }
    }
    
    // 装备新物品
    character.value.equipment[slot] = item
    removeItem(item.id, 1)
    
    // 应用装备效果
    if (item.effect) {
      if (item.effect.attack) character.value.attack += item.effect.attack
      if (item.effect.defense) character.value.defense += item.effect.defense
    }
    
    return true
  }

  // 卸下装备
  function unequipItem(slot: 'weapon' | 'armor' | 'accessory'): boolean {
    const item = character.value.equipment[slot]
    if (!item) return false
    
    // 移除装备效果
    if (item.effect) {
      if (item.effect.attack) character.value.attack -= item.effect.attack
      if (item.effect.defense) character.value.defense -= item.effect.defense
    }
    
    character.value.equipment[slot] = null
    addItem(item.id, 1)
    return true
  }

  return {
    character,
    hpPercent,
    mpPercent,
    addItem,
    removeItem,
    useItem,
    changeHp,
    changeMp,
    changeGold,
    changeReputation,
    learnSkill,
    isDead,
    reset,
    equipItem,
    unequipItem
  }
})
