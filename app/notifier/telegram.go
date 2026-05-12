package notifier

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/go-telegram/bot"
	"github.com/go-telegram/bot/models"
	"github.com/spf13/cast"
	"github.com/tidwall/gjson"
	"github.com/v03413/bepusdt/app"
	"github.com/v03413/bepusdt/app/conf"
	"github.com/v03413/bepusdt/app/log"
	"github.com/v03413/bepusdt/app/model"
	"github.com/v03413/bepusdt/app/utils"
	"github.com/v03413/tronprotocol/core"
)

type Telegram struct {
	api     *bot.Bot
	token   string
	chatID  int64
	topicID int
}

func (t *Telegram) Initialize(params string) error {
	info := gjson.Parse(params)

	t.token = info.Get("bot_token").String()
	t.chatID = info.Get("chat_id").Int()
	t.topicID = cast.ToInt(info.Get("topic_id").Int())

	b, err := bot.New(t.token)
	if err != nil {
		return err
	}

	t.api = b

	return nil
}

func (t *Telegram) Success(o model.Order) {
	if o.Status != model.OrderStatusSuccess {
		return
	}

	tradeType := string(o.TradeType)
	tokenType, err := model.GetCrypto(o.TradeType)
	if err != nil {
		t.sendMessage(&bot.SendMessageParams{Text: "❌Unsupported trade type:" + tradeType})

		return
	}

	token := string(tokenType)

	text := `
\#Payment Successful \#OrderTransaction \#` + token + `
\-\-\-
` + "```" + `
🚦Merchant Order：%v
💰Requested amount:%v ` + string(o.Fiat) + `(%v)
💲Payment amount:%v ` + tradeType + `
💎Transaction Hash：%s
✅Receiving Address：%s
⏱️Created At：%s
️🎯️PaymentTime：%s
` + "```" + `
`
	text = fmt.Sprintf(text,
		o.OrderId,
		o.Money,
		o.Rate,
		o.Amount,
		utils.MaskHash(o.RefHash),
		utils.MaskAddress(o.Address),
		o.CreatedAt.Format(time.DateTime),
		o.UpdatedAt.Format(time.DateTime),
	)

	t.sendMessage(&bot.SendMessageParams{
		Text:      text,
		ParseMode: models.ParseModeMarkdown,
		ReplyMarkup: &models.InlineKeyboardMarkup{
			InlineKeyboard: [][]models.InlineKeyboardButton{
				{
					models.InlineKeyboardButton{Text: "📝View transaction details", URL: o.GetTxUrl()},
				},
			},
		},
	})
}

func (t *Telegram) NotifyFail(o model.Order, reason string) {
	tradeType := string(o.TradeType)
	tokenT, err := model.GetCrypto(o.TradeType)
	if err != nil {
		t.sendMessage(&bot.SendMessageParams{Text: "❌Unsupported trade type:" + tradeType})

		return
	}

	token := string(tokenT)

	text := fmt.Sprintf(`
\#Callback failed \#OrderTransaction \#`+token+`
\-\-\-
`+"```"+`
🚦Merchant Order：%v
💲Payment amount:%v
💰Requested amount:%v `+string(o.Fiat)+`(%v)
💍Transaction type:%s
⚖️️Confirmation time:%s
⏰Next callback:%s
🗒️Failure reason:%s
`+"```"+`
`,
		utils.Ec(o.OrderId),
		o.Amount,
		o.Money, o.Rate,
		strings.ToUpper(tradeType),
		o.ConfirmedAt.Format(time.DateTime),
		utils.CalcNextNotifyTime(*o.ConfirmedAt, o.NotifyNum+1).Format(time.DateTime),
		reason,
	)

	t.sendMessage(&bot.SendMessageParams{
		Text:      text,
		ParseMode: models.ParseModeMarkdown,
		ReplyMarkup: &models.InlineKeyboardMarkup{
			InlineKeyboard: [][]models.InlineKeyboardButton{
				{
					models.InlineKeyboardButton{Text: "📝View payment details", CallbackData: o.GetTxUrl()},
				},
			},
		},
	})
}

func (t *Telegram) NonOrderTransfer(trans model.TronTransfer, wa model.Wallet) {
	title := "Income"
	if trans.RecvAddress != wa.Address {
		title = "Expense"
	}

	text := fmt.Sprintf(
		"\\#Account%s \\#Non-order transaction\n\\-\\-\\-\n```\n💲Trade Amount：%v \n💍Transaction type:"+strings.ToUpper(string(trans.TradeType))+"\n⏱️TransactionTime：%v\n✅Receiving address:%v\n🅾️Sending address:%v```\n",
		title,
		trans.Amount.String(),
		trans.Timestamp.Format(time.DateTime),
		utils.MaskAddress(trans.RecvAddress),
		utils.MaskAddress(trans.FromAddress),
	)

	t.sendMessage(&bot.SendMessageParams{
		Text:      text,
		ParseMode: models.ParseModeMarkdown,
		ReplyMarkup: models.InlineKeyboardMarkup{
			InlineKeyboard: [][]models.InlineKeyboardButton{
				{
					models.InlineKeyboardButton{Text: "📝View transaction details", URL: model.GetTxUrl(trans.TradeType, trans.TxHash)},
				},
			},
		},
	})
}

func (t *Telegram) TronResourceChange(res model.TronResource) {
	title := "Delegate"
	if res.Type == core.Transaction_Contract_UnDelegateResourceContract {
		title = "Reclaim"
	}

	text := fmt.Sprintf(
		"\\#Resource update \\#Energy"+title+"\n\\-\\-\\-\n```\n🔋Staked amount:"+cast.ToString(res.Balance/1000000)+"\n⏱️TransactionTime：%v\n✅Action address:%v\n🅾️Resource source:%v```\n",
		res.Timestamp.Format(time.DateTime),
		utils.MaskAddress(res.RecvAddress),
		utils.MaskAddress(res.FromAddress),
	)

	t.sendMessage(&bot.SendMessageParams{
		Text:      text,
		ParseMode: models.ParseModeMarkdown,
		ReplyMarkup: models.InlineKeyboardMarkup{
			InlineKeyboard: [][]models.InlineKeyboardButton{
				{
					models.InlineKeyboardButton{Text: "📝View transaction details", URL: "https://tronscan.org/#/transaction/" + res.ID},
				},
			},
		},
	})
}

func (t *Telegram) Welcome() {
	text := `
👋 Welcome to BEpusdt，` + conf.Desc + `，If you see this message, the system started successfully!

📌Current version:` + app.Version + `
🎉Open-source URL:` + conf.Github + `
---
`
	t.sendMessage(&bot.SendMessageParams{
		Text: text,
		ReplyMarkup: models.InlineKeyboardMarkup{
			InlineKeyboard: [][]models.InlineKeyboardButton{
				{
					{Text: "📢 Follow Channel", URL: "https://t.me/BEpusdtChannel"},
					{Text: "💬 Community Chat", URL: "https://t.me/BEpusdtChat"},
				},
			},
		},
	})
}

func (t *Telegram) Test() error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	_, err := t.api.SendMessage(ctx, &bot.SendMessageParams{
		ChatID:          t.chatID,
		MessageThreadID: t.topicID,
		Text:            "✅ This is a test message. Telegram notification configuration was saved successfully!\nCurrent system time: " + time.Now().Format("2006-01-02 15:04:05"),
	})

	return err
}

func (t *Telegram) sendMessage(p *bot.SendMessageParams) {
	p.ChatID = t.chatID
	p.MessageThreadID = t.topicID

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	_, err := t.api.SendMessage(ctx, p)
	if err != nil {
		log.Warn("Bot Send Message Error:", err.Error())
	}
}
