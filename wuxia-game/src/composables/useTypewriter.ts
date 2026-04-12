import { ref, onUnmounted } from 'vue'

export function useTypewriter() {
  const displayedText = ref('')
  const isTyping = ref(false)
  let timer: ReturnType<typeof setTimeout> | null = null
  let resolveCallback: (() => void) | null = null

  function typeText(text: string, speed: number = 40): Promise<void> {
    return new Promise((resolve) => {
      // Clear previous
      if (timer) clearTimeout(timer)
      displayedText.value = ''
      isTyping.value = true
      resolveCallback = resolve

      let i = 0
      function nextChar() {
        if (i < text.length) {
          displayedText.value += text[i]
          i++
          timer = setTimeout(nextChar, speed)
        } else {
          isTyping.value = false
          resolve()
          resolveCallback = null
        }
      }
      nextChar()
    })
  }

  function skipTyping(fullText: string) {
    if (timer) clearTimeout(timer)
    displayedText.value = fullText
    isTyping.value = false
    if (resolveCallback) {
      resolveCallback()
      resolveCallback = null
    }
  }

  function reset() {
    if (timer) clearTimeout(timer)
    displayedText.value = ''
    isTyping.value = false
    resolveCallback = null
  }

  onUnmounted(() => {
    if (timer) clearTimeout(timer)
  })

  return { displayedText, isTyping, typeText, skipTyping, reset }
}
