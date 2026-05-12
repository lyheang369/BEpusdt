package notify

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/spf13/cast"
	"github.com/v03413/bepusdt/app"
	epay2 "github.com/v03413/bepusdt/app/handler/epay"
	"github.com/v03413/bepusdt/app/log"
	"github.com/v03413/bepusdt/app/model"
	"github.com/v03413/bepusdt/app/notifier"
	"github.com/v03413/bepusdt/app/utils"

	"github.com/v03413/go-cache"
	"gorm.io/gorm"
)

type EpNotify struct {
	TradeId            string  `json:"trade_id"`             //  本地Order Number
	OrderId            string  `json:"order_id"`             //  客户Transactionid
	Amount             float64 `json:"amount"`               //  Order Amount CNY
	ActualAmount       string  `json:"actual_amount"`        //  USDT Trade Amount
	Token              string  `json:"token"`                //  Receiving WalletAddress
	BlockTransactionId string  `json:"block_transaction_id"` // Blockid
	Signature          string  `json:"signature"`            // 签名
	Status             int     `json:"status"`               //  1：Waiting for Payment，2：Payment Successful，3：Order超时
}

func Handle(order model.Order) error {
	if order.Status != model.OrderStatusSuccess {

		return errors.New("Order is unpaid; callback is not allowed")
	}

	var ctx, cancel = context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	var err error
	if order.ApiType == model.OrderApiTypeEpay {
		err = epay(ctx, order)
	} else {
		err = epusdt(ctx, order)
	}

	if err != nil {
		return err
	}

	log.Info("OrderCallback successful：", order.TradeId)

	return nil
}

func epay(ctx context.Context, order model.Order) error {
	var client = http.Client{Timeout: time.Second * 5}
	var notifyUrl = fmt.Sprintf("%s?%s", order.NotifyUrl, epay2.BuildNotifyParams(order))

	postReq, err2 := http.NewRequestWithContext(ctx, "GET", notifyUrl, nil)
	if err2 != nil {
		return err2
	}

	postReq.Header.Set("Powered-By", "https://github.com/v03413/bepusdt")
	resp, err := client.Do(postReq)
	if err != nil {
		return err
	}

	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		markNotifyFail(order, fmt.Sprintf("resp.StatusCode != 200"))

		return fmt.Errorf("MerchantMerchant system returned invalid status code:%d（must be 200)", resp.StatusCode)
	}

	all, err := io.ReadAll(resp.Body)
	if err != nil {
		markNotifyFail(order, fmt.Sprintf("io.ReadAll(resp.Body) Error: %v", err))

		return err
	}

	var bodyStr = strings.ToLower(strings.TrimSpace(string(all)))

	// 判断YesNo包含 success 或 ok
	if !strings.Contains(bodyStr, "success") && !strings.Contains(bodyStr, "ok") {
		markNotifyFail(order, "MerchantMerchant system must respond with success or ok for callback success")

		return fmt.Errorf("MerchantMerchant system must respond with success or ok for callback success，actual response:%s", string(all))
	}

	if err = order.SetNotifyState(model.OrderNotifyStateSucc); err != nil {
		return err
	}

	return nil
}

func epusdt(ctx context.Context, order model.Order) error {
	var data = make(map[string]interface{})
	var body = EpNotify{
		TradeId:            order.TradeId,
		OrderId:            order.OrderId,
		Amount:             cast.ToFloat64(order.Money),
		ActualAmount:       order.Amount,
		Token:              order.Address,
		BlockTransactionId: order.RefHash,
		Status:             order.Status,
	}
	var jsonBody, err = json.Marshal(body)
	if err != nil {
		return err
	}

	if err = json.Unmarshal(jsonBody, &data); err != nil {
		return err
	}

	// 签名
	body.Signature = utils.EpusdtSign(data, model.AuthToken())

	// 再次序列化
	jsonBody, err = json.Marshal(body)
	var client = http.Client{Timeout: time.Second * 5}
	var postReq, err2 = http.NewRequestWithContext(ctx, "POST", order.NotifyUrl, strings.NewReader(string(jsonBody)))
	if err2 != nil {
		markNotifyFail(order, err2.Error())

		return err2
	}

	postReq.Header.Set("Content-Type", "application/json")
	postReq.Header.Set("Powered-By", "https://github.com/v03413/bepusdt")
	postReq.Header.Set("User-Agent", "BEpusdt/"+app.Version)
	resp, err := client.Do(postReq)
	if err != nil {
		markNotifyFail(order, err.Error())

		return err
	}

	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		markNotifyFail(order, fmt.Sprintf("MerchantMerchant system returned invalid status code:%d（must be 200)", resp.StatusCode))

		return fmt.Errorf("MerchantMerchant system returned invalid status code:%d（must be 200)", resp.StatusCode)
	}

	if err = order.SetNotifyState(model.OrderNotifyStateSucc); err != nil {

		return err
	}

	return nil
}

func Bepusdt(o model.Order) {
	if o.ApiType != model.OrderApiTypeEpusdt {

		return
	}

	var authToken = model.AuthToken()
	var client = &http.Client{Timeout: time.Second * 5}
	go func() {
		if err := deliverBepusdtStatusUpdate(model.Db, client, authToken, o); err != nil {
			log.Warn("notify BEpusdt Error:", err.Error())
		}
	}()
}

func deliverBepusdtStatusUpdate(db *gorm.DB, client *http.Client, authToken string, o model.Order) error {
	if client == nil {
		client = &http.Client{Timeout: time.Second * 5}
	}

	var current model.Order
	tx := db.Where("trade_id = ? and status = ?", o.TradeId, o.Status).Limit(1).Find(&current)
	if tx.Error != nil {
		return tx.Error
	}
	if tx.RowsAffected == 0 {
		return nil
	}

	var key = fmt.Sprintf("bepusdt_notify_%d_%s", current.Status, current.TradeId)
	if _, ok := cache.Get(key); ok {
		return nil
	}

	cache.Set(key, true, time.Minute)

	var data = make(map[string]interface{})
	var body = EpNotify{
		TradeId:            current.TradeId,
		OrderId:            current.OrderId,
		Amount:             cast.ToFloat64(current.Money),
		ActualAmount:       current.Amount,
		Token:              current.Address,
		BlockTransactionId: current.RefHash,
		Status:             current.Status,
	}
	jsonBody, err := json.Marshal(body)
	if err != nil {
		return err
	}

	if err = json.Unmarshal(jsonBody, &data); err != nil {
		return err
	}

	body.Signature = utils.EpusdtSign(data, authToken)

	jsonBody, _ = json.Marshal(body)
	req, err := http.NewRequest("POST", current.NotifyUrl, strings.NewReader(string(jsonBody)))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Powered-By", "https://github.com/v03413/BEpusdt")
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return fmt.Errorf("resp.StatusCode != 200")
	}

	all, _ := io.ReadAll(resp.Body)
	log.Info(fmt.Sprintf("OrderCallback successful[%d]：%s %s", current.Status, current.TradeId, string(all)))

	return nil
}

func markNotifyFail(o model.Order, reason string) {
	log.Warn(fmt.Sprintf("OrderCallback failed(%v)：%s %v", o.TradeId, reason, o.SetNotifyState(model.OrderNotifyStateFail)))

	notifier.NotifyFail(o, reason)
}
