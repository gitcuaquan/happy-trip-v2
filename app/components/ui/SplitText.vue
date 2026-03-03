<template>
  <div class="wrapper">
    <h2 ref="textRef" class="headline">{{ texts[index] }}</h2>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue"
import { gsap } from "gsap"
import SplitText from "gsap/SplitText"

gsap.registerPlugin(SplitText)

const texts = ["An Toàn", "Giá Rẻ", "Uy Tín"]
const index = ref(0)
const textRef = ref(null)

let splitInstance
let interval

const animateIn = async () => {
  await nextTick()

  splitInstance = new SplitText(textRef.value, {
    type: "chars"
  })

  gsap.from(splitInstance.chars, {
    y: 40,
    opacity: 0,
    duration: 0.6,
    stagger: 0.05,
    ease: "back.out(1.7)"
  })
}

const animateOut = () => {
  return gsap.to(splitInstance.chars, {
    y: -40,
    opacity: 0,
    duration: 0.4,
    stagger: 0.03,
    ease: "power2.in"
  })
}

const swapText = async () => {
  await animateOut()

  splitInstance.revert() // reset DOM

  index.value = (index.value + 1) % texts.length

  await animateIn()
}

onMounted(async () => {
  await animateIn()
  interval = setInterval(swapText, 2500)
})

onBeforeUnmount(() => {
  clearInterval(interval)
  splitInstance?.revert()
})
</script>

