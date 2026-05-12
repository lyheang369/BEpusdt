package cmd

import (
	"context"
	"fmt"
	"time"

	"github.com/urfave/cli/v3"
	"github.com/v03413/bepusdt/app/model"
	"github.com/v03413/bepusdt/app/task"
	"github.com/v03413/bepusdt/app/utils"
	"golang.org/x/crypto/bcrypt"
)

var Reset = &cli.Command{
	Name:  "reset",
	Usage: "Reset account password and login entry when the password is forgotten",
	Flags: []cli.Flag{SQLiteFlag, MySQLDSNFlag, PostgresDSNFlag},
	Before: func(ctx context.Context, c *cli.Command) (context.Context, error) {
		mysql := c.String("mysql")
		postgres := c.String("postgres")
		sqlite := c.String("sqlite")
		if err := model.Init(sqlite, mysql, postgres); err != nil {
			return ctx, fmt.Errorf("database initialization failed %w", err)
		}

		return ctx, task.Init()
	},
	After: func(ctx context.Context, c *cli.Command) error {
		model.Close()

		return nil
	},
	Action: func(ctx context.Context, cmd *cli.Command) error {
		hash := utils.Md5String(time.Now().String())

		username := hash[8:16]
		password := hash[0:8]
		entrance := fmt.Sprintf("/%s", hash[10:20])
		encrypt, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

		model.SetK(model.AdminSecure, entrance)
		model.SetK(model.AdminUsername, username)
		model.SetK(model.AdminPassword, string(encrypt))

		fmt.Println("Reset successful. Details:")
		fmt.Printf("Admin account:%s\nAdmin password:%s\nAdmin entry:%s\n", username, password, entrance)
		fmt.Println("Keep the above information safe!")
		fmt.Println("-------------------------------")

		return nil
	},
}
