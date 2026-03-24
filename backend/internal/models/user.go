package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AuthMethod string

const (
	AuthMethodPassword  AuthMethod = "password"
	AuthMethodGoogle    AuthMethod = "google"
	AuthMethodGitHub    AuthMethod = "github"
	AuthMethodMicrosoft AuthMethod = "microsoft"
	AuthMethodMagicLink AuthMethod = "magic_link"
	AuthMethodPasskey   AuthMethod = "passkey"
)

type User struct {
	ID                   primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Email                string             `json:"email" bson:"email" validate:"required,email,max=254"`
	DisplayName          string             `json:"displayName" bson:"displayName" validate:"required,min=1,max=200"`
	PasswordHash         string             `json:"-" bson:"passwordHash,omitempty"`
	GoogleID             string             `json:"-" bson:"googleId,omitempty"`
	GitHubID             string             `json:"-" bson:"githubId,omitempty"`
	MicrosoftID          string             `json:"-" bson:"microsoftId,omitempty"`
	AuthMethods          []AuthMethod       `json:"authMethods" bson:"authMethods" validate:"required,min=1,dive,valid_auth_method"`
	EmailVerified        bool               `json:"emailVerified" bson:"emailVerified"`
	IsActive             bool               `json:"isActive" bson:"isActive"`
	TOTPSecret           string             `json:"-" bson:"totpSecret,omitempty"`
	TOTPEnabled          bool               `json:"totpEnabled" bson:"totpEnabled"`
	TOTPVerifiedAt       *time.Time         `json:"-" bson:"totpVerifiedAt,omitempty"`
	RecoveryCodes        []string           `json:"-" bson:"recoveryCodes,omitempty"`
	ThemePreference      string             `json:"themePreference" bson:"themePreference" validate:"omitempty,oneof=light dark system"`
	OnboardingCompletedAt *time.Time        `json:"onboardingCompletedAt,omitempty" bson:"onboardingCompletedAt,omitempty"`
	CreatedAt            time.Time          `json:"createdAt" bson:"createdAt" validate:"required"`
	UpdatedAt            time.Time          `json:"updatedAt" bson:"updatedAt" validate:"required"`
	LastLoginAt          *time.Time         `json:"lastLoginAt,omitempty" bson:"lastLoginAt,omitempty"`
	LastVerificationSent *time.Time         `json:"-" bson:"lastVerificationSent,omitempty"`
	FailedLoginAttempts  int                `json:"-" bson:"failedLoginAttempts"`
	AccountLockedUntil   *time.Time         `json:"-" bson:"accountLockedUntil,omitempty"`
	TrialUsedAt          *time.Time         `json:"trialUsedAt,omitempty" bson:"trialUsedAt,omitempty"`
	NotificationPrefs    NotificationPrefs  `json:"notificationPrefs" bson:"notificationPrefs"`
}

// NotificationPrefs controls which emails the user receives.
type NotificationPrefs struct {
	ScoreDrops    bool   `json:"scoreDrops" bson:"scoreDrops"`       // alert when tracked store score drops
	ScoreGains    bool   `json:"scoreGains" bson:"scoreGains"`       // alert when tracked store score improves
	WeeklyDigest  bool   `json:"weeklyDigest" bson:"weeklyDigest"`   // weekly summary of all tracked stores
	SlackWebhook  string `json:"slackWebhook" bson:"slackWebhook,omitempty"` // Slack incoming webhook URL
}

func (u *User) HasAuthMethod(method AuthMethod) bool {
	for _, m := range u.AuthMethods {
		if m == method {
			return true
		}
	}
	return false
}

func (u *User) IsLocked() bool {
	if u.AccountLockedUntil == nil {
		return false
	}
	return time.Now().Before(*u.AccountLockedUntil)
}
