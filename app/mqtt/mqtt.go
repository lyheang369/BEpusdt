package mqtt

import (
	"fmt"
	"os"
	"sync"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/v03413/bepusdt/app/log"
	"github.com/v03413/bepusdt/app/model"
)

type activeConf struct {
	host string
	port string
	user string
	pass string
}

var (
	client  mqtt.Client
	mu      sync.RWMutex
	curConf activeConf
)

// Reload 按最新配置connect to MQTT server
func Reload() error {
	host := model.GetC(model.MqttHost)
	port := model.GetC(model.MqttPort)
	if host == "" || port == "" {
		return nil // MQTT is not configured, skipping
	}

	newConf := activeConf{
		host: host,
		port: port,
		user: model.GetC(model.MqttUser),
		pass: model.GetC(model.MqttPass),
	}

	mu.Lock()
	defer mu.Unlock()
	if newConf == curConf { // configuration unchanged, no reconnect needed
		return nil
	}

	// disconnect old connection with 250ms graceful shutdown
	if client != nil {
		client.Disconnect(250)
		log.Info("🔄 MQTT configuration changed, connecting...")
	}

	opts := mqtt.NewClientOptions()
	// TCP mode is currently the only supported mode
	opts.AddBroker(fmt.Sprintf("tcp://%s:%s", newConf.host, newConf.port))
	opts.SetUsername(newConf.user)
	opts.SetPassword(newConf.pass)
	opts.SetClientID(fmt.Sprintf("BEpusdt %d", os.Getpid()))
	opts.SetAutoReconnect(true)
	opts.SetOrderMatters(false)
	opts.SetOnConnectHandler(onConnectHandler)
	opts.SetConnectionLostHandler(onConnectionLost)

	newClient := mqtt.NewClient(opts)
	if token := newClient.Connect(); token.Wait() && token.Error() != nil {
		return fmt.Errorf("MQTT connection failed: %s", token.Error())
	}

	client = newClient
	curConf = newConf

	return nil
}

func onConnectHandler(c mqtt.Client) {
	for topic, cb := range subscribeMap {
		c.Subscribe(topic, cb.Qos, cb.Handler).Wait()
	}

	log.Info("✅ MQTT connected successfully")
}

func onConnectionLost(_ mqtt.Client, err error) {
	log.Warn(fmt.Sprintf("❌ MQTT connection disconnected: %s", err.Error()))
}
