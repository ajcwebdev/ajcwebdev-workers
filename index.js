addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

 async function handleRequest(request) {
  return new Response('Nailed it', {
    headers: {
      'content-type': 'text/plain',
      'X-Awesomeness': '9000'
    },
  })
}