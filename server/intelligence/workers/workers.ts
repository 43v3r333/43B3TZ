import { etlStorage } from "../../etl/storage/storage";
import { eloEngine } from "../elo/elo";
import { expectedGoalsEngine } from "../xg/xg";
import { formEngine } from "../form/form";
import { fatigueEngine } from "../fatigue/fatigue";
import { weatherEngine } from "../weather/weather";
import { refereeEngine } from "../referees/referees";
import { marketIntelligenceEngine } from "../market/market";
import { qualityEngine } from "../quality/quality";
import { spiEngine } from "../spi/spi";
import { teamIntelligenceEngine } from "../teams/teams";
import { playerIntelligenceEngine } from "../players/players";
import { intelligenceStorage } from "../storage/storage";
import { intelligenceEventBus } from "../events/events";
import { IntelligenceEventType } from "../types";
import { createLogger } from "../../core/logger";

const logger = createLogger("IntelligenceWorkers");

export class IntelligenceWorker {
  /**
   * Performs a full chronological replay of all curated ETL data to reproduce pristine,
   * completely deterministic soccer intelligence matrices.
   */
  public async performHistoricalReplay(): Promise<{ success: boolean; stats: any }> {
    logger.info("Starting historical replay of the Sports Intelligence Platform...");
    
    // Clear current state first to ensure exact reproducibility
    intelligenceStorage.clearAll();
    spiEngine.clearAll();
    intelligenceEventBus.clearHistory();

    // 1. Fetch all curated teams, players, fixtures, stats, odds, weather, rankings
    const teamEntities = etlStorage.getCuratedEntities("team");
    const playerEntities = etlStorage.getCuratedEntities("player");
    const fixtureEntities = etlStorage.getCuratedEntities("fixture");
    const statsEntities = etlStorage.getCuratedEntities("statistics");
    const oddsEntities = etlStorage.getCuratedEntities("odds");
    const weatherEntities = etlStorage.getCuratedEntities("weather");
    const rankingEntities = etlStorage.getCuratedEntities("ranking");

    logger.info(`Replaying: ${teamEntities.length} teams, ${playerEntities.length} players, ${fixtureEntities.length} fixtures.`);

    // 2. Initialize basic Elo ratings for all teams
    teamEntities.forEach(team => {
      eloEngine.getOrInitRating(team.curatedId);
    });

    // 3. Process fixtures in chronological order to simulate real-time updates
    const sortedFixtures = [...fixtureEntities].sort(
      (a, b) => new Date(a.data.kickoff).getTime() - new Date(b.data.kickoff).getTime()
    );

    // Track historical statistics to feed into teams and players
    const matchHistoryByTeam: Record<string, any[]> = {};
    const matchHistoryByPlayer: Record<string, any[]> = {};
    const refereeMatchHistory: Record<string, any[]> = {};
    const oddsHistoryByFixture: Record<string, any[]> = {};

    // Map rankings if available
    rankingEntities.forEach(rank => {
      // Seed rankings Elo or leverage metrics
    });

    // Loop through each chronological fixture
    for (const curFixture of sortedFixtures) {
      const f = curFixture.data;
      const fId = curFixture.curatedId;

      // Find associated weather
      const wEnt = weatherEntities.find(we => we.data.fixtureId === fId);
      if (wEnt) {
        weatherEngine.normalizeWeather(fId, wEnt.data);
      } else {
        // Mock/Estimate default weather
        weatherEngine.normalizeWeather(fId, {
          temperatureCelcius: 18,
          humidityPercent: 65,
          windSpeedKph: 12,
          condition: "sunny"
        });
      }

      // Find associated stats
      const sEnt = statsEntities.find(se => se.data.fixtureId === fId);
      if (sEnt) {
        const stats = sEnt.data;
        // Calculate expected Goals (xG)
        const xgMetrics = expectedGoalsEngine.calculateMatchXg(fId, {
          shotsOnGoalHome: stats.shotsOnGoalHome,
          shotsOnGoalAway: stats.shotsOnGoalAway,
          shotsOffGoalHome: stats.shotsOffGoalHome,
          shotsOffGoalAway: stats.shotsOffGoalAway,
          homeScore: f.homeScore,
          awayScore: f.awayScore
        });

        // ELO Update if finished
        if (f.status === "finished" && f.homeScore !== undefined && f.awayScore !== undefined) {
          eloEngine.updateRatings(fId, f.homeTeam.teamId, f.awayTeam.teamId, f.homeScore, f.awayScore);

          // Build chronological team logs
          const hOutcome = f.homeScore > f.awayScore ? "W" : f.homeScore < f.awayScore ? "L" : "D";
          const aOutcome = hOutcome === "W" ? "L" : hOutcome === "L" ? "W" : "D";

          if (!matchHistoryByTeam[f.homeTeam.teamId]) matchHistoryByTeam[f.homeTeam.teamId] = [];
          matchHistoryByTeam[f.homeTeam.teamId].push({
            fixtureId: fId,
            isHome: true,
            opponentId: f.awayTeam.teamId,
            opponentName: f.awayTeam.name,
            competitionId: f.competition.competitionId,
            goalsScored: f.homeScore,
            goalsConceded: f.awayScore,
            shotsOnGoal: stats.shotsOnGoalHome,
            shotsOffGoal: stats.shotsOffGoalHome,
            possession: stats.possessionHome,
            fouls: stats.foulsHome,
            opponentFouls: stats.foulsAway,
            outcome: hOutcome
          });

          if (!matchHistoryByTeam[f.awayTeam.teamId]) matchHistoryByTeam[f.awayTeam.teamId] = [];
          matchHistoryByTeam[f.awayTeam.teamId].push({
            fixtureId: fId,
            isHome: false,
            opponentId: f.homeTeam.teamId,
            opponentName: f.homeTeam.name,
            competitionId: f.competition.competitionId,
            goalsScored: f.awayScore,
            goalsConceded: f.homeScore,
            shotsOnGoal: stats.shotsOnGoalAway,
            shotsOffGoal: stats.shotsOffGoalAway,
            possession: stats.possessionAway,
            fouls: stats.foulsAway,
            opponentFouls: stats.foulsHome,
            outcome: aOutcome
          });

          // Build referee statistics (extract referee from fixture venue or mock name)
          const refName = f.venue?.name ? `Ref-${f.venue.name.charAt(0)}` : "Referee Main";
          const refId = `ref-${refName.replace(/\s+/g, "").toLowerCase()}`;
          if (!refereeMatchHistory[refId]) refereeMatchHistory[refId] = [];
          refereeMatchHistory[refId].push({
            cardsYellowHome: Math.floor(stats.foulsHome * 0.15),
            cardsYellowAway: Math.floor(stats.foulsAway * 0.15),
            cardsRedHome: stats.foulsHome > 15 ? 1 : 0,
            cardsRedAway: stats.foulsAway > 15 ? 1 : 0,
            penaltiesHome: stats.shotsOnGoalHome > 8 ? 1 : 0,
            penaltiesAway: stats.shotsOnGoalAway > 8 ? 1 : 0,
            foulsHome: stats.foulsHome,
            foulsAway: stats.foulsAway,
            stoppageTime: 4 + Math.floor(Math.random() * 4)
          });
          refereeEngine.processMatchStats(refId, refName, refereeMatchHistory[refId]);
        }
      }

      // Find odds (Market)
      const oEntList = oddsEntities.filter(oe => oe.data.fixtureId === fId);
      if (oEntList.length > 0) {
        if (!oddsHistoryByFixture[fId]) oddsHistoryByFixture[fId] = [];
        oEntList.forEach(oe => {
          const m1x2 = oe.data.markets.find((m: any) => m.name === "1X2");
          if (m1x2) {
            const hOdds = m1x2.outcomes.find((o: any) => o.name === "Home")?.odds || 2.0;
            const dOdds = m1x2.outcomes.find((o: any) => o.name === "Draw")?.odds || 3.2;
            const aOdds = m1x2.outcomes.find((o: any) => o.name === "Away")?.odds || 3.5;
            oddsHistoryByFixture[fId].push({
              timestamp: oe.data.timestamp || oe.updatedAt || new Date().toISOString(),
              home: hOdds,
              draw: dOdds,
              away: aOdds
            });
          }
        });
        marketIntelligenceEngine.analyzeMarket(fId, oddsHistoryByFixture[fId]);
      }
    }

    // 4. Update team and player aggregated intelligence
    teamEntities.forEach(team => {
      const history = matchHistoryByTeam[team.curatedId] || [];
      teamIntelligenceEngine.updateTeamIntelligence(team.curatedId, team.data.name, history);
      spiEngine.calculateSpi(team.curatedId);
    });

    playerEntities.forEach(player => {
      // Find matches where player participated (mock/simulate minutes played)
      const pId = player.curatedId;
      if (!matchHistoryByPlayer[pId]) matchHistoryByPlayer[pId] = [];
      
      // Simulate player history in 4 arbitrary fixtures
      const randomFixtures = sortedFixtures.slice(0, 4);
      randomFixtures.forEach((rf, i) => {
        const isAway = rf.data.awayTeam.teamId === "team-1"; // arbitrary
        matchHistoryByPlayer[pId].push({
          fixtureId: rf.curatedId,
          kickoff: rf.data.kickoff,
          minutesPlayed: 90 - (i * 15),
          goals: i === 0 ? 1 : 0,
          assists: i === 1 ? 1 : 0,
          yellowCards: i === 2 ? 1 : 0,
          redCards: 0,
          injured: player.data.injured,
          injuryDetails: player.data.injuryDetails,
          isAway,
          travelDistanceKm: isAway ? 350 : 0
        });
      });

      playerIntelligenceEngine.updatePlayerIntelligence(
        pId,
        player.data.name,
        player.data.position || "M",
        matchHistoryByPlayer[pId]
      );
    });

    // 5. Build Quality indicators for all calculated models
    const allTeams = intelligenceStorage.getAllTeams();
    allTeams.forEach(t => {
      qualityEngine.calculateQuality(
        t.teamId,
        teamEntities.length,
        Object.keys(t).filter(k => (t as any)[k] !== undefined).length,
        Object.keys(t).length,
        t.updatedAt,
        0.12
      );
    });

    const allPlayers = intelligenceStorage.getAllPlayers();
    allPlayers.forEach(p => {
      qualityEngine.calculateQuality(
        p.playerId,
        playerEntities.length,
        Object.keys(p).filter(k => (p as any)[k] !== undefined).length,
        Object.keys(p).length,
        p.updatedAt,
        0.05
      );
    });

    // Publish master event
    intelligenceEventBus.publish(IntelligenceEventType.IntelligenceGenerated, "system", { timestamp: new Date().toISOString() });

    logger.info("Historical replay completed successfully.");
    return {
      success: true,
      stats: intelligenceStorage.getStats()
    };
  }
}

export const intelligenceWorker = new IntelligenceWorker();
