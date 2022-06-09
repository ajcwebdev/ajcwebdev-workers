# Example Project from [A First Look at Cloudflare Workers](https://dev.to/ajcwebdev/a-first-look-at-cloudflare-workers-20km)

A [Cloudflare Worker](https://blog.cloudflare.com/introducing-cloudflare-workers/) contains JavaScript that runs on Cloudflare's edge servers. A [Cloudflare Service Worker](https://blog.cloudflare.com/cloudflare-workers-unleashed/) is a worker written against the Service Worker API and specifically handles HTTP traffic. Cloudflare Workers derive their name from Web Workers, specifically Service Workers.

The [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) is a W3C standard API for scripts that run in the background in a web browser and intercept HTTP requests. Cloudflare Workers are written against the same standard API but run on Cloudflare's edge network instead of the browser.

## Outline

* [Install the Wrangler CLI](#install-the-wrangler-cli)
  * [Install Wrangler with Volta](#install-wrangler-with-volta)
  * [Login to Cloudflare Account](#login-to-cloudflare-account)
* [Workers Project](#workers-project)
  * [Wrangler Configuration File](#wrangler-configuration-file)
  * [Workers Script](#workers-script)
  * [Test Worker Locally](#test-worker-locally)
* [Deploy Worker to Cloudflare](#deploy-worker-to-cloudflare)

## Install the Wrangler CLI

[`wrangler`](https://github.com/cloudflare/wrangler) is an officially supported CLI tool for [Cloudflare Workers](https://workers.cloudflare.com/).

### Install Wrangler with Volta

[Volta.sh](https://volta.sh/) is a JavaScript tool manager that can be used for global installs and switching between different versions of Node. It can be installed with the following `curl` command (and if you are not using `zsh` then change the end of the command to `bash`).

```bash
curl https://get.volta.sh | zsh
volta install node
npm install -g wrangler
```

Visit the [Workers documentation](https://developers.cloudflare.com/workers/wrangler/get-started/) if you encounter issues while trying to install Wrangler. Check the version number with the following command:

```bash
wrangler --version
```

> Note: In this article I used version `2.0.8`.

### Login to Cloudflare Account

```bash
wrangler login
```

## Workers Project

A Workers project can be very concise and the only files required are `index.js` and `wrangler.toml`.

### Wrangler Configuration File

`wrangler` uses a [`wrangler.toml` configuration file](https://developers.cloudflare.com/workers/wrangler/configuration/) to customize the development and publishing setup for a Worker.

```toml
# wrangler.toml

name = "ajcwebdev-workers"
main = "index.js"
compatibility_date = "2022-06-09"
```

This includes three configuration options:

* `name` sets the name of your Worker.
* `main` sets the entrypoint/path to the file that will be executed.
* `compatibility_date` is used to determine which version of the Workers runtime is used.

### Workers Script

`index.js` will contain the content of the Workers script. The script will notify the visitor of your website that you nailed it.

```javascript
// index.js

export default {
  async fetch(request) {
    return new Response("Nailed it!", {
      headers: { 'X-Awesomeness': '9000' }
    })
  }
}
```

We don't add header `X-Awesomeness` because we need to, we add it because we can. 

### Test Worker Locally

Start a local server for developing your Worker with [`wrangler dev`](https://developers.cloudflare.com/workers/wrangler/commands/#dev).

```bash
wrangler dev
```

Open [localhost:8787/](http://localhost:8787/) to see the response or use `curl` to send an HTTP GET method.

```bash
curl "http://localhost:8787/"
```

> Note: Add `-i` option to see header information.

## Deploy Worker to Cloudflare

`wrangler publish` publishes your Worker to Cloudflare.

```bash
wrangler publish
```

Output:

```
Uploaded ajcwebdev-workers (0.76 sec)
Published ajcwebdev-workers (0.20 sec)
  ajcwebdev-workers.anthonycampolo.workers.dev
```

```bash
curl "https://ajcwebdev-workers.anthonycampolo.workers.dev"
```

You can check out this amazing website yourself [here](https://ajcwebdev-workers.anthonycampolo.workers.dev/).