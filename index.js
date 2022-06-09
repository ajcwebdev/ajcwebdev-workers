export default {
    async fetch(request) {
      return new Response("Nailed it!", {
        headers: { 'X-Awesomeness': '9000' }
      })
    }
  }