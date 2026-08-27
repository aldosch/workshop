/**
 * Consuming flags — server component pattern.
 *
 * This is identical regardless of which provider adapter you chose.
 * The flag functions are async (they may hit the provider or Global Config),
 * so you `await` them in a server component.
 *
 * Compare with the current pattern in apps/demo/src/app/page.tsx:
 *   const flags = getFlags();  // sync, env-var based
 *   <FlagsProvider value={flags}>
 *
 * With the Flags SDK:
 *   const newHomepage = await newHomepage();  // async, provider-backed
 *
 * For client components, evaluate server-side and pass the boolean as a prop.
 * The existing FlagsProvider/useFlag pattern still works — just feed it the
 * resolved values instead of getFlags() output.
 */
import { newHomepage, experimentalSearch } from "./launchdarkly";
// or: import { newHomepage, experimentalSearch } from "./statsig";

export default async function Page() {
  // Evaluate flags server-side — one await per flag, deduped by identify()
  const showNewHomepage = await newHomepage();
  const showExperimentalSearch = await experimentalSearch();

  return (
    <div>
      {showNewHomepage && <NewHomepageLayout />}
      {showExperimentalSearch && <AISearch />}
      {!showNewHomepage && !showExperimentalSearch && <DefaultLayout />}
    </div>
  );
}

// For client components, pass resolved booleans as props:
//
// "use client";
// export function Search({ experimentalSearch }: { experimentalSearch: boolean }) {
//   return experimentalSearch ? <AISearch /> : <StandardSearch />;
// }
//
// <Search experimentalSearch={showExperimentalSearch} />

// Or keep the existing FlagsProvider pattern and feed it resolved values:
//
// const flags = await getFlagsLD(); // or getFlagsStatsig()
// <FlagsProvider value={flags}>
//   <ClientFlags />
// </FlagsProvider>
