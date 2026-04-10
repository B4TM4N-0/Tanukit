<template>
  <div class="recent-anime max-w-screen-xl px-5 py-5 mx-auto">
    <template v-if="isLoading">
      <VSpinner />
    </template>
    <template v-else>
      <div class="flex">
        <h1 class="text-xl py-5">Recent Anime</h1>
      </div>
      <div
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-2 animated"
        :class="{ 'animated-fade-in': !isLoading }"
      >
        <RouterLink
          :to="'/anime/' + anime.id"
          v-for="anime in animeList"
          :key="anime.id"
          class="card border border-dark-50 rounded-lg relative overflow-hidden group"
        >
          <div class="relative">
            <img
              :src="anime.coverImage.large"
              :alt="anime.title.english || anime.title.romaji"
              draggable="false"
              class="w-full h-60 md:h-80 object-cover transition-opacity duration-300"
            />
            <div
              class="absolute h-[102%] inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300"
            ></div>
          </div>
          <div
            class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:animated hover:animated-fade-in"
          >
            <div i-carbon-play-filled class="text-white text-7xl" style="margin-top: -1em" />
          </div>
          <div class="p-4">
            <h3 class="font-semibold truncate">
              {{ anime.title.english || anime.title.romaji }}
            </h3>
            <p class="text-sm">Status: {{ anime.status }}</p>
            <p class="text-sm text-orange-300">{{ anime.seasonYear }}</p>
          </div>
        </RouterLink>
      </div>
    </template>
  </div>
</template>

<script>
import { queryAnilist } from '@/utils/anilist'

export default {
  data() {
    return {
      animeList: [],
      isLoading: false,
      page: 1,
      totalPages: null
    }
  },
  async created() {
    try {
      this.isLoading = true
      const recentQuery = `
        query ($page: Int, $perPage: Int) {
          Page(page: $page, perPage: $perPage) {
            media(sort: START_DATE_DESC, type: ANIME) {
              id
              title {
                romaji
                english
                native
              }
              coverImage {
                large
              }
              description
              episodes
              status
              season
              seasonYear
              genres
              averageScore
              popularity
            }
            pageInfo {
              total
              perPage
              currentPage
              lastPage
              hasNextPage
            }
          }
        }
      `
      const variables = { page: 1, perPage: 48 }
      const response = await queryAnilist(recentQuery, variables)
      this.animeList = response.data.Page.media
      this.totalPages = response.data.Page.pageInfo.lastPage
    } catch (err) {
      console.error(err.message)
    } finally {
      this.isLoading = false
    }
  },
  methods: {
    async fetchAnimeList() {
      try {
        this.isLoading = true
        const recentQuery = `
          query ($page: Int, $perPage: Int) {
            Page(page: $page, perPage: $perPage) {
              media(sort: START_DATE_DESC, type: ANIME) {
                id
                title {
                  romaji
                  english
                  native
                }
                coverImage {
                  large
                }
                description
                episodes
                status
                season
                seasonYear
                genres
                averageScore
                popularity
              }
              pageInfo {
                total
                perPage
                currentPage
                lastPage
                hasNextPage
              }
            }
          }
        `
        const variables = { page: this.page, perPage: 48 }
        const response = await queryAnilist(recentQuery, variables)
        this.animeList = response.data.Page.media
        this.totalPages = response.data.Page.pageInfo.lastPage
      } catch (err) {
        console.error(err.message)
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>
