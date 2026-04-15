import type { StoryData } from '@/types'

/**
 * 剧情加载器
 * 负责加载、缓存和管理剧情数据
 */
export class StoryLoader {
  private cache = new Map<string, StoryData>()
  private loading = new Map<string, Promise<StoryData>>()

  /**
   * 加载剧情数据
   * @param storyId 剧情ID
   * @returns 剧情数据
   */
  async load(storyId: string): Promise<StoryData> {
    // 检查缓存
    if (this.cache.has(storyId)) {
      return this.cache.get(storyId)!
    }

    // 检查是否正在加载
    if (this.loading.has(storyId)) {
      return this.loading.get(storyId)!
    }

    // 开始加载
    const loadPromise = this.loadFromFile(storyId)
    this.loading.set(storyId, loadPromise)

    try {
      const story = await loadPromise
      this.cache.set(storyId, story)
      return story
    } finally {
      this.loading.delete(storyId)
    }
  }

  /**
   * 从文件加载剧情数据
   * @param storyId 剧情ID
   */
  private async loadFromFile(storyId: string): Promise<StoryData> {
    try {
      // 动态导入剧情文件
      const module = await import(`@/data/stories/${storyId}.json`)
      const story = module.default as StoryData

      // 验证数据
      this.validateStory(story)

      return story
    } catch (error) {
      console.error(`Failed to load story: ${storyId}`, error)
      throw new Error(`剧情文件加载失败: ${storyId}`)
    }
  }

  /**
   * 验证剧情数据
   * @param story 剧情数据
   */
  private validateStory(story: StoryData): void {
    if (!story.id) {
      throw new Error('剧情数据缺少 id 字段')
    }
    if (!story.type) {
      throw new Error('剧情数据缺少 type 字段')
    }
    if (!story.content) {
      throw new Error('剧情数据缺少 content 字段')
    }

    // 根据类型验证内容
    switch (story.type) {
      case 'dialog':
        if (!story.content.dialog) {
          throw new Error('对话型剧情缺少 dialog 内容')
        }
        break
      case 'event':
        if (!story.content.event) {
          throw new Error('事件型剧情缺少 event 内容')
        }
        break
      case 'battle':
        if (!story.content.battle) {
          throw new Error('战斗型剧情缺少 battle 内容')
        }
        break
      case 'cutscene':
        if (!story.content.cutscene) {
          throw new Error('过场动画缺少 cutscene 内容')
        }
        break
    }
  }

  /**
   * 预加载多个剧情
   * @param storyIds 剧情ID数组
   */
  async preload(storyIds: string[]): Promise<void> {
    await Promise.all(storyIds.map(id => this.load(id)))
  }

  /**
   * 检查剧情是否已缓存
   * @param storyId 剧情ID
   */
  isCached(storyId: string): boolean {
    return this.cache.has(storyId)
  }

  /**
   * 清除缓存
   * @param storyId 可选，指定要清除的剧情ID，不指定则清除全部
   */
  clearCache(storyId?: string): void {
    if (storyId) {
      this.cache.delete(storyId)
    } else {
      this.cache.clear()
    }
  }

  /**
   * 获取缓存大小
   */
  getCacheSize(): number {
    return this.cache.size
  }

  /**
   * 获取所有已缓存的剧情ID
   */
  getCachedStoryIds(): string[] {
    return Array.from(this.cache.keys())
  }
}

// 导出单例
export const storyLoader = new StoryLoader()

// Made with Bob
