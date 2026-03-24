package handlers

import (
	"context"
	"encoding/json"
	"net/http"

	"lastsaas/internal/db"
	"lastsaas/internal/middleware"
	"lastsaas/internal/models"
	"lastsaas/internal/scanner"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// APIV1Handler handles versioned public API endpoints authenticated via API keys.
type APIV1Handler struct {
	service *scanner.Service
	db      *db.MongoDB
}

// NewAPIV1Handler creates a new APIV1Handler.
func NewAPIV1Handler(svc *scanner.Service) *APIV1Handler {
	return &APIV1Handler{service: svc}
}

// SetDB attaches the MongoDB instance for entitlement checks.
func (h *APIV1Handler) SetDB(database *db.MongoDB) {
	h.db = database
}

// TriggerScan handles POST /api/v1/scan.
// Requires API key authentication (Bearer lsk_...).
// Body: {"domain": "allbirds.com"}
func (h *APIV1Handler) TriggerScan(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Domain string `json:"domain"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if req.Domain == "" {
		respondWithError(w, http.StatusBadRequest, "domain is required")
		return
	}

	ctx := r.Context()

	// Attach tenant ID and entitlement-based scan options from context.
	var tenantID *primitive.ObjectID
	scanOpts := scanner.ScanOptions{}
	if tenant, ok := middleware.GetTenantFromContext(ctx); ok {
		id := tenant.ID
		tenantID = &id
		scanOpts.Assess = h.hasAIAssessmentEntitlement(ctx, tenant)
		scanOpts.Simulate = h.hasSimulationEntitlement(ctx, tenant)
		if h.hasCrossAgentEntitlement(ctx, tenant) {
			scanOpts.Personas = "default,price,quality,speed"
		}
	}

	stored, err := h.service.ScanStore(ctx, req.Domain, tenantID, scanOpts)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Scan failed: "+err.Error())
		return
	}

	respondWithJSON(w, http.StatusOK, stored)
}

// GetScan handles GET /api/v1/scan/{id}.
// Requires API key authentication.
func (h *APIV1Handler) GetScan(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	scanID := vars["id"]
	if scanID == "" {
		respondWithError(w, http.StatusBadRequest, "scan ID is required")
		return
	}

	scan, err := h.service.GetScan(r.Context(), scanID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to retrieve scan")
		return
	}
	if scan == nil {
		respondWithError(w, http.StatusNotFound, "Scan not found")
		return
	}

	respondWithJSON(w, http.StatusOK, scan)
}

// GetLatestStoreScan handles GET /api/v1/stores/{domain}/latest.
// Returns the most recent scan for the given domain.
// Requires API key authentication.
func (h *APIV1Handler) GetLatestStoreScan(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	domain := vars["domain"]
	if domain == "" {
		respondWithError(w, http.StatusBadRequest, "domain is required")
		return
	}

	scan, err := h.service.GetLatestScan(r.Context(), domain)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to retrieve scan")
		return
	}
	if scan == nil {
		respondWithError(w, http.StatusNotFound, "No scan found for domain")
		return
	}

	respondWithJSON(w, http.StatusOK, scan)
}

func (h *APIV1Handler) hasAIAssessmentEntitlement(ctx context.Context, tenant *models.Tenant) bool {
	if h.db == nil || tenant.PlanID == nil {
		return false
	}
	var plan models.Plan
	if err := h.db.Plans().FindOne(ctx, bson.M{"_id": *tenant.PlanID}).Decode(&plan); err != nil {
		return false
	}
	if ent, ok := plan.Entitlements["ai_assessment"]; ok && ent.Type == models.EntitlementTypeBool {
		return ent.BoolValue
	}
	return false
}

func (h *APIV1Handler) hasSimulationEntitlement(ctx context.Context, tenant *models.Tenant) bool {
	if h.db == nil || tenant.PlanID == nil {
		return false
	}
	var plan models.Plan
	if err := h.db.Plans().FindOne(ctx, bson.M{"_id": *tenant.PlanID}).Decode(&plan); err != nil {
		return false
	}
	if ent, ok := plan.Entitlements["ai_simulation"]; ok && ent.Type == models.EntitlementTypeBool {
		return ent.BoolValue
	}
	return false
}

func (h *APIV1Handler) hasCrossAgentEntitlement(ctx context.Context, tenant *models.Tenant) bool {
	if h.db == nil || tenant.PlanID == nil {
		return false
	}
	var plan models.Plan
	if err := h.db.Plans().FindOne(ctx, bson.M{"_id": *tenant.PlanID}).Decode(&plan); err != nil {
		return false
	}
	if ent, ok := plan.Entitlements["cross_agent"]; ok && ent.Type == models.EntitlementTypeBool {
		return ent.BoolValue
	}
	return false
}
