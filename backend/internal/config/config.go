package config

import (
	"github.com/spf13/viper"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
}

type ServerConfig struct {
	Port string
	Mode string // debug, release
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

type JWTConfig struct {
	Secret     string
	ExpireHour int
}

func Load() (*Config, error) {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")
	viper.AddConfigPath("./config")

	// Set defaults
	viper.SetDefault("server.port", "8080")
	viper.SetDefault("server.mode", "debug")
	viper.SetDefault("database.host", "localhost")
	viper.SetDefault("database.port", "5432")
	viper.SetDefault("database.user", "postgres")
	viper.SetDefault("database.password", "postgres")
	viper.SetDefault("database.dbname", "pcgame")
	viper.SetDefault("database.sslmode", "disable")
	viper.SetDefault("jwt.secret", "your-secret-key")
	viper.SetDefault("jwt.expireHour", 24)

	// Auto-bind environment variables
	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err != nil {
		// Config file not found; use defaults
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, err
		}
	}

	var cfg Config
	cfg.Server.Port = viper.GetString("server.port")
	cfg.Server.Mode = viper.GetString("server.mode")
	cfg.Database.Host = viper.GetString("database.host")
	cfg.Database.Port = viper.GetString("database.port")
	cfg.Database.User = viper.GetString("database.user")
	cfg.Database.Password = viper.GetString("database.password")
	cfg.Database.DBName = viper.GetString("database.dbname")
	cfg.Database.SSLMode = viper.GetString("database.sslmode")
	cfg.JWT.Secret = viper.GetString("jwt.secret")
	cfg.JWT.ExpireHour = viper.GetInt("jwt.expireHour")

	return &cfg, nil
}
