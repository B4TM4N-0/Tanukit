import axios from 'axios'

const ANILIST_API_URL = 'https://graphql.anilist.co'

export async function queryAnilist(query, variables = {}) {
  try {
    const response = await axios.post(ANILIST_API_URL, {
      query,
      variables
    })
    return response.data
  } catch (error) {
    console.error('Anilist API error:', error)
    throw error
  }
}