"use client";

import { memo } from "react";
import {
  SectionHeader,
  SubsectionHeader,
  CompetitorCard,
  TechCard,
  RoleItem,
  PhaseItem,
  RiskItem,
  RenderContent,
  CARD_STYLES,
} from "./components";

interface BusinessBriefProps {
  data: Record<string, any>;
}

// Section labels configuration
const SECTION_LABELS = {
  strategic_elevation: "Strategic Elevation",
  market_landscape: "Market Landscape",
  technical_blueprint: "Technical Blueprint",
  resource_blueprint: "Resource Blueprint",
  execution_roadmap: "Execution Roadmap",
  expert_consultation: "Expert Consultation",
  elevator_pitch: "Elevator Pitch",
  value_proposition: "Value Proposition",
  competitive_moat: "Competitive Moat",
  target_persona: "Target Persona",
  competitors: "Competitors",
  frontend: "Frontend",
  infrastructure: "Infrastructure",
  ai_logic: "AI Logic",
  lean_team_roles: "Lean Team Roles",
  budget_breakdown: "Budget Breakdown",
  hiring_platform: "Hiring Platform",
  primary_risk: "Primary Risk",
  immediate_next_steps: "Immediate Next Steps",
} as const;

// Strategic Elevation items configuration
const STRATEGIC_ELEVATION_ITEMS = [
  { key: "elevator_pitch" as const, label: SECTION_LABELS.elevator_pitch },
  { key: "unique_value_proposition" as const, label: SECTION_LABELS.value_proposition },
  { key: "competitive_moat" as const, label: SECTION_LABELS.competitive_moat },
] as const;

// Technical Blueprint items configuration
const TECHNICAL_BLUEPRINT_ITEMS = [
  { key: "frontend_stack" as const, label: SECTION_LABELS.frontend, fullWidth: false },
  { key: "backend_infra" as const, label: SECTION_LABELS.infrastructure, fullWidth: false },
  { key: "ai_logic" as const, label: SECTION_LABELS.ai_logic, fullWidth: true },
] as const;

// Resource Blueprint items configuration
const RESOURCE_BLUEPRINT_ITEMS = [
  { key: "lean_team_roles" as const, label: SECTION_LABELS.lean_team_roles, isAccent: true, isList: true },
  { key: "budget_breakdown_sar" as const, label: SECTION_LABELS.budget_breakdown, isAccent: false, isList: false },
  { key: "hiring_platform" as const, label: SECTION_LABELS.hiring_platform, isAccent: false, isList: false },
] as const;

// Execution Roadmap phases configuration
const EXECUTION_ROADMAP_ITEMS = [
  { key: "phase_1_validation" as const },
  { key: "phase_2_mvp_build" as const },
  { key: "phase_3_growth" as const },
] as const;

export default memo(function BusinessBrief({ data }: BusinessBriefProps) {
  if (!data) return null;

  const {
    strategic_elevation,
    market_landscape,
    technical_blueprint,
    resource_blueprint,
    execution_roadmap,
    expert_consultation,
  } = data;

  return (
    <div className="max-w-5xl mx-auto space-y-20 ">
      {/* Strategic Elevation */}
      {strategic_elevation && (
        <section className="space-y-4">
          <SectionHeader title={SECTION_LABELS.strategic_elevation} />
          <div className="space-y-4">
            {STRATEGIC_ELEVATION_ITEMS.map((item) =>
              strategic_elevation[item.key] ? (
                <div key={item.key} className={CARD_STYLES.default}>
                  <SubsectionHeader title={item.label} variant="accent" />
                  <RenderContent item={strategic_elevation[item.key]} />
                </div>
              ) : null,
            )}
          </div>
        </section>
      )}

      {/* Market Landscape */}
      {market_landscape && (
        <section className="space-y-4">
          <SectionHeader title={SECTION_LABELS.market_landscape} />
          {market_landscape.target_persona && (
            <div className={CARD_STYLES.default}>
              <RenderContent item={market_landscape.target_persona} />
            </div>
          )}
          {market_landscape.competitors && Array.isArray(market_landscape.competitors) && (
            <div className="space-y-3">
              <SubsectionHeader title={SECTION_LABELS.competitors} />
              <div className="space-y-3">
                {market_landscape.competitors.map((competitor: any, idx: number) => (
                  <CompetitorCard key={idx} competitor={competitor} />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Technical Blueprint */}
      {technical_blueprint && (
        <section className="space-y-4">
          <SectionHeader title={SECTION_LABELS.technical_blueprint} />
          <div className="space-y-4">
            {TECHNICAL_BLUEPRINT_ITEMS.map((item) =>
              technical_blueprint[item.key] ? (
                <div key={item.key}>
                  <TechCard label={item.label} item={technical_blueprint[item.key]} />
                </div>
              ) : null,
            )}
          </div>
        </section>
      )}

      {/* Resource Blueprint */}
      {resource_blueprint && (
        <section className="space-y-4">
          <SectionHeader title={SECTION_LABELS.resource_blueprint} />
          <div className="space-y-4">
            {RESOURCE_BLUEPRINT_ITEMS.map((item) => {
              const itemData = resource_blueprint[item.key];
              if (!itemData) return null;

              return (
                <div key={item.key} className={CARD_STYLES.default}>
                  <SubsectionHeader title={item.label} />
                  {item.isList && Array.isArray(itemData) ? (
                    <ul className="space-y-2">
                      {itemData.map((role: any, idx: number) => (
                        <RoleItem key={idx} role={role} />
                      ))}
                    </ul>
                  ) : (
                    <RenderContent item={itemData} />
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Execution Roadmap */}
      {execution_roadmap && (
        <section className="space-y-4">
          <SectionHeader title={SECTION_LABELS.execution_roadmap} />
          <div className="space-y-3">
            {EXECUTION_ROADMAP_ITEMS.map((item) =>
              execution_roadmap[item.key] ? <PhaseItem key={item.key} item={execution_roadmap[item.key]} /> : null,
            )}
          </div>
        </section>
      )}

      {/* Expert Consultation */}
      {expert_consultation && (
        <section className="space-y-4">
          <SectionHeader title={SECTION_LABELS.expert_consultation} />
          {expert_consultation.primary_risk && (
            <div className={CARD_STYLES.default}>
              <SubsectionHeader title={SECTION_LABELS.primary_risk} />
              <RenderContent item={expert_consultation.primary_risk} />
            </div>
          )}
          {expert_consultation.immediate_next_steps && Array.isArray(expert_consultation.immediate_next_steps) && (
            <div className={CARD_STYLES.default}>
              <SubsectionHeader title={SECTION_LABELS.immediate_next_steps} />
              <ul className="space-y-2">
                {expert_consultation.immediate_next_steps.map((step: any, idx: number) => (
                  <RoleItem key={idx} role={step} />
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
});
