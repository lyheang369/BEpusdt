**❗️Author statement: This is an open-source project for researching and learning blockchain technology. It does not provide any paid services of any kind (beware of scams), does not encourage any derivative financial trading activity, and the author is not responsible for any third-party behavior involving this project. If you encounter issues during use, please open an `issue` or discuss it in the community group. Please respect the open-source project.**

---

# BEpusdt (Better Easy Payment USDT)

<p align="center">
<img src="./static/payment/assets/img/tether.svg" width="15%" alt="tether">
</p>
<p align="center">
<a href="https://www.gnu.org/licenses/gpl-3.0.html">
    <img src="https://img.shields.io/github/license/v03413/bepusdt" alt="license GPLV3">
</a>
<a href="https://github.com/v03413/bepusdt">
  <img src="https://img.shields.io/github/v/release/v03413/bepusdt" alt="GitHub Release">
</a>
<a href="https://github.com/v03413/bepusdt">
  <img src="https://img.shields.io/github/downloads/v03413/bepusdt/total" alt="GitHub Release">
</a>
<a href="https://hub.docker.com/r/v03413/bepusdt">
    <img src="https://img.shields.io/docker/pulls/v03413/bepusdt?style=flat-square&logo=docker" alt="Docker Pulls">
</a>
<a href="https://github.com/gin-gonic/gin">
    <img src="https://img.shields.io/github/stars/v03413/bepusdt?style=flat-square&logo=github" alt="GitHub Stars">
</a>
</p>

## 🪧 Introduction

BEpusdt started from `Epusdt`, but goes beyond it with new features. It aims to be a better personal `cryptocurrency` payment gateway.

## 🎉 Features

### 🌟 Currently Supported Payment Networks

🔥 Mainstream networks: TRON Ethereum BSC Polygon<br>
⚡ Other networks: X-Layer Solana Aptos Arbitrum-One Base [full list](./docs/trade-type.md)

- ✅ Fully compatible with `Epusdt` plugins for seamless replacement
- ✅ Supports mainstream blockchain networks, not limited to `USDT`
- ✅ Supports mainstream fiat currencies with automatic exchange-rate updates
- ✅ Lightweight dependencies and a single binary for easy deployment
- ✅ Supports non-order transaction monitoring and balance-change notifications
- ✅ Supports custom payment precision and increment granularity
- ✅ Stable low-level block scanning with secure confirmations
- ✅ Supports real-time monitoring for TRON energy delegation and reclaiming
- ✅ Natively compatible with `EasyPay` payment collection for easy integration
- ✅ Complete standalone web admin panel for configuration management
- ✅ Cashier supports Chinese and English for international business needs
- ✅ Address-exclusive mode supports variable-amount payments at the low level
- ✅ Supports MQTT message publishing for real-time transaction broadcasts
- ✅ Rapidly iterating with many practical features waiting to be discovered

## 🚀 Quick Start

Quick start with Docker. After running the command, open `http://SERVER_IP:8080` to view the initial page.

```bash  
docker run -d --restart=unless-stopped -p 8080:8080 v03413/bepusdt:latest
```
## 📃 Technical Documentation

- Installation: [Docker](docs/docker/docker.md) [Linux](docs/linux/install.md) [1Panel](./docs/1panel/README.md) [aaPanel](./docs/bt_panel/README.md)
- Development: [API integration](docs/api/api.md) [order callback](docs/notify/readme.md) [Python](https://github.com/luoyanglang/bepusdt-python-sdk) [PHP](https://github.com/v03413/bepusdt-php-sdk)
- Integrations: [Dujiao Next](docs/api/dujiao-next/dujiao-next.md) [Caihong EasyPay](https://github.com/v03413/Epay-BEpusdt) [WHMCS](https://github.com/v03413/whmcs-gateway-epusdt) [EdgeKey](docs/api/edge-key/edge-key.md) [Other](docs/api/other.md)
- Other: [HTTPS configuration](./docs/ssl.md) [time synchronization](docs/linux/systemd-timesyncd.md) [cashier customization](docs/payment-template/README.md)

## 🖼 Screenshots

| Cashier                                            | Admin Orders                                      | Telegram Notification                                      |
|-------------------------------------------------|--------------------------------------------------|--------------------------------------------------------|
| <img src=./docs/images/1.png alt=cashier width=300> | <img src=./docs/images/2.png alt=admin-orders width=300> | <img src=./docs/images/3.png alt=telegram-notification width=300> |

## ❓ FAQ

- [Recommended server configuration and performance sizing ⚡️](./docs/faq/server.md)
- [Server bandwidth usage explanation](./docs/faq/bandwidth.md)
- [Admin entry/account/password reset guide](./docs/faq/login-reset.md)
- [Telegram notification Chat ID guide](docs/faq/telegram-chat-id.md)
- [Recommended configuration to improve Tron block scanning stability ‼️](./docs/tron-grid/readme.md)
- [EVM RPC endpoint stability guide ‼️](./docs/faq/evm-rpc-endpoint.md)

## ⚠️ Important Notes

- **Order transactions strongly depend on time**: Make sure the server time is accurate, otherwise order abnormalities may occur.
- **Network environment requirements**: Make sure the server network is stable, otherwise normal operation may be affected.

## 🏝️ Community

- **Telegram group**: [https://t.me/BEpusdtChat](https://t.me/BEpusdtChat)
- **Telegram channel**: [https://t.me/BEpusdtChannel](https://t.me/BEpusdtChannel)

## 🙏 Acknowledgements

- [EPusdt](./docs/faq/epusdt.md)

## 🌟 Star History

[![Stargazers over time](https://starchart.cc/v03413/bepusdt.svg)](https://starchart.cc/v03413/bepusdt)
