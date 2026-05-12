package model

import "github.com/shopspring/decimal"

type ConfKey string
type Fiat string
type CoinId string
type Crypto string
type TradeType string
type MatchMode string
type Network string
type Range struct {
	MinAmount decimal.Decimal
	MaxAmount decimal.Decimal
}
type TradeTypeConf struct {
	Alias        string  // 类型别名，主要用户前端展示
	NetworkName  string  // NetworkName，用于前端展示
	Network      Network // 所属Blockchain Networks
	Crypto       Crypto  // 币种类型
	Native       bool    // YesNo原生币
	Contract     string  // 合Approx.Address，原生币为空
	Decimal      int32   // 小数位
	AmountRange  Range   // 合法数额范围；这里特指则扫块时[数额范围]，目前偷懒全部写死one个大概合理的范围，后面有问题再说...
	ExplorerFmt  string  // Block浏览器Transaction链接format化string，%s 位置替换为Transaction Hash
	EndpointKey  ConfKey // RPC 端点配置键
	AddrCaseSens bool    // Wallet AddressYesNo大小写敏感，如果为 false 则会统one转为小写比较
}

const (
	AdminUsername ConfKey = "admin_username"
	AdminPassword ConfKey = "admin_password"
	AdminSecure   ConfKey = "admin_secure"
	AdminSecret   ConfKey = "admin_secret"
	AdminLoginIP  ConfKey = "admin_login_ip"
	AdminLoginAt  ConfKey = "admin_login_at"

	ApiAuthToken ConfKey = "api_auth_token" // API Integration Token
	ApiAppUri    ConfKey = "api_app_uri"    // API 对接Address（CashierAddress）

	AtomUSDT ConfKey = "atom_usdt"
	AtomUSDC ConfKey = "atom_usdc"
	AtomTRX  ConfKey = "atom_trx"
	AtomBNB  ConfKey = "atom_bnb"
	AtomETH  ConfKey = "atom_eth"

	MonitorMinAmount  ConfKey = "monitor_min_amount" // 监控最小Amount，低于此Amount的入账不进行Notifications
	PaymentMinAmount  ConfKey = "payment_min_amount"
	PaymentMaxAmount  ConfKey = "payment_max_amount"
	PaymentTimeout    ConfKey = "payment_timeout"     // OrderPayment超时Time，单位sec
	PaymentStaticPath ConfKey = "payment_static_path" // Cashier Static Assets路径
	PaymentMatchMode  ConfKey = "payment_match_mode"  // OrderAmount Matching Mode

	RpcEndpointPlasma         ConfKey = "rpc_endpoint_plasma"            // Plasma RPCnode
	RpcEndpointBsc            ConfKey = "rpc_endpoint_bsc"               // BSC RPCnode
	RpcEndpointSolana         ConfKey = "rpc_endpoint_solana"            // Solana RPCnode
	RpcEndpointXlayer         ConfKey = "rpc_endpoint_xlayer"            // Xlayer RPCnode
	RpcEndpointPolygon        ConfKey = "rpc_endpoint_polygon"           // Polygon RPCnode
	RpcEndpointArbitrum       ConfKey = "rpc_endpoint_arbitrum"          // Arbitrum RPCnode
	RpcEndpointEthereum       ConfKey = "rpc_endpoint_ethereum"          // Ethereum RPCnode
	RpcEndpointBase           ConfKey = "rpc_endpoint_base"              // Base RPCnode
	RpcEndpointAptos          ConfKey = "rpc_endpoint_aptos"             // APTOS RPCnode
	RpcEndpointTron           ConfKey = "rpc_endpoint_tron"              // TRON RPCnode
	RpcEndpointTronGridApiKey ConfKey = "rpc_endpoint_tron_grid_api_key" // TRON RPCnode TronGrid Api Key

	RateSyncCoingeckoApiUrl ConfKey = "rate_sync_coingecko_api_url" // 汇率同步 Coingecko Api URL
	RateSyncCoingeckoApiKey ConfKey = "rate_sync_coingecko_api_key" // 汇率同步 Coingecko Api Key
	RateSyncInterval        ConfKey = "rate_sync_interval"          // 汇率同步间隔，单位sec
	RateSyncHistoryDays     ConfKey = "rate_sync_history_days"      // 历史汇率Savedays数

	NotifyMaxRetry     ConfKey = "notify_max_retry"      // 最大重试次数，OrderCallback failed
	BlockHeightMaxDiff ConfKey = "block_height_max_diff" // Maximum block height difference. If exceeded, scanning restarts from the current block height.
	BlockOffsetConfirm ConfKey = "block_offset_confirm"  // Block Offset Confirmation数，扫描时以当前Block高度减去此偏移量为准，避免重链导致的OrderCallback failed

	MqttHost        ConfKey = "mqtt_host"
	MqttPort        ConfKey = "mqtt_port"
	MqttUser        ConfKey = "mqtt_user"
	MqttPass        ConfKey = "mqtt_pass"
	MqttPublishQos  ConfKey = "mqtt_publish_qos"
	MqttTopicPrefix ConfKey = "mqtt_topic_prefix" // Messages发布 Topic 路径前缀
	MqttNetworks    ConfKey = "mqtt_networks"     // 需要持续监控的BlockNetwork

	NotifierParams  ConfKey = "notifier_params"  // Notifications参数 (token, chat_id, email
	NotifierChannel ConfKey = "notifier_channel" // Notification Channel (telegram, wechat, email

	SystemInstallLock ConfKey = "system_install_lock" // 系统安装锁
)
const (
	CNY Fiat = "CNY"
	USD Fiat = "USD"
	JPY Fiat = "JPY"
	EUR Fiat = "EUR"
	GBP Fiat = "GBP"
)
const (
	USDT Crypto = "USDT"
	USDC Crypto = "USDC"
	TRX  Crypto = "TRX"
	BNB  Crypto = "BNB"
	ETH  Crypto = "ETH"
)
const (
	Classic   MatchMode = "classic"    // 经典模式，精确匹配
	HasPrefix MatchMode = "has_prefix" // Prefix Match，允许多付
	RoundOff  MatchMode = "round_off"  // Value修Approx.，four舍五入，允许容错
)

// USD Trade Type常见扫描范围
var usdGeneralRange = Range{
	MinAmount: decimal.NewFromFloat(0.01),
	MaxAmount: decimal.NewFromFloat(1000000),
}

// registry Trade Type注册表【由init函数自动维护】
var networkTradesMap = make(map[Network][]TradeType)
var networkEndpointMap = make(map[Network]ConfKey)
var contractTradeMap = make(map[string]TradeType)
var contractDecimalMap = make(map[string]int32)
var tradeAmountRangeMap = make(map[TradeType]Range)
var explorerUrlMap = make(map[TradeType]string)
var cryptoAtomKeys = make(map[Crypto]ConfKey)
