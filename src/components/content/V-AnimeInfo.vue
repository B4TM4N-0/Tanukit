<template>
  <div class="container mx-auto">
    <template v-if="isLoading">
      <VSpinner />
    </template>
    <template v-else-if="anime">
      <div class="max-w-screen-2xl mx-auto p-6">
        <nav class="flex py-5" aria-label="Breadcrumb">
          <ol class="inline-flex items-center">
            <li class="inline-flex items-center">
              <div class="flex items-center">
                <RouterLink to="/">
                  <p class="text-xs hover:underline hover:text-orange-200">Home</p>
                </RouterLink>
              </div>
            </li>
            <li>
              <div class="flex items-center">
                <div i-carbon-chevron-right class="text-sm mx-1" />
                <RouterLink to="/home">
                  <p class="text-xs hover:underline hover:text-orange-200">Anime</p>
                </RouterLink>
              </div>
            </li>
            <li aria-current="page">
              <div class="flex items-center">
                <div i-carbon-chevron-right class="text-sm mx-1" />
                <p class="text-xs">{{ anime.title?.english || anime.title?.userPreferred || anime.title?.romaji }}</p>
              </div>
            </li>
          </ol>
        </nav>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-3 animated animated-fade-in">
          <div class="col-span-1 md:col-span-2 overflow-hidden">
            <div class="relative w-full">
              <div v-if="anime.type === 'MUSIC'" class="video-container">
                <iframe
                  class="w-full h-60 md:h-140"
                  :src="`https://www.youtube.com/embed/${anime.trailer.id}?autoplay=0&controls=1&showinfo=0&rel=0&modestbranding=1&loop=0&fs=0&playsinline=1&mute=0&playlist=${anime.trailer.id}`"
                  frameborder="1"
                  allowfullscreen
                ></iframe>
              </div>
              <div v-else>
                <VideoPlayer :src="streamUrl" :poster="anime.coverImage?.large" />
              </div>
            </div>

            <div v-if="anime.type !== 'MUSIC'" class="flex items-center py-3 pt-2">
              <div class="flex items-center">
                <span class="mr-1 text-sm">Episodes</span>
                <select
                  v-model="selectedRange"
                  class="btn px-2 py-1 mr-2 border border-dark-300"
                >
                  <option v-if="episodeRanges.length === 0" value="0">0</option>
                  <option v-else v-for="range in episodeRanges" :key="range" :value="range">
                    {{ range }}
                  </option>
                </select>
              </div>
              <div class="flex">
                <button
                  class="btn text-xs flex items-center border border-dark-300 mr-1"
                  @click="selectPreviousEpisode"
                >
                  <div i-mdi-skip-backward class="text-sm mr-2" />
                  <span class="uppercase">Previous</span>
                </button>
                <button
                  class="btn text-xs flex items-center border border-dark-300 ml-1"
                  @click="selectNextEpisode"
                >
                  <div i-mdi-skip-forward class="text-sm mr-2" />
                  <span class="uppercase">Next</span>
                </button>
              </div>
            </div>

            <div v-if="anime.type !== 'MUSIC'" class="grid grid-cols-6 md:grid-cols-9 lg:grid-cols-11 xl:grid-cols-12 gap-1 px-5">
              <div
                v-for="(episode, index) in displayedEpisodes"
                :key="index"
                :class="[
                  'text-xs',
                  'text-center',
                  'bg-dark-200',
                  'p-1.5',
                  'border',
                  'border-dark-100',
                  'hover:bg-dark-50',
                  'cursor-pointer',
                  { 'active-episode': episode === activeEpisode }
                ]"
                @click="selectEpisode(episode)"
              >
                <p>{{ episode.number }}</p>
              </div>
            </div>

            <div class="py-5">
              <div
                v-if="filteredRelations.length > 0"
                class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
              >
                <RouterLink
                  :to="'/anime/' + relation.node.id"
                  v-for="(relation, index) in filteredRelations"
                  :key="index"
                  class="btn relative group border border-dark-300"
                >
                  <img
                    :src="relation.node.coverImage?.large"
                    draggable="false"
                    class="w-full h-10 object-cover opacity-10"
                    alt="Anime Cover"
                  />
                  <div class="absolute inset-0 flex items-center justify-center text-center">
                    <p class="text-sm font-semibold">{{ relation.relationType }}</p>
                  </div>
                </RouterLink>
              </div>
            </div>
          </div>

          <div class="col-span-1 container">
            <div class="flex-col md:flex-row lg:items-start">
              <div class="items-center justify-center mx-auto text-center">
                <img
                  :src="anime.coverImage?.large"
                  draggable="false"
                  class="w-75 pt-5 object-cover mb-4 md:mr-4 px-2"
                />
              </div>
              <div class="w-full">
                <div class="flex items-center">
                  <h1 class="text-2xl font-bold mr-2 w-80">
                    {{ anime.title?.english || anime.title?.userPreferred || anime.title?.romaji }}
                  </h1>
                </div>
                <div class="description-container w-75 mb-4">
                  <p
                    class="text-sm"
                    :class="{ truncate: !showFullDescription }"
                    v-html="parseDescription(anime.description)"
                  ></p>
                </div>
                <div class="mb-4">
                  <span
                    v-if="anime.description && anime.description.length > 150 && !showFullDescription"
                    class="font-bold cursor-pointer hover:underline"
                    @click="showFullDescription = true"
                    >View more</span
                  >
                  <span
                    v-if="showFullDescription"
                    class="font-bold cursor-pointer hover:underline"
                    @click="showFullDescription = false"
                    >View less</span
                  >
                </div>
                <div class="items-center">
                  <div class="flex items-center mb-2">
                    <div i-openmoji-star class="mr-1 py-2"></div>
                    <span>{{ anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A' }}</span>
                  </div>
                  <p class="text-sm mr-2">Studio: {{ anime.studios?.nodes[0]?.name || 'N/A' }}</p>
                  <div>
                    <p class="text-sm mr-2">
                      Type:
                      <RouterLink
                        class="hover:underline hover:text-orange-300"
                        :to="'/type/' + anime.type"
                        >{{ anime.type }}</RouterLink
                      >
                    </p>
                  </div>
                  <p class="text-sm mr-2">Alternate Title: {{ anime.title?.native || anime.title?.romaji }}</p>
                  <p class="text-sm mr-2">Status: {{ anime.status }}</p>
                  <p class="text-sm mr-2">Country: {{ anime.countryOfOrigin }}</p>
                  <div class="text-sm mr-2 flex items-center">
                    <span>Genres:</span>
                    <p v-for="(genre, index) in anime.genres" :key="index">
                      <RouterLink
                        :to="`/genre/${genre}`"
                        class="ml-1 hover:underline hover:text-orange-300"
                        >{{ genre }}</RouterLink
                      >
                      <span v-if="index !== anime.genres.length - 1" class="mr-1">,</span>
                    </p>
                  </div>
                  <p class="text-sm mr-2">Premiered: {{ anime.season }} {{ anime.seasonYear }}</p>
                  <p class="text-sm mr-2">
                    Date Aired: {{ anime.startDate?.year }}-{{ anime.startDate?.month }}-{{ anime.startDate?.day }}
                  </p>
                  <p class="text-sm mr-2">
                    Date Ended: {{ anime.endDate?.year }}-{{ anime.endDate?.month }}-{{ anime.endDate?.day }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <span class="text-lg">You may also like</span>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-2 animated mt-5">
          <RouterLink
            :to="'/anime/' + recommendation.mediaRecommendation.id"
            v-for="recommendation in anime.recommendations.nodes.slice(0, 6)"
            :key="recommendation.mediaRecommendation.id"
            class="card border border-dark-50 rounded-lg relative overflow-hidden group"
          >
            <div class="relative">
              <img
                :src="recommendation.mediaRecommendation.coverImage?.large"
                :alt="recommendation.mediaRecommendation.title?.userPreferred"
                draggable="false"
                class="w-full h-60 md:h-80 object-cover transition-opacity duration-300"
              />
              <div class="absolute h-[102%] inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            </div>
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:animated hover:animated-fade-in">
              <div i-carbon-play-filled class="text-white text-7xl" style="margin-top: -1em"></div>
            </div>
            <div class="p-4">
              <h3 class="font-semibold truncate">
                {{ recommendation.mediaRecommendation.title?.userPreferred || recommendation.mediaRecommendation.title?.english }}
              </h3>
              <p class="text-sm">Type: {{ recommendation.mediaRecommendation.type }}</p>
              <div class="flex items-center">
                <div i-openmoji-star class="mr-1 py-2" />
                <span>{{ recommendation.mediaRecommendation.averageScore ? (recommendation.mediaRecommendation.averageScore / 10).toFixed(1) : 'N/A' }}</span>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>
    </template>
    <template v-else>
      <V-InternalServer />
    </template>
  </div>
</template>

<script>
import axios from 'axios'
import { queryAnilist } from '@/utils/anilist'
import VideoPlayer from '@/components/player/VideoPlayer.vue'

const PAHE_API = 'https://lunapaheapi.vercel.app'

export default {
  components: { VideoPlayer },
  data() {
    return {
      isLoading: true,
      anime: null,
      paheSession: null,
      paheEpisodes: [],
      selectedRange: '1-100',
      perPage: 100,
      showFullDescription: false,
      activeEpisode: null,
      streamUrl: ''
    }
  },
  computed: {
    filteredRelations() {
      return (this.anime.relations?.edges || []).filter(
        (edge) => edge.relationType === 'PREQUEL' || edge.relationType === 'SEQUEL'
      )
    },
    displayedEpisodes() {
      if (this.paheEpisodes.length > 0) {
        const [start, end] = this.selectedRange.split('-').map(Number)
        return this.paheEpisodes.slice(start - 1, end)
      }
      return []
    },
    episodeRanges() {
      if (this.paheEpisodes.length > 0) {
        const total = this.paheEpisodes.length
        const rangeCount = Math.ceil(total / this.perPage)
        return Array.from({ length: rangeCount }, (_, i) => {
          const start = i * this.perPage + 1
          const end = Math.min((i + 1) * this.perPage, total)
          return `${start}-${end}`
        })
      }
      return []
    }
  },
  watch: {
    '$route.params.id': {
      handler: 'loadPage',
      immediate: true
    }
  },
  methods: {
    findSelectedIndex() {
      return this.displayedEpisodes.findIndex(
        (episode) => episode.number === this.activeEpisode?.number
      )
    },
    selectPreviousEpisode() {
      const idx = this.findSelectedIndex()
      if (idx > 0) this.selectEpisode(this.displayedEpisodes[idx - 1])
    },
    selectNextEpisode() {
      const idx = this.findSelectedIndex()
      if (idx !== -1 && idx < this.displayedEpisodes.length - 1) {
        this.selectEpisode(this.displayedEpisodes[idx + 1])
      }
    },
    parseDescription(description) {
      if (!description) return ''
      const parser = new DOMParser()
      const doc = parser.parseFromString(description, 'text/html')
      return doc.body.innerHTML
    },
    async loadPage() {
      this.isLoading = true
      this.anime = null
      this.paheEpisodes = []
      this.paheSession = null
      this.activeEpisode = null
      this.streamUrl = ''

      const id = this.$route.params.id

      try {
        const infoQuery = `
          query ($id: Int) {
            Media(id: $id, type: ANIME) {
              id
              type
              title { romaji english native userPreferred }
              coverImage { large extraLarge }
              bannerImage
              trailer { id site }
              description
              episodes
              status
              season
              seasonYear
              startDate { year month day }
              endDate { year month day }
              genres
              averageScore
              countryOfOrigin
              studios { nodes { name } }
              relations {
                edges {
                  relationType
                  node {
                    id
                    title { romaji english }
                    coverImage { large }
                    type
                  }
                }
              }
              recommendations {
                nodes {
                  mediaRecommendation {
                    id
                    title { romaji english userPreferred }
                    coverImage { large }
                    type
                    averageScore
                  }
                }
              }
            }
          }
        `
        const response = await queryAnilist(infoQuery, { id: parseInt(id) })
        this.anime = response.data.Media
      } catch (err) {
        console.error(err)
        this.isLoading = false
        return
      }

      this.isLoading = false

      try {
        const title = this.anime.title?.english || this.anime.title?.romaji
        const searchRes = await axios.get(`${PAHE_API}/search?q=${encodeURIComponent(title)}`)
        if (!searchRes.data.length) return

        this.paheSession = searchRes.data[0].session
        const epRes = await axios.get(`${PAHE_API}/episodes?session=${this.paheSession}`)
        this.paheEpisodes = epRes.data

        if (this.episodeRanges.length > 0) this.selectedRange = this.episodeRanges[0]
        if (this.paheEpisodes.length > 0) this.selectEpisode(this.paheEpisodes[0])
      } catch (err) {
        console.error(err)
      }
    },
    async selectEpisode(episode) {
      this.activeEpisode = episode
      try {
        const srcRes = await axios.get(
          `${PAHE_API}/sources?anime_session=${this.paheSession}&episode_session=${episode.session}`
        )
        const source =
          srcRes.data.find((s) => s.quality === '1080p') ||
          srcRes.data.find((s) => s.quality === '720p') ||
          srcRes.data[0]

        const m3u8Res = await axios.get(
          `${PAHE_API}/m3u8?url=${encodeURIComponent(source.url)}`
        )

        this.streamUrl = `${PAHE_API}${m3u8Res.data.proxy_url}`
      } catch (err) {
        console.error(err)
      }
    },
    goToRecommendation(id) {
      this.$router.push(`/anime/${id}`)
      window.scrollTo(0, 0)
    }
  }
}
</script>

<style scoped>
.active-episode {
  background-color: rgba(34, 34, 34, var(--un-bg-opacity));
  color: rgba(254, 215, 170);
}

.truncate {
  max-height: 150px;
  overflow: hidden;
  position: relative;
}

.truncate::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  background: linear-gradient(to right, rgba(255, 255, 255, 0), white 80%);
  pointer-events: none;
}

.description-container {
  max-height: 250px;
  overflow-y: auto;
  position: relative;
}
</style>
