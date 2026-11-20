function simulatedEnvironment(now) {
  const measuredAt = Math.floor(now / 10_000) * 10_000;
  const trendInterval = 900_000;
  const trendEnd = Math.floor(measuredAt / trendInterval) * trendInterval;
  function reading(time) {
    const minute = time / 60_000;
    const variation = 0.46 * Math.sin(minute / 62) + 0.29 * Math.cos(minute / 24);
    return {
      measured_at: time,
      temperature: 23.6 + variation + 0.14 * Math.sin(minute * 1.1),
      humidity: 48.2 + 3.4 * variation + 0.32 * Math.cos(minute * 0.82),
    };
  }
  const latest = reading(measuredAt);
  const trend = Array.from({ length: 96 }, (_, index) => reading(trendEnd - (95 - index) * trendInterval));
  if (measuredAt !== trendEnd) trend.push(latest);
  return { latest, trend };
}
