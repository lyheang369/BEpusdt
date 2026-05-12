package cmd

import (
	"errors"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"syscall"
	"time"

	"context"

	"github.com/v03413/bepusdt/app"
	"github.com/v03413/bepusdt/app/log"
	"github.com/v03413/bepusdt/app/model"
	"github.com/v03413/bepusdt/app/notifier"
	"github.com/v03413/bepusdt/app/router"
	"github.com/v03413/bepusdt/app/task"
)

import (
	"github.com/urfave/cli/v3"
)

var Start = &cli.Command{
	Name:  "start",
	Usage: "Start payment gateway",
	Flags: []cli.Flag{SQLiteFlag, MySQLDSNFlag, PostgresDSNFlag, LogFlag, ListenFlag},
	Before: func(ctx context.Context, c *cli.Command) (context.Context, error) {
		mysql := c.String("mysql")
		postgres := c.String("postgres")
		sqlite := c.String("sqlite")
		if err := model.Init(sqlite, mysql, postgres); err != nil {
			return ctx, fmt.Errorf("database initialization failed %w", err)
		}

		if err := log.Init(c.String("log")); err != nil {
			return ctx, fmt.Errorf("log initialization failed %w", err)
		}

		return ctx, task.Init()
	},
	After: func(ctx context.Context, c *cli.Command) error {
		log.Close()
		model.Close()

		return nil
	},
	Action: start,
}

func start(ctx context.Context, cmd *cli.Command) error {
	// 开始任务调度
	task.Start(ctx)

	// Start web server
	var listen = cmd.String("listen")
	var srv = &http.Server{Addr: listen, Handler: router.Handler()}

	log.Info("web server Start listen", listen)

	go func() {
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Error("web server error", err)
		}
	}()

	// Stop web server
	go func() {
		<-ctx.Done()
		shutdown, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		if err := srv.Shutdown(shutdown); err != nil {
			log.Error("Web shutdown Error", err)
			return
		}

		log.Info("web shutdown success.")
	}()

	notifier.Welcome()

	fmt.Println(fmt.Sprintf("BEpusdt started successfully(%s)，Current version:%s", listen, app.Version))

	// Wait for interrupt signal
	var signals = make(chan os.Signal, 1)
	signal.Notify(signals, os.Interrupt, syscall.SIGTERM)
	<-signals

	runtime.GC()

	return nil
}
