package task

import (
	"context"
	"time"

	"github.com/v03413/bepusdt/app/log"
	"github.com/v03413/bepusdt/app/model"
	"github.com/v03413/bepusdt/app/notifier"
	"github.com/v03413/bepusdt/app/task/notify"
	"github.com/v03413/bepusdt/app/utils"
)

func init() {
	Register(Task{Duration: time.Second * 3, Callback: notifyRetry})
	Register(Task{Duration: time.Second * 30, Callback: notifyRoll})
}

// notifyRetry Callback failed重试
func notifyRetry(context.Context) {
	tradeOrders, err := model.GetNotifyFailedTradeOrders()
	if err != nil {
		log.Task.Error("Failed to get pending callback orders", err)

		return
	}

	for _, order := range tradeOrders {
		next := utils.CalcNextNotifyTime(*order.ConfirmedAt, order.NotifyNum)
		if time.Now().Unix() >= next.Unix() {
			go notify.Handle(order)
		}
	}
}

func notifyRoll(context.Context) {
	for _, o := range model.GetOrderByStatus(model.OrderStatusWaiting) {
		notify.Bepusdt(o)
	}
}

// notifyOrderSuccess 统one触发OrderSuccess后的Callback与OrderNotifications。
func notifyOrderSuccess(order model.Order) {
	go notify.Handle(order)
	go notifier.Success(order)
}
