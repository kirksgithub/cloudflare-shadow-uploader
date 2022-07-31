# cloudflare-shadow-uploader

1. Setup a storage account and load it up with Shadow.

2. Use `wrangler secret put` to setup `PRIVATE_KEY` https://github.com/openchaindev/cloudflare-shadow-uploader/blob/5bf2559f1491e9986f3643bf9d5187f2c4eb75c6/src/index.ts#L75

3. Edit `Config.SHADOW_ACCOUNT` https://github.com/openchaindev/cloudflare-shadow-uploader/blob/5bf2559f1491e9986f3643bf9d5187f2c4eb75c6/src/Config.ts#L3 , can also be setup via `wrangler secret` if you prefer

4. Run `wrangler publish`


# Usage

1. `GET /` will return the `SHADOW_ACCOUNT` details, `storage-account-info` and `list-objects` https://github.com/openchaindev/cloudflare-shadow-uploader/blob/86b5d4185f242ad398bd207d88f8ce58744cf5bf/src/index.ts#L43-L47

2. `GET/${ARWEAVE_NAME}`

2.1. Will first try to fetch it from Shadow Drive https://github.com/openchaindev/cloudflare-shadow-uploader/blob/5bf2559f1491e9986f3643bf9d5187f2c4eb75c6/src/index.ts#L67-L73

2.2. If `2.1` doesn't find the file, get its content from `arweave` https://github.com/openchaindev/cloudflare-shadow-uploader/blob/5bf2559f1491e9986f3643bf9d5187f2c4eb75c6/src/index.ts#L78

2.3. Upload it to Shadow Drive https://github.com/openchaindev/cloudflare-shadow-uploader/blob/5bf2559f1491e9986f3643bf9d5187f2c4eb75c6/src/index.ts#L84

2.4. Fetch it from Shadow Drive and serve it https://github.com/openchaindev/cloudflare-shadow-uploader/blob/5bf2559f1491e9986f3643bf9d5187f2c4eb75c6/src/index.ts#L91

* Technically, can skip `2.4` and fetch `2.2` data to improve speed, but it's sort of a sanity check

* If file is already hosted on Shadow Drive , `2.1` will return its content early


