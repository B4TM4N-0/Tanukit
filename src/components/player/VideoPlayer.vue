<template>
  <div class="relative w-full bg-black group" ref="playerWrapper">
    <video
      ref="videoEl"
      class="w-full h-60 md:h-140 block"
      :poster="poster"
      @click="togglePlay"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onMetadata"
      @ended="onEnded"
      @waiting="onBuffering"
      @playing="onPlaying"
    ></video>

    <div v-if="buffering" class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div class="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div
      class="absolute inset-0 flex items-center justify-center pointer-events-none"
      v-if="!playing && !buffering"
    >
      <div class="w-16 h-16 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
        <div i-carbon-play-filled class="text-white text-4xl ml-1"></div>
      </div>
    </div>

    <div
      class="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      style="background: linear-gradient(to top, rgba(0,0,0,0.85), transparent)"
    >
      <div
        class="w-full h-1 bg-white bg-opacity-30 rounded cursor-pointer mb-3 relative"
        ref="progressBar"
        @click="seek"
      >
        <div
          class="h-full bg-orange-400 rounded pointer-events-none"
          :style="{ width: progressPercent + '%' }"
        ></div>
        <div
          class="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-orange-400 rounded-full pointer-events-none"
          :style="{ left: progressPercent + '%', transform: 'translateX(-50%) translateY(-50%)' }"
        ></div>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button @click="togglePlay" class="text-white hover:text-orange-400 transition-colors">
            <div :class="playing ? 'i-carbon-pause-filled' : 'i-carbon-play-filled'" class="text-xl"></div>
          </button>

          <button @click="skip(-10)" class="text-white hover:text-orange-400 transition-colors">
            <div i-carbon-skip-back class="text-xl"></div>
          </button>

          <button @click="skip(10)" class="text-white hover:text-orange-400 transition-colors">
            <div i-carbon-skip-forward class="text-xl"></div>
          </button>

          <div class="flex items-center gap-2">
            <button @click="toggleMute" class="text-white hover:text-orange-400 transition-colors">
              <div :class="muted ? 'i-carbon-volume-mute' : 'i-carbon-volume-up'" class="text-xl"></div>
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              :value="volume"
              @input="setVolume"
              class="w-16 accent-orange-400"
            />
          </div>

          <span class="text-white text-xs">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
        </div>

        <div class="flex items-center gap-3">
          <button @click="toggleFullscreen" class="text-white hover:text-orange-400 transition-colors">
            <div :class="fullscreen ? 'i-carbon-minimize' : 'i-carbon-maximize'" class="text-xl"></div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Hls from 'hls.js'

export default {
  props: {
    src: {
      type: String,
      default: ''
    },
    poster: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      hls: null,
      playing: false,
      buffering: false,
      muted: false,
      volume: 1,
      currentTime: 0,
      duration: 0,
      progressPercent: 0,
      fullscreen: false
    }
  },
  watch: {
    src(val) {
      if (val) this.loadSource(val)
    }
  },
  mounted() {
    document.addEventListener('fullscreenchange', this.onFullscreenChange)
    document.addEventListener('keydown', this.onKeyDown)
  },
  beforeUnmount() {
    if (this.hls) this.hls.destroy()
    document.removeEventListener('fullscreenchange', this.onFullscreenChange)
    document.removeEventListener('keydown', this.onKeyDown)
  },
  methods: {
    loadSource(url) {
      const video = this.$refs.videoEl
      if (!video || !url) return

      if (Hls.isSupported()) {
        if (this.hls) this.hls.destroy()

        this.hls = new Hls()

        this.hls.loadSource(url)
        this.hls.attachMedia(video)

        this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play()
        })

        this.hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.error('Fatal HLS error:', data)
          }
        })
      } else {
        video.src = url
      }
    },
    togglePlay() {
      const video = this.$refs.videoEl
      if (!video) return
      video.paused ? video.play() : video.pause()
    },
    skip(seconds) {
      const video = this.$refs.videoEl
      if (!video) return
      video.currentTime = Math.min(Math.max(video.currentTime + seconds, 0), video.duration)
    },
    seek(event) {
      const video = this.$refs.videoEl
      const bar = this.$refs.progressBar
      if (!video || !bar) return
      const rect = bar.getBoundingClientRect()
      const ratio = (event.clientX - rect.left) / rect.width
      video.currentTime = ratio * video.duration
    },
    toggleMute() {
      const video = this.$refs.videoEl
      if (!video) return
      video.muted = !video.muted
      this.muted = video.muted
    },
    setVolume(event) {
      const video = this.$refs.videoEl
      if (!video) return
      video.volume = parseFloat(event.target.value)
      this.volume = video.volume
      this.muted = video.volume === 0
    },
    toggleFullscreen() {
      const wrapper = this.$refs.playerWrapper
      if (!document.fullscreenElement) {
        wrapper.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
    },
    onFullscreenChange() {
      this.fullscreen = !!document.fullscreenElement
    },
    onTimeUpdate() {
      const video = this.$refs.videoEl
      if (!video) return
      this.currentTime = video.currentTime
      this.progressPercent = video.duration ? (video.currentTime / video.duration) * 100 : 0
    },
    onMetadata() {
      const video = this.$refs.videoEl
      if (!video) return
      this.duration = video.duration
    },
    onEnded() {
      this.playing = false
    },
    onBuffering() {
      this.buffering = true
    },
    onPlaying() {
      this.playing = true
      this.buffering = false
    },
    onKeyDown(event) {
      if (event.keyCode === 37) this.skip(-5)
      else if (event.keyCode === 39) this.skip(5)
      else if (event.keyCode === 32) {
        event.preventDefault()
        this.togglePlay()
      }
    },
    formatTime(seconds) {
      if (!seconds || isNaN(seconds)) return '0:00'
      const m = Math.floor(seconds / 60)
      const s = Math.floor(seconds % 60).toString().padStart(2, '0')
      return `${m}:${s}`
    }
  }
}
</script>
