A [Cloudflare Worker](https://blog.cloudflare.com/introducing-cloudflare-workers/) is JavaScript you write that runs on Cloudflare's edge. A [Cloudflare Service Worker](https://blog.cloudflare.com/cloudflare-workers-unleashed/) is specifically a worker which handles HTTP traffic and is written against the Service Worker API. Cloudflare Workers derive their name from Web Workers, and more specifically Service Workers.

The [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) is a W3C standard API for scripts that run in the background in a web browser and intercept HTTP requests. Cloudflare Workers are written against the same standard API, but run on Cloudflare's server instead of in a browser.

## Install wrangler CLI

[`wrangler`](https://github.com/cloudflare/wrangler) is an officially supported CLI tool for [Cloudflare Workers](https://workers.cloudflare.com/). It's a bit of a process to install. I recommend starting at the [Wrangler CLI Install/Update page on the Cloudflare Documentation site](https://developers.cloudflare.com/workers/cli-wrangler/install-update) to see if any of the options listed are already configured on your machine. Use Cargo if you can.

### Install wrangler with nvm

*In theory*, you should be able to install `nvm` with `curl`, create a dot-file for your shell, and then include a script.

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | zsh
touch .zshrc
```

Add to `.zshrc` file.

```
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
```

Then I should be able to install the current Node LTS and finally `wrangler`.

```bash
nvm install 14.16.1
npm install -g @cloudflare/wrangler
```

### Install with cargo

Due to my own user error I ran into issues with `nvm`. I ended up finding a workaround with [`HomeBrew`](https://brew.sh/), [`cargo`](https://doc.rust-lang.org/cargo/getting-started/installation.html), and [`rustup`](https://rustup.rs/) that took about a minute to install and configure. M1 users may find this easier.

```bash
brew install cloudflare-wrangler
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
rustup target add x86_64-apple-darwin
cargo install wrangler --target=x86_64-apple-darwin
```

### Check version number

```bash
wrangler --version
```

Output:

```
👷 ✨  wrangler 1.16.1
```

## Create project

`wrangler generate` will scaffold a Cloudflare Workers project from a [public GitHub repository](https://github.com/cloudflare/worker-template).

```bash
wrangler generate ajcwebdev-workers
```

If you haven't already, make sure to [create a Cloudflare account](https://dash.cloudflare.com/). Go to your profile and then your [API tokens tab](https://dash.cloudflare.com/profile/api-tokens). Create a token with the Cloudflare Workers template.

![02-api-tokens](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/x4rd45ul02kpd1rk5ld3.png)

Click "Create Token" to create a token.

![03-create-api-token](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/reedsh9s4z3nsj5kqr6c.png)

Click "Use template" next to Edit Cloudflare Workers to use Edit Cloudflare Workers template.

![04-create-token](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/co5ficwdni1e09eosnqh.png)

Leave the default permissions and add your account and zone resources.

![05-api-token-summary](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/sj2s68a5t2o0zul1nprc.png)

Click "Create Token" to create the token and make sure to save it somewhere you can find it.

### Test your token

You can test your new token with the following `curl` command.

```curl
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type:application/json"
```

If your token is working you will receive a response like this.

```json
{
  "result":{
    "id":"1234",
    "status":"active"
  },
  "success":true,
  "errors":[],
  "messages":[{
    "code":10000,
    "message":"This API Token is valid and active",
    "type":null
  }]
}
```

### Add account_id to wrangler.toml

Copy your `account_id` from your Workers dashboard.

![06-account-id](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/wx33uzdsnsajtwfzfbsp.png)

Open `wrangler.toml` and add your `account_id`.

```toml
name = "ajcwebdev-workers"
type = "javascript"

account_id = "c64"
workers_dev = true
route = ""
zone_id = ""
```

### Configure keys with `wrangler config`

`wrangler config` is an interactive command that will authenticate Wrangler by prompting you for a Cloudflare API Token or Global API key. If you want to use the Global API Key it will promptly yell at you for making poor life decision.

```bash
wrangler config
```

Enter your API token.

```
Validating credentials...
Successfully configured.
You can find your configuration file at:
/Users/ajcwebdev/.wrangler/config/default.toml
```

If you run into issues with your keys you may be able to just use `wrangler login` instead. 🤷‍♂️

```bash
wrangler login
```

## Project files

### package.json

You may notice that we don't have any dev or build scripts. There aren't even any dependencies except the entirely useless prettier.

```json
{
  "private": true,
  "name": "ajcwebdev-workers",
  "version": "1.0.0",
  "description": "A template for kick starting a Cloudflare Workers project",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "format": "prettier --write '**/*.{js,css,json,md}'"
  },
  "author": "ajcwebdev <anthony@stepzen.com>",
  "license": "MIT",
  "devDependencies": {
    "prettier": "^1.18.2"
  }
}
```

This is because Cloudflare Workers run in the cloud, and as we all know, [the cloud is just someone else's computer](https://medium.com/@storjproject/there-is-no-cloud-it-s-just-someone-else-s-computer-6ecc37cdcfe5). To run this code we need to deploy it and execute it on Cloudflare's network.

### index.js

`index.js` is the content of the Workers script. The content will notify the user of your website that you nailed it.

```javascript
addEventListener('fetch', event => {
  event.respondWith(
    handleRequest(event.request)
  )
})

async function handleRequest(request) {
  return new Response('Nailed it', {
    headers: {
      'content-type': 'text/plain',
      'X-Awesomeness': '9000'
    },
  })
}
```

We don't add header `X-Awesomeness` because we need to, we add it because we can.

## Deploy with `wrangler publish`

`wrangler publish` publishes your Worker to Cloudflare.

```bash
wrangler publish
```

Open up your favorite API client and make a GET request to your endpoint.

![07-insomnia-request](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/kjm39zouurqqedcfxz82.png)

You can also visit the endpoint with your browser of choice.

![08-browser-request](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/6b503pfgqlau3bvn99xx.png)

Open up the Network tab to see how much more awesome your response headers are.

![09-response-headers](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/b2g1kvq0sti966h0avjj.png)

You can check out this amazing website yourself [here](https://ajcwebdev-workers.anthonycampolo.workers.dev/).
