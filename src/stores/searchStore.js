import { defineStore } from 'pinia'
import { queryAnilist } from '@/utils/anilist'

export const useSearchStore = defineStore({
  id: 'search',
  state: () => ({
    isOpen: false,
    searchQuery: '',
    searchResults: []
  }),
  actions: {
    async handleSearch(query) {
      try {
        const searchQuery = `
          query ($search: String, $page: Int, $perPage: Int) {
            Page(page: $page, perPage: $perPage) {
              media(search: $search, type: ANIME) {
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
        const variables = {
          search: query,
          page: 1,
          perPage: 10
        }
        const response = await queryAnilist(searchQuery, variables)
        this.searchResults = response.data.Page.media
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    },
    closeDropdown() {
      this.searchResults = []
    },
    handleResultClick() {
      this.searchQuery = ''
      this.closeDropdown()
    }
  }
})
