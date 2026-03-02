"use client";

import { memo } from "react";
import {
  SectionHeader,
  SubsectionHeader,
  CompetitorCard,
  TechCard,
  RoleItem,
  PhaseItem,
  RenderContent,
  CARD_STYLES,
} from "./components";

interface BusinessBriefProps {
  data: Record<string, any>;
}

const STRATEGIC_ELEVATION_ITEMS = [
  { key: "elevator_pitch", label: "Elevator Pitch" },
  { key: "unique_value_proposition", label: "Value Proposition" },
  { key: "competitive_moat", label: "Competitive Moat" },
] as const;

const TECHNICAL_BLUEPRINT_ITEMS = [
  { key: "frontend_stack", label: "Frontend" },
  { key: "backend_infra", label: "Infrastructure" },
  { key: "ai_logic", label: "AI Logic" },
] as const;

const RESOURCE_BLUEPRINT_ITEMS = [
  { key: "lean_team_roles", label: "Lean Team Roles", isList: true },
  { key: "budget_breakdown_sar", label: "Budget Breakdown", isList: false },
  { key: "hiring_platform", label: "Hiring Platform", isList: false },
] as const;

const EXECUTION_ROADMAP_PHASES = ["phase_1_validation", "phase_2_mvp_build", "phase_3_growth"] as const;

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
          <SectionHeader title="Strategic Elevation" />
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
          <SectionHeader title="Market Landscape" />
          {market_landscape.target_persona && (
            <div className={CARD_STYLES.default}>
              <RenderContent item={market_landscape.target_persona} />
            </div>
          )}
          {Array.isArray(market_landscape.competitors) && (
            <div className="space-y-3">
              <SubsectionHeader title="Competitors" />
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
          <SectionHeader title="Technical Blueprint" />
          <div className="space-y-4">
            {TECHNICAL_BLUEPRINT_ITEMS.map((item) =>
              technical_blueprint[item.key] ? (
                <TechCard key={item.key} label={item.label} item={technical_blueprint[item.key]} />
              ) : null,
            )}
          </div>
        </section>
      )}

      {/* Resource Blueprint */}
      {resource_blueprint && (
        <section className="space-y-4">
          <SectionHeader title="Resource Blueprint" />
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
          <SectionHeader title="Execution Roadmap" />
          <div className="space-y-3">
            {EXECUTION_ROADMAP_PHASES.map((key) =>
              execution_roadmap[key] ? <PhaseItem key={key} item={execution_roadmap[key]} /> : null,
            )}
          </div>
        </section>
      )}

      {/* Expert Consultation */}
      {expert_consultation && (
        <section className="space-y-4">
          <SectionHeader title="Expert Consultation" />
          {expert_consultation.primary_risk && (
            <div className={CARD_STYLES.default}>
              <SubsectionHeader title="Primary Risk" />
              <RenderContent item={expert_consultation.primary_risk} />
            </div>
          )}
          {Array.isArray(expert_consultation.immediate_next_steps) && (
            <div className={CARD_STYLES.default}>
              <SubsectionHeader title="Immediate Next Steps" />
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
