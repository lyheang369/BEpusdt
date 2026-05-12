package cmd

import "github.com/urfave/cli/v3"

var SQLiteFlag = &cli.StringFlag{
	Name:    "sqlite",
	Value:   "/var/lib/bepusdt/sqlite.db",
	Usage:   "SQLite SQLite database file path",
	Sources: cli.EnvVars("SQLITE"),
}

var MySQLDSNFlag = &cli.StringFlag{
	Name:    "mysql",
	Value:   "",
	Usage:   "MySQL database connection string (DSN)，Example: user:password@tcp(127.0.0.1:3306)/bepusdt?charset=utf8mb4&parseTime=True&loc=Local&timeout=3s&readTimeout=10s&writeTimeout=10s",
	Sources: cli.EnvVars("MYSQL_DSN"),
}

var PostgresDSNFlag = &cli.StringFlag{
	Name:    "postgres",
	Value:   "",
	Usage:   "PostgreSQL database connection string (DSN)，Example: postgres://user:password@localhost:5432/bepusdt?sslmode=disable&connect_timeout=3",
	Sources: cli.EnvVars("POSTGRESQL_DSN"),
}

var LogFlag = &cli.StringFlag{
	Name:    "log",
	Value:   "/var/log/bepusdt/",
	Usage:   "log file path",
	Sources: cli.EnvVars("LOG"),
}

var ListenFlag = &cli.StringFlag{
	Name:    "listen",
	Value:   ":8080",
	Usage:   "listen address in ip:port format, for example :8080",
	Sources: cli.EnvVars("LISTEN"),
}
