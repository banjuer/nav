package middleware

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"github.com/mereith/nav/database"
	"github.com/mereith/nav/logger"
	"github.com/mereith/nav/types"
	"github.com/mereith/nav/utils"
)

// 定义一个 JWT 的中间件, 除了校验 jtw，还要校验之前签发的 api token 只要一样就放行。
func JWTMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		rawToken := c.Request.Header.Get("Authorization")
		if rawToken == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success":      false,
				"errorMessage": "未登录",
			})
			c.Abort()
			return
		}

		if database.HasApiToken(rawToken) {
			c.Set("username", "apiToken")
			c.Set("uid", 1)
			c.Next()
			return
		}

		// 解析 token
		token, err := utils.ParseJWT(rawToken)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success":      false,
				"errorMessage": "未登录",
			})
			c.Abort()
			return
		}
		// 把名称加到上下文
		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			c.Set("username", claims["name"])
			c.Set("uid", claims["id"])

			// Token 自动续期：如果剩余时间小于 1 天，则续期
			if exp, ok := claims["exp"].(float64); ok {
				expTime := time.Unix(int64(exp), 0)
				now := time.Now()
				// 如果剩余时间小于 1 天，自动续期
				if expTime.Sub(now) < time.Hour*24 {
					newToken, err := utils.SignJWT(types.User{
						Name: claims["name"].(string),
						Id:   int(claims["id"].(float64)),
					})
					if err == nil {
						// 在响应头中返回新 token
						c.Header("X-New-Token", newToken)
						logger.LogInfo("Token 自动续期成功，用户: %s", claims["name"])
					}
				}
			}

			c.Next()
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success":      false,
				"errorMessage": "未登录",
			})
			c.Abort()
			return
		}
	}
}
