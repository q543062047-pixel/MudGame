import { useGameStore } from '@/stores/game'
import { usePlayerStore } from '@/stores/player'
import type { StoryData, NodeEffect, DialogContent, BattleContent, EventContent } from '@/types'
import enemiesData from '@/data/enemies.json'
import type { Enemy } from '@/types'
import { useSect } from '@/composables/useSect'

/**
 * 剧情执行器
 * 负责执行不同类型的剧情内容
 */
export class StoryExecutor {
  /**
   * 执行剧情
   * @param story 剧情数据
   * @param onComplete 完成回调
   */
  async execute(story: StoryData, onComplete?: () => void): Promise<void> {
    console.log(`[StoryExecutor] 执行剧情: ${story.name} (${story.type})`)

    switch (story.type) {
      case 'dialog':
        if (story.content.dialog) {
          await this.executeDialog(story.content.dialog)
        }
        break

      case 'event':
        if (story.content.event) {
          await this.executeEvent(story.content.event, onComplete)
        }
        break

      case 'battle':
        if (story.content.battle) {
          await this.executeBattle(story.content.battle, onComplete)
        }
        break

      case 'cutscene':
        if (story.content.cutscene) {
          await this.executeCutscene()
        }
        break

      default:
        console.warn(`[StoryExecutor] 未知的剧情类型: ${story.type}`)
        onComplete?.()
    }
  }

  /**
   * 执行对话型剧情
   */
  private async executeDialog(dialog: DialogContent): Promise<void> {
    // 对话型剧情由 UI 组件处理
    // 这里只负责应用效果
    if (dialog.effects) {
      this.applyEffects(dialog.effects)
    }
    
    // 通知完成（实际完成由 UI 组件控制）
    // onComplete 会在用户完成对话后调用
  }

  /**
   * 执行事件型剧情
   */
  private async executeEvent(event: EventContent, onComplete?: () => void): Promise<void> {
    // 应用事件效果
    if (event.effects) {
      this.applyEffects(event.effects)
    }

    // 如果有选项，由 UI 组件处理
    // 否则直接完成
    if (!event.choices || event.choices.length === 0) {
      onComplete?.()
    }
  }

  /**
   * 执行战斗型剧情
   */
  private async executeBattle(battle: BattleContent, onComplete?: () => void): Promise<void> {
    const gameStore = useGameStore()
    
    // 获取敌人数据
    const enemy = (enemiesData as Record<string, Enemy>)[battle.enemyId]
    if (!enemy) {
      console.error(`[StoryExecutor] 找不到敌人: ${battle.enemyId}`)
      onComplete?.()
      return
    }

    // 开始战斗
    gameStore.startBattle({ ...enemy })

    // 战斗结果由战斗系统处理
    // onWin 和 onLose 效果会在战斗结束后应用
  }

  /**
   * 执行过场动画
   */
  private async executeCutscene(): Promise<void> {
    // 过场动画由 UI 组件处理
    console.log('[StoryExecutor] 播放过场动画')
  }

  /**
   * 应用效果
   * @param effects 效果列表
   */
  applyEffects(effects: NodeEffect[]): void {
    const gameStore = useGameStore()
    const playerStore = usePlayerStore()

    for (const effect of effects) {
      switch (effect.type) {
        case 'addItem':
          if (effect.target) {
            playerStore.addItem(effect.target, effect.value ?? 1)
            console.log(`[Effect] 获得物品: ${effect.target} x${effect.value ?? 1}`)
          }
          break

        case 'removeItem':
          if (effect.target) {
            playerStore.removeItem(effect.target, effect.value ?? 1)
            console.log(`[Effect] 失去物品: ${effect.target} x${effect.value ?? 1}`)
          }
          break

        case 'changeHp':
          if (effect.value !== undefined) {
            playerStore.changeHp(effect.value)
            console.log(`[Effect] HP ${effect.value > 0 ? '+' : ''}${effect.value}`)
          }
          break

        case 'changeMp':
          if (effect.value !== undefined) {
            playerStore.changeMp(effect.value)
            console.log(`[Effect] MP ${effect.value > 0 ? '+' : ''}${effect.value}`)
          }
          break

        case 'changeGold':
          if (effect.value !== undefined) {
            playerStore.changeGold(effect.value)
            console.log(`[Effect] 金钱 ${effect.value > 0 ? '+' : ''}${effect.value}`)
          }
          break

        case 'changeReputation':
          if (effect.value !== undefined) {
            playerStore.changeReputation(effect.value)
            console.log(`[Effect] 声望 ${effect.value > 0 ? '+' : ''}${effect.value}`)
          }
          break

        case 'learnSkill':
          if (effect.target) {
            playerStore.learnSkill(effect.target)
            console.log(`[Effect] 学会技能: ${effect.target}`)
          }
          break

        case 'setFlag':
          if (effect.flag) {
            gameStore.setFlag(effect.flag)
            console.log(`[Effect] 设置标志: ${effect.flag}`)
          }
          break

        case 'joinSect':
          if (effect.sectId) {
            const { joinSect } = useSect()
            const success = joinSect(effect.sectId)
            if (success) {
              console.log(`[Effect] 加入门派: ${effect.sectId}`)
            }
          }
          break

        case 'leaveSect':
          {
            const { leaveSect } = useSect()
            const success = leaveSect()
            if (success) {
              console.log(`[Effect] 离开门派`)
            }
          }
          break

        default:
          console.warn(`[Effect] 未知的效果类型: ${(effect as any).type}`)
      }
    }
  }

  /**
   * 应用战斗胜利效果
   * @param battle 战斗内容
   */
  applyBattleWinEffects(battle: BattleContent): void {
    if (battle.onWin) {
      console.log('[StoryExecutor] 应用战斗胜利效果')
      this.applyEffects(battle.onWin)
    }
  }

  /**
   * 应用战斗失败效果
   * @param battle 战斗内容
   */
  applyBattleLoseEffects(battle: BattleContent): void {
    if (battle.onLose) {
      console.log('[StoryExecutor] 应用战斗失败效果')
      this.applyEffects(battle.onLose)
    }
  }
}

// 导出单例
export const storyExecutor = new StoryExecutor()

// Made with Bob
