package mqtt

import (
	"fmt"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/v03413/bepusdt/app/log"
)

type callback struct {
	Qos     byte
	Handler mqtt.MessageHandler
}

var subscribeMap = make(map[string]callback)

// Subscribe register subscription。topic is persisted in subscribeMap，
// subscriptions are automatically restored by onConnectHandler after reconnect。
func Subscribe(topic string, qos byte, handler mqtt.MessageHandler) {
	subscribeMap[topic] = callback{Qos: qos, Handler: handler}

	mu.RLock()
	c := client
	mu.RUnlock()

	if c == nil {
		return
	}

	if token := c.Subscribe(topic, qos, handler); token.Wait() && token.Error() == nil {
		log.Info(fmt.Sprintf("✅ subscribed topic: %s", topic))
	}
}
