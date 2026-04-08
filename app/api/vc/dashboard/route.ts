import { NextResponse } from "next/server";
import { projects, creators } from "@/lib/mock-data";

export async function GET() {
  // Aggregate platform-level metrics from mock data
  const totalProjects = projects.length;
  const totalCreators = creators.length;
  const avgScore = Math.round(projects.reduce((s, p) => s + p.score, 0) / totalProjects);
  const totalUpvotes = projects.reduce((s, p) => s + p.upvotes, 0);
  const totalPlays = projects.reduce((s, p) => s + p.plays, 0);

  // Platform radar — aggregate metrics
  const platformRadar = {
    growthRate: 72,
    userRetention: 65,
    aiInnovation: 88,
    marketTiming: 78,
    teamSignal: 60,
    revenuePotential: 55,
  };

  // Deal flow — sorted by investorCuriosity
  const dealFlow = [...projects]
    .sort((a, b) => b.aiReview.investorCuriosity - a.aiReview.investorCuriosity)
    .slice(0, 10)
    .map((p) => ({
      projectId: p.id,
      title: p.title,
      creatorName: p.creatorName,
      category: p.category,
      score: p.score,
      investorCuriosity: p.aiReview.investorCuriosity,
      growth: Math.round((p.behaviorScore.shareRate * 100 - 5) * 10) / 10,
      stage: p.score >= 90 ? "Growth" : p.score >= 75 ? "MVP" : "Idea",
    }));

  // Talent list — derived from creators
  const talents = creators
    .map((c) => {
      const creatorProjects = projects.filter((p) => p.creatorId === c.id);
      const highScoreCount = creatorProjects.filter((p) => p.score > 80).length;
      const successRate = creatorProjects.length > 0
        ? Math.round((highScoreCount / creatorProjects.length) * 100)
        : 0;
      const topCategory = creatorProjects.length > 0
        ? creatorProjects.sort((a, b) => b.score - a.score)[0].category
        : "N/A";

      return {
        creatorId: c.id,
        name: c.name,
        projectCount: c.projectCount,
        totalUpvotes: c.totalUpvotes,
        successRate,
        topCategory,
        connections: Math.floor(Math.random() * 8) + 1,
      };
    })
    .sort((a, b) => b.successRate - a.successRate)
    .slice(0, 8);

  return NextResponse.json({
    summary: {
      totalProjects,
      totalCreators,
      avgScore,
      totalUpvotes,
      totalPlays,
    },
    platformRadar,
    dealFlow,
    talents,
  });
}
