package model

import (
	"errors"
	"fmt"
	"math"
	"time"

	"github.com/shopspring/decimal"
	"github.com/spf13/cast"
)

const (
	OrderNotifyStateSucc = 1 // Callback successful
	OrderNotifyStateFail = 0 // Callback failed

	OrderStatusWaiting    = 1 // Waiting for Payment
	OrderStatusSuccess    = 2 // Transaction ConfirmedSuccess
	OrderStatusExpired    = 3 // Orderexpired
	OrderStatusCanceled   = 4 // OrderCancel
	OrderStatusConfirming = 5 // Waiting for transaction confirmation
	OrderStatusFailed     = 6 // Transaction ConfirmedFailed

	BscBnb      TradeType = "bsc.bnb"
	EthereumEth TradeType = "ethereum.eth"
	TronTrx     TradeType = "tron.trx"

	UsdtTrc20    TradeType = "usdt.trc20"
	UsdcTrc20    TradeType = "usdc.trc20"
	UsdtPolygon  TradeType = "usdt.polygon"
	UsdcPolygon  TradeType = "usdc.polygon"
	UsdtArbitrum TradeType = "usdt.arbitrum"
	UsdcArbitrum TradeType = "usdc.arbitrum"
	UsdtErc20    TradeType = "usdt.erc20"
	UsdcErc20    TradeType = "usdc.erc20"
	UsdtBep20    TradeType = "usdt.bep20"
	UsdcBep20    TradeType = "usdc.bep20"
	UsdtXlayer   TradeType = "usdt.xlayer"
	UsdcXlayer   TradeType = "usdc.xlayer"
	UsdcBase     TradeType = "usdc.base"
	UsdtSolana   TradeType = "usdt.solana"
	UsdcSolana   TradeType = "usdc.solana"
	UsdtAptos    TradeType = "usdt.aptos"
	UsdcAptos    TradeType = "usdc.aptos"
	UsdtPlasma   TradeType = "usdt.plasma"
)

const (
	OrderApiTypeEpusdt = "epusdt" // epusdt
	OrderApiTypeEpay   = "epay"   // Caihong EasyPay
	OrderApiTypeAdmin  = "admin"  // Admin panel
)

type Order struct {
	Id
	OrderId       string     `gorm:"column:order_id;type:varchar(128);not null;index;comment:MerchantID" json:"order_id"`
	TradeId       string     `gorm:"column:trade_id;type:varchar(128);not null;uniqueIndex;comment:local ID" json:"trade_id"`
	TradeType     TradeType  `gorm:"column:trade_type;type:varchar(20);not null;index;comment:Trade Type" json:"trade_type"`
	Fiat          Fiat       `gorm:"column:fiat;type:varchar(16);not null;index;default:CNY;comment:fiat currency" json:"fiat"`
	Crypto        Crypto     `gorm:"column:crypto;type:varchar(16);not null;index;default:USDT;comment:Cryptocurrency" json:"crypto"`
	CurrencyLimit string     `gorm:"column:currency_limit;type:varchar(255);not null;default:'';comment:limited currency" json:"currency_limit"`
	Rate          string     `gorm:"column:rate;type:varchar(10);not null;comment:transaction rate" json:"rate"`
	Amount        string     `gorm:"column:amount;type:varchar(32);not null;default:0.00;comment:Trade Amount" json:"amount"`
	Money         string     `gorm:"column:money;type:varchar(32);not null;default:0.00;comment:Transaction Amount" json:"money"`
	Address       string     `gorm:"column:address;type:varchar(128);index;not null;comment:Receiving Address" json:"address"`
	FromAddress   string     `gorm:"column:from_address;type:varchar(128);not null;default:'';comment:Payment Address" json:"from_address"`
	AddressLocked bool       `gorm:"column:address_locked;not null;default:false;comment:address lock 1: exclusive 0: shared" json:"address_locked"`
	Status        int        `gorm:"column:status;not null;default:1;index;index:idx_order_notify_retry,priority:1;comment:Transaction Status" json:"status"`
	Name          string     `gorm:"column:name;type:varchar(64);not null;default:'';comment:Product Name" json:"name"`
	ApiType       string     `gorm:"column:api_type;type:varchar(20);not null;default:'epusdt';comment:API type" json:"api_type"`
	ReturnUrl     string     `gorm:"column:return_url;type:varchar(255);not null;default:'';comment:return URL" json:"return_url"`
	NotifyUrl     string     `gorm:"column:notify_url;type:varchar(255);not null;default:'';comment:notify URL" json:"notify_url"`
	NotifyNum     int        `gorm:"column:notify_num;not null;default:0;index:idx_order_notify_retry,priority:3;comment:callback count" json:"notify_num"`
	NotifyState   int        `gorm:"column:notify_state;not null;default:0;index:idx_order_notify_retry,priority:2;comment:Callback Status 1：Success 0：Failed" json:"notify_state"`
	RefHash       string     `gorm:"column:ref_hash;type:varchar(128);not null;default:'';index;comment:Transaction Hash" json:"ref_hash"`
	RefBlockNum   int        `gorm:"column:ref_block_num;not null;default:0;comment:Block Index" json:"ref_block_num"`
	ExpiredAt     time.Time  `gorm:"column:expired_at;not null;comment:expiration time" json:"expired_at"`
	ConfirmedAt   *time.Time `gorm:"column:confirmed_at;not null;comment:Transaction ConfirmedTime" json:"confirmed_at"`
	AutoTimeAt
}

func (o *Order) SetCanceled() error {
	o.Status = OrderStatusCanceled

	return Db.Save(o).Error
}

func (o *Order) SetExpired() {
	o.Status = OrderStatusExpired

	Db.Save(o)
}

func (o *Order) SetSuccess() {
	o.Status = OrderStatusSuccess

	Db.Save(o)
}

func (o *Order) SetFailed() {
	o.Status = OrderStatusFailed

	Db.Save(o)
}

func (o *Order) MarkConfirming(blockNum int, from, hash string, at time.Time, amount decimal.Decimal) {
	o.FromAddress = from
	o.ConfirmedAt = &at
	o.RefHash = hash
	o.RefBlockNum = blockNum
	o.Status = OrderStatusConfirming
	if o.AddressLocked {
		rate, _ := decimal.NewFromString(o.Rate)
		o.Amount = amount.String()
		o.Money = rate.Mul(amount).String()
	}

	Db.Save(o)
}

func (o *Order) SetNotifyState(state int) error {
	o.NotifyNum += 1
	o.NotifyState = state

	return Db.Save(o).Error
}

func (o *Order) GetStatusLabel() string {
	label := "🟢Payment Successful"
	if o.Status == OrderStatusExpired {
		label = "🔴Transaction Expired"
	}
	if o.Status == OrderStatusWaiting {
		label = "🟡Waiting for Payment"
	}
	if o.Status == OrderStatusCanceled {
		label = "⚪️OrderCancel"
	}

	return label
}

func (o *Order) GetStatusEmoji() string {
	label := "🟢"
	if o.Status == OrderStatusExpired {
		label = "🔴"
	}
	if o.Status == OrderStatusWaiting {
		label = "🟡"
	}
	if o.Status == OrderStatusCanceled {
		label = "⚪️"
	}

	return label
}

func (o *Order) GetTxUrl() string {
	return GetTxUrl(o.TradeType, o.RefHash)
}

func (o *Order) TableName() string {
	return "bep_order"
}

func GetTradeOrder(tradeId string) (Order, bool) {
	var order Order
	res := Db.Where("trade_id = ?", tradeId).Limit(1).Find(&order)

	return order, res.RowsAffected > 0
}

func GetOrderByStatus(Status int) []Order {
	orders := make([]Order, 0)

	Db.Where("status = ?", Status).Find(&orders)

	return orders
}

func GetNotifyFailedTradeOrders() ([]Order, error) {
	var orders []Order
	maxRetry := cast.ToInt(GetC(NotifyMaxRetry))
	if maxRetry <= 0 {
		maxRetry = cast.ToInt(defaultConf[NotifyMaxRetry])
	}

	res := Db.Where("status = ?", OrderStatusSuccess).
		Where("notify_state = ?", OrderNotifyStateFail).
		Where("notify_num <= ?", maxRetry).Find(&orders)

	return orders, res.Error
}

// CalcTradeAmount 计算当前实际可用的Transaction Amount
func CalcTradeAmount(address []string, rate decimal.Decimal, p OrderParams) (string, string, error) {
	if p.AddressLocked {
		return LockTradeAddress(address, p.TradeType)
	}

	var orders []Order
	lock := make(map[string]bool)
	status := []int{OrderStatusConfirming, OrderStatusWaiting}
	Db.Where("status in (?) and trade_type = ?", status, p.TradeType).Find(&orders)
	for _, order := range orders {
		lock[order.Address+order.Amount] = true
	}

	atom, precision := GetAtomicity(p.TradeType)
	if rate.LessThanOrEqual(decimal.Zero) || precision <= 0 {
		return "", "", errors.New(fmt.Sprintf("[%v - %v]Atomic granularity calculation error. Contact the admin.", atom, precision))
	}

	amount := p.Money.DivRound(rate, precision)
	if amount.LessThan(atom) { // Below minimum atomic precision, calculate from minimum atomic precision
		amount = atom
	}

	var i = 0
	var m = 100
	for {
		for _, addr := range address {
			k := addr + amount.String()
			if _, ok := lock[k]; ok {
				continue
			}

			return addr, amount.String(), nil
		}

		// 已经被占用，每次递增one个原子精度
		amount = amount.Add(atom)
		if i++; i > m {
			return "", "", errors.New("Failed to calculate transaction amount. Contact the admin.")
		}
	}
}

// LockTradeAddress 检测Transaction Address，独占使用
func LockTradeAddress(address []string, t TradeType) (string, string, error) {
	zero := decimal.Zero.String()
	status := []int{OrderStatusConfirming, OrderStatusWaiting}
	for _, addr := range address {
		var o Order
		Db.Where("address = ? and status in (?) and trade_type = ? and address_locked = ?", addr, status, t, true).Order("id desc").Limit(1).Find(&o)
		if o.ID == 0 {
			return addr, zero, nil
		}
	}

	return "", zero, errors.New("No available wallet address")
}

// CalcTradeExpiredAt 计算OrderexpiredTime 最小180，最大3600，默认1200
func CalcTradeExpiredAt(sec int64) time.Time {
	if sec >= 180 && sec <= 3600 {
		return time.Now().Add(time.Duration(sec) * time.Second)
	}

	return time.Now().Add(time.Duration(cast.ToUint64(GetK(PaymentTimeout))) * time.Second)
}

func GetAtomicity(t TradeType) (decimal.Decimal, int32) {
	confKey, ok := GetTradeAtomKey(t)
	if !ok {
		confKey = "atom_usdt"
	}

	atom, _ := decimal.NewFromString(GetK(confKey))

	return atom, cast.ToInt32(math.Abs(float64(atom.Exponent())))
}
