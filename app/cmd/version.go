package cmd

import (
	"context"
	"fmt"

	"github.com/urfave/cli/v3"
	"github.com/v03413/bepusdt/app"
)

var Version = &cli.Command{
	Name:  "version",
	Usage: "Show version information",
	Action: func(ctx context.Context, cmd *cli.Command) error {
		fmt.Println("BEpusdt version:" + app.Version)

		return nil
	},
}
