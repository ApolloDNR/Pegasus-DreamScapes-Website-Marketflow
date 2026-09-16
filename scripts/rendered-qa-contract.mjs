import { sitemapEntries } from '../shared/seo-routes.ts';

export const renderedQaReleaseRoutes = Object.freeze([
  '/',
  '/property-owners',
  '/deal-partners',
  '/how-we-operate',
  '/development',
  '/capital',
  '/strategy-lab',
  '/marketflow',
  '/marketflow/deals',
  '/bring-an-opportunity',
  '/work-with-apollo',
  '/peggy',
  '/contact',
  '/privacy',
  '/terms',
  '/disclosures',
  '/__launch-404-check',
]);

export const renderedQaFullPublicRouteExtras = Object.freeze([
  '/marketflow/buyboxes',
  '/marketflow/deals',
  '/strategy-lab/library',
  '/strategy-lab/submitted',
  '/strategy-lab/blueprint-confirmed',
  '/strategy-lab?tool=calculators',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/saved',
  '/privacy',
  '/terms',
  '/disclosures',
  '/snapshot/calc/rendered-qa-calculator',
  '/snapshot/property/rendered-qa-property',
  '/snapshot/rendered-qa-status',
  '/__launch-404-check',
]);

export const renderedQaFullPublicRoutes = Object.freeze([...new Set([
  ...sitemapEntries().map(({ path: route }) => route),
  ...renderedQaFullPublicRouteExtras,
])]);

export const renderedQaViewports = Object.freeze([
  Object.freeze(['desktop-1440', Object.freeze({ width: 1440, height: 940 })]),
  Object.freeze(['tablet-1024', Object.freeze({ width: 1024, height: 900 })]),
  Object.freeze(['tablet-768', Object.freeze({ width: 768, height: 1024 })]),
  Object.freeze(['mobile-390', Object.freeze({ width: 390, height: 844 })]),
]);

export const renderedQaColorSchemes = Object.freeze(['dark', 'light']);

export const renderedQaJourneyIds = Object.freeze([
  'desktop navigation spine',
  'mobile navigation destination',
  'theme toggle persistence',
  'homepage primary CTA',
  'opportunity intake submission states desktop-1440',
  'opportunity intake submission states tablet-1024',
  'opportunity intake submission states tablet-768',
  'opportunity intake submission states mobile-390',
  'Strategy Lab primary interaction',
  'MarketFlow public boundaries and reviewed access path',
  'MarketFlow approved inventory state matrix and JV contract',
  'MarketFlow approved operator mobile shell',
  'Peggy open and close',
  'contact chooser routing',
  'cookie preference choice',
  'keyboard focus order',
  'branded 404 recovery',
]);

const coreJourneyIds = Object.freeze([
  'desktop navigation spine',
  'mobile navigation destination',
  'theme toggle persistence',
  'homepage primary CTA',
  'Strategy Lab primary interaction',
  'Peggy open and close',
  'contact chooser routing',
  'cookie preference choice',
  'keyboard focus order',
  'branded 404 recovery',
]);

const intakeWideJourneyIds = Object.freeze([
  'opportunity intake submission states desktop-1440',
  'opportunity intake submission states tablet-1024',
]);

const intakeNarrowJourneyIds = Object.freeze([
  'opportunity intake submission states tablet-768',
  'opportunity intake submission states mobile-390',
]);

const marketflowJourneyIds = Object.freeze([
  'MarketFlow public boundaries and reviewed access path',
  'MarketFlow approved inventory state matrix and JV contract',
  'MarketFlow approved operator mobile shell',
]);

export const renderedQaJourneyScreenshotCounts = Object.freeze({
  'desktop navigation spine': 0,
  'mobile navigation destination': 0,
  'theme toggle persistence': 0,
  'homepage primary CTA': 0,
  'opportunity intake submission states desktop-1440': 4,
  'opportunity intake submission states tablet-1024': 4,
  'opportunity intake submission states tablet-768': 4,
  'opportunity intake submission states mobile-390': 4,
  'Strategy Lab primary interaction': 0,
  'MarketFlow public boundaries and reviewed access path': 0,
  'MarketFlow approved inventory state matrix and JV contract': 22,
  'MarketFlow approved operator mobile shell': 1,
  'Peggy open and close': 0,
  'contact chooser routing': 0,
  'cookie preference choice': 0,
  'keyboard focus order': 0,
  'branded 404 recovery': 0,
});

export const renderedQaJourneyGroups = Object.freeze({
  core: coreJourneyIds,
  'intake-wide': intakeWideJourneyIds,
  'intake-narrow': intakeNarrowJourneyIds,
  marketflow: marketflowJourneyIds,
});

const routeShards = renderedQaColorSchemes.flatMap((colorScheme) =>
  renderedQaViewports.map(([viewportName]) => Object.freeze({
    id: `routes-${colorScheme}-${viewportName}`,
    kind: 'routes',
    colorSchemes: Object.freeze([colorScheme]),
    viewportNames: Object.freeze([viewportName]),
    journeyIds: Object.freeze([]),
    expectedRouteChecks: renderedQaFullPublicRoutes.length,
    expectedJourneyChecks: 0,
    expectedScreenshots: renderedQaFullPublicRoutes.length,
  })),
);

const interactionShards = Object.entries(renderedQaJourneyGroups).map(([group, journeyIds]) =>
  Object.freeze({
    id: `interactions-${group}`,
    kind: 'interactions',
    colorSchemes: Object.freeze([]),
    viewportNames: Object.freeze([]),
    journeyIds,
    expectedRouteChecks: 0,
    expectedJourneyChecks: journeyIds.length,
    expectedScreenshots: journeyIds.reduce(
      (total, journeyId) => total + renderedQaJourneyScreenshotCounts[journeyId],
      0,
    ),
  }),
);

export const renderedQaShards = Object.freeze([...routeShards, ...interactionShards]);
export const renderedQaShardIds = Object.freeze(renderedQaShards.map(({ id }) => id));

export function resolveRenderedQaShard(shardId) {
  if (!shardId) return null;
  const shard = renderedQaShards.find(({ id }) => id === shardId);
  if (!shard) {
    throw new Error(
      `Unknown A11Y_QA_SHARD_ID ${JSON.stringify(shardId)}; expected one of ${renderedQaShardIds.join(', ')}`,
    );
  }
  return shard;
}
